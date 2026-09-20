import React, { useEffect, useState } from "react";
import { Fingerprint, Lightbulb } from "lucide-react";
import AppLayout from "../components/AppLayout.jsx";
import { Loader, EmptyState } from "../components/Shared.jsx";
import api from "../api/client";

export default function DigitalTwin() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/api/digital-twin").then((res) => setData(res.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <AppLayout title="Your Digital Twin"><Loader label="Building your Digital Twin..." /></AppLayout>;

  return (
    <AppLayout title="Your Digital Twin" subtitle="Based on your performance, habits and learning style">
      <div className="space-y-6">
        <div className="card flex flex-wrap items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-2xl font-bold flex-shrink-0">
            {data.profile.full_name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-[200px]">
            <h2 className="text-lg font-bold text-navy-900">{data.profile.full_name}</h2>
            <p className="text-sm text-slate-500">{data.profile.academic_year} · {data.profile.branch} · Roll No: {data.profile.roll_number}</p>
            <p className="text-xs text-slate-400">{data.profile.college_name}</p>
          </div>
          <div className="bg-brand-50 rounded-xl px-4 py-3 text-center">
            <p className="text-xs text-slate-500">Learning Style</p>
            <p className="text-sm font-bold text-brand-600 flex items-center gap-1 justify-center mt-0.5">
              <Fingerprint size={14} /> {data.learning_style || "Not assessed"}
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="card">
            <h3 className="font-semibold text-navy-900 mb-3">Strong Areas</h3>
            {data.strong_areas.length ? (
              <div className="space-y-2">
                {data.strong_areas.map((a) => <div key={a} className="badge bg-emerald-50 text-emerald-600 block w-fit">{a}</div>)}
              </div>
            ) : <p className="text-sm text-slate-400">None identified yet.</p>}
          </div>
          <div className="card">
            <h3 className="font-semibold text-navy-900 mb-3">Weak Areas</h3>
            {data.weak_areas.length ? (
              <div className="space-y-2">
                {data.weak_areas.map((a) => <div key={a} className="badge bg-red-50 text-red-600 block w-fit">{a}</div>)}
              </div>
            ) : <p className="text-sm text-slate-400">None identified yet.</p>}
          </div>
          <div className="card">
            <h3 className="font-semibold text-navy-900 mb-3">Top Recommendation</h3>
            <div className="flex items-start gap-2">
              <Lightbulb className="text-brand-500 flex-shrink-0 mt-0.5" size={16} />
              <p className="text-sm text-slate-600">{data.top_recommendation}</p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="card">
            <h3 className="font-semibold text-navy-900 mb-3">Academic Performance</h3>
            {data.has_subject_data ? (
              <>
                <p className="text-3xl font-bold text-navy-900">{data.current_performance}%</p>
                <p className="text-xs text-slate-500">Current overall percentage</p>
                {data.quiz_average !== null && (
                  <p className="text-xs text-slate-500 mt-2">Average quiz score: <b className="text-navy-900">{data.quiz_average}%</b></p>
                )}
              </>
            ) : <EmptyState message="Enter your subject marks to see your performance summary here." />}
          </div>
          <div className="card">
            <h3 className="font-semibold text-navy-900 mb-3">Study Preferences</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-slate-500">Preferred Time</span><span className="font-medium text-navy-900">{data.study_preferences.preferred_time}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Daily Study Time</span><span className="font-medium text-navy-900">{data.study_preferences.daily_study_time}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Goals</span><span className="font-medium text-navy-900 text-right max-w-[60%]">{data.study_preferences.goals}</span></div>
            </div>
          </div>
        </div>

        {data.has_learning_style && (
          <div className="card">
            <h3 className="font-semibold text-navy-900 mb-3">Personalized Learning Tips</h3>
            <ul className="grid sm:grid-cols-2 gap-2 text-sm text-slate-600">
              {data.learning_style_tips.map((t, i) => (
                <li key={i} className="flex gap-2"><span className="text-brand-500">•</span>{t}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="card bg-brand-50/50 border-brand-100 text-sm text-slate-600 flex items-start gap-2">
          <Fingerprint className="text-brand-500 flex-shrink-0 mt-0.5" size={16} />
          <p>Your Digital Twin is a live learning profile that updates automatically as you enter marks, complete quizzes, and record study progress.</p>
        </div>
      </div>
    </AppLayout>
  );
}
