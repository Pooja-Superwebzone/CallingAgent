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

const DEFAULT_NORMAL_MINUTE_RATE = 15;

const normalizeUserId = (v) =>
  v === undefined || v === null ? "" : String(v).trim();

const extractDynamicMinuteRows = (payload) => {
  const raw = payload?.data !== undefined ? payload.data : payload;
  if (Array.isArray(raw)) return raw;
  if (Array.isArray(raw?.data)) return raw.data;
  if (raw && typeof raw === "object") return [raw];
  return [];
};

const pickDisplayPriceForUserId = (rows, userId) => {
  const uid = normalizeUserId(userId);
  if (!uid || !Array.isArray(rows)) return null;
  for (const row of rows) {
    const rowUid = normalizeUserId(row?.user_id ?? row?.userId ?? row?.userid);
    if (!rowUid || rowUid !== uid) continue;
    const price =
      row?.price ??
      row?.display_price ??
      row?.displayPrice ??
      row?.minute_price ??
      row?.rate;
    const n = Number(price);
    if (Number.isFinite(n) && n > 0) return n;
  }
  return null;
};

const pickDisplayPriceForNullUserId = (rows) => {
  if (!Array.isArray(rows)) return null;
  for (const row of rows) {
    const rowUid = normalizeUserId(row?.user_id ?? row?.userId ?? row?.userid);
    if (rowUid) continue;
    const price =
      row?.price ??
      row?.display_price ??
      row?.displayPrice ??
      row?.minute_price ??
      row?.rate;
    const n = Number(price);
    if (Number.isFinite(n) && n > 0) return n;
  }
  
  return null;
};
const DYNAMIC_MINUTE_RATE_CACHE = new Map();

