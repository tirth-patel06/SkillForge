import express from "express";
import { Task } from "../models/Task";
import { User } from "../models/User";
import { Notification } from "../models/Notification";

const router = express.Router();

router.get("/", async (req, res) => {
  const status = req.query.status as string | undefined;
  const q: any = {};
  if (status) q.status = status;
  const tasks = await Task.find(q).populate("createdBy", "email name");
  res.json(tasks);
});