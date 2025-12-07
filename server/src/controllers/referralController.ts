import { Response } from "express";
import { AuthRequest } from "../types/auth";
import { Referral } from "../models/Referral";
import { User } from "../models/User";

// GET /referrals/my - Get referrals for current user
export const getMyReferrals = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    // Get referrals where user is either the student or mentor
    const referrals = await Referral.find({
      $or: [{ studentId: userId }, { mentorId: userId }],
    })
      .populate("studentId", "name email")
      .populate("mentorId", "name email")
      .select("-__v");

    return res.status(200).json({
      message: "Referrals retrieved successfully",
      referrals,
    });
  } catch (error) {
    console.error("Get my referrals error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// POST /referrals - Create a new referral
export const createReferral = async (req: AuthRequest, res: Response) => {
  try {
    const { mentorId, message } = req.body;
    const studentId = req.user?.id;

    if (!mentorId || !studentId) {
      return res
        .status(400)
        .json({ message: "Mentor ID is required" });
    }

    // Verify mentor exists and is a mentor
    const mentor = await User.findById(mentorId);
    if (!mentor || mentor.role !== "MENTOR") {
      return res
        .status(400)
        .json({ message: "Invalid mentor ID or user is not a mentor" });
    }

    // Check if referral already exists
    const existingReferral = await Referral.findOne({
      studentId,
      mentorId,
    });

    if (existingReferral) {
      return res
        .status(400)
        .json({ message: "Referral already exists" });
    }

    // Create new referral
    const newReferral = new Referral({
      studentId,
      mentorId,
      message: message || "",
      status: "PENDING",
    });

    await newReferral.save();

    const populatedReferral = await Referral.findById(newReferral._id)
      .populate("studentId", "name email")
      .populate("mentorId", "name email");

    return res.status(201).json({
      message: "Referral created successfully",
      referral: populatedReferral,
    });
  } catch (error) {
    console.error("Create referral error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// PATCH /referrals/:id - Update referral status (mentor only)
export const updateReferralStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const mentorId = req.user?.id;

    if (!id || !status) {
      return res
        .status(400)
        .json({ message: "Referral ID and status are required" });
    }

    if (
      !["PENDING", "ACCEPTED", "REJECTED", "APPROVED", "REMOVED"].includes(status)
    ) {
      return res.status(400).json({ message: "Invalid status" });
    }

    // Get referral
    const referral = await Referral.findById(id);
    if (!referral) {
      return res.status(404).json({ message: "Referral not found" });
    }

    // Verify mentor is the one being referred to
    if (referral.mentorId.toString() !== mentorId) {
      return res.status(403).json({ message: "Not authorized to update this referral" });
    }

    // Update status
    referral.status = status;
    await referral.save();

    const updatedReferral = await Referral.findById(id)
      .populate("studentId", "name email")
      .populate("mentorId", "name email");

    return res.status(200).json({
      message: "Referral updated successfully",
      referral: updatedReferral,
    });
  } catch (error) {
    console.error("Update referral error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
