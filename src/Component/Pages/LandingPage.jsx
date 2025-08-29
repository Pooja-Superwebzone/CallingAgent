import React from "react";
import { useNavigate } from "react-router-dom";
import CountUp from "./CountUp";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-white to-slate-50 text-slate-900 overflow-x-hidden">
   <div className="relative min-h-screen bg-gradient-to-b from-white to-slate-50 text-slate-900">
      {/* subtle background accents */}
      <div className="pointer-events-none absolute -top-24 -left-24 h-[28rem] w-[28rem] rounded-full bg-indigo-100 opacity-50 blur-3xl animate-float" />
      <div className="pointer-events-none absolute top-48 -right-24 h-[24rem] w-[24rem] rounded-full bg-fuchsia-100 opacity-50 blur-3xl animate-float anim-delay-300" />

      {/* header */}
      <header className="sticky top-0 z-20 border-b border-slate-200/70 bg-white/80 backdrop-blur animate-fade-in">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-fuchsia-500 text-white font-bold animate-pop-in">
              AI
            </div>
            <span className="text-lg font-semibold animate-fade-up anim-delay-150">
              Richa AI
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate("/login?tab=login")}
              className="hidden sm:inline-flex rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 transition animate-pop-in anim-delay-300"
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => navigate("/login?tab=signup")}
              className="hidden sm:inline-flex rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 animate-pop-in anim-delay-450"
            >
              Signup
            </button>
          </div>
        </nav>
      </header>

      {/* hero */}
      <main className="mx-auto max-w-7xl px-6">
        <section className="grid items-center gap-12 py-14 md:grid-cols-2">
          {/* left */}
          <div className="animate-fade-up">
            <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 shadow-sm animate-pop-in">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              AI Calling Assistant
            </span>

            <h1 className="mt-4 text-4xl font-extrabold leading-tight tracking-tight md:text-5xl animate-fade-up anim-delay-150">
              Close more deals with a{" "}
              <span className="bg-gradient-to-r from-indigo-700 via-fuchsia-600 to-cyan-600 bg-clip-text text-transparent">
                smart voice agent
              </span>
              .
            </h1>

            <p className="mt-4 max-w-xl text-lg text-slate-600 animate-fade-up anim-delay-300">
              Automate outreach, schedule test drives, and respond to customer
              queries on WhatsApp & calls — beautifully, reliably, and fast.
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => navigate("/login?tab=signup")}
                className="rounded-2xl bg-gradient-to-r from-indigo-600 to-fuchsia-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-fuchsia-200/60 transition hover:opacity-95 animate-pop-in anim-delay-450"
              >
                Start Free Demo
              </button>
              <button
                type="button"
                onClick={() => navigate("/login?tab=login")}
                className="rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-50 animate-pop-in anim-delay-600"
              >
                I already have an account
              </button>
            </div>

            <div className="mt-8 grid w-full max-w-lg grid-cols-3 items-center rounded-2xl border border-slate-200 bg-white/70 p-4 text-center shadow-sm backdrop-blur animate-fade-up anim-delay-600">
              <div className="animate-fade-up">
                <div className="text-2xl font-bold">
                  <CountUp to={10000} duration={1600} suffix="+" />
                </div>
                <div className="text-xs text-slate-500">Calls handled</div>
              </div>
              <div className="border-l border-slate-200/70 h-10 mx-auto animate-fade-in anim-delay-150" />
              <div className="animate-fade-up anim-delay-300">
                <div className="text-2xl font-bold">
                  <CountUp to={4.9} decimals={1} duration={1400} />
                  <span className="ml-1">/5</span>
                </div>
                <div className="text-xs text-slate-500">User rating</div>
              </div>
            </div>
          </div>

          {/* right visual */}
          <div className="relative animate-fade-up anim-delay-300">
            <div className="absolute -inset-2 rounded-3xl bg-gradient-to-r from-indigo-200 to-fuchsia-200 blur-2xl opacity-70 animate-fade-in" />
            <div className="relative rounded-3xl border border-slate-200 bg-white p-6 shadow-xl">
              {/* window header */}
              <div className="mb-5 flex items-center gap-2 animate-fade-in">
                <span className="h-3 w-3 rounded-full bg-rose-400/90" />
                <span className="h-3 w-3 rounded-full bg-amber-400/90" />
                <span className="h-3 w-3 rounded-full bg-emerald-400/90" />
                <span className="ml-2 text-xs text-slate-500">Live preview</span>
              </div>

              {/* chat mock w/ stagger */}
              <div className="space-y-3">
                <div className="flex gap-2 animate-slide-r">
                  <div className="rounded-2xl bg-slate-100 px-4 py-3 text-sm text-slate-800 shadow-sm">
                    Hello! Looking for a BMW 3-Series in automatic?
                  </div>
                </div>
                <div className="flex justify-end gap-2 animate-slide-l anim-delay-150">
                  <div className="rounded-2xl bg-indigo-600 px-4 py-3 text-sm text-white shadow-sm">
                    Found 3 options. Want to schedule a test drive?
                  </div>
                </div>
                <div className="flex gap-2 animate-slide-r anim-delay-300">
                  <div className="rounded-2xl bg-slate-100 px-4 py-3 text-sm text-slate-800 shadow-sm">
                    Yes, tomorrow 2pm works.
                  </div>
                </div>
              </div>

              <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4 animate-fade-up anim-delay-450">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold">Auto-scheduler</div>
                    <div className="text-xs text-slate-500">
                      Syncs with Google Calendar
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate("/login?tab=signup")}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold hover:bg-slate-100 animate-pop-in anim-delay-600"
                  >
                    Try it now
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        
        <section className="pb-16">
          <div className="mx-auto max-w-xl">
            <div className="rounded-3xl border border-slate-200 bg-white p-7 text-center shadow-md transition hover:shadow-lg animate-fade-up anim-delay-300">
              <div className="mx-auto mb-3 h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-600 to-fuchsia-600 animate-float" />
              <h3 className="text-xl font-semibold">WhatsApp + Voice</h3>
              <p className="mt-2 text-slate-600">
                Single inbox for messages & calls with AI follow-ups.
              </p>
            </div>
          </div>
        </section>
      </main>


      <footer className="border-t border-slate-200 bg-white/80 backdrop-blur animate-fade-in flex">
        <div className="mx-auto flex max-w-7xl items-center  justify-between px-6 py-6 text-sm text-slate-600">
          <span>© {new Date().getFullYear()} Richa AI. All rights reserved.</span>
        </div>
      </footer>
    </div>
</div>
  );
}
