import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv/config';
import connectDB from './configs/mongodb.js';
import { clerkWebhooks, stripeWebhooks } from './controllers/webhooks.js';
import bodyParser from 'body-parser';
import { clerkMiddleware } from '@clerk/express';
import connectCloudinary from './configs/cloudinary.js';
import educatorRouter from './routes/educatorRoutes.js';
import courseRouter from './routes/courseRoute.js';
import userRouter from './routes/userRoutes.js';

const app = express();

// Connect to MongoDB and Cloudinary
await connectDB();
await connectCloudinary();

// Middleware
app.use(cors());

// Webhook routes
app.post('/clerk', express.json(), clerkWebhooks); // assuming Clerk webhook sends JSON
app.post('/stripe', bodyParser.raw({ type: 'application/json' }), stripeWebhooks);

// Normal JSON parsing middleware for other routes
app.use(express.json());

// Clerk middleware (auth etc)
app.use(clerkMiddleware());

// API routes
app.use('/api/educator', educatorRouter);
app.use('/api/course', courseRouter);
app.use('/api/user', userRouter);

// Test route
app.get('/', (req, res) => res.send('✅ API is working'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));

export default app;
