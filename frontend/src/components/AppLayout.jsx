import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Brain, BookOpen, ListChecks, CalendarClock,
  Fingerprint, User, LogOut, Bell, Sparkles,
} from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/learning-style", label: "Learning Style", icon: Brain },
  { to: "/subjects", label: "Subjects", icon: BookOpen },
  { to: "/quiz", label: "Quiz", icon: ListChecks },
  { to: "/study-planner", label: "Study Planner", icon: CalendarClock },
  { to: "/digital-twin", label: "Digital Twin", icon: Fingerprint },
  { to: "/profile", label: "Profile", icon: User },
];

export default function AppLayout({ children, title, subtitle }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex bg-[#f4f7fc]">
      {/* Sidebar */}
      <aside className="w-64 bg-navy-900 flex-shrink-0 hidden md:flex flex-col py-5 px-3">
        <div className="flex items-center gap-2 px-3 mb-6">
          <div className="w-9 h-9 rounded-lg bg-brand-500 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="text-white font-semibold text-lg">Digital Twin</span>
        </div>
        <nav className="flex-1 space-y-1">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}
            >
              <item.icon className="w-4.5 h-4.5" size={18} />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <button onClick={handleLogout} className="sidebar-link mt-2">
          <LogOut size={18} />
          Logout
        </button>
      </aside>

      {/* Mobile top nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-navy-900 flex overflow-x-auto px-1 py-2 gap-1">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-medium flex-shrink-0 ${
                isActive ? "bg-brand-500 text-white" : "text-slate-300"
              }`
            }
          >
            <item.icon size={16} />
            {item.label}
          </NavLink>
        ))}
        <button onClick={handleLogout} className="flex flex-col items-center justify-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-medium text-slate-300 flex-shrink-0">
          <LogOut size={16} />
          Logout
        </button>
      </div>

      {/* Main content */}
      <div className="flex-1 min-w-0 pb-20 md:pb-0">
        <header className="sticky top-0 z-20 bg-[#f4f7fc]/90 backdrop-blur border-b border-slate-200/70 px-4 md:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 md:hidden">
            <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-navy-900">Digital Twin</span>
          </div>
          <div className="hidden md:block">
            {title && <h1 className="text-xl font-semibold text-navy-900">{title}</h1>}
            {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
          <div className="flex items-center gap-4">
            <Bell className="w-5 h-5 text-slate-400" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-semibold text-sm">
                {user?.full_name?.charAt(0)?.toUpperCase() || "S"}
              </div>
              <span className="hidden sm:block text-sm font-medium text-navy-900">{user?.full_name}</span>
            </div>
          </div>
        </header>
        <main className="p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
