// client/src/api/teams.ts
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const api = axios.create({
  baseURL: `${API_URL}/teams`,
  withCredentials: true,
});

export interface TeamMember {
  user: {
    _id: string;
    name?: string;
    email: string;
    role?: string;
  };
  role: "LEADER" | "MEMBER";
  joinedAt: string;
}

export interface Team {
  _id: string;
  name: string;
  description?: string;
  techStack: string[];
  leader: {
    _id: string;
    name?: string;
    email: string;
  };
  members: TeamMember[];
  inviteCode: string;
}

export async function fetchMyTeams() {
  const res = await api.get<{ teams: Team[] }>("/my");
  return res.data.teams;
}

export async function createTeamApi(data: {
  name: string;
  description?: string;
  techStack: string;
}) {
  const res = await api.post<{ team: Team }>("/", data);
  return res.data.team;
}

export async function joinTeamApi(code: string) {
  const res = await api.post<{ team: Team }>("/join", { code });
  return res.data.team;
}

export async function getTeamApi(teamId: string) {
  const res = await api.get<{ team: Team }>(`/${teamId}`);
  return res.data.team;
}

export async function updateTeamApi(teamId: string, data: {
  name?: string;
  description?: string;
  techStack?: string;
}) {
  const res = await api.patch<{ team: Team }>(`/${teamId}`, data);
  return res.data.team;
}

export async function kickMemberApi(teamId: string, memberId: string) {
  const res = await api.post<{ team: Team }>(`/${teamId}/kick`, { memberId });
  return res.data.team;
}

export async function transferLeadershipApi(teamId: string, newLeaderId: string) {
  const res = await api.post<{ team: Team }>(`/${teamId}/transfer`, {
    newLeaderId,
  });
  return res.data.team;
}

export async function leaveTeamApi(teamId: string) {
  const res = await api.post<{ team?: Team; message?: string }>(
    `/${teamId}/leave`
  );
  return res.data;
}
