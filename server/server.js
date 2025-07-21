import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv/config';
import bodyParser from 'body-parser';
import connectDB from './configs/mongodb.js';
import { clerkWebhooks } from './controllers/webhooks.js';

const app = express();

await connectDB();

app.use(cors());

// Test route
app.get('/', (req, res) => res.send('API Working'));

// Clerk webhook route
app.post('/clerk', bodyParser.raw({ type: 'application/json' }), clerkWebhooks);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

export default app;