export default function MinutesPage() {
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [error, setError] = useState("");
  const [oneWayMinutes, setOneWayMinutes] = useState(0);
  const [twoWayMinutes, setTwoWayMinutes] = useState(0);
  const [userPlan, setUserPlan] = useState("");
  const [userPlanTitle, setUserPlanTitle] = useState("");
  const [purchaseMinutesInput, setPurchaseMinutesInput] = useState("");
  const [profileDetails, setProfileDetails] = useState({
    userId: "",
    name: "",
    email: "",
    phoneNumber: "",
  });
  const [dynamicNormalMinuteRate, setDynamicNormalMinuteRate] = useState(
    DEFAULT_NORMAL_MINUTE_RATE
  );
  const userEmail = Cookies.get("email") || "";
  const isChannelPartnerPlan = String(userPlan) === "18";
  const displayedPlanTitle = userPlanTitle || "Become Channel Partner";

  const MINUTES_PER_PACKAGE = isChannelPartnerPlan ? 1000 : 100;
  const RATE_UP_TO_THRESHOLD = isChannelPartnerPlan
    ? 11.44
    : dynamicNormalMinuteRate;
  const purchasePlaceholder = isChannelPartnerPlan ? "1000, 2000, 3000..." : "100, 200, 300...";
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
  const purchaseMinutes = Number.isFinite(parsedPurchaseMinutes)
    ? Math.floor(parsedPurchaseMinutes)
    : 0;

  const purchaseValidation =
    purchaseMinutesInput.trim() === ""
      ? "Enter minutes to add."
      : !Number.isFinite(parsedPurchaseMinutes)
        ? "Enter a valid number."
        : purchaseMinutes < MINUTES_PER_PACKAGE
          ? `Enter at least ${MINUTES_PER_PACKAGE} minutes.`
          : purchaseMinutes % MINUTES_PER_PACKAGE !== 0
            ? `Enter minutes in multiples of ${MINUTES_PER_PACKAGE}.`
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
      console.log("createPaymentOrder response.data:", response);
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

      const result = await window.cashfree.checkout(checkoutOptions);
      if (result?.error) {
        throw new Error(result.error?.message || "Payment failed.");
      }

      const isPaymentSuccessful =
        result?.paymentDetails ||
        result?.order?.order_status === "PAID" ||
        result?.transaction?.txStatus === "SUCCESS";

      if (!isPaymentSuccessful) {
        if (result?.redirect) {
          console.log("Redirecting to payment page...");
          return;
        }
        throw new Error("Payment was not completed.");
      }

      const addMinutePayload = {
        minute: purchaseMinutes,
        user_id: profileDetails.userId,
      };
      await updateSubscriptionPaymentStatus(resolvedSubscriptionPlanId);
      const addMinuteResponse = await service.post(
        "add-minute",
        addMinutePayload,
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("CallingAgent")}`,
          },
        }
      );
      console.log("add-minute response.data:", addMinuteResponse?.data);
      toast.success("Subscription added and minutes updated.");
      fetchMinutes();
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
      const twoWayMinsObj = res?.data?.data?.twilio_two_way_user_minute || {};
      const one = Number(mins.one_way ?? mins.minute ?? 0);

      const two = Number(
        twoWayMinsObj?.two_way ??
        twoWayMinsObj?.twoWay ??
        twoWayMinsObj?.two_way_minute ??
        twoWayMinsObj?.twoWayMinute ??
        twoWayMinsObj?.inbound ??
        twoWayMinsObj?.inbound_minute ??
        twoWayMinsObj?.minute ??
        mins.two_way ??
        mins.twoWay ??
        mins.two_way_minute ??
        mins.twoWayMinute ??
        mins.inbound ??
        mins.inbound_minute ??
        mins.minute ??
        0
      );

      setOneWayMinutes(one);
      setTwoWayMinutes(Number.isFinite(two) ? two : 0);
      const resolvedUserId =

        twoWayMinsObj?.user_id ||
        mins?.user_id ||
        profile?.id ||
        profile?.user_id ||
        profile?.twilio_create_id ||
        "";

      setProfileDetails({
        userId: resolvedUserId,
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

      const role = Cookies.get("role") || "";
      const planCookie = resolvePlanId(Cookies.get("user_plan") || "");
      const isChannelPartnerUser =
        role === "channelpartner" || String(planCookie) === "18";
      if (isChannelPartnerUser) {
        setDynamicNormalMinuteRate(DEFAULT_NORMAL_MINUTE_RATE);
      } else {
        let normalRate = DEFAULT_NORMAL_MINUTE_RATE;
        const normalizedUserId = normalizeUserId(resolvedUserId);
        const cacheKey = normalizedUserId || "__null_user__";
        if (DYNAMIC_MINUTE_RATE_CACHE.has(cacheKey)) {
          normalRate = DYNAMIC_MINUTE_RATE_CACHE.get(cacheKey);
        } else {
          try {
            const dmRes = await service.get("dynamic-minute");
            const rows = extractDynamicMinuteRows(dmRes?.data);
            const fromApi = normalizedUserId
              ? pickDisplayPriceForUserId(rows, normalizedUserId)
              : pickDisplayPriceForNullUserId(rows);
            if (fromApi != null) normalRate = fromApi;
          } catch {

          }
          DYNAMIC_MINUTE_RATE_CACHE.set(cacheKey, normalRate);
        }
        setDynamicNormalMinuteRate(normalRate);
      }
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
              Talktime
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
            <div className="text-sm font-semibold text-slate-600">Two-way Minutes</div>
            <div className="mt-2 text-3xl font-extrabold text-slate-900">
              {loading ? "..." : twoWayMinutes}
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="text-lg font-bold text-slate-900">Buy Talktime</div>
          </div>
          <div className="w-full">
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              {isChannelPartnerPlan
                ? "Mintues to Add 11.44 * add mintues in inpute ( below input type eg.1000,2000,3000 ...)"
                : `Mintues to Add ${formatRate(
                  dynamicNormalMinuteRate
                )} * add mintues in inpute ( below input type eg.100,200,300 ...)`}
            </label>
            <div className="grid w-full max-w-[28rem] grid-cols-[auto_auto_minmax(0,1fr)] gap-2 sm:grid-cols-[auto_auto_minmax(9rem,1fr)_auto_auto] sm:items-center">
              <span className="self-center text-base font-semibold text-slate-900">
                {formatRate(RATE_UP_TO_THRESHOLD)}
              </span>
              <span className="self-center text-slate-400">x</span>
              <input
                type="number"
                min={MINUTES_PER_PACKAGE}
                step={MINUTES_PER_PACKAGE}
                value={purchaseMinutesInput}
                onChange={(e) => setPurchaseMinutesInput(e.target.value)}
                className="col-span-1 w-full  rounded-xl bg-white border border-slate-300 px-3 py-2 text-slate-900 shadow-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder={purchasePlaceholder}
              />
              <span className="self-center text-slate-400 sm:block hidden">=</span>
              <span className="col-span-3 text-sm text-slate-500 sm:hidden">
                Subtotal
              </span>
              <span className="self-center text-base font-semibold text-slate-900">
                {purchaseValidation ? "-" : formatINR(quote.firstSlabAmount)}
              </span>
            </div>
            <div className="mt-2 text-xs text-slate-500">
              {isChannelPartnerPlan
                ? "Talk time can be purchased in multiples of 1000 only."
                : "Talk time can be purchased in multiples of 100 only."}
            </div>
          </div>
          <div className="mt-5 max-w-2xl">
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 bg-slate-50 px-5 py-4">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Payment Details
                </div>
                <div className="mt-1 text-lg font-bold text-slate-900">
                  {purchaseValidation
                    ? "Your amount summary will appear here"
                    : `Amount summary for ${purchaseMinutes} minutes`}
                </div>
              </div>

              <div className="space-y-4 px-5 py-5">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-sm font-semibold text-slate-900">
                        Talktime Charges
                      </div>
                      <div className="mt-1 text-sm text-slate-600">
                        Rs. {formatRate(RATE_UP_TO_THRESHOLD)} x {purchaseValidation ? 0 : purchaseMinutes} minutes
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs uppercase tracking-wide text-slate-500">
                        Amount
                      </div>
                      <div className="mt-1 text-base font-semibold text-slate-900">
                        {purchaseValidation ? "-" : formatINR(quote.firstSlabAmount)}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-4">
                  <div className="flex items-center justify-between text-sm text-slate-600">
                    <span>Subtotal</span>
                    <span className="font-semibold text-slate-900">
                      {purchaseValidation ? "-" : formatINR(quote.total)}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-sm text-slate-600">
                    <span>CGST (9%)</span>
                    <span className="font-semibold text-slate-900">
                      {purchaseValidation ? "-" : formatINR(quote.cgstAmount)}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-sm text-slate-600">
                    <span>SGST (9%)</span>
                    <span className="font-semibold text-slate-900">
                      {purchaseValidation ? "-" : formatINR(quote.sgstAmount)}
                    </span>
                  </div>
                  <div className="mt-4 border-t border-slate-200 pt-4">
                    <div className="flex items-center justify-between">
                      <span className="text-base font-semibold text-slate-900">Total Payable</span>
                      <span className="text-2xl font-extrabold text-slate-900">
                        {purchaseValidation ? "-" : formatINR(quote.totalWithTax)}
                      </span>
                    </div>
                    <div className="mt-2 text-sm text-slate-600">
                      {purchaseValidation
                        ? "Enter a valid amount to see your bill."
                        : `Final payable amount for ${purchaseMinutes} minutes including GST.`}
                    </div>
                  </div>
                </div>

                {purchaseValidation ? (
                  <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                    {purchaseValidation}
                  </div>
                ) : null}

                <button
                  type="button"
                  onClick={handleBuyNow}
                  disabled={!!purchaseValidation || paymentLoading}
                  className={`w-full rounded-2xl px-6 py-3 font-semibold transition focus:outline-none focus:ring-2 focus:ring-emerald-500 ${purchaseValidation
                    || paymentLoading
                    ? "bg-slate-200 text-slate-500 cursor-not-allowed"
                    : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                    }`}
                >
                  {paymentLoading ? "Processing..." : "Purchase Now"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
