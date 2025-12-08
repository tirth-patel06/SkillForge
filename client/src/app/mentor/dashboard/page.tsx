"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import Link from "next/link";
import { meApi, logoutApi, type User } from "@/api/auth";

function MentorDashboardInner() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    meApi()
      .then((u) => setUser(u as User))
      .catch(() => {
        window.location.href = "/auth";
      })
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = async () => {
    try {
      await logoutApi();
      localStorage.removeItem("token");
    } catch {
      // ignore
    } finally {
      window.location.href = "/auth";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-950 via-slate-900 to-slate-800 text-slate-200">
        <p className="text-sm">Loading mentor console…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-slate-800 text-slate-100">
      {/* Top Bar */}
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">
              🧑‍🏫 Mentor Console
            </h1>
            <p className="text-xs text-slate-400">
              Review tasks, score teams, and issue referrals.
            </p>
          </div>

          {user && (
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-medium">{user.name ?? "Mentor"}</p>
                <p className="text-[11px] uppercase tracking-[0.18em] text-indigo-400">
                  {user.role}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 rounded-full text-xs font-medium bg-slate-800 hover:bg-slate-700 border border-slate-700 transition"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        {/* Hero card */}
        <section className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 shadow-xl shadow-black/40 flex flex-col md:flex-row justify-between gap-4">
          <div>
            <p className="text-sm text-slate-400 mb-1">Welcome back,</p>
            <h2 className="text-2xl md:text-3xl font-semibold">
              {user?.name ?? "Mentor"} 🌟
            </h2>
            <p className="text-sm text-slate-400 mt-2 max-w-xl">
              Post real-world tasks, track teams, and transparently reward the
              students who actually put in the work.
            </p>
          </div>
          <div className="flex flex-col items-end justify-between text-right">
            <p className="text-xs text-slate-400 uppercase tracking-[0.18em]">
              REVIEW STATUS
            </p>
            <p className="text-sm font-medium text-indigo-400">
              Pending reviews: coming soon
            </p>
          </div>
        </section>

        {/* Quick actions */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <DashboardCard
            title="Post a Task"
            description="Create a new scoped task with rubric and deadline."
            href="/mentor/tasks/create"
            accent="from-indigo-500/20 to-indigo-500/5"
          />
          <DashboardCard
            title="Review Submissions"
            description="Score teams based on your rubric and give feedback."
            href="/mentor/submissions"
            accent="from-amber-500/20 to-amber-500/5"
          />
          <DashboardCard
            title="Referrals & Recommendations"
            description="Issue or review referrals for standout students."
            href="/mentor/referrals"
            accent="from-emerald-500/20 to-emerald-500/5"
          />
        </section>
      </main>
    </div>
  );
}

function DashboardCard({
  title,
  description,
  href,
  accent,
}: {
  title: string;
  description: string;
  href: string;
  accent: string;
}) {
  return (
    <Link
      href={href}
      className={`group relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-lg shadow-black/40 hover:shadow-xl hover:shadow-black/60 transition transform hover:-translate-y-1`}
    >
      <div
        className={`pointer-events-none absolute inset-0 bg-linear-to-br ${accent} opacity-0 group-hover:opacity-100 transition`}
      />
      <div className="relative space-y-2">
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-xs text-slate-400">{description}</p>
        <span className="inline-flex items-center text-xs font-medium text-indigo-400 group-hover:text-indigo-300">
          Open
          <span className="ml-1 group-hover:translate-x-0.5 transition">
            →
          </span>
        </span>
      </div>
    </Link>
  );
}

export default function MentorDashboard() {
    return (
      <ProtectedRoute allowedRoles={["MENTOR"]}>
        <MentorDashboardInner />
      </ProtectedRoute>
    );
  }