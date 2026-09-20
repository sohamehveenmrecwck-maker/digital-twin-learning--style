import React, { useEffect, useState } from "react";
import { RefreshCw, Clock } from "lucide-react";
import AppLayout from "../components/AppLayout.jsx";
import { Loader, EmptyState, ErrorBanner } from "../components/Shared.jsx";
import api from "../api/client";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function StudyPlanner() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    const res = await api.get("/api/study-plan");
    setItems(res.data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const generate = async () => {
    setError("");
    setGenerating(true);
    try {
      const res = await api.post("/api/study-plan/generate");
      setItems(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || "Could not generate a plan. Add your subjects first.");
    } finally {
      setGenerating(false);
    }
  };

  const toggleTask = async (id, completed) => {
    setItems((prev) => prev.map((t) => (t.id === id ? { ...t, completed } : t)));
    await api.patch(`/api/study-plan/${id}`, { completed });
  };

  const grouped = DAYS.map((day) => ({ day, tasks: items.filter((t) => t.day_of_week === day) }));
  const totalTasks = items.length;
  const completedTasks = items.filter((t) => t.completed).length;
  const progressPct = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <AppLayout title="My Study Plan" subtitle="This week's personalized schedule">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full border-4 border-brand-100 relative flex items-center justify-center text-sm font-semibold text-navy-900">
            {progressPct}%
          </div>
          <div>
            <p className="text-sm font-medium text-navy-900">{completedTasks} of {totalTasks} tasks completed</p>
            <p className="text-xs text-slate-500">Keep it up this week!</p>
          </div>
        </div>
        <button onClick={generate} disabled={generating} className="btn-primary text-sm">
          <RefreshCw size={15} className={generating ? "animate-spin" : ""} />
          {totalTasks ? "Regenerate Plan" : "Generate Study Plan"}
        </button>
      </div>

      {error && <div className="mb-4"><ErrorBanner message={error} /></div>}

      {loading ? <Loader label="Loading your plan..." /> : totalTasks === 0 ? (
        <div className="card">
          <EmptyState message="No study plan yet. Add your subjects and complete the learning style assessment, then generate your personalized weekly plan." />
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {grouped.map(({ day, tasks }) => (
            <div key={day} className="card">
              <h3 className="font-semibold text-navy-900 mb-3">{day}</h3>
              {tasks.length === 0 ? (
                <p className="text-xs text-slate-400">No tasks scheduled.</p>
              ) : (
                <div className="space-y-2">
                  {tasks.map((t) => (
                    <label key={t.id} className={`flex items-start gap-3 border rounded-lg px-3 py-2.5 cursor-pointer ${t.completed ? "bg-emerald-50/50 border-emerald-100" : "border-slate-100"}`}>
                      <input
                        type="checkbox"
                        checked={t.completed}
                        onChange={(e) => toggleTask(t.id, e.target.checked)}
                        className="mt-0.5 accent-brand-500"
                      />
                      <div className="flex-1">
                        <p className={`text-sm font-medium ${t.completed ? "line-through text-slate-400" : "text-navy-900"}`}>{t.subject}</p>
                        <p className="text-xs text-slate-500">{t.task}</p>
                      </div>
                      <span className="text-xs text-slate-400 flex items-center gap-1 flex-shrink-0"><Clock size={11} />{t.duration_minutes}m</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </AppLayout>
  );
}
