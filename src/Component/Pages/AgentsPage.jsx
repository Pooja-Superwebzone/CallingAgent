// src/pages/AgentsPage.jsx
import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import DOMPurify from "dompurify";
import { useNavigate } from "react-router-dom";

import {
  getAgents,
  updateAgent,
} from "../../hooks/useAuth";
import { FiPlusCircle } from "react-icons/fi";

export default function AgentsPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const [editOpen, setEditOpen] = useState(false);
  const [editSaving, setEditSaving] = useState(false);
  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState({
    welcome_message: "",
    body: "",
  });

  const [page, setPage] = useState(1);
  const pageSize = 10;
  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  const pageRows = rows.slice((page - 1) * pageSize, page * pageSize);

  const navigate = useNavigate();

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
    loadRows();
  }, []);

  const openEdit = (row) => {
    setEditing(row);
    setEditForm({
      welcome_message: row?.welcome_message ?? "",
      body: row?.body ?? "",
    });
    setEditOpen(true);
  };

  const closeEdit = () => {
    if (editSaving) return;
    setEditOpen(false);
    setEditing(null);
    setEditForm({ welcome_message: "", body: "" });
  };

  const saveEdit = async () => {
    const id = editing?.id;
    if (!id) return;
    const welcome_message = String(editForm.welcome_message || "").trim();
    const body = String(editForm.body || "").trim();
    if (!welcome_message) return toast.error("Welcome message is required");
    if (!body) return toast.error("Body is required");

    setEditSaving(true);
    try {
      await updateAgent({ id, welcome_message, body });
      toast.success("Agent updated");
      closeEdit();
      await loadRows();
    } catch (e) {
      toast.error(e?.message || "Failed to update agent");
    } finally {
      setEditSaving(false);
    }
  };

  return (
    <div className="p-4 sm:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-700">Agents</h2>
        <button
          onClick={() => navigate("/agents/new")}
            className="relative px-4 py-2 bg-gray-600 text-white cursor-pointer animate-bounce rounded-md hover:bg-gray-700 overflow-hidden"
              >
                <span className="relative z-10 flex items-center gap-2">
                  <FiPlusCircle size={16} />
                  Create Agent
                </span>
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
              <th className="px-4 py-2">Body</th>
              <th className="px-4 py-2 w-28">Action</th>
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
                  <td
                    className="px-4 py-2 whitespace-pre-line break-words"
                    dangerouslySetInnerHTML={{
                      __html: DOMPurify.sanitize(r.body || ""),
                    }}
                  />
                  <td className="px-4 py-2">
                    <button
                      type="button"
                      onClick={() => openEdit(r)}
                      className="px-3 py-1 rounded bg-indigo-600 text-white hover:bg-indigo-700"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {editOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl overflow-hidden">
            <div className="flex items-start justify-between gap-3 border-b px-5 py-4">
              <div className="min-w-0">
                <div className="text-lg font-semibold text-gray-800">Edit Agent</div>
                <div className="mt-1 text-sm text-gray-600 truncate">
                  {editing?.name || "-"}
                </div>
              </div>
              <button
                type="button"
                onClick={closeEdit}
                className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
                disabled={editSaving}
                title="Close"
              >
                &times;
              </button>
            </div>

            <div className="px-5 py-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Welcome message
                </label>
                <textarea
                  value={editForm.welcome_message}
                  onChange={(e) =>
                    setEditForm((p) => ({ ...p, welcome_message: e.target.value }))
                  }
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-indigo-500"
                  rows={3}
                  disabled={editSaving}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Body
                </label>
                <textarea
                  value={editForm.body}
                  onChange={(e) =>
                    setEditForm((p) => ({ ...p, body: e.target.value }))
                  }
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-indigo-500"
                  rows={8}
                  disabled={editSaving}
                />
                <div className="mt-1 text-xs text-slate-500">
                  This text will be shown as HTML in the table.
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t px-5 py-4">
              <button
                type="button"
                onClick={saveEdit}
                disabled={editSaving}
                className="px-5 py-2 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 disabled:opacity-60"
              >
                {editSaving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

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
