// src/pages/AgentsPage.jsx
import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import DOMPurify from "dompurify";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";

import {
  getAgents,
  createAgent,
} from "../../hooks/useAuth";

export default function AgentsPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const pageSize = 10;
  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  const pageRows = rows.slice((page - 1) * pageSize, page * pageSize);

  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [welcomeMessage, setWelcomeMessage] = useState("");
  const [bodyHtml, setBodyHtml] = useState("<p>Start writing...</p>");

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
      toast.error(e.message || "Failed to fetch agents");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRows();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name?.trim()) {
      toast.error("Name is required");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name,
        welcome_message: welcomeMessage,
        body: bodyHtml,
      };
      await createAgent(payload);
      toast.success("Agent created successfully");
      setShowForm(false);
      setName("");
      setWelcomeMessage("");
      setBodyHtml("<p>Start writing...</p>");
      loadRows();
    } catch (err) {
      toast.error(err.message || "Failed to save agent");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 sm:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-700">Agents</h2>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
        >
          Add Agent
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

      {/* Add Agent Modal */}
      {showForm && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          {/* Removed background blackout */}
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl border">
            <h3 className="text-xl font-bold mb-4">Add Agent</h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium">Name</label>
                <input
                  className="mt-1 w-full border rounded px-3 py-2"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium">
                  Welcome Message
                </label>
                <input
                  className="mt-1 w-full border rounded px-3 py-2"
                  value={welcomeMessage}
                  onChange={(e) => setWelcomeMessage(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Body</label>
                <CKEditor
                  editor={ClassicEditor}
                  data={bodyHtml}
                  config={{
                    toolbar: [
                      "bold",
                      "italic",
                      "underline",
                      "bulletedList",
                      "numberedList",
                      "undo",
                      "redo",
                    ],
                  }}
                  onChange={(event, editor) => {
                    setBodyHtml(editor.getData());
                  }}
                />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  className="px-4 py-2 border rounded"
                  onClick={() => setShowForm(false)}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded"
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
