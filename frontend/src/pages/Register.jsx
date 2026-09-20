import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { ErrorBanner } from "../components/Shared.jsx";

const ACADEMIC_YEARS = ["1st Year", "2nd Year", "3rd Year", "4th Year"];
const BRANCHES = ["CSE", "IT", "ECE", "EEE", "Mechanical", "Civil", "Other"];

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    full_name: "", email: "", roll_number: "", password: "", confirm_password: "",
    academic_year: "3rd Year", branch: "CSE", college_name: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const validate = () => {
    if (!form.full_name || !form.email || !form.roll_number || !form.password || !form.college_name) {
      return "Please fill in all required fields.";
    }
    if (form.password.length < 6) return "Password must be at least 6 characters.";
    if (form.password !== form.confirm_password) return "Passwords do not match.";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return "Please enter a valid email address.";
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const v = validate();
    if (v) {
      setError(v);
      return;
    }
    setError("");
    setLoading(true);
    try {
      await register(form);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.detail || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f7fc] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-2xl">
        <div className="card">
          <div className="flex flex-col items-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-brand-500 flex items-center justify-center mb-3">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-xl font-bold text-navy-900">Create your Digital Twin account</h1>
            <p className="text-sm text-slate-500 mt-1">Start tracking your learning journey</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <ErrorBanner message={error} />}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Full Name</label>
                <input className="input-field" value={form.full_name} onChange={update("full_name")} placeholder="Soha Mehveen" />
              </div>
              <div>
                <label className="label">Email</label>
                <input className="input-field" value={form.email} onChange={update("email")} placeholder="you@example.com" />
              </div>
              <div>
                <label className="label">Roll Number</label>
                <input className="input-field" value={form.roll_number} onChange={update("roll_number")} placeholder="24R01A05C" />
              </div>
              <div>
                <label className="label">College Name</label>
                <input className="input-field" value={form.college_name} onChange={update("college_name")} placeholder="ABC College of Engineering" />
              </div>
              <div>
                <label className="label">Academic Year</label>
                <select className="input-field" value={form.academic_year} onChange={update("academic_year")}>
                  {ACADEMIC_YEARS.map((y) => <option key={y}>{y}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Branch</label>
                <select className="input-field" value={form.branch} onChange={update("branch")}>
                  {BRANCHES.map((b) => <option key={b}>{b}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Password</label>
                <input type="password" className="input-field" value={form.password} onChange={update("password")} placeholder="At least 6 characters" />
              </div>
              <div>
                <label className="label">Confirm Password</label>
                <input type="password" className="input-field" value={form.confirm_password} onChange={update("confirm_password")} placeholder="Re-enter password" />
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3">
              {loading ? "Creating account..." : "Register"}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-5">
            Already have an account?{" "}
            <Link to="/login" className="text-brand-600 font-medium hover:underline">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
