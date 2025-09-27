// import React, { useEffect, useState } from "react";
// import { getWhatsappTemplates, submitWhatsappTemplate } from "../../hooks/useAuth";

// export default function WhatsappTemplates() {
//   const [rows, setRows] = useState([]);
//   const [loading, setLoading] = useState(true);

//   const [showModal, setShowModal] = useState(false);
//   const [submitting, setSubmitting] = useState(false);
//   const [form, setForm] = useState({ template_name: "", static_script: "" });

  
//   const get = (obj, path) =>
//     path.split(".").reduce((o, k) => (o && o[k] !== undefined ? o[k] : undefined), obj);

//   const firstString = (obj, candidates) => {
//     for (const c of candidates) {
//       const v = typeof c === "function" ? c(obj) : get(obj, c);
//       if (typeof v === "string" && v.trim()) return v.trim();
//     }
//     return "-";
//   };

//   const extractArray = (res) => {
//     if (Array.isArray(res)) return res;
//     if (Array.isArray(res?.data)) return res.data;
//     if (Array.isArray(res?.templates)) return res.templates;
//     if (Array.isArray(res?.results)) return res.results;
//     if (Array.isArray(res?.data?.items)) return res.data.items;
//     return [];
//   };


//   const fetchTemplates = async () => {
//     setLoading(true);
//     try {
//       const res = await getWhatsappTemplates(); 
//       setRows(res.templates);
//     } catch (e) {
//       console.error("❌ Fetch templates failed:", e);
//       setRows([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchTemplates();
//   }, []);

//   useEffect(() => {
//     const onKey = (e) => e.key === "Escape" && setShowModal(false);
//     if (showModal) window.addEventListener("keydown", onKey);
//     return () => window.removeEventListener("keydown", onKey);
//   }, [showModal]);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     const template_name = form.template_name.trim();
//     const static_script = form.static_script.trim();
//     if (!template_name || !static_script) return;

//     try {   
//       setSubmitting(true);
//       await submitWhatsappTemplate({ template_name, static_script });
//       setShowModal(false);
//       setForm({ template_name: "", static_script: "" });
//       fetchTemplates();
//     } catch (err) {
//       console.error("❌ Failed to submit template:", err);
//       alert(err.message || "Failed to submit template");
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   return (
//     <div className="p-4 sm:p-6">

//       <div className="flex justify-between items-center mb-4">
//         <h2 className="text-2xl font-bold text-gray-700">WhatsApp Templates</h2>
//         <button
//           className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
//           onClick={() => setShowModal(true)}
//         >
//           Add Template
//         </button>
//       </div>

//       {/* Table */}
//       <div className="overflow-x-auto bg-white rounded-xl shadow">
//         <table className="min-w-full text-left">
//           <thead className="bg-gray-100">
//             <tr>
//                 <th className="px-4 py-2">Template id</th>
//                 <th className="px-4 py-2">category</th>
//                  <th className="px-4 py-2">status</th>  
//               <th className="px-4 py-2">Template name</th>
//               <th className="px-4 py-2">Body</th>
             
              
//             </tr>
//           </thead>
//           <tbody>
//             {loading ? (
//               <tr>
//                 <td colSpan={2} className="px-4 py-6 text-center">
//                   Loading...
//                 </td>
//               </tr>
//             ) : rows.length === 0 ? (
//               <tr>
//                 <td colSpan={2} className="px-4 py-6 text-center">
//                   No templates found
//                 </td>
//               </tr>
//             ) : (
//               rows.map((r) => (
//                 <tr key={r.id} className="border-t hover:bg-gray-50 align-top">
                
//                   <td className="px-4 py-2 font-medium" >{r.template_id}</td>
//                   <td className="px-4 py-2 font-medium" >{r.category}</td>
//                   <td className="px-4 py-2 font-medium" >{r.status}</td>
//                   <td className="px-4 py-2 font-medium ">{r.name}</td>
            
//                   <td className="px-4 py-2">
//                     <pre className="whitespace-pre-wrap break-words text-sm text-bold">
//                        {r.content?.types?.["twilio/text"]?.body}
//                     </pre>
//                   </td>
                
                  
//                 </tr>
//               ))
//             )}
//           </tbody>
//         </table>
//       </div>

//       {showModal && (
//         <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-lg">
//           <div className="bg-white border rounded-xl shadow-2xl p-4">
//             <div className="flex items-center justify-between mb-2">
//               <h3 className="text-lg font-semibold">Add Template</h3>
//               <button
//                 onClick={() => setShowModal(false)}
//                 className="p-1 rounded hover:bg-gray-100"
//                 aria-label="Close"
//               >
//                 ✕
//               </button>
//             </div>

//             <form onSubmit={handleSubmit} className="space-y-3">
//               <div>
//                 <label className="block text-sm mb-1">Template Name</label>
//                 <input
//                   type="text"
//                   placeholder="Enter template name"
//                   value={form.template_name}
//                   onChange={(e) =>
//                     setForm({ ...form, template_name: e.target.value })
//                   }
//                   required
//                   className="w-full border rounded px-3 py-2 text-sm"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm mb-1">Body</label>
//                 <textarea
//                   placeholder="Enter template body"
//                   value={form.static_script}
//                   onChange={(e) =>
//                     setForm({ ...form, static_script: e.target.value })
//                   }
//                   required
//                   rows={4}
//                   className="w-full border rounded px-3 py-2 text-sm"
//                 />
//               </div>

//               <div className="flex justify-end gap-2 pt-1">
//                 <button
//                   type="button"
//                   onClick={() => setShowModal(false)}
//                   className="px-3 py-1.5 text-sm bg-gray-200 rounded hover:bg-gray-300"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   type="submit"
//                   disabled={submitting}
//                   className="px-3 py-1.5 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 disabled:opacity-60"
//                 >
//                   {submitting ? "Saving..." : "Save"}
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }


