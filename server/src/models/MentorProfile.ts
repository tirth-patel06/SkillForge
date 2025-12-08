import mongoose, { Schema, Document, Model, Types } from "mongoose";

/**
 * Nested types
 */

export interface ISocialLinks {
  github?: string;
  linkedin?: string;
  portfolio?: string;
  website?: string;
}

/**
 * MentorProfile document
 */

export interface IMentorProfile extends Document {
  userId: Types.ObjectId; // ref: "User"

  bio?: string;
  profilePhotoUrl?: string;
  expertise: string[];

  yearsOfExperience: number;
  organization?: string;

  socialLinks?: ISocialLinks;

  visibility: "PUBLIC" | "PRIVATE";

  createdAt: Date;
  updatedAt: Date;
}

const SocialLinksSchema = new Schema<ISocialLinks>(
  {
    github: String,
    linkedin: String,
    portfolio: String,
    website: String,
  },
  { _id: false }
);

const MentorProfileSchema = new Schema<IMentorProfile>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // 1 mentor → 1 profile
    },

    bio: { type: String, default: "" },
    profilePhotoUrl: { type: String },

    expertise: {
      type: [String],
      default: [],
    },

    yearsOfExperience: {
      type: Number,
      default: 0,
    },

    organization: { type: String },

    socialLinks: {
      type: SocialLinksSchema,
      default: undefined,
    },

    visibility: {
      type: String,
      enum: ["PUBLIC", "PRIVATE"],
      default: "PUBLIC",
    },
  },
  {
    timestamps: true,
  }
);

export const MentorProfile: Model<IMentorProfile> = mongoose.model<IMentorProfile>(
  "MentorProfile",
  MentorProfileSchema
);
