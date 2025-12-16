import React, { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

// Simple standalone page (no routing) with description and scheduling UI.
export default function ExamInfo() {
  const navigate = useNavigate();
  const today = useMemo(() => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }, []);

  const [selectedDate, setSelectedDate] = useState(today);
  const scheduleRef = useRef(null);
  const [showSchedule, setShowSchedule] = useState(false);
  const FIXED_TIME = "10:00";

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 text-slate-900 px-6 py-12">
      <div className="mx-auto flex max-w-7xl flex-col gap-10">
        <header className="space-y-3">
          <p className="inline-flex items-center rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
            Exam & Query Scheduling
          </p>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
            Prepare with confidence — pick your exam flow and get help fast.
          </h1>
          <p className="max-w-3xl text-lg text-slate-600">
            Review the exam description, start immediately, or schedule a 1:1 call.
            Choose a date (no past days) and we’ll lock in a perfect 10:00 AM slot for you.
          </p>
        </header>

        <section className="flex flex-col gap-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm w-full">
            <h2 className="text-2xl font-semibold text-slate-900">Description</h2>
            <p className="mt-3 text-slate-600 leading-relaxed">
              This exam covers core concepts, scenario-based questions, and practical
              reasoning to ensure you’re ready for real-world challenges. You can
              start right away, or schedule a call to clarify topics before you begin.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow transition hover:bg-indigo-700"
                onClick={() => navigate("/exam/start")}
              >
                Start Exam
              </button>
              <a
                href="#schedule"
                onClick={(e) => {
                  e.preventDefault();
                  setShowSchedule(true);
                  scheduleRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
                className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
              >
                Schedule a Query
              </a>
            </div>
          </div>

          {showSchedule && (
            <div
              id="schedule"
              ref={scheduleRef}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <h2 className="text-2xl font-semibold text-slate-900">Schedule a call</h2>
              <p className="mt-2 text-slate-600">
              Pick a date (no past days). Time is fixed at 10:00 AM.

              </p>

              <div className="mt-5 space-y-4">
                <div>
                  <label className="text-sm font-semibold text-slate-700">Select date</label>
                  <input
                    type="date"
                    min={today}
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-slate-700">Time</label>
                  <input
  type="time"
  value={FIXED_TIME}
  disabled
  className="mt-1 w-full cursor-not-allowed rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-sm text-slate-600"
/>

                </div>

                <div className="rounded-2xl bg-slate-50 border border-slate-200 px-4 py-3 text-sm text-slate-700">
                  <div>
                    <span className="font-semibold text-slate-900">Selected:</span>{" "}
                    {selectedDate || "—"} at 10:00 AM

                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    We’ll ensure previous dates stay unavailable.
                  </div>
                </div>

                <button
                  type="button"
                  className="w-full rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow transition hover:bg-indigo-700"
                >
                  Confirm Schedule
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

