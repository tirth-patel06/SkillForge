"use client";

import ContributionHeatmap from "./ContributionHeatmap";
import ContributionBadges from "./ContributionBadges";
import ContributionHistoryTable from "./ContributionHistoryTable";
import { useEffect } from "react";
import { useContributions } from "@/hooks/useContributions";

export default function ContributionDashboard() {
  const {
    score,
    weeklyCount,
    streak,
    loadScore,
    loadHeatmap,
    loadHistory,
    loadBadges,
  } = useContributions();

  useEffect(() => {
    const refresh = () => {
      loadScore();
      loadHeatmap();
      loadHistory();
      loadBadges();
    };

    window.addEventListener("contribution-refresh", refresh);
    return () =>
      window.removeEventListener("contribution-refresh", refresh);
  }, [loadScore, loadHeatmap, loadHistory, loadBadges]);

  return (
    <section className="space-y-8">
      {/* TOP: Score + Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-4">
        <div className="rounded-2xl border border-slate-900 bg-[#050814] p-6">

          {/* ❌ BEFORE (STATIC) */}
          {/* <p className="text-4xl font-semibold text-slate-50">72</p> */}

          {/* ✅ AFTER (DYNAMIC from hook) */}
          <p className="text-4xl font-semibold text-slate-50">
            {score ?? 0}
          </p>

          <div className="mt-3 h-2 w-full rounded-full bg-slate-800">
            {/* ❌ BEFORE */}
            {/* <div className="h-full w-[72%] rounded-full bg-linear-to-r from-emerald-400 to-sky-400" /> */}

            {/* ✅ AFTER */}
            <div
              className="h-full rounded-full bg-linear-to-r from-emerald-400 to-sky-400"
              style={{ width: `${Math.min(score ?? 0, 100)}%` }}
            />
          </div>

          <p className="mt-2 text-xs text-slate-500">
            Contribution score (last 30 days)
          </p>
        </div>

        <div className="grid gap-4">
          <div className="rounded-2xl border border-slate-900 bg-[#050814] p-4">
            <p className="text-sm text-slate-400">Weekly Contributions</p>

            {/* ❌ BEFORE */}
            {/* <p className="text-2xl font-semibold text-slate-50">5</p> */}

            {/* ✅ AFTER */}
            <p className="text-2xl font-semibold text-slate-50">
              {weeklyCount ?? 0}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-900 bg-[#050814] p-4">
            <p className="text-sm text-slate-400">Current Streak</p>

            {/* ❌ BEFORE */}
            {/* <p className="text-2xl font-semibold text-slate-50">9 days 🔥</p> */}

            {/* ✅ AFTER */}
            <p className="text-2xl font-semibold text-slate-50">
              {streak ?? 0} days 🔥
            </p>
          </div>
        </div>
      </div>

      {/* HEATMAP */}
      <ContributionHeatmap />

      {/* BADGES */}
      <ContributionBadges />

      {/* HISTORY TABLE */}
      <ContributionHistoryTable />
    </section>
  );
}
