// client/src/api/auth.ts
import axios from "axios";
import { SetStateAction } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: `${API_URL}/api`,
  withCredentials: true,
});

export type Role = "STUDENT" | "MENTOR" | "ADMIN";

export interface User {
  [x: string]: any;
  user: User | PromiseLike<User>;
  id: string;
  email: string;
  name?: string;
  role: Role;
  verified: boolean;
}

export async function registerApi(data: {
  email: string;
  password: string;
  name?: string;
  role: Role;
}) {
  return api.post("/auth/register", data);
}

export async function verifyEmailApi(data: { email: string; otp: string }) {
  return api.post("/auth/verify-email", data);
}

export async function loginApi(data: {
  email: string;
  password: string;
  role?: Role;
}) {
  return api.post("/auth/login", data);
}

export async function meApi(): Promise<User> {
  const res = await api.get<User>("/auth/me");
  return res.data.user;
}

export async function logoutApi() {
  return api.post("/auth/logout");
}
