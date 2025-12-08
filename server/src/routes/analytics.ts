import { Request, Response } from "express";
import { Task } from "../models/Task";
import { User } from "../models/User";
import { Referral } from "../models/Refferal";

interface StatsResponse {
  users: number;
  pendingTasks: number;
  approvedTasks: number;
  referralsPending: number;
}

export const getStats = async (req: Request, res: Response)  => {
  try {
    const stats: StatsResponse = {
      users: await User.countDocuments(),
      pendingTasks: await Task.countDocuments({ status: "PENDING" }),
      approvedTasks: await Task.countDocuments({ status: "APPROVED" }),
      referralsPending: await Referral.countDocuments({ status: "APPROVED" }),
    };

    res.json(stats);
  } catch (error) {
    console.log("Error stats:", error);
    res.status(404).json({ 
      message: "Error fetching statistics",
    });
  }
};