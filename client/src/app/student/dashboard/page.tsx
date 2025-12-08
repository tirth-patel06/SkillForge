"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import Link from "next/link";
import { meApi, logoutApi, type User } from "@/api/auth";

function StudentDashboardInner() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    meApi()
      .then((u) => setUser(u))
      .catch(() => {
        window.location.href = "/auth";
      })
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = async () => {
    try {
      await logoutApi();
      // if you also use localStorage token anywhere:
      localStorage.removeItem("token");
    } catch (e) {
      // ignore errors for now
    } finally {
      window.location.href = "/auth";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-950 via-slate-900 to-slate-800 text-slate-200">
        <p className="text-sm">Loading your space…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-slate-800 text-slate-100">
      {/* Top Bar */}
      <header className="border-b border-slate-800/80 bg-slate-950/70 backdrop-blur sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">
              🎓 Student Hub
            </h1>
            <p className="text-xs text-slate-400">
              Obsidian Circle – Your mentorship workspace
            </p>
          </div>

          {user && (
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-medium">{user.name ?? "Student"}</p>
                <p className="text-[11px] uppercase tracking-[0.18em] text-emerald-400">
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
              {user?.name ?? "Student"} 👋
            </h2>
            <p className="text-sm text-slate-400 mt-2 max-w-xl">
              Track your tasks, manage your teams, and build a portfolio that
              mentors can genuinely vouch for.
            </p>
          </div>
          <div className="flex flex-col items-end justify-between text-right">
            <p className="text-xs text-slate-400 uppercase tracking-[0.18em]">
              CURRENT STATUS
            </p>
            <p className="text-sm font-medium text-emerald-400">
              Active learner
            </p>
          </div>
        </section>

        {/* Quick navigation cards */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <DashboardCard
            title="My Profile"
            description="Update your bio, skills, and social links mentors see."
            href="/student/profile"
            accent="from-emerald-500/20 to-emerald-500/5"
          />
          <DashboardCard
            title="My Tasks"
            description="View tasks assigned to you and your team."
            href="/student/tasks"
            accent="from-blue-500/20 to-blue-500/5"
          />
          <DashboardCard
            title="My Teams"
            description="Create or join teams and manage collaboration."
            href="/student/teams"
            accent="from-purple-500/20 to-purple-500/5"
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
        <span className="inline-flex items-center text-xs font-medium text-emerald-400 group-hover:text-emerald-300">
          Open
          <span className="ml-1 group-hover:translate-x-0.5 transition">
            →
          </span>
        </span>
      </div>
    </Link>
  );
}

// ✅ Export wrapped with role-based guard
export default function StudentDashboard() {
    return (
      <ProtectedRoute allowedRoles={["STUDENT"]}>
        <StudentDashboardInner />
      </ProtectedRoute>
    );
  }