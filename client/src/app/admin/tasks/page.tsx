"use client";
import React, { useEffect, useState } from "react";
export default function TasksPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const token = typeof window !== "undefined" ? localStorage.getItem("admin_token") : null;

  async function load() {
    const res = await fetch("http://localhost:4000/tasks?status=PENDING", {
      headers: { Authorization: `Bearer ${token}` }
    });
    const list = await res.json();
    setTasks(list);
  }
  useEffect(() => { load(); }, []);

  async function moderate(id:string, action:string) {
    const adminUser = JSON.parse(localStorage.getItem("admin_user") || "{}");
    const res = await fetch(`http://localhost:4000/tasks/${id}/moderate`, {
      method: "POST",
      headers: { "content-type":"application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ action, reason: action === "reject" ? "Not clear" : "", adminId: adminUser.id })
    });
    await load();
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Pending Tasks</h2>
      {tasks.map(t => (
        <div key={t._id} style={{ border: "1px solid #ddd", margin: 8, padding: 8 }}>
          <h3>{t.title} <small>({t.difficulty})</small></h3>
          <p>{t.description}</p>
          <div>Tech: {t.techStack?.join(", ")}</div>
          <div style={{ marginTop: 8 }}>
            <button onClick={() => moderate(t._id, "approve")}>Approve</button>
            <button onClick={() => moderate(t._id, "reject")}>Reject</button>
            <button onClick={() => moderate(t._id, "flag")}>Flag</button>
          </div>
        </div>
      ))}
    </div>
  );
}
