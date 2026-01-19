// import { api } from "../lib/api";

// export type HeatmapDay = {
//   date: string;
//   count: number;
// };

// export type ContributionItem = {
//   _id: string;
//   type: "TASK" | "REVIEW" | "COMMENT" | "MESSAGE";
//   description: string;
//   points: number;
//   createdAt: string;
// };

// export type Badge = {
//   name: string;
//   icon: string;
//   achieved: boolean;
// };

// export const getHeatmap = async () =>
//   (await api.get<HeatmapDay[]>("/contributions/heatmap")).data;

// export const getBadges = async () =>
//   (await api.get<Badge[]>("/contributions/badges")).data;

// export const getHistory = async () =>
//   (await api.get<ContributionItem[]>("/contributions/history")).data;

// export const getScore = () =>
//   api.get<{ score: number }>("/contributions/score");

import { api } from "../lib/api";

export type HeatmapDay = {
  date: string;
  count: number;
};

export type ContributionItem = {
  _id: string;
  type: "TASK" | "REVIEW" | "COMMENT" | "MESSAGE";
  description: string;
  points: number;
  createdAt: string;
};

export type Badge = {
  name: string;
  icon: string;
  achieved: boolean;
};

/* ✅ NEW: Score API response type */
export type ContributionScoreResponse = {
  score: number;
  weeklyCount: number;
  streak: number;
};

export const getHeatmap = async () =>
  (await api.get<HeatmapDay[]>("/contributions/heatmap")).data;

export const getBadges = async () =>
  (await api.get<Badge[]>("/contributions/badges")).data;

export const getHistory = async () =>
  (await api.get<ContributionItem[]>("/contributions/history")).data;

/* ✅ FIXED: fully typed score response */
export const getScore = () =>
  api.get<ContributionScoreResponse>("/contributions/score");

export const getStats = () =>
  api.get<{ weeklyCount: number; streak: number }>("/contributions/stats");
