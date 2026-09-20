import React, { useEffect, useState } from "react";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from "recharts";
import { Plus, Pencil, Trash2, X, BookOpen } from "lucide-react";
import AppLayout from "../components/AppLayout.jsx";
import { Loader, EmptyState, ErrorBanner, SuccessBanner, PriorityBadge, TrendBadge } from "../components/Shared.jsx";
import api from "../api/client";

const COMMON_SUBJECTS = ["DBMS", "Computer Networks", "Artificial Intelligence", "Cloud Computing", "Compiler Design", "Deep Learning"];

const emptyForm = {
  name: "", internal_marks: "", assignment_marks: "", mid_exam_marks: "",
  previous_semester_marks: "", current_marks: "", total_marks: "100", attendance: "",
};

export default function Subjects() {
  const [subjects, setSubjects] = useState([]);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadAll = async () => {
    setLoading(true);
    try {
      const [sRes, aRes] = await Promise.all([
        api.get("/api/subjects"),
        api.get("/api/subjects/analysis/prediction"),
      ]);
      setSubjects(sRes.data);
      setAnalysis(aRes.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAll(); }, []);

  const openAddForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(true);
    setError("");
  };

  const openEditForm = (s) => {
    setForm({
      name: s.name,
      internal_marks: s.internal_marks, assignment_marks: s.assignment_marks,
      mid_exam_marks: s.mid_exam_marks, previous_semester_marks: s.previous_semester_marks,
      current_marks: s.current_marks, total_marks: s.total_marks, attendance: s.attendance,
    });
    setEditingId(s.id);
    setShowForm(true);
    setError("");
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this subject? This cannot be undone.")) return;
    await api.delete(`/api/subjects/${id}`);
    setSuccess("Subject deleted.");
    loadAll();
    setTimeout(() => setSuccess(""), 2500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.name.trim()) {
      setError("Subject name is required.");
      return;
    }
    const payload = {
      name: form.name.trim(),
      internal_marks: Number(form.internal_marks) || 0,
      assignment_marks: Number(form.assignment_marks) || 0,
      mid_exam_marks: Number(form.mid_exam_marks) || 0,
      previous_semester_marks: Number(form.previous_semester_marks) || 0,
      current_marks: Number(form.current_marks) || 0,
      total_marks: Number(form.total_marks) || 100,
      attendance: Number(form.attendance) || 0,
      topics_completed: 0,
      topics_total: 5,
    };
    try {
      if (editingId) {
        await api.put(`/api/subjects/${editingId}`, payload);
        setSuccess("Marks updated successfully.");
      } else {
        await api.post("/api/subjects", payload);
        setSuccess("Subject added successfully.");
      }
      setShowForm(false);
      loadAll();
      setTimeout(() => setSuccess(""), 2500);
    } catch (err) {
      setError(err.response?.data?.detail || "Could not save subject. Please check the marks entered.");
    }
  };

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const trendChartData = analysis?.has_data
    ? analysis.subjects.filter((s) => s.previous_percentage !== null).map((s) => ({
        subject: s.subject_name, Previous: s.previous_percentage, Current: s.current_percentage,
      }))
    : [];

  return (
    <AppLayout title="Academic Performance Analysis" subtitle="Enter marks and see your predicted performance">
      <div className="space-y-6">
        {success && <SuccessBanner message={success} />}

        {/* Subject Marks Section */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-navy-900">My Subjects</h3>
            <button onClick={openAddForm} className="btn-primary text-sm"><Plus size={16} /> Add Subject</button>
          </div>

          {loading ? <Loader /> : subjects.length === 0 ? (
            <EmptyState message="No subjects added yet. Add your first subject to start tracking your performance." icon={BookOpen} />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-slate-500 border-b border-slate-100">
                    <th className="py-2 pr-4 font-medium">Subject</th>
                    <th className="py-2 pr-4 font-medium">Internal</th>
                    <th className="py-2 pr-4 font-medium">Assignment</th>
                    <th className="py-2 pr-4 font-medium">Mid Exam</th>
                    <th className="py-2 pr-4 font-medium">Current</th>
                    <th className="py-2 pr-4 font-medium">Previous %</th>
                    <th className="py-2 pr-4 font-medium">Total</th>
                    <th className="py-2 pr-4 font-medium">Attendance</th>
                    <th className="py-2 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {subjects.map((s) => (
                    <tr key={s.id} className="border-b border-slate-50 last:border-0">
                      <td className="py-3 pr-4 font-medium text-navy-900">{s.name}</td>
                      <td className="py-3 pr-4 text-slate-600">{s.internal_marks}/20</td>
                      <td className="py-3 pr-4 text-slate-600">{s.assignment_marks}/10</td>
                      <td className="py-3 pr-4 text-slate-600">{s.mid_exam_marks}/20</td>
                      <td className="py-3 pr-4 text-slate-600">{s.current_marks}/50</td>
                      <td className="py-3 pr-4 text-slate-600">{s.previous_semester_marks || "—"}</td>
                      <td className="py-3 pr-4 text-slate-600">{s.total_marks}</td>
                      <td className="py-3 pr-4 text-slate-600">{s.attendance || "—"}</td>
                      <td className="py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => openEditForm(s)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500">
                            <Pencil size={15} />
                          </button>
                          <button onClick={() => handleDelete(s.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500">
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Analysis */}
        {analysis?.has_data ? (
          <>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="card md:col-span-2">
                <h3 className="font-semibold text-navy-900 mb-4">Subject Performance</h3>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={analysis.subjects.map((s) => ({ subject: s.subject_name, percentage: s.current_percentage }))}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eef1f6" />
                    <XAxis dataKey="subject" tick={{ fontSize: 11 }} interval={0} angle={-10} textAnchor="end" height={50} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(v) => `${v}%`} />
                    <Bar dataKey="percentage" radius={[6, 6, 0, 0]} fill="#2f6bff" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="card">
                <h3 className="font-semibold text-navy-900 mb-2">Academic Performance Prediction</h3>
                <p className="text-xs text-slate-400 mb-3">{analysis.note}</p>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between"><span className="text-slate-500">Current Average</span><span className="font-semibold text-navy-900">{analysis.overall_percentage}%</span></div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Estimated Next Performance</span>
                    <span className="font-semibold text-navy-900">{analysis.overall_predicted_percentage !== null ? `${analysis.overall_predicted_percentage}%` : "—"}</span>
                  </div>
                  <div className="flex justify-between items-center"><span className="text-slate-500">Trend</span><TrendBadge trend={analysis.overall_trend} /></div>
                  <div className="flex justify-between"><span className="text-slate-500">Confidence</span><span className="text-slate-600 text-xs text-right max-w-[140px]">{analysis.overall_confidence}</span></div>
                </div>
              </div>
            </div>

            {trendChartData.length > 0 && (
              <div className="card">
                <h3 className="font-semibold text-navy-900 mb-4">Performance Trend (Previous vs Current)</h3>
                <ResponsiveContainer width="100%" height={240}>
                  <LineChart data={trendChartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eef1f6" />
                    <XAxis dataKey="subject" tick={{ fontSize: 11 }} interval={0} angle={-10} textAnchor="end" height={50} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(v) => `${v}%`} />
                    <Legend />
                    <Line type="monotone" dataKey="Previous" stroke="#94a3b8" strokeWidth={2} />
                    <Line type="monotone" dataKey="Current" stroke="#2f6bff" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            <div className="card">
              <h3 className="font-semibold text-navy-900 mb-4">Subjects That Need Improvement</h3>
              {analysis.weak_subjects.length === 0 ? (
                <p className="text-sm text-slate-400">Great job — no subjects need urgent attention right now.</p>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {analysis.weak_subjects.map((s) => (
                    <div key={s.subject_id} className="border border-slate-100 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-navy-900">{s.subject_name}</h4>
                        <PriorityBadge priority={s.improvement_priority} />
                      </div>
                      <div className="flex gap-4 text-xs text-slate-500 mb-3">
                        <span>Current: <b className="text-navy-900">{s.current_percentage}%</b></span>
                        {s.previous_percentage !== null && <span>Previous: <b className="text-navy-900">{s.previous_percentage}%</b></span>}
                        <TrendBadge trend={s.trend} />
                      </div>
                      <p className="text-xs font-medium text-slate-500 mb-1">Suggested focus:</p>
                      <ul className="text-xs text-slate-600 space-y-1 mb-2">
                        {s.suggested_topics.map((t) => <li key={t} className="flex gap-1.5"><span className="text-brand-500">•</span>{t}</li>)}
                      </ul>
                      <p className="text-xs text-slate-500">Recommended study time: <b className="text-navy-900">{s.recommended_study_minutes} min/day</b></p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : !loading && (
          <div className="card">
            <EmptyState message={analysis?.message || "Enter your subject marks to view your performance analytics."} icon={BookOpen} />
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-40 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-xl2 max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-navy-900 text-lg">{editingId ? "Edit Subject" : "Add Subject"}</h3>
              <button onClick={() => setShowForm(false)}><X size={18} className="text-slate-400" /></button>
            </div>
            {error && <div className="mb-3"><ErrorBanner message={error} /></div>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Subject Name</label>
                <input list="subject-suggestions" className="input-field" value={form.name} onChange={update("name")} placeholder="e.g. DBMS" disabled={!!editingId} />
                <datalist id="subject-suggestions">
                  {COMMON_SUBJECTS.map((s) => <option key={s} value={s} />)}
                </datalist>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Internal Marks (max 20)</label>
                  <input type="number" min="0" max="20" className="input-field" value={form.internal_marks} onChange={update("internal_marks")} />
                </div>
                <div>
                  <label className="label">Assignment Marks (max 10)</label>
                  <input type="number" min="0" max="10" className="input-field" value={form.assignment_marks} onChange={update("assignment_marks")} />
                </div>
                <div>
                  <label className="label">Mid Exam Marks (max 20)</label>
                  <input type="number" min="0" max="20" className="input-field" value={form.mid_exam_marks} onChange={update("mid_exam_marks")} />
                </div>
                <div>
                  <label className="label">Current Marks (max 50)</label>
                  <input type="number" min="0" max="50" className="input-field" value={form.current_marks} onChange={update("current_marks")} />
                </div>
                <div>
                  <label className="label">Previous Semester (%)</label>
                  <input type="number" min="0" max="100" className="input-field" value={form.previous_semester_marks} onChange={update("previous_semester_marks")} />
                </div>
                <div>
                  <label className="label">Attendance (%) — optional</label>
                  <input type="number" min="0" max="100" className="input-field" value={form.attendance} onChange={update("attendance")} />
                </div>
              </div>
              <div>
                <label className="label">Total Marks (max possible)</label>
                <input type="number" min="1" className="input-field" value={form.total_marks} onChange={update("total_marks")} />
              </div>
              <button type="submit" className="btn-primary w-full py-3">Save Marks</button>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
