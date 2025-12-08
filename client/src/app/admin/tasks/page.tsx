"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { meApi } from "@/api/auth";

const API_URL =  "http://localhost:8000";

export default function AdminTasksPage() {
  const [user, setUser] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadUser() {
    try {
      const me = await meApi();
      setUser(me);
    } catch (err) {
      console.error("Not logged in");
      window.location.href = "/auth";
    }
  }

  // Load pending tasks
  async function loadTasks() {
    try {
      const res = await axios.get(`${API_URL}/api/admin/tasks?status=PENDING`, {
        withCredentials: true,
      });
      setTasks(res.data.tasks || res.data);
    } catch (err) {
      console.error(err);
    }
  }

  // Moderate
  async function moderate(id: string, action: string) {
    try {
      await axios.post(
        `${API_URL}/api/admin/tasks/${id}/moderate`,
        {
          action,
          reason: action === "reject" ? "Not clear" : "",
        },
        { withCredentials: true }
      );
      await loadTasks();
    } catch (err) {
      console.error(err);
    }
  }


  useEffect(() => {
    (async () => {
      await loadUser();
      await loadTasks();
      setLoading(false);
    })();
  }, []);


  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-slate-200">
        Loading tasks...
      </div>
    );

  // Access block
  if (user?.role !== "ADMIN")
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-red-400">
        You are not authorized.
      </div>
    );

  return (
    <div className="min-h-screen bg-linear-to-br from-black via-slate-950 to-slate-900 text-slate-100">
      {/* Header */}
      <header className="border-b border-slate-800/80 bg-black/80 backdrop-blur sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">
              🧾 Task Moderation
            </h1>
            <p className="text-xs text-slate-400">
              Review submissions awaiting approval.
            </p>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-4 py-10 space-y-10">
        {/* Stats */}
        <section className="bg-slate-950/80 border border-slate-800 shadow-2xl shadow-black/60 rounded-2xl p-6 flex justify-between items-center">
          <div>
            <p className="text-sm text-slate-400 mb-1">
              Total Pending Reviews
            </p>
            <h2 className="text-3xl font-semibold text-yellow-400">
              {tasks.length}
            </h2>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase tracking-wider text-slate-400">
              Status
            </p>
            <p className="text-sm font-medium text-yellow-400">
              Moderation Required
            </p>
          </div>
        </section>

        {/* Task list */}
        <section className="space-y-6">
          {tasks.length === 0 && (
            <div className="text-center text-slate-400">
              Nothing to moderate right now.
            </div>
          )}

          {tasks.map((t) => (
            <div
              key={t._id}
              className="bg-slate-950/60 border border-slate-800 shadow-lg rounded-xl p-5 hover:border-slate-700 transition"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-medium text-slate-100">
                    {t.title}
                    <span className="text-xs font-light ml-2 text-slate-400">
                      ({t.difficulty})
                    </span>
                  </h3>
                  <p className="text-sm text-slate-400 line-clamp-2 mt-1 mb-2">
                    {t.description}
                  </p>

                  {t.techStack?.length > 0 && (
                    <div className="text-xs text-slate-400">
                      <span className="uppercase tracking-wider text-[10px] text-slate-500">
                        Tech:
                      </span>{" "}
                      {t.techStack.join(", ")}
                    </div>
                  )}
                </div>

                {/* Buttons */}
                <div className="flex gap-2 md:flex-col lg:flex-row">
                  <ActionBtn
                    label="Approve"
                    color="green"
                    onClick={() => moderate(t._id, "approve")}
                  />
                  <ActionBtn
                    label="Reject"
                    color="red"
                    onClick={() => moderate(t._id, "reject")}
                  />
                  <ActionBtn
                    label="Remove"
                    color="yellow"
                    onClick={() => moderate(t._id, "remove")}
                  />
                </div>
              </div>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}


function ActionBtn({
  label,
  color,
  onClick,
}: {
  label: string;
  color: "green" | "red" | "yellow";
  onClick: () => void;
}) {
  const colors: Record<string, string> = {
    green:
      "text-green-300 hover:bg-green-500/10 hover:text-green-200 border-green-500/40",
    red: "text-red-300 hover:bg-red-500/10 hover:text-red-200 border-red-500/40",
    yellow:
      "text-yellow-300 hover:bg-yellow-500/10 hover:text-yellow-200 border-yellow-500/40",
  };

  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 text-xs font-medium rounded-full border backdrop-blur hover:-translate-y-0.5 transition ${colors[color]}`}
    >
      {label}
    </button>
  );
}
