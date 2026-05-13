// client/src/app/student/dashboard/page.tsx
"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { meApi, logoutApi, type User } from "@/api/auth";
import { fetchEnrolledTasks, EnrolledTaskItem } from "@/api/studentTasks";
import ContributionDashboard from "@/components/contribution/ContributionDashboard";
import { api } from "@/lib/api";

type ReferralSummary = {
  id: string;
  status: string;
};
function StudentDashboardInner() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();

  // 🔹 Task summary state
  const [taskSummary, setTaskSummary] = useState({
    pendingReviews: 0,
    activeTasks: 0,
    approvedTasks: 0,
    otherTasks: 0,
    needingAttention: 0,
  });
  const [tasksLoading, setTasksLoading] = useState(true);
  const [referralsLoading, setReferralsLoading] = useState(true);
  const [referralsCount, setReferralsCount] = useState(0);

  useEffect(() => {
    meApi()
      .then((u) => setUser(u))
      .catch(() => {
        window.location.href = "/auth";
      })
      .finally(() => setLoading(false));
  }, []);

  // 🔹 Load enrolled tasks + referrals once to compute summary
  useEffect(() => {
    const loadTaskSummary = async () => {
      try {
        setTasksLoading(true);
        setReferralsLoading(true);
        const [items, referralsRes] = await Promise.all([
          fetchEnrolledTasks(),
          api.get<ReferralSummary[]>("/referrals/my"),
        ]);
        const referrals = referralsRes.data || [];

        const pendingReviews = items.filter(
          (i) => i.submissionStatus === "PENDING" && i.submittedAt
        ).length;

        const approvedTasks = items.filter(
          (i) => i.submissionStatus === "APPROVED"
        ).length;

        const activeTasks = items.filter(
          (i) => i.taskStatus === "ACTIVE" && i.submissionStatus !== "APPROVED"
        ).length;

        // Needing attention: changes requested OR deadline soon (within 3 days)
        const now = new Date().getTime();
        const threeDays = 3 * 24 * 60 * 60 * 1000;
        const needingAttention = items.filter((i) => {
          const hasChanges = i.submissionStatus === "CHANGES_REQUESTED";
          const hasNearDeadline =
            i.deadline &&
            new Date(i.deadline).getTime() - now <= threeDays &&
            i.submissionStatus !== "APPROVED";
          return hasChanges || hasNearDeadline;
        }).length;

        const otherTasks =
          items.length - (activeTasks + approvedTasks + pendingReviews);

        setTaskSummary({
          pendingReviews,
          activeTasks,
          approvedTasks,
          otherTasks: otherTasks < 0 ? 0 : otherTasks,
          needingAttention,
        });

        setReferralsCount(referrals.length);
      } catch (err) {
        console.error("Failed to load student task summary", err);
      } finally {
        setTasksLoading(false);
        setReferralsLoading(false);
      }
    };

    loadTaskSummary();
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
      <div className="min-h-screen flex items-center justify-center bg-[#020617] text-slate-200">
        <p className="text-sm">Loading your space…</p>
      </div>
    );
  }

  const navItems = [
    { label: "Dashboard", href: "/student/dashboard", icon: "📊" },
    { label: "My Tasks", href: "/student/tasks", icon: "✅" },
    { label: "Profile", href: "/student/profile", icon: "👤" },
    { label: "Referrals", href: "/student/referrals", icon: "✉️" },
    { label: "Contributions", href: "/student/contribution", icon: "🌱" }
  ];

  return (
    <div className="min-h-screen flex bg-black text-slate-100">
      {/* SIDEBAR */}
      <aside className="hidden md:flex w-64 flex-col border-r border-slate-900 bg-[#050816]">
        {/* Brand */}
        <div className="px-5 py-4 border-b border-slate-900">
          <div className="text-xs uppercase tracking-[0.22em] text-slate-500 mb-1">
            Student Hub
          </div>
          <div className="text-sm font-semibold text-slate-100">
            Task & Mentorship
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition
                  ${
                    active
                      ? "bg-slate-900 text-slate-50 shadow-[0_0_0_1px_rgba(148,163,184,0.45)]"
                      : "text-slate-400 hover:text-slate-100 hover:bg-slate-900/60"
                  }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User + Logout */}
        <div className="px-4 pb-4 pt-2 border-t border-slate-900">
          {user && (
            <div className="mb-3 flex items-center gap-3 rounded-xl bg-slate-900/70 px-3 py-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-linear-to-br from-sky-500 to-emerald-400 text-xs font-semibold text-slate-950">
                {(user.name || user.email || "?").charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium text-slate-100 truncate">
                  {user.name ?? "Student"}
                </p>
                <p className="text-[10px] text-slate-500 truncate">
                  {user.email}
                </p>
              </div>
            </div>
          )}

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs font-medium text-red-300 hover:bg-red-500/20 transition"
          >
            <span>⏏</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* MAIN AREA */}
      <div className="flex-1 min-h-screen bg-[#02040b]">
        {/* Top header (for small screens we also keep logout) */}
        <header className="md:hidden flex items-center justify-between px-4 py-3 border-b border-slate-900 bg-black/80 backdrop-blur">
          <div>
            <div className="text-xs uppercase tracking-[0.22em] text-slate-500">
              Student Hub
            </div>
            <div className="text-sm font-semibold text-slate-100">Dashboard</div>
          </div>

          <button
            onClick={handleLogout}
            className="px-3 py-1.5 rounded-full text-xs font-medium bg-slate-900 hover:bg-slate-800 border border-slate-700 transition"
          >
            Logout
          </button>
        </header>

        <main className="max-w-6xl mx-auto px-4 py-6 space-y-8">
          {/* PAGE TITLE */}
          <section className="space-y-1">
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
              Dashboard
            </h1>
            <p className="text-sm text-slate-400">
              Overview of your learning and task activity.
            </p>
          </section>

          {/* TOP METRIC CARDS (4) */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Pending Reviews"
              value={
                tasksLoading
                  ? "—"
                  : String(taskSummary.pendingReviews)
              }
              subtitle="submissions awaiting feedback"
              accent="from-[#f97316] to-[#fb923c]"
              icon="⏳"
            />
            <MetricCard
              title="Active Tasks"
              value={
                tasksLoading
                  ? "—"
                  : String(taskSummary.activeTasks)
              }
              subtitle="ongoing assignments"
              accent="from-[#38bdf8] to-[#0ea5e9]"
              icon="✅"
            />
            <MetricCard
              title="Tasks Needing Attention"
              value={
                tasksLoading
                  ? "—"
                  : String(taskSummary.needingAttention)
              }
              subtitle="near deadlines or changes"
              accent="from-[#facc15] to-[#f97316]"
              icon="⚠️"
            />
            <MetricCard
              title="Referrals"
              value={
                referralsLoading
                  ? "—"
                  : String(referralsCount)
              }
              subtitle="total referrals"
              accent="from-[#4ade80] to-[#22c55e]"
              icon="📨"
            />
          </section>

          {/* QUICK NAVIGATION (Profile / Tasks) */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-200">
                Quick navigation
              </h2>
              <span className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
                STUDENT TOOLS
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <DashboardCard
                title="My Profile"
                description="Edit your bio, education, skills and social links."
                href="/student/profile"
                accent="from-emerald-500/20 to-emerald-500/5"
                pill="Profile"
              />
            </div>
          </section>
          <ContributionDashboard />
        </main>
      </div>
    </div>
  );
}

