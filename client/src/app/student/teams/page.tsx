// "use client";

// import TeamChat from "@/components/TeamChat";
// import { useEffect, useState } from "react";
// import { useAuth } from "@/context/AuthContext";
// import ProtectedRoute from "@/components/ProtectedRoute";
// import {
//   Team,
//   fetchMyTeams,
//   createTeamApi,
//   joinTeamApi,
//   updateTeamApi,
//   kickMemberApi,
//   transferLeadershipApi,
//   leaveTeamApi,
// } from "@/api/team";
// import { getSocket } from "@/lib/socket";

// function TeamsInnerPage() {
//   const { user } = useAuth();
//   const [teams, setTeams] = useState<Team[]>([]);
//   const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [creating, setCreating] = useState(false);
//   const [joining, setJoining] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   const [createForm, setCreateForm] = useState({
//     name: "",
//     description: "",
//     techStack: "",
//   });

//   const [joinCode, setJoinCode] = useState("");

//   // online presence for selected team (Option A: small dot next to each member)


//   const selectedTeam = teams.find((t) => t._id === selectedTeamId) || teams[0];

//   const isLeader =
//     user && selectedTeam && selectedTeam.leader._id === user.id;

//   // load teams
//   useEffect(() => {
//     (async () => {
//       try {
//         setLoading(true);
//         const data = await fetchMyTeams();
//         setTeams(data);
//         if (data.length > 0) {
//           setSelectedTeamId(data[0]._id);
//         }
//       } catch (err: any) {
//         console.error(err);
//         setError("Failed to load teams");
//       } finally {
//         setLoading(false);
//       }
//     })();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   // presence + room join for selected team
//   useEffect(() => {
//     if (!selectedTeam?._id) {
//       // clear presence when no team selected
//       setOnlineIds([]);
//       return;
//     }

//     const teamId = selectedTeam._id;
//     const socket = getSocket();

//     // join this team room (needed for chat + presence)
//     socket.emit("joinTeam", teamId);

//     const handlePresence = (data: {
//       teamId: string;
//       onlineUserIds: string[];
//     }) => {
//       if (data.teamId !== teamId) return;
//       setOnlineIds(data.onlineUserIds);
//     };

//     const handleOnline = (data: { teamId: string; userId: string }) => {
//       if (data.teamId !== teamId) return;
//       setOnlineIds((prev) =>
//         prev.includes(data.userId) ? prev : [...prev, data.userId]
//       );
//     };

//     const handleOffline = (data: { teamId: string; userId: string }) => {
//       if (data.teamId !== teamId) return;
//       setOnlineIds((prev) => prev.filter((id) => id !== data.userId));
//     };

//     socket.on("teamPresence", handlePresence);
//     socket.on("memberOnline", handleOnline);
//     socket.on("memberOffline", handleOffline);

//     return () => {
//       socket.emit("leaveTeam", teamId);
//       socket.off("teamPresence", handlePresence);
//       socket.off("memberOnline", handleOnline);
//       socket.off("memberOffline", handleOffline);
//       setOnlineIds([]);
//     };
//   }, [selectedTeam?._id]);

//   const handleCreateTeam = async (e: React.FormEvent) => {
//     e.preventDefault();
//     try {
//       setCreating(true);
//       setError(null);
//       const team = await createTeamApi(createForm);
//       setTeams((prev) => [team, ...prev]);
//       setSelectedTeamId(team._id);
//       setCreateForm({ name: "", description: "", techStack: "" });
//     } catch (err: any) {
//       console.error(err);
//       setError(err?.response?.data?.message || "Failed to create team");
//     } finally {
//       setCreating(false);
//     }
//   };

//   const handleJoinTeam = async (e: React.FormEvent) => {
//     e.preventDefault();
//     try {
//       setJoining(true);
//       setError(null);
//       const team = await joinTeamApi(joinCode);
//       setTeams((prev) => {
//         const exists = prev.find((t) => t._id === team._id);
//         if (exists) return prev.map((t) => (t._id === team._id ? team : t));
//         return [team, ...prev];
//       });
//       setSelectedTeamId(team._id);
//       setJoinCode("");
//     } catch (err: any) {
//       console.error(err);
//       setError(err?.response?.data?.message || "Failed to join team");
//     } finally {
//       setJoining(false);
//     }
//   };

