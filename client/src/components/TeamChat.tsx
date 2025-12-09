"use client";

import { useEffect, useState, useRef, KeyboardEventHandler } from "react";
import { getSocket } from "@/lib/socket";
import { ChatMessage, fetchTeamMessages } from "@/api/chat";
import { useAuth } from "@/context/AuthContext";

interface Props {
  teamId: string;
}

export default function TeamChat({ teamId }: Props) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  // load history
  useEffect(() => {
    if (!teamId) return;
    setLoading(true);
    fetchTeamMessages(teamId)
      .then((msgs) => setMessages(msgs))
      .catch((err) => console.error("Failed to fetch team messages", err))
      .finally(() => setLoading(false));
  }, [teamId]);

  // listen for realtime messages
  useEffect(() => {
    if (!teamId) return;
    const socket = getSocket();

    const handler = (msg: any) => {
      if (msg.teamId !== teamId) return;
      setMessages((prev) => [...prev, msg]);
    };

    socket.on("teamMessage", handler);

    return () => {
      socket.off("teamMessage", handler);
    };
  }, [teamId]);

  // autoscroll
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages.length]);

  const sendMessage = () => {
    const text = input.trim();
    if (!text || !teamId || !user) return;

    const socket = getSocket();
    socket.emit("teamMessage", {
      teamId,
      content: text,
      sender: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });

    setInput("");
  };

  const handleKeyDown: KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="mt-5 flex flex-col h-80 bg-slate-950/60 border border-slate-800 rounded-2xl overflow-hidden">
      <div className="px-4 py-2 border-b border-slate-800 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold">Team chat</h3>
          <p className="text-[11px] text-slate-400">
            Messages are visible to all team members in real time.
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1.5">
        {loading ? (
          <p className="text-xs text-slate-500">Loading messages…</p>
        ) : messages.length === 0 ? (
          <p className="text-xs text-slate-500">
            No messages yet. Start the conversation 👋
          </p>
        ) : (
          messages.map((m) => {
            const mine = user && m.sender.id === user.id;
            return (
              <div
                key={m._id}
                className={`flex ${mine ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[70%] rounded-xl px-3 py-1.5 text-xs ${
                    mine
                      ? "bg-emerald-500 text-slate-900"
                      : "bg-slate-800 text-slate-50"
                  }`}
                >
                  {!mine && (
                    <p className="text-[10px] font-semibold opacity-80 mb-[2px]">
                      {m.sender.name || m.sender.email}
                    </p>
                  )}
                  <p>{m.content}</p>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      <div className="border-t border-slate-800 px-3 py-2 flex gap-2 items-center">
        <input
          className="flex-1 bg-slate-900/80 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/70"
          placeholder="Message your team…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button
          onClick={sendMessage}
          className="px-3 py-1.5 rounded-xl bg-emerald-500 text-xs font-semibold text-slate-900 hover:bg-emerald-400 transition"
        >
          Send
        </button>
      </div>
    </div>
  );
}
