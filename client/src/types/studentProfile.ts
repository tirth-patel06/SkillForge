// frontend/src/types/studentProfile.ts

export type ProfileVisibility = "PUBLIC" | "PRIVATE";

export interface Education {
  collegeName?: string;
  degree?: string;
  branch?: string;
  startYear?: number;
  endYear?: number;
}

export interface SocialLinks {
  linkedin?: string;
  github?: string;
  portfolio?: string;
  x?: string;
  other?: string;
}

export interface StudentProfile {
  bio: string;
  profilePhotoUrl: string;
  skills: string[];
  education: Education | null;
  socialLinks: SocialLinks | null;
  visibility: ProfileVisibility;
}

export interface MeProfileResponse {
  id: string;
  name?: string;
  email: string;
  role: "STUDENT" | "MENTOR" | "ADMIN";
  profile: StudentProfile;
}