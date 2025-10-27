// src/pages/AgentsPage.jsx
import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import DOMPurify from "dompurify";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import service from "../../api/axios";

import {
  getAgents,
} from "../../hooks/useAuth";

export default function AgentsPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState("");

  const [page, setPage] = useState(1);
  const pageSize = 10;
  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  const pageRows = rows.slice((page - 1) * pageSize, page * pageSize);

  const navigate = useNavigate();

  const fetchUserEmail = async () => {
    try {
      const res = await service.get("Profile", {
        headers: { Authorization: `Bearer ${Cookies.get("CallingAgent")}` },
      });
      const email = res?.data?.data?.email || "";
      console.log("User email:", email);
      setUserEmail(email);
    } catch (err) {
      console.warn("Could not fetch user email:", err);
    }
  };

  const loadRows = async () => {
    setLoading(true);
    try {
      const list = await getAgents();
      setRows(
        (Array.isArray(list) ? list : []).map((r, i) => ({
          id: r.id ?? i + 1,
          name: r.name ?? "",
          welcome_message: r.welcome_message ?? r.welcomeMessage ?? "",
          body: r.body ?? "",
        }))
      );
    } catch (e) {
      toast.error(e?.message || "Failed to fetch agents");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserEmail();
    loadRows();
  }, []);

  return (
    <div className="p-4 sm:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-700">Agents</h2>
        {userEmail === "paragshah.devac@gmail.com" && (
          <button
            onClick={() => navigate("/agents/new")}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            Add Agent
          </button>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl shadow">
        <table className="min-w-full bg-white text-sm table-fixed">
          <thead className="bg-gray-100 text-left text-gray-600">
            <tr>
              <th className="px-4 py-2 w-12">Sr No</th>
              <th className="px-4 py-2 w-48">Name</th>
              <th className="px-4 py-2 w-56">Welcome Message</th>
              <th className="px-4 py-2">Body</th>
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
                  No agents found
                </td>
              </tr>
            ) : (
              pageRows.map((r, i) => (
                <tr
                  key={r.id}
                  className="border-b hover:bg-gray-50 text-gray-700 align-top"
                >
                  <td className="px-4 py-2">
                    {(page - 1) * pageSize + i + 1}
                  </td>
                  <td className="px-4 py-2 font-medium">{r.name}</td>
                  <td className="px-4 py-2">{r.welcome_message}</td>
                  <td
                    className="px-4 py-2 whitespace-pre-line break-words"
                    dangerouslySetInnerHTML={{
                      __html: DOMPurify.sanitize(r.body || ""),
                    }}
                  />
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
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
