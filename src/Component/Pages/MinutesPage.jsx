import React, { useCallback, useEffect, useState } from "react";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import service from "../../api/axios";
import {
  creditMinutesAfterPayment,
  createPaymentOrder,
  extractPaymentSessionId,
  getShareValue,
  PENDING_MINUTE_PURCHASE_KEY,
  postShareValue,
} from "../../api/payment";

const DEFAULT_PLAN_ID = "8";

const CHANNEL_PARTNER_PLAN_LABEL = "ASA";

const DEFAULT_NORMAL_MINUTE_RATE = 15;
const DEFAULT_CHANNEL_PARTNER_MINUTE_RATE = 13.5;
const DEFAULT_CHANNEL_PARTNER_TIER3_RATE = 11.44;

const pickPurchaseRate = ({
  isChannelPartnerPlan,
  isAdminPlan,
  minutes,
  channelPartnerDynamicRate,
  normalRate,
}) => {
  const m = Number(minutes);
  const safeM = Number.isFinite(m) ? m : 0;

  if (isChannelPartnerPlan) {
    // Channelpartner slabs:
    // 1000 -> 13.50
    // 2000 -> 12.50
    // >=3000 -> dynamic (fallback 11.44 if null)
    if (safeM >= 3000) {
      const dyn = Number(channelPartnerDynamicRate);
      return Number.isFinite(dyn) && dyn > 0 ? dyn : DEFAULT_CHANNEL_PARTNER_TIER3_RATE;
    }
    if (safeM >= 2000) return 12.5;
    return 13.5;
  }

  if (isAdminPlan) {
    // Admin slabs:
    // 500 -> 14
    // 1000 -> 13.50
    // >=2000 -> 12.50
    if (safeM >= 2000) return 13;
    if (safeM >= 1000) return 13.5;
    return 14;
  }

  return Number(normalRate);
};

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
  const [userPlanTitle, setUserPlanTitle] = useState("");
  const [purchaseMinutesInput, setPurchaseMinutesInput] = useState("");
  const [profileDetails, setProfileDetails] = useState({
    userId: "",
    name: "",
    email: "",
    phoneNumber: "",
    role: "",
    twilioUser: String(Cookies.get("twilio_user") ?? "0").trim(),
  });
  const [dynamicNormalMinuteRate, setDynamicNormalMinuteRate] = useState(
    DEFAULT_NORMAL_MINUTE_RATE
  );
  const [dynamicChannelPartnerMinuteRate, setDynamicChannelPartnerMinuteRate] =
    useState(0);
  const [shareValue, setShareValue] = useState(null);
  const [shareLoading, setShareLoading] = useState(true);
  const userEmail = Cookies.get("email") || "";
  const cookieRoleLower = String(Cookies.get("role") || "").trim().toLowerCase();
  const profileRoleLower = String(profileDetails.role || "").trim().toLowerCase();
  const isAdminPlan = cookieRoleLower === "admin" || profileRoleLower === "admin";
  const isChannelPartnerPlan =
    cookieRoleLower === "channelpartner" ||
    cookieRoleLower === "channel_partner" ||
    profileRoleLower === "channelpartner" ||
    profileRoleLower === "channel_partner";
  const displayedPlanTitle = isChannelPartnerPlan
    ? CHANNEL_PARTNER_PLAN_LABEL
    : userPlanTitle || "Become Channel Partner";

  const parsedPurchaseMinutes = Number(purchaseMinutesInput);
  const purchaseMinutes = Number.isFinite(parsedPurchaseMinutes)
    ? Math.floor(parsedPurchaseMinutes)
    : 0;

  const MINUTES_PER_PACKAGE = isChannelPartnerPlan ? 1000 : isAdminPlan ? 500 : 100;
  const RATE_UP_TO_THRESHOLD = pickPurchaseRate({
    isChannelPartnerPlan,
    isAdminPlan,
    minutes: purchaseMinutes,
    channelPartnerDynamicRate: dynamicChannelPartnerMinuteRate,
    normalRate: dynamicNormalMinuteRate,
  });
  const purchasePlaceholder = isChannelPartnerPlan
    ? "1000, 2000, 3000..."
    : isAdminPlan
      ? "500, 1000, 2000..."
      : "100, 200, 300...";
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
    setUserPlanTitle(Cookies.get("user_plan_title") || "");
  }, []);

  useEffect(() => {
    syncPlanDetails(userEmail);
  }, [syncPlanDetails, userEmail]);

  useEffect(() => {
    if (typeof window !== "undefined" && window.Cashfree) {
      window.cashfree = window.Cashfree({
        mode: "production",
      });
    }
  }, []);

  const formatRate = (amount) => amount.toFixed(2);

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

    const customerEmail = profileDetails.email || userEmail;
    const customerPhone = profileDetails.phoneNumber || Cookies.get("contact_no") || "";
    const customerName =
      profileDetails.name ||
      Cookies.get("name") ||
      localStorage.getItem("userName") ||
      "Customer";
    const customerName =
      profileDetails.name ||
      Cookies.get("name") ||
      localStorage.getItem("userName") ||
      "Customer";

    if (!customerPhone) {
      setError("Your phone number was not found. Please update your profile and try again.");
      return;
    }

    if (!window.cashfree) {
      const message =
        "Payment gateway is not ready yet. Please refresh the page and try again.";
      setError(message);
      toast.error(message);
      return;
    }

    setPaymentLoading(true);
    setError("");

    const orderDesc = isChannelPartnerPlan
      ? `Channel Partner Minutes Purchase - ${purchaseMinutes} minutes`
      : `Richa Minutes Purchase - ${purchaseMinutes} minutes`;

    try {
      sessionStorage.setItem(
        PENDING_MINUTE_PURCHASE_KEY,
        JSON.stringify({
          minutes: purchaseMinutes,
          userId: profileDetails.userId,
          email: customerEmail,
          planId: DEFAULT_PLAN_ID,
          shareAmount: quote.total,
        })
      );

      const response = await createPaymentOrder({
        name: customerName,
        email: customerEmail,
        phoneNumber: customerPhone,
        totalPayment: quote.totalWithTax,
        orderDesc,
    const orderDesc = isChannelPartnerPlan
      ? `Channel Partner Minutes Purchase - ${purchaseMinutes} minutes`
      : `Richa Minutes Purchase - ${purchaseMinutes} minutes`;

    try {
      sessionStorage.setItem(
        PENDING_MINUTE_PURCHASE_KEY,
        JSON.stringify({
          minutes: purchaseMinutes,
          userId: profileDetails.userId,
          email: customerEmail,
          planId: DEFAULT_PLAN_ID,
          shareAmount: quote.total,
        })
      );

      const response = await createPaymentOrder({
        name: customerName,
        email: customerEmail,
        phoneNumber: customerPhone,
        totalPayment: quote.totalWithTax,
        orderDesc,
    const orderDesc = isChannelPartnerPlan
      ? `Channel Partner Minutes Purchase - ${purchaseMinutes} minutes`
      : `Richa Minutes Purchase - ${purchaseMinutes} minutes`;

    try {
      sessionStorage.setItem(
        PENDING_MINUTE_PURCHASE_KEY,
        JSON.stringify({
          minutes: purchaseMinutes,
          userId: profileDetails.userId,
          email: customerEmail,
          planId: DEFAULT_PLAN_ID,
          shareAmount: quote.total,
        })
      );

      const response = await createPaymentOrder({
        name: customerName,
        email: customerEmail,
        phoneNumber: customerPhone,
        totalPayment: quote.totalWithTax,
        orderDesc,
      });

      const paymentSessionId =
        extractPaymentSessionId(response) || response?.payment_id || "";
      if (!paymentSessionId) {
        throw new Error("Payment session id was not returned from create order API.");
      }

      const result = await window.cashfree.checkout({
        paymentSessionId,
        redirectTarget: "_self",
      });

      if (result?.error) {
        throw new Error(result.error?.message || "Payment failed.");
      }

      const isPaymentSuccessful =
        result?.paymentDetails ||
        result?.order?.order_status === "PAID" ||
        result?.transaction?.txStatus === "SUCCESS";

      if (!isPaymentSuccessful) {
        if (result?.redirect) {
          return;
        }
        throw new Error("Payment failed. Please try again.");
      }


      const paymentSessionId =
        extractPaymentSessionId(response) || response?.payment_id || "";
      if (!paymentSessionId) {
        throw new Error("Payment session id was not returned from create order API.");
      }

      const result = await window.cashfree.checkout({
        paymentSessionId,
        redirectTarget: "_self",
      });

      if (result?.error) {
        throw new Error(result.error?.message || "Payment failed.");
      }

      const isPaymentSuccessful =
        result?.paymentDetails ||
        result?.order?.order_status === "PAID" ||
        result?.transaction?.txStatus === "SUCCESS";

      if (!isPaymentSuccessful) {
        if (result?.redirect) {
          return;
        }
        throw new Error("Payment failed. Please try again.");
      }

      const authToken =
        Cookies.get("CallingAgent") || localStorage.getItem("ibcrmtoken") || "";

      try {
        await creditMinutesAfterPayment({
          email: customerEmail,
          planId: DEFAULT_PLAN_ID,
          userId: profileDetails.userId,
          minutes: purchaseMinutes,
          authToken,
        });
      } catch (creditError) {
        console.warn("Post-payment minute credit failed:", creditError);
      }

      try {
        await postShareValue(quote.total, authToken);
        const updatedShare = await getShareValue(authToken);
        setShareValue(updatedShare);
      } catch (shareError) {
        console.warn("Post-payment share-value failed:", shareError);
      }

      sessionStorage.removeItem(PENDING_MINUTE_PURCHASE_KEY);
      toast.success("Payment successful!");
      await fetchMinutes();
    } catch (e) {
      sessionStorage.removeItem(PENDING_MINUTE_PURCHASE_KEY);
      const rawMessage =
        e?.response?.data?.message ||
        e?.message ||
        "Payment failed. Please try again.";
      const message =
        rawMessage.includes("Cashfree env vars are missing") ||
        rawMessage.includes("VITE_CASHFREE")
          ? "Payment is not configured. Set VITE_CASHFREE_APP_ID and VITE_CASHFREE_SECRET_KEY in .env and restart the dev server."
          : rawMessage;
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
        role: String(profile?.role ?? profile?.user_role ?? "").trim(),
        twilioUser: String(
          profile?.twilio_user ?? Cookies.get("twilio_user") ?? "0"
        ).trim(),
      });
      syncPlanDetails(profile?.email || profile?.emp_email || userEmail);
      localStorage.setItem("userRemainingMinutes", String(one));

      const role = Cookies.get("role") || "";
      const profileRoleLower = String(
        profile?.role ?? profile?.user_role ?? ""
      )
        .trim()
        .toLowerCase();
      const cookieRoleLower = String(role).trim().toLowerCase();
      const isChannelPartnerUser =
        cookieRoleLower === "channelpartner" ||
        cookieRoleLower === "channel_partner" ||
        profileRoleLower === "channelpartner" ||
        profileRoleLower === "channel_partner";
      if (isChannelPartnerUser) {
        const dm =
          profile?.dynamic_minute ??
          profile?.dynamicMinute ??
          profile?.dynamic_min ??
          profile?.dynamicMin ??
          null;
        const dmPriceRaw =
          (dm && typeof dm === "object" ? dm?.price : null) ??
          profile?.dynamic_minute_price ??
          profile?.dynamicMinutePrice ??
          null;
        const dmPrice = Number(dmPriceRaw);
        setDynamicChannelPartnerMinuteRate(
          Number.isFinite(dmPrice) && dmPrice > 0 ? dmPrice : 0
        );
        setDynamicNormalMinuteRate(DEFAULT_NORMAL_MINUTE_RATE);
      } else {
        setDynamicChannelPartnerMinuteRate(0);
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
            /* optional dynamic-minute pricing */
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

  useEffect(() => {
    let cancelled = false;

    const fetchShareValue = async () => {
      setShareLoading(true);
      try {
        const value = await getShareValue(Cookies.get("CallingAgent"));
        if (!cancelled) {
          setShareValue(value);
        }
      } catch {
        if (!cancelled) setShareValue(null);
      } finally {
        if (!cancelled) setShareLoading(false);
      }
    };

    fetchShareValue();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const fetchShareValue = async () => {
      setShareLoading(true);
      try {
        const value = await getShareValue(Cookies.get("CallingAgent"));
        if (!cancelled) {
          setShareValue(value);
        }
      } catch {
        if (!cancelled) setShareValue(null);
      } finally {
        if (!cancelled) setShareLoading(false);
      }
    };

    fetchShareValue();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const fetchShareValue = async () => {
      setShareLoading(true);
      try {
        const value = await getShareValue(Cookies.get("CallingAgent"));
        if (!cancelled) {
          setShareValue(value);
        }
      } catch {
        if (!cancelled) setShareValue(null);
      } finally {
        if (!cancelled) setShareLoading(false);
      }
    };

    fetchShareValue();

    return () => {
      cancelled = true;
    };
  }, []);

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

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="text-sm font-semibold text-slate-600">Free Minutes</div>
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
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="text-sm font-semibold text-slate-600">Your Shares</div>
            <div className="mt-2 text-3xl font-extrabold text-slate-900">
              {shareLoading ? "..." : shareValue ?? "-"}
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="text-lg font-bold text-slate-900">Buy Talktime</div>
          </div>
          <div className="w-full">
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              {`Mintues to Add ${formatRate(
                RATE_UP_TO_THRESHOLD
              )} * add mintues in inpute ( below input type eg.${
                isChannelPartnerPlan ? "1000,2000,3000" : isAdminPlan ? "500,1000,2000" : "100,200,300"
              } ...)`}
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
                : isAdminPlan
                  ? "Talk time can be purchased in multiples of 500 only."
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
