// "use client";

// function ContributionStat({
//   title,
//   value,
//   subtitle,
//   accent,
//   icon,
// }: {
//   title: string;
//   value: string;
//   subtitle: string;
//   accent: string;
//   icon: string;
// }) {
//   return (
//     <div className="relative overflow-hidden rounded-2xl border border-slate-900 bg-[#050814] p-4 shadow-[0_20px_60px_rgba(0,0,0,0.9)] hover:-translate-y-[1px] transition">
//       <div
//         className={`pointer-events-none absolute inset-x-0 -top-10 h-20 bg-linear-to-br ${accent} opacity-30`}
//       />
//       <div className="relative flex items-center justify-between">
//         <div className="space-y-1">
//           <p className="text-xs text-slate-400">{title}</p>
//           <p className="text-xl font-semibold text-slate-50">{value}</p>
//           <p className="text-[11px] text-slate-500">{subtitle}</p>
//         </div>
//         <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black/60 border border-white/10 text-lg">
//           {icon}
//         </div>
//       </div>
//     </div>
//   );
// }

// export default function ContributionDashboard() {
//   const contributionScore = 72;
//   const weeklyContributions = 5;
//   const streakDays = 9;
//   const skills = ["React", "TypeScript", "MongoDB", "Socket.IO"];

//   return (
//     <section className="space-y-4">
//       {/* Header */}
//       <div className="flex items-center justify-between">
//         <div>
//           <h2 className="text-sm font-semibold text-slate-200">
//             Contribution Dashboard
//           </h2>
//           <p className="text-xs text-slate-400">
//             Track your impact and learning consistency
//           </p>
//         </div>
//         <span className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
//           INSIGHTS
//         </span>
//       </div>

//       {/* Grid */}
//       <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-4">
//         <div className="relative overflow-hidden rounded-2xl border border-slate-900 bg-[#050814] p-5">
//           <div className="space-y-2">
//             <p className="text-4xl font-semibold">{contributionScore}</p>
//             <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
//               <div
//                 className="h-full bg-linear-to-r from-emerald-400 to-sky-400 transition-all"
//                 style={{ width: `${contributionScore}%` }}
//               />
//             </div>
//           </div>
//         </div>

//         <div className="grid gap-4">
//           <ContributionStat
//             title="Weekly Contributions"
//             value={`${weeklyContributions}`}
//             subtitle="tasks & reviews"
//             accent="from-sky-400 to-blue-500"
//             icon="📈"
//           />
//           <ContributionStat
//             title="Current Streak"
//             value={`${streakDays} days`}
//             subtitle="consistent activity"
//             accent="from-orange-400 to-amber-500"
//             icon="🔥"
//           />
//         </div>
//       </div>

//       {/* Skills */}
//       <div className="flex flex-wrap gap-2">
//         {skills.map((s) => (
//           <span
//             key={s}
//             className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-300"
//           >
//             {s}
//           </span>
//         ))}
//       </div>
//     </section>
//   );
// }
