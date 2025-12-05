import mongoose, { Schema, Document, Model, Types } from "mongoose";

export type ReferralStatus = "DRAFT" | "SUBMITTED" | "APPROVED" | "ISSUED";

export interface IReferral extends Document {
  studentId: Types.ObjectId; // ref: "User" (role STUDENT)
  mentorId: Types.ObjectId; // ref: "User" (role MENTOR)
  recommendation: string;
  evidenceLinks: string[];
  status: ReferralStatus;
  createdAt: Date;
  updatedAt: Date;
}

const ReferralSchema = new Schema<IReferral>(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    mentorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    recommendation: { type: String, required: true },
    evidenceLinks: { type: [String], default: [] },
    status: {
      type: String,
      enum: ["DRAFT", "SUBMITTED", "APPROVED", "ISSUED"],
      default: "DRAFT",
    },
  },
  {
    timestamps: {
      createdAt: "createdAt",
      updatedAt: "updatedAt",
    },
  }
);

ReferralSchema.index({ studentId: 1 });
ReferralSchema.index({ mentorId: 1 });
ReferralSchema.index({ status: 1 });

export const Referral: Model<IReferral> = mongoose.model<IReferral>(
  "Referral",
  ReferralSchema
);
