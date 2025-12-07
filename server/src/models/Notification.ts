
import mongoose, { Schema, Document } from "mongoose";

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  message: string;
  type: "info"|"success"|"error";
  read: boolean;
  data?: any;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  message: String,
  type: { type: String, enum: ["info","success","error"], default: "info" },
  read: { type: Boolean, default: false },
  data: Schema.Types.Mixed,
  createdAt: { type: Date, default: Date.now }
});

export const Notification = mongoose.model<INotification>("Notification", NotificationSchema);
