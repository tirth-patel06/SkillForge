import mongoose, {
  Schema,
  Document,
  Model,
  Types,
} from "mongoose";

/*Rubric Criteria*/

export interface IRubricCriteria extends Document {
  taskId: Types.ObjectId; // ref: "Task"
  name: string;
  description: string;
  weightage: number;
  orderIndex: number;
  createdAt: Date;
}

const RubricCriteriaSchema = new Schema<IRubricCriteria>({
  taskId: {
    type: Schema.Types.ObjectId,
    ref: "Task",
    required: true,
  },
  name: { type: String, required: true },
  description: { type: String, default: "" },
  weightage: { type: Number, default: 0 },
  orderIndex: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

RubricCriteriaSchema.index({ taskId: 1 });

/*Submission*/

export type SubmissionStatus = "PENDING" | "APPROVED" | "CHANGES_REQUESTED";

export interface IReview {
  scores: Map<string, number>; // criteriaId -> score
  feedback: string;
}

const ReviewSchema = new Schema<IReview>(
  {
    scores: {
      type: Map,
      of: Number,
      default: {},
    },
    feedback: { type: String, default: "" },
  },
  { _id: false }
);

export interface ISubmission extends Document {
  taskId: Types.ObjectId; // ref: "Task"
  studentId?: Types.ObjectId; // ref: "User"
  version: number;
  githubUrl?: string;
  fileUrls: string[];
  files: string[];
  notes?: string;
  status: SubmissionStatus;
  submittedAt: Date | null;
  reviewedBy?: Types.ObjectId; // ref: "User" (mentor)
  reviewedAt?: Date;
  review?: IReview;
}

const SubmissionSchema = new Schema<ISubmission>({
  taskId: {
    type: Schema.Types.ObjectId,
    ref: "Task",
    required: true,
  },
  studentId: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  version: { type: Number, default: 1 },
  githubUrl: { type: String },
  fileUrls: { type: [String], default: [] },
  files: { type: [String], default: [] },
  notes: { type: String },
  status: {
    type: String,
    enum: ["PENDING", "APPROVED", "CHANGES_REQUESTED"],
    default: "PENDING",
  },
  submittedAt: { type: Date, default: null },
  reviewedBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  reviewedAt: { type: Date },
  review: {
    type: ReviewSchema,
    default: undefined,
  },
});

SubmissionSchema.index({ taskId: 1 });
SubmissionSchema.index({ studentId: 1 });
SubmissionSchema.index({ status: 1 });

/*Submission Score (per-criteria breakdown)*/

export interface ISubmissionScore extends Document {
  submissionId: Types.ObjectId; // "Submission"
  criteriaId: Types.ObjectId; // "RubricCriteria"
  score: number;
  feedback?: string;
  createdAt: Date;
}

const SubmissionScoreSchema = new Schema<ISubmissionScore>({
  submissionId: {
    type: Schema.Types.ObjectId,
    ref: "Submission",
    required: true,
  },
  criteriaId: {
    type: Schema.Types.ObjectId,
    ref: "RubricCriteria",
    required: true,
  },
  score: { type: Number, default: 0 },
  feedback: { type: String },
  createdAt: { type: Date, default: Date.now },
});

SubmissionScoreSchema.index({ submissionId: 1 });
SubmissionScoreSchema.index({ criteriaId: 1 });

/*Model exports*/

export const RubricCriteria: Model<IRubricCriteria> = mongoose.model<IRubricCriteria>(
  "RubricCriteria",
  RubricCriteriaSchema
);
export const Submission: Model<ISubmission> = mongoose.model<ISubmission>(
  "Submission",
  SubmissionSchema
);
export const SubmissionScore: Model<ISubmissionScore> = mongoose.model<ISubmissionScore>(
  "SubmissionScore",
  SubmissionScoreSchema
);
