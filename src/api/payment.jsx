import axios from "axios";
import { service } from "./axios";

const PAYMENT_ORDER_URL = "https://payment.ibdelight.in/api/createOrder";
const CASHFREE_API_BASE_URL = "https://api.cashfree.com/pg/orders";
const CASHFREE_APP_ID = String(import.meta.env.VITE_CASHFREE_APP_ID || "").trim();
const CASHFREE_SECRET_KEY = String(
  import.meta.env.VITE_CASHFREE_SECRET_KEY || ""
).trim();
const ADD_SUBSCRIPTION_URL = "https://api-main.ibcrm.in/api/add-subscription";
const UPDATE_SUBSCRIPTION_URL =
  "https://api-main.ibcrm.in/api/update-subscription";

export const PENDING_MINUTE_PURCHASE_KEY = "pendingMinutePurchase";
export const PENDING_PLAN_PURCHASE_KEY = "pendingPlanPurchase";

/** Live domain registered with Cashfree (must match successful createOrder ReturnUrl). */
const DEFAULT_CASHFREE_ORIGIN = "https://richasales.com";

const getAppOrigin = () => {
  const configured = String(import.meta.env.VITE_APP_ORIGIN || "")
    .trim()
    .replace(/\/$/, "");
  if (configured) return configured;

  if (typeof window !== "undefined") {
    const current = String(window.location.origin || "").replace(/\/$/, "");
    // Cashfree production rejects localhost / http return URLs (400).
    if (
      current &&
      !/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(current) &&
      current.startsWith("https://")
    ) {
      return current;
    }
  }

  return DEFAULT_CASHFREE_ORIGIN;
};

const getCashfreeReturnUrl = () => `${getAppOrigin()}/result?order_id=`;

const normalizePhone = (phone = "") => String(phone).replace(/\D/g, "");

const normalizeCustomerName = (name = "", email = "") => {
  const cleaned = String(name || "").trim();
  if (cleaned && !cleaned.includes("@")) return cleaned.slice(0, 100);
  const emailLocal = String(email || "").split("@")[0]?.trim();
  if (emailLocal) return emailLocal.slice(0, 100);
  return "Richa Customer";
};

/** Cashfree/ibdelight successful orders use whole-rupee amounts (e.g. 8260). */
const normalizeOrderAmount = (totalPayment) => {
  const amount = Number(totalPayment);
  if (!Number.isFinite(amount) || amount <= 0) return 0;
  return Math.round(amount);
};

export function extractPaymentSessionId(payload) {
  const raw = payload?.data !== undefined ? payload.data : payload;
  const nested = raw?.data !== undefined ? raw.data : raw;
  const candidates = [
    nested?.payment_id,
    nested?.payment_session_id,
    nested?.paymentSessionId,
    raw?.payment_id,
    raw?.payment_session_id,
    raw?.paymentSessionId,
    payload?.payment_id,
    payload?.payment_session_id,
    payload?.paymentSessionId,
  ];
  for (const c of candidates) {
    if (c !== undefined && c !== null && String(c).trim() !== "") {
      return String(c).trim();
    }
  }
  return "";
}

export function extractShareValueFromResponse(payload) {
  const raw = payload?.data !== undefined ? payload.data : payload;
  const d = raw?.data !== undefined ? raw.data : raw;
  const candidates = [
    d?.share_value,
    d?.shareValue,
    d?.value,
    d?.shares,
    d?.your_shares,
    d?.yourShares,
    typeof d === "number" || typeof d === "string" ? d : null,
  ];
  for (const c of candidates) {
    if (c !== undefined && c !== null && String(c).trim() !== "") return c;
  }
  return null;
}

