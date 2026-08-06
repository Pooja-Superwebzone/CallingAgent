import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { RefreshCw, Plus, Eye } from "lucide-react";
import {
  syncPlivoTemplates,
  getPlivoTemplates,
  getPlivoTemplate,
  createPlivoTemplate,
} from "../../../api/whatsappApi";

const STATUS_COLORS = {
  APPROVED: "bg-green-100 text-green-700",
  PENDING: "bg-yellow-100 text-yellow-700",
  REJECTED: "bg-red-100 text-red-700",
};

function StatusBadge({ status }) {
  const cls = STATUS_COLORS[status?.toUpperCase()] || "bg-gray-100 text-gray-600";
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cls}`}>
      {status || "—"}
    </span>
  );
}

export default function WhatsAppTemplates() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [viewTemplate, setViewTemplate] = useState(null);
  const [viewLoading, setViewLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    language: "en",
    category: "MARKETING",
    body: "",
    body_examples: "",
  });

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const res = await getPlivoTemplates({ approvedOnly: false });
      const list = Array.isArray(res?.data) ? res.data : res?.templates ?? [];
      setTemplates(list);
    } catch (err) {
      toast.error(err.message || "Failed to load templates");
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleSync = async () => {
    setSyncing(true);
    try {
      const res = await syncPlivoTemplates("APPROVED");
      toast.success(
        `Synced: ${res?.created ?? 0} created, ${res?.updated ?? 0} updated`
      );
      await fetchTemplates();
    } catch (err) {
      toast.error(err.message || "Sync failed");
    } finally {
      setSyncing(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    const name = form.name.trim().toLowerCase().replace(/\s+/g, "_");
    if (!/^[a-z0-9_]+$/.test(name)) {
      toast.error("Name must be lowercase snake_case (e.g. order_confirmation)");
      return;
    }
    if (!form.body.trim()) {
      toast.error("Body is required");
      return;
    }

    let bodyExamples = [];
    if (form.body_examples.trim()) {
      try {
        bodyExamples = JSON.parse(form.body_examples);
      } catch {
        toast.error('Body examples must be valid JSON, e.g. [["John","ORD-123"]]');
        return;
      }
    }

    setSubmitting(true);
    try {
      await createPlivoTemplate({
        name,
        language: form.language,
        category: form.category,
        body: form.body.trim(),
        body_examples: bodyExamples,
      });
      toast.success("Template submitted — status will be PENDING until Meta approves");
      setShowCreate(false);
      setForm({ name: "", language: "en", category: "MARKETING", body: "", body_examples: "" });
      await fetchTemplates();
    } catch (err) {
      toast.error(err.message || "Failed to create template");
    } finally {
      setSubmitting(false);
    }
  };

  const handleView = async (tpl) => {
    setViewLoading(true);
    setViewTemplate(tpl);
    try {
      const id = tpl.id || tpl.template_id;
      const res = await getPlivoTemplate(id);
      setViewTemplate(res?.data || res || tpl);
    } catch {
      // keep local data
    } finally {
      setViewLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">WhatsApp Templates</h2>
          <p className="text-sm text-gray-500 mt-1">Meta-approved templates synced from Plivo</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleSync}
            disabled={syncing}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-60 text-sm"
          >
            <RefreshCw size={16} className={syncing ? "animate-spin" : ""} />
            {syncing ? "Syncing..." : "Sync Templates"}
          </button>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 text-sm"
          >
            <Plus size={16} />
            Create Template
          </button>
        </div>
      </div>

      <div className="overflow-x-auto bg-white rounded-xl shadow">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
            <tr>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Template ID</th>
              <th className="px-4 py-3 text-left">Category</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Language</th>
              <th className="px-4 py-3 text-left">Body Preview</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                  Loading templates...
                </td>
              </tr>
            ) : templates.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                  No templates found. Click &quot;Sync Templates&quot; to pull from Plivo.
                </td>
              </tr>
            ) : (
              templates.map((tpl) => (
                <tr key={tpl.id || tpl.template_id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-800">{tpl.name || "—"}</td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-600">
                    {tpl.template_id || tpl.id || "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{tpl.category || "—"}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={tpl.status} />
                  </td>
                  <td className="px-4 py-3 text-gray-600">{tpl.language || "—"}</td>
                  <td className="px-4 py-3 text-gray-500 max-w-xs truncate">
                    {tpl.body_text || tpl.body || "—"}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleView(tpl)}
                      className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1 text-xs"
                    >
                      <Eye size={14} />
                      View
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Create WhatsApp Template</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name (snake_case)
                </label>
                <input
                  type="text"
                  placeholder="order_confirmation"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
                  <input
                    type="text"
                    value={form.language}
                    onChange={(e) => setForm((f) => ({ ...f, language: e.target.value }))}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="MARKETING">MARKETING</option>
                    <option value="UTILITY">UTILITY</option>
                    <option value="AUTHENTICATION">AUTHENTICATION</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Body (use {"{{1}}"}, {"{{2}}"} for variables)
                </label>
                <textarea
                  rows={4}
                  placeholder="Hi {{1}}, your order {{2}} is confirmed."
                  value={form.body}
                  onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Body Examples (JSON array)
                </label>
                <input
                  type="text"
                  placeholder='[["John","ORD-123"]]'
                  value={form.body_examples}
                  onChange={(e) => setForm((f) => ({ ...f, body_examples: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2 text-sm font-mono"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="px-4 py-2 text-sm bg-gray-200 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 text-sm bg-gray-700 text-white rounded-lg hover:bg-gray-800 disabled:opacity-60"
                >
                  {submitting ? "Submitting..." : "Submit for Approval"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View modal */}
      {viewTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-bold text-gray-800">
                {viewTemplate.name || "Template Details"}
              </h3>
              <button
                onClick={() => setViewTemplate(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            {viewLoading ? (
              <p className="text-sm text-gray-500">Loading...</p>
            ) : (
              <dl className="space-y-2 text-sm">
                <div className="flex gap-2">
                  <dt className="font-medium text-gray-600 w-28">Template ID</dt>
                  <dd className="font-mono text-gray-800">
                    {viewTemplate.template_id || viewTemplate.id}
                  </dd>
                </div>
                <div className="flex gap-2">
                  <dt className="font-medium text-gray-600 w-28">Status</dt>
                  <dd>
                    <StatusBadge status={viewTemplate.status} />
                  </dd>
                </div>
                <div className="flex gap-2">
                  <dt className="font-medium text-gray-600 w-28">Category</dt>
                  <dd>{viewTemplate.category || "—"}</dd>
                </div>
                <div className="flex gap-2">
                  <dt className="font-medium text-gray-600 w-28">Language</dt>
                  <dd>{viewTemplate.language || "—"}</dd>
                </div>
                <div>
                  <dt className="font-medium text-gray-600 mb-1">Body</dt>
                  <dd className="bg-gray-50 p-3 rounded-lg text-gray-800 whitespace-pre-wrap">
                    {viewTemplate.body_text || viewTemplate.body || "—"}
                  </dd>
                </div>
              </dl>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