//   const handleKick = async (memberId: string) => {
//     if (!selectedTeam) return;
//     if (!confirm("Kick this member from the team?")) return;
//     try {
//       const team = await kickMemberApi(selectedTeam._id, memberId);
//       setTeams((prev) => prev.map((t) => (t._id === team._id ? team : t)));
//     } catch (err: any) {
//       console.error(err);
//       setError(err?.response?.data?.message || "Failed to kick member");
//     }
//   };

//   const handleTransfer = async (memberId: string) => {
//     if (!selectedTeam) return;
//     if (!confirm("Transfer leadership to this member?")) return;
//     try {
//       const team = await transferLeadershipApi(selectedTeam._id, memberId);
//       setTeams((prev) => prev.map((t) => (t._id === team._id ? team : t)));
//     } catch (err: any) {
//       console.error(err);
//       setError(err?.response?.data?.message || "Failed to transfer leadership");
//     }
//   };

//   const handleLeave = async () => {
//     if (!selectedTeam) return;
//     if (!confirm("Are you sure you want to leave this team?")) return;
//     try {
//       const result = await leaveTeamApi(selectedTeam._id);
//       if (result.team) {
//         const team = result.team as Team;
//         setTeams((prev) => prev.map((t) => (t._id === team._id ? team : t)));
//       } else {
//         setTeams((prev) => prev.filter((t) => t._id !== selectedTeam._id));
//         setSelectedTeamId(null);
//       }
//     } catch (err: any) {
//       console.error(err);
//       setError(err?.response?.data?.message || "Failed to leave team");
//     }
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-linear-to-b from-black via-slate-950 to-black text-slate-100">
//         <div className="flex flex-col items-center gap-3">
//           <span className="h-8 w-8 animate-spin rounded-full border-2 border-slate-500 border-t-emerald-400" />
//           <p className="text-sm text-slate-300">Loading your teams…</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-linear-to-b from-black via-slate-950 to-black text-slate-50 px-4 md:px-6 py-4">
//       <div className="max-w-6xl mx-auto">
//         {/* header */}
//         <header className="mb-6">
//           <div className="flex items-center justify-between gap-4">
//             <div>
//               <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500 mb-1">
//                 Student workspace
//               </p>
//               <h1 className="text-2xl md:text-3xl font-semibold">Teams</h1>
//               <p className="text-xs md:text-sm text-slate-400 mt-1">
//                 Create squads, invite friends, and manage roles for your
//                 projects.
//               </p>
//             </div>

//             {selectedTeam && (
//               <div className="text-right">
//                 <p className="text-[11px] uppercase text-slate-500 tracking-[0.18em]">
//                   Invite code
//                 </p>
//                 <p className="mt-1 inline-flex items-center gap-2 rounded-full bg-slate-900/70 border border-emerald-500/60 px-3 py-1 font-mono text-xs">
//                   <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
//                   {selectedTeam.inviteCode}
//                 </p>
//               </div>
//             )}
//           </div>
//         </header>

//         {error && (
//           <div className="mb-4 rounded-xl border border-red-500/60 bg-red-950/60 px-4 py-2 text-xs text-red-100 shadow-[0_0_40px_rgba(248,113,113,0.2)]">
//             {error}
//           </div>
//         )}

