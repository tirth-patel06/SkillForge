"use client";

import TeamChat from "@/components/TeamChat";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import {
  Team,
  fetchMyTeams,
  createTeamApi,
  joinTeamApi,
  kickMemberApi,
  transferLeadershipApi,
  leaveTeamApi,
} from "@/api/team";

function TeamsInnerPage() {
  const { user } = useAuth();
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [createForm, setCreateForm] = useState({
    name: "",
    description: "",
    techStack: "",
  });

  const [joinCode, setJoinCode] = useState("");

  const selectedTeam =
    teams.find((t) => t._id === selectedTeamId) || teams[0];

  const isLeader =
    user && selectedTeam && selectedTeam.leader._id === user.id;

  // -------------------------------------
  // LOAD TEAMS
  // -------------------------------------
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await fetchMyTeams();
        setTeams(data);
        if (data.length > 0) {
          setSelectedTeamId(data[0]._id);
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load teams");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // -------------------------------------
  // CREATE TEAM
  // -------------------------------------
  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setCreating(true);
      setError(null);
      const team = await createTeamApi(createForm);
      setTeams((prev) => [team, ...prev]);
      setSelectedTeamId(team._id);
      setCreateForm({ name: "", description: "", techStack: "" });
    } catch (err: any) {
      console.error(err);
      setError(err?.response?.data?.message || "Failed to create team");
    } finally {
      setCreating(false);
    }
  };

  // -------------------------------------
  // JOIN TEAM
  // -------------------------------------
  const handleJoinTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setJoining(true);
      setError(null);

      const team = await joinTeamApi(joinCode);

      setTeams((prev) => {
        const exists = prev.find((t) => t._id === team._id);
        if (exists) return prev.map((t) => (t._id === team._id ? team : t));
        return [team, ...prev];
      });

      setSelectedTeamId(team._id);
      setJoinCode("");
    } catch (err: any) {
      console.error(err);
      setError(err?.response?.data?.message || "Failed to join team");
    } finally {
      setJoining(false);
    }
  };

  // -------------------------------------
  // MEMBER ACTIONS
  // -------------------------------------
  const handleKick = async (memberId: string) => {
    if (!selectedTeam) return;
    if (!confirm("Kick this member from the team?")) return;

    try {
      const team = await kickMemberApi(selectedTeam._id, memberId);
      setTeams((prev) => prev.map((t) => (t._id === team._id ? team : t)));
    } catch (err: any) {
      console.error(err);
      setError(err?.response?.data?.message || "Failed to kick member");
    }
  };

  const handleTransfer = async (memberId: string) => {
    if (!selectedTeam) return;
    if (!confirm("Transfer leadership to this member?")) return;

    try {
      const team = await transferLeadershipApi(selectedTeam._id, memberId);
      setTeams((prev) => prev.map((t) => (t._id === team._id ? team : t)));
    } catch (err: any) {
      console.error(err);
      setError(err?.response?.data?.message || "Failed to transfer leadership");
    }
  };

  const handleLeave = async () => {
    if (!selectedTeam) return;
    if (!confirm("Are you sure you want to leave this team?")) return;

    try {
      const result = await leaveTeamApi(selectedTeam._id);

      if (result.team) {
        const updated = result.team as Team;
        setTeams((prev) =>
          prev.map((t) => (t._id === updated._id ? updated : t))
        );
      } else {
        setTeams((prev) => prev.filter((t) => t._id !== selectedTeam._id));
        setSelectedTeamId(null);
      }
    } catch (err: any) {
      console.error(err);
      setError(err?.response?.data?.message || "Failed to leave team");
    }
  };

  // -------------------------------------
  // LOADING SCREEN
  // -------------------------------------
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-slate-100">
        Loading teams...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-slate-50 px-4 md:px-6 py-4">
      <div className="max-w-6xl mx-auto">
        <header className="mb-6">
          <div>
            <h1 className="text-3xl font-bold">Teams</h1>
            <p className="text-slate-400 text-sm mt-1">
              Create squads, join teams, and collaborate.
            </p>
          </div>
        </header>

        {error && (
          <div className="mb-4 p-2 rounded-lg bg-red-900/40 text-red-300 text-sm border border-red-500/40">
            {error}
          </div>
        )}

        <div className="grid md:grid-cols-[1.1fr_2fr] gap-6">
          {/* LEFT PANEL */}
          <div className="space-y-4">

            {/* CREATE TEAM */}
            <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl">
              <h2 className="text-sm font-semibold mb-2">Create a Team</h2>
              <form onSubmit={handleCreateTeam} className="space-y-2">
                <input
                  className="w-full bg-black border border-slate-700 rounded-lg px-3 py-2 text-sm"
                  placeholder="Team name"
                  value={createForm.name}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, name: e.target.value })
                  }
                  required
                />
                <textarea
                  className="w-full bg-black border border-slate-700 rounded-lg px-3 py-2 text-sm"
                  placeholder="Description"
                  value={createForm.description}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, description: e.target.value })
                  }
                />
                <input
                  className="w-full bg-black border border-slate-700 rounded-lg px-3 py-2 text-sm"
                  placeholder="Tech stack (React, Node...)"
                  value={createForm.techStack}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, techStack: e.target.value })
                  }
                />
                <button
                  type="submit"
                  disabled={creating}
                  className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-semibold rounded-lg py-2 text-sm"
                >
                  {creating ? "Creating..." : "Create Team"}
                </button>
              </form>
            </div>

            {/* JOIN TEAM */}
            <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl">
              <h2 className="text-sm font-semibold mb-2">Join a Team</h2>
              <form onSubmit={handleJoinTeam} className="space-y-2">
                <input
                  className="w-full bg-black border border-slate-700 rounded-lg px-3 py-2 text-sm uppercase tracking-wider text-center"
                  placeholder="Invite Code"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  required
                />
                <button
                  type="submit"
                  disabled={joining}
                  className="w-full bg-sky-500 hover:bg-sky-400 text-black font-semibold rounded-lg py-2 text-sm"
                >
                  {joining ? "Joining..." : "Join Team"}
                </button>
              </form>
            </div>

            {/* TEAM LIST */}
            <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl">
              <h2 className="text-sm font-semibold mb-3">Your Teams</h2>
              {teams.length === 0 ? (
                <p className="text-slate-400 text-sm">
                  You’re not part of any team yet.
                </p>
              ) : (
                <ul className="space-y-2">
                  {teams.map((team) => (
                    <li key={team._id}>
                      <button
                        onClick={() => setSelectedTeamId(team._id)}
                        className={`w-full px-3 py-2 rounded-lg text-left text-sm border ${
                          selectedTeamId === team._id
                            ? "bg-slate-800 border-emerald-500"
                            : "bg-black/40 border-slate-700 hover:bg-slate-800/60"
                        }`}
                      >
                        <div className="flex justify-between">
                          <span>{team.name}</span>
                          {team.leader._id === user?.id && (
                            <span className="text-emerald-400 text-xs">
                              Leader
                            </span>
                          )}
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* RIGHT PANEL */}
          <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl flex flex-col">
            {!selectedTeam ? (
              <p className="text-slate-400 text-sm">
                Select a team to view details.
              </p>
            ) : (
              <>
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h2 className="text-xl font-semibold">
                      {selectedTeam.name}
                    </h2>
                    <p className="text-sm text-slate-400">
                      Leader:{" "}
                      <span className="text-slate-200">
                        {selectedTeam.leader.name ||
                          selectedTeam.leader.email}
                      </span>
                    </p>
                  </div>
                  <button
                    onClick={handleLeave}
                    className="bg-red-600 hover:bg-red-500 px-3 py-1.5 rounded-lg text-xs text-white"
                  >
                    Leave
                  </button>
                </div>

                {/* TEAM MEMBERS */}
                <h3 className="text-sm font-semibold mb-2">Members</h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {selectedTeam.members.map((m) => {
                    const isSelf = m.user._id === user?.id;
                    const online = isSelf; // YOU ARE ONLINE ONLY

                    return (
                      <div
                        key={m.user._id}
                        className="flex justify-between items-center bg-black/40 border border-slate-700 rounded-lg px-3 py-2 text-xs"
                      >
                        <div className="flex items-center gap-2">
                          {/* ONLINE DOT */}
                          <span
                            className={`h-2 w-2 rounded-full ${
                              online ? "bg-emerald-400" : "bg-slate-600"
                            }`}
                          />
                          <div>
                            <p className="font-semibold text-slate-100">
                              {m.user.name || m.user.email}
                            </p>
                            <p className="text-slate-400 text-[11px]">
                              {m.role === "LEADER" ? "Leader" : "Member"} •{" "}
                              {online ? "Online" : "Offline"}
                            </p>
                          </div>
                        </div>

                        {isLeader && !isSelf && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => transferLeadershipApi(selectedTeam._id, m.user._id)}
                              className="px-2 py-1 rounded bg-emerald-600 text-white text-[11px]"
                            >
                              Make leader
                            </button>
                            <button
                              onClick={() => handleKick(m.user._id)}
                              className="px-2 py-1 rounded bg-red-600 text-white text-[11px]"
                            >
                              Kick
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* CHAT */}
                <TeamChat teamId={selectedTeam._id} />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function StudentTeamsPage() {
  return (
    <ProtectedRoute>
      <TeamsInnerPage />
    </ProtectedRoute>
  );
}
