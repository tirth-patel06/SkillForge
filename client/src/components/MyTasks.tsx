"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { api } from "@/lib/api";
import { Loader2, Trash2, Clock, AlertCircle, Circle, CheckCircle, RefreshCw } from "lucide-react";
import { TaskDetailPage } from "@/components/TaskDetailPage";

export type TaskStatus = "PENDING" | "ACTIVE" | "APPROVED" | "REJECTED" | "REMOVED";

export type TaskItem = {
  id: string;
  title: string;
  description?: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  techStack: string[];
  expectedTeamSize?: number;
  deadline: string | null;
  status: TaskStatus;
  createdAt: string;
  unreviewed?: number;
  attention?: {
    level: "critical" | "high" | "medium";
    reason: string;
  } | null;
};

const statusLabel: Record<TaskStatus, string> = {
  PENDING: "Pending",
  ACTIVE: "Active",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  REMOVED: "Removed",
};

const statusColor: Record<TaskStatus, string> = {
  PENDING: "text-amber-400",
  ACTIVE: "text-blue-400",
  APPROVED: "text-green-400",
  REJECTED: "text-red-400",
  REMOVED: "text-zinc-500",
};

function groupTasks(tasks: TaskItem[]) {
  return {
    ACTIVE: tasks.filter((t) => t.status === "ACTIVE"),
    PENDING: tasks.filter((t) => t.status === "PENDING"),
    APPROVED: tasks.filter((t) => t.status === "APPROVED"),
    OTHER: tasks.filter((t) => !["ACTIVE", "PENDING", "APPROVED"].includes(t.status)),
  };
}

