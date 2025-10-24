// src/pages/EmailTemplates.jsx
import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { getEmailTemplates, createEmailTemplate, updateEmailTemplate } from "../../hooks/useAuth";
import { FiEdit } from "react-icons/fi";

export default function EmailTemplates() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [adding, setAdding] = useState(false);
  const [addForm, setAddForm] = useState({ name: "", subject: "", body: "" });

  // Edit modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editId, setEditId] = useState("");
  const [editBody, setEditBody] = useState("");
  const [editing, setEditing] = useState(false);

  // --- Helpers ---
  const extractArray = (res) => {
    if (Array.isArray(res)) return res;
    if (Array.isArray(res?.data)) return res.data;
    if (Array.isArray(res?.templates)) return res.templates;
    if (Array.isArray(res?.results)) return res.results;
    if (Array.isArray(res?.data?.items)) return res.data.items;
    return [];
  };

  const normalizeTemplates = (list) =>
    (list || []).map((t) => ({
      id: t.id ?? t.template_id ?? t.twilio_sid ?? "-",
      name: t.name ?? t.template_name ?? "-",
      subject: t.subject ?? t.title ?? "-",
      body:
        t.body ??
        (t.content &&
          t.content.types &&
          (t.content.types["twilio/text"] || t.content.types["text"])?.body) ??
        t.content ??
        "-",
      raw: t,
    }));

  // --- Fetch --- 
  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const res = await getEmailTemplates();
      const list = extractArray(res);
      setRows(normalizeTemplates(list));
    } catch (e) {
      console.error("❌ Fetch email templates failed:", e);
      toast.error(e?.message || "Failed to load templates");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  // --- Add new template ---
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    const name = (addForm.name || "").trim();
    const subject = (addForm.subject || "").trim();
    const body = (addForm.body || "").trim();
    if (!name) return toast.error("Please enter a name");
    if (!subject) return toast.error("Please enter a subject");
    if (!body) return toast.error("Please enter a body");

    try {
      setAdding(true);
      await createEmailTemplate({ name, subject, body });
      toast.success("Template created");
      setShowAddModal(false);
      setAddForm({ name: "", subject: "", body: "" });
      await fetchTemplates();
    } catch (err) {
      console.error("❌ Failed to create template:", err);
      toast.error(err?.message || "Failed to create template");
    } finally {
      setAdding(false);
    }
  };

  // --- Open edit body modal (prefill) ---
  const openEditBody = (template) => {
    const id = template.id ?? template.template_id ?? template.twilio_sid ?? "";
    // prefer direct body, else try to extract from content
    let body = template.body ?? "";
    if (!body && template.raw?.content) {
      const c = template.raw.content;
      if (typeof c === "string") {
        try {
          const parsed = JSON.parse(c);
          body = parsed?.body ?? parsed?.types?.["twilio/text"]?.body ?? parsed?.types?.text?.body ?? "";
        } catch {
          body = c || "";
        }
      } else if (typeof c === "object") {
        body = c?.body ?? c?.types?.["twilio/text"]?.body ?? c?.types?.text?.body ?? "";
      }
    }
    body = body || "";

    setEditId(id);
    setEditBody(body);
    setShowEditModal(true);
  };

  // --- Submit edit (call API endpoint email-template-twilio/{id}) ---
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editId) return toast.error("Missing template id");
    const body = (editBody || "").trim();
    if (!body) return toast.error("Body cannot be empty");

    try {
      setEditing(true);
      // NOTE: updateEmailTemplate should call `email-template-twilio/{id}` on backend.
      // We pass the payload { body } — change if your API expects different shape.
      await updateEmailTemplate(editId, { body });
      toast.success("Template updated");
      setShowEditModal(false);
      setEditId("");
      setEditBody("");
      await fetchTemplates();
    } catch (err) {
      console.error("❌ Failed to update template:", err);
      toast.error(err?.message || "Failed to update template");
    } finally {
      setEditing(false);
    }
  };

  return (
    <div className="p-4 sm:p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-700">Email Templates</h2>
        <button
          className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          onClick={() => setShowAddModal(true)}
        >
          Add Template
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded-xl shadow">
        <table className="min-w-full text-left">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Subject</th>
              <th className="px-4 py-2">Body</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={3} className="px-4 py-6 text-center">
                  Loading...
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-4 py-6 text-center">
                  No templates found
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.id} className="border-t hover:bg-gray-50 align-top">
                  <td className="px-4 py-2 font-medium">{r.name}</td>
                  <td className="px-4 py-2 font-medium">{r.subject}</td>
                  <td className="px-4 py-2">
                    <div className="flex items-start gap-2">
                      <pre className="whitespace-pre-wrap break-words text-sm flex-1">{r.body}</pre>
                      <button
                        title="Edit body"
                        onClick={() => openEditBody(r)}
                        className="p-2 rounded hover:bg-gray-100"
                      >
                        <FiEdit />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* --- Add Modal --- */}
      {showAddModal && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-lg">
          <div className="bg-white border rounded-xl shadow-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold">Add Template</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded hover:bg-gray-100"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3">
              <div>
                <label className="block text-sm mb-1">Name</label>
                <input
                  type="text"
                  placeholder="Enter template name"
                  value={addForm.name}
                  onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                  required
                  className="w-full border rounded px-3 py-2 text-sm"
                  disabled={adding}
                />
              </div>

              <div>
                <label className="block text-sm mb-1">Subject</label>
                <input
                  type="text"
                  placeholder="Enter subject"
                  value={addForm.subject}
                  onChange={(e) => setAddForm({ ...addForm, subject: e.target.value })}
                  required
                  className="w-full border rounded px-3 py-2 text-sm"
                  disabled={adding}
                />
              </div>

              <div>
                <label className="block text-sm mb-1">Body</label>
                <textarea
                  placeholder="Enter template body"
                  value={addForm.body}
                  onChange={(e) => setAddForm({ ...addForm, body: e.target.value })}
                  required
                  rows={6}
                  className="w-full border rounded px-3 py-2 text-sm"
                  disabled={adding}
                />
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 text-sm bg-gray-200 rounded hover:bg-gray-300"
                  disabled={adding}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={adding}
                  className="px-3 py-1.5 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 disabled:opacity-60"
                >
                  {adding ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- Edit Body Modal --- */}
      {showEditModal && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-lg">
          <div className="bg-white border rounded-xl shadow-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold">Edit Template Body</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-1 rounded hover:bg-gray-100"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-3">
              
              <div>
                <label className="block text-sm mb-1">Body</label>
                <textarea
                  placeholder="Edit template body"
                  value={editBody}
                  onChange={(e) => setEditBody(e.target.value)}
                  required
                  rows={6}
                  className="w-full border rounded px-3 py-2 text-sm"
                  disabled={editing}
                />
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-3 py-1.5 text-sm bg-gray-200 rounded hover:bg-gray-300"
                  disabled={editing}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editing}
                  className="px-3 py-1.5 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 disabled:opacity-60"
                >
                  {editing ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
