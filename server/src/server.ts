// server/src/server.ts
import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import app from "./app";
//import { seedDemo } from "./utils/seed";

const PORT = process.env.PORT || 8000;
const MONGO_URI =process.env.MONGO_URI as string ;

// ----------------------------
// START SERVER FUNCTION
// ----------------------------
async function startServer() {
  try {
    // 1️⃣ Connect to MongoDB once
    await mongoose.connect(MONGO_URI);

    console.log("✅ MongoDB connected successfully");

    // 2️⃣ Start server
    app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
    });

    // 4️⃣ Seed Demo Data
   // try {
     // await seedDemo();
     // console.log("🌱 Demo data seeded.");
   // } catch (seedErr) {
//console.error("⚠️ Seed error:", seedErr);
   // }

    // 5️⃣ Start server handled above
  } catch (err) {
    console.error("❌ Error starting server:", err);
    process.exit(1);
  }
}

// ----------------------------
// GLOBAL ERROR HANDLERS
// ----------------------------
process.on("unhandledRejection", (reason) => {
  console.error("🔴 Unhandled Rejection:", reason);
});

process.on("uncaughtException", (err) => {
  console.error("🔴 Uncaught Exception:", err);
  process.exit(1);
});
// ----------------------------
// START THE SERVER
// ----------------------------
startServer();
