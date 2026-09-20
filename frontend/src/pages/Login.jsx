import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Sparkles, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { ErrorBanner } from "../components/Shared.jsx";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!identifier || !password) {
      setError("Please enter your email/roll number and password.");
      return;
    }
    setLoading(true);
    try {
      await login(identifier, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.detail || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f7fc] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="card">
          <div className="flex flex-col items-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-brand-500 flex items-center justify-center mb-3">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-xl font-bold text-navy-900">Digital Twin</h1>
            <p className="text-sm text-slate-500 mt-1">Login to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <ErrorBanner message={error} />}
            <div>
              <label className="label">Email or Roll Number</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-slate-400" size={16} />
                <input
                  className="input-field pl-9"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="you@example.com or roll number"
                />
              </div>
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-slate-400" size={16} />
                <input
                  type={showPassword ? "text" : "password"}
                  className="input-field pl-9 pr-9"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                />
                <button type="button" onClick={() => setShowPassword((s) => !s)} className="absolute right-3 top-3 text-slate-400">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3">
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-5">
            Don't have an account?{" "}
            <Link to="/register" className="text-brand-600 font-medium hover:underline">Register</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
