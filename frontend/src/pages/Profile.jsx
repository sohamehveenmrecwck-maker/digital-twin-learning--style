import React, { useState } from "react";
import { Pencil, Save, X } from "lucide-react";
import AppLayout from "../components/AppLayout.jsx";
import { SuccessBanner, ErrorBanner } from "../components/Shared.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../api/client";

const TIME_OPTIONS = ["Morning (6 AM - 10 AM)", "Afternoon (12 PM - 4 PM)", "Evening (6 PM - 10 PM)", "Late Night (10 PM - 1 AM)"];
const DURATION_OPTIONS = ["1 hour", "2 hours", "3 - 4 hours", "5+ hours"];

export default function Profile() {
  const { user, refreshUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(user || {});
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);

  const startEdit = () => {
    setForm(user);
    setEditing(true);
    setError("");
  };

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await api.put("/api/auth/me", {
        full_name: form.full_name,
        academic_year: form.academic_year,
        branch: form.branch,
        college_name: form.college_name,
        preferred_study_time: form.preferred_study_time,
        daily_study_time: form.daily_study_time,
        goals: form.goals,
      });
      await refreshUser();
      setEditing(false);
      setSuccess("Profile updated successfully.");
      setTimeout(() => setSuccess(""), 2500);
    } catch (err) {
      setError(err.response?.data?.detail || "Could not save profile.");
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  return (
    <AppLayout title="My Profile" subtitle="Your student information and preferences">
      <div className="max-w-3xl space-y-6">
        {success && <SuccessBanner message={success} />}
        {error && <ErrorBanner message={error} />}

        <div className="card flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-2xl font-bold">
              {user.full_name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-lg font-bold text-navy-900">{user.full_name}</h2>
              <p className="text-sm text-slate-500">{user.email}</p>
              <p className="text-xs text-slate-400">Roll No: {user.roll_number}</p>
            </div>
          </div>
          {!editing && (
            <button onClick={startEdit} className="btn-secondary text-sm"><Pencil size={14} /> Edit</button>
          )}
        </div>

        {editing ? (
          <form onSubmit={handleSave} className="card space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Full Name</label>
                <input className="input-field" value={form.full_name} onChange={update("full_name")} />
              </div>
              <div>
                <label className="label">College Name</label>
                <input className="input-field" value={form.college_name} onChange={update("college_name")} />
              </div>
              <div>
                <label className="label">Academic Year</label>
                <input className="input-field" value={form.academic_year} onChange={update("academic_year")} />
              </div>
              <div>
                <label className="label">Branch</label>
                <input className="input-field" value={form.branch} onChange={update("branch")} />
              </div>
              <div>
                <label className="label">Preferred Study Time</label>
                <select className="input-field" value={form.preferred_study_time} onChange={update("preferred_study_time")}>
                  {TIME_OPTIONS.map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Daily Study Time</label>
                <select className="input-field" value={form.daily_study_time} onChange={update("daily_study_time")}>
                  {DURATION_OPTIONS.map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="label">Goals</label>
              <textarea className="input-field" rows={3} value={form.goals} onChange={update("goals")} />
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={saving} className="btn-primary"><Save size={15} /> {saving ? "Saving..." : "Save Changes"}</button>
              <button type="button" onClick={() => setEditing(false)} className="btn-secondary"><X size={15} /> Cancel</button>
            </div>
          </form>
        ) : (
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="card space-y-3">
              <h3 className="font-semibold text-navy-900 mb-1">Academic Details</h3>
              <Row label="Academic Year" value={user.academic_year} />
              <Row label="Branch" value={user.branch} />
              <Row label="College" value={user.college_name} />
            </div>
            <div className="card space-y-3">
              <h3 className="font-semibold text-navy-900 mb-1">Study Preferences</h3>
              <Row label="Preferred Time" value={user.preferred_study_time} />
              <Row label="Daily Study Time" value={user.daily_study_time} />
              <Row label="Goals" value={user.goals} />
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-slate-500">{label}</span>
      <span className="font-medium text-navy-900 text-right max-w-[60%]">{value || "—"}</span>
    </div>
  );
}
