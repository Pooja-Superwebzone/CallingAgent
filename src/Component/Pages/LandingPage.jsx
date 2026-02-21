import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import CountUp from "./CountUp";
import richaHero from "/Richa.png";
import { signupTwillioUser } from "../../hooks/useAuth";
import toast from "react-hot-toast";

export const plans = [
  {
    id: "trial",
    title: "Richa Trial Pack",
    subtitle: "1 Month Sales Executive Free",
    price: "₹ 18,999/-",
    original: "Rs. 38,000/-",
    link: "richa-trial-pack",
  },
   {
    id: "trial",
    title: "Richa Monthly Pack",
    subtitle: "1 Month Sales Executive Free",
    price: "₹ 14,999/month",
    original: "",
    link: "richa-monthly-trial-pack",
  },
  {
    id: "certified_ai_training",
    title: "Certified AI Training",
    subtitle: "",
    price: "₹5,999/-",
    original: "Rs. 9,999/-",
    link: "become-ai-certified-by-richa",
  },
  {
    id: "prince",
    title: "Richa Prince Pack",
    subtitle: "",
    price: "₹ 1,99,000/- + GST",
    original: "Rs. 3,98,000/-",
    link: "richa-prince-pack"
  },
  {
    id: "queen",
    title: "Richa Queen Pack",
    subtitle: "5 Sales Executive For 2 Months Free",
    price: "₹ 99,999/-",
    original: "Rs. 1,99,999/-",
    link: "richa-queen-pack",
  },
   {
    id: "queen_2_exec",
    title: "Richa Queen Pack",
    subtitle: "2 Sales Executive Free For 4 Months",
    price: "₹ 99,999/- + GST",
    original: "Rs. 1,99,999/-",
    link: "richa-queen-pack-2-exec"
  },
  {
    id: "queen_1_exec",
    title: "Richa Queen Pack",
    subtitle: "1 Sales Executive For 7 Months",
    price: "₹ 99,999/- + GST",
    original: "Rs. 1,99,999/-",
    link: "richa-queen-pack-1-exec"
  },
  {
    id: "king",
    title: "Richa King Pack",
    subtitle: "4 Sales Executive Free For 1 Year",
    price: "₹ 4,99,999/-",
    original: "Rs. 9,99,999/-",
    link: "richa-king-pack",
  },  
  {
    id: "king",
    title: "Richa Monthly King Pack",
    subtitle: "",
    price: "₹28,999+/Month",
    original: "",
    link: "richa-monthly-king-pack",
  },  
    {
    id: "tithi_ai",
    title: "Tithi AI",
    subtitle: "",
    price: "₹ 24,999/- + GST",
    original: "Rs. 29,999/-",
    link: "tithi-ai"
  },
  {
    id: "demo_call",
    title: "Demo Call Pack",
    subtitle: "Try Richa AI with a Demo Call",
    price: "₹99/-",
    original: "Rs. 299/-",
    link: "paid_demo_trial_richa_ai",
  },
   {
    id: "mini",
    title: "Richa Mini Pack",
    subtitle: "1 Month Sales Executive Free",
    price: "₹ 49,000/- + GST",
    original: "Rs. 98,000/-",
    link: "richa-mini-pack"
  },  
  {
    id: "become_channel_partner",
    title: "Become Channel Partner",
    subtitle: "",
    price: "₹ 9,999 + GST",
    // original: "Rs. 98,000/-",
    link: "become-channel-partner"
  },
  {
    id: "become_training_channel_partner",
    title: "Become Training Channel Partner",
    subtitle: "",
    price: "₹ 9,999 + GST",
    // original: "Rs. 98,000/-",
    link: "become-training-channel-partner"
  },
  {
    id: "richa_executive_pack",
    title: "Sales executive subscription Training Channel Partner",
    subtitle: "You need any one plans pack then after you can purchase subscription pack",
    price: "₹ 9,999/Month + GST",
    // original: "Rs. 98,000/-",
    link: "richa-executive-pack"
  },
  {
    id: "richa_executive_pack_advance",
    title: "Sales executive subscription Training Channel Partner",
    subtitle: "You need any one plans pack then after you can purchase subscription pack (additional benefit local indian number support)",
    price: "₹ 12,999/Month + GST",
    // original: "Rs. 98,000/-",
    link: "richa-executive-pack"
  },

];

