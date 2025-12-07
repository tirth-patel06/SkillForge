import { LayoutDashboard, FileText, ClipboardCheck, Users } from "lucide-react";
import type React from "react";

type PageId = "dashboard" | "tasks" | "reviews" | "referrals";

type MentorLayoutProps = {
  children: React.ReactNode;
  currentPage: PageId;
  onNavigate: (page: PageId) => void;
};

export function MentorLayout({ children, currentPage, onNavigate }: MentorLayoutProps) {
  const navItems = [
    { id: "dashboard" as const, icon: LayoutDashboard, label: "Dashboard" },
    { id: "tasks" as const, icon: FileText, label: "Tasks" },
    { id: "reviews" as const, icon: ClipboardCheck, label: "Reviews" },
    { id: "referrals" as const, icon: Users, label: "Referrals" },
  ];

  return (
    <div className="flex h-screen bg-black text-white">
      <aside className="w-64 bg-zinc-950 border-r border-zinc-800 flex flex-col">
        <div className="p-6 border-b border-zinc-800">
          <h1 className="text-xl font-bold">Mentor Hub</h1>
          <p className="text-sm text-zinc-400 mt-1">Task & Review System</p>
        </div>

        <nav className="flex-1 p-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg mb-2 transition-all ${
                  isActive
                    ? "bg-zinc-800 text-white shadow-lg"
                    : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-zinc-800">
          <div className="flex items-center space-x-3 px-4 py-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-800 flex items-center justify-center">
              <span className="text-white font-semibold">M</span>
            </div>
            <div>
              <p className="text-sm font-medium">Mentor</p>
              <p className="text-xs text-zinc-400">mentor@example.com</p>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-auto bg-black">{children}</main>
    </div>
  );
}
