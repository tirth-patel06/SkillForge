// src/models/mentorSystem.ts
import {
  Schema,
  model,
  Document,
  Types,
  Model,
} from 'mongoose';

/*Mentor*/

export interface IMentor extends Document {
  userId: Types.ObjectId;
  name: string;
  email: string;
  avatarUrl?: string;
  createdAt: Date;
}

const mentorSchema = new Schema<IMentor>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    avatarUrl: { type: String },
  },
  {
    timestamps: { createdAt: 'createdAt', updatedAt: false },
  }
);

mentorSchema.index({ email: 1 }, { unique: true });

/*Student*/

export interface IStudent extends Document {
  name: string;
  email: string;
  teamId?: Types.ObjectId | null;
  avatarUrl?: string;
  createdAt: Date;
}

const studentSchema = new Schema<IStudent>(
  {
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    teamId: { type: Schema.Types.ObjectId, ref: 'Team', default: null },
    avatarUrl: { type: String },
  },
  {
    timestamps: { createdAt: 'createdAt', updatedAt: false },
  }
);

studentSchema.index({ email: 1 }, { unique: true });
studentSchema.index({ teamId: 1 });

/*Team*/

export interface ITeam extends Document {
  name: string;
  mentorId: Types.ObjectId;
  createdAt: Date;
}

const teamSchema = new Schema<ITeam>(
  {
    name: { type: String, required: true },
    mentorId: { type: Schema.Types.ObjectId, ref: 'Mentor', required: true },
  },
  {
    timestamps: { createdAt: 'createdAt', updatedAt: false },
  }
);

teamSchema.index({ mentorId: 1 });

/*Task*/

export type TaskStatus = 'active' | 'archived' | 'open' | 'closed';

export interface IRubricItem {
  name: string;
  description?: string;
  weightage: number;
  orderIndex: number;
}

export interface ITask extends Document {
  title: string;
  description: string;
  expectedSkills: string[];
  mentorId: Types.ObjectId;
  rubric: Record<string, unknown> | IRubricItem[]; // flexible, you decide
  deadline?: Date | null;
  status: TaskStatus;
  createdAt: Date;
}

const taskSchema = new Schema<ITask>(
  {
    title: { type: String, required: true },
    description: { type: String, default: '' },
    expectedSkills: { type: [String], default: [] },
    mentorId: {
      type: Schema.Types.ObjectId,
      ref: 'Mentor',
      required: true,
    },
    rubric: {
      type: Schema.Types.Mixed,
      default: {},
    },
    deadline: { type: Date },
    status: {
      type: String,
      enum: ['active', 'archived', 'open', 'closed'],
      default: 'active',
    },
  },
  {
    timestamps: { createdAt: 'createdAt', updatedAt: false },
  }
);

taskSchema.index({ mentorId: 1 });
taskSchema.index({ status: 1 });

/*Rubric Criteria*/

export interface IRubricCriteria extends Document {
  taskId: Types.ObjectId;
  name: string;
  description: string;
  weightage: number;
  orderIndex: number;
  createdAt: Date;
}

const rubricCriteriaSchema = new Schema<IRubricCriteria>(
  {
    taskId: {
      type: Schema.Types.ObjectId,
      ref: 'Task',
      required: true,
    },
    name: { type: String, required: true },
    description: { type: String, default: '' },
    weightage: { type: Number, default: 0 },
    orderIndex: { type: Number, default: 0 },
  },
  {
    timestamps: { createdAt: 'createdAt', updatedAt: false },
  }
);

rubricCriteriaSchema.index({ taskId: 1 });

/*Submission*/

export type SubmissionStatus = 'pending' | 'approved' | 'changes_requested';

export interface IReview {
  scores: Map<string, number>;
  feedback: string;
}

const reviewSubSchema = new Schema<IReview>(
  {
    scores: {
      type: Map,
      of: Number,
      default: {},
    },
    feedback: { type: String, default: '' },
  },
  { _id: false }
);

