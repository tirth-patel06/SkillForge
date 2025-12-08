"use client";

import { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import {
  AlertCircle,
  Clock,
  CheckCircle,
  AlertTriangle,
  Loader2,
  RefreshCw,
  ArrowLeft,
  X,
} from "lucide-react";

interface CriticalTask {
  id: string;
  title: string;
  status: "PENDING" | "ACTIVE" | "REJECTED";
  difficultyLevel: "EASY" | "MEDIUM" | "HARD";
  createdAt: string;
  unreviewed?: number;
  attention?: {
    level: "critical";
    reason: string;
  };
  daysPending?: number;
}

export function AttentionRequired({ onBack }: { onBack?: () => void }) {
  const [tasks, setTasks] = useState<CriticalTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resolveModal, setResolveModal] = useState<{ taskId: string; taskTitle: string; criticalReason: string } | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadCriticalTasks = useCallback(async () => {
    try {
      if (tasks.length > 0) setRefreshing(true);
      else setLoading(true);
      setError(null);
      const { data } = await api.get<CriticalTask[]>("/tasks");
      // Filter only critical attention tasks
      const criticalTasks = (data || []).filter(
        (task) => task.attention && task.attention.level === "critical"
      );
      setTasks(criticalTasks);
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error?.response?.data?.message || "Failed to load critical tasks");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [tasks.length]);

  useEffect(() => {
    loadCriticalTasks();
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      loadCriticalTasks();
    }, 30000);
    return () => clearInterval(interval);
  }, [loadCriticalTasks]);

  const handleManualRefresh = async () => {
    setRefreshing(true);
    await loadCriticalTasks();
  };

  const handleResolveClick = (taskId: string, taskTitle: string, criticalReason: string) => {
    setResolveModal({ taskId, taskTitle, criticalReason });
    setResolutionNotes("");
  };

  const handleResolveSubmit = async () => {
    if (!resolutionNotes.trim()) {
      setError("Please enter resolution notes before submitting");
      return;
    }

    try {
      setSubmitting(true);
      await api.post(`/tasks/${resolveModal?.taskId}/resolve`, {
        resolutionNotes: resolutionNotes.trim(),
        criticalReason: resolveModal?.criticalReason,
      });

      // Remove task from list
      setTasks(tasks.filter((t) => t.id !== resolveModal?.taskId));
      setResolveModal(null);
      setResolutionNotes("");
      setError(null);
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error?.response?.data?.message || "Failed to resolve issue");
    } finally {
      setSubmitting(false);
    }
  };

  const getCriticalReasonText = (task: CriticalTask): string => {
    if (task.attention?.reason) {
      return task.attention.reason;
    }
    // Fallback reasons based on task status
    if (task.status === "REJECTED") {
      return "Task rejected by admin - needs revision";
    }
    if (task.status === "PENDING") {
      return `Pending approval for ${task.daysPending || 0} days`;
    }
    return "Critical issue identified";
  };

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case "EASY":
        return "text-emerald-300";
      case "MEDIUM":
        return "text-amber-300";
      case "HARD":
        return "text-red-300";
      default:
        return "text-zinc-300";
    }
  };

  const getDifficultyBg = (level: string) => {
    switch (level) {
      case "EASY":
        return "bg-emerald-950 border-emerald-800";
      case "MEDIUM":
        return "bg-amber-950 border-amber-800";
      case "HARD":
        return "bg-red-950 border-red-800";
      default:
        return "bg-zinc-900 border-zinc-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-blue-950 text-blue-300 border-blue-800";
      case "PENDING":
        return "bg-amber-950 text-amber-300 border-amber-800";
      case "REJECTED":
        return "bg-red-950 text-red-300 border-red-800";
      default:
        return "bg-zinc-900 text-zinc-300";
    }
  };

  const getCriticalIcon = (reason: string) => {
    if (reason.includes("rejected")) return "❌";
    if (reason.includes("unreviewed")) return "📋";
    if (reason.includes("Pending")) return "⏰";
    return "⚠️";
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center space-x-3 text-zinc-400">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Loading critical issues...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          {onBack && (
            <button
              onClick={onBack}
              className="flex items-center space-x-2 text-zinc-400 hover:text-zinc-200 transition-colors mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          )}
          <h1 className="text-4xl font-bold mb-2 text-white">Critical Issues</h1>
          <p className="text-zinc-400">
            {tasks.length} critical issue{tasks.length !== 1 ? "s" : ""} requiring immediate follow-up
          </p>
        </div>
        <button
          onClick={handleManualRefresh}
          disabled={refreshing}
          className="flex items-center space-x-2 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 rounded-lg transition-colors disabled:opacity-50"
          title="Refresh critical issues"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          <span className="text-sm text-zinc-300">{refreshing ? "Refreshing..." : "Refresh"}</span>
        </button>
      </div>

      {error && (
        <div className="flex items-start space-x-3 text-red-200 bg-red-950/50 border border-red-800 rounded-lg px-4 py-4 mb-6">
          <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {tasks.length === 0 ? (
        <div className="bg-linear-to-br from-zinc-950 to-zinc-900 border border-emerald-800/40 rounded-xl p-12 text-center">
          <CheckCircle className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
          <h3 className="text-2xl font-semibold text-white mb-2">All Clear!</h3>
          <p className="text-zinc-400 text-lg">No critical issues requiring attention at the moment.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="bg-linear-to-r from-zinc-950 to-zinc-900 border border-red-800/60 rounded-xl p-6 hover:border-red-700 transition-all hover:shadow-lg hover:shadow-red-900/20"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  {/* Title with Icon */}
                  <div className="flex items-start space-x-3 mb-3">
                    <span className="text-3xl">{getCriticalIcon(task.attention?.reason || "")}</span>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white leading-tight">{task.title}</h3>
                    </div>
                  </div>

                  {/* Status and Difficulty Badges */}
                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    <span className={`text-xs px-3 py-1.5 rounded-full border font-semibold ${getStatusColor(task.status)}`}>
                      {task.status}
                    </span>
                    <span className={`text-xs px-3 py-1.5 rounded-full border font-semibold ${getDifficultyBg(task.difficultyLevel)} ${getDifficultyColor(task.difficultyLevel)}`}>
                      {task.difficultyLevel}
                    </span>
                  </div>

                  {/* Critical Reason Alert */}
                  <div className="flex items-start space-x-2 bg-red-950/40 border border-red-800/60 rounded-lg px-4 py-3 mb-4">
                    <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5 shrink-0" />
                    <span className="text-sm text-red-200 font-medium">{task.attention?.reason}</span>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                    {/* Created Date */}
                    <div className="flex items-center space-x-2 bg-zinc-900/50 border border-zinc-800 rounded-lg px-3 py-2">
                      <Clock className="w-4 h-4 text-zinc-400" />
                      <span className="text-sm text-zinc-300">
                        Created {new Date(task.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    {/* Days Pending */}
                    {task.status === "PENDING" && (
                      <div className="flex items-center space-x-2 bg-amber-950/30 border border-amber-800/50 rounded-lg px-3 py-2">
                        <Clock className="w-4 h-4 text-amber-400" />
                        <span className="text-sm font-semibold text-amber-300">
                          Pending {Math.floor(
                            (new Date().getTime() - new Date(task.createdAt).getTime()) /
                              (1000 * 60 * 60 * 24)
                          )} days
                        </span>
                      </div>
                    )}

                    {/* Unreviewed Submissions */}
                    {task.unreviewed && task.unreviewed > 0 && (
                      <div className="flex items-center space-x-2 bg-blue-950/30 border border-blue-800/50 rounded-lg px-3 py-2">
                        <CheckCircle className="w-4 h-4 text-blue-400" />
                        <span className="text-sm font-semibold text-blue-300">
                          {task.unreviewed} submission{task.unreviewed !== 1 ? "s" : ""} waiting
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Button */}
                <button
                  onClick={() => handleResolveClick(task.id, task.title, getCriticalReasonText(task))}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold transition-colors whitespace-nowrap shadow-lg hover:shadow-emerald-900/30"
                >
                  Resolve
                </button>
              </div>

              {/* Context Based on Issue Type */}
              <div className="pt-4 border-t border-zinc-800">
                {task.status === "REJECTED" && (
                  <div className="text-sm text-red-200 bg-red-950/20 border border-red-800/40 p-3 rounded font-medium">
                    📌 <strong>Action Required:</strong> Admin rejected your task. Review feedback, make revisions, and resubmit.
                  </div>
                )}
                {task.status === "PENDING" && (
                  <div className="text-sm text-amber-200 bg-amber-950/20 border border-amber-800/40 p-3 rounded font-medium">
                    📌 <strong>Action Required:</strong> Task awaiting admin approval. Follow up or improve before resubmitting.
                  </div>
                )}
                {task.status === "ACTIVE" && task.unreviewed && task.unreviewed >= 5 && (
                  <div className="text-sm text-blue-200 bg-blue-950/20 border border-blue-800/40 p-3 rounded font-medium">
                    📌 <strong>Action Required:</strong> Review pending student submissions to provide timely feedback.
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary Footer */}
      {tasks.length > 0 && (
        <div className="mt-8 bg-linear-to-r from-zinc-950 to-zinc-900 border border-zinc-800 rounded-xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-red-950/30 border border-red-800/60 rounded-lg p-4">
              <div className="text-sm text-zinc-400 mb-1 font-medium">Rejected Tasks</div>
              <div className="text-3xl font-bold text-red-300">
                {tasks.filter((t) => t.status === "REJECTED").length}
              </div>
            </div>
            <div className="bg-amber-950/30 border border-amber-800/60 rounded-lg p-4">
              <div className="text-sm text-zinc-400 mb-1 font-medium">Long Pending</div>
              <div className="text-3xl font-bold text-amber-300">
                {tasks.filter((t) => t.status === "PENDING").length}
              </div>
            </div>
            <div className="bg-blue-950/30 border border-blue-800/60 rounded-lg p-4">
              <div className="text-sm text-zinc-400 mb-1 font-medium">Submissions Waiting</div>
              <div className="text-3xl font-bold text-blue-300">
                {tasks.reduce((sum, t) => sum + (t.unreviewed || 0), 0)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Resolve Modal */}
      {resolveModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 max-w-2xl w-full shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-white">Resolve Critical Issue</h2>
                <p className="text-zinc-400 text-sm mt-1">{resolveModal.taskTitle}</p>
              </div>
              <button
                onClick={() => setResolveModal(null)}
                className="p-2 hover:bg-zinc-900 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-zinc-400 hover:text-white" />
              </button>
            </div>

            {/* Alert */}
            <div className="flex items-start space-x-2 bg-amber-950/40 border border-amber-800/60 rounded-lg px-4 py-3 mb-4">
              <AlertTriangle className="w-5 h-5 text-amber-400 mt-0.5 shrink-0" />
              <span className="text-sm text-amber-200">
                <strong>Note:</strong> Please provide detailed information on how this critical issue was resolved. This will help maintain a history of actions taken.
              </span>
            </div>

            {/* Critical Reason Display */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg px-4 py-3 mb-4">
              <p className="text-xs text-zinc-400 mb-1">Why it became critical:</p>
              <p className="text-sm text-red-300 font-medium">{resolveModal.criticalReason}</p>
            </div>

            {/* Notes Input */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-white mb-2">
                How did you resolve this issue?
                <span className="text-red-400">*</span>
              </label>
              <textarea
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                placeholder="Describe the steps taken to resolve this critical issue. Include any communication with admin, changes made to the task, submissions reviewed, etc."
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 resize-none"
                rows={6}
              />
              <p className="text-xs text-zinc-400 mt-2">
                Minimum: 10 characters | Current: {resolutionNotes.length} characters
              </p>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setResolveModal(null)}
                disabled={submitting}
                className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 rounded-lg text-sm font-semibold text-zinc-300 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleResolveSubmit}
                disabled={submitting || resolutionNotes.trim().length < 10}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 flex items-center space-x-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <span>Resolve & Save Notes</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

