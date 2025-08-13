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

// Connect to DB & Cloudinary
await connectDB();
await connectCloudinary();

app.use(cors());

// 🟢 1. Webhook Stripe (raw body)
app.post('/stripe', express.raw({ type: 'application/json' }), stripeWebhooks);

// 🟢 2. Webhook Clerk (raw body pentru semnătura Svix)
app.post('/clerk', bodyParser.raw({ type: 'application/json' }), clerkWebhooks);

// 🟢 3. Middleware pentru toate celelalte rute
app.use(express.json());

// 🟢 4. Clerk middleware (auth)
app.use(clerkMiddleware());

// 🟢 5. Restul API-ului
app.use('/api/educator', educatorRouter);
app.use('/api/course', courseRouter);
app.use('/api/user', userRouter);

// Test route
app.get('/', (req, res) => res.send('✅ API is working'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));

export default app;
