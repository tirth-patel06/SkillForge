export type TeamRole = "leader" | "member";

export interface TeamMember {
  user: string;
  name: string;
  role: TeamRole;
}

export interface Team {
  _id: string;
  name: string;
  description?: string;
  techStack: string[];
  leader: string;
  members: TeamMember[];
}
