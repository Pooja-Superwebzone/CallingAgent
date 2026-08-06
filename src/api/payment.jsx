import axios from "axios";
import { service } from "./axios";

const PAYMENT_ORDER_URL = "https://payment.ibdelight.in/api/createOrder";
const CASHFREE_API_BASE_URL = "https://api.cashfree.com/pg/orders";
const DEFAULT_HTTPS_APP_ORIGIN = "https://richa.infinitybrains.com";

const CASHFREE_APP_ID = import.meta.env.VITE_CASHFREE_APP_ID;
const CASHFREE_SECRET_KEY = import.meta.env.VITE_CASHFREE_SECRET_KEY;

const resolvePaymentReturnOrigin = () => {
  if (typeof window !== "undefined") {
    const liveOrigin = String(window.location.origin).replace(/\/$/, "");
    if (liveOrigin.startsWith("https://")) return liveOrigin;
  }

  const fromEnv = String(import.meta.env.VITE_APP_ORIGIN || "")
    .trim()
    .replace(/\/$/, "");
  if (fromEnv) return fromEnv;

  return DEFAULT_HTTPS_APP_ORIGIN;
};

const APP_ORIGIN = resolvePaymentReturnOrigin();
const CASHFREE_RETURN_URL = `${APP_ORIGIN}/result?order_id=`;

const extractPaymentOrderError = (error) => {
  const payload = error?.response?.data;
  const nested = payload?.error;
  const cashfreeMessage =
    nested?.response?.data?.message ||
    nested?.message ||
    payload?.message ||
    payload?.msg;
  if (cashfreeMessage) return String(cashfreeMessage);
  if (typeof payload === "string" && payload.trim()) return payload;
  return error?.message || "Payment failed. Please try again.";
};
const ADD_SUBSCRIPTION_URL = "https://api-main.ibcrm.in/api/add-subscription";
const UPDATE_SUBSCRIPTION_URL = "https://api-main.ibcrm.in/api/update-subscription";

export const PENDING_MINUTE_PURCHASE_KEY = "pendingMinutePurchase";
export const PENDING_PAYMENT_KEY = "pendingPayment";

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
    throw new Error("Cashfree env vars are missing. Set VITE_CASHFREE_APP_ID and VITE_CASHFREE_SECRET_KEY.");
  }

  const orderAmount = String(totalPayment ?? "").trim();
  if (!orderAmount) {
    throw new Error("Order amount is required.");
  }

  try {
    const response = await axios.post(
      PAYMENT_ORDER_URL,
      {
        AppId: CASHFREE_APP_ID,
        SecretKey: CASHFREE_SECRET_KEY,
        BaseUrl: CASHFREE_API_BASE_URL,
        ReturnUrl: CASHFREE_RETURN_URL,
        UserName: name,
        UserEmail: email,
        UserMobile: phoneNumber,
        OrderAmount: orderAmount,
        OrderDesc: orderDesc,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    console.log("createOrder response.data:", response.data);
    return response.data;
  } catch (error) {
    const message = extractPaymentOrderError(error);
    console.error("Payment API Error:", error?.response?.data || message);
    throw new Error(message);
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