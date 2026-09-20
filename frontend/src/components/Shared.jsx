import React from "react";
import { Loader2, Inbox, AlertCircle, CheckCircle2 } from "lucide-react";

export function StatCard({ icon: Icon, label, value, color = "brand" }) {
  const colorMap = {
    brand: "bg-brand-50 text-brand-600",
    green: "bg-emerald-50 text-emerald-600",
    orange: "bg-amber-50 text-amber-600",
    purple: "bg-violet-50 text-violet-600",
  };
  return (
    <div className="card flex items-center gap-4">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${colorMap[color]}`}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-xs text-slate-500 font-medium">{label}</p>
        <p className="text-xl font-bold text-navy-900">{value}</p>
      </div>
    </div>
  );
}

export function EmptyState({ message, icon: Icon = Inbox, action }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-12 px-4">
      <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mb-3">
        <Icon className="text-slate-400" size={26} />
      </div>
      <p className="text-slate-500 text-sm max-w-xs">{message}</p>
      {action}
    </div>
  );
}

export function Loader({ label = "Loading..." }) {
  return (
    <div className="flex items-center justify-center gap-2 text-slate-500 py-10">
      <Loader2 className="animate-spin" size={20} />
      <span className="text-sm">{label}</span>
    </div>
  );
}

export function ErrorBanner({ message }) {
  if (!message) return null;
  return (
    <div className="flex items-start gap-2 bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg px-3.5 py-2.5">
      <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
      <span>{message}</span>
    </div>
  );
}

export function SuccessBanner({ message }) {
  if (!message) return null;
  return (
    <div className="flex items-start gap-2 bg-emerald-50 border border-emerald-100 text-emerald-600 text-sm rounded-lg px-3.5 py-2.5">
      <CheckCircle2 size={16} className="mt-0.5 flex-shrink-0" />
      <span>{message}</span>
    </div>
  );
}

export function PriorityBadge({ priority }) {
  const map = {
    High: "bg-red-50 text-red-600",
    Medium: "bg-amber-50 text-amber-600",
    Low: "bg-emerald-50 text-emerald-600",
  };
  return <span className={`badge ${map[priority] || "bg-slate-100 text-slate-600"}`}>{priority} priority</span>;
}

export function TrendBadge({ trend }) {
  const map = {
    Improving: "bg-emerald-50 text-emerald-600",
    Declining: "bg-red-50 text-red-600",
    Stable: "bg-slate-100 text-slate-600",
    "Not enough data": "bg-slate-100 text-slate-500",
  };
  return <span className={`badge ${map[trend] || "bg-slate-100 text-slate-600"}`}>{trend}</span>;
}
