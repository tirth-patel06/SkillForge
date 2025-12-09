// server/src/models/ChatMessage.ts
import { Schema, model, Document, Types } from "mongoose";

export type ChatRoomType = "TEAM" | "GLOBAL";

export interface IChatMessage extends Document {
  team?: Types.ObjectId;
  roomType: ChatRoomType;
  sender: Types.ObjectId;
  content: string;
  createdAt: Date;
}

const ChatMessageSchema = new Schema<IChatMessage>({
  team: { type: Schema.Types.ObjectId, ref: "Team" },
  roomType: { type: String, enum: ["TEAM", "GLOBAL"], required: true },
  sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export const ChatMessage = model<IChatMessage>("ChatMessage", ChatMessageSchema);
