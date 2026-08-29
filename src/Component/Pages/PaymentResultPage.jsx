import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import service from "../../api/axios";
import {
  creditMinutesAfterPayment,
  PENDING_MINUTE_PURCHASE_KEY,
  PENDING_PAYMENT_KEY,
  PENDING_BUY_NUMBER_KEY,
  postShareValue,
} from "../../api/payment";
import {
  createPlivoNumberPurchase,
  getPlivoPurchaseError,
} from "../../api/plivoAvailableNumbersApi";

export default function PaymentResultPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const orderId = searchParams.get("order_id");

  useEffect(() => {
    let cancelled = false;

    const handleReturn = async () => {
      if (!orderId) {
        toast.error("Payment failed. Please try again.");
        navigate("/", { replace: true });
        return;
      }

      let pending = null;
      try {
        const raw =
          sessionStorage.getItem(PENDING_PAYMENT_KEY) ||
          sessionStorage.getItem(PENDING_BUY_NUMBER_KEY) ||
          sessionStorage.getItem(PENDING_MINUTE_PURCHASE_KEY);
        pending = raw ? JSON.parse(raw) : null;
      } catch {
        pending = null;
      }

      try {
        const authToken =
          pending?.authToken ||
          Cookies.get("CallingAgent") ||
          localStorage.getItem("ibcrmtoken") ||
          "";

        const pendingType =
          pending?.type ||
          (pending?.phoneNumber
            ? "buy_number"
            : pending?.minutes
              ? "minutes"
              : pending?.selectedDate
                ? "webinar"
                : "plan");

        if (pendingType === "buy_number") {
          const phoneNumber = String(pending?.phoneNumber || "").trim();
          const userId = pending?.userId;
          if (phoneNumber && userId) {
            await createPlivoNumberPurchase({
              user_id: userId,
              phone_no: phoneNumber,
              amount: pending?.payableAmount ?? pending?.baseAmount ?? 0,
              currency: "INR",
              payment_status: "paid",
              payment_reference: orderId || pending?.paymentReference || "",
              notes: pending?.notes || "",
            });
          }
        } else if (pendingType === "minutes") {
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
        } else if (pendingType === "webinar") {
          const email = String(pending?.email || "").trim();
          const date = String(pending?.selectedDate || "").trim();
          const time = String(pending?.time || "10:00").trim();
          if (email && date) {
            await service.post("store-name-date", {
              name: email,
              date: `${date} ${time}:00`,
            });
          }
        } else if (pendingType === "exam") {
          // no server-side action required; just route user
        } else {
          // default: plan/subscription purchase
          await creditMinutesAfterPayment({
            email: pending?.email,
            planId: pending?.planId,
            authToken,
          });
        }
      } catch (e) {
        console.warn("Post-payment handler failed:", e);
        const pendingType =
          pending?.type ||
          (pending?.phoneNumber
            ? "buy_number"
            : pending?.minutes
              ? "minutes"
              : pending?.selectedDate
                ? "webinar"
                : "plan");
        if (pendingType === "buy_number") {
          toast.error(getPlivoPurchaseError(e, "Payment received but number purchase failed. Contact support."));
          navigate("/settings/buy-number", { replace: true });
          return;
        }
      }

      sessionStorage.removeItem(PENDING_MINUTE_PURCHASE_KEY);
      sessionStorage.removeItem(PENDING_PAYMENT_KEY);
      sessionStorage.removeItem(PENDING_BUY_NUMBER_KEY);

      if (cancelled) return;

      toast.success("Payment successful!");

      const pendingType =
        pending?.type ||
        (pending?.phoneNumber
          ? "buy_number"
          : pending?.minutes
            ? "minutes"
            : pending?.selectedDate
              ? "webinar"
              : "plan");

      if (pendingType === "minutes") {
        navigate("/minutes", { replace: true });
      } else if (pendingType === "buy_number") {
        navigate("/settings/buy-number", { replace: true });
      } else if (pendingType === "webinar") {
        const email = String(pending?.email || "").trim();
        const params = new URLSearchParams();
        if (email) params.set("email", email);
        params.set("webinar", "paid");
        navigate(`/exam-info?${params.toString()}`, { replace: true });
      } else if (pendingType === "exam") {
        const email = String(pending?.email || "").trim();
        navigate(`/exam-start?email=${encodeURIComponent(email)}`, {
          replace: true,
        });
      } else {
        navigate("/dashboard", { replace: true });
      }
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