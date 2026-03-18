// server/src/socket.ts
import http from "http";
import { Server } from "socket.io";
import { ChatMessage } from "./models/ChatMessage";
import Contribution from "./models/Contribution";
// teamId -> set of userIds currently online in that team
let io: Server | null = null;
const teamOnline = new Map<string, Set<string>>();
// export const emitContributionUpdate = (io, userId: string) => {
//   io.to(userId).emit("contribution:update");
// };
export const emitContributionUpdate = (
  io: Server,
  userId: string
) => {
  io.to(userId).emit("contribution:update");
};

export function initSocket(server: http.Server) {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:3000",
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("🔌 Socket connected:", socket.id);
    socket.on("join:user", (userId: string) => {
    if (!userId) return;
    socket.join(String(userId));
    });

    // which teams this socket joined
    const joinedTeams = new Set<string>();
    let currentUserId: string | null = null;

    // -------- JOIN TEAM (presence + room) --------
    // payload: { teamId, userId }
    socket.on("joinTeam", (data: { teamId: string; userId: string }) => {
      if (!data?.teamId || !data?.userId) {
        console.warn("[socket joinTeam] missing teamId or userId", data);
        return;
      }

      const teamKey = String(data.teamId);
      const room = `team:${teamKey}`;
      const userId = String(data.userId);

      console.log("[socket joinTeam]", { teamKey, userId });

      currentUserId = userId;
      joinedTeams.add(teamKey);
      socket.join(room);

      let set = teamOnline.get(teamKey);
      if (!set) {
        set = new Set<string>();
        teamOnline.set(teamKey, set);
      }
      set.add(userId);

      // send full presence list to this client
      socket.emit("teamPresence", {
        teamId: teamKey,
        onlineUserIds: Array.from(set),
      });

      // notify others in that room that this user came online
      socket.to(room).emit("memberOnline", {
        teamId: teamKey,
        userId,
      });
    });

    // -------- LEAVE TEAM --------
    // payload: { teamId, userId }
    socket.on("leaveTeam", (data: { teamId: string; userId: string }) => {
      if (!data?.teamId || !data?.userId) return;

      const teamKey = String(data.teamId);
      const room = `team:${teamKey}`;
      const userId = String(data.userId);

      console.log("[socket leaveTeam]", { teamKey, userId });

      socket.leave(room);
      joinedTeams.delete(teamKey);

      const set = teamOnline.get(teamKey);
      if (set) {
        set.delete(userId);
        if (set.size === 0) teamOnline.delete(teamKey);
      }

      socket.to(room).emit("memberOffline", {
        teamId: teamKey,
        userId,
      });
    });

    // -------- TEAM MESSAGE --------
    // payload: { teamId, content, sender: { id, name, email } }
    socket.on(
      "teamMessage",
      async (data: {
        teamId: string;
        content: string;
        sender: { id: string; name?: string; email: string };
      }) => {
        try {
          if (!data?.teamId || !data?.content?.trim() || !data?.sender?.id) {
            console.warn("[socket teamMessage] bad payload", data);
            return;
          }

          const teamKey = String(data.teamId);
          const room = `team:${teamKey}`;
          const text = data.content.trim();

          console.log("[socket teamMessage] incoming", {
            teamKey,
            text,
            sender: data.sender.id,
          });

          // save in Mongo
          const msg = await ChatMessage.create({
            team: teamKey,
            roomType: "TEAM",
            sender: data.sender.id,
            content: text,
          });
          // here 
          // ---- Log contribution for sending a message ----
          await Contribution.create({
            user: msg.sender, // ObjectId from Mongo doc
            type: "MESSAGE",
            description: "Sent a team message",
            points: 1,
          });

          // realtime notify sender
          if (io) {
            io
              .to(msg.sender.toString())
              .emit("contribution:update");
          }


          const payload = {
            _id: msg._id.toString(),
            teamId: teamKey,
            roomType: "TEAM" as const,
            sender: {
              id: data.sender.id,
              name: data.sender.name,
              email: data.sender.email,
            },
            content: msg.content,
            createdAt: msg.createdAt,
          };

          // broadcast to EVERY socket in this team (including sender)
          if (!io) return;
          io.to(room).emit("teamMessage", payload);
          console.log(
            "[socket teamMessage] stored & emitted",
            teamKey,
            "->",
            msg._id.toString()
          );
        } catch (err) {
          console.error("[socket teamMessage] error:", err);
        }
      }
    );

    // -------- DISCONNECT --------
    socket.on("disconnect", () => {
      console.log("❌ Socket disconnected:", socket.id);

      if (!currentUserId) return;

      for (const teamKey of joinedTeams) {
        const room = `team:${teamKey}`;
        const set = teamOnline.get(teamKey);
        if (set) {
          set.delete(currentUserId);
          if (set.size === 0) teamOnline.delete(teamKey);
        }
        socket.to(room).emit("memberOffline", {
          teamId: teamKey,
          userId: currentUserId,
        });
      }
    });
  });

  return io;
}

export function getIO(): Server {
  if (!io) {
    throw new Error("Socket.io not initialized. Call initSocket() first.");
  }
  return io;
}