import React, { useEffect, useState } from "react";
import { FiEdit } from "react-icons/fi";
import { toast } from "react-hot-toast";

import {
  getWhatsappTemplates,
  submitWhatsappTemplate,
  submitWhatsappTemplateScript,
} from "../../hooks/useAuth";

export default function WhatsappTemplates() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ template_name: "", static_script: "" });

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [editingBody, setEditingBody] = useState("");
  const [editSubmitting, setEditSubmitting] = useState(false);


  const normalizeContent = (content) => {
    if (content == null) return null;
    if (typeof content === "object") return content;
    if (typeof content === "string") {
      
        let parsed = JSON.parse(content);
        if (typeof parsed === "string") {
       
            parsed = JSON.parse(parsed);
         
        }
        if (typeof parsed === "object") return parsed;
     
      
    }
    return null;
  };

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const res = await getWhatsappTemplates();
      const list = Array.isArray(res) ? res : res?.templates ?? res?.data ?? [];
      const normalized = (Array.isArray(list) ? list : []).map((t) => {
        const contentObj = normalizeContent(t.content);
        const fallback = (() => {
          
          if (typeof t.content === "string") {
            try {
              let p = JSON.parse(t.content);
              if (typeof p === "string") p = JSON.parse(p);
              return p?.types?.["twilio/text"]?.body ?? p?.types?.text?.body ?? null;
            } catch (e) {
              return null;
            }
          }
          return null;
        })();
        const safeBody =
          contentObj?.types?.["twilio/text"]?.body ??
          contentObj?.types?.text?.body ??
          fallback ??
          contentObj?.friendly_name ??
          t.name ??
          "-";
        return { ...t, contentObj, safeBody };
      });
      setRows(normalized);
    } catch (e) {
      console.error("❌ Fetch templates failed:", e);
      toast.error(e?.message || "Failed to load templates");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();

  }, []);


  const handleSubmit = async (e) => {
    e.preventDefault();
    const template_name = (form.template_name || "").trim();
    const static_script = (form.static_script || "").trim();
    if (!template_name || !static_script) return;

    try {
      setSubmitting(true);
      await submitWhatsappTemplate({ template_name, static_script });
      setShowModal(false);
      setForm({ template_name: "", static_script: "" });
      await fetchTemplates();
      toast.success("Template submitted");
    } catch (err) {
      console.error("❌ Failed to submit template:", err);
      toast.error(err?.message || "Failed to submit template");
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (template) => {
    const safe =
      template?.contentObj?.types?.["twilio/text"]?.body ??
      template?.contentObj?.types?.text?.body ??
      (typeof template?.content === "string"
        ? (() => {
            try {
              let parsed = JSON.parse(template.content);
              if (typeof parsed === "string") parsed = JSON.parse(parsed);
              return parsed?.types?.["twilio/text"]?.body ?? parsed?.types?.text?.body ?? "";
            } catch (e) {
              return "";
            }
          })()
        : "") ??
      "";

    setEditingTemplate(template);
    setEditingBody(safe || "");
    setEditModalOpen(true);
  };

  
  const handleEditSubmit = async (e) => {
    e?.preventDefault?.();
    if (!editingTemplate) return toast.error("No template selected");

    
    const tid = editingTemplate.template_id ?? editingTemplate.twilio_sid ?? editingTemplate.id;
    if (!tid) return toast.error("Template id missing");

    const static_script = (editingBody || "").trim();
    if (!static_script) return toast.error("Body cannot be empty");

    try {
      setEditSubmitting(true);
      
      await submitWhatsappTemplateScript(tid, { static_script });

      toast.success("Template body updated");
      setEditModalOpen(false);
      setEditingTemplate(null);
      setEditingBody("");
      await fetchTemplates();
    } catch (err) {
      console.error("❌ Failed to update WA template:", err);
      toast.error(err?.message || "Failed to update template");
    } finally {
      setEditSubmitting(false);
    }
  };

  const closeEditModal = () => {
    setEditModalOpen(false);
    setEditingTemplate(null);
    setEditingBody("");
    setEditSubmitting(false);
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-700">WhatsApp Templates</h2>
        <button className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700" onClick={() => setShowModal(true)}>
          Add Template
        </button>
      </div>

 
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
                <td colSpan={5} className="px-4 py-6 text-center">
                  Loading...
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center">
                  No templates found
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.id} className="border-t hover:bg-gray-50 align-top">
                  <td className="px-4 py-2 font-medium">{r.template_id}</td>
                  <td className="px-4 py-2 font-medium">{r.category}</td>
                  <td className="px-4 py-2 font-medium">{r.status}</td>
                  <td className="px-4 py-2 font-medium">{r.name}</td>

                  <td className="px-4 py-2 flex items-start gap-2">
                    <div className="flex-1">
                      <pre className="whitespace-pre-wrap break-words text-sm text-bold m-0">{r.safeBody}</pre>
                    </div>

                    <div className="shrink-0">
                      <button type="button" title="Edit body" onClick={() => openEditModal(r)} className="p-2 rounded hover:bg-gray-100 text-gray-600">
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

      
      {showModal && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-lg">
          <div className="bg-white border rounded-xl shadow-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold">Add Template</h3>
              <button onClick={() => setShowModal(false)} className="p-1 rounded hover:bg-gray-100" aria-label="Close">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-sm mb-1">Template Name</label>
                <input type="text" placeholder="Enter template name" value={form.template_name} onChange={(e) => setForm({ ...form, template_name: e.target.value })} required className="w-full border rounded px-3 py-2 text-sm" disabled={submitting} />
              </div>

              <div>
                <label className="block text-sm mb-1">Body</label>
                <textarea placeholder="Enter template body" value={form.static_script} onChange={(e) => setForm({ ...form, static_script: e.target.value })} required rows={4} className="w-full border rounded px-3 py-2 text-sm" disabled={submitting} />
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button type="button" onClick={() => setShowModal(false)} className="px-3 py-1.5 text-sm bg-gray-200 rounded hover:bg-gray-300" disabled={submitting}>
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="px-3 py-1.5 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 disabled:opacity-60">
                  {submitting ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

   
      {editModalOpen && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-lg">
          <div className="bg-white border rounded-xl shadow-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold">Edit Template Body</h3>
              <button onClick={closeEditModal} className="p-1 rounded hover:bg-gray-100" aria-label="Close">
                ✕
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-3">
              <div>
                <label className="block text-sm mb-1">Body</label>
                <textarea placeholder="Edit template body..." value={editingBody} onChange={(e) => setEditingBody(e.target.value)} required rows={6} className="w-full border rounded px-3 py-2 text-sm" disabled={editSubmitting} />
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button type="button" onClick={closeEditModal} className="px-3 py-1.5 text-sm bg-gray-200 rounded hover:bg-gray-300" disabled={editSubmitting}>
                  Cancel
                </button>
                <button type="submit" disabled={editSubmitting} className="px-3 py-1.5 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-60">
                  {editSubmitting ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
