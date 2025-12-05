import React from "react";
import { useNavigate } from "react-router-dom";
import CountUp from "./CountUp";
import richaHero from "/Richa.png";

export default function LandingPage() {
  const navigate = useNavigate();
  const plans = [
    {
      id: "queen",
      title: "Richa Queen Pack",
      subtitle: "5 Sales Executive For 2 Months Free",
      price: "₹ 99,999/-",
      original: "Rs. 1,99,999/-",
      link: "https://ibcrm.in",
    },
    {
      id: "king",
      title: "Richa King Pack",
      subtitle: "4 Sales Executive Free For 1 Year",
      price: "₹ 4,99,999/-",
      original: "Rs. 9,99,999/-",
      link: "https://ibcrm.in",
    },
    {
      id: "trial",
      title: "Richa Trial Pack",
      subtitle: "1 Month Sales Executive Free",
      price: "₹ 19,000/-",
      original: "Rs. 38,000/-",
      link: "https://ibcrm.in",
    },
  ];

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
            First  Ai Sales{" "}
              <span className="bg-gradient-to-r from-indigo-700 via-fuchsia-600 to-cyan-600 bg-clip-text text-transparent">
              Agent Of The World
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
                  <CountUp to={10000000} duration={1800} suffix="+" />
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
    
              {/* richa hero image */}
              <div className="mt-4 rounded-2xl bg-slate-50/70 p-3 border border-slate-200 animate-fade-up">
                <img
                  src={richaHero}
                  alt="Richa AI assistant"
                  className="h-96 w-full object-cover rounded-2xl shadow-sm"
                />
              </div>

      
          </div>
        </section>

        {/* subscription plans */}
   

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
        <section className="pb-16 mb:px-[25px]">
          <div className="mx-auto max-w-6xl">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-indigo-600 uppercase tracking-wide">
                  Subscription Plans
                </p>
                <h2 className="text-3xl font-bold mt-1">Choose your Richa plan</h2>
                <p className="text-slate-600 mt-2">
                  Unlock benefits and scale with AI sales executives.
                </p>
              </div>
            
            </div>

            <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {plans.map((plan) => (
                <a
                  key={plan.id}
                  href={plan.link}
                  target="_blank"
                  rel="noreferrer"
                  className="group block rounded-3xl border border-slate-200 bg-white text-slate-900 p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-lg font-semibold text-slate-900">{plan.title}</h3>
                    <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 border border-indigo-100">
                      {plan.id === "queen"
                        ? "Best deal"
                        : plan.id === "king"
                        ? "Popular"
                        : "Starter"}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-slate-600">{plan.subtitle}</p>

                  <div className="mt-4 flex items-baseline justify-between">
                    <div className="flex flex-col">
                      <span className="text-sm line-through text-slate-400">{plan.original}</span>
                      <span className="text-2xl font-extrabold text-slate-900">{plan.price}</span>
                    </div>
                    <span className="text-sm text-slate-500">+GST</span>
                  </div>

                  <div className="mt-5">
                    <div className="flex items-center gap-2 text-sm text-slate-600 mb-4">
                      <span className="h-2 w-2 rounded-full bg-indigo-500" />
                      <span>Unlock Benefits Pay Now!</span>
                    </div>
                    <div className="mt-auto">
                      <div className="inline-flex w-full justify-center rounded-lg bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow transition hover:bg-indigo-700">
                        Get started
                      </div>
                    </div>
                  </div>
                </a>
              ))}
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
