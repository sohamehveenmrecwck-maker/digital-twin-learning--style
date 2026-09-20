import React, { useEffect, useState } from "react";
import { CheckCircle2, RotateCcw } from "lucide-react";
import AppLayout from "../components/AppLayout.jsx";
import { Loader, ErrorBanner } from "../components/Shared.jsx";
import api from "../api/client";

export default function LearningStyle() {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [existingResult, setExistingResult] = useState(null);
  const [error, setError] = useState("");
  const [retaking, setRetaking] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get("/api/learning-style/questions"),
      api.get("/api/learning-style/result"),
    ]).then(([qRes, rRes]) => {
      setQuestions(qRes.data);
      if (rRes.data.completed) {
        setExistingResult(rRes.data);
      }
    }).finally(() => setLoading(false));
  }, []);

  const selectAnswer = (qid, key) => {
    setAnswers((a) => ({ ...a, [qid]: key }));
  };

  const handleNext = () => {
    if (current < questions.length - 1) setCurrent((c) => c + 1);
  };
  const handlePrev = () => {
    if (current > 0) setCurrent((c) => c - 1);
  };

  const handleSubmit = async () => {
    setError("");
    if (Object.keys(answers).length < questions.length) {
      setError("Please answer all questions before submitting.");
      return;
    }
    setSubmitting(true);
    try {
      const orderedAnswers = questions.map((q) => answers[q.id]);
      const res = await api.post("/api/learning-style/submit", { answers: orderedAnswers });
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const restart = () => {
    setAnswers({});
    setCurrent(0);
    setResult(null);
    setExistingResult(null);
    setRetaking(true);
  };

  if (loading) {
    return <AppLayout title="Learning Style"><Loader label="Loading assessment..." /></AppLayout>;
  }

  const finalResult = result || existingResult;
  if (finalResult && !retaking) {
    return (
      <AppLayout title="Learning Style Assessment" subtitle="Your personalized learning profile">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="card text-center">
            <div className="w-16 h-16 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={32} />
            </div>
            <p className="text-sm text-slate-500">Your Learning Style</p>
            <h2 className="text-2xl font-bold text-navy-900 mt-1">{finalResult.style}</h2>
            <p className="text-sm text-slate-600 mt-3">{finalResult.explanation}</p>
          </div>

          <div className="card">
            <h3 className="font-semibold text-navy-900 mb-3">Score Breakdown</h3>
            <div className="space-y-2">
              {Object.entries(finalResult.scores).map(([key, val]) => (
                <div key={key}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="capitalize font-medium text-slate-600">{key}</span>
                    <span className="text-slate-400">{val} / {questions.length}</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-brand-500 rounded-full" style={{ width: `${(val / questions.length) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            <div className="card">
              <h3 className="font-semibold text-navy-900 mb-3">Personalized Learning Tips</h3>
              <ul className="space-y-2 text-sm text-slate-600">
                {finalResult.tips.map((t, i) => (
                  <li key={i} className="flex gap-2"><span className="text-brand-500">•</span>{t}</li>
                ))}
              </ul>
            </div>
            <div className="card">
              <h3 className="font-semibold text-navy-900 mb-3">Recommended Revision Techniques</h3>
              <ul className="space-y-2 text-sm text-slate-600">
                {finalResult.revision_techniques.map((t, i) => (
                  <li key={i} className="flex gap-2"><span className="text-brand-500">•</span>{t}</li>
                ))}
              </ul>
            </div>
          </div>

          <button onClick={restart} className="btn-secondary text-sm">
            <RotateCcw size={15} /> Retake Assessment
          </button>
        </div>
      </AppLayout>
    );
  }

  const q = questions[current];
  const progressPct = ((current + 1) / questions.length) * 100;

  return (
    <AppLayout title="Learning Style Assessment" subtitle="Answer a few questions to find out your learning style">
      <div className="max-w-2xl mx-auto card">
        {error && <div className="mb-4"><ErrorBanner message={error} /></div>}
        <p className="text-xs font-semibold text-brand-600 mb-1">Q{current + 1}.</p>
        <h2 className="text-lg font-semibold text-navy-900 mb-5">{q.question}</h2>

        <div className="space-y-3">
          {q.options.map((opt) => (
            <label
              key={opt.key}
              className={`flex items-center gap-3 border rounded-lg px-4 py-3 cursor-pointer transition-colors ${
                answers[q.id] === opt.key ? "border-brand-500 bg-brand-50" : "border-slate-200 hover:bg-slate-50"
              }`}
            >
              <input
                type="radio"
                name={`q-${q.id}`}
                checked={answers[q.id] === opt.key}
                onChange={() => selectAnswer(q.id, opt.key)}
                className="accent-brand-500"
              />
              <span className="text-sm text-navy-900">{opt.text}</span>
            </label>
          ))}
        </div>

        <div className="mt-6">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span>{current + 1} of {questions.length}</span>
          </div>
          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mb-5">
            <div className="h-full bg-brand-500 rounded-full transition-all" style={{ width: `${progressPct}%` }} />
          </div>
          <div className="flex justify-between gap-3">
            <button onClick={handlePrev} disabled={current === 0} className="btn-secondary">Previous</button>
            {current < questions.length - 1 ? (
              <button onClick={handleNext} disabled={!answers[q.id]} className="btn-primary">Next</button>
            ) : (
              <button onClick={handleSubmit} disabled={submitting || !answers[q.id]} className="btn-primary">
                {submitting ? "Submitting..." : "Submit Assessment"}
              </button>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
