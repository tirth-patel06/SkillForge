// src/api/studentProfile.ts
import { api } from "@/lib/api";
import type { StudentProfile } from "@/types/studentProfile";

export type PublicStudentProfile = {
  id: string;
  name: string;
  email: string;
  role: "STUDENT" | "MENTOR" | "ADMIN";
  profile: StudentProfile | null;
  visibility?: string;
};

// Fetch a student's public profile by ID
export async function getStudentProfile(studentId: string) {
  const { data } = await api.get<PublicStudentProfile>(`/students/${studentId}/profile`);
  return data;
}
