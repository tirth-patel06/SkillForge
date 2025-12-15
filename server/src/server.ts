// server/src/server.ts
import dotenv from "dotenv";
dotenv.config();
import { Team } from "./models/Team";
import http from "http";
import mongoose from "mongoose";
import app from "./app";
import { initSocket } from "./socket";
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

    // 2️⃣ Create HTTP server
    const server = http.createServer(app);

    // 3️⃣ Initialize socket.io
    initSocket(server);

    // 4️⃣ Seed Demo Data
   // try {
     // await seedDemo();
     // console.log("🌱 Demo data seeded.");
   // } catch (seedErr) {
//console.error("⚠️ Seed error:", seedErr);
   // }

    // 5️⃣ Start server
    server.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
    });
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
setInterval(async () => {
  await Team.updateMany({}, {
    inviteCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
  });
}, 5 * 60 * 1000);

// ----------------------------
// START THE SERVER
// ----------------------------
startServer();
