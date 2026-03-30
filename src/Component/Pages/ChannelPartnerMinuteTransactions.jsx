import React, { useEffect, useMemo, useState } from "react";
import Cookies from "js-cookie";
import { toast } from "react-hot-toast";
import {
  getChannelPartnerMinuteTransactions,
  getChannelPartners,
  getAllUsers,
} from "../../hooks/useAuth";

const pickFirstDefined = (obj, keys) => {
  for (const k of keys) {
    const v = obj?.[k];
    if (v !== undefined && v !== null && v !== "") return v;
  }
  return undefined;
};

const normalizeId = (value) => {
  if (value === undefined || value === null || value === "") return "";
  if (typeof value === "object") {
    // Common patterns: `{ id }` or `{ user_id }` inside a nested object
    return (
      value?.id ??
      value?.user_id ??
      value?.userId ??
      value?.partner_id ??
      value?.channel_partner_id ??
      value?.channelPartnerId ??
      ""
    );
  }
  return value;
};

const formatMinuteAmount = (value) => {
  const n = Number(value);
  if (!Number.isFinite(n)) return "-";
  return n;
};

export default function ChannelPartnerMinuteTransactions() {
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [channelPartnerNameById, setChannelPartnerNameById] = useState({});
  const [channelPartnerRemainingMinuteById, setChannelPartnerRemainingMinuteById] = useState({});
  const [userLabelById, setUserLabelById] = useState({});
  const [error, setError] = useState("");

  const [page, setPage] = useState(1);
  const pageSize = 10;

  const currentRole = String(Cookies.get("role") || "").trim().toLowerCase();
  const twilioUser = Number(Cookies.get("twilio_user") || "0");

  const authorized = currentRole === "admin" && twilioUser === 0;

  const groupedTransactions = useMemo(() => {
    const list = Array.isArray(transactions) ? transactions : [];
    const map = new Map();

    list.forEach((tx) => {
      const cpId = normalizeId(
        pickFirstDefined(tx, [
          "channel_partner_id",
          "channelPartnerId",
          "from_channel_partner_id",
          "fromChannelPartnerId",
          "partner_id",
          "partnerId",
          "channel_partner",
          "channelPartner",
          "from_channel_partner",
          "fromChannelPartner",
        ])
      );
      const toId = normalizeId(
        pickFirstDefined(tx, [
          "to_user_id",
          "toUserId",
          "user_id",
          "userId",
          "recipient_user_id",
        ])
      );
      const key = `${cpId || "cp"}::${toId || "to"}`;
      const minute = Number(
        pickFirstDefined(tx, ["minute_amount", "minuteAmount", "minute", "minutes", "amount", "minute_value"]) ?? 0
      );
      const current = map.get(key);

      if (!current) {
        map.set(key, {
          ...tx,
          _sumMinute: Number.isFinite(minute) ? minute : 0,
        });
        return;
      }

      const nextSum = current._sumMinute + (Number.isFinite(minute) ? minute : 0);
      // keep latest transaction object but preserve accumulated minutes
      map.set(key, {
        ...current,
        ...tx,
        _sumMinute: nextSum,
      });
    });

    return Array.from(map.values());
  }, [transactions]);

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil((groupedTransactions || []).length / pageSize));
  }, [groupedTransactions]);

  useEffect(() => {
    setPage((prev) => {
      if (prev < 1) return 1;
      if (prev > totalPages) return totalPages;
      return prev;
    });
  }, [totalPages]);

  const pageRows = useMemo(() => {
    const list = Array.isArray(groupedTransactions) ? groupedTransactions : [];
    const safePage = Math.min(Math.max(page, 1), totalPages);
    return list.slice((safePage - 1) * pageSize, safePage * pageSize);
  }, [groupedTransactions, page, totalPages]);

  useEffect(() => {
    if (!authorized) return;

    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const [txList, partners, users] = await Promise.all([
          getChannelPartnerMinuteTransactions(),
          getChannelPartners(),
          getAllUsers(),
        ]);

        const normalizedTx = Array.isArray(txList) ? txList : [];
        setTransactions(normalizedTx);

        const normalizedPartners = Array.isArray(partners) ? partners : [];
        const map = {};
        const minuteMap = {};
        for (const p of normalizedPartners) {
          const id = pickFirstDefined(p, [
            "id",
            "channel_partner_id",
            "channelPartnerId",
            "partner_id",
            "partnerId",
            "twilio_user_id",
            "twilio_create_id",
            "twilioUserId",
          ]);
          if (id === undefined || id === null || id === "") continue;

          const name = pickFirstDefined(p, [
            "name",
            "channel_partner_name",
            "channelPartnerName",
            "partner_name",
            "partnerName",
            "full_name",
            "fullName",
            "emp_name",
            "username",
          ]);

          const idKeys = [
            id,
            p?.user_id,
            p?.omni_minute?.user_id,
            p?.twilio_user_minute?.user_id,
          ]
            .filter((v) => v !== undefined && v !== null && v !== "")
            .map((v) => String(v));

          idKeys.forEach((k) => {
            map[k] = name || map[k] || "";
          });

          const remainingMinuteRaw =
            p?.omni_minute?.minute ??
            p?.minute ??
            p?.minutes ??
            p?.twilio_user_minute?.minute ??
            0;
          const remainingMinute = Number(remainingMinuteRaw);
          const resolvedRemainingMinute = Number.isFinite(remainingMinute) ? remainingMinute : 0;
          idKeys.forEach((k) => {
            minuteMap[k] = resolvedRemainingMinute;
          });
        }
        setChannelPartnerNameById(map);
        setChannelPartnerRemainingMinuteById(minuteMap);

        const userMap = {};
        const normalizedUsers = Array.isArray(users) ? users : [];
        for (const u of normalizedUsers) {
          const id = u?.id ?? u?.user_id ?? u?.twilio_user_minute?.user_id ?? "";
          if (id === undefined || id === null || id === "") continue;
          const label = u?.name ?? u?.username ?? u?.email ?? `User ${id}`;
          userMap[String(id)] = label;
        }
        setUserLabelById(userMap);
      } catch (e) {
        setError(e?.message || "Failed to load transactions");
        toast.error(e?.message || "Failed to load transactions");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [authorized]);

  if (!authorized) {
    return (
      <div className="p-4 sm:p-6 w-full">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900">Not authorized</h2>
          <p className="mt-2 text-sm text-slate-600">
            This page is available to admins.
          </p>
          <div className="mt-3 text-xs text-slate-500">
            role={String(currentRole || "-")} , twilio_user={String(Cookies.get("twilio_user") || "-")}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 w-full">
      <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div>
          <h2 className="text-2xl font-bold text-gray-700">
            Channel Partner Minute Transactions
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Shows minutes donated to users by channel partners.
          </p>
        </div>
      </div>

      {error ? (
        <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-rose-700 text-sm">
          {error}
        </div>
      ) : null}

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-[900px] w-full table-fixed text-sm">
          <colgroup>
            <col className="w-1/4" />
            <col className="w-1/4" />
            <col className="w-1/4" />
            <col className="w-1/4" />
          </colgroup>
          <thead className="bg-slate-50 text-left text-slate-600">
            <tr>
              <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wide">Sr No</th>
              <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wide">From Channel Partner</th>
              <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wide">Minutes</th>
              <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wide">To Username</th>
            </tr>
          </thead>
          <tbody className="text-slate-700">
            {loading ? (
              <tr className="border-t border-slate-100">
                <td colSpan={4} className="py-8 text-center text-slate-500">
                  Loading transactions...
                </td>
              </tr>
            ) : groupedTransactions.length === 0 ? (
              <tr className="border-t border-slate-100">
                <td colSpan={4} className="py-10 text-center text-slate-500">
                  No transactions found
                  <div className="text-xs text-slate-400 mt-1">
                    API returned 0 rows (or response key name changed)
                  </div>
                </td>
              </tr>
            ) : (
              pageRows.map((tx, idx) => {
                const rawToUserId = pickFirstDefined(tx, [
                  "to_user_id",
                  "toUserId",
                  "user_id",
                  "userId",
                  "recipient_user_id",
                ]);
                const toUserId = normalizeId(rawToUserId);

                const toUserName =
                  pickFirstDefined(tx, [
                    "to_user_name",
                    "toUserName",
                    "user_name",
                    "userName",
                    "name",
                    "full_name",
                    "fullName",
                  ]) ||
                  tx?.to_user?.name ||
                  tx?.to_user?.full_name ||
                  tx?.to_user?.email ||
                  tx?.user?.name ||
                  tx?.user?.full_name ||
                  tx?.user?.email ||
                  (toUserId
                    ? userLabelById[String(toUserId)] || ""
                    : "");

                const minuteAmount = tx?._sumMinute;

                const channelPartnerId = pickFirstDefined(tx, [
                  "channel_partner_id",
                  "channelPartnerId",
                  "from_channel_partner_id",
                  "fromChannelPartnerId",
                  "partner_id",
                  "partnerId",
                  "channel_partner",
                  "channelPartner",
                  "from_channel_partner",
                  "fromChannelPartner",
                ]);
                const normalizedChannelPartnerId = normalizeId(channelPartnerId);

                const channelPartnerName =
                  tx?.created_by_user?.name ||
                  tx?.createdByUser?.name ||
                  tx?.created_by_user?.full_name ||
                  tx?.createdByUser?.fullName ||
                  pickFirstDefined(tx, [
                    "channel_partner_name",
                    "channelPartnerName",
                    "partner_name",
                    "partnerName",
                    "channel_partner",
                    "channelPartner",
                    "from_channel_partner",
                    "fromChannelPartner",
                  ]) ||
                  channelPartnerNameById[String(normalizedChannelPartnerId)] ||
                  "";

                // If backend returns full partner object instead of flat fields
                const channelPartnerNameFromObj =
                  tx?.channel_partner?.name ||
                  tx?.channelPartner?.name ||
                  tx?.from_channel_partner?.name ||
                  tx?.fromChannelPartner?.name ||
                  tx?.created_by_user?.name ||
                  tx?.createdByUser?.name ||
                  tx?.channel_partner?.full_name ||
                  tx?.channelPartner?.fullName ||
                  tx?.channel_partner?.full_name ||
                  "";

                const finalChannelPartnerName =
                  channelPartnerName || channelPartnerNameFromObj;

                const rowId =
                  tx?.id ??
                  `${toUserId || "user"}-${normalizedChannelPartnerId || "partner"}-${idx}`;

                const minuteAmountDisplay = formatMinuteAmount(minuteAmount);
                // Show exact transaction minutes (minute_amount) so it matches updated donate values.
                const minuteToDisplay = minuteAmountDisplay;

                return (
                  <tr
                    key={rowId}
                    className="border-t border-slate-100 transition-colors hover:bg-slate-50"
                  >
                    <td className="px-4 py-3 align-middle text-slate-500">
                      {(Math.min(Math.max(page, 1), totalPages) - 1) * pageSize + idx + 1}
                    </td>
                    <td className="px-4 py-3 align-middle">
                      <div className="flex min-w-0 flex-col">
                        <span className="font-medium text-slate-800 wrap-break-word">{finalChannelPartnerName || "-"}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 align-middle">
                      {minuteToDisplay === "-" ? (
                        <span className="text-slate-400">-</span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                          {minuteToDisplay} min
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 align-middle">
                      <div className="flex min-w-0 flex-col">
                        <span className="font-medium text-slate-800 wrap-break-word">
                          {toUserName ? toUserName : toUserId || "-"}
                        </span>

                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {!loading && groupedTransactions.length >= pageSize ? (
        <div className="mt-4 flex flex-col gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-slate-600">
            Showing {(Math.min(Math.max(page, 1), totalPages) - 1) * pageSize + 1}-
            {Math.min(Math.min(Math.max(page, 1), totalPages) * pageSize, groupedTransactions.length)} of{" "}
            {groupedTransactions.length} results
          </div>
          <div className="text-xs text-slate-500">
            Page {Math.min(Math.max(page, 1), totalPages)} of {totalPages}
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded-lg border border-slate-200 px-3 py-1.5 disabled:opacity-50"
              disabled={page === 1}
            >
              Prev
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPage(p)}
                className={`rounded-lg border px-3 py-1.5 ${page === p
                  ? "border-indigo-600 bg-indigo-600 text-white"
                  : "border-slate-200 bg-white text-slate-700"
                  }`}
              >
                {p}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="rounded-lg border border-slate-200 px-3 py-1.5 disabled:opacity-50"
              disabled={page === totalPages}
            >
              Next
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

