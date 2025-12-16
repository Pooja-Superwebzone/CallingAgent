import React, { useMemo, useState } from "react";

const QUESTIONS = [
  { q: "What is the capital of France?", a: ["Paris", "London", "Berlin", "Rome"], correct: 0 },
  { q: "Which keyword creates a constant in JavaScript?", a: ["let", "var", "const", "static"], correct: 2 },
  { q: "HTTP status 200 means:", a: ["Bad Request", "OK", "Not Found", "Unauthorized"], correct: 1 },
  { q: "Which array method adds to the end?", a: ["shift", "pop", "unshift", "push"], correct: 3 },
  { q: "React hook for local state:", a: ["useEffect", "useState", "useMemo", "useRef"], correct: 1 },
  { q: "CSS property for text color:", a: ["background", "font-size", "color", "border"], correct: 2 },
  { q: "Primary language of the web:", a: ["Python", "C#", "JavaScript", "Go"], correct: 2 },
  { q: "Git command to stage files:", a: ["git push", "git add", "git pull", "git init"], correct: 1 },
  { q: "SQL SELECT retrieves:", a: ["Data", "Tables", "Indexes", "Users"], correct: 0 },
  { q: "2 + 2 * 2 =", a: ["6", "8", "4", "2"], correct: 0 },
  { q: "Which is a NoSQL DB?", a: ["PostgreSQL", "MySQL", "MongoDB", "SQLite"], correct: 2 },
  { q: "Flexbox main axis alignment:", a: ["align-items", "justify-content", "position", "display"], correct: 1 },
  { q: "CSS units rem is based on:", a: ["Parent", "Viewport", "Root font-size", "Element"], correct: 2 },
  { q: "Which hook for memoized calc?", a: ["useState", "useMemo", "useRef", "useLayoutEffect"], correct: 1 },
  { q: "JS strict equality is:", a: ["==", "===", "=", "!=="], correct: 1 },
  { q: "HTTP method to update partially:", a: ["GET", "POST", "PUT", "PATCH"], correct: 3 },
  { q: "LocalStorage stores:", a: ["Session-only data", "Server files", "Key/value strings", "Cookies"], correct: 2 },
  { q: "Promise resolve handler:", a: ["catch", "finally", "then", "await"], correct: 2 },
  { q: "React components must return:", a: ["string", "number", "JSX/element", "object"], correct: 2 },
  { q: "Which is a CSS preprocessor?", a: ["LESS", "JSON", "HTML", "XML"], correct: 0 },
];

export default function ExamMcq() {
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const score = useMemo(() => {
    return QUESTIONS.reduce((acc, q, idx) => {
      return acc + (answers[idx] === q.correct ? 1 : 0);
    }, 0);
  }, [answers]);

  const handleSelect = (idx, choice) => {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [idx]: choice }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 text-slate-900 px-6 py-10">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="space-y-2">
          <p className="inline-flex items-center rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
            MCQ Exam
          </p>
          <h1 className="text-3xl font-extrabold tracking-tight">20 Questions</h1>
          <p className="text-slate-600">
            Select one answer per question. Submit to see your score. Editing is disabled after submit.
          </p>
          {submitted && (
            <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-emerald-700 text-sm">
              Score: {score} / {QUESTIONS.length}
            </div>
          )}
        </header>

        <div className="space-y-4">
          {QUESTIONS.map((q, idx) => (
            <div key={idx} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-start gap-2">
                <span className="mt-1 text-sm font-semibold text-indigo-700">{idx + 1}.</span>
                <p className="text-base font-medium text-slate-900">{q.q}</p>
              </div>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {q.a.map((choice, cIdx) => {
                  const selected = answers[idx] === cIdx;
                  return (
                    <button
                      key={cIdx}
                      type="button"
                      onClick={() => handleSelect(idx, cIdx)}
                      className={`w-full rounded-lg border px-3 py-2 text-left text-sm transition ${
                        selected
                          ? "border-indigo-500 bg-indigo-50 text-indigo-800"
                          : "border-slate-200 bg-white text-slate-800 hover:border-indigo-300"
                      } ${submitted && q.correct === cIdx ? "ring-2 ring-emerald-300" : ""}`}
                    >
                      {choice}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => setSubmitted(true)}
            className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow transition hover:bg-indigo-700"
          >
            Submit Exam
          </button>
          {submitted && (
            <div className="text-sm text-slate-600">
              Your answers are locked. Score:{" "}
              <span className="font-semibold text-slate-900">
                {score} / {QUESTIONS.length}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