export function MyTasks() {
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  const grouped = useMemo(() => groupTasks(tasks), [tasks]);

  const loadTasks = useCallback(async () => {
    try {
      if (tasks.length > 0) setRefreshing(true);
      else setLoading(true);
      setError(null);
      const { data } = await api.get<TaskItem[]>("/tasks");
      setTasks(data || []);
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error?.response?.data?.message || "Failed to load tasks");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [tasks.length]);

  useEffect(() => {
    loadTasks();
    // Auto-refresh every 30 seconds to update attention flags
    const interval = setInterval(() => {
      loadTasks();
    }, 30000);
    return () => clearInterval(interval);
  }, [loadTasks]);

  const handleManualRefresh = async () => {
    setRefreshing(true);
    await loadTasks();
  }

  async function removeTask(id: string) {
    setRemovingId(id);
    setError(null);
    try {
      await api.delete(`/tasks/${id}`);
      setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status: "REMOVED" } : t)));
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error?.response?.data?.message || "Failed to remove task");
    } finally {
      setRemovingId(null);
    }
  }

  async function approveTask(id: string) {
    setApprovingId(id);
    setError(null);
    try {
      await api.post(`/tasks/${id}/approve`);
      setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status: "APPROVED" } : t)));
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error?.response?.data?.message || "Failed to approve task");
    } finally {
      setApprovingId(null);
    }
  }

  const renderList = (items: TaskItem[], title: string, accent: string) => (
    <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold">{title}</h3>
        <span className="text-sm text-zinc-400">{items.length} tasks</span>
      </div>

      {items.length === 0 ? (
        <div className="text-sm text-zinc-500 flex items-center space-x-2">
          <Circle className={`w-4 h-4 ${accent}`} />
          <span>No tasks here yet.</span>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((task) => (
            <div
              key={task.id}
              onClick={() => {
                if (["PENDING", "ACTIVE", "APPROVED"].includes(task.status)) {
                  setSelectedTaskId(task.id);
                }
              }}
              className={`border border-zinc-800 rounded-lg p-3 transition-colors ${
                ["PENDING", "ACTIVE", "APPROVED"].includes(task.status)
                  ? "hover:border-zinc-600 cursor-pointer hover:bg-zinc-900/50"
                  : ""
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                    <span className="font-semibold">{task.title}</span>
                    <span className={`text-xs px-2 py-1 rounded-full border border-zinc-700 ${statusColor[task.status]}`}>
                      {statusLabel[task.status]}
                    </span>
                    {task.attention && (
                      <span
                        className={`text-xs px-2 py-1 rounded-full border flex items-center space-x-1 ${
                          task.attention.level === "critical"
                            ? "border-red-700 bg-red-950/30 text-red-400"
                            : task.attention.level === "high"
                            ? "border-orange-700 bg-orange-950/30 text-orange-400"
                            : "border-yellow-700 bg-yellow-950/30 text-yellow-400"
                        }`}
                        title={task.attention.reason}
                      >
                        <AlertCircle className="w-3 h-3" />
                        <span>Needs Attention</span>
                      </span>
                    )}
                    {task.unreviewed ? (
                      <span className="text-xs px-2 py-1 rounded-full border border-blue-700 bg-blue-950/30 text-blue-400">
                        {task.unreviewed} unreviewed
                      </span>
                    ) : null}
                  </div>
                  {task.description && (
                    <p className="text-sm text-zinc-400 line-clamp-2">{task.description}</p>
                  )}
                  <div className="text-xs text-zinc-500 flex items-center space-x-3">
                    <span className="uppercase tracking-wide">{task.difficulty}</span>
                    {task.techStack.length > 0 && (
                      <span>
                        {task.techStack.slice(0, 3).join(", ")}
                        {task.techStack.length > 3 ? "…" : ""}
                      </span>
                    )}
                    {task.expectedTeamSize && <span>Team: {task.expectedTeamSize}</span>}
                    {task.deadline && <span>Due: {new Date(task.deadline).toLocaleDateString()}</span>}
                  </div>
                </div>

                <div className="flex items-center space-x-2 ml-2">
                  {task.status === "ACTIVE" && (
                    <button
                      disabled={approvingId === task.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        approveTask(task.id);
                      }}
                      className="flex items-center space-x-2 text-sm text-green-400 hover:text-green-300 disabled:opacity-50 px-3 py-1 border border-green-700 rounded-lg hover:bg-green-900/20 transition-colors whitespace-nowrap"
                    >
                      {approvingId === task.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <CheckCircle className="w-4 h-4" />
                      )}
                      <span>{approvingId === task.id ? "Approving..." : "Approve"}</span>
                    </button>
                  )}
                  <button
                    disabled={removingId === task.id || task.status === "REMOVED"}
                    onClick={(e) => {
                      e.stopPropagation();
                      removeTask(task.id);
                    }}
                    className="flex items-center space-x-2 text-sm text-red-400 hover:text-red-300 disabled:opacity-50"
                  >
                    {removingId === task.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                    <span>{task.status === "REMOVED" ? "Removed" : "Remove"}</span>
                  </button>
                </div>
              </div>

              <div className="mt-2 text-xs text-zinc-500 flex items-center space-x-3">
                <span className="flex items-center space-x-1">
                  <Clock className="w-3 h-3" />
                  <span>Created {new Date(task.createdAt).toLocaleDateString()}</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center space-x-3 text-zinc-400">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Loading your tasks...</span>
        </div>
      </div>
    );
  }

  // If a task is selected, show the detail page
  if (selectedTaskId) {
    return (
      <TaskDetailPage
        taskId={selectedTaskId}
        onBack={() => setSelectedTaskId(null)}
      />
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-1">My Tasks</h2>
          <p className="text-zinc-400">View, manage, and remove tasks you&apos;ve created.</p>
        </div>
        <button
          onClick={handleManualRefresh}
          disabled={refreshing}
          className="flex items-center space-x-2 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 rounded-lg transition-colors disabled:opacity-50"
          title="Refresh task list and attention statuses"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          <span className="text-sm">{refreshing ? "Refreshing..." : "Refresh"}</span>
        </button>
      </div>

      {error && (
        <div className="flex items-center space-x-2 text-red-300 bg-red-950/40 border border-red-800 rounded-lg px-3 py-2">
          <AlertCircle className="w-4 h-4" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {renderList(grouped.ACTIVE, "Active", "text-blue-400")}
        {renderList(grouped.PENDING, "Pending", "text-amber-400")}
        {renderList(grouped.APPROVED, "Approved", "text-green-400")}
        {renderList(grouped.OTHER, "Other", "text-zinc-400")}
      </div>
    </div>
  );
}
