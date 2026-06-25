
import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import DOMPurify from "dompurify";
import { useNavigate } from "react-router-dom";

import {
  getAgentsUsers, 
  updateAgentLanguages,
} from "../../hooks/useAuth";

export default function AgentUsersPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [languagesById, setLanguagesById] = useState({});
  const [savingById, setSavingById] = useState({});

  const [page, setPage] = useState(1);
  const pageSize = 10;
  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  const pageRows = rows.slice((page - 1) * pageSize, page * pageSize);

  const navigate = useNavigate();

  const loadRows = async () => {
    setLoading(true);
    try {
      const list = await getAgentsUsers();
      const mapped = (Array.isArray(list) ? list : []).map((r, i) => ({
          id: r.id ?? i + 1,
          name: r.name ?? "",
          welcome_message: r.welcome_message ?? r.welcomeMessage ?? "",
          body: r.body ?? "",
          languages: r.languages ?? r.language ?? r.lang ?? [],
        }));
      setRows(mapped);
      // init local selection
      const initial = {};
      for (const r of mapped) {
        const raw = r.languages;
        let arr = [];
        if (Array.isArray(raw)) arr = raw;
        else if (typeof raw === "string") arr = raw.split(",").map((s) => s.trim()).filter(Boolean);
        initial[r.id] = arr;
      }
      setLanguagesById(initial);
    } catch (e) {
      toast.error(e?.message || "Failed to fetch agents");
      setRows([]);
      setLanguagesById({});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRows();
  }, []);

  const LANGUAGE_OPTIONS = [
    "English",
    "Hindi",
    "Marathi",
    "Gujarati",
    "Tamil",
    "Telugu",
    "Kannada",
    "Bengali",
    "Punjabi",
    "Malayalam",
    "Urdu",
    "Odia",
    "Bhojpuri",
  ];

  const saveLanguages = async (id) => {
    setSavingById((p) => ({ ...p, [id]: true }));
    try {
      const langs = languagesById[id] || [];
      await updateAgentLanguages(id, langs);
      toast.success("Languages updated");
    } catch (e) {
      toast.error(e?.message || "Failed to update languages");
    } finally {
      setSavingById((p) => ({ ...p, [id]: false }));
    }
  };

  return (
    <div className="p-4 sm:p-6">
   
      <div className="flex items-center justify-between mb-4">
     
        <h2 className="text-2xl font-bold text-gray-700">Agents Users</h2>
        <button
          onClick={() => navigate("/agent-new")}
          className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
        >
          Add Agent Users
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl shadow">
        <table className="min-w-full bg-white text-sm table-fixed">
          <thead className="bg-gray-100 text-left text-gray-600">
            <tr>
              <th className="px-4 py-2 w-12">Sr No</th>
              <th className="px-4 py-2 w-48">Name</th>
              <th className="px-4 py-2 w-56">Welcome Message</th>
              <th className="px-4 py-2 w-72">Language</th>
              <th className="px-4 py-2">Body</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="text-center py-6">
                  Loading…
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-6">
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
                  <td className="px-4 py-2">
                    <div className="flex flex-col gap-2">
                      <select
                        multiple
                        value={languagesById[r.id] || []}
                        onChange={(e) => {
                          const selected = Array.from(e.target.selectedOptions).map((o) => o.value);
                          setLanguagesById((p) => ({ ...p, [r.id]: selected }));
                        }}
                        className="w-full border rounded-md px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 min-h-[96px]"
                      >
                        {LANGUAGE_OPTIONS.map((l) => (
                          <option key={l} value={l}>
                            {l}
                          </option>
                        ))}
                      </select>
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-gray-500">
                          Hold Ctrl/⌘ to select multiple
                        </div>
                        <button
                          type="button"
                          onClick={() => saveLanguages(r.id)}
                          disabled={!!savingById[r.id]}
                          className="px-3 py-1 rounded bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60 text-sm"
                        >
                          {savingById[r.id] ? "Saving..." : "Save"}
                        </button>
                      </div>
                    </div>
                  </td>
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
