// src/api/studentTasks.ts
import { api } from "@/lib/api";

// same TaskStatus union as your Task model
export type TaskStatus = "PENDING" | "ACTIVE" | "APPROVED" | "REJECTED" | "REMOVED";

export type ActiveTaskItem = {
  id: string;
  title: string;
  description?: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  techStack: string[];
  expectedTeamSize?: number;
  deadline: string | null;
  status: TaskStatus;
  createdAt: string;
};

export type SubmissionStatus = "PENDING" | "APPROVED" | "CHANGES_REQUESTED";

export type EnrolledTaskItem = {
  submissionId: string;
  taskId: string;
  title: string;
  description?: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  techStack: string[];
  expectedTeamSize?: number;
  deadline: string | null;
  taskStatus: TaskStatus;          // from Task model
  submissionStatus: SubmissionStatus; // from Submission model
  githubUrl: string;
  workDescription: string;
  submittedAt: string | null;
  enrolledAt: string;
};

// Fetch active tasks for Explore tab
export async function fetchActiveTasks(params?: {
  search?: string;
  difficulty?: "EASY" | "MEDIUM" | "HARD";
  tech?: string;
}) {
  const { data } = await api.get<ActiveTaskItem[]>("/students/tasks/active", {
    params,
  });
  return data;
}

// Enroll current student into a task
export async function enrollInTask(taskId: string) {
  const { data } = await api.post(`/students/tasks/${taskId}/enroll`);
  return data;
}

// Get all tasks current student has submissions/enrollments for
export async function fetchEnrolledTasks() {
  const { data } = await api.get<EnrolledTaskItem[]>("/students/tasks/enrolled");
  return data;
}

// Submit or update work for a task
export async function submitWork(
  taskId: string,
  payload: { githubUrl: string; description: string }
) {
  const { data } = await api.post(`/students/tasks/${taskId}/submit`, payload);
  return data;
}
