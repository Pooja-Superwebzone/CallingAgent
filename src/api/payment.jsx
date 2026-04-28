import axios from "axios";

const PAYMENT_ORDER_URL = "https://payment.ibdelight.in/api/createOrder";
const CASHFREE_API_BASE_URL = "https://api.cashfree.com/pg/orders";
const CASHFREE_WEBSITE_URL = "https://richa.infinitybrains.com";
const CASHFREE_RETURN_URL = `${CASHFREE_WEBSITE_URL}/result?order_id=`;
const ADD_SUBSCRIPTION_URL = "https://api-main.ibcrm.in/api/add-subscription";
const UPDATE_SUBSCRIPTION_URL = "https://api-main.ibcrm.in/api/update-subscription";
const CASHFREE_APP_ID = import.meta.env.VITE_CASHFREE_APP_ID;
const CASHFREE_SECRET_KEY = import.meta.env.VITE_CASHFREE_SECRET_KEY;
// const CASHFREE_APP_ID = "6915 866f7f20bcb   60977 
// 5864a9685196";
// const CASHFREE_SECRET_KEY = "c
// f
// sk  _ma_ prod_  46
// d7
// 8ceada96539830a656518
// 
// 8abcd58_4c98
// 137a";


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
        OrderAmount: totalPayment,
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
    console.error("Payment API Error:", error?.response?.data || error.message);
    throw error;
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
