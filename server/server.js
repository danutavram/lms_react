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

// Connect to MongoDB
await connectDB();
await connectCloudinary();

// Middleware
app.use(cors());
app.use(express.json()); // pentru rutele normale
app.use(clerkMiddleware())

// Routes
app.post(
  '/clerk',
  bodyParser.raw({ type: 'application/json' }),
  clerkWebhooks
);
app.use('/api/educator', express.json(), educatorRouter);
app.get('/', (req, res) => res.send('✅ API is working'));
app.use('/api/educator', express.json(), educatorRouter)
app.use('/api/course', express.json(), courseRouter)
app.use('/api/user', express.json(), userRouter)
app.post('/stripe', express.raw({ type: 'application/json'}), stripeWebhooks);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));

export default app;
