import { LayoutDashboard, FileText, ClipboardCheck, Users, LogOut } from "lucide-react";
import type React from "react";

type PageId = "dashboard" | "tasks" | "reviews" | "referrals";

type User = {
  id: string;
  name?: string;
  email: string;
  role: "MENTOR" | "STUDENT" | "ADMIN";
};

type MentorLayoutProps = {
  children: React.ReactNode;
  currentPage: PageId;
  onNavigate: (page: PageId) => void;
  user?: User;
  onLogout?: () => void;
};

export function MentorLayout({ children, currentPage, onNavigate, user, onLogout }: MentorLayoutProps) {
  const navItems = [
    { id: "dashboard" as const, icon: LayoutDashboard, label: "Dashboard" },
    { id: "tasks" as const, icon: FileText, label: "Tasks" },
    { id: "reviews" as const, icon: ClipboardCheck, label: "Reviews" },
    { id: "referrals" as const, icon: Users, label: "Referrals" },
  ];

  // Get initials from name or email
  const getInitials = () => {
    if (user?.name) {
      return user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    return user?.email?.charAt(0)?.toUpperCase() || "U";
  };

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

        <div className="p-4 border-t border-zinc-800 space-y-3">
          {/* Profile Section */}
          <div className="flex items-center space-x-3 px-4 py-3 rounded-lg bg-zinc-900/50">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center">
              <span className="text-white font-semibold text-sm">{getInitials()}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.name || "User"}</p>
              <p className="text-xs text-zinc-400 truncate">{user?.email || "user@example.com"}</p>
            </div>
          </div>

          {/* Logout Button */}
          {onLogout && (
            <button
              onClick={onLogout}
              className="w-full flex items-center space-x-2 px-4 py-3 rounded-lg text-zinc-400 hover:bg-zinc-900 hover:text-red-400 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium text-sm">Logout</span>
            </button>
          )}
        </div>
      </aside>

      <main className="flex-1 overflow-auto bg-black">{children}</main>
    </div>
  );
}
