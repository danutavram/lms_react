import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv/config";
import connectDB from "./configs/mongodb.js";
import { clerkWebhooks } from "./controllers/webhooks.js";

const app = express();
await connectDB();

app.use(cors());

app.get("/", (req, res) => res.send("API Working"));

// Webhook route cu raw body
app.post("/clerk", bodyParser.raw({ type: "application/json" }), clerkWebhooks);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on ${PORT}`));
