import express from "express";
import { Task } from "../models/Task";
import { User } from "../models/User";
import { Notification } from "../models/Notification";
import { requireAuth } from "../middleware/auth";
import { requireAdmin } from "../middleware/requireAdmin";
const router = express.Router();

router.get("/",requireAuth,requireAdmin,async (req, res) => {
  const status = req.query.status as string | undefined;
  const q: any = {};
  if (status) q.status = status;
  const tasks = await Task.find(q).populate("createdBy", "email name");
  res.json(tasks);
});
router.post("/:id/moderate",requireAuth,requireAdmin, async (req, res) => {
  const { action, reason, adminId } = req.body;
  const task = await Task.findById(req.params.id);
  if (!task) return res.status(404).json({ error: "not found" });

  if (action === "approve") task.status = "APPROVED";
  else if (action === "reject") task.status = "REJECTED";
  else if (action === "remove") task.status = "REMOVED";

 
  await Notification.create({
    userId: task.createdBy,
    message: `Your task "${task.title}" was ${action}. ${reason ? "Reason: " + reason : ""}`,
    type: action === "approve" ? "success" : "error",
    read: false,
    data: { taskId: task._id, action }
  });

  res.json({ ok: true, task });
});

export default router;