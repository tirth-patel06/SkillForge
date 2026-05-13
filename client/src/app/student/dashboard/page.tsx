// client/src/app/student/dashboard/page.tsx
"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import { useEffect, useState } from "react";
import Link from "next/link";
import { meApi } from "@/api/auth";
import { fetchEnrolledTasks, EnrolledTaskItem } from "@/api/studentTasks";
import ContributionDashboard from "@/components/contribution/ContributionDashboard";
import { api } from "@/lib/api";

type ReferralSummary = {
  id: string;
  status: string;
};
function StudentDashboardInner() {
  const [loading, setLoading] = useState(true);
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-zinc-200">
        <p className="text-sm">Loading your space…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-zinc-100">
      <main className="max-w-6xl mx-auto px-4 py-6 space-y-8">
        {/* PAGE TITLE */}
        <section className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
            Dashboard
          </h1>
          <p className="text-sm text-zinc-400">
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
              accent="from-orange-500 to-red-500"
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
              accent="from-blue-500 to-cyan-500"
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
              accent="from-yellow-500 to-orange-500"
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
              accent="from-green-500 to-emerald-500"
              icon="📨"
            />
          </section>

          {/* QUICK NAVIGATION (Profile / Tasks) */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-zinc-200">
                Quick navigation
              </h2>
              <span className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">
                STUDENT TOOLS
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <DashboardCard
                title="My Profile"
                description="Edit your bio, education, skills and social links."
                href="/student/profile"
                accent="from-purple-500/30 to-pink-500/20"
                pill="Profile"
              />
              <DashboardCard
                title="My Tasks"
                description="Browse active tasks and submit your work."
                href="/student/tasks"
                accent="from-blue-500/30 to-cyan-500/20"
                pill="Tasks"
              />
              <DashboardCard
                title="Contributions"
                description="Track your activity, badges, and progress."
                href="/student/contribution"
                accent="from-emerald-500/30 to-teal-500/20"
                pill="Contributions"
              />
            </div>
          </section>
          <ContributionDashboard />
      </main>
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
    <div className="relative rounded-2xl border border-zinc-800 bg-zinc-950 p-4 shadow-[0_20px_60px_rgba(0,0,0,0.9)] overflow-hidden hover:border-zinc-700 transition">
      <div className="relative flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl text-2xl">
            {icon}
          </div>
          <span className="text-[11px] text-zinc-500 uppercase tracking-[0.16em]">
            Overview
          </span>
        </div>
        <div>
          <p className="text-xs text-zinc-400">{title}</p>
          <p className="mt-2 text-3xl font-bold text-white">{value}</p>
          <p className="mt-1 text-[11px] text-zinc-500">{subtitle}</p>
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
      className="group relative overflow-hidden rounded-2xl border border-zinc-800 bg-linear-to-br from-zinc-950 via-zinc-900 to-zinc-950 p-5 shadow-[0_18px_50px_rgba(0,0,0,0.9)] hover:shadow-[0_24px_80px_rgba(0,0,0,1)] transition-all duration-300 transform hover:-translate-y-[2px] hover:border-zinc-700"
    >
      <div
        className={`pointer-events-none absolute inset-0 bg-linear-to-br ${accent} opacity-0 group-hover:opacity-100 transition duration-300`}
      />
      <div className="relative space-y-2">
        <span className="inline-flex items-center rounded-full border border-zinc-700/80 bg-zinc-950/80 px-2 py-0.5 text-[10px] uppercase tracking-[0.16em] text-zinc-400 group-hover:border-zinc-600 group-hover:text-zinc-300 transition duration-300">
          {pill}
        </span>
        <h3 className="text-base font-semibold text-zinc-100 group-hover:text-white transition duration-300">{title}</h3>
        <p className="text-xs text-zinc-400 leading-relaxed group-hover:text-zinc-300 transition duration-300">
          {description}
        </p>
        <span className="inline-flex items-center text-[11px] font-medium text-zinc-300 group-hover:text-zinc-100 transition duration-300">
          Explore
          <span className="ml-1 translate-x-0.5 group-hover:translate-x-1 transition duration-300">
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
    <div className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 p-4 shadow-[0_20px_60px_rgba(0,0,0,0.9)] hover:-translate-y-[1px] transition">
      <div
        className={`pointer-events-none absolute inset-x-0 -top-10 h-20 bg-linear-to-br ${accent} opacity-30`}
      />

      <div className="relative flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-xs text-zinc-400">{title}</p>
          <p className="text-xl font-semibold text-zinc-50">{value}</p>
          <p className="text-[11px] text-zinc-500">{subtitle}</p>
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
