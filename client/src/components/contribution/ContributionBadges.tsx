// client/src/components/contribution/ContributionBadges.tsx
"use client";

import { useEffect, useState } from "react";
import { getBadges, Badge } from "@/api/contributions";

export default function ContributionBadges() {
  const [badges, setBadges] = useState<Badge[]>([]);

  useEffect(() => {
    getBadges().then(setBadges);
  }, []);

  return (
    <div className="rounded-2xl border border-slate-900 bg-[#050814] p-5">
      <h3 className="text-sm font-semibold mb-3">Badges</h3>

      <div className="flex gap-3 flex-wrap">
        {badges.map((b) => (
          <div
            key={b.name}
            className={`rounded-xl px-3 py-2 border ${
              b.achieved
                ? "border-emerald-400 text-emerald-300"
                : "border-slate-700 text-slate-500"
            }`}
          >
            {b.icon} {b.name}
          </div>
        ))}
      </div>
    </div>
  );
}
