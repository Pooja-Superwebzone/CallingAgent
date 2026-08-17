import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function ContactUs() {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="relative flex min-h-screen flex-col bg-gradient-to-b from-white to-slate-50 text-slate-900 overflow-x-hidden">
      <div className="pointer-events-none absolute -top-24 -left-24 h-[28rem] w-[28rem] rounded-full bg-indigo-100 opacity-50 blur-3xl" />
      <div className="pointer-events-none absolute top-48 -right-24 h-[24rem] w-[24rem] rounded-full bg-fuchsia-100 opacity-50 blur-3xl" />

      <header className="sticky top-0 z-20 border-b border-slate-200/70 bg-white/80 backdrop-blur">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="flex items-center gap-3 text-left rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-fuchsia-500 text-white font-bold">
              AI
            </div>
            <span className="text-lg font-semibold">Richa AI</span>
          </button>

          <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
            <span className="hidden sm:inline text-sm font-medium text-indigo-700 px-3 py-1 rounded-lg bg-indigo-50 border border-indigo-100">
              Contact Us
            </span>
            <button
              type="button"
              onClick={() => navigate("/privacy-policy")}
              className="hidden sm:inline-flex rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 transition"
            >
              Privacy
            </button>
            <button
              type="button"
              onClick={() => navigate("/login?tab=login")}
              className="hidden sm:inline-flex rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 transition"
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => navigate("/login?tab=signup")}
              className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
            >
              Signup
            </button>
          </div>
        </nav>
      </header>

      <main className="relative mx-auto w-full max-w-3xl flex-1 px-6 py-12">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          Contact Us
        </h1>
        <p className="mt-2 text-slate-600">
          Reach Redjinni Private Limited for business or support needs.
        </p>

        <div className="mt-10 space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">Business Inquiries</h2>
            <p className="mt-2 text-slate-600">
              For partnerships, sales, and general business questions:
            </p>
            <a
              href="mailto:contact@redjinni.com"
              className="mt-3 inline-block text-base font-semibold text-indigo-600 hover:text-indigo-800 underline underline-offset-2"
            >
              contact@redjinni.com
            </a>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">Existing Customers</h2>
            <p className="mt-2 text-slate-600">
              If you are an existing customer and need help:
            </p>
            <a
              href="mailto:support@redjinni.com"
              className="mt-3 inline-block text-base font-semibold text-indigo-600 hover:text-indigo-800 underline underline-offset-2"
            >
              support@redjinni.com
            </a>
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-200 bg-white/80 backdrop-blur mt-auto">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-6 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-1">
            <span>© {new Date().getFullYear()} Richa AI. All rights reserved.</span>
            <span className="text-xs text-slate-500">
              Redjinni Private Limited Pvt. Ltd.
            </span>
          </div>
          <button
            type="button"
            onClick={() => navigate("/")}
            className="text-left font-medium text-indigo-600 hover:text-indigo-800 sm:text-right"
          >
            Back to home
          </button>
        </div>
      </footer>
    </div>
  );
}
