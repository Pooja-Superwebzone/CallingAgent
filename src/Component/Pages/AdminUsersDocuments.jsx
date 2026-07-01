import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import Cookies from "js-cookie";
import { getAllUsersDocuments } from "../../hooks/useAuth";

const normalizeUrl = (value) => {
  if (!value) return "";
  const s = String(value).trim();
  if (!s) return "";
  return s;
};

const isPdf = (url) => String(url || "").toLowerCase().endsWith(".pdf");

export default function AdminUsersDocuments() {
  const role = String(Cookies.get("role") || "").trim().toLowerCase();
  const email = String(Cookies.get("email") || "").trim().toLowerCase();

  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);

  const canAccess = role === "admin" && email === "paragshah.devac@gmail.com";

  const fetchRows = async () => {
    setLoading(true);
    try {
      const res = await getAllUsersDocuments();
      if (res && typeof res === "object" && res.status === false) {
        setRows([]);
        return;
      }
      const list = Array.isArray(res?.data) ? res.data : Array.isArray(res?.data?.data) ? res.data.data : [];
      setRows(Array.isArray(list) ? list : []);
    } catch (e) {
      toast.error(e?.message || "Failed to fetch users documents");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!canAccess) return;
    fetchRows();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canAccess]);

  const tableRows = useMemo(() => {
    return (Array.isArray(rows) ? rows : []).map((d) => {
      const user = d?.user || {};
      return {
        id: d?.id ?? `${d?.user_id ?? ""}-${user?.email ?? ""}`,
        user_id: d?.user_id ?? user?.id ?? "-",
        name: user?.name ?? "-",
        email: user?.email ?? "-",
        contact: user?.contact_no ?? "-",
        userRole: user?.role ?? "-",
        aadhar: normalizeUrl(d?.aadhar_card),
        gst: normalizeUrl(d?.gst),
        photo: normalizeUrl(d?.photo),
        updated_at: d?.updated_at ?? d?.created_at ?? "",
      };
    });
  }, [rows]);

  if (!canAccess) {
    return <div className="p-6 text-sm text-slate-700">Unauthorized</div>;
  }

  return (
    <div className="min-h-screen bg-slate-100 px-3 py-4 sm:px-4 sm:py-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-5 sm:mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-[24px] font-bold tracking-tight text-gray-700 sm:text-3xl">
              Users Documents
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              View Aadhar, GST and photo uploaded by users.
            </p>
          </div>
          <button
            type="button"
            onClick={fetchRows}
            disabled={loading}
            className="self-start sm:self-auto rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
          >
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>

        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-[1100px] w-full text-sm">
              <thead className="bg-slate-50 text-left text-slate-600">
                <tr>
                  <th className="px-4 py-3 font-semibold">User</th>
                  <th className="px-4 py-3 font-semibold">Email</th>
                  <th className="px-4 py-3 font-semibold">Contact</th>
                  <th className="px-4 py-3 font-semibold">Role</th>
                  <th className="px-4 py-3 font-semibold">Aadhar</th>
                  <th className="px-4 py-3 font-semibold">GST</th>
                  <th className="px-4 py-3 font-semibold">Photo</th>
                  <th className="px-4 py-3 font-semibold">Updated</th>
                </tr>
              </thead>
              <tbody className="text-slate-800">
                {loading ? (
                  <tr className="border-t border-slate-100">
                    <td colSpan={8} className="px-4 py-8 text-center text-slate-500">
                      Loading...
                    </td>
                  </tr>
                ) : tableRows.length === 0 ? (
                  <tr className="border-t border-slate-100">
                    <td colSpan={8} className="px-4 py-10 text-center text-slate-500">
                      No documents found
                    </td>
                  </tr>
                ) : (
                  tableRows.map((r) => (
                    <tr key={r.id} className="border-t border-slate-100 align-top">
                      <td className="px-4 py-3">
                        <div className="font-semibold">{r.name}</div>
                      </td>
                      <td className="px-4 py-3 break-words">{r.email}</td>
                      <td className="px-4 py-3">{r.contact}</td>
                      <td className="px-4 py-3 capitalize">{r.userRole}</td>
                      <td className="px-4 py-3">
                        {r.aadhar ? (
                          <a href={r.aadhar} target="_blank" rel="noreferrer">
                            <img
                              src={r.aadhar}
                              alt="Aadhar"
                              className="h-16 w-28 rounded-lg bg-slate-50 object-contain"
                              loading="lazy"
                            />
                          </a>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {r.gst ? (
                          isPdf(r.gst) ? (
                            <a
                              href={r.gst}
                              target="_blank"
                              rel="noreferrer"
                              className="text-sm font-semibold text-indigo-600 hover:text-indigo-700"
                            >
                              Open PDF
                            </a>
                          ) : (
                            <a href={r.gst} target="_blank" rel="noreferrer">
                              <img
                                src={r.gst}
                                alt="GST"
                                className="h-16 w-28 rounded-lg bg-slate-50 object-contain"
                                loading="lazy"
                              />
                            </a>
                          )
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {r.photo ? (
                          <a href={r.photo} target="_blank" rel="noreferrer">
                            <img
                              src={r.photo}
                              alt="Photo"
                              className="h-16 w-28 rounded-lg bg-slate-50 object-contain"
                              loading="lazy"
                            />
                          </a>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {r.updated_at ? new Date(r.updated_at).toLocaleString() : "-"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

