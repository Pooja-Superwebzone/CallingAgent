import React, { useCallback, useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import {
  fetchPlivoNumberPurchases,
  formatIndianPhoneDisplay,
  getPlivoPurchaseError,
} from "../../../api/plivoAvailableNumbersApi";

const PER_PAGE = 20;

function formatDateTime(value) {
  if (!value) return "-";
  try {
    return new Date(value).toLocaleString();
  } catch {
    return String(value);
  }
}

function formatAmount(amount, currency = "INR") {
  const n = Number(amount);
  if (!Number.isFinite(n)) return "-";
  if (currency === "INR") {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(n);
  }
  return `${currency} ${n.toFixed(2)}`;
}

function StatusBadge({ status }) {
  const normalized = String(status || "").toLowerCase();
  const styles =
    normalized === "paid"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : normalized === "pending"
        ? "bg-amber-50 text-amber-700 border-amber-200"
        : "bg-slate-100 text-slate-600 border-slate-200";
  return (
    <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-semibold capitalize ${styles}`}>
      {status || "-"}
    </span>
  );
}

function TableSkeleton() {
  return (
    <>
      {[1, 2, 3, 4, 5].map((i) => (
        <tr key={i} className="border-t border-slate-100 animate-pulse">
          <td className="px-4 py-3"><div className="h-4 w-8 bg-slate-200 rounded" /></td>
          <td className="px-4 py-3"><div className="h-4 w-12 bg-slate-200 rounded" /></td>
          <td className="px-4 py-3"><div className="h-4 w-36 bg-slate-200 rounded" /></td>
          <td className="px-4 py-3"><div className="h-4 w-20 bg-slate-200 rounded" /></td>
          <td className="px-4 py-3"><div className="h-4 w-16 bg-slate-200 rounded" /></td>
          <td className="px-4 py-3"><div className="h-4 w-24 bg-slate-200 rounded" /></td>
          <td className="px-4 py-3"><div className="h-4 w-32 bg-slate-200 rounded" /></td>
          <td className="px-4 py-3"><div className="h-4 w-28 bg-slate-200 rounded" /></td>
        </tr>
      ))}
    </>
  );
}

export default function NumberPurchasesTab() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState(null);

  const [userIdInput, setUserIdInput] = useState("");
  const [statusInput, setStatusInput] = useState("");
  const [appliedUserId, setAppliedUserId] = useState("");
  const [appliedStatus, setAppliedStatus] = useState("");

  const loadPurchases = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetchPlivoNumberPurchases({
        user_id: appliedUserId || undefined,
        payment_status: appliedStatus || undefined,
        per_page: PER_PAGE,
        page,
      });
      setRows(Array.isArray(res.data) ? res.data : []);
      setMeta(res.meta);
    } catch (err) {
      const msg = getPlivoPurchaseError(err, "Failed to load number purchases");
      setError(msg);
      setRows([]);
      setMeta(null);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [appliedUserId, appliedStatus, page]);

  useEffect(() => {
    loadPurchases();
  }, [loadPurchases]);

  const handleApplyFilters = (e) => {
    e.preventDefault();
    setPage(1);
    setAppliedUserId(userIdInput.trim());
    setAppliedStatus(statusInput);
  };

  const handleClearFilters = () => {
    setUserIdInput("");
    setStatusInput("");
    setAppliedUserId("");
    setAppliedStatus("");
    setPage(1);
  };

  const currentPage = meta?.current_page ?? page;
  const lastPage = meta?.last_page ?? 1;
  const total = meta?.total ?? rows.length;
  const canPrev = currentPage > 1;
  const canNext = currentPage < lastPage;

  return (
    <>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-xl font-bold text-gray-700">Number Purchases</h3>
          <p className="mt-1 text-sm text-slate-500">
            All Plivo number purchase records from Cashfree payments.
          </p>
        </div>
      </div>

      <form
        onSubmit={handleApplyFilters}
        className="mb-5 flex flex-wrap items-end gap-3 rounded-2xl border border-slate-200 bg-slate-50/80 p-4"
      >
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">User ID</label>
          <input
            type="text"
            value={userIdInput}
            onChange={(e) => setUserIdInput(e.target.value)}
            placeholder="e.g. 1200"
            className="w-36 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Payment status</label>
          <select
            value={statusInput}
            onChange={(e) => setStatusInput(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm min-w-[140px]"
          >
            <option value="">All</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>
        </div>
        <button
          type="submit"
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
        >
          Apply
        </button>
        {(appliedUserId || appliedStatus) && (
          <button
            type="button"
            onClick={handleClearFilters}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-white"
          >
            Clear
          </button>
        )}
      </form>

      {error && !loading && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-[1000px] w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-600">
              <tr>
                <th className="px-4 py-3 font-semibold">ID</th>
                <th className="px-4 py-3 font-semibold">User ID</th>
                <th className="px-4 py-3 font-semibold">Phone Number</th>
                <th className="px-4 py-3 font-semibold">Amount</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Payment Ref</th>
                <th className="px-4 py-3 font-semibold">Notes</th>
                <th className="px-4 py-3 font-semibold">Purchased At</th>
              </tr>
            </thead>
            <tbody className="text-slate-800">
              {loading ? (
                <TableSkeleton />
              ) : rows.length === 0 ? (
                <tr className="border-t border-slate-100">
                  <td colSpan={8} className="px-4 py-12 text-center text-slate-500">
                    No number purchases found.
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={row.id ?? `${row.user_id}-${row.phone_no}`} className="border-t border-slate-100">
                    <td className="px-4 py-3">{row.id ?? "-"}</td>
                    <td className="px-4 py-3">{row.user_id ?? "-"}</td>
                    <td className="px-4 py-3 font-medium">
                      {formatIndianPhoneDisplay(row.phone_no)}
                    </td>
                    <td className="px-4 py-3">
                      {formatAmount(row.amount, row.currency)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={row.payment_status} />
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">
                      {row.payment_reference || "-"}
                    </td>
                    <td className="px-4 py-3 max-w-[200px] truncate" title={row.notes || ""}>
                      {row.notes || "-"}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {formatDateTime(row.created_at)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {!loading && total > 0 && (
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-600">
            Page {currentPage} of {lastPage} · {total} total
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={!canPrev || loading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm disabled:opacity-40 hover:bg-slate-50"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={!canNext || loading}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm disabled:opacity-40 hover:bg-slate-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </>
  );
}
