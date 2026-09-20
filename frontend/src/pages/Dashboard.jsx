import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { BookOpen, ListChecks, Clock, TrendingUp, ArrowRight, Lightbulb, PlusCircle } from "lucide-react";
import AppLayout from "../components/AppLayout.jsx";
import { StatCard, Loader, EmptyState, PriorityBadge } from "../components/Shared.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../api/client";

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/api/dashboard").then((res) => setData(res.data)).finally(() => setLoading(false));
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";

  return (
    <AppLayout title="Dashboard" subtitle="Your learning overview">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-navy-900">{greeting}, {user?.full_name?.split(" ")[0] || "Student"}!</h2>
        <p className="text-slate-500 text-sm mt-1">Keep going! You're doing great.</p>
      </div>

      {loading ? <Loader label="Loading your dashboard..." /> : data && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={BookOpen} label="Total Subjects" value={data.total_subjects} color="brand" />
            <StatCard icon={ListChecks} label="Quizzes Taken" value={data.quizzes_taken} color="green" />
            <StatCard icon={Clock} label="Study Time" value={`${data.total_study_time_hours} hrs`} color="orange" />
            <StatCard icon={TrendingUp} label="Overall Progress" value={`${data.overall_progress}%`} color="purple" />
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 card">
              <h3 className="font-semibold text-navy-900 mb-4">Subject Performance</h3>
              {data.has_subject_data ? (
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={data.subject_performance}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eef1f6" />
                    <XAxis dataKey="subject" tick={{ fontSize: 11 }} interval={0} angle={-10} textAnchor="end" height={50} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(v) => `${v}%`} />
                    <Bar dataKey="percentage" radius={[6, 6, 0, 0]} fill="#2f6bff" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <EmptyState
                  message="Enter your subject marks to view your performance analytics."
                  action={<Link to="/subjects" className="btn-primary mt-3 text-sm"><PlusCircle size={16} />Add Subjects</Link>}
                />
              )}
            </div>

            <div className="card">
              <h3 className="font-semibold text-navy-900 mb-4">Weak Subjects</h3>
              {data.weak_subjects?.length ? (
                <div className="space-y-3">
                  {data.weak_subjects.map((s) => (
                    <div key={s.name}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="font-medium text-navy-900">{s.name}</span>
                        <span className="text-slate-500">{s.current_percentage}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-red-400 rounded-full" style={{ width: `${s.current_percentage}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-400">No weak subjects identified yet.</p>
              )}
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="card">
              <h3 className="font-semibold text-navy-900 mb-4">Strong Subjects</h3>
              {data.strong_subjects?.length ? (
                <div className="space-y-2">
                  {data.strong_subjects.map((s) => (
                    <div key={s.name} className="flex items-center justify-between text-sm bg-emerald-50 rounded-lg px-3 py-2">
                      <span className="font-medium text-navy-900">{s.name}</span>
                      <span className="text-emerald-600 font-semibold">{s.current_percentage}%</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-400">Keep improving to see strong subjects here.</p>
              )}
            </div>

            <div className="card">
              <h3 className="font-semibold text-navy-900 mb-3">Academic Performance Prediction</h3>
              <p className="text-3xl font-bold text-navy-900">{data.overall_progress}%</p>
              <p className="text-xs text-slate-500 mb-2">Current overall average</p>
              <Link to="/subjects" className="text-brand-600 text-sm font-medium inline-flex items-center gap-1 hover:underline">
                View full prediction <ArrowRight size={14} />
              </Link>
            </div>

            <div className="card bg-brand-50/60 border-brand-100">
              <div className="flex items-center gap-2 mb-2">
                <Lightbulb className="text-brand-600" size={18} />
                <h3 className="font-semibold text-navy-900">Next Suggested Step</h3>
              </div>
              <p className="text-sm text-slate-600">{data.next_suggested_step}</p>
            </div>
          </div>

          <div className="card">
            <h3 className="font-semibold text-navy-900 mb-4">Quick Links</h3>
            <div className="flex flex-wrap gap-3">
              <Link to="/quiz" className="btn-secondary text-sm">Take a Quiz</Link>
              <Link to="/subjects" className="btn-secondary text-sm">Enter Marks</Link>
              <Link to="/study-planner" className="btn-secondary text-sm">View Study Plan</Link>
              <Link to="/learning-style" className="btn-secondary text-sm">
                {data.has_learning_style ? "Retake Learning Style Assessment" : "Take Learning Style Assessment"}
              </Link>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
