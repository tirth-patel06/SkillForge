// client/src/api/chat.ts
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: `${API_URL}/api/chat`,
  withCredentials: true,
});

export interface ChatSender {
  id: string;
  name?: string;
  email: string;
}

export interface ChatMessage {
  _id: string;
  content: string;
  createdAt: string;
  sender: ChatSender;
}

export async function fetchTeamMessages(teamId: string) {
  const res = await api.get<{ messages: ChatMessage[] }>(`/team/${teamId}`);
  return res.data.messages;
}

export async function fetchGlobalMessages() {
  const res = await api.get<{ messages: ChatMessage[] }>("/global");
  return res.data.messages;
}
