// server/src/app.ts
import express from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";

// Route imports
import authRoutes from "./routes/authRoutes";
import studentRoutes from "./routes/studentRoutes";
import mentorRoutes from "./routes/mentorRoutes";
import taskRoutes from "./routes/taskRoutes";
import submissionRoutes from "./routes/submissionRoutes";
import referralRoutes from "./routes/referralRoutes";

const app = express();

const allowedOrigins = ["http://localhost:3000"];

app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);


app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/mentors", mentorRoutes);           
app.use("/api/students", studentRoutes);        
app.use("/api/tasks", taskRoutes);              
app.use("/api/submissions", submissionRoutes); 
app.use("/api/referrals", referralRoutes);     

// 404 Handler
app.use((_req, res) => {
  res.status(404).json({ message: "Route not found" });
});

export default app;