export interface ISubmission extends Document {
  taskId: Types.ObjectId;
  studentId?: Types.ObjectId;
  teamId?: Types.ObjectId;
  version: number;
  githubUrl?: string;
  fileUrls: string[];
  files: string[];
  notes?: string;
  status: SubmissionStatus;
  submittedAt: Date;
  reviewedBy?: Types.ObjectId;
  reviewedAt?: Date;
  review?: IReview;
}

const submissionSchema = new Schema<ISubmission>(
  {
    taskId: {
      type: Schema.Types.ObjectId,
      ref: 'Task',
      required: true,
    },
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'Student',
    },
    teamId: {
      type: Schema.Types.ObjectId,
      ref: 'Team',
    },
    version: { type: Number, default: 1 },
    githubUrl: { type: String },
    fileUrls: { type: [String], default: [] },
    files: { type: [String], default: [] },
    notes: { type: String },
    status: {
      type: String,
      enum: ['pending', 'approved', 'changes_requested'],
      default: 'pending',
    },
    submittedAt: { type: Date, default: Date.now },
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: 'Mentor',
    },
    reviewedAt: { type: Date },
    review: {
      type: reviewSubSchema,
      default: undefined,
    },
  },
  {
    timestamps: false,
  }
);

submissionSchema.index({ taskId: 1 });
submissionSchema.index({ studentId: 1 });
submissionSchema.index({ teamId: 1 });
submissionSchema.index({ status: 1 });

/*Submission Score*/

export interface ISubmissionScore extends Document {
  submissionId: Types.ObjectId;
  criteriaId: Types.ObjectId;
  score: number;
  feedback?: string;
  createdAt: Date;
}

const submissionScoreSchema = new Schema<ISubmissionScore>(
  {
    submissionId: {
      type: Schema.Types.ObjectId,
      ref: 'Submission',
      required: true,
    },
    criteriaId: {
      type: Schema.Types.ObjectId,
      ref: 'RubricCriteria',
      required: true,
    },
    score: { type: Number, default: 0 },
    feedback: { type: String },
  },
  {
    timestamps: { createdAt: 'createdAt', updatedAt: false },
  }
);

submissionScoreSchema.index({ submissionId: 1 });
submissionScoreSchema.index({ criteriaId: 1 });

/*Referral*/

export type ReferralStatus = 'draft' | 'submitted' | 'approved' | 'issued';

export interface IReferral extends Document {
  studentId: Types.ObjectId;
  mentorId: Types.ObjectId;
  recommendation: string;
  evidenceLinks: string[];
  status: ReferralStatus;
  createdAt: Date;
  updatedAt: Date;
}

const referralSchema = new Schema<IReferral>(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    mentorId: {
      type: Schema.Types.ObjectId,
      ref: 'Mentor',
      required: true,
    },
    recommendation: { type: String, required: true },
    evidenceLinks: { type: [String], default: [] },
    status: {
      type: String,
      enum: ['draft', 'submitted', 'approved', 'issued'],
      default: 'draft',
    },
  },
  {
    timestamps: {
      createdAt: 'createdAt',
      updatedAt: 'updatedAt',
    },
  }
);

referralSchema.index({ studentId: 1 });
referralSchema.index({ mentorId: 1 });
referralSchema.index({ status: 1 });

/*Model exports*/

export const Mentor: Model<IMentor> = model<IMentor>('Mentor', mentorSchema);
export const Student: Model<IStudent> = model<IStudent>('Student', studentSchema);
export const Team: Model<ITeam> = model<ITeam>('Team', teamSchema);
export const Task: Model<ITask> = model<ITask>('Task', taskSchema);
export const RubricCriteria: Model<IRubricCriteria> = model<IRubricCriteria>(
  'RubricCriteria',
  rubricCriteriaSchema
);
export const Submission: Model<ISubmission> = model<ISubmission>(
  'Submission',
  submissionSchema
);
export const SubmissionScore: Model<ISubmissionScore> = model<ISubmissionScore>(
  'SubmissionScore',
  submissionScoreSchema
);
export const Referral: Model<IReferral> = model<IReferral>('Referral', referralSchema);
