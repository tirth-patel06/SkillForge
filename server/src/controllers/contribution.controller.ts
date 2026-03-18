// server/src/controllers/contribution.controller.ts
import Contribution from "../models/Contribution";
import { Request, Response } from "express";
import mongoose from "mongoose";

export const history = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthenticated" });
  }

  const userId = req.user.id;

  try {
    const userOid = new mongoose.Types.ObjectId(userId);
    const items = await Contribution.find({ user: userOid })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(items);
  } catch (err) {
    console.error("history error", err);
    res.status(500).json({ error: "Failed to load history" });
  }
};

export const heatmap = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthenticated" });
  }

  const userOid = new mongoose.Types.ObjectId(req.user.id);

  try {
    const data = await Contribution.aggregate([
      { $match: { user: userOid } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json(data.map((d) => ({ date: d._id, count: d.count })));
  } catch (err) {
    console.error("heatmap error", err);
    res.status(500).json({ error: "Failed to generate heatmap" });
  }
};

export const badges = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthenticated" });
  }

  const userOid = new mongoose.Types.ObjectId(req.user.id);

  // get distinct contribution dates
  const dates = await Contribution.aggregate([
    { $match: { user: userOid } },
    {
      $group: {
        _id: {
          $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
        },
      },
    },
    { $sort: { _id: -1 } },
  ]);

  // calculate streak
  let streak = 0;
  let currentDate = new Date();

  for (const d of dates) {
    const date = new Date(d._id);
    const diff =
      (currentDate.getTime() - date.getTime()) / (1000 * 60 * 60 * 24);

    if (diff <= 1) {
      streak++;
      currentDate = date;
    } else {
      break;
    }
  }

  const total = await Contribution.countDocuments({ user: userOid });

  const badges = [
    { name: "7 Day Streak", icon: "🔥", achieved: streak >= 7 },
    { name: "30 Day Streak", icon: "⚡", achieved: streak >= 30 },
    { name: "50 Contributions", icon: "🏅", achieved: total >= 50 },
    { name: "100 Contributions", icon: "👑", achieved: total >= 100 },
  ];

  console.log("🏆 Badges computed:", { streak, total, badges });

  res.json(badges);
};



export const score = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthenticated" });
  }

  const userOid = new mongoose.Types.ObjectId(req.user.id);

  const result = await Contribution.aggregate([
    { $match: { user: userOid } },
    { $group: { _id: null, total: { $sum: "$points" } } },
  ]);

  const score = result[0]?.total ?? 0;

  console.log("⭐ Contribution score:", score);

  res.json({ score });
};

export const stats = async (req: Request, res: Response) => {
  if (!req.user) return res.status(401).json({ error: "Unauthenticated" });

  const userOid = new mongoose.Types.ObjectId(req.user.id);

  const weekSince = new Date(Date.now() - 7 * 86400000);

  const weeklyCount = await Contribution.countDocuments({
    user: userOid,
    createdAt: { $gte: weekSince },
  });

  // streak calculation: count unique active days in last 30 days
  const last30 = new Date(Date.now() - 30 * 86400000);

  const days = await Contribution.aggregate([
    { $match: { user: userOid, createdAt: { $gte: last30 } } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
      },
    },
    { $sort: { _id: -1 } },
  ]);

  // streak = continuous days from today backwards
  let streak = 0;
  const today = new Date();
  const dateToStr = (d: Date) => d.toISOString().slice(0, 10);

  const daySet = new Set(days.map((d) => d._id));

  for (let i = 0; i < 365; i++) {
    const check = new Date(today);
    check.setDate(today.getDate() - i);
    const key = dateToStr(check);

    if (daySet.has(key)) streak++;
    else break;
  }

  console.log("📊 Weekly:", weeklyCount, "🔥 streak:", streak);

  res.json({ weeklyCount, streak });
};
