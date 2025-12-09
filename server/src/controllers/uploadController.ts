import type { Response } from "express";
import type { AuthRequest } from "../types/auth";
import { uploadBufferToCloudinary } from "../lib/cloudinaryUpload";

export const uploadMentorProfileImage = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    console.log("📤 Upload endpoint called");
    console.log("  User:", req.user?.id);
    console.log("  File:", req.file ? `${req.file.originalname} (${req.file.size} bytes)` : "None");

    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No file provided" });
    }

    console.log("  Starting Cloudinary upload...");

    // Upload to Cloudinary
    const imageUrl = await uploadBufferToCloudinary(
      req.file.buffer,
      `mentor-${req.user.id}-${Date.now()}`,
      "mentor-profiles"
    );

    console.log("  ✅ Upload successful:", imageUrl);

    return res.json({
      success: true,
      imageUrl: imageUrl,
      message: "Image uploaded successfully",
    });
  } catch (error) {
    console.error("❌ Upload error:", error);
    return res.status(500).json({
      message: "Failed to upload image",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
