import React, { useCallback, useEffect, useState } from "react";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import service from "../../api/axios";
import {
  addSubscription,
  createPaymentOrder,
  updateSubscriptionPaymentStatus,
} from "../../api/payment";

const PLAN_ID_MAP = {
  become_channel_partner: "18",
  trial: "8",
};

const resolvePlanId = (planId = "") => PLAN_ID_MAP[planId] || (planId ? String(planId) : "8");
const resolvePlanIdFromRole = (role = "") =>
  role === "channelpartner" ? 18 : 8;
const resolveSubscriptionPlanIdFromRole = (role = "", fallbackPlanId = 8) =>
  role === "channelpartner" ? 8 : fallbackPlanId;

export default function MinutesPage() {
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [error, setError] = useState("");
  const [oneWayMinutes, setOneWayMinutes] = useState(0);
  const [twoWayMinutes, setTwoWayMinutes] = useState(10);
  const [userPlan, setUserPlan] = useState("");
  const [userPlanTitle, setUserPlanTitle] = useState("");
  const [purchaseMinutesInput, setPurchaseMinutesInput] = useState("10");
  const [profileDetails, setProfileDetails] = useState({
    name: "",
    email: "",
    phoneNumber: "",
  });
  const userEmail = Cookies.get("email") || "";
  const isChannelPartnerPlan = String(userPlan) === "18";
  const displayedPlanTitle = userPlanTitle || "Become Channel Partner";

  const MIN_PURCHASE_MINUTES = isChannelPartnerPlan ? 1 : 10;
  const MINUTES_PER_PACKAGE = isChannelPartnerPlan ? 1000 : 100;
  const RATE_UP_TO_THRESHOLD = isChannelPartnerPlan ? 11.44 : 15;
  const CGST_RATE = 0.09;
  const SGST_RATE = 0.09;
  const roundToTwo = (amount) => Number(amount.toFixed(2));

  const formatINR = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);

  const syncPlanDetails = useCallback(() => {
    const storedPlan = resolvePlanId(Cookies.get("user_plan") || "");
    setUserPlan(storedPlan);
    setUserPlanTitle(Cookies.get("user_plan_title") || "");
  }, []);

  useEffect(() => {
    window.cashfree = window.Cashfree({
      mode: "production"
    });
  }, []);

  useEffect(() => {
    syncPlanDetails(userEmail);
  }, [syncPlanDetails, userEmail]);

  const formatRate = (amount) => amount.toFixed(2);

  const parsedPurchaseMinutes = Number(purchaseMinutesInput);
  const purchasePackages = Number.isFinite(parsedPurchaseMinutes)
    ? Math.floor(parsedPurchaseMinutes)
    : 0;
  const purchaseMinutes = MINUTES_PER_PACKAGE * purchasePackages;

  const purchaseValidation =
    purchaseMinutesInput.trim() === ""
      ? "Enter minutes to purchase."
      : !Number.isFinite(parsedPurchaseMinutes)
        ? "Enter a valid number."
        : purchasePackages < MIN_PURCHASE_MINUTES
          ? `Minimum purchase is ${MIN_PURCHASE_MINUTES} packs.`
          : "";
  const quote =
    purchaseValidation !== ""
      ? {
        total: 0,
        cgstAmount: 0,
        sgstAmount: 0,
        totalWithTax: 0,
        firstSlabMinutes: 0,
        firstSlabAmount: 0,
        secondSlabMinutes: 0,
        secondSlabAmount: 0,
      }
      : (() => {
        const firstSlabMinutes = purchaseMinutes;
        const secondSlabMinutes = 0;
        const firstSlabAmount = roundToTwo(
          firstSlabMinutes * RATE_UP_TO_THRESHOLD
        );
        const secondSlabAmount = 0;
        const total = roundToTwo(firstSlabAmount + secondSlabAmount);
        const cgstAmount = roundToTwo(total * CGST_RATE);
        const sgstAmount = roundToTwo(total * SGST_RATE);
        return {
          total,
          cgstAmount,
          sgstAmount,
          totalWithTax: roundToTwo(total + cgstAmount + sgstAmount),
          firstSlabMinutes,
          firstSlabAmount,
          secondSlabMinutes,
          secondSlabAmount,
        };
      })();

  const handleBuyNow = async () => {
    if (purchaseValidation) return;
    if (!userEmail) {
      setError("Your email was not found. Please login again.");
      return;
    }

    const customerName = profileDetails.name || Cookies.get("name") || "Customer";
    const customerEmail = profileDetails.email || userEmail;
    const customerPhone = profileDetails.phoneNumber || Cookies.get("contact_no") || "";

    if (!customerPhone) {
      setError("Your phone number was not found. Please update your profile and try again.");
      return;
    }
    setPaymentLoading(true);
    setError("");

    try {
      const userRole = Cookies.get("role") || "";
      const selectedPlanId = resolvePlanIdFromRole(userRole);
      const subscriptionPlanId = resolveSubscriptionPlanIdFromRole(
        userRole,
        selectedPlanId
      );

      if (!Number.isFinite(selectedPlanId) || selectedPlanId <= 0) {
        throw new Error("Plan id was not found. Please select a valid plan and try again.");
      }

      const response = await createPaymentOrder({
        name: customerName,
        email: customerEmail,
        phoneNumber: customerPhone,
        totalPayment: Number(quote.totalWithTax.toFixed(2)),
        orderDesc: `${purchaseMinutes} calling minutes purchase`,
      });
      const paymentSessionId = response?.payment_id || "";
      const addSubscriptionResponse = await addSubscription({
        email: customerEmail,
        planId: subscriptionPlanId,
      });

      const resolvedSubscriptionPlanId =
        Number(
          addSubscriptionResponse?.plan_id ||
          addSubscriptionResponse?.data?.plan_id ||
          addSubscriptionResponse?.resolvedPlanId
        ) || subscriptionPlanId;
      console.log("Resolved Plan ID:", resolvedSubscriptionPlanId);
      await new Promise((resolve) => setTimeout(resolve, 5000));
      if (!paymentSessionId) {
        throw new Error("Payment session id was not returned from create order API.");
      }
      if (!addSubscriptionResponse?.status) {
        throw new Error("Add subscription API failed.");
      }

      let checkoutOptions = {
        paymentSessionId,
        redirectTarget: "_self"
      };

      window.cashfree.checkout(checkoutOptions)
        .then(async (result) => {
          if (result.error) {
            console.log(result.error);
          }
          const isPaymentSuccessful =
            result?.paymentDetails ||
            result?.order?.order_status === "PAID" ||
            result?.transaction?.txStatus === "SUCCESS";

          if (isPaymentSuccessful) {
            try {
              await updateSubscriptionPaymentStatus(resolvedSubscriptionPlanId);
              toast.success("Payment successful and subscription updated.");
              fetchMinutes();
            } catch (updateError) {
              const updateMessage =
                updateError?.response?.data?.message ||
                updateError?.message ||
                "Payment succeeded, but subscription update failed.";
              setError(updateMessage);
              toast.error(updateMessage);
            }
          }
          if (result.redirect) {
            console.log("Redirecting to payment page...");
          }
        });

    } catch (e) {
      const rawMessage =
        e?.response?.data?.message ||
        e?.message ||
        "Unable to start payment. Please try again.";
      const message = rawMessage;
      setError(message);
      toast.error(message);
    } finally {
      setPaymentLoading(false);
    }
  };

  const fetchMinutes = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await service.get("Profile", {
        headers: { Authorization: `Bearer ${Cookies.get("CallingAgent")}` },
      });
      const profile = res?.data?.data || {};
      const mins = res?.data?.data?.twilio_user_minute || {};
      const one = Number(mins.one_way ?? mins.minute ?? 0);
      const two = Number(mins.two_way ?? 0);

      setOneWayMinutes(one);
      setTwoWayMinutes(Number.isFinite(two) && two > 0 ? two : 10);
      setProfileDetails({
        name:
          profile?.name ||
          profile?.emp_name ||
          profile?.full_name ||
          profile?.username ||
          "",
        email:
          profile?.email ||
          profile?.emp_email ||
          userEmail ||
          "",
        phoneNumber:
          profile?.contact_no ||
          profile?.phone_no ||
          profile?.phone ||
          profile?.mobile ||
          profile?.mobile_no ||
          "",
      });
      syncPlanDetails(profile?.email || profile?.emp_email || userEmail);
      localStorage.setItem("userRemainingMinutes", String(one));
    } catch {
      setError("Could not load minutes. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [syncPlanDetails, userEmail]);

  useEffect(() => {
    fetchMinutes();
  }, [fetchMinutes]);

  return (
    <div className="p-4 sm:p-6 md:p-5 lg:p-6">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 border border-indigo-100">
              Usage & Billing
            </div>
            <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Minutes
            </h1>
            {isChannelPartnerPlan ? (
              <p className="mt-2 inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                Plan: {displayedPlanTitle}
              </p>
            ) : null}
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
            className={`w-auto self-start px-4 py-2 rounded-xl text-sm font-semibold bg-slate-900 text-white shadow-sm transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${loading ? "opacity-60 cursor-not-allowed" : ""
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

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
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
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-2xl">
              <div className="text-lg font-bold text-slate-900">Buy Minutes</div>

              <div className="text-sm text-slate-600 mt-1">
                Pricing:{" "}
                <span className="font-semibold">
                  ₹{formatRate(RATE_UP_TO_THRESHOLD)}/min
                </span>
                . GST extra (
                <span className="font-semibold">9% CGST + 9% SGST</span>). Minimum
                purchase:{" "}
                <span className="font-semibold">
                  {MIN_PURCHASE_MINUTES} packs ({MINUTES_PER_PACKAGE} minutes per pack)
                </span>.
              </div>
            </div>
            <div className="w-full lg:max-w-sm lg:min-w-[19rem]">
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Minutes to purchase
              </label>
              <div className="grid grid-cols-[auto_auto_minmax(0,1fr)] gap-2 sm:grid-cols-[auto_auto_minmax(7rem,1fr)_auto_auto] sm:items-center">
                <span className="self-center text-base font-semibold text-slate-900">
                  {MINUTES_PER_PACKAGE}
                </span>
                <span className="self-center text-slate-400">x</span>
                <input
                  type="number"
                  min={MIN_PURCHASE_MINUTES}
                  step="1"
                  value={purchaseMinutesInput}
                  onChange={(e) => setPurchaseMinutesInput(e.target.value)}
                  className="col-span-1 w-full rounded-xl bg-white border border-slate-300 px-3 py-2 text-slate-900 shadow-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter packs"
                />
                <span className="self-center text-slate-400 sm:block hidden">=</span>
                <span className="col-span-3 text-sm text-slate-500 sm:hidden">
                  Total minutes
                </span>
                <span className="self-center text-base font-semibold text-slate-900">
                  {purchaseValidation ? "-" : purchaseMinutes}
                </span>
              </div>
              {purchaseValidation && (
                <div className="mt-2 text-sm text-rose-600">{purchaseValidation}</div>
              )}
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-xs uppercase tracking-wide text-slate-500">
                Subtotal
              </div>
              <div className="mt-1 text-slate-900 font-semibold">
                {purchaseMinutes} x Rs. {formatRate(RATE_UP_TO_THRESHOLD)}
              </div>
              <div className="mt-1 text-slate-600 text-sm">{formatINR(quote.firstSlabAmount)}</div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-xs uppercase tracking-wide text-slate-500">Total</div>
              <div className="mt-1 text-sm text-slate-600">
                {purchaseValidation
                  ? "Subtotal + 9% CGST + 9% SGST"
                  : `Subtotal ${formatINR(quote.total)} + CGST 9% ${formatINR(quote.cgstAmount)} + SGST 9% ${formatINR(quote.sgstAmount)}`}
              </div>
              <div className="mt-1 text-2xl font-extrabold text-slate-900">
                {purchaseValidation ? "-" : formatINR(quote.totalWithTax)}
              </div>
              <div className="mt-2 text-sm text-slate-600">
                {purchaseValidation
                  ? "Enter a valid amount to see total."
                  : `Final amount for ${purchaseMinutes} minutes`}
              </div>
              <button
                type="button"
                onClick={handleBuyNow}
                disabled={!!purchaseValidation || paymentLoading}
                className={`mt-4 w-auto min-w-[10rem] rounded-xl px-6 py-2.5 font-semibold transition focus:outline-none focus:ring-2 focus:ring-emerald-500 ${purchaseValidation
                  || paymentLoading
                  ? "bg-slate-200 text-slate-500 cursor-not-allowed"
                  : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                  }`}
              >
                {paymentLoading ? "Processing..." : "Buy Now"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
