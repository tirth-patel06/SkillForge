"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { api } from "@/lib/api";

type ReferralItem = {
  id: string;
  student_name: string;
  mentor_name: string;
  recommendation: string;
  evidence_links: string[];
  status: "PENDING" | "ACCEPTED" | "REJECTED" | "APPROVED" | "REMOVED" | string;
  pdf_url: string;
  created_at: string;
};

function statusBadgeClass(status: ReferralItem["status"]) {
  switch (status) {
    case "APPROVED":
      return "bg-zinc-700/30 text-zinc-200 border-zinc-600";
    case "PENDING":
      return "bg-zinc-700/30 text-zinc-200 border-zinc-600";
    case "REJECTED":
    case "REMOVED":
      return "bg-zinc-700/30 text-zinc-200 border-zinc-600";
    case "ACCEPTED":
      return "bg-zinc-700/30 text-zinc-200 border-zinc-600";
    default:
      return "bg-zinc-700/30 text-zinc-200 border-zinc-600";
  }
}

function StudentReferralsInner() {
  const [items, setItems] = useState<ReferralItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadReferrals = async () => {
      try {
        setLoading(true);
        const { data } = await api.get<ReferralItem[]>("/referrals/my");
        setItems(data || []);
      } catch (err) {
        console.error("Failed to load referrals", err);
      } finally {
        setLoading(false);
      }
    };

    loadReferrals();
  }, []);

  return (
    <div className="min-h-screen bg-black text-zinc-100">
      <header className="border-b border-zinc-800 px-6 py-4 bg-black/70">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-semibold tracking-tight">Referrals</h1>
          <p className="text-sm text-slate-400">
            Review all referrals created for you and download approved PDFs.
          </p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-6">
        {loading ? (
          <div className="text-sm text-slate-400">Loading referrals...</div>
        ) : items.length === 0 ? (
          <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-6 text-sm text-zinc-400">
            No referrals yet.
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((ref) => (
              <div
                key={ref.id}
                className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5 shadow-[0_18px_50px_rgba(0,0,0,0.8)]"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-semibold text-slate-100">
                        Referral from {ref.mentor_name || "Mentor"}
                      </h2>
                      <span
                        className={`text-[11px] px-2 py-0.5 rounded-full border ${statusBadgeClass(
                          ref.status
                        )}`}
                      >
                        {ref.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Created {new Date(ref.created_at).toLocaleDateString()}
                    </p>
                    {ref.recommendation && (
                      <p className="text-sm text-slate-300 whitespace-pre-wrap">
                        {ref.recommendation}
                      </p>
                    )}
                  </div>

                  <div className="text-sm text-slate-300">
                    {ref.pdf_url ? (
                      <a
                        href={ref.pdf_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 rounded-lg border border-zinc-600 bg-zinc-800 px-3 py-2 text-zinc-200 hover:bg-zinc-700"
                      >
                        Download PDF
                      </a>
                    ) : (
                      <span className="text-xs text-slate-500">
                        PDF will appear after approval
                      </span>
                    )}
                  </div>
                </div>

                {ref.evidence_links && ref.evidence_links.length > 0 && (
                  <div className="mt-4">
                    <p className="text-xs text-slate-400 mb-2">Evidence Links</p>
                    <div className="flex flex-wrap gap-2">
                      {ref.evidence_links.map((link) => (
                        <a
                          key={link}
                          href={link}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-sky-300 underline break-all"
                        >
                          {link}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default function StudentReferralsPage() {
  return (
    <ProtectedRoute allowedRoles={["STUDENT"]}>
      <StudentReferralsInner />
    </ProtectedRoute>
  );
}