//         <div className="grid md:grid-cols-[minmax(0,1.15fr)_minmax(0,2fr)] gap-5 md:gap-6">
//           {/* LEFT: create / join / list */}
//           <div className="space-y-4 md:space-y-5">
//             {/* create team */}
//             <div className="rounded-2xl border border-slate-800/80 bg-black/60 backdrop-blur-sm p-4 shadow-[0_18px_40px_rgba(0,0,0,0.6)]">
//               <div className="flex items-center justify-between mb-2">
//                 <h2 className="text-sm font-semibold tracking-tight">
//                   Create a team
//                 </h2>
//                 <span className="text-[10px] uppercase text-emerald-400/80">
//                   Leader tools
//                 </span>
//               </div>
//               <form onSubmit={handleCreateTeam} className="space-y-2.5">
//                 <input
//                   className="w-full rounded-lg border border-slate-800 bg-slate-950/70 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/70"
//                   placeholder="Team name"
//                   value={createForm.name}
//                   onChange={(e) =>
//                     setCreateForm((f) => ({ ...f, name: e.target.value }))
//                   }
//                   required
//                 />
//                 <textarea
//                   className="w-full rounded-lg border border-slate-800 bg-slate-950/70 px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/70"
//                   placeholder="Short description (e.g. Web3 hackathon squad)"
//                   value={createForm.description}
//                   onChange={(e) =>
//                     setCreateForm((f) => ({ ...f, description: e.target.value }))
//                   }
//                   rows={2}
//                 />
//                 <input
//                   className="w-full rounded-lg border border-slate-800 bg-slate-950/70 px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/70"
//                   placeholder="Tech stack (React, Node, MongoDB…) "
//                   value={createForm.techStack}
//                   onChange={(e) =>
//                     setCreateForm((f) => ({ ...f, techStack: e.target.value }))
//                   }
//                 />
//                 <button
//                   type="submit"
//                   disabled={creating}
//                   className="mt-1 inline-flex items-center justify-center rounded-lg bg-emerald-500 px-3 py-1.5 text-[11px] font-semibold text-slate-950 hover:bg-emerald-400 disabled:opacity-60 disabled:cursor-not-allowed transition"
//                 >
//                   {creating ? "Creating…" : "Create team"}
//                 </button>
//               </form>
//             </div>

//             {/* join team */}
//             <div className="rounded-2xl border border-slate-800/80 bg-black/60 backdrop-blur-sm p-4 shadow-[0_18px_40px_rgba(0,0,0,0.6)]">
//               <h2 className="text-sm font-semibold mb-2 tracking-tight">
//                 Join a team
//               </h2>
//               <form onSubmit={handleJoinTeam} className="space-y-2.5">
//                 <input
//                   className="w-full rounded-lg border border-slate-800 bg-slate-950/70 px-3 py-2 text-sm tracking-[0.22em] text-center text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/70 font-mono"
//                   placeholder="INVITE"
//                   value={joinCode}
//                   onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
//                   maxLength={10}
//                   required
//                 />
//                 <button
//                   type="submit"
//                   disabled={joining}
//                   className="mt-1 inline-flex items-center justify-center rounded-lg bg-sky-500 px-3 py-1.5 text-[11px] font-semibold text-slate-950 hover:bg-sky-400 disabled:opacity-60 disabled:cursor-not-allowed transition"
//                 >
//                   {joining ? "Joining…" : "Join with code"}
//                 </button>
//               </form>
//             </div>

//             {/* my teams list */}
//             <div className="rounded-2xl border border-slate-800/80 bg-black/60 backdrop-blur-sm p-4 shadow-[0_18px_40px_rgba(0,0,0,0.6)]">
//               <div className="flex items-center justify-between mb-2">
//                 <h2 className="text-sm font-semibold tracking-tight">
//                   Teams you’re in
//                 </h2>
//                 <span className="text-[10px] text-slate-500">{teams.length} total</span>
//               </div>
//               {teams.length === 0 ? (
//                 <p className="text-xs text-slate-500">
//                   You’re not in any team yet. Create one or join with a code.
//                 </p>
//               ) : (
//                 <ul className="space-y-2">
//                   {teams.map((team) => (
//                     <li key={team._id}>
//                       <button
//                         onClick={() => setSelectedTeamId(team._id)}
//                         className={`w-full text-left px-3 py-2 rounded-xl text-xs border transition shadow-sm ${
//                           selectedTeam && selectedTeam._id === team._id
//                             ? "bg-linear-to-r from-emerald-500/10 via-slate-900/80 to-slate-950 border-emerald-500/70 shadow-[0_0_40px_rgba(16,185,129,0.3)]"
//                             : "bg-slate-950/70 border-slate-800 hover:border-slate-500/80 hover:bg-slate-900/80"
//                         }`}
//                       >
//                         <div className="flex items-center justify-between">
//                           <span className="font-semibold text-slate-50">{team.name}</span>
//                           {team.leader._id === user?.id && (
//                             <span className="text-[10px] uppercase text-emerald-400 bg-emerald-500/10 border border-emerald-500/40 rounded-full px-2 py-0.5">
//                               Leader
//                             </span>
//                           )}
//                         </div>
//                         {team.description && (
//                           <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
//                             {team.description}
//                           </p>
//                         )}
//                       </button>
//                     </li>
//                   ))}
//                 </ul>
//               )}
//             </div>
//           </div>

