"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import { useEffect, useState } from "react";
import { meApi, logoutApi, type User } from "@/api/auth";

type TaskCategory = "ACTIVE" | "PENDING" | "APPROVED" | "OTHER";

interface Task {
  id: string;
  title: string;
  description: string;
  category: TaskCategory;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  type: string; // e.g. "demo", "web", etc.
  teamSize: number;
  dueDate: string; // display string for now
  createdAt: string; // display string
  removed?: boolean;
}

const mockTasks: Task[] = [
  {
    id: "1",
    title: "demom",
    description: "demo",
    category: "OTHER",
    difficulty: "MEDIUM",
    type: "demo",
    teamSize: 2,
    dueDate: "10/2/2026",
    createdAt: "8/12/2025",
    removed: true,
  },
  // you can add more mock tasks later or wire to backend
];

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
      localStorage.removeItem("token");
    } catch {
      // ignore for now
    } finally {
      window.location.href = "/auth";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-slate-200">
        <p className="text-sm">Loading your space…</p>
      </div>
    );
  }

  const activeTasks = mockTasks.filter((t) => t.category === "ACTIVE");
  const pendingTasks = mockTasks.filter((t) => t.category === "PENDING");
  const approvedTasks = mockTasks.filter((t) => t.category === "APPROVED");
  const otherTasks = mockTasks.filter((t) => t.category === "OTHER");

  return (
    <div className="min-h-screen bg-[#02040a] text-slate-100">
      {/* Top Bar */}
      <header className="border-b border-zinc-800 bg-black/80 backdrop-blur sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-5 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">🎓 Student Hub</h1>
            <p className="text-xs text-zinc-400">
              View and manage the tasks assigned to you.
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
                className="px-3 py-1.5 rounded-full text-xs font-medium bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 transition"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-5 py-8 space-y-6">
        {/* Page heading like screenshot */}
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight">My Tasks</h2>
          <p className="text-sm text-zinc-400">
            View, manage, and remove tasks you&apos;ve created.
          </p>
        </div>

        {/* 2x2 grid of status cards */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Active */}
          <StatusCard
            title="Active"
            dotColor="bg-blue-500"
            tasks={activeTasks}
            emptyText="No tasks here yet."
          />

          {/* Pending */}
          <StatusCard
            title="Pending"
            dotColor="bg-amber-400"
            tasks={pendingTasks}
            emptyText="No tasks here yet."
          />

          {/* Approved */}
          <StatusCard
            title="Approved"
            dotColor="bg-emerald-400"
            tasks={approvedTasks}
            emptyText="No tasks here yet."
          />

          {/* Other */}
          <StatusCard
            title="Other"
            dotColor="bg-zinc-500"
            tasks={otherTasks}
            emptyText="No tasks here yet."
            highlightOther
          />
        </section>
      </main>
    </div>
  );
}

/**
 * Card for each status column
 */
function StatusCard({
  title,
  dotColor,
  tasks,
  emptyText,
  highlightOther = false,
}: {
  title: string;
  dotColor: string;
  tasks: Task[];
  emptyText: string;
  highlightOther?: boolean;
}) {
  const countLabel = `${tasks.length} task${tasks.length === 1 ? "" : "s"}`;

  return (
    <div className="rounded-2xl border border-zinc-800 bg-[#050509] px-5 py-4 shadow-[0_0_0_1px_rgba(24,24,27,0.6)]">
      {/* Header row */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold">{title}</p>
          <span className={`w-2.5 h-2.5 rounded-full ${dotColor}`} />
        </div>
        <p className="text-xs text-zinc-400">{countLabel}</p>
      </div>

      {/* Body */}
      {tasks.length === 0 ? (
        <p className="flex items-center gap-2 text-xs text-zinc-500">
          <span className={`w-2.5 h-2.5 rounded-full border border-zinc-600`} />
          {emptyText}
        </p>
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => (
            <TaskRow key={task.id} task={task} highlightOther={highlightOther} />
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Single task row (used in "Other" to match screenshot)
 */
function TaskRow({ task, highlightOther }: { task: Task; highlightOther: boolean }) {
  return (
    <div
      className={`rounded-xl border ${
        highlightOther
          ? "border-zinc-800 bg-zinc-950"
          : "border-zinc-800 bg-zinc-900/60"
      } px-4 py-3 flex flex-col gap-1.5 text-xs`}
    >
      {/* Title + removed pill + trash icon */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-zinc-50">{task.title}</p>
          {task.removed && (
            <span className="px-2 py-0.5 rounded-full border border-zinc-700 text-[10px] uppercase tracking-[0.16em] text-zinc-300">
              Removed
            </span>
          )}
        </div>
        {task.removed && (
          <div className="flex items-center gap-1 text-[11px] text-red-400">
            {/* simple trash icon */}
            <span className="inline-flex items-center justify-center rounded-full border border-red-500/50 px-1.5 py-0.5">
              🗑
            </span>
            <span className="hidden sm:inline">Removed</span>
          </div>
        )}
      </div>

      {/* Description */}
      <p className="text-[11px] text-zinc-400">{task.description}</p>

      {/* Meta row: difficulty / type / team / due */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-zinc-500 mt-1">
        <span className="uppercase tracking-[0.16em]">
          {task.difficulty}
        </span>
        <span>{task.type}</span>
        <span>Team: {task.teamSize}</span>
        <span>Due: {task.dueDate}</span>
      </div>

      {/* Created at */}
      <div className="mt-2 flex items-center gap-1 text-[11px] text-zinc-500">
        <span>⏲</span>
        <span>Created {task.createdAt}</span>
      </div>
    </div>
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
