import React, { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import { calculateDiscountPercentage, getCashbackPercentage, plans } from "./LandingPage";
import { FiArrowRight, FiClock, FiCreditCard } from "react-icons/fi";

export default function UpgradeMinutesPage() {
  const navigate = useNavigate();
  const [showMonthlyPlans, setShowMonthlyPlans] = useState(false);
  const plansRef = useRef(null);

  const userEmail = useMemo(() => Cookies.get("email") || "", []);

  const redirectToIbcrmPlan = (plan) => {
    if (!userEmail) {
      toast.error("Email not found. Please login again.");
      return;
    }
    if (!plan?.link) {
      toast.error("Plan link not available.");
      return;
    }
    window.location.href = `https://ibcrm.in/${plan.link}?email=${encodeURIComponent(userEmail)}`;
  };

  const kingPlan = useMemo(() => {
    return (
      plans.find((p) => p.link === "richa-king-pack") ||
      plans.find((p) => String(p.title || "").toLowerCase().includes("king pack")) ||
      plans.find((p) => String(p.title || "").toLowerCase().includes("king"))
    );
  }, []);

  return (
    <div className="p-4 sm:p-6">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 border border-indigo-100">
              Upgrade & Billing
            </div>
            <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Upgrade Plan
            </h1>
            <p className="text-slate-600 mt-1">Choose how you want to upgrade.</p>
            {userEmail ? (
              <p className="text-xs text-slate-500 mt-1">
                Payment will open for <span className="font-semibold">{userEmail}</span>
              </p>
            ) : null}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="h-11 w-11 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700">
                <FiArrowRight size={18} />
              </div>
              <div className="flex-1">
                <div className="text-lg font-bold text-slate-900">Monthly Subscription</div>
                <p className="text-sm text-slate-600 mt-1">
                  Continue with subscription plans and pay monthly.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setShowMonthlyPlans(true);
                setTimeout(
                  () =>
                    plansRef.current?.scrollIntoView({
                      behavior: "smooth",
                      block: "start",
                    }),
                  50
                );
              }}
              className="mt-4 w-full rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold py-2.5 transition focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              View Plans
            </button>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="h-11 w-11 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700">
                <FiClock size={18} />
              </div>
              <div className="flex-1">
                <div className="text-lg font-bold text-slate-900">Minutes Purchase</div>
                <p className="text-sm text-slate-600 mt-1">
                  Buy minutes based on usage (tier pricing).
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => navigate("/minutes")}
              className="mt-4 w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 transition focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              Open Minutes
            </button>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="h-11 w-11 rounded-xl bg-fuchsia-50 border border-fuchsia-100 flex items-center justify-center text-fuchsia-700">
                <FiCreditCard size={18} />
              </div>
              <div className="flex-1">
                <div className="text-lg font-bold text-slate-900">Purchase Pack Directly</div>
                <p className="text-sm text-slate-600 mt-1">Buy the King pack immediately.</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => redirectToIbcrmPlan(kingPlan)}
              className="mt-4 w-full rounded-xl bg-fuchsia-600 hover:bg-fuchsia-700 text-white font-semibold py-2.5 transition focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
            >
              Buy King Pack
            </button>
          </div>
        </div>

        {showMonthlyPlans && (
          <section ref={plansRef} className="pt-10">
            <div className="mx-auto max-w-7xl">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-indigo-600 uppercase tracking-wide">
                    Subscription Plans
                  </p>
                  <h2 className="text-3xl font-bold mt-1 text-slate-900">
                    Choose your Richa plan
                  </h2>
                  <p className="text-slate-600 mt-2">
                    Clicking a plan will open payment with your email.
                  </p>
                </div>
              </div>

              <div className="mt-8 grid gap-6 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
                {plans.map((plan) => (
                  <button
                    key={`${plan.link}-${plan.title}`}
                    type="button"
                    onClick={() => redirectToIbcrmPlan(plan)}
                    className="group relative flex min-h-[320px] w-full flex-col rounded-3xl border border-slate-200 bg-white p-6 text-left text-slate-900 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                  >
                    {calculateDiscountPercentage(plan) && (
                      <div className="absolute -top-2 -right-2 z-10">
                        <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                          {calculateDiscountPercentage(plan)}% OFF
                        </span>
                      </div>
                    )}

                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold leading-tight">{plan.title}</h3>
                        {plan.subtitle ? (
                          <span className="inline-block mt-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 border border-indigo-100">
                            {plan.subtitle}
                          </span>
                        ) : null}
                      </div>

                      {getCashbackPercentage(plan) !== null && (
                        <div className="flex-shrink-0">
                          <div className="relative w-14 h-14">
                            <div className="absolute -inset-1 bg-yellow-200 rounded-full blur-md opacity-70" />
                            <div className="relative w-full h-full bg-[#FFFF00] rounded-full flex flex-col items-center justify-center shadow-lg border-2 border-white">
                              <div className="text-center">
                                <div className="text-[10px] font-black text-[#000000] leading-none">
                                  {getCashbackPercentage(plan)}%
                                </div>
                                <div className="text-[6px] font-bold text-[#000000] leading-tight mt-0.5 uppercase tracking-wide">
                                  CASHBACK
                                </div>
                              </div>
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

                    <div className="mt-auto">
                      <div className="inline-flex w-full justify-center rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow transition hover:bg-indigo-700">
                        Get started
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

