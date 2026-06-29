import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import { creditMinutesAfterPayment, PENDING_MINUTE_PURCHASE_KEY, postShareValue } from "../../api/payment";

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

      let pending = null;
      try {
        const raw = sessionStorage.getItem(PENDING_MINUTE_PURCHASE_KEY);
        pending = raw ? JSON.parse(raw) : null;
      } catch {
        pending = null;
      }

      try {
        const authToken =
          Cookies.get("CallingAgent") || localStorage.getItem("ibcrmtoken") || "";
        await creditMinutesAfterPayment({
          email: pending?.email,
          planId: pending?.planId,
          userId: pending?.userId,
          minutes: pending?.minutes,
          authToken,
        });
        if (pending?.shareAmount != null) {
          await postShareValue(pending.shareAmount, authToken);
        }
      } catch (e) {
        console.warn("Post-payment minute credit failed:", e);
      }

      sessionStorage.removeItem(PENDING_MINUTE_PURCHASE_KEY);

      if (cancelled) return;

      toast.success("Payment successful!");
      navigate("/minutes", { replace: true });
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
        <p className="mt-2 text-sm text-slate-600">Please wait while we confirm your purchase.</p>
      </div>
    </div>
  );
}
