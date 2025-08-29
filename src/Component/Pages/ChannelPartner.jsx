import React, { useState, useEffect } from "react";
import { getChannelPartners } from "../../hooks/useAuth";
import { toast } from "react-hot-toast";

export default function ChannelPartner() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const pageSize = 10;

  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  const pageRows = rows.slice((page - 1) * pageSize, page * pageSize);

  const loadRows = async () => {
    setLoading(true);
    try {
      const list = await getChannelPartners();
      setRows(
        (Array.isArray(list) ? list : []).map((r, i) => ({
          id: r.id ?? i + 1,
          name: r.name ?? "",
          email: r.email ?? "",
          phone_no: r.phone_no ?? "",
        }))
      );
    } catch (e) {
      toast.error(e.message || "Failed to fetch channel partners");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRows();
  }, []);

  return (
    <div className="p-4 sm:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-700">Channel Partners</h2>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl shadow">
        <table className="min-w-full bg-white text-sm">
          <thead className="bg-gray-100 text-left text-gray-600">
            <tr>
              <th className="px-4 py-2">Sr No</th>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Email</th>
              <th className="px-4 py-2">Phone No</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="text-center py-6">
                  Loading…
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-6">
                  No partners found
                </td>
              </tr>
            ) : (
              pageRows.map((r, i) => (
                <tr
                  key={r.id}
                  className="border-b hover:bg-gray-50 text-gray-700"
                >
                  <td className="px-4 py-2">
                    {(page - 1) * pageSize + i + 1}
                  </td>
                  <td className="px-4 py-2">{r.name}</td>
                  <td className="px-4 py-2">{r.email}</td>
                  <td className="px-4 py-2">{r.phone_no}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>



      {rows.length > pageSize && (
        <div className="flex items-center justify-between mt-4 text-sm text-gray-600">
          <div>
            Showing {(page - 1) * pageSize + 1}–
            {Math.min(page * pageSize, rows.length)} of {rows.length}
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1 border rounded disabled:opacity-50"
              disabled={page === 1}
            >
              Prev
            </button>
            {[...Array(totalPages)].map((_, idx) => (
              <button
                key={idx}
                onClick={() => setPage(idx + 1)}
                className={`px-3 py-1 border rounded ${
                  page === idx + 1 ? "bg-indigo-600 text-white" : ""
                }`}
              >
                {idx + 1}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="px-3 py-1 border rounded disabled:opacity-50"
              disabled={page === totalPages}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
