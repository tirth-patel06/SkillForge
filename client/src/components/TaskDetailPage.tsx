"use client";

import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { TaskComments } from "@/components/TaskComments";
import {
  Calendar,
  Users,
  Award,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Edit2,
} from "lucide-react";

interface TaskDetail {
  _id: string;
  title: string;
  description: string;
  status: "PENDING" | "ACTIVE" | "APPROVED" | "REJECTED" | "REMOVED";
  category: string;
  difficultyLevel: "EASY" | "MEDIUM" | "HARD";
  skillsRequired: string[];
  estimatedHours: number;
  mentorId: string;
  enrolledStudents: string[];
  submissions: any[];
  rubric?: {
    criteria: Array<{
      name: string;
      maxPoints: number;
      description: string;
    }>;
  };
  createdAt: string;
  updatedAt: string;
}

interface TaskDetailPageProps {
  taskId: string;
  onBack?: () => void;
}

export function TaskDetailPage({ taskId, onBack }: TaskDetailPageProps) {
  const [task, setTask] = useState<TaskDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTaskDetail();
  }, [taskId]);

  const fetchTaskDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get(`/tasks/${taskId}`);
      if (res.data.task) {
        setTask(res.data.task);
      }
    } catch (err) {
      console.error("Error fetching task:", err);
      setError("Failed to load task details");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-900/30 text-green-400 border-green-700";
      case "PENDING":
        return "bg-yellow-900/30 text-yellow-400 border-yellow-700";
      case "APPROVED":
        return "bg-blue-900/30 text-blue-400 border-blue-700";
      case "REJECTED":
        return "bg-red-900/30 text-red-400 border-red-700";
      case "REMOVED":
        return "bg-gray-900/30 text-gray-400 border-gray-700";
      default:
        return "bg-zinc-800 text-zinc-400";
    }
  };

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case "EASY":
        return "text-green-400";
      case "MEDIUM":
        return "text-yellow-400";
      case "HARD":
        return "text-red-400";
      default:
        return "text-zinc-400";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="bg-red-900/30 border border-red-700 rounded-lg p-4 text-red-400">
        {error || "Task not found"}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        {onBack && (
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-zinc-400 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
        )}
      </div>

      {/* Task Overview */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-white mb-2">{task.title}</h1>
            <div className="flex flex-wrap gap-3 items-center">
              <span
                className={`px-3 py-1 rounded-full text-sm border ${getStatusColor(
                  task.status
                )}`}
              >
                {task.status}
              </span>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(
                  task.difficultyLevel
                )}`}
              >
                {task.difficultyLevel}
              </span>
              <span className="px-3 py-1 rounded-full text-sm bg-zinc-800 text-zinc-300">
                {task.category}
              </span>
            </div>
          </div>
          <button className="p-2 hover:bg-zinc-900 rounded transition-colors">
            <Edit2 className="w-5 h-5 text-zinc-400 hover:text-white" />
          </button>
        </div>

        {/* Task Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-zinc-800">
          <div className="flex items-center space-x-3">
            <Users className="w-5 h-5 text-blue-400" />
            <div>
              <p className="text-xs text-zinc-500">Enrolled Students</p>
              <p className="text-lg font-bold text-white">
                {task.enrolledStudents?.length || 0}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Award className="w-5 h-5 text-yellow-400" />
            <div>
              <p className="text-xs text-zinc-500">Estimated Hours</p>
              <p className="text-lg font-bold text-white">
                {task.estimatedHours}h
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <div>
              <p className="text-xs text-zinc-500">Submissions</p>
              <p className="text-lg font-bold text-white">
                {task.submissions?.length || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-6">
        <h2 className="text-xl font-bold text-white mb-3">Description</h2>
        <p className="text-zinc-300 whitespace-pre-wrap">{task.description}</p>
      </div>

      {/* Skills Required */}
      {task.skillsRequired && task.skillsRequired.length > 0 && (
        <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-6">
          <h2 className="text-xl font-bold text-white mb-3">Skills Required</h2>
          <div className="flex flex-wrap gap-2">
            {task.skillsRequired.map((skill, idx) => (
              <span
                key={idx}
                className="px-3 py-1 bg-blue-900/30 text-blue-400 rounded-full text-sm border border-blue-700"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Rubric */}
      {task.rubric && task.rubric.criteria && task.rubric.criteria.length > 0 && (
        <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-6">
          <h2 className="text-xl font-bold text-white mb-4">Evaluation Rubric</h2>
          <div className="space-y-3">
            {task.rubric.criteria.map((criterion, idx) => (
              <div key={idx} className="bg-zinc-900/50 rounded-lg p-3 border border-zinc-800">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-white">{criterion.name}</h3>
                  <span className="text-sm text-zinc-400">
                    {criterion.maxPoints} points
                  </span>
                </div>
                <p className="text-xs text-zinc-400">{criterion.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Comments Section */}
      <TaskComments taskId={taskId} taskTitle={task.title} />

      {/* Task Timeline */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-6">
        <h2 className="text-xl font-bold text-white mb-4">Timeline</h2>
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <Calendar className="w-5 h-5 text-zinc-400" />
            <div>
              <p className="text-xs text-zinc-500">Created</p>
              <p className="text-white">
                {new Date(task.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Calendar className="w-5 h-5 text-zinc-400" />
            <div>
              <p className="text-xs text-zinc-500">Last Updated</p>
              <p className="text-white">
                {new Date(task.updatedAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
