"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import Link from "next/link";
import { meApi, logoutApi, type User } from "@/api/auth";

function AdminDashboardInner() {
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
      localStorage.removeItem("token");
    } catch {
      // ignore
    } finally {
      window.location.href = "/auth";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-black via-slate-950 to-slate-900 text-slate-200">
        <p className="text-sm">Loading admin console…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-black via-slate-950 to-slate-900 text-slate-100">
      {/* Top Bar */}
      <header className="border-b border-slate-800/80 bg-black/80 backdrop-blur sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">
              🛡 Admin Control
            </h1>
            <p className="text-xs text-slate-400">
              Moderate users, tasks, and referral pipelines.
            </p>
          </div>

          {user && (
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-medium">{user.name ?? "Admin"}</p>
                <p className="text-[11px] uppercase tracking-[0.18em] text-rose-400">
                  {user.role}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 rounded-full text-xs font-medium bg-slate-900 hover:bg-slate-800 border border-slate-700 transition"
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
        <section className="bg-slate-950/80 border border-slate-800 rounded-2xl p-6 shadow-2xl shadow-black/60 flex flex-col md:flex-row justify-between gap-4">
          <div>
            <p className="text-sm text-slate-400 mb-1">Welcome,</p>
            <h2 className="text-2xl md:text-3xl font-semibold">
              {user?.name ?? "Admin"} 👑
            </h2>
            <p className="text-sm text-slate-400 mt-2 max-w-xl">
              Keep the Obsidian Circle clean, fair, and transparent. Review
              disputes, audits, and platform-wide health.
            </p>
          </div>
          <div className="flex flex-col items-end justify-between text-right">
            <p className="text-xs text-slate-400 uppercase tracking-[0.18em]">
              PLATFORM STATUS
            </p>
            <p className="text-sm font-medium text-rose-400">
              Overview cards coming soon
            </p>
          </div>
        </section>

        {/* Actions */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <DashboardCard
            title="User & Role Management"
            description="Approve mentors, manage bans, and handle escalations."
            href="/admin/users"
            accent="from-rose-500/20 to-rose-500/5"
          />
          <DashboardCard
            title="Task Moderation"
            description="Review posted tasks for policy compliance."
            href="/admin/tasks"
            accent="from-yellow-500/20 to-yellow-500/5"
          />
          <DashboardCard
            title="Referral Audits"
            description="Inspect referral trails and export audit packets."
            href="/admin/referrals"
            accent="from-teal-500/20 to-teal-500/5"
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
      className={`group relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/80 p-5 shadow-lg shadow-black/50 hover:shadow-xl hover:shadow-black/80 transition transform hover:-translate-y-1`}
    >
      <div
        className={`pointer-events-none absolute inset-0 bg-linear-to-br ${accent} opacity-0 group-hover:opacity-100 transition`}
      />
      <div className="relative space-y-2">
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-xs text-slate-400">{description}</p>
        <span className="inline-flex items-center text-xs font-medium text-rose-400 group-hover:text-rose-300">
          Open
          <span className="ml-1 group-hover:translate-x-0.5 transition">
            →
          </span>
        </span>
      </div>
    </Link>
  );
}

export default function AdminDashboardPage() {
    return (
      <ProtectedRoute allowedRoles={["ADMIN"]}>
        <AdminDashboardInner />
      </ProtectedRoute>
    );
  }
  