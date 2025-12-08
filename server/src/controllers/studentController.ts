import { Response } from "express";
import { AuthRequest } from "../types/auth";
import { User } from "../models/User";

// GET /students - Get all students (for mentor referral selection)
export const getStudents = async (req: AuthRequest, res: Response) => {
  try {
    // Get all users with STUDENT role
    const students = await User.find({ role: "STUDENT" })
      .select("name email")
      .limit(100);

    // Map to frontend format
    const formattedStudents = students.map(s => ({
      id: s._id.toString(),
      name: s.name,
      email: s.email,
    }));

    return res.status(200).json(formattedStudents);
  } catch (error) {
    console.error("Get students error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
