// client/src/types/mentorProfile.ts

export type ProfileVisibility = "PUBLIC" | "PRIVATE";

export interface SocialLinks {
  github?: string;
  linkedin?: string;
  portfolio?: string;
  website?: string;
}

export interface MentorProfile {
  bio: string;
  profilePhotoUrl: string;
  expertise: string[];
  yearsOfExperience: number;
  organization: string;
  socialLinks: SocialLinks | null;
  visibility: ProfileVisibility;
}

export interface MentorStats {
  tasksCreated: number;
  submissionsReviewed: number;
  referralsGiven: number;
  averageRating?: number;
}

export interface MeProfileResponse {
  id: string;
  name?: string;
  email: string;
  role: "MENTOR" | "STUDENT" | "ADMIN";
  profile: MentorProfile;
}
