
"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { meApi } from "@/api/auth";

const API_URL = "http://localhost:8000";

export default function AdminReferralsPage() {
  const [user, setUser] = useState<any>(null);
  const [refs, setRefs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});

  async function loadUser() {
    try {
      const me = await meApi();
      setUser(me);
    } catch (err) {
      console.error("Not logged in", err);
      window.location.href = "/auth";
    }
  }

  async function loadRefs() {
    try {
      const res = await axios.get(`${API_URL}/api/admin/referrals?status=PENDING`, {
        withCredentials: true,
      });
      const payload = res.data;
  
      setRefs(payload.refs ?? payload);
    } catch (err) {
      console.error("Failed to load referrals", err);
    }
  }

  async function approve(id: string) {
    try {
      setActionLoading((s) => ({ ...s, [id]: true }));
      const res = await axios.patch(
        `${API_URL}/api/admin/referrals/${id}/approve`,
        { note: "Approved by admin" },
        { withCredentials: true }
      );
      const data = res.data;
      const pdfUrl = null
      if (pdfUrl) {
        const open = confirm("Referral approved. Open generated PDF?");
        if (open) window.open(pdfUrl, "_blank");
      } else {
        alert("Referral approved.");
      }
      await loadRefs();
    } catch (err) {
      console.error("Approve error", err);
      alert("Failed to approve referral.");
    } finally {
      setActionLoading((s) => ({ ...s, [id]: false }));
    }
  }

  useEffect(() => {
    (async () => {
      await loadUser();
      await loadRefs();
      setLoading(false);
    })();
  }, []);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-slate-200">
        Loading referrals...
      </div>
    );

  if (user?.role !== "ADMIN")
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-red-400">
        You do not have access.
      </div>
    );

  return (
    <div className="min-h-screen bg-linear-to-br from-black via-slate-950 to-slate-900 text-slate-100">
      {/* Header */}
      <header className="border-b border-slate-800/80 bg-black/80 backdrop-blur sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">🧾 Referrals</h1>
            <p className="text-xs text-slate-400">Pending referral packets</p>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-4 py-10 space-y-8">
        <section className="bg-slate-950/80 border border-slate-800 rounded-2xl p-6 shadow-2xl shadow-black/60 flex justify-between items-center">
          <div>
            <p className="text-sm text-slate-400">Pending Referrals</p>
            <h2 className="text-3xl font-semibold text-teal-300">{refs.length}</h2>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase tracking-wider text-slate-400">Action</p>
            <p className="text-sm font-medium text-teal-300">Generate packet & notify users</p>
          </div>
        </section>

        <section className="space-y-6">
          {refs.length === 0 && (
            <div className="text-center text-slate-400">No pending referrals.</div>
          )}

          {refs.map((r) => (
            <div
              key={r._id}
              className="bg-slate-950/60 border border-slate-800 shadow-lg rounded-xl p-5 hover:border-slate-700 transition"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-slate-100">
                    {r.title ?? `Referral ${r._id}`}
                    <span className="text-xs font-light ml-2 text-slate-400">
                      {r.status ? `(${r.status})` : ""}
                    </span>
                  </h3>

                  <div className="text-sm text-slate-400 mt-1">
                    <div>
                      <strong className="text-slate-300">Mentor:</strong>{" "}
                      {r.mentorId?.email ?? r.mentorEmail ?? "—"}
                    </div>
                    <div>
                      <strong className="text-slate-300">Student:</strong>{" "}
                      {r.studentId?.email ?? r.studentEmail ?? "—"}
                    </div>
                    <div className="mt-2">
                      <strong className="text-slate-300">Reason:</strong>{" "}
                      <span className="text-slate-400">{r.recommendation ?? "—"}</span>
                    </div>
                    {r.evidenceLinks && r.evidenceLinks.length > 0 && (
                      <div className="mt-2 text-xs text-slate-400">
                        Evidence: {r.evidenceLinks.join(", ")}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-2 items-stretch">
                  <button
                    onClick={() => approve(r._id)}
                    disabled={!!actionLoading[r._id]}
                    className="px-4 py-2 rounded-full text-xs font-medium bg-teal-600 hover:bg-teal-500 transition disabled:opacity-50"
                  >
                    {actionLoading[r._id] ? "Processing…" : "Approve & Generate PDF"}
                  </button>

                  {r.pdfUrl && (
                    <a
                      href={r.pdfUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-2 rounded-full text-xs font-medium border border-slate-700 text-slate-200 text-center"
                    >
                      Open PDF
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
