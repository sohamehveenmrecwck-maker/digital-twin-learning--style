import React from "react";
import { Link } from "react-router-dom";
import { Sparkles, Brain, LineChart, CalendarClock, Bot, TrendingUp } from "lucide-react";

const FEATURES = [
  { icon: Brain, title: "Learning Style Assessment", desc: "Discover whether you learn best visually, by listening, reading or doing." },
  { icon: LineChart, title: "Performance Tracking", desc: "Track marks, quizzes and progress for every subject in one place." },
  { icon: CalendarClock, title: "Personalized Study Plans", desc: "Get a weekly plan built around your weak subjects and learning style." },
  { icon: Bot, title: "AI Recommendations", desc: "Receive subject-specific tips instead of generic advice." },
  { icon: TrendingUp, title: "Academic Performance Prediction", desc: "See an explainable, honest estimate of where you're headed." },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#f4f7fc]">
      <header className="flex items-center justify-between px-6 md:px-12 py-5 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-brand-500 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="font-semibold text-lg text-navy-900">Digital Twin</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login" className="text-sm font-medium text-slate-600 hover:text-navy-900 px-3 py-2">Login</Link>
          <Link to="/register" className="btn-primary text-sm">Register</Link>
        </div>
      </header>

      <section className="max-w-7xl mx-auto px-6 md:px-12 py-10 md:py-16 grid md:grid-cols-2 gap-10 items-center">
        <div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-navy-900 leading-tight">
            Your Learning Style.<br />Your Strength.<br />
            <span className="text-brand-500">Our AI.</span>
          </h1>
          <p className="mt-5 text-slate-600 text-base md:text-lg max-w-lg">
            Digital Twin of Human Learning Style is an AI-powered platform that understands how you learn,
            tracks your academic performance, and gives you personalized study plans to help you improve —
            built for B.Tech CSE students.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link to="/register" className="btn-primary px-6 py-3 text-base">Get Started</Link>
            <a href="#features" className="btn-secondary px-6 py-3 text-base">Learn More</a>
          </div>
        </div>
        <div className="card p-8 flex items-center justify-center bg-gradient-to-br from-brand-50 to-white">
          <div className="grid grid-cols-2 gap-4 w-full">
            {FEATURES.slice(0, 4).map((f) => (
              <div key={f.title} className="bg-white rounded-xl p-4 shadow-card flex flex-col items-start gap-2">
                <div className="w-9 h-9 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center">
                  <f.icon size={18} />
                </div>
                <p className="text-xs font-semibold text-navy-900 leading-snug">{f.title}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="max-w-7xl mx-auto px-6 md:px-12 pb-20">
        <h2 className="text-xl font-bold text-navy-900 mb-6">Key Features</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {FEATURES.map((f) => (
            <div key={f.title} className="card text-center flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
                <f.icon size={22} />
              </div>
              <p className="text-sm font-semibold text-navy-900">{f.title}</p>
              <p className="text-xs text-slate-500">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="text-center text-xs text-slate-400 pb-8">
        Digital Twin of Human Learning Style — B.Tech CSE College Project
      </footer>
    </div>
  );
}