const getStoredToken = (planId) => {
  if (typeof window === "undefined") return "";
  const planToken = localStorage.getItem(`plan_token_${planId}`) || "";
  const genericToken = localStorage.getItem("signup_token") || "";
  return planToken || genericToken || "";
};

// Calculate discount percentage for a plan
export const calculateDiscountPercentage = (plan) => {
  if (!plan.original) return null;
  
  // Extract numbers from price strings (remove currency symbols, commas, etc.)
  const extractNumber = (str) => {
    if (!str) return 0;
    return parseFloat(str.replace(/[₹Rs.,\s\/-]/g, '')) || 0;
  };

  const originalPrice = extractNumber(plan.original);
  const currentPrice = extractNumber(plan.price);
  
  if (originalPrice === 0 || currentPrice === 0 || currentPrice >= originalPrice) return null;
  
  const discount = originalPrice - currentPrice;
  const percentage = Math.round((discount / originalPrice) * 100);
  return percentage;
};

// Get cashback percentage for a plan
export const getCashbackPercentage = (plan) => {
  switch (plan.id) {
    case "trial": // Richa trial pack
      return 53;
    case "mini": // Richa mini pack
      return 20;
      case "certified_ai_training": // Certificate AI training
      return null;
    case "prince": // Certificate AI training
      return 100; // No cashback
    case "tithi_ai": // Tithi AI plan
      return null; // No cashback
    case "demo_call": // Demo call
      return null; // No cashback
    case "become_channel_partner": // Become channel partner
      return null; // No cashback
    case "become_training_channel_partner": // Become training channel partner
      return null; // No cashback
    default:
      // For other plans, check if they include Sales Executive (100% cashback)
      const subtitle = (plan.subtitle || "").toLowerCase();
      const title = (plan.title || "").toLowerCase();
      if (subtitle.includes("sales executive") || title.includes("sales executive")) {
        return 100;
      }
      return null; // No cashback by default
  }
};

