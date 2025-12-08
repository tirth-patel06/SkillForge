// server/src/server.ts
import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import app from "./app";

const PORT = process.env.PORT || 8000;
const MONGO_URI =
  process.env.MONGO_URI || "mongodb://127.0.0.1:27017/mentor-hub";

async function start() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGO_URI);
    console.log("✅ MongoDB connected");

    // Start HTTP server
    app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("❌ Failed to start server:", err);
    process.exit(1);
  }
}

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason) => {
  console.error("🔴 Unhandled Rejection:", reason);
});

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.error("🔴 Uncaught Exception:", err);
  process.exit(1);
});

start();
