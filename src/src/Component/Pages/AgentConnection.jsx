
import React, { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import { FiEdit, FiTrash2, FiX } from "react-icons/fi";

import {
  getAgentWhatsappConnect,
  getAgentWhatsappConnectById,
  deleteAgentWhatsappConnect,
  getAgents,
  getWhatsappTemplates,
  getEmailTemplates,
  updateAgentWhatsappConnect,
} from "../../hooks/useAuth";


function useClickOutside(ref, handler, enabled = true) {
  useEffect(() => {
    if (!enabled) return;
    function onClick(e) {
      if (ref.current && !ref.current.contains(e.target)) handler(e);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [ref, handler, enabled]);
}


function Modal({
  title,
  open,
  onClose,
  children,
  size = "lg",
  closeOnOutside = true,
  align = "center",  
  topMargin = 40,     
}) {
  const ref = useRef(null);
  useClickOutside(ref, () => onClose && onClose(), closeOnOutside);

  if (!open) return null;

  const sizeClass =
    size === "sm" ? "max-w-lg" : size === "md" ? "max-w-3xl" : "max-w-5xl";

  return (
    <div className="fixed inset-0 z-50 pointer-events-auto flex">
      {/* overlay */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={closeOnOutside ? onClose : undefined}
      />

      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        className={`bg-white rounded-lg shadow-lg w-full ${sizeClass} max-h-[90vh] overflow-auto`}
        style={{
          position: "fixed",
          right: align === "right" ? "2rem" : "50%",
          left: align === "right" ? "auto" : "50%",
          top: `${topMargin}px`,
          transform:
            align === "right"
              ? "translateY(0)" 
              : "translate(-50%, 0)", 
        }}
      >
        <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white z-10">
          <h3 className="text-lg font-medium">{title}</h3>
          <button
            onClick={onClose}
            className="p-2 rounded hover:bg-gray-100"
            aria-label="Close modal"
          >
            <FiX />
          </button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}


function SearchableDropdown({
  label,
  items = [],
  loading = false,
  placeholder = "",
  selectedId,
  selectedLabel,
  onSelect,
  onClear,
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef(null);

  useClickOutside(ref, () => setOpen(false), true);

  const filtered = useMemo(() => {
    const q = (query || "").trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (it) =>
        String(it.label || "").toLowerCase().includes(q) ||
        String(it.id || "").toLowerCase().includes(q)
    );
  }, [items, query]);

  useEffect(() => {
    if (selectedId && selectedLabel) setQuery("");
  }, [selectedId, selectedLabel]);

  return (
    <div className="relative" ref={ref}>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <div className="mt-1 relative">
        <div
          className="w-full border rounded px-3 py-2 flex items-center justify-between cursor-text bg-white"
          onClick={() => setOpen((o) => !o)}
        >
          <div className="flex-1">
            <input
              type="text"
              className="w-full outline-none"
              placeholder={selectedLabel || placeholder}
              value={selectedId ? selectedLabel : query}
              onChange={(e) => {
                setQuery(e.target.value);
                if (!open) setOpen(true);
              }}
              onFocus={() => setOpen(true)}
            />
          </div>

          <div className="flex items-center gap-2">
            {selectedId && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onClear && onClear();
                  setQuery("");
                  setOpen(false);
                }}
                className="text-gray-400 hover:text-gray-600 px-1"
                aria-label="Clear selection"
              >
                ×
              </button>
            )}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setOpen((o) => !o);
              }}
              className="text-gray-400 hover:text-gray-600 px-1"
              aria-label="Toggle dropdown"
            >
              ▾
            </button>
          </div>
        </div>

        {open && (
          <div className="absolute z-50 mt-1 w-full max-h-56 overflow-auto bg-white border rounded shadow">
            {loading ? (
              <div className="p-2 text-xs text-gray-500">Loading…</div>
            ) : filtered.length === 0 ? (
              <div className="p-2 text-xs text-gray-500">No items found</div>
            ) : (
              <ul>
                {filtered.map((it) => (
                  <li
                    key={it.id}
                    className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm flex justify-between"
                    onClick={() => {
                      onSelect(it);
                      setOpen(false);
                      setQuery("");
                    }}
                  >
                    <span className="truncate">{it.label}</span>
                    <span className="text-xs text-gray-400">({it.id})</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* --- Main component --- */
export default function AgentConnection() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  // Edit modal
  const [editOpen, setEditOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editLoading, setEditLoading] = useState(false);

  // data for edit dropdowns
  const [agents, setAgents] = useState([]);
  const [waTemplates, setWaTemplates] = useState([]);
  const [emailTemplates, setEmailTemplates] = useState([]);

  // edit selected values (ids + labels)
  const [selectedAgentId, setSelectedAgentId] = useState("");
  const [selectedAgentLabel, setSelectedAgentLabel] = useState("");
  const [selectedWaId, setSelectedWaId] = useState("");
  const [selectedWaLabel, setSelectedWaLabel] = useState("");
  const [selectedEmailId, setSelectedEmailId] = useState("");
  const [selectedEmailLabel, setSelectedEmailLabel] = useState("");

  const [savingEdit, setSavingEdit] = useState(false);

  // pagination
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  const pageRows = rows.slice((page - 1) * pageSize, page * pageSize);

  // ref for the table container - used to center modal over the table area
  const tableContainerRef = useRef(null);

  /* helper: extract whatsapp body and email body reliably */
  const getWhatsAppBodyFromFbTemplate = (fbTemplate) => {
    if (!fbTemplate) return "-";
    const types = fbTemplate.content?.types;
    if (types) {
      const txt = types["twilio/text"]?.body ?? types["text"]?.body;
      if (typeof txt === "string" && txt.trim()) return txt;
    }
    if (typeof fbTemplate.content === "string") {
      try {
        const parsed = JSON.parse(fbTemplate.content);
        const types2 = parsed?.types;
        const txt = types2?.["twilio/text"]?.body ?? types2?.["text"]?.body;
        if (typeof txt === "string" && txt.trim()) return txt;
      } catch {
        // ignore
      }
    }
    return fbTemplate.content?.friendly_name ?? fbTemplate.name ?? fbTemplate.template_id ?? "-";
  };

  const getEmailBody = (emailTemplate) => {
    if (!emailTemplate) return "-";
    if (emailTemplate.body && typeof emailTemplate.body === "string") return emailTemplate.body;
    if (emailTemplate.content) {
      const c = emailTemplate.content;
      const types = c.types;
      if (types) {
        const body = (types["twilio/text"] || types["text"])?.body;
        if (body) return body;
      }
      if (typeof c === "string") return c;
    }
    return "-";
  };

  /* load listing */
  const loadRows = async () => {
    setLoading(true);
    try {
      const res = await getAgentWhatsappConnect();
      const list = Array.isArray(res) ? res : res?.data ?? [];
      const normalized = (Array.isArray(list) ? list : []).map((entry, i) => {
        const agent = entry.agent || {};
        const fbTemplate = entry.facebook_whatsapp_template || {};
        const emailTemplate = entry.email_template_twilio || entry.email_template || {};

        const whatsappBody = getWhatsAppBodyFromFbTemplate(fbTemplate);
        const emailBody = getEmailBody(emailTemplate);
        const agentName = agent.name ?? agent.title ?? agent.agent_name ?? `Agent ${agent.id ?? i + 1}`;

        return {
          id: entry.id ?? entry._id ?? i + 1,
          raw: entry,
          agentName,
          whatsappTemplateName:
            fbTemplate.name ?? fbTemplate.template_id ?? fbTemplate?.content?.friendly_name ?? "-",
          whatsappBody,
          emailBody,
          // include raw template objects
          whatsappTemplateRaw: fbTemplate,
          emailTemplateRaw: emailTemplate,
        };
      });
      setRows(normalized);
    } catch (err) {
      toast.error(err?.message || "Failed to fetch agent connections");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRows();
  }, []);

  /* DELETE */
  const handleDelete = async (id) => {
    const ok = window.confirm("Are you sure you want to delete this connection?");
    if (!ok) return;
    try {
      setDeletingId(id);
      await deleteAgentWhatsappConnect(id);
      toast.success("Connection deleted");
      await loadRows();
    } catch (err) {
      toast.error(err?.message || "Failed to delete");
    } finally {
      setDeletingId(null);
    }
  };

  /* OPEN EDIT: fetch single record + lists, preselect values like Create page */
  const openEdit = async (id) => {
    setEditOpen(true);
    setEditLoading(true);
    setEditId(id);

    // clear current selections while loading
    setSelectedAgentId("");
    setSelectedAgentLabel("");
    setSelectedWaId("");
    setSelectedWaLabel("");
    setSelectedEmailId("");
    setSelectedEmailLabel("");

    try {
      const [record, agentsList, waList, emailList] = await Promise.all([
        getAgentWhatsappConnectById(id),
        getAgents(),
        getWhatsappTemplates(),
        getEmailTemplates(),
      ]);

      // normalize agents
      const normalizedAgents = (Array.isArray(agentsList) ? agentsList : []).map((a) => ({
        id: a.id ?? a._id ?? a.agent_id ?? a.agentId ?? "",
        label: a.name ?? a.title ?? `Agent ${a.id ?? ""}`,
        raw: a,
      }));

      // normalize whatsapp templates (list shapes vary)
      const waSrc = Array.isArray(waList) ? waList : waList?.templates ?? waList?.data ?? waList ?? [];
      const normalizedWa = (Array.isArray(waSrc) ? waSrc : []).map((t) => {
        let content = t.content;
        if (typeof content === "string") {
          try {
            content = JSON.parse(content);
          } catch {
            // ignore
          }
        }
        const label =
          t.name ??
          (content && content.friendly_name) ??
          t.template_name ??
          t.template_id ??
          t.twilio_sid ??
          `Template ${t.id ?? ""}`;
        const idVal = t.id ?? t.template_id ?? t.twilio_sid ?? "";
        return { id: idVal, label, raw: t };
      });

      // normalize email templates
      const normalizedEmail = (Array.isArray(emailList) ? emailList : []).map((t) => ({
        id: t.id ?? t.template_id ?? t.twilio_sid ?? "",
        label: t.name ?? t.subject ?? t.template_id ?? `Email ${t.id ?? ""}`,
        raw: t,
      }));

      setAgents(normalizedAgents);
      setWaTemplates(normalizedWa);
      setEmailTemplates(normalizedEmail);

      // preselect from record
      const recordData = record || {};
      const agentObj = recordData.agent || {};
      const fbTemplateObj = recordData.facebook_whatsapp_template || {};
      const emailObj = recordData.email_template_twilio || recordData.email_template || {};

      setSelectedAgentId(agentObj.id ?? agentObj.agent_id ?? recordData.agent_id ?? "");
      setSelectedAgentLabel(agentObj.name ?? agentObj.title ?? agentObj.agent_name ?? "");

      // whatsapp label: try friendly name from content first
      let fbLabel = fbTemplateObj.name ?? fbTemplateObj.template_name ?? "";
      if (!fbLabel && fbTemplateObj.content) {
        const cnt = fbTemplateObj.content;
        if (typeof cnt === "string") {
          try {
            const parsed = JSON.parse(cnt);
            fbLabel = parsed?.friendly_name ?? parsed?.twilio_sid ?? "";
          } catch {
            // ignore
          }
        } else if (typeof cnt === "object") {
          fbLabel = cnt?.friendly_name ?? cnt?.twilio_sid ?? "";
        }
      }
      setSelectedWaId(
        fbTemplateObj.id ?? fbTemplateObj.template_id ?? fbTemplateObj.twilio_sid ?? recordData.facebook_whatsapp_template_id ?? ""
      );
      setSelectedWaLabel(fbLabel ?? fbTemplateObj.name ?? fbTemplateObj.template_id ?? "");

      setSelectedEmailId(emailObj.id ?? recordData.email_template_twilio_id ?? "");
      setSelectedEmailLabel(emailObj.name ?? emailObj.subject ?? "");
    } catch (err) {
      toast.error(err?.message || "Failed to load edit form");
      setEditOpen(false);
    } finally {
      setEditLoading(false);
    }
  };

  /* Save edit */
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editId) return;
    if (!selectedAgentId) return toast.error("Select Agent");
    if (!selectedWaId) return toast.error("Select WhatsApp template");
    if (!selectedEmailId) return toast.error("Select Email template");

    setSavingEdit(true);
    try {
      const payload = {
        agent_id: selectedAgentId,
        facebook_whatsapp_template_id: selectedWaId,
        email_template_twilio_id: selectedEmailId,
      };
      await updateAgentWhatsappConnect(editId, payload);
      toast.success("Connection updated");
      setEditOpen(false);
      await loadRows();
    } catch (err) {
      toast.error(err?.message || "Failed to update");
    } finally {
      setSavingEdit(false);
    }
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-700">Agent Connection</h2>
        <button
          onClick={() => (window.location.href = "/agent-connection/new")}
          className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
        >
          Add Connection
        </button>
      </div>

      <div ref={tableContainerRef} className="overflow-x-auto rounded-xl shadow">
        <table className="min-w-full bg-white text-sm table-fixed">
          <thead className="bg-gray-100 text-left text-gray-600">
            <tr>
              <th className="px-4 py-2 w-12">Sr No</th>
              <th className="px-4 py-2 w-56">Agent</th>
              <th className="px-4 py-2 w-96">WhatsApp Body</th>
              <th className="px-4 py-2 w-96">Email Body</th>
              <th className="px-4 py-2 w-36">Actions</th>
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
                  No connections found
                </td>
              </tr>
            ) : (
              pageRows.map((r, i) => (
                <tr key={r.id} className="border-b hover:bg-gray-50 text-gray-700 align-top">
                  <td className="px-4 py-2">{(page - 1) * pageSize + i + 1}</td>

                  {/* Agent name */}
                  <td className="px-4 py-2 font-medium">{r.agentName}</td>

                  {/* WhatsApp body */}
                  <td className="px-4 py-2">
                    <pre className="whitespace-pre-wrap break-words text-sm">{r.whatsappBody}</pre>
                  </td>

                  {/* Email body */}
                  <td className="px-4 py-2">
                    <pre className="whitespace-pre-wrap break-words text-sm">{r.emailBody}</pre>
                  </td>

                  <td className="px-4 py-2">
                    <div className="flex items-center gap-2">
                      {/* Only Edit (no View) */}
                      <button
                        title="Edit"
                        onClick={() => openEdit(r.id)}
                        className="p-2 rounded hover:bg-gray-100"
                      >
                        <FiEdit />
                      </button>
                      <button
                        title="Delete"
                        onClick={() => handleDelete(r.id)}
                        className="p-2 rounded hover:bg-red-100 text-red-600"
                        disabled={deletingId === r.id}
                      >
                        {deletingId === r.id ? "..." : <FiTrash2 />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {rows.length > pageSize && (
        <div className="flex items-center justify-between mt-4 text-sm text-gray-600">
          <div>
            Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, rows.length)} of {rows.length}
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
                className={`px-3 py-1 border rounded ${page === idx + 1 ? "bg-indigo-600 text-white" : ""}`}
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

      {/* EDIT Modal: topOffsetPx sets modal to top-middle. */}
      <Modal
        title="Edit Connection"
        open={editOpen}
        onClose={() => setEditOpen(false)}
        size="md"
        containerRef={null}
        closeOnOutside={false}
        topOffsetPx={100} // <-- put modal near top and horizontally centered
      >
        {editLoading ? (
          <div className="text-sm text-gray-500">Loading…</div>
        ) : (
          <form onSubmit={handleSaveEdit} className="space-y-4">
            <div className="grid grid-cols-1 gap-3">
              <SearchableDropdown
                label="Agent"
                items={agents}
                loading={false}
                placeholder="Search agents..."
                selectedId={selectedAgentId}
                selectedLabel={selectedAgentLabel}
                onSelect={(it) => {
                  setSelectedAgentId(it.id);
                  setSelectedAgentLabel(it.label);
                }}
                onClear={() => {
                  setSelectedAgentId("");
                  setSelectedAgentLabel("");
                }}
              />

              <SearchableDropdown
                label="WhatsApp Template"
                items={waTemplates}
                loading={false}
                placeholder="Search WhatsApp templates..."
                selectedId={selectedWaId}
                selectedLabel={selectedWaLabel}
                onSelect={(it) => {
                  setSelectedWaId(it.id);
                  setSelectedWaLabel(it.label);
                }}
                onClear={() => {
                  setSelectedWaId("");
                  setSelectedWaLabel("");
                }}
              />

              <SearchableDropdown
                label="Email Template"
                items={emailTemplates}
                loading={false}
                placeholder="Search email templates..."
                selectedId={selectedEmailId}
                selectedLabel={selectedEmailLabel}
                onSelect={(it) => {
                  setSelectedEmailId(it.id);
                  setSelectedEmailLabel(it.label);
                }}
                onClear={() => {
                  setSelectedEmailId("");
                  setSelectedEmailLabel("");
                }}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditOpen(false)}
                className="px-3 py-1 border rounded"
                disabled={savingEdit}
              >
                Cancel
              </button>
              <button type="submit" className="px-3 py-1 bg-gray-600 text-white rounded-md" disabled={savingEdit}>
                {savingEdit ? "Saving..." : "Save"}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
