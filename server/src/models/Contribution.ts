import { Schema, model } from "mongoose";

const ContributionSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", index: true },
    type: {
      type: String,
      enum: ["TASK", "REVIEW", "COMMENT", "MESSAGE"],
    },
    description: String,
    points: Number,
  },
  { timestamps: true }
);

export default model("Contribution", ContributionSchema);
