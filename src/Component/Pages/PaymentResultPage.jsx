import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import {
  completePlanSubscriptionAfterPayment,
  creditMinutesAfterPayment,
  PENDING_MINUTE_PURCHASE_KEY,
  PENDING_PLAN_PURCHASE_KEY,
  postShareValue,
} from "../../api/payment";

export default function PaymentResultPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const orderId = searchParams.get("order_id");

  useEffect(() => {
    let cancelled = false;

    const handleReturn = async () => {
      if (!orderId) {
        toast.error("Payment failed. Please try again.");
        navigate("/minutes", { replace: true });
        return;
      }

      let pendingMinutes = null;
      let pendingPlan = null;
      try {
        const rawMinutes = sessionStorage.getItem(PENDING_MINUTE_PURCHASE_KEY);
        pendingMinutes = rawMinutes ? JSON.parse(rawMinutes) : null;
      } catch {
        pendingMinutes = null;
      }
      try {
        const rawPlan = sessionStorage.getItem(PENDING_PLAN_PURCHASE_KEY);
        pendingPlan = rawPlan ? JSON.parse(rawPlan) : null;
      } catch {
        pendingPlan = null;
      }

      const authToken =
        Cookies.get("CallingAgent") || localStorage.getItem("ibcrmtoken") || "";

      try {
        if (pendingMinutes) {
          await creditMinutesAfterPayment({
            email: pendingMinutes?.email,
            planId: pendingMinutes?.planId,
            userId: pendingMinutes?.userId,
            minutes: pendingMinutes?.minutes,
            authToken,
          });
          if (pendingMinutes?.shareAmount != null) {
            await postShareValue(pendingMinutes.shareAmount, authToken);
          }
        } else if (pendingPlan) {
          await completePlanSubscriptionAfterPayment({
            email: pendingPlan?.email,
            planId: pendingPlan?.planId,
          });
        }
      } catch (e) {
        console.warn("Post-payment fulfillment failed:", e);
      }

      sessionStorage.removeItem(PENDING_MINUTE_PURCHASE_KEY);
      sessionStorage.removeItem(PENDING_PLAN_PURCHASE_KEY);

      if (cancelled) return;

      toast.success("Payment successful!");
      navigate(pendingPlan && !pendingMinutes ? "/agents_page" : "/minutes", {
        replace: true,
      });
    };

    handleReturn();

    return () => {
      cancelled = true;
    };
  }, [orderId, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="rounded-2xl border border-slate-200 bg-white px-6 py-8 text-center shadow-sm">
        <p className="text-lg font-semibold text-slate-900">Processing payment…</p>
        <p className="mt-2 text-sm text-slate-600">
          Please wait while we confirm your purchase.
        </p>
      </div>
    </div>
  );
}
