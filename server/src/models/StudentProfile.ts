import mongoose, { Schema, Document, Model, Types } from "mongoose";

/**
 * Nested types
 */

export interface ISocialLinks {
  linkedin?: string;
  github?: string;
  portfolio?: string;
  x?: string; // formerly Twitter
  other?: string;
}

export interface IEducation {
  collegeName?: string;
  degree?: string;   // e.g. "B.Tech", "M.Tech"
  branch?: string;   // e.g. "ECE", "CSE"
  startYear?: number;
  endYear?: number;
}

/**
 * StudentProfile document
 */

export interface IStudentProfile extends Document {
  userId: Types.ObjectId; // ref: "User"

  bio?: string;
  profilePhotoUrl?: string;
  skills: string[];          // tag-based skills

  education?: IEducation;
  socialLinks?: ISocialLinks;

  visibility: "PUBLIC" | "PRIVATE";

  createdAt: Date;
  updatedAt: Date;
}

const SocialLinksSchema = new Schema<ISocialLinks>(
  {
    linkedin: String,
    github: String,
    portfolio: String,
    x: String,
    other: String,
  },
  { _id: false }
);

const EducationSchema = new Schema<IEducation>(
  {
    collegeName: String,
    degree: String,
    branch: String,
    startYear: Number,
    endYear: Number,
  },
  { _id: false }
);

const StudentProfileSchema = new Schema<IStudentProfile>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // 1 student → 1 profile
    },

    bio: { type: String },
    profilePhotoUrl: { type: String },

    skills: {
      type: [String],
      default: [],
    },

    education: {
      type: EducationSchema,
      default: undefined,
    },

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

// fast lookup
StudentProfileSchema.index({ userId: 1 });

export const StudentProfile: Model<IStudentProfile> =
  mongoose.model<IStudentProfile>("StudentProfile", StudentProfileSchema);