// client/src/api/auth.ts
// Use the same api instance from lib/api to ensure interceptors are used
import { api } from "@/lib/api";

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
  const res = await api.post("/auth/verify-email", data);
  
  // Save token to localStorage
  if (res.data.token) {
    localStorage.setItem("token", res.data.token);
    console.log("✅ Token saved from verifyEmailApi");
  }
  
  return res;
}

export async function loginApi(data: {
  email: string;
  password: string;
  role?: Role;
}) {
  const res = await api.post("/auth/login", data);
  console.log("📝 Login response:", res.data);
  
  // Save token to localStorage
  if (res.data.token) {
    localStorage.setItem("token", res.data.token);
    console.log("✅ Token saved from loginApi");
  }
  
  return res;
}

export async function meApi(): Promise<User> {
  const res = await api.get<User>("/auth/me");
  return res.data.user;
}

export async function logoutApi() {
  return api.post("/auth/logout");
}