export async function getShareValue(authToken) {
  const token = authToken || "";
  const res = await service.get("share-value", {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  return extractShareValueFromResponse(res);
}

export async function postShareValue(value, authToken) {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return null;

  const token = authToken || "";
  const res = await service.post(
    "share-value",
    { value: n },
    { headers: token ? { Authorization: `Bearer ${token}` } : undefined }
  );
  return res.data;
}

export async function createPaymentOrder({
  name,
  email,
  phoneNumber,
  totalPayment,
  orderDesc,
}) {
  if (!CASHFREE_APP_ID || !CASHFREE_SECRET_KEY) {
    throw new Error(
      "Cashfree env vars are missing. Set VITE_CASHFREE_APP_ID and VITE_CASHFREE_SECRET_KEY."
    );
  }

  const amount = normalizeOrderAmount(totalPayment);
  if (!amount) {
    throw new Error("A valid payment amount is required.");
  }

  const mobile = normalizePhone(phoneNumber);
  if (!mobile || mobile.length < 10) {
    throw new Error("A valid 10-digit phone number is required for payment.");
  }

  const payload = {
    AppId: CASHFREE_APP_ID,
    SecretKey: CASHFREE_SECRET_KEY,
    BaseUrl: CASHFREE_API_BASE_URL,
    ReturnUrl: getCashfreeReturnUrl(),
    UserName: normalizeCustomerName(name, email),
    UserEmail: String(email || "").trim().toLowerCase(),
    UserMobile: mobile.slice(-10),
    OrderAmount: amount,
    OrderDesc: orderDesc || "Richa payment",
  };

  try {
    const response = await axios.post(PAYMENT_ORDER_URL, payload, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = response.data || {};
    const payment_id = extractPaymentSessionId(data);
    console.log("createOrder response.data:", data);
    return {
      ...data,
      payment_id,
    };
  } catch (error) {
    const apiData = error?.response?.data;
    const apiMessage =
      (typeof apiData?.error === "object"
        ? apiData?.error?.message
        : apiData?.error) ||
      apiData?.message ||
      apiData?.msg ||
      error?.message;
    console.error("Payment API Error:", apiData || error.message);
    console.error("Payment createOrder payload:", {
      ...payload,
      SecretKey: "[redacted]",
    });
    throw new Error(apiMessage || "Could not start payment.");
  }
}

export async function updateSubscriptionPaymentStatus(planId) {
  if (!planId) {
    throw new Error("Plan id is required to update subscription payment status.");
  }

  const normalizedPlanId = Number(planId);

  try {
    const response = await axios.post(
      `${UPDATE_SUBSCRIPTION_URL}/${normalizedPlanId}`,
      {
        payment_status: "1",
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    console.log("updateSubscriptionPaymentStatus response.data:", response.data);
    return response.data;
  } catch (error) {
    console.error(
      "Update subscription payment status error:",
      error?.response?.data || error.message
    );
    throw error;
  }
}

export async function creditMinutesAfterPayment({
  email,
  planId,
  userId,
  minutes,
  authToken,
}) {
  if (email && planId) {
    const subRes = await addSubscription({ email, planId });
    const resolvedPlanId = subRes?.resolvedPlanId || subRes?.plan_id || planId;
    await updateSubscriptionPaymentStatus(resolvedPlanId);
  }

  if (userId && minutes && authToken) {
    await service.post(
      "add-minute",
      { minute: String(minutes), user_id: userId },
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
  }
}

export async function addSubscription({ email, planId }) {
  if (!email || !planId) {
    throw new Error("Email and plan id are required to add subscription.");
  }

  const normalizedPlanId = Number(planId);

  if (!Number.isFinite(normalizedPlanId) || normalizedPlanId <= 0) {
    throw new Error("A valid numeric plan id is required to add subscription.");
  }

  try {
    const response = await axios.post(
      ADD_SUBSCRIPTION_URL,
      {
        email,
        plan_id: normalizedPlanId,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    console.log("addSubscription response.data:", response.data);
    return {
      ...response.data,
      resolvedPlanId: normalizedPlanId,
    };
  } catch (error) {
    console.error(
      "Add subscription error:",
      error?.response?.data || error.message
    );
    throw error;
  }
}

export async function creditMinutesAfterPayment({
  email,
  planId,
  userId,
  minutes,
  authToken,
}) {
  if (email && planId) {
    const subRes = await addSubscription({ email, planId });
    const resolvedPlanId = subRes?.resolvedPlanId || subRes?.plan_id || planId;
    await updateSubscriptionPaymentStatus(resolvedPlanId);
  }

  if (userId && minutes && authToken) {
    await service.post(
      "add-minute",
      { minute: String(minutes), user_id: userId },
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
  }
}

export async function completePlanSubscriptionAfterPayment({ email, planId }) {
  if (!email || !planId) return null;
  const subRes = await addSubscription({ email, planId });
  const resolvedPlanId = subRes?.resolvedPlanId || subRes?.plan_id || planId;
  await updateSubscriptionPaymentStatus(resolvedPlanId);
  return resolvedPlanId;
}
