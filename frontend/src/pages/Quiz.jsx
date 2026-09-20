import React, { useEffect, useState } from "react";
import { Clock, CheckCircle2, XCircle, History, ListChecks } from "lucide-react";
import AppLayout from "../components/AppLayout.jsx";
import { Loader, EmptyState, ErrorBanner } from "../components/Shared.jsx";
import api from "../api/client";

const OPTION_KEYS = ["a", "b", "c", "d"];

export default function Quiz() {
  const [subjects, setSubjects] = useState([]);
  const [history, setHistory] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get("/api/quiz/subjects"), api.get("/api/quiz/history")])
      .then(([sRes, hRes]) => { setSubjects(sRes.data); setHistory(hRes.data); })
      .finally(() => setPageLoading(false));
  }, []);

  const startQuiz = async (subject) => {
    setError("");
    setLoading(true);
    try {
      const res = await api.get(`/api/quiz/questions/${encodeURIComponent(subject)}`);
      setQuestions(res.data);
      setSelectedSubject(subject);
      setCurrent(0);
      setAnswers({});
      setResult(null);
    } catch (err) {
      setError(err.response?.data?.detail || "Could not load questions for this subject.");
    } finally {
      setLoading(false);
    }
  };

  const selectOption = (qId, key) => setAnswers((a) => ({ ...a, [qId]: key }));

  const submitQuiz = async () => {
    setLoading(true);
    setError("");
    try {
      const payload = {
        subject: selectedSubject,
        answers: questions.map((q) => ({ question_id: q.id, selected_option: answers[q.id] || "" })),
      };
      const res = await api.post("/api/quiz/submit", payload);
      setResult(res.data);
      const hRes = await api.get("/api/quiz/history");
      setHistory(hRes.data);
    } catch (err) {
      setError(err.response?.data?.detail || "Could not submit quiz.");
    } finally {
      setLoading(false);
    }
  };

  const resetAll = () => {
    setSelectedSubject(null);
    setQuestions([]);
    setResult(null);
    setAnswers({});
    setCurrent(0);
  };

  if (pageLoading) {
    return <AppLayout title="Quiz"><Loader label="Loading quiz module..." /></AppLayout>;
  }

  // Subject selection screen
  if (!selectedSubject) {
    return (
      <AppLayout title="Quiz" subtitle="Select a subject to test your knowledge">
        {error && <div className="mb-4"><ErrorBanner message={error} /></div>}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {subjects.map((s) => (
            <button
              key={s}
              onClick={() => startQuiz(s)}
              disabled={loading}
              className="card text-left hover:border-brand-300 hover:shadow-md transition-all flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center flex-shrink-0">
                <ListChecks size={18} />
              </div>
              <div>
                <p className="font-semibold text-navy-900 text-sm">{s}</p>
                <p className="text-xs text-slate-400">Multiple choice · 12 questions</p>
              </div>
            </button>
          ))}
        </div>

        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <History size={18} className="text-slate-500" />
            <h3 className="font-semibold text-navy-900">Quiz History</h3>
          </div>
          {history.length === 0 ? (
            <EmptyState message="You haven't taken any quizzes yet. Pick a subject above to get started." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-slate-500 border-b border-slate-100">
                    <th className="py-2 pr-4 font-medium">Subject</th>
                    <th className="py-2 pr-4 font-medium">Score</th>
                    <th className="py-2 pr-4 font-medium">Correct/Total</th>
                    <th className="py-2 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((h) => (
                    <tr key={h.id} className="border-b border-slate-50 last:border-0">
                      <td className="py-2.5 pr-4 font-medium text-navy-900">{h.subject}</td>
                      <td className="py-2.5 pr-4">
                        <span className={`badge ${h.score_percentage >= 60 ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"}`}>
                          {h.score_percentage}%
                        </span>
                      </td>
                      <td className="py-2.5 pr-4 text-slate-600">{h.correct_answers}/{h.total_questions}</td>
                      <td className="py-2.5 text-slate-500 text-xs">{new Date(h.taken_at).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </AppLayout>
    );
  }

  // Result screen
  if (result) {
    return (
      <AppLayout title={`${result.subject} Quiz Result`}>
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="card text-center">
            <p className="text-sm text-slate-500">Your Score</p>
            <h2 className="text-4xl font-bold text-navy-900 my-2">{result.score_percentage}%</h2>
            <div className="flex justify-center gap-6 text-sm mt-3">
              <span className="text-emerald-600 font-medium">{result.correct_answers} Correct</span>
              <span className="text-red-500 font-medium">{result.wrong_answers} Wrong</span>
              <span className="text-slate-500">{result.total_questions} Total</span>
            </div>
          </div>

          {result.weak_topics.length > 0 && (
            <div className="card">
              <h3 className="font-semibold text-navy-900 mb-2">Suggested Revision Topics</h3>
              <div className="flex flex-wrap gap-2">
                {result.weak_topics.map((t) => (
                  <span key={t} className="badge bg-amber-50 text-amber-600">{t}</span>
                ))}
              </div>
            </div>
          )}

          <div className="card">
            <h3 className="font-semibold text-navy-900 mb-4">Answer Review</h3>
            <div className="space-y-4">
              {result.details.map((d, i) => (
                <div key={d.question_id} className="border-b border-slate-50 last:border-0 pb-4 last:pb-0">
                  <div className="flex items-start gap-2 mb-1">
                    {d.is_correct ? (
                      <CheckCircle2 className="text-emerald-500 flex-shrink-0 mt-0.5" size={16} />
                    ) : (
                      <XCircle className="text-red-500 flex-shrink-0 mt-0.5" size={16} />
                    )}
                    <p className="text-sm font-medium text-navy-900">{i + 1}. {d.question}</p>
                  </div>
                  <p className="text-xs text-slate-500 ml-6">
                    Your answer: <b className="uppercase">{d.selected_option || "—"}</b>
                    {!d.is_correct && <> · Correct: <b className="uppercase">{d.correct_option}</b></>}
                  </p>
                  {d.explanation && <p className="text-xs text-slate-400 ml-6 mt-1">{d.explanation}</p>}
                </div>
              ))}
            </div>
          </div>

          <button onClick={resetAll} className="btn-primary w-full py-3">Back to Quizzes</button>
        </div>
      </AppLayout>
    );
  }

  // Taking quiz screen
  const q = questions[current];
  return (
    <AppLayout title={`${selectedSubject} Quiz`}>
      <div className="max-w-2xl mx-auto card">
        {error && <div className="mb-4"><ErrorBanner message={error} /></div>}
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs text-slate-500">{current + 1} of {questions.length} questions · Multiple Choice</p>
          <span className="badge bg-slate-100 text-slate-500"><Clock size={12} className="inline mr-1" />{q.topic}</span>
        </div>
        <h2 className="text-lg font-semibold text-navy-900 mb-5">Q{current + 1}. {q.question}</h2>

        <div className="space-y-3 mb-6">
          {OPTION_KEYS.map((key) => (
            <label
              key={key}
              className={`flex items-center gap-3 border rounded-lg px-4 py-3 cursor-pointer transition-colors ${
                answers[q.id] === key ? "border-brand-500 bg-brand-50" : "border-slate-200 hover:bg-slate-50"
              }`}
            >
              <input type="radio" name={`quiz-q-${q.id}`} checked={answers[q.id] === key} onChange={() => selectOption(q.id, key)} className="accent-brand-500" />
              <span className="text-sm text-navy-900">{q[`option_${key}`]}</span>
            </label>
          ))}
        </div>

        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mb-5">
          <div className="h-full bg-brand-500 rounded-full transition-all" style={{ width: `${((current + 1) / questions.length) * 100}%` }} />
        </div>

        <div className="flex justify-between gap-3">
          <button onClick={() => setCurrent((c) => Math.max(0, c - 1))} disabled={current === 0} className="btn-secondary">Previous</button>
          {current < questions.length - 1 ? (
            <button onClick={() => setCurrent((c) => c + 1)} className="btn-primary">Next</button>
          ) : (
            <button onClick={submitQuiz} disabled={loading} className="btn-primary">{loading ? "Submitting..." : "Submit Quiz"}</button>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
