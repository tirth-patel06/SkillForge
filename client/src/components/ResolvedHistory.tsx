"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import {
  Clock,
  Loader2,
  RefreshCw,
  ArrowLeft,
  ChevronDown,
} from "lucide-react";

interface ResolvedTask {
  _id: string;
  title: string;
  status: "PENDING" | "ACTIVE" | "REJECTED";
  difficulty: "EASY" | "MEDIUM" | "HARD";
  resolvedAt: string;
  resolutionNotes: string;
  criticalReason?: string;
  createdAt: string;
  updatedAt: string;
}

export function ResolvedHistory({ onBack }: { onBack?: () => void }) {
  const [tasks, setTasks] = useState<ResolvedTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    loadResolvedTasks();
  }, []);

  async function loadResolvedTasks() {
    try {
      setLoading(true);
      setError(null);
      const { data } = await api.get<ResolvedTask[]>("/tasks/resolved/history");
      setTasks(data || []);
    } catch (err) {
      const errorObj = err as { response?: { data?: { message?: string } } };
      setError(errorObj?.response?.data?.message || "Failed to load resolved tasks");
    } finally {
      setLoading(false);
    }
  }

  const handleManualRefresh = async () => {
    setRefreshing(true);
    await loadResolvedTasks();
    setRefreshing(false);
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

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center space-x-3 text-zinc-400">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Loading resolution history...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
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
          <h1 className="text-3xl font-bold mb-2 text-white">Resolution History</h1>
          <p className="text-zinc-400">
            {tasks.length} resolved issue{tasks.length !== 1 ? "s" : ""} in your records
          </p>
        </div>
        <button
          onClick={handleManualRefresh}
          disabled={refreshing}
          className="flex items-center space-x-2 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 rounded-lg transition-colors disabled:opacity-50"
          title="Refresh history"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          <span className="text-sm text-zinc-300">{refreshing ? "Refreshing..." : "Refresh"}</span>
        </button>
      </div>

      {error && (
        <div className="flex items-start space-x-3 text-red-200 bg-red-950/50 border border-red-800 rounded-lg px-4 py-4 mb-6">
          <Clock className="w-5 h-5 mt-0.5 shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {tasks.length === 0 ? (
        <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-12 text-center">
          <h3 className="text-xl font-semibold text-white mb-2">No Resolved Issues</h3>
          <p className="text-zinc-400">When you resolve critical issues, they will appear here with your resolution notes.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => (
            <div
              key={task._id}
              className="bg-zinc-950 border border-zinc-800 rounded-lg overflow-hidden hover:border-zinc-700 transition-colors"
            >
              {/* Task Row */}
              <button
                onClick={() => setExpandedId(expandedId === task._id ? null : task._id)}
                className="w-full text-left p-4 hover:bg-zinc-900/40 transition-colors flex items-center justify-between"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex-1">
                      <h3 className="text-base font-semibold text-white truncate">{task.title}</h3>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <span className={`text-xs px-2 py-1 rounded border ${getStatusColor(task.status)}`}>
                        {task.status}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded border font-medium ${getDifficultyBg(task.difficulty)} ${getDifficultyColor(task.difficulty)}`}>
                        {task.difficulty}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-4 text-xs text-zinc-400">
                    <span>Created: {new Date(task.createdAt).toLocaleDateString()}</span>
                    <span>Resolved: {new Date(task.resolvedAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <ChevronDown className={`w-4 h-4 text-zinc-400 ml-4 shrink-0 transition-transform ${expandedId === task._id ? "rotate-180" : ""}`} />
              </button>

              {/* Expanded Notes */}
              {expandedId === task._id && (
                <div className="border-t border-zinc-800 bg-zinc-900/30 p-4 space-y-4">
                  <div>
                    <h4 className="text-sm font-semibold text-white mb-2">Why It Was Critical</h4>
                    {task.criticalReason ? (
                      <p className="text-sm text-red-300 bg-red-950/30 border border-red-800/40 rounded px-3 py-2">{task.criticalReason}</p>
                    ) : (
                      <p className="text-sm text-zinc-500 bg-zinc-900/50 border border-zinc-800/40 rounded px-3 py-2 italic">Reason not recorded (resolved before tracking was added)</p>
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white mb-2">How It Was Resolved</h4>
                    <p className="text-sm text-zinc-300 whitespace-pre-wrap leading-relaxed">{task.resolutionNotes}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
