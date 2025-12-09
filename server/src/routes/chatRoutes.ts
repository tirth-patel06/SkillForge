// server/src/routes/chatRoutes.ts
import { Router } from "express";
import { ChatMessage } from "../models/ChatMessage";
import { requireAuth } from "../middleware/auth"; // adjust name if different

const router = Router();

// all chat routes require auth
router.use(requireAuth);

// GET /api/chat/team/:teamId  -> last N messages for that team
router.get("/team/:teamId", async (req, res) => {
  try {
    const { teamId } = req.params;

    const messages = await ChatMessage.find({
      roomType: "TEAM",
      team: teamId,
    })
      .sort({ createdAt: 1 })
      .limit(200)
      .populate({ path: "sender", select: "name email" });

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

// GET /api/chat/global  -> common ideas room history
router.get("/global", async (_req, res) => {
  try {
    const messages = await ChatMessage.find({
      roomType: "GLOBAL",
    })
      .sort({ createdAt: 1 })
      .limit(200)
      .populate({ path: "sender", select: "name email" });

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
    console.error("[GET /api/chat/global] error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
