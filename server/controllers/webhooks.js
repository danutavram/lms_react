import { Webhook } from "svix";
import User from "../models/User.js";

export const clerkWebhooks = async (req, res) => {
  try {
    const payload = req.body.toString("utf8");
    console.log("📦 Raw Payload:", payload);

    const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET);

    whook.verify(payload, {
      "svix-id": req.headers["svix-id"],
      "svix-timestamp": req.headers["svix-timestamp"],
      "svix-signature": req.headers["svix-signature"]
    });

    const { data, type } = JSON.parse(payload);
    console.log("📩 Webhook received:", type, data);

    switch (type) {
      case "user.created": {
        const userData = {
          _id: data.id,
          email: data.email_addresses?.[0]?.email_address || "no-email",
          name: `${data.first_name || ""} ${data.last_name || ""}`,
          imageUrl: data.image_url || ""
        };
        console.log("🛠 Creating user:", userData);
        await User.create(userData);
        break;
      }

      case "user.updated": {
        const userData = {
          email: data.email_addresses?.[0]?.email_address || "no-email",
          name: `${data.first_name || ""} ${data.last_name || ""}`,
          imageUrl: data.image_url || ""
        };
        console.log("🛠 Updating user:", userData);
        await User.findByIdAndUpdate(data.id, userData, { upsert: true });
        break;
      }

      case "user.deleted": {
        console.log("🛠 Deleting user:", data.id);
        await User.findByIdAndDelete(data.id);
        break;
      }

      default:
        console.log("ℹ Ignored event:", type);
        break;
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("❌ Webhook error:", error.message);
    res.status(400).json({ success: false, message: error.message });
  }
};
