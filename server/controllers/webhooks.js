import { Webhook } from "svix";
import User from "../models/User.js";
import Stripe from "stripe";
import { Purchase } from "../models/Purchase.js";
import Course from "../models/Course.js";

const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);

// Clerk webhook handler
export const clerkWebhooks = async (req, res) => {
  try {
    const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET);
    // Verify webhook signature
    await whook.verify(JSON.stringify(req.body), {
      "svix-id": req.headers["svix-id"],
      "svix-timestamp": req.headers["svix-timestamp"],
      "svix-signature": req.headers["svix-signature"],
    });

    const { data, type } = req.body;

    switch (type) {
      case "user.created": {
        const userData = {
          _id: data.id,
          email: data.email_addresses[0].email_address,
          name: data.first_name + " " + data.last_name,
          imageUrl: data.image_url,
        };
        await User.create(userData);
        return res.json({});
      }

      case "user.updated": {
        const userData = {
          email: data.email_addresses[0].email_address,  // Fix typo here, was email_address -> email_addresses
          name: data.first_name + " " + data.last_name,
          imageUrl: data.image_url,
        };
        await User.findByIdAndUpdate(data.id, userData);
        return res.json({});
      }

      case "user.deleted": {
        await User.findByIdAndDelete(data.id);
        return res.json({});
      }

      default:
        return res.status(400).json({ message: "Unhandled event type" });
    }
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

// Stripe webhook handler
export const stripeWebhooks = async (req, res) => {
  const sig = req.headers["stripe-signature"];

  let event;
  try {
    // Use stripe instance (not Stripe class) to construct event
    event = stripeInstance.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  switch (event.type) {
    case "payment_intent.succeeded": {
      const paymentIntent = event.data.object;
      const paymentIntentId = paymentIntent.id;

      // Get checkout sessions linked to payment intent
      const sessions = await stripeInstance.checkout.sessions.list({
        payment_intent: paymentIntentId,
      });

      if (!sessions.data.length) {
        return res.status(400).send("No checkout session found for payment intent");
      }

      const { purchaseId } = sessions.data[0].metadata;

      const purchaseData = await Purchase.findById(purchaseId);
      if (!purchaseData) return res.status(400).send("Purchase not found");

      const userData = await User.findById(purchaseData.userId);
      if (!userData) return res.status(400).send("User not found");

      const courseData = await Course.findById(purchaseData.courseId.toString());
      if (!courseData) return res.status(400).send("Course not found");

      // Add user ID to enrolledStudents array
      courseData.enrolledStudents.push(userData._id);
      await courseData.save();

      // Add course ID to user's enrolledCourses
      userData.enrolledCourses.push(courseData._id);
      await userData.save();

      // Update purchase status
      purchaseData.status = "completed";
      await purchaseData.save();

      break;
    }

    case "payment_intent.payment_failed": {
      const paymentIntent = event.data.object;
      const paymentIntentId = paymentIntent.id;

      const sessions = await stripeInstance.checkout.sessions.list({
        payment_intent: paymentIntentId,
      });

      if (!sessions.data.length) {
        return res.status(400).send("No checkout session found for payment intent");
      }

      const { purchaseId } = sessions.data[0].metadata;

      const purchaseData = await Purchase.findById(purchaseId);
      if (!purchaseData) return res.status(400).send("Purchase not found");

      purchaseData.status = "failed";
      await purchaseData.save();

      break;
    }

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
};
