// client/src/components/contribution/ContributionHeatmap.tsx
"use client";

import { useEffect, useState } from "react";
import { getHeatmap, HeatmapDay } from "@/api/contributions";

export default function ContributionHeatmap() {
  const [days, setDays] = useState<HeatmapDay[]>([]);

  useEffect(() => {
    getHeatmap().then(setDays);
  }, []);

  const color = (count: number) => {
    if (count === 0) return "bg-slate-800";
    if (count <= 2) return "bg-emerald-900";
    if (count <= 5) return "bg-emerald-700";
    if (count <= 10) return "bg-emerald-500";
    return "bg-emerald-400";
  };

  return (
    <div className="rounded-2xl border border-slate-900 bg-[#050814] p-5">
      <h3 className="text-sm font-semibold mb-3">Contribution Activity</h3>

      <div className="grid grid-rows-7 grid-flow-col gap-1">
        {days.map((d) => (
          <div
            key={d.date}
            title={`${d.date}: ${d.count} contributions`}
            className={`h-3 w-3 rounded-sm ${color(d.count)}`}
          />
        ))}
      </div>
    </div>
  );
}