//           {/* RIGHT: selected team details */}
//           <div className="rounded-2xl border border-slate-800/80 bg-black/60 backdrop-blur-md p-5 flex flex-col shadow-[0_22px_60px_rgba(0,0,0,0.8)]">
//             {!selectedTeam ? (
//               <p className="text-sm text-slate-400">
//                 Select a team from the left or create/join one to see details.
//               </p>
//             ) : (
//               <>
//                 <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 mb-4">
//                   <div>
//                     <h2 className="text-xl md:text-2xl font-semibold">{selectedTeam.name}</h2>
//                     <p className="text-xs text-slate-400 mt-1">
//                       Leader:{" "}
//                       <span className="text-slate-100">
//                         {selectedTeam.leader.name || selectedTeam.leader.email}
//                       </span>
//                     </p>
//                   </div>
//                   <div className="flex flex-wrap gap-2">
//                     <button
//                       onClick={handleLeave}
//                       className="px-3 py-1.5 rounded-lg text-xs bg-red-600 text-white hover:bg-red-500 transition"
//                     >
//                       Leave team
//                     </button>
//                   </div>
//                 </div>

//                 {selectedTeam.description && (
//                   <p className="text-sm text-slate-200 mb-3">{selectedTeam.description}</p>
//                 )}

//                 {selectedTeam.techStack.length > 0 && (
//                   <div className="mb-4">
//                     <h3 className="text-xs font-semibold text-slate-400 mb-1 uppercase tracking-[0.18em]">
//                       Tech stack
//                     </h3>
//                     <div className="flex flex-wrap gap-1.5">
//                       {selectedTeam.techStack.map((t: string) => (
//                         <span
//                           key={t}
//                           className="text-[11px] px-2 py-[3px] rounded-full bg-slate-900 text-slate-100 border border-slate-700/80"
//                         >
//                           {t}
//                         </span>
//                       ))}
//                     </div>
//                   </div>
//                 )}

//                 <div className="mt-4">
//                   <div className="flex items-center justify-between mb-2">
//                     <h3 className="text-sm font-semibold">Members</h3>
//                     <p className="text-[11px] text-slate-500">
//                       {selectedTeam.members.length} {selectedTeam.members.length === 1 ? "member" : "members"}
//                     </p>
//                   </div>
//                   <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
//                     {selectedTeam.members.map((m: any) => {
//                       const isSelf = user && m.user._id === user.id;
//                       const online = !!isSelf; // you are online on this route, others are offline

//                       return (
//                         <div
//                           key={m.user._id}
//                           className="flex items-center justify-between bg-slate-950/70 border border-slate-800 rounded-xl px-3 py-2 text-xs"
//                         >
//                           <div className="flex items-center gap-2">
//                             <span
//                               className={`h-2 w-2 rounded-full ${
//                                 online ? "bg-emerald-400" : "bg-slate-600"
//                               }`}
//                             />
//                             <div>
//                               <p className="font-semibold text-slate-50">
//                                 {m.user.name || m.user.email}
//                               </p>
//                               <p className="text-[11px] text-slate-400">
//                                 {m.role === "LEADER" ? "Leader" : "Member"} •{" "}
//                                 {online ? "Online" : "Offline"}
//                               </p>
//                             </div>
//                           </div>

//       {isLeader && user && m.user._id !== user.id && (
//         <div className="flex gap-2">
//           <button
//             onClick={() => handleTransfer(m.user._id)}
//             className="px-2 py-1 rounded-md bg-emerald-600 text-[11px] font-semibold hover:bg-emerald-500 transition"
//           >
//             Make leader
//           </button>
//           <button
//             onClick={() => handleKick(m.user._id)}
//             className="px-2 py-1 rounded-md bg-red-600 text-[11px] font-semibold hover:bg-red-500 transition"
//           >
//             Kick
//           </button>
//         </div>
//       )}
//     </div>
//   );
// })}

//                   </div>
//                 </div>

//                 {/* realtime team chat */}
//                 <TeamChat teamId={selectedTeam._id} />
//               </>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default function StudentTeamsPage() {
//   return (
//     <ProtectedRoute>
//       <TeamsInnerPage />
//     </ProtectedRoute>
//   );
// }

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
      if (!user?.id) throw new Error("User not found");
      const team = await createTeamApi({
        ...createForm,
        mentorId: user.id,
      });
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
