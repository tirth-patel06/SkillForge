// server/src/app.ts
import express from "express";
import cors from "cors";
import morgan from "morgan";

import mentorRoutes from "./routes/mentorRoutes";
import taskRoutes from "./routes/taskRoutes";
import submissionRoutes from "./routes/submissionRoutes";
import referralRoutes from "./routes/referralRoutes";
import studentRoutes from "./routes/studentRoutes";
import authRoutes from "./routes/authRoutes";

const app = express();

// Middlewares
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);
app.use(express.json());
app.use(morgan("dev"));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/mentor", mentorRoutes);           
app.use("/api/tasks", taskRoutes);              
app.use("/api/submissions", submissionRoutes); 
app.use("/api/referrals", referralRoutes);     
app.use("/api/students", studentRoutes);        
app.use("/api/auth", authRoutes);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ message: "Route not found" });
});

export default app;
