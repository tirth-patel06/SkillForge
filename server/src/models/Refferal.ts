import mongoose, { Schema, Document } from "mongoose";
import { isReadable } from "stream";

export type ReferralStatus = "PENDING"|"APPROVED"|"REJECTED";
//to be approved and then create signed pdf by admin

export interface IReferral extends Document {
  studentId: mongoose.Types.ObjectId;
  mentorId: mongoose.Types.ObjectId;
  reason: string;//exm p student a exemplary performance in task a
  evidence: string[]; // Repo link etc etc
  status: ReferralStatus;
  signedToken?: string;//signed token for pdf(figure out)
  pdfUrl?: string;//signed pdf to be sent recuiter
  createdAt: Date;
}
const schemaReferral=new Schema<IReferral>({
  studentId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  mentorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  reason:{type:String},
  evidence:{type:[String]}, // Repo link etc etc
  status:{type:String,
    enum:["PENDING","APPROVED","REJECTED"],
    default:"PENDING"},
  signedToken:String,//signed token for pdf(figure out)
  pdfUrl:String,//signed pdf to be sent recuiter
  createdAt: Date
})
export const Referral=mongoose.model<IReferral>("Referral",schemaReferral)