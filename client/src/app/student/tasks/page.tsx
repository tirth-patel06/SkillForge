"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import {
  ActiveTaskItem,
  EnrolledTaskItem,
  fetchActiveTasks,
  fetchEnrolledTasks,
  enrollInTask,
  submitWork,
  SubmissionStatus,
} from "@/api/studentTasks";
import { TaskComments } from "@/components/TaskComments";

type Tab = "explore" | "enrolled";

function StudentTasksInner() {
  const [tab, setTab] = useState<Tab>("explore");

  // Explore tab state
  const [activeTasks, setActiveTasks] = useState<ActiveTaskItem[]>([]);
  const [loadingActive, setLoadingActive] = useState(false);
  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState<"ALL" | "EASY" | "MEDIUM" | "HARD">(
    "ALL"
  );
  const [tech, setTech] = useState("");
  const [selectedActiveTask, setSelectedActiveTask] =
    useState<ActiveTaskItem | null>(null);

  // Enrolled tab state
  const [enrolledTasks, setEnrolledTasks] = useState<EnrolledTaskItem[]>([]);
  const [loadingEnrolled, setLoadingEnrolled] = useState(false);
  const [submittingId, setSubmittingId] = useState<string | null>(null);

  // Load ACTIVE tasks
  const loadActive = async () => {
    try {
      setLoadingActive(true);
      const params: any = {};
      if (search.trim()) params.search = search.trim();
      if (tech.trim()) params.tech = tech.trim();
      if (difficulty !== "ALL") params.difficulty = difficulty;

      const data = await fetchActiveTasks(params);
      setActiveTasks(data);
      if (!selectedActiveTask && data.length > 0) {
        setSelectedActiveTask(data[0]);
      }
    } catch (err) {
      console.error("Failed to load active tasks", err);
    } finally {
      setLoadingActive(false);
    }
  };

  // Load enrolled tasks
  const loadEnrolled = async () => {
    try {
      setLoadingEnrolled(true);
      const data = await fetchEnrolledTasks();
      setEnrolledTasks(data);
    } catch (err) {
      console.error("Failed to load enrolled tasks", err);
    } finally {
      setLoadingEnrolled(false);
    }
  };

  // Initial load for Explore tab (active tasks)
  useEffect(() => {
    loadActive();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [difficulty, tech]);

  // Also load enrolled tasks once (so Explore can know what is already enrolled)
  useEffect(() => {
    loadEnrolled();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // When switching to Enrolled tab, refresh them
  useEffect(() => {
    if (tab === "enrolled") {
      loadEnrolled();
    }
  }, [tab]);

  // Enroll into a task
  const handleEnroll = async (task: ActiveTaskItem) => {
    try {
      await enrollInTask(task.id);
      alert("Enrolled in task ✨");
      await loadEnrolled(); // refresh enrolled so button gets disabled
    } catch (err: any) {
      console.error("Enroll error", err);
      alert(
        err?.response?.data?.message ||
          "Could not enroll in this task. Maybe you already enrolled?"
      );
    }
  };

  // Submit or update work
  const handleSubmitWork = async (
    item: EnrolledTaskItem,
    githubUrl: string,
    description: string
  ) => {
    if (!githubUrl || !description) {
      alert("GitHub URL and description are required.");
      return;
    }

    try {
      setSubmittingId(item.submissionId);
      await submitWork(item.taskId, { githubUrl, description });
      alert("Work submitted! Your mentor will review it.");
      loadEnrolled();
    } catch (err) {
      console.error("Submit work error", err);
      alert("Failed to submit work.");
    } finally {
      setSubmittingId(null);
    }
  };

  const activeCount = activeTasks.length;
  const enrolledCount = enrolledTasks.length;
  const enrolledTaskIds = enrolledTasks.map((t) => t.taskId);

  return (
    <div className="min-h-screen flex flex-col bg-[#02040b] text-slate-100">
      {/* Header + Tabs */}
      <header className="border-b border-slate-900 px-6 py-4 flex items-center justify-between bg-gradient-to-b from-black/80 via-[#020617] to-transparent backdrop-blur-md">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-black/60 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-slate-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Student Tasks</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
            My Tasks & Projects
          </h1>
          <p className="text-sm text-slate-400 max-w-xl">
            Explore mentor-assigned tasks, enroll, and submit your work with
            GitHub links and discussions.
          </p>
        </div>

        {/* Small stats + tabs */}
        <div className="flex flex-col items-end gap-3">
          <div className="hidden sm:flex items-center gap-3 text-[11px] text-slate-400">
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-900/80 px-2.5 py-1 border border-slate-800">
              <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
              <span>Active: {activeCount}</span>
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-900/80 px-2.5 py-1 border border-slate-800">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              <span>Enrolled: {enrolledCount}</span>
            </span>
          </div>

          <div className="flex bg-slate-900/80 rounded-full p-1 gap-2 border border-slate-800">
            <button
              onClick={() => setTab("explore")}
              className={`px-4 py-1.5 text-xs md:text-sm rounded-full transition ${
                tab === "explore"
                  ? "bg-slate-100 text-slate-900 shadow-sm"
                  : "text-slate-300 hover:text-slate-100"
              }`}
            >
              Explore Tasks
            </button>
            <button
              onClick={() => setTab("enrolled")}
              className={`px-4 py-1.5 text-xs md:text-sm rounded-full transition ${
                tab === "enrolled"
                  ? "bg-slate-100 text-slate-900 shadow-sm"
                  : "text-slate-300 hover:text-slate-100"
              }`}
            >
              Enrolled & Submissions
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        {tab === "explore" ? (
          <ExploreView
            tasks={activeTasks}
            loading={loadingActive}
            search={search}
            setSearch={setSearch}
            difficulty={difficulty}
            setDifficulty={setDifficulty}
            tech={tech}
            setTech={setTech}
            onSearch={loadActive}
            selected={selectedActiveTask}
            setSelected={setSelectedActiveTask}
            onEnroll={handleEnroll}
            enrolledTaskIds={enrolledTaskIds}
          />
        ) : (
          <EnrolledView
            items={enrolledTasks}
            loading={loadingEnrolled}
            submittingId={submittingId}
            onSubmitWork={handleSubmitWork}
          />
        )}
      </main>
    </div>
  );
}

function difficultyBadgeClass(level: "EASY" | "MEDIUM" | "HARD") {
  switch (level) {
    case "EASY":
      return "bg-emerald-500/10 text-emerald-300 border-emerald-500/40";
    case "MEDIUM":
      return "bg-amber-500/10 text-amber-300 border-amber-500/40";
    case "HARD":
      return "bg-rose-500/10 text-rose-300 border-rose-500/40";
    default:
      return "bg-slate-800 text-slate-300 border-slate-700";
  }
}

function ExploreView({
  tasks,
  loading,
  search,
  setSearch,
  difficulty,
  setDifficulty,
  tech,
  setTech,
  onSearch,
  selected,
  setSelected,
  onEnroll,
  enrolledTaskIds,
}: {
  tasks: ActiveTaskItem[];
  loading: boolean;
  search: string;
  setSearch: (v: string) => void;
  difficulty: "ALL" | "EASY" | "MEDIUM" | "HARD";
  setDifficulty: (v: "ALL" | "EASY" | "MEDIUM" | "HARD") => void;
  tech: string;
  setTech: (v: string) => void;
  onSearch: () => void;
  selected: ActiveTaskItem | null;
  setSelected: (t: ActiveTaskItem | null) => void;
  onEnroll: (t: ActiveTaskItem) => void;
  enrolledTaskIds: string[];
}) {
  const isSelectedEnrolled =
    !!selected && enrolledTaskIds.includes(selected.id);

  return (
    <>
      {/* LEFT: Filters + Active Task List */}
      <section className="w-full md:w-[45%] border-r border-slate-900 flex flex-col bg-[#050816]">
        {/* Filters */}
        <div className="px-4 py-3 border-b border-slate-900 space-y-3 bg-gradient-to-b from-slate-950/80 to-slate-950/40">
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative flex-1">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by title or keywords…"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-sky-500/70 placeholder:text-slate-500"
              />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-slate-500">
                ⌘K
              </span>
            </div>
            <button
              onClick={onSearch}
              className="px-4 py-2.5 text-sm rounded-lg bg-sky-500 hover:bg-sky-400 text-black font-medium shadow-[0_0_0_1px_rgba(56,189,248,0.3)]"
            >
              Search
            </button>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <select
              value={difficulty}
              onChange={(e) =>
                setDifficulty(
                  e.target.value as "ALL" | "EASY" | "MEDIUM" | "HARD"
                )
              }
              className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200"
            >
              <option value="ALL">All difficulties</option>
              <option value="EASY">Easy</option>
              <option value="MEDIUM">Medium</option>
              <option value="HARD">Hard</option>
            </select>
            <input
              value={tech}
              onChange={(e) => setTech(e.target.value)}
              placeholder="Filter by tech (e.g. React, Node)…"
              className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder:text-slate-500"
            />
          </div>
        </div>

        {/* Task List */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
          {loading && (
            <div className="space-y-2">
              <div className="h-20 rounded-xl bg-slate-900/70 border border-slate-800 animate-pulse" />
              <div className="h-20 rounded-xl bg-slate-900/70 border border-slate-800 animate-pulse" />
            </div>
          )}

          {!loading && tasks.length === 0 && (
            <div className="flex flex-col items-center justify-center py-10 text-center text-slate-500 text-sm gap-2">
              <div className="h-10 w-10 rounded-full bg-slate-900 flex items-center justify-center text-lg">
                🔍
              </div>
              <p>No active tasks found.</p>
              <p className="text-[11px] text-slate-500">
                Try changing difficulty or clearing tech filters.
              </p>
            </div>
          )}

          {!loading &&
            tasks.map((task) => {
              const isEnrolled = enrolledTaskIds.includes(task.id);
              return (
                <button
                  key={task.id}
                  onClick={() => setSelected(task)}
                  className={`w-full text-left rounded-xl border px-3.5 py-3 text-sm transition transform
                ${
                  selected?.id === task.id
                    ? "border-sky-500/80 bg-slate-950 shadow-[0_18px_40px_rgba(15,23,42,0.9)] scale-[1.01]"
                    : "border-slate-800 bg-black/80 hover:border-slate-600 hover:bg-slate-950/80 hover:scale-[1.01]"
                }`}
                >
                  <div className="flex justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-slate-100 line-clamp-1">
                          {task.title}
                        </h3>
                        {isEnrolled && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/40">
                            Enrolled
                          </span>
                        )}
                      </div>
                      {task.description && (
                        <p className="text-xs text-slate-400 line-clamp-2">
                          {task.description}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-1 mt-1">
                        {task.techStack.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 rounded-full bg-slate-900 text-[11px] text-slate-200 border border-slate-800"
                          >
                            {tag}
                          </span>
                        ))}
                        {task.techStack.length > 3 && (
                          <span className="text-[11px] text-slate-500">
                            +{task.techStack.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span
                        className={`text-[11px] px-2 py-0.5 rounded-full border ${difficultyBadgeClass(
                          task.difficulty
                        )}`}
                      >
                        {task.difficulty}
                      </span>
                      {task.deadline && (
                        <span className="text-[11px] text-slate-500">
                          Due {new Date(task.deadline).toLocaleDateString()}
                        </span>
                      )}
                      <span className="text-[10px] text-slate-600">
                        {new Date(task.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
        </div>
      </section>

      {/* RIGHT: Task Details + Enroll Button (desktop) */}
      <section className="hidden md:flex flex-1 flex-col bg-[#020617]">
        {selected ? (
          <div className="h-full flex flex-col">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-900 flex justify-between items-start gap-3 bg-gradient-to-r from-slate-950 via-slate-900/70 to-slate-950">
              <div className="space-y-1">
                <h2 className="text-lg md:text-xl font-semibold text-slate-50">
                  {selected.title}
                </h2>
                <p className="text-xs text-slate-400 max-w-2xl">
                  Review the full details, then enroll to start working on this
                  task.
                </p>
              </div>
              <div className="flex flex-col items-end gap-2">
                {selected.deadline && (
                  <div className="text-right text-[11px] text-slate-400">
                    <p className="uppercase tracking-[0.16em] text-slate-500">
                      Deadline
                    </p>
                    <p>{new Date(selected.deadline).toLocaleString()}</p>
                  </div>
                )}
                <span
                  className={`text-[11px] px-2 py-0.5 rounded-full border ${difficultyBadgeClass(
                    selected.difficulty
                  )}`}
                >
                  {selected.difficulty} task
                </span>
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5 text-sm">
              {selected.description && (
                <section className="rounded-2xl border border-slate-900 bg-slate-950/60 p-4 space-y-2">
                  <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-[0.16em]">
                    Description
                  </h3>
                  <p className="text-slate-200 whitespace-pre-wrap leading-relaxed">
                    {selected.description}
                  </p>
                </section>
              )}

              {selected.techStack.length > 0 && (
                <section className="rounded-2xl border border-slate-900 bg-slate-950/40 p-4 space-y-2">
                  <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-[0.16em]">
                    Tech Stack
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {selected.techStack.map((tag) => (
                      <span
                        key={tag}
                        className="px-2.5 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-[11px] text-slate-100"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </section>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-3 border-t border-slate-900 flex items-center justify-between bg-black/60 backdrop-blur">
              <p className="text-[11px] text-slate-500 max-w-sm">
                Enroll to link this task with your student space and start
                collaborating & submitting work.
              </p>
              <button
                onClick={() => !isSelectedEnrolled && onEnroll(selected)}
                disabled={isSelectedEnrolled}
                className={`px-4 py-2 text-xs md:text-sm rounded-lg font-medium
                  ${
                    isSelectedEnrolled
                      ? "bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-700 shadow-none"
                      : "bg-sky-500 hover:bg-sky-400 text-black shadow-[0_0_0_1px_rgba(56,189,248,0.4)]"
                  }`}
              >
                {isSelectedEnrolled ? "Already Enrolled" : "Enroll to this Task"}
              </button>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-500 text-sm gap-3">
            <div className="h-12 w-12 rounded-full bg-slate-900 flex items-center justify-center text-xl">
              🧭
            </div>
            <p className="font-medium text-slate-300">
              Select a task from the left panel
            </p>
            <p className="text-[11px] text-slate-500 max-w-xs text-center">
              You&apos;ll see full details and the option to enroll once you pick a
              task.
            </p>
          </div>
        )}
      </section>
    </>
  );
}

function statusBadgeClass(status: SubmissionStatus) {
  switch (status) {
    case "APPROVED":
      return "bg-emerald-500/10 text-emerald-300 border-emerald-500/40";
    case "CHANGES_REQUESTED":
      return "bg-amber-500/10 text-amber-300 border-amber-500/40";
    case "PENDING":
    default:
      return "bg-sky-500/10 text-sky-300 border-sky-500/40";
  }
}

function EnrolledView({
  items,
  loading,
  submittingId,
  onSubmitWork,
}: {
  items: EnrolledTaskItem[];
  loading: boolean;
  submittingId: string | null;
  onSubmitWork: (
    item: EnrolledTaskItem,
    githubUrl: string,
    description: string
  ) => void;
}) {
  const [githubInputs, setGithubInputs] = useState<Record<string, string>>({});
  const [descInputs, setDescInputs] = useState<Record<string, string>>({});
  const [openCommentsTaskId, setOpenCommentsTaskId] = useState<string | null>(
    null
  );

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">
        Loading your enrolled tasks…
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-slate-500 text-sm px-6 gap-3 bg-[#020617]">
        <div className="h-12 w-12 rounded-full bg-slate-900 flex items-center justify-center text-xl">
          📭
        </div>
        <p className="font-medium text-slate-300">No enrolled tasks yet</p>
        <p className="text-[11px] text-slate-500 max-w-xs text-center">
          Go to &quot;Explore Tasks&quot; to discover active tasks from your mentors and
          enroll to start working.
        </p>
      </div>
    );
  }

  // Group by submission status → for board-style view
  const pending = items.filter((i) => i.submissionStatus === "PENDING");
  const changesRequested = items.filter(
    (i) => i.submissionStatus === "CHANGES_REQUESTED"
  );
  const approved = items.filter((i) => i.submissionStatus === "APPROVED");

  const ongoingItems = items.filter(
    (i) => i.submissionStatus !== "APPROVED"
  );
  const completedItems = approved;

  const isSubmitted = (status: SubmissionStatus) =>
    status === "PENDING" || status === "APPROVED" || status === "CHANGES_REQUESTED";

  return (
    <section className="flex-1 overflow-y-auto px-6 py-4 space-y-4 bg-[#020617]">
      {/* Summary strip: pending / changes / approved */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-2">
        <div className="rounded-xl border border-slate-800 bg-slate-950/70 px-3 py-2">
          <p className="text-[11px] text-slate-400">Pending Review</p>
          <p className="text-lg font-semibold text-slate-50">
            {pending.length}
          </p>
        </div>
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 px-3 py-2">
          <p className="text-[11px] text-amber-300">Changes Requested</p>
          <p className="text-lg font-semibold text-amber-100">
            {changesRequested.length}
          </p>
        </div>
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 px-3 py-2">
          <p className="text-[11px] text-emerald-300">Approved / Completed</p>
          <p className="text-lg font-semibold text-emerald-100">
            {approved.length}
          </p>
        </div>
      </div>

      {/* Ongoing section */}
      <div className="space-y-3">
        <h2 className="text-xs font-semibold text-slate-300 uppercase tracking-[0.16em]">
          Ongoing Tasks
        </h2>
        {ongoingItems.length === 0 ? (
          <p className="text-[12px] text-slate-500">
            No ongoing tasks right now. You&apos;re all caught up 🎉
          </p>
        ) : null}

        {ongoingItems.map((item) => {
          const gitValue = githubInputs[item.submissionId] ?? item.githubUrl;
          const descValue = descInputs[item.submissionId] ?? item.workDescription;
          const isCommentsOpen = openCommentsTaskId === item.taskId;

          return (
            <div
              key={item.submissionId}
              className="rounded-2xl border border-slate-900 bg-[#050814] p-4 shadow-[0_18px_50px_rgba(0,0,0,0.9)] space-y-3"
            >
              {/* Header */}
              <div className="flex justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-slate-100">
                      {item.title}
                    </h3>
                    <span
                      className={`text-[11px] px-2 py-0.5 rounded-full border ${statusBadgeClass(
                        item.submissionStatus
                      )}`}
                    >
                      {item.submissionStatus}
                    </span>
                  </div>
                  {item.description && (
                    <p className="text-xs text-slate-400 line-clamp-2">
                      {item.description}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-1 mt-1 text-[11px] text-slate-400">
                    {item.techStack.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-slate-200"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-1 mt-1 text-[11px] text-slate-500">
                    <span>Task: {item.taskStatus}</span>
                    <span>•</span>
                    <span>Submission: {item.submissionStatus}</span>
                    {item.deadline && (
                      <>
                        <span>•</span>
                        <span>
                          Deadline:{" "}
                          {new Date(item.deadline).toLocaleDateString()}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <div className="text-right text-[11px] text-slate-500 shrink-0">
                  <p>Enrolled: {new Date(item.enrolledAt).toLocaleDateString()}</p>
                  {item.submittedAt && (
                    <p>
                      Submitted:{" "}
                      {new Date(item.submittedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>

              {/* Submit/Update form */}
              <div className="mt-3 space-y-3 rounded-xl border border-slate-800 bg-slate-950/70 p-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">
                    GitHub Repository URL
                  </label>
                  <input
                    value={gitValue}
                    onChange={(e) =>
                      setGithubInputs((prev) => ({
                        ...prev,
                        [item.submissionId]: e.target.value,
                      }))
                    }
                    placeholder="https://github.com/username/repository"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500/60"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-400 block mb-1">
                    Work Description
                  </label>
                  <textarea
                    value={descValue}
                    onChange={(e) =>
                      setDescInputs((prev) => ({
                        ...prev,
                        [item.submissionId]: e.target.value,
                      }))
                    }
                    rows={3}
                    placeholder="Explain what you built, key features, how to run, etc."
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500/60"
                  />
                </div>

                <div className="flex justify-between items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setOpenCommentsTaskId((prev) =>
                        prev === item.taskId ? null : item.taskId
                      )
                    }
                    className="px-3 py-1.5 text-[11px] rounded-lg border border-slate-700 bg-slate-950 hover:bg-slate-900 text-slate-200"
                  >
                    {isCommentsOpen ? "Hide Discussion" : "Open Discussion"}
                  </button>

                  <button
                    disabled={submittingId === item.submissionId}
                    onClick={() =>
                      onSubmitWork(item, gitValue || "", descValue || "")
                    }
                    className="px-4 py-2 text-sm rounded-lg bg-sky-600 hover:bg-sky-500 text-white disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_0_1px_rgba(56,189,248,0.4)]"
                  >
                    {submittingId === item.submissionId
                      ? "Submitting..."
                      : isSubmitted(item.submissionStatus)
                      ? "Update Submission"
                      : "Submit Work"}
                  </button>
                </div>
              </div>

              {/* Comments / Discussion */}
              {isCommentsOpen && (
                <div className="pt-3 border-t border-slate-800">
                  <TaskComments
                    taskId={item.taskId}
                    taskTitle={item.title}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Completed tasks (Approved) */}
      <div className="space-y-3 pt-4">
        <h2 className="text-xs font-semibold text-slate-300 uppercase tracking-[0.16em]">
          Completed / Approved Tasks
        </h2>
        {completedItems.length === 0 ? (
          <p className="text-[12px] text-slate-500">
            Approved tasks will move here once your mentor marks them as
            completed.
          </p>
        ) : null}

        {completedItems.map((item) => {
          const isCommentsOpen = openCommentsTaskId === item.taskId;
          const gitValue = githubInputs[item.submissionId] ?? item.githubUrl;
          const descValue = descInputs[item.submissionId] ?? item.workDescription;

          return (
            <div
              key={item.submissionId}
              className="rounded-2xl border border-emerald-600/40 bg-emerald-950/40 p-4 shadow-[0_18px_50px_rgba(4,120,87,0.4)] space-y-3"
            >
              <div className="flex justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-emerald-50">
                      {item.title}
                    </h3>
                    <span
                      className={`text-[11px] px-2 py-0.5 rounded-full border ${statusBadgeClass(
                        item.submissionStatus
                      )}`}
                    >
                      {item.submissionStatus}
                    </span>
                  </div>
                  {item.description && (
                    <p className="text-xs text-emerald-100/80 line-clamp-2">
                      {item.description}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-1 mt-1 text-[11px] text-emerald-100/80">
                    {item.techStack.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 rounded-full bg-emerald-900/40 border border-emerald-500/60"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="text-right text-[11px] text-emerald-100/70 shrink-0">
                  <p>Enrolled: {new Date(item.enrolledAt).toLocaleDateString()}</p>
                  {item.submittedAt && (
                    <p>
                      Approved:{" "}
                      {new Date(item.submittedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>

              {/* Read-only summary of last submitted links */}
              <div className="mt-2 space-y-2 rounded-xl border border-emerald-500/30 bg-emerald-950/40 p-3">
                {gitValue && (
                  <div>
                    <p className="text-[11px] text-emerald-200 mb-0.5">
                      GitHub Repository
                    </p>
                    <a
                      href={gitValue}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-emerald-300 underline break-all"
                    >
                      {gitValue}
                    </a>
                  </div>
                )}
                {descValue && (
                  <div>
                    <p className="text-[11px] text-emerald-200 mb-0.5">
                      Work Summary
                    </p>
                    <p className="text-xs text-emerald-100/90 whitespace-pre-wrap">
                      {descValue}
                    </p>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() =>
                  setOpenCommentsTaskId((prev) =>
                    prev === item.taskId ? null : item.taskId
                  )
                }
                className="px-3 py-1.5 text-[11px] rounded-lg border border-emerald-500/40 bg-emerald-950/40 hover:bg-emerald-900/50 text-emerald-100"
              >
                {isCommentsOpen
                  ? "Hide Discussion"
                  : "View Discussion / Feedback"}
              </button>

              {isCommentsOpen && (
                <div className="pt-3 border-t border-emerald-500/40">
                  <TaskComments
                    taskId={item.taskId}
                    taskTitle={item.title}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

// ✅ Role-guarded export
export default function StudentTasksPage() {
  return (
    <ProtectedRoute allowedRoles={["STUDENT"]}>
      <StudentTasksInner />
    </ProtectedRoute>
  );
}
