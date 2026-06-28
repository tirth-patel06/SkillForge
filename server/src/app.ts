// server/src/app.ts
import express from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import path from "path";
// Route imports
import authRoutes from "./routes/authRoutes";
import studentRoutes from "./routes/studentRoutes";
import mentorRoutes from "./routes/mentorRoutes";
import taskRoutes from "./routes/taskRoutes";
import submissionRoutes from "./routes/submissionRoutes";
import referralRoutes from "./routes/referralRoutes";
import commentRoutes from "./routes/commentRoutes";
import studentTaskRoutes from "./routes/studentTaskRoutes";
import adminReferralRoutes from "./controllers/adminReferralApproval";
import adminTaskRoutes from "./controllers/adminTaskApprove";
import contributionRoutes from "./routes/contribution.routes";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.set("trust proxy", 1);
app.disable("x-powered-by");

const allowedOrigins = Array.from(
  new Set(
    [
      process.env.CORS_ORIGINS,
      process.env.FRONTEND_URL,
      process.env.CLIENT_URL,
      "http://localhost:3000",
      "http://localhost:3001",
      "http://localhost:3002",
      "http://localhost:3003",
    ]
      .flatMap((value) => (value ? value.split(",") : []))
      .map((value) => value.trim())
      .filter(Boolean)
  )
);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        callback(null, true);
        return;
      }

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.static(path.join(__dirname, "../public")));
app.use(express.json());
app.use(cookieParser());
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});
app.use("/api/contributions", contributionRoutes);

app.use("/api/auth", authRoutes);
app.use("/api/mentors", mentorRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/students/tasks", studentTaskRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/submissions", submissionRoutes);
app.use("/api/referrals", referralRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/admin/tasks", adminTaskRoutes);
app.use("/api/admin/referrals", adminReferralRoutes);
// 404 Handler
app.use((_req, res) => {
  res.status(404).json({ message: "Route not found" });
});
//import referralRoutes from "./routes/referral"; 
//app.use("/referrals", referralRoutes);
export default app