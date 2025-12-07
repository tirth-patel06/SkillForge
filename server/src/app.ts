// server/src/app.ts
import express from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";

// Route imports
import authRoutes from "./routes/authRoutes";
// import mentorRoutes from "./routes/mentorRoutes.ts";
// import taskRoutes from "./routes/taskRoutes";
// import submissionRoutes from "./routes/submissionRoutes";
// import referralRoutes from "./routes/referralRoutes";
// import studentRoutes from "./routes/studentRoutes";

const app = express();

// Middlewares
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000", // Next.js
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

// Backend APIs
app.use("/api/auth", authRoutes);
// app.use("/api/mentor", mentorRoutes);
// app.use("/api/tasks", taskRoutes);
// app.use("/api/submissions", submissionRoutes);
// app.use("/api/referrals", referralRoutes);
// app.use("/api/students", studentRoutes);

// 404 Handler
app.use((_req, res) => {
  res.status(404).json({ message: "Route not found" });
});

export default app;
