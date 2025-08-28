import React, { useEffect, useState } from "react";
import { getWhatsappTemplates, submitWhatsappTemplate } from "../../hooks/useAuth";

export default function WhatsappTemplates() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ template_name: "", static_script: "" });

  
  const get = (obj, path) =>
    path.split(".").reduce((o, k) => (o && o[k] !== undefined ? o[k] : undefined), obj);

  const firstString = (obj, candidates) => {
    for (const c of candidates) {
      const v = typeof c === "function" ? c(obj) : get(obj, c);
      if (typeof v === "string" && v.trim()) return v.trim();
    }
    return "-";
  };

  const extractArray = (res) => {
    if (Array.isArray(res)) return res;
    if (Array.isArray(res?.data)) return res.data;
    if (Array.isArray(res?.templates)) return res.templates;
    if (Array.isArray(res?.results)) return res.results;
    if (Array.isArray(res?.data?.items)) return res.data.items;
    return [];
  };


  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const res = await getWhatsappTemplates(); 
      setRows(res.templates);
    } catch (e) {
      console.error("❌ Fetch templates failed:", e);
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setShowModal(false);
    if (showModal) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showModal]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const template_name = form.template_name.trim();
    const static_script = form.static_script.trim();
    if (!template_name || !static_script) return;

    try {   
      setSubmitting(true);
      await submitWhatsappTemplate({ template_name, static_script });
      setShowModal(false);
      setForm({ template_name: "", static_script: "" });
      fetchTemplates();
    } catch (err) {
      console.error("❌ Failed to submit template:", err);
      alert(err.message || "Failed to submit template");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4 sm:p-6">

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-700">WhatsApp Templates</h2>
        <button
          className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          onClick={() => setShowModal(true)}
        >
          Add Template
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded-xl shadow">
        <table className="min-w-full text-left">
          <thead className="bg-gray-100">
            <tr>
                <th className="px-4 py-2">Template id</th>
                <th className="px-4 py-2">category</th>
                 <th className="px-4 py-2">status</th>  
              <th className="px-4 py-2">Template name</th>
              <th className="px-4 py-2">Body</th>
             
              
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={2} className="px-4 py-6 text-center">
                  Loading...
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={2} className="px-4 py-6 text-center">
                  No templates found
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.id} className="border-t hover:bg-gray-50 align-top">
                
                  <td className="px-4 py-2 font-medium" >{r.template_id}</td>
                  <td className="px-4 py-2 font-medium" >{r.category}</td>
                  <td className="px-4 py-2 font-medium" >{r.status}</td>
                  <td className="px-4 py-2 font-medium ">{r.name}</td>
            
                  <td className="px-4 py-2">
                    <pre className="whitespace-pre-wrap break-words text-sm text-bold">
                       {r.content?.types?.["twilio/text"]?.body}
                    </pre>
                  </td>
                
                  
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-lg">
          <div className="bg-white border rounded-xl shadow-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold">Add Template</h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded hover:bg-gray-100"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-sm mb-1">Template Name</label>
                <input
                  type="text"
                  placeholder="Enter template name"
                  value={form.template_name}
                  onChange={(e) =>
                    setForm({ ...form, template_name: e.target.value })
                  }
                  required
                  className="w-full border rounded px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm mb-1">Body</label>
                <textarea
                  placeholder="Enter template body"
                  value={form.static_script}
                  onChange={(e) =>
                    setForm({ ...form, static_script: e.target.value })
                  }
                  required
                  rows={4}
                  className="w-full border rounded px-3 py-2 text-sm"
                />
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3 py-1.5 text-sm bg-gray-200 rounded hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-3 py-1.5 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 disabled:opacity-60"
                >
                  {submitting ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
