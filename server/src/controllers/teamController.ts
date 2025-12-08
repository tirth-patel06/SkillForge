// server/src/controllers/teamController.ts
import { Request, Response } from "express";
import { Team } from "../models/Team";
import { JwtPayload } from "../types/auth";

interface AuthRequest extends Request {
  user?: JwtPayload;
}

function getUserId(req: AuthRequest): string {
  if (!req.user) {
    throw new Error("Missing auth user on request");
  }
  return req.user.id;
}

async function populateTeam(team: any) {
  return team.populate([
    { path: "leader", select: "name email role" },
    { path: "members.user", select: "name email role" },
  ]);
}

// GET /api/teams/my
export const getMyTeams = async (req: AuthRequest, res: Response) => {
  try {
    const userId = getUserId(req);

    const teams = await Team.find({
      "members.user": userId,
    })
      .sort({ createdAt: -1 })
      .populate([
        { path: "leader", select: "name email role" },
        { path: "members.user", select: "name email role" },
      ]);

    res.json({ teams });
  } catch (err) {
    console.error("[getMyTeams] error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// POST /api/teams
export const createTeam = async (req: AuthRequest, res: Response) => {
  try {
    const userId = getUserId(req);
    const { name, description, techStack } = req.body;

    if (!name) {
      res.status(400).json({ message: "Name is required" });
      return;
    }

    // generate simple invite code
    let inviteCode: string;
    while (true) {
      inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      const exists = await Team.findOne({ inviteCode });
      if (!exists) break;
    }

    let tech: string[] = [];
    if (Array.isArray(techStack)) tech = techStack;
    else if (typeof techStack === "string" && techStack.trim().length > 0) {
      tech = techStack.split(",").map((t) => t.trim());
    }

    const team = await Team.create({
      name,
      description,
      techStack: tech,
      leader: userId as any,
      members: [
        {
          user: userId as any,
          role: "LEADER",
          joinedAt: new Date(),
        },
      ],
      inviteCode,
    });

    await populateTeam(team);

    res.status(201).json({ team });
  } catch (err) {
    console.error("[createTeam] error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// POST /api/teams/join { code }
export const joinTeam = async (req: AuthRequest, res: Response) => {
  try {
    const userId = getUserId(req);
    const { code } = req.body;

    if (!code) {
      res.status(400).json({ message: "Invite code is required" });
      return;
    }

    const team = await Team.findOne({ inviteCode: code.toUpperCase() });
    if (!team) {
      res.status(404).json({ message: "Team not found" });
      return;
    }

    const already = team.members.some((m) => m.user.toString() === userId);
    if (already) {
      res.status(400).json({ message: "You are already in this team" });
      return;
    }

    team.members.push({ user: team.leader.equals(userId) ? team.leader : (userId as any), role: "MEMBER", joinedAt: new Date() });
    await team.save();
    await populateTeam(team);

    res.json({ team });
  } catch (err) {
    console.error("[joinTeam] error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// GET /api/teams/:teamId
export const getTeamById = async (req: AuthRequest, res: Response) => {
  try {
    const userId = getUserId(req);
    const { teamId } = req.params;

    const team = await Team.findById(teamId).populate([
      { path: "leader", select: "name email role" },
      { path: "members.user", select: "name email role" },
    ]);

    if (!team) {
      res.status(404).json({ message: "Team not found" });
      return;
    }

    const isMember = team.members.some((m) => m.user.toString() === userId);
    if (!isMember) {
      res.status(403).json({ message: "You are not a member of this team" });
      return;
    }

    res.json({ team });
  } catch (err) {
    console.error("[getTeamById] error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// PATCH /api/teams/:teamId
export const updateTeam = async (req: AuthRequest, res: Response) => {
  try {
    const userId = getUserId(req);
    const { teamId } = req.params;
    const { name, description, techStack } = req.body;

    const team = await Team.findById(teamId);
    if (!team) {
      res.status(404).json({ message: "Team not found" });
      return;
    }

    if (team.leader.toString() !== userId) {
      res.status(403).json({ message: "Only the leader can update the team" });
      return;
    }

    if (name) team.name = name;
    if (description !== undefined) team.description = description;

    if (techStack !== undefined) {
      if (Array.isArray(techStack)) team.techStack = techStack;
      else if (typeof techStack === "string") {
        team.techStack = techStack.split(",").map((t) => t.trim());
      }
    }

    await team.save();
    await populateTeam(team);

    res.json({ team });
  } catch (err) {
    console.error("[updateTeam] error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// POST /api/teams/:teamId/kick { memberId }
export const kickMember = async (req: AuthRequest, res: Response) => {
  try {
    const userId = getUserId(req);
    const { teamId } = req.params;
    const { memberId } = req.body;

    const team = await Team.findById(teamId);
    if (!team) {
      res.status(404).json({ message: "Team not found" });
      return;
    }

    if (team.leader.toString() !== userId) {
      res.status(403).json({ message: "Only the leader can manage members" });
      return;
    }

    if (memberId === userId) {
      res.status(400).json({ message: "Leader cannot kick themselves" });
      return;
    }

    const before = team.members.length;
    team.members = team.members.filter((m) => m.user.toString() !== memberId);

    if (team.members.length === before) {
      res.status(404).json({ message: "Member not found in team" });
      return;
    }

    await team.save();
    await populateTeam(team);

    res.json({ team });
  } catch (err) {
    console.error("[kickMember] error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// POST /api/teams/:teamId/transfer { newLeaderId }
export const transferLeadership = async (req: AuthRequest, res: Response) => {
  try {
    const userId = getUserId(req);
    const { teamId } = req.params;
    const { newLeaderId } = req.body;

    const team = await Team.findById(teamId);
    if (!team) {
      res.status(404).json({ message: "Team not found" });
      return;
    }

    if (team.leader.toString() !== userId) {
      res.status(403).json({ message: "Only the leader can transfer leadership" });
      return;
    }

    const member = team.members.find((m) => m.user.toString() === newLeaderId);
    if (!member) {
      res.status(404).json({ message: "New leader is not a member of the team" });
      return;
    }

    // demote old leader
    const oldLeaderMember = team.members.find(
      (m) => m.user.toString() === userId
    );
    if (oldLeaderMember) {
      oldLeaderMember.role = "MEMBER";
    } else {
      team.members.push({ user: team.leader, role: "MEMBER", joinedAt: new Date() });
    }

    // promote new leader
    member.role = "LEADER";
    team.leader = member.user;

    await team.save();
    await populateTeam(team);

    res.json({ team });
  } catch (err) {
    console.error("[transferLeadership] error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// POST /api/teams/:teamId/leave
export const leaveTeam = async (req: AuthRequest, res: Response) => {
  try {
    const userId = getUserId(req);
    const { teamId } = req.params;

    const team = await Team.findById(teamId);
    if (!team) {
      res.status(404).json({ message: "Team not found" });
      return;
    }

    const isMember = team.members.some((m) => m.user.toString() === userId);
    if (!isMember) {
      res.status(400).json({ message: "You are not a member of this team" });
      return;
    }

    if (team.leader.toString() === userId && team.members.length > 1) {
      res.status(400).json({
        message: "Leader must transfer leadership or disband team before leaving",
      });
      return;
    }

    team.members = team.members.filter((m) => m.user.toString() !== userId);

    if (team.members.length === 0) {
      await team.deleteOne();
      res.json({ message: "You left the team and it was deleted" });
      return;
    }

    await team.save();
    await populateTeam(team);

    res.json({ team });
  } catch (err) {
    console.error("[leaveTeam] error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};
