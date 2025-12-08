import type { Response } from "express";
import type { AuthRequest } from "../types/auth";
import { MentorProfile } from "../models/MentorProfile";
import { User } from "../models/User";
import { Task } from "../models/Task";
import { Submission } from "../models/MentorSystem";
import { Referral } from "../models/Referral";
import mongoose from "mongoose";

/**
 * GET /api/mentors/me/profile
 * Returns the logged-in mentor's profile + basic user info
 */
export const getMentorProfile = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (req.user.role !== "MENTOR") {
      return res.status(403).json({ message: "Mentor access only" });
    }

    // Find the base user
    const user = await User.findById(req.user.id).select("name email role");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find or create mentor profile
    let profile = await MentorProfile.findOne({
      userId: user._id,
    }).lean();

    if (!profile) {
      // Return default profile if doesn't exist
      return res.json({
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        profile: {
          bio: "",
          profilePhotoUrl: "",
          expertise: [],
          yearsOfExperience: 0,
          organization: "",
          socialLinks: {
            github: "",
            linkedin: "",
            portfolio: "",
            website: "",
          },
          visibility: "PUBLIC",
        },
      });
    }

    return res.json({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      profile: {
        bio: profile.bio,
        profilePhotoUrl: profile.profilePhotoUrl,
        expertise: profile.expertise,
        yearsOfExperience: profile.yearsOfExperience,
        organization: profile.organization,
        socialLinks: profile.socialLinks || {},
        visibility: profile.visibility,
      },
    });
  } catch (err) {
    console.error("getMentorProfile error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * PUT /api/mentors/me/profile
 * Creates or updates the mentor's profile
 */
export const updateMentorProfile = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (req.user.role !== "MENTOR") {
      return res.status(403).json({ message: "Mentor access only" });
    }

    const {
      bio,
      profilePhotoUrl,
      expertise,
      yearsOfExperience,
      organization,
      socialLinks,
      visibility,
    } = req.body as {
      bio?: string;
      profilePhotoUrl?: string;
      expertise?: string[];
      yearsOfExperience?: number;
      organization?: string;
      socialLinks?: {
        github?: string;
        linkedin?: string;
        portfolio?: string;
        website?: string;
      };
      visibility?: "PUBLIC" | "PRIVATE";
    };

    // Validation
    if (bio && bio.trim().length === 0) {
      return res.status(400).json({ message: "Bio cannot be empty" });
    }

    if (yearsOfExperience !== undefined && yearsOfExperience < 0) {
      return res.status(400).json({ message: "Years of experience cannot be negative" });
    }

    // Find or create profile
    let profile = await MentorProfile.findOne({ userId: req.user.id });

    if (!profile) {
      profile = new MentorProfile({
        userId: req.user.id,
      });
    }

    // Update fields
    if (bio !== undefined) profile.bio = bio;
    if (profilePhotoUrl !== undefined) profile.profilePhotoUrl = profilePhotoUrl;
    if (expertise !== undefined) profile.expertise = expertise;
    if (yearsOfExperience !== undefined) profile.yearsOfExperience = yearsOfExperience;
    if (organization !== undefined) profile.organization = organization;
    if (socialLinks !== undefined) profile.socialLinks = socialLinks;
    if (visibility !== undefined) profile.visibility = visibility;

    await profile.save();

    // Get updated user info
    const user = await User.findById(req.user.id).select("name email role");

    return res.json({
      id: user?._id.toString(),
      name: user?.name,
      email: user?.email,
      role: user?.role,
      profile: {
        bio: profile.bio,
        profilePhotoUrl: profile.profilePhotoUrl,
        expertise: profile.expertise,
        yearsOfExperience: profile.yearsOfExperience,
        organization: profile.organization,
        socialLinks: profile.socialLinks || {},
        visibility: profile.visibility,
      },
    });
  } catch (err) {
    console.error("updateMentorProfile error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * GET /api/mentors/me/stats
 * Returns statistics about mentor's activities
 */
export const getMentorStats = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (req.user.role !== "MENTOR") {
      return res.status(403).json({ message: "Mentor access only" });
    }

    const userId = new mongoose.Types.ObjectId(req.user.id);

    // Count tasks created
    const tasksCreated = await Task.countDocuments({
      createdBy: userId,
    });

    // Count submissions reviewed
    const submissionsReviewed = await Submission.countDocuments({
      reviewedBy: userId,
      status: { $in: ["APPROVED", "CHANGES_REQUESTED"] },
    });

    // Count referrals given
    const referralsGiven = await Referral.countDocuments({
      mentorId: userId,
    });

    return res.json({
      tasksCreated,
      submissionsReviewed,
      referralsGiven,
      averageRating: 4.5, // TODO: Calculate from reviews if needed
    });
  } catch (err) {
    console.error("getMentorStats error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
