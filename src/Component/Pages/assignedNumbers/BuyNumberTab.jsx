import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { toast } from "react-hot-toast";
import service from "../../../api/axios";
import {
  createPaymentOrder,
  PENDING_BUY_NUMBER_KEY,
} from "../../../api/payment";
import {
  buildNumberPurchaseNotes,
  calculateBuyNumberPricing,
  createPlivoNumberPurchase,
  fetchPlivoAvailableNumbers,
  formatIndianPhoneDisplay,
  getPlivoAvailableNumbersError,
  getPlivoPurchaseError,
} from "../../../api/plivoAvailableNumbersApi";

const PREFIX_OPTIONS = [
  { value: "", label: "Any" },
  { value: "080", label: "080" },
  { value: "022", label: "022" },
  { value: "160", label: "160" },
];
const PAGE_SIZE = 20;

function formatINR(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

function TableSkeleton() {
  return (
    <>
      {[1, 2, 3, 4, 5].map((i) => (
        <tr key={i} className="border-t border-slate-100 animate-pulse">
          <td className="px-4 py-3"><div className="h-4 w-4 bg-slate-200 rounded-full mx-auto" /></td>
          <td className="px-4 py-3"><div className="h-4 w-40 bg-slate-200 rounded" /></td>
          <td className="px-4 py-3"><div className="h-4 w-28 bg-slate-200 rounded" /></td>
          <td className="px-4 py-3"><div className="h-4 w-16 bg-slate-200 rounded" /></td>
          <td className="px-4 py-3"><div className="h-4 w-24 bg-slate-200 rounded" /></td>
        </tr>
      ))}
    </>
  );
}

function CapabilityBadge({ enabled, label }) {
  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
        enabled
          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
          : "bg-slate-100 text-slate-400 border border-slate-200"
      }`}
    >
      {label}
    </span>
  );
}

function selectNumber(row, setSelectedNumber, setSelectedRow) {
  const e164 = row.number_e164 || `+${row.number}`;
  setSelectedNumber(e164);
  setSelectedRow(row);
}

export default function BuyNumberTab() {
  const navigate = useNavigate();
  const pricing = useMemo(() => calculateBuyNumberPricing(), []);

  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [smsEnabled, setSmsEnabled] = useState(false);
  const [pattern, setPattern] = useState("");
  const [regionKeyword, setRegionKeyword] = useState("");
  const [debouncedRegion, setDebouncedRegion] = useState("");
  const [offset, setOffset] = useState(0);

  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedNumber, setSelectedNumber] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [profileDetails, setProfileDetails] = useState({
    userId: "",
    name: "",
    email: "",
    phoneNumber: "",
  });

  const services = useMemo(() => {
    const parts = [];
    if (voiceEnabled) parts.push("voice");
    if (smsEnabled) parts.push("sms");
    return parts.length ? parts.join(",") : "voice";
  }, [voiceEnabled, smsEnabled]);

  useEffect(() => {
    if (typeof window !== "undefined" && window.Cashfree && !window.cashfree) {
      window.cashfree = window.Cashfree({ mode: "production" });
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadProfile = async () => {
      try {
        const res = await service.get("Profile", {
          headers: { Authorization: `Bearer ${Cookies.get("CallingAgent")}` },
        });
        if (cancelled) return;
        const profile = res?.data?.data || {};
        setProfileDetails({
          userId:
            profile?.id ??
            profile?.user_id ??
            profile?.twilio_create_id ??
            "",
          name:
            profile?.name ||
            profile?.emp_name ||
            profile?.full_name ||
            Cookies.get("name") ||
            "Customer",
          email:
            profile?.email ||
            profile?.emp_email ||
            Cookies.get("email") ||
            "",
          phoneNumber:
            profile?.contact_no ||
            profile?.phone_no ||
            profile?.mobile ||
            Cookies.get("contact_no") ||
            "",
        });
      } catch {
        if (!cancelled) {
          setProfileDetails({
            userId: "",
            name: Cookies.get("name") || "Customer",
            email: Cookies.get("email") || "",
            phoneNumber: Cookies.get("contact_no") || "",
          });
        }
      }
    };

    loadProfile();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedRegion(regionKeyword.trim()), 300);
    return () => clearTimeout(t);
  }, [regionKeyword]);

  useEffect(() => {
    setOffset(0);
  }, [pattern, services, debouncedRegion]);

  const loadNumbers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetchPlivoAvailableNumbers({
        country_iso: "IN",
        type: "fixed",
        services,
        pattern: pattern || undefined,
        region: debouncedRegion || undefined,
        city: debouncedRegion || undefined,
        limit: PAGE_SIZE,
        offset,
      });
      setRows(res.data);
      setMeta(res.meta);
      setSelectedNumber(null);
      setSelectedRow(null);
    } catch (err) {
      const msg = getPlivoAvailableNumbersError(err);
      setError(msg);
      setRows([]);
      setMeta(null);
      if (err?.response?.status === 401) {
        toast.error("Session expired. Please log in again.");
        navigate("/login?tab=login", { replace: true });
      }
    } finally {
      setLoading(false);
    }
  }, [services, pattern, debouncedRegion, offset, navigate]);

  useEffect(() => {
    const t = setTimeout(() => {
      loadNumbers();
    }, 300);
    return () => clearTimeout(t);
  }, [loadNumbers]);

  const totalCount = meta?.total_count ?? 0;
  const currentPage = Math.floor(offset / PAGE_SIZE) + 1;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const canPrev = offset > 0;
  const canNext = offset + PAGE_SIZE < totalCount;

  const recordNumberPurchase = async (paymentReference) => {
    const userId = profileDetails.userId;
    if (!userId) {
      throw new Error("User id was not found. Please log in again.");
    }

    return createPlivoNumberPurchase({
      user_id: userId,
      phone_no: selectedNumber,
      amount: pricing.totalWithTax,
      currency: "INR",
      payment_status: "paid",
      payment_reference: paymentReference,
      notes: buildNumberPurchaseNotes(selectedRow),
    });
  };

  const handleBuyNumber = async () => {
    if (!selectedNumber) {
      toast.error("Please select a number to buy.");
      return;
    }

    if (!profileDetails.userId) {
      toast.error("User id was not found. Please log in again.");
      return;
    }

    const customerEmail = profileDetails.email || Cookies.get("email") || "";
    if (!customerEmail) {
      toast.error("Your email was not found. Please log in again.");
      return;
    }

    const customerPhone =
      profileDetails.phoneNumber || Cookies.get("contact_no") || "";
    if (!customerPhone) {
      toast.error("Your phone number was not found. Please update your profile.");
      return;
    }

    if (!window.cashfree) {
      if (typeof window !== "undefined" && window.Cashfree) {
        window.cashfree = window.Cashfree({ mode: "production" });
      }
    }
    if (!window.cashfree) {
      toast.error("Payment gateway is not ready yet. Please refresh and try again.");
      return;
    }

    const customerName = profileDetails.name || "Customer";
    const payableAmount = pricing.totalWithTax;
    const purchaseNotes = buildNumberPurchaseNotes(selectedRow);

    setPaymentLoading(true);
    setError("");

    try {
      const response = await createPaymentOrder({
        name: customerName,
        email: customerEmail,
        phoneNumber: customerPhone,
        totalPayment: payableAmount,
        orderDesc: `Plivo Number Purchase - ${formatIndianPhoneDisplay(selectedNumber)}`,
      });

      const paymentSessionId = response?.payment_id || "";
      if (!paymentSessionId) {
        throw new Error("Payment session id was not returned from create order API.");
      }

      sessionStorage.setItem(
        PENDING_BUY_NUMBER_KEY,
        JSON.stringify({
          type: "buy_number",
          phoneNumber: selectedNumber,
          email: customerEmail,
          userId: profileDetails.userId,
          payableAmount,
          baseAmount: pricing.base,
          notes: purchaseNotes,
          paymentReference: paymentSessionId,
        })
      );

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
        if (result?.redirect) return;
        throw new Error("Payment was not completed.");
      }

      const paymentReference =
        result?.order?.order_id ||
        result?.paymentDetails?.orderId ||
        paymentSessionId;

      await recordNumberPurchase(paymentReference);
      sessionStorage.removeItem(PENDING_BUY_NUMBER_KEY);
      toast.success("Number purchased successfully!");
      setSelectedNumber(null);
      setSelectedRow(null);
      await loadNumbers();
    } catch (err) {
      sessionStorage.removeItem(PENDING_BUY_NUMBER_KEY);
      const rawMessage = err?.message || "Payment failed. Please try again.";
      const message =
        rawMessage.includes("Cashfree env vars are missing") ||
        rawMessage.includes("VITE_CASHFREE")
          ? "Payment is not configured. Set VITE_CASHFREE_APP_ID and VITE_CASHFREE_SECRET_KEY in .env and restart the dev server."
          : getPlivoPurchaseError(err, rawMessage);
      setError(message);
      toast.error(message);
    } finally {
      setPaymentLoading(false);
    }
  };

  return (
    <>
      <div className="mb-5">
        <h3 className="text-xl font-bold text-gray-700">Buy Number</h3>
        <p className="mt-1 text-sm text-slate-500">
          Search Plivo inventory, select a number, and buy for {formatINR(pricing.base)} + GST.
        </p>
      </div>

      <div className="mb-6 rounded-2xl border border-slate-200 bg-slate-50/80 p-4 space-y-4">
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Country</label>
            <div className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800">
              India (+91) — IN
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Capabilities</label>
            <div className="flex flex-wrap gap-3 rounded-lg border border-slate-300 bg-white px-3 py-2">
              <label className="inline-flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={voiceEnabled}
                  onChange={(e) => setVoiceEnabled(e.target.checked)}
                  className="rounded border-slate-300"
                />
                Voice
              </label>
              <label className="inline-flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={smsEnabled}
                  onChange={(e) => setSmsEnabled(e.target.checked)}
                  className="rounded border-slate-300"
                />
                SMS
              </label>
            </div>
          </div>

          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Region / City
            </label>
            <input
              type="text"
              value={regionKeyword}
              onChange={(e) => setRegionKeyword(e.target.value)}
              placeholder="e.g. Bangalore"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-2">Number prefix</label>
          <div className="flex flex-wrap gap-2">
            {PREFIX_OPTIONS.map(({ value, label }) => (
              <button
                key={label}
                type="button"
                onClick={() => setPattern(value)}
                className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
                  pattern === value
                    ? "bg-slate-900 text-white"
                    : "bg-white border border-slate-300 text-slate-700 hover:bg-slate-100"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && !loading && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-[900px] w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-600">
              <tr>
                <th className="px-4 py-3 font-semibold w-10" />
                <th className="px-4 py-3 font-semibold">Phone Number</th>
                <th className="px-4 py-3 font-semibold">Location</th>
                <th className="px-4 py-3 font-semibold">Type</th>
                <th className="px-4 py-3 font-semibold">Capabilities</th>
              </tr>
            </thead>
            <tbody className="text-slate-800">
              {loading ? (
                <TableSkeleton />
              ) : rows.length === 0 ? (
                <tr className="border-t border-slate-100">
                  <td colSpan={5} className="px-4 py-12 text-center text-slate-500">
                    No numbers found for these filters.
                  </td>
                </tr>
              ) : (
                rows.map((row) => {
                  const e164 = row.number_e164 || `+${row.number}`;
                  const isSelected = selectedNumber === e164;
                  const location = [row.city, row.region].filter(Boolean).join(", ") || "-";
                  return (
                    <tr
                      key={e164}
                      onClick={() => selectNumber(row, setSelectedNumber, setSelectedRow)}
                      className={`border-t border-slate-100 cursor-pointer transition ${
                        isSelected ? "bg-indigo-50/80" : "hover:bg-slate-50/60"
                      }`}
                    >
                      <td className="px-4 py-3 text-center">
                        <input
                          type="radio"
                          name="plivo-number"
                          checked={isSelected}
                          onChange={() => selectNumber(row, setSelectedNumber, setSelectedRow)}
                          className="text-indigo-600"
                        />
                      </td>
                      <td className="px-4 py-3 font-medium">
                        {formatIndianPhoneDisplay(e164)}
                      </td>
                      <td className="px-4 py-3">{location}</td>
                      <td className="px-4 py-3 capitalize">{row.type || "fixed"}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          <CapabilityBadge enabled={row.voice_enabled} label="Voice" />
                          <CapabilityBadge enabled={row.sms_enabled} label="SMS" />
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {!loading && totalCount > 0 && (
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-600">
            Showing {offset + 1}–{Math.min(offset + PAGE_SIZE, totalCount)} of {totalCount}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={!canPrev || loading}
              onClick={() => setOffset((o) => Math.max(0, o - PAGE_SIZE))}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm disabled:opacity-40 hover:bg-slate-50"
            >
              Previous
            </button>
            <span className="text-sm text-slate-600 px-2">
              Page {currentPage} of {totalPages}
            </span>
            <button
              type="button"
              disabled={!canNext || loading}
              onClick={() => setOffset((o) => o + PAGE_SIZE)}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm disabled:opacity-40 hover:bg-slate-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {selectedNumber && (
        <div className="mt-4 rounded-2xl border border-indigo-200 bg-indigo-50/60 p-4 sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold text-indigo-900">Selected number</p>
              <p className="mt-1 text-lg font-bold text-indigo-950">
                {formatIndianPhoneDisplay(selectedNumber)}
              </p>
              {selectedRow && buildNumberPurchaseNotes(selectedRow) && (
                <p className="mt-1 text-sm text-indigo-700">
                  {buildNumberPurchaseNotes(selectedRow)}
                </p>
              )}
              <div className="mt-3 space-y-1 text-sm text-indigo-800">
                <div className="flex justify-between gap-8">
                  <span>Base price</span>
                  <span>{formatINR(pricing.base)}</span>
                </div>
                <div className="flex justify-between gap-8">
                  <span>CGST (9%)</span>
                  <span>{formatINR(pricing.cgst)}</span>
                </div>
                <div className="flex justify-between gap-8">
                  <span>SGST (9%)</span>
                  <span>{formatINR(pricing.sgst)}</span>
                </div>
                <div className="flex justify-between gap-8 border-t border-indigo-200 pt-2 font-semibold text-indigo-950">
                  <span>Total payable</span>
                  <span>{formatINR(pricing.totalWithTax)}</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleBuyNumber}
              disabled={paymentLoading}
              className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60 min-w-[160px]"
            >
              {paymentLoading ? "Opening payment…" : `Buy — ${formatINR(pricing.totalWithTax)}`}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
