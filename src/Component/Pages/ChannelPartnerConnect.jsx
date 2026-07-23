import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { getCustomerCareHeadByPhone } from "../../hooks/useAuth";

export default function ChannelPartnerConnect() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const parsed = useMemo(() => {
    const r = result;
    if (!r) {
      return {
        ok: null,
        message: "",
        contactNo: "",
        users: [],
        raw: null,
      };
    }

    const ok = typeof r?.status === "boolean" ? r.status : null;
    const message = String(r?.message || "").trim();
    const contactNo = String(r?.contact_no || r?.contactNo || "").trim();

    const dataArray = Array.isArray(r?.data)
      ? r.data
      : Array.isArray(r?.data?.data)
        ? r.data.data
        : Array.isArray(r?.data?.results)
          ? r.data.results
          : [];

    return { ok, message, contactNo, users: dataArray, raw: r };
  }, [result]);

  const fetchData = async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await getCustomerCareHeadByPhone();
      setResult(res);
    } catch (err) {
      toast.error(err?.message || "Failed to fetch");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="p-4 sm:p-6">
      <div className="w-full mx-auto">
        <h2 className="text-2xl font-bold text-gray-800">Client List</h2>
        <p className="mt-1 text-sm text-gray-600">
          Fetching customer care head details.
        </p>

        <div className="mt-5 rounded-2xl bg-white shadow p-4 sm:p-6">
          <div className="overflow-x-auto">
            <table className="min-w-[680px] w-full text-sm">
              <thead className="bg-slate-50 text-left text-slate-600">
                <tr>
                  <th className="px-4 py-3 font-semibold">Name</th>
                  <th className="px-4 py-3 font-semibold">Email</th>
                  <th className="px-4 py-3 font-semibold">Contact No</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr className="border-t border-slate-100">
                    <td colSpan={3} className="px-4 py-6 text-slate-600">
                      Loading...
                    </td>
                  </tr>
                ) : parsed?.ok === true && Array.isArray(parsed?.users) && parsed.users.length > 0 ? (
                  parsed.users.map((u) => (
                    <tr key={u?.id ?? `${u?.email ?? ""}-${u?.contact_no ?? ""}`} className="border-t border-slate-100 text-slate-800">
                      <td className="px-4 py-3">{u?.name || "-"}</td>
                      <td className="px-4 py-3">{u?.email || "-"}</td>
                      <td className="px-4 py-3">
                        {u?.contact_no ||
                          u?.contactNo ||
                          parsed?.contactNo ||
                          u?.customer_care_head_no ||
                          "-"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr className="border-t border-slate-100">
                    <td colSpan={3} className="px-4 py-6">
                      <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-800">
                        {parsed?.message || "No user found."}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

        </div>
      </div>
    </div>
  );
}

