// server/src/app.ts
import express from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import path from "path";
// Route imports
import authRoutes from './routes/authRoutes'
import studentRoutes from "./routes/studentRoutes";
 //import mentorRoutes from "./routes/mentorRoutes.ts";
 //import taskRoutes from "./routes/taskRoutes";
 ////import submissionRoutes from "./routes/submissionRoutes";
//import referralRoutes from "./routes/referralRoutes";
import adminTaskRoutes from './controllers/adminTaskApprove'

const app = express();

const allowedOrigins = ["http://localhost:3000","http://localhost:3001","http://localhost:3002","http://localhost:3003"];

app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.static(path.join(__dirname, "../public")));
app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

// app.use("/api/mentor", mentorRoutes);           
 //app.use("/api/tasks", taskRoutes);              
 //app.use("/api/submissions", submissionRoutes); 
 //app.use("/api/referrals", referralRoutes);     
app.use("/api/students", studentRoutes);        
app.use("/api/auth", authRoutes);
app.use('/api/admin/tasks',adminTaskRoutes)

// 404 Handler
app.use((_req, res) => {
  res.status(404).json({ message: "Route not found" });
});
//import referralRoutes from "./routes/referral"; 
//app.use("/referrals", referralRoutes);
export default app