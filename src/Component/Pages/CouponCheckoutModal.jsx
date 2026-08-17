import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import {
  applyCoupon,
  calculateTotalAfterCoupon,
  getCouponDiscountAmount,
} from "../../api/payment";

function formatINR(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return "₹ 0.00";
  return `₹ ${n.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export default function CouponCheckoutModal({
  open,
  onClose,
  originalTotal,
  onProceed,
  title = "Apply Coupon",
}) {
  const [code, setCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [applying, setApplying] = useState(false);
  const [proceeding, setProceeding] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setCode("");
    setAppliedCoupon(null);
    setApplying(false);
    setProceeding(false);
    setError("");
  }, [open]);

  const discount = useMemo(
    () => getCouponDiscountAmount(appliedCoupon),
    [appliedCoupon]
  );

  const finalTotal = useMemo(
    () => calculateTotalAfterCoupon(originalTotal, appliedCoupon),
    [originalTotal, appliedCoupon]
  );

  if (!open) return null;

  const handleApply = async () => {
    if (!String(code || "").trim()) {
      setError("Please enter a coupon code.");
      return;
    }
    setApplying(true);
    setError("");
    try {
      const res = await applyCoupon(code);
      setAppliedCoupon(res);
      toast.success(res?.message || "Coupon applied successfully!");
    } catch (err) {
      setAppliedCoupon(null);
      const msg = err?.message || "Failed to apply coupon.";
      setError(msg);
      toast.error(msg);
    } finally {
      setApplying(false);
    }
  };

  const handleProceed = async (skipCoupon = false) => {
    setProceeding(true);
    try {
      await onProceed(finalTotal, skipCoupon ? null : appliedCoupon);
    } finally {
      setProceeding(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-slate-900">{title}</h3>
            <p className="mt-1 text-sm text-slate-500">
              Optional — apply a coupon or continue without one.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={proceeding || applying}
            className="text-slate-400 hover:text-slate-600 text-xl leading-none"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-600">Original amount</span>
            <span className="font-semibold text-slate-900">{formatINR(originalTotal)}</span>
          </div>
          {discount > 0 && (
            <>
              <div className="mt-2 flex justify-between text-emerald-700">
                <span>Coupon discount</span>
                <span className="font-semibold">- {formatINR(discount)}</span>
              </div>
              <div className="mt-2 flex justify-between border-t border-slate-200 pt-2">
                <span className="font-semibold text-slate-800">Payable amount</span>
                <span className="text-lg font-bold text-slate-900">{formatINR(finalTotal)}</span>
              </div>
            </>
          )}
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Coupon code
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={code}
              onChange={(e) => {
                setCode(e.target.value);
                setError("");
              }}
              placeholder="Enter coupon code"
              className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm"
              disabled={applying || proceeding}
            />
            <button
              type="button"
              onClick={handleApply}
              disabled={applying || proceeding || !String(code || "").trim()}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
            >
              {applying ? "Applying..." : "Apply"}
            </button>
          </div>
          {appliedCoupon?.data?.code && (
            <p className="mt-2 text-xs text-emerald-600">
              Applied: {appliedCoupon.data.code}
              {appliedCoupon.data.coupon_description
                ? ` — ${appliedCoupon.data.coupon_description}`
                : ""}
            </p>
          )}
          {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
        </div>

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => handleProceed(true)}
            disabled={proceeding || applying}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
          >
            Continue without coupon
          </button>
          <button
            type="button"
            onClick={() => handleProceed(false)}
            disabled={proceeding || applying}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
          >
            {proceeding ? "Processing..." : `Pay ${formatINR(finalTotal)}`}
          </button>
        </div>
      </div>
    </div>
  );
}
