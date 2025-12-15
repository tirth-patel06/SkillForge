// server/src/routes/chatRoutes.ts
import { Router } from "express";
import mongoose from "mongoose";
import { ChatMessage } from "../models/ChatMessage";
import { Team } from "../models/Team"; // ✅ RUNTIME MODEL
import { requireAuth } from "../middleware/auth";


const router = Router();

router.use(requireAuth);

router.get("/team/:teamId", async (req: any, res) => {
  try {
    const userId = req.user.id;
    const { teamId } = req.params;

    // 🛡️ prevent CastError crash
    if (!mongoose.Types.ObjectId.isValid(teamId)) {
      return res.status(400).json({ message: "Invalid team id" });
    }

    // 🔐 authorization check
    const team = await Team.findOne({
      _id: teamId,
      "members.user": userId,
    });

    if (!team) {
      return res.status(403).json({ message: "Not a team member" });
    }

    const messages = await ChatMessage.find({
      roomType: "TEAM",
      team: teamId,
    })
      .sort({ createdAt: 1 })
      .limit(200)
      .populate("sender", "name email");

    res.json({
      messages: messages.map((m) => ({
        _id: m._id,
        content: m.content,
        createdAt: m.createdAt,
        sender: {
          id: (m.sender as any)._id,
          name: (m.sender as any).name,
          email: (m.sender as any).email,
        },
      })),
    });
  } catch (err) {
    console.error("[GET /api/chat/team/:teamId] error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