export default function LandingPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [showSignup, setShowSignup] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [formValues, setFormValues] = useState({
    name: "",
    email: "",
    contact_no: "",
    password: "",
    confirmPassword: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [signupError, setSignupError] = useState("");
  const [storedToken, setStoredToken] = useState("");

  const getCookie = (name) => {
    if (typeof document === "undefined") return "";
    const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
    return match ? decodeURIComponent(match[2]) : "";
  };

  const extractToken = (data) =>
    data?.token ||
    data?.access_token ||
    data?.jwt ||
    data?.api_token ||
    data?.data?.token ||
    data?.data?.access_token ||
    data?.data?.jwt ||
    data?.data?.api_token ||
    data?.data?.data?.token ||
    data?.data?.data?.jwt ||
    data?.data?.data?.api_token ||
    getCookie("token") ||
    getCookie("CallingAgent") ||
    "";

  // Handle URL-based plan selection
  useEffect(() => {
    const planId = searchParams.get("plan");
    if (planId) {
      const plan = plans.find((p) => p.id === planId);
      if (plan) {
        setSelectedPlan(plan);
        setStoredToken(getStoredToken(plan.id));
        setShowSignup(true);
        // Optional: Remove the plan parameter from URL after opening modal
        // Uncomment the line below if you want to clean the URL
        // setSearchParams({});
      }
    }
  }, [searchParams, setStoredToken]);

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
                onClick={() => navigate("/tutorial")}
                className="hidden sm:inline-flex items-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-100 transition animate-pop-in anim-delay-200"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                Tutorial
              </button>
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
                  Start Paid Demo
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/login?tab=login")}
                  className="rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-50 animate-pop-in anim-delay-600"
                >
                  I already have an account
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/tutorial")}
                  className="rounded-2xl border border-indigo-300 bg-indigo-50 px-6 py-3 text-sm font-semibold text-indigo-700 hover:bg-indigo-100 transition animate-pop-in anim-delay-750 flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  How It Works
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
            <div className="mx-auto max-w-7xl">
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

              <div className="mt-8 grid gap-6 animate-fade-up anim-delay-150 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
                {plans.map((plan) => (
                  <button
                    key={plan.id}
                    type="button"
                    onClick={() => {
                      setSelectedPlan(plan);
                      setStoredToken(getStoredToken(plan.id));
                      setShowSignup(true);
                    }}
                    className="group relative flex min-h-[320px] w-full flex-col rounded-3xl border border-slate-200 bg-white p-6 text-left text-slate-900 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                  >
                    {/* Discount Percentage Badge - Top Right */}
                    {calculateDiscountPercentage(plan) && (
                      <div className="absolute -top-2 -right-2 z-10">
                        <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                          {calculateDiscountPercentage(plan)}% OFF
                        </span>
                      </div>
                    )}

                    {/* Header Section with Title and Badges */}
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold leading-tight">{plan.title}</h3>
                        {plan.id !== 'queen' && plan.id !== 'king' && plan.id !== 'demo_call' ? null : ( <>
                         <span className="inline-block mt-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 border border-indigo-100">
                          {plan.id === "queen"
                            ? "Best deal"
                            : plan.id === "king"
                              ? "Popular"
                              : plan.id === "demo_call"
                                ? "Demo"
                                : ""}
                        </span>
                        </>) }
                      </div>
                      
                      {/* Cashback Badge - Clean Design (Top Right Corner) */}
                      {getCashbackPercentage(plan) !== null && (
                        <div className="flex-shrink-0">
                          <div className="relative w-14 h-14">
                            {/* Subtle glow */}
                            <div className="absolute -inset-1 animate-ping bg-[#FFFF00] rounded-full blur-md "></div>
                            
                            {/* Main badge */}
                            <div className="relative w-full h-full bg-[#FFFF00] rounded-full flex flex-col items-center justify-center shadow-lg border-2 border-white">
                              {/* Star icon */}
                              <svg
                                className="absolute -top-0.5 -right-0.5 w-3 h-3 text-white"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                              
                              {/* Text */}
                              <div className="text-center">
                                <div className="text-[10px] font-black text-[#000000] leading-none drop-shadow-md">
                                  {getCashbackPercentage(plan)}%
                                </div>
                                <div className="text-[6px] font-bold text-[#000000] leading-tight drop-shadow-md mt-0.5 uppercase tracking-wide">
                                  CASHBACK
                                </div>
                              </div>
                              
                              {/* Shine */}
                              <div className="absolute top-0.5 left-0.5 w-6 h-6 bg-white/30 rounded-full blur-sm"></div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <p className="mt-2 text-sm text-slate-600 min-h-[20px]">{plan.subtitle}</p>

                    <div className="mt-4 flex items-baseline justify-between">
                      <div className="flex flex-col">
                        {plan.original && (
                          <span className="text-sm line-through text-slate-400">{plan.original}</span>
                        )}
                        <span className="text-2xl font-extrabold">{plan.price}</span>
                      </div>
                      <span className="text-sm text-slate-500">+GST</span>
                    </div>

                    <div className="mt-5 flex items-center gap-2 text-sm text-slate-600">
                      <span className="h-2 w-2 rounded-full bg-indigo-500" />
                      <span>Unlock Benefits Pay Now!</span>
                    </div>
                    <div className="mt-auto">
                      <div className="inline-flex w-full justify-center rounded-lg bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow transition hover:bg-indigo-700">
                        Get started
                      </div>
                    </div>
                  </button>
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

        {/* signup modal */}
        {showSignup && selectedPlan && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 px-4">
            <div className="w-full max-w-xl rounded-xl bg-white p-6 shadow-2xl">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold text-indigo-600">Sign up to continue</p>
                  <h3 className="text-xl font-bold text-slate-900 mt-1">{selectedPlan.title}</h3>
                  <p className="text-sm text-slate-600">
                    {selectedPlan.subtitle || "Complete signup to proceed to payment."}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowSignup(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              </div>

              <div className="mt-4 space-y-3">
                <div>
                  <label className="text-sm font-semibold text-slate-700">Business Name</label>
                  <input
                    type="text"
                    value={formValues.name}
                    onChange={(e) => setFormValues((v) => ({ ...v, name: e.target.value }))}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700">Contact No</label>
                  <input
                    type="text"
                    value={formValues.contact_no}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\\D/g, "");
                      if (value.length <= 10) setFormValues((v) => ({ ...v, contact_no: value }));
                    }}
                    maxLength={10}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none"
                    placeholder="Enter contact number"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700">Email</label>
                  <input
                    type="email"
                    value={formValues.email}
                    onChange={(e) => setFormValues((v) => ({ ...v, email: e.target.value }))}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none"
                    placeholder="you@example.com"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700">Password</label>
                  <input
                    type="password"
                    value={formValues.password}
                    onChange={(e) => setFormValues((v) => ({ ...v, password: e.target.value }))}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none"
                    placeholder="Enter password"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700">Confirm Password</label>
                  <input
                    type="password"
                    value={formValues.confirmPassword}
                    onChange={(e) => setFormValues((v) => ({ ...v, confirmPassword: e.target.value }))}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none"
                    placeholder="Re-enter password"
                  />
                </div>
                {signupError ? (
                  <div className="text-sm text-rose-600 font-medium">{signupError}</div>
                ) : null}
              </div>

              <div className="mt-6 flex items-center justify-between">
                <div className="text-sm text-slate-600">
                  Price: <span className="font-semibold text-slate-900">{selectedPlan.price}</span>{" "}
                  <span className="text-xs text-slate-500">(+GST)</span>
                </div>
                <button
                  type="button"
                  disabled={
                    submitting ||
                    !formValues.email ||
                    !formValues.name ||
                    !formValues.contact_no ||
                    formValues.contact_no.length !== 10 ||
                    !formValues.password ||
                    formValues.password !== formValues.confirmPassword
                  }
                  onClick={async () => {
                    try {
                      setSignupError("");
                      setSubmitting(true);
                      const payload = {
                        name: formValues.name,
                        email: formValues.email,
                        contact_no: formValues.contact_no,
                        password: formValues.password,
                        confirmPassword: formValues.confirmPassword,
                        minute: "10",
                      };
                      
                      const data = await signupTwillioUser(payload);
                      const tokenRaw = extractToken(data);
                      const tokenFromStorage = storedToken || getStoredToken(selectedPlan.id);
                      const tokenToUse = tokenRaw || tokenFromStorage || getCookie("token") || getCookie("CallingAgent");

                      if (!tokenToUse) {
                        console.warn("Token missing in signup response", data);
                        toast.error("Token missing from signup response");
                        setSubmitting(false);
                        return;
                      }

                      if (typeof window !== "undefined") {
                        localStorage.setItem("signup_token", tokenToUse);
                        localStorage.setItem(`plan_token_${selectedPlan.id}`, tokenToUse);
                        setStoredToken(tokenToUse);
                        document.cookie = `token=${encodeURIComponent(
                          tokenToUse
                        )}; path=/; max-age=31536000; SameSite=Strict`;
                        document.cookie = `CallingAgent=${encodeURIComponent(
                          tokenToUse
                        )}; path=/; max-age=31536000; SameSite=Strict`;
                      }
                      const url = new URL(`https://ibcrm.in/`);
                      url.searchParams.set("plan", selectedPlan.id);
                      url.searchParams.set("price", selectedPlan.price);
                      url.searchParams.set("planTitle", selectedPlan.title);
                      if (tokenToUse) url.searchParams.set("token", tokenToUse);
                      setTimeout(() => {
                        window.location.href = `https://ibcrm.in/${selectedPlan.link}?email="${formValues.email}"`;
                      }, 50);
                    } catch (err) {
                      const message = err?.message || "Signup failed. Please try again.";
                      setSignupError(message);
                      toast.error(message);
                    } finally {
                      setSubmitting(false);
                    }
                  }}
                  className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {submitting ? "Submitting..." : "Signup & Continue"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
