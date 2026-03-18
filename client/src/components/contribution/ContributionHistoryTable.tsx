// client/src/components/contribution/ContributionHistoryTable.tsx
"use client";

import { useEffect, useState } from "react";
import { getHistory, ContributionItem } from "@/api/contributions";

export default function ContributionHistoryTable() {
  const [items, setItems] = useState<ContributionItem[]>([]);

  useEffect(() => {
    getHistory().then(setItems);
  }, []);

  return (
    <div className="rounded-2xl border border-slate-900 bg-[#050814] p-5">
      <h3 className="text-sm font-semibold mb-3">Contribution History</h3>

      <table className="w-full text-sm">
        <thead className="text-slate-400">
          <tr>
            <th align="left">Type</th>
            <th align="left">Description</th>
            <th align="right">Points</th>
            <th align="right">Date</th>
          </tr>
        </thead>
        <tbody>
          {items.map((c) => (
            <tr key={c._id} className="border-t border-slate-800">
              <td>{c.type}</td>
              <td>{c.description}</td>
              <td align="right" className="text-emerald-400">
                +{c.points}
              </td>
              <td align="right" className="text-slate-500">
                {new Date(c.createdAt).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