/* ---------- Small UI pieces ---------- */

function MetricCard({
  title,
  value,
  subtitle,
  accent,
  icon,
}: {
  title: string;
  value: string;
  subtitle: string;
  accent: string;
  icon: string;
}) {
  return (
    <div className="relative rounded-2xl border border-slate-900 bg-[#050814] p-4 shadow-[0_20px_60px_rgba(0,0,0,0.9)] overflow-hidden">
      <div
        className={`pointer-events-none absolute inset-x-0 -top-10 h-20 bg-linear-to-br ${accent} opacity-30`}
      />
      <div className="relative flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-black/70 border border-white/10 text-lg">
            {icon}
          </div>
          <span className="text-[11px] text-slate-500 uppercase tracking-[0.16em]">
            Overview
          </span>
        </div>
        <div>
          <p className="text-xs text-slate-400">{title}</p>
          <p className="mt-1 text-2xl font-semibold text-slate-50">{value}</p>
          <p className="mt-1 text-[11px] text-slate-500">{subtitle}</p>
        </div>
      </div>
    </div>
  );
}

function DashboardCard({
  title,
  description,
  href,
  accent,
  pill,
}: {
  title: string;
  description: string;
  href: string;
  accent: string;
  pill: string;
}) {
  return (
    <Link
      href={href}
      className="group relative overflow-hidden rounded-2xl border border-slate-900 bg-linear-to-br from-slate-950 via-slate-900 to-slate-950 p-5 shadow-[0_18px_50px_rgba(0,0,0,0.9)] hover:shadow-[0_24px_80px_rgba(0,0,0,1)] transition transform hover:-translate-y-[2px]"
    >
      <div
        className={`pointer-events-none absolute inset-0 bg-linear-to-br ${accent} opacity-0 group-hover:opacity-100 transition`}
      />
      <div className="relative space-y-2">
        <span className="inline-flex items-center rounded-full border border-slate-700/80 bg-slate-950/80 px-2 py-0.5 text-[10px] uppercase tracking-[0.16em] text-slate-400">
          {pill}
        </span>
        <h3 className="text-base font-semibold text-slate-100">{title}</h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          {description}
        </p>
        <span className="inline-flex items-center text-[11px] font-medium text-emerald-400 group-hover:text-emerald-300">
          Open
          <span className="ml-1 translate-x-0.5 group-hover:translate-x-1 transition">
            →
          </span>
        </span>
      </div>
    </Link>
  );
}

function ContributionStat({
  title,
  value,
  subtitle,
  accent,
  icon,
}: {
  title: string;
  value: string;
  subtitle: string;
  accent: string;
  icon: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-900 bg-[#050814] p-4 shadow-[0_20px_60px_rgba(0,0,0,0.9)] hover:-translate-y-[1px] transition">
      <div
        className={`pointer-events-none absolute inset-x-0 -top-10 h-20 bg-linear-to-br ${accent} opacity-30`}
      />

      <div className="relative flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-xs text-slate-400">{title}</p>
          <p className="text-xl font-semibold text-slate-50">{value}</p>
          <p className="text-[11px] text-slate-500">{subtitle}</p>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black/60 border border-white/10 text-lg">
          {icon}
        </div>
      </div>
    </div>
  );
}

// ✅ Role-guarded export
export default function StudentDashboard() {
  return (
    <ProtectedRoute allowedRoles={["STUDENT"]}>
      <StudentDashboardInner />
    </ProtectedRoute>
  );
}
