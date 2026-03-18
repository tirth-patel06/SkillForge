import type { Response } from "express";
import type { AuthRequest } from "../types/auth";
import { StudentProfile } from "../models/StudentProfile";
import { User } from "../models/User";
import mongoose from "mongoose";

/**
 * GET /api/students/me/profile
 * Returns the logged-in student's profile + basic user info
 */
export const getMyProfile = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // we can still double-check role if want strict:
    if (req.user.role !== "STUDENT") {
      return res.status(403).json({ message: "Student access only" });
    }

    // Find the base user
    const user = await User.findById(req.user.id).select("name email role");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find or not student profile
    const profile = await StudentProfile.findOne({
      userId: user._id,
    }).lean();

    return res.json({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      profile: profile
        ? {
            bio: profile.bio,
            profilePhotoUrl: profile.profilePhotoUrl,
            skills: profile.skills,
            education: profile.education,
            socialLinks: profile.socialLinks,
            visibility: profile.visibility,
          }
        : {
            bio: "",
            profilePhotoUrl: "",
            skills: [],
            education: null,
            socialLinks: null,
            visibility: "PUBLIC",
          },
    });
  } catch (err) {
    console.error("getMyProfile error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * PUT /api/students/me/profile
 * Creates or updates the student's profile
 */
export const updateMyProfile = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (req.user.role !== "STUDENT") {
      return res.status(403).json({ message: "Student access only" });
    }

    const {
      bio,
      profilePhotoUrl,
      skills,
      education,
      socialLinks,
      visibility,
    } = req.body as {
      bio?: string;
      profilePhotoUrl?: string;
      skills?: string[];
      education?: {
        collegeName?: string;
        degree?: string;
        branch?: string;
        startYear?: number;
        endYear?: number;
      };
      socialLinks?: {
        linkedin?: string;
        github?: string;
        portfolio?: string;
        x?: string;
        other?: string;
      };
      visibility?: "PUBLIC" | "PRIVATE";
    };

    const update: any = {};

    if (bio !== undefined) update.bio = bio;
    if (profilePhotoUrl !== undefined) update.profilePhotoUrl = profilePhotoUrl;
    if (skills !== undefined) update.skills = skills;
    if (education !== undefined) update.education = education;
    if (socialLinks !== undefined) update.socialLinks = socialLinks;
    if (visibility !== undefined) update.visibility = visibility;

    // Ensure we always set userId
    update.userId = req.user.id;

    // Upsert: create if doesn't exist, else update
    const profile = await StudentProfile.findOneAndUpdate(
      { userId: req.user.id },
      { $set: update },
      { new: true, upsert: true }
    ).lean();

    return res.json({
      message: "Profile updated",
      profile,
    });
  } catch (err) {
    console.error("updateMyProfile error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * GET /api/students/:id/profile
 * Public view of a student's profile (for mentors/recruiters/etc.)
 * Respects visibility flag.
 */
export const getPublicProfile = async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
  
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid user id" });
      }
  
      // Find the base user (only student type)
      const user = await User.findById(id).select("name email role");
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      if (user.role !== "STUDENT") {
        return res.status(400).json({ message: "Not a student account" });
      }
  
      // Get the profile
      const profile = await StudentProfile.findOne({ userId: user._id }).lean();
  
      // If no profile exists at all
      if (!profile) {
        return res.json({
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          profile: null,
          visibility: "PUBLIC", // default assumption
        });
      }
  
      // Respect visibility:
      // - PUBLIC  -> everyone can see
      // - PRIVATE -> hide details (you could later allow self/admin override)
      if (profile.visibility === "PRIVATE") {
        // Optional enhancement: if req.user?.id === user._id.toString() then show full.
        return res.status(403).json({
          message: "This profile is private",
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
          skills: profile.skills,
          education: profile.education,
          socialLinks: profile.socialLinks,
        },
        visibility: profile.visibility,
      });
    } catch (err) {
      console.error("getPublicProfile error:", err);
      return res.status(500).json({ message: "Server error" });
    }
  };  