import React, { useCallback, useEffect, useState } from "react";
import Cookies from "js-cookie";
import service from "../../api/axios";

export default function MinutesPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [oneWayMinutes, setOneWayMinutes] = useState(0);
  const [twoWayMinutes, setTwoWayMinutes] = useState(0);
  const [purchaseMinutesInput, setPurchaseMinutesInput] = useState("500");
  const userEmail = Cookies.get("email") || "";

  const MIN_PURCHASE_MINUTES = 500;
  const THRESHOLD_MINUTES = 1000;
  const RATE_UP_TO_THRESHOLD = 15;
  const RATE_AFTER_THRESHOLD = 14;

  const formatINR = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);

  const parsedPurchaseMinutes = Number(purchaseMinutesInput);
  const purchaseMinutes = Number.isFinite(parsedPurchaseMinutes)
    ? Math.floor(parsedPurchaseMinutes)
    : 0;

  const purchaseValidation =
    purchaseMinutesInput.trim() === ""
      ? "Enter minutes to purchase."
      : !Number.isFinite(parsedPurchaseMinutes)
        ? "Enter a valid number."
        : purchaseMinutes < MIN_PURCHASE_MINUTES
          ? `Minimum purchase is ${MIN_PURCHASE_MINUTES} minutes.`
          : "";

  const quote =
    purchaseValidation !== ""
      ? {
          total: 0,
          firstSlabMinutes: 0,
          firstSlabAmount: 0,
          secondSlabMinutes: 0,
          secondSlabAmount: 0,
        }
      : (() => {
          const firstSlabMinutes = Math.min(purchaseMinutes, THRESHOLD_MINUTES);
          const secondSlabMinutes = Math.max(purchaseMinutes - THRESHOLD_MINUTES, 0);
          const firstSlabAmount = firstSlabMinutes * RATE_UP_TO_THRESHOLD;
          const secondSlabAmount = secondSlabMinutes * RATE_AFTER_THRESHOLD;
          return {
            total: firstSlabAmount + secondSlabAmount,
            firstSlabMinutes,
            firstSlabAmount,
            secondSlabMinutes,
            secondSlabAmount,
          };
        })();

  const handleBuyNow = () => {
    if (purchaseValidation) return;
    if (!userEmail) {
      setError("Your email was not found. Please login again.");
      return;
    }

    const url = `https://ibcrm.in/?email=${encodeURIComponent(
      userEmail
    )}&minutes=${encodeURIComponent(String(purchaseMinutes))}`;
    window.location.href = url;
  };

  const fetchMinutes = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await service.get("Profile", {
        headers: { Authorization: `Bearer ${Cookies.get("CallingAgent")}` },
      });
      const mins = res?.data?.data?.twilio_user_minute || {};
      const one = Number(mins.one_way ?? mins.minute ?? 0);
      const two = Number(mins.two_way ?? 0);

      setOneWayMinutes(one);
      setTwoWayMinutes(two);
      localStorage.setItem("userRemainingMinutes", String(one));
    } catch (e) {
      setError("Could not load minutes. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMinutes();
  }, [fetchMinutes]);

  return (
    <div className="p-4 sm:p-6">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 border border-indigo-100">
              Usage & Billing
            </div>
            <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Minutes
            </h1>
            <p className="text-slate-600 mt-1">
              Your current calling balance (auto-synced from profile).
            </p>
            {userEmail ? (
              <p className="text-xs text-slate-500 mt-1">
                Signed in as <span className="font-semibold">{userEmail}</span>
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={fetchMinutes}
            disabled={loading}
            className={`px-4 py-2 rounded-xl text-sm font-semibold bg-slate-900 text-white shadow-sm transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
              loading ? "opacity-60 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {error && (
          <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-rose-700">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="text-sm font-semibold text-slate-600">One-way Minutes</div>
            <div className="mt-2 text-3xl font-extrabold text-slate-900">
              {loading ? "..." : oneWayMinutes}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="text-sm font-semibold text-slate-600">Two-way Minutes</div>
            <div className="mt-2 text-3xl font-extrabold text-slate-900">
              {loading ? "..." : twoWayMinutes}
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="text-lg font-bold text-slate-900">Buy Minutes</div>
              <div className="text-sm text-slate-600 mt-1">
                Pricing: <span className="font-semibold">₹{RATE_UP_TO_THRESHOLD}/min</span> up to{" "}
                <span className="font-semibold">{THRESHOLD_MINUTES}</span> minutes, then{" "}
                <span className="font-semibold">₹{RATE_AFTER_THRESHOLD}/min</span> after that. Minimum
                purchase <span className="font-semibold">{MIN_PURCHASE_MINUTES}</span> minutes.
              </div>
            </div>
            <div className="w-full sm:w-auto">
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Minutes to purchase
              </label>
              <input
                type="number"
                min={MIN_PURCHASE_MINUTES}
                step={1}
                value={purchaseMinutesInput}
                onChange={(e) => setPurchaseMinutesInput(e.target.value)}
                className="w-full sm:w-56 rounded-xl bg-white border border-slate-300 px-3 py-2 text-slate-900 shadow-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="500"
              />
              {purchaseValidation && (
                <div className="mt-2 text-sm text-rose-600">{purchaseValidation}</div>
              )}
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-xs uppercase tracking-wide text-slate-500">
                Up to {THRESHOLD_MINUTES} min
              </div>
              <div className="mt-1 text-slate-900 font-semibold">
                {quote.firstSlabMinutes} × ₹{RATE_UP_TO_THRESHOLD}
              </div>
              <div className="mt-1 text-slate-600 text-sm">{formatINR(quote.firstSlabAmount)}</div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-xs uppercase tracking-wide text-slate-500">
                After {THRESHOLD_MINUTES} min
              </div>
              <div className="mt-1 text-slate-900 font-semibold">
                {quote.secondSlabMinutes} × ₹{RATE_AFTER_THRESHOLD}
              </div>
              <div className="mt-1 text-slate-600 text-sm">{formatINR(quote.secondSlabAmount)}</div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-xs uppercase tracking-wide text-slate-500">Total</div>
              <div className="mt-1 text-2xl font-extrabold text-slate-900">
                {purchaseValidation ? "—" : formatINR(quote.total)}
              </div>
              <div className="mt-2 text-sm text-slate-600">
                {purchaseValidation ? "Enter a valid amount to see total." : `${purchaseMinutes} minutes`}
              </div>
              <button
                type="button"
                onClick={handleBuyNow}
                disabled={!!purchaseValidation}
                className={`mt-4 w-full rounded-xl py-2.5 font-semibold transition focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                  purchaseValidation
                    ? "bg-slate-200 text-slate-500 cursor-not-allowed"
                    : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                }`}
              >
                Buy Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

