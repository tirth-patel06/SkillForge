import express from "express"
import cors from 'cors';
import authRoutes from "./routes/auth";
import taskRoutes from "./routes/task";
import { Express } from "express";
import referralRoutes from "./routes/referral"; 
import cookieParser from 'cookie-parser';

const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/auth", authRoutes);
app.use("/tasks", taskRoutes);
app.use("/referrals", referralRoutes);
export default app