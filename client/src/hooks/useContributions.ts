// import { useState } from "react";
// import { getBadges, getHistory, getScore } from "@/api/contributions";

// // client/src/hooks/useContributions.ts
// export const useContributions = () => {
//   const [score, setScore] = useState(0);
//   const [history, setHistory] = useState([]);
//   const [badges, setBadges] = useState([]);

//   const loadScore = async () => {
//   const res = await getScore();
//   console.log("⭐ SCORE FROM BACKEND:", res.data.score);
//   setScore(res.data.score);
// };

//   const loadHeatmap = async () => {};
  
//   const loadHistory = async () => {
//   const res = await getHistory();
//   console.log("📜 HISTORY FROM BACKEND:", res.data);
//   setHistory(res.data);
// };

  
//   const loadBadges = async () => {
//   const res = await getBadges();
//   console.log("🏆 BADGES FROM BACKEND:", res.data);
//   setBadges(res.data);
// };


//   return {
//     score,
//     history,
//     badges,
//     loadScore,
//     loadHeatmap,
//     loadHistory,
//     loadBadges,
//   };
// };

import { useState } from "react";
import { getBadges, getHistory, getScore } from "@/api/contributions";

export const useContributions = () => {
  const [score, setScore] = useState<number>(0);
  const [weeklyCount, setWeeklyCount] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);

  const [history, setHistory] = useState<any[]>([]);
  const [badges, setBadges] = useState<any[]>([]);

  const loadScore = async () => {
    const res = await getScore();

    console.log("⭐ SCORE FROM BACKEND:", res.data);

    setScore(res.data.score);
    setWeeklyCount(res.data.weeklyCount);
    setStreak(res.data.streak);
  };

  const loadHeatmap = async () => {
    // Heatmap component likely fetches its own data
    // Leaving intentionally empty is OK
  };

  const loadHistory = async () => {
    const res = await getHistory();
    console.log("📜 HISTORY FROM BACKEND:", res);
    setHistory(res);
  };

  const loadBadges = async () => {
    const res = await getBadges();
    console.log("🏆 BADGES FROM BACKEND:", res);
    setBadges(res);
  };

  // ✅ NOW MATCHES DASHBOARD EXPECTATIONS
  return {
    score,
    weeklyCount,
    streak,
    history,
    badges,
    loadScore,
    loadHeatmap,
    loadHistory,
    loadBadges,
  };
};
