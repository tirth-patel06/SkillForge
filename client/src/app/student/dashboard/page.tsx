"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { meApi, logoutApi, type User } from "@/api/auth";
import { fetchEnrolledTasks, EnrolledTaskItem } from "@/api/studentTasks";

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

  useEffect(() => {
    meApi()
      .then((u) => setUser(u))
      .catch(() => {
        window.location.href = "/auth";
      })
      .finally(() => setLoading(false));
  }, []);

  // 🔹 Load enrolled tasks once to compute summary
  useEffect(() => {
    const loadTaskSummary = async () => {
      try {
        setTasksLoading(true);
        const items: EnrolledTaskItem[] = await fetchEnrolledTasks();

        const pendingReviews = items.filter(
          (i) => i.submissionStatus === "PENDING"
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
      } catch (err) {
        console.error("Failed to load student task summary", err);
      } finally {
        setTasksLoading(false);
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
    { label: "Teams", href: "/student/teams", icon: "👥" },
    { label: "Profile", href: "/student/profile", icon: "👤" },
    { label: "Referrals", href: "/student/referrals", icon: "✉️" },
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
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-emerald-400 text-xs font-semibold text-slate-950">
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
              value="0"
              subtitle="pending referral slots"
              accent="from-[#4ade80] to-[#22c55e]"
              icon="📨"
            />
          </section>

          {/* QUICK NAVIGATION (Profile / Tasks / Teams) */}
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
              <DashboardCard
                title="My Tasks"
                description="See tasks assigned to you and track progress."
                href="/student/tasks"
                accent="from-sky-500/20 to-sky-500/5"
                pill="Tasks"
              />
              <DashboardCard
                title="My Teams"
                description="Collaborate with peers on shared tasks."
                href="/student/teams"
                accent="from-purple-500/20 to-purple-500/5"
                pill="Teams"
              />
            </div>
          </section>

          {/* BOTTOM GRID: MY TASKS + QUICK ACTIONS */}
          <section className="grid grid-cols-1 lg:grid-cols-[minmax(0,2fr)_minmax(0,1.4fr)] gap-4">
            {/* LEFT: My Tasks board */}
            <div className="rounded-2xl border border-slate-900 bg-[#050814] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.9)] space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-slate-100">
                    My Tasks
                  </h2>
                  <p className="text-xs text-slate-400">
                    View, manage, and remove tasks you&apos;re working on.
                  </p>
                </div>
                <button className="rounded-full border border-slate-800 px-2 py-1 text-[10px] text-slate-400 hover:bg-slate-900/60">
                  Soon: filters
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TaskColumnCard
                  title="Active"
                  colorDot="bg-sky-400"
                  countLabel={
                    tasksLoading
                      ? "—"
                      : `${taskSummary.activeTasks} task${
                          taskSummary.activeTasks === 1 ? "" : "s"
                        }`
                  }
                  emptyText="No tasks here yet."
                />
                <TaskColumnCard
                  title="Pending"
                  colorDot="bg-amber-400"
                  countLabel={
                    tasksLoading
                      ? "—"
                      : `${taskSummary.pendingReviews} task${
                          taskSummary.pendingReviews === 1 ? "" : "s"
                        }`
                  }
                  emptyText="No tasks here yet."
                />
                <TaskColumnCard
                  title="Approved"
                  colorDot="bg-emerald-400"
                  countLabel={
                    tasksLoading
                      ? "—"
                      : `${taskSummary.approvedTasks} task${
                          taskSummary.approvedTasks === 1 ? "" : "s"
                        }`
                  }
                  emptyText="No tasks here yet."
                />
                <TaskColumnCard
                  title="Other"
                  colorDot="bg-slate-500"
                  countLabel={
                    tasksLoading
                      ? "—"
                      : `${taskSummary.otherTasks} task${
                          taskSummary.otherTasks === 1 ? "" : "s"
                        }`
                  }
                  emptyText="No tasks here yet."
                />
              </div>
            </div>

            {/* RIGHT: Quick Actions like screenshot */}
            <div className="rounded-2xl border border-slate-900 bg-[#050814] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.9)] space-y-3">
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-sm font-semibold text-slate-100">
                  Quick Actions
                </h2>
                <span className="text-[11px] text-slate-500">Shortcuts</span>
              </div>

              <QuickActionRow
                title="Create new task"
                description="Add a new assignment or practice task for yourself."
                href="/student/tasks/create"
              />
              <QuickActionRow
                title="View my tasks"
                description="Open your full task list with filters and details."
                href="/student/tasks"
              />
              <QuickActionRow
                title="Update profile"
                description="Refresh your skills, links, and education."
                href="/student/profile"
              />
              <QuickActionRow
                title="View my teams"
                description="Check teams you&apos;re part of and their tasks."
                href="/student/teams"
              />
            </div>
          </section>
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
        className={`pointer-events-none absolute inset-x-0 -top-10 h-20 bg-gradient-to-br ${accent} opacity-30`}
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

function TaskColumnCard({
  title,
  colorDot,
  countLabel,
  emptyText,
}: {
  title: string;
  colorDot: string;
  countLabel: string;
  emptyText: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-[#050814] px-4 py-3 shadow-[0_16px_40px_rgba(0,0,0,0.9)] flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-slate-100">{title}</h3>
          <span className={`h-2.5 w-2.5 rounded-full ${colorDot}`} />
        </div>
        <span className="text-xs text-slate-500">{countLabel}</span>
      </div>
      <div className="flex items-center gap-2 text-sm text-slate-400">
        <span className="inline-flex h-2 w-2 rounded-full border border-slate-600" />
        <span>{emptyText}</span>
      </div>
    </div>
  );
}

function QuickActionRow({
  title,
  description,
  href,
}: {
  title: string;
  description: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group flex flex-col gap-1 rounded-xl border border-slate-800 bg-slate-950/50 px-3 py-2.5 hover:bg-slate-900 transition"
    >
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-slate-100 group-hover:text-white">
          {title}
        </p>
        <span className="text-[11px] text-slate-500 group-hover:text-emerald-300">
          →
        </span>
      </div>
      <p className="text-[11px] text-slate-500">{description}</p>
    </Link>
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
