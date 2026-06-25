import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { getAdminCustomerCareHeadUsers } from "../../hooks/useAuth";

export default function AdminCustomerCareHeadUsers() {
  const [loading, setLoading] = useState(false);
  const [payload, setPayload] = useState(null);

  const parsed = useMemo(() => {
    const r = payload;
    if (!r) return { ok: null, message: "", rows: [] };

    const ok = typeof r?.status === "boolean" ? r.status : null;
    const message = String(r?.message || "").trim();
    const candidates = [
      r?.data,
      r?.data?.data,
      r?.data?.results,
      r?.results,
      r?.users,
      r,
    ];
    const rows = (candidates.find((x) => Array.isArray(x)) || []).map((u, i) => ({
      id: u?.id ?? u?._id ?? i,
      name: u?.name ?? "",
      email: u?.email ?? "",
      contact_no: u?.contact_no ?? u?.contactNo ?? u?.phone_no ?? u?.phoneNo ?? "",
      channel_partner_name:
        u?.channel_partner_name ??
        u?.channelPartnerName ??
        u?.channel_partner ??
        u?.channelPartner ??
        "",
    }));

    return { ok, message, rows };
  }, [payload]);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      try {
        const res = await getAdminCustomerCareHeadUsers();
        setPayload(res);
      } catch (e) {
        toast.error(e?.message || "Failed to fetch users");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  return (
    <div className="p-4 sm:p-6">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-800">Channel Partner Users</h2>

        <div className="mt-5 rounded-2xl bg-white shadow p-4 sm:p-6 overflow-x-auto">
          <table className="min-w-[760px] w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-600">
              <tr>
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="px-4 py-3 font-semibold">Email</th>
                <th className="px-4 py-3 font-semibold">Contact No</th>
                <th className="px-4 py-3 font-semibold">Channel Partner</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr className="border-t border-slate-100">
                  <td colSpan={3} className="px-4 py-6 text-slate-600">
                    Loading...
                  </td>
                </tr>
              ) : parsed?.ok === false ? (
                <tr className="border-t border-slate-100">
                  <td colSpan={3} className="px-4 py-6">
                    <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-800">
                      {parsed?.message || "No user found."}
                    </div>
                  </td>
                </tr>
              ) : parsed?.rows?.length ? (
                parsed.rows.map((r) => (
                  <tr key={r.id} className="border-t border-slate-100 text-slate-800">
                    <td className="px-4 py-3">{r.name || "-"}</td>
                    <td className="px-4 py-3">{r.email || "-"}</td>
                    <td className="px-4 py-3">{r.contact_no || "-"}</td>
                    <td className="px-4 py-3">{r.channel_partner_name || "-"}</td>
                  </tr>
                ))
              ) : (
                <tr className="border-t border-slate-100">
                  <td colSpan={3} className="px-4 py-6 text-slate-600">
                    {parsed?.message || "No users found."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

