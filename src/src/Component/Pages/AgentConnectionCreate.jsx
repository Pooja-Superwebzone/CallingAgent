// src/pages/AgentConnectionCreate.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

import {
  getAgents,
  getWhatsappTemplates,
  getEmailTemplates,
  createAgentWhatsappConnect,
} from "../../hooks/useAuth";

function useClickOutside(ref, handler) {
  useEffect(() => {
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) handler();
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [ref, handler]);
}

function SearchableDropdown({
  label,
  items = [],
  loading = false,
  placeholder,
  selectedId,
  selectedLabel,
  onSelect,
  onClear,
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef(null);

  useClickOutside(ref, () => setOpen(false));

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
      <label className="block text-sm font-medium">{label}</label>
      <div className="mt-1 relative">
        <div
          className="w-full border rounded px-3 py-2 flex items-center justify-between cursor-text"
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
                  onClear();
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

export default function AgentConnectionCreate() {
  const [agents, setAgents] = useState([]);
  const [waTemplates, setWaTemplates] = useState([]);
  const [emailTemplates, setEmailTemplates] = useState([]);

  const [loadingAgents, setLoadingAgents] = useState(true);
  const [loadingWa, setLoadingWa] = useState(true);
  const [loadingEmail, setLoadingEmail] = useState(true);

  const [selectedAgentId, setSelectedAgentId] = useState("");
  const [selectedAgentLabel, setSelectedAgentLabel] = useState("");

  const [selectedWaId, setSelectedWaId] = useState("");
  const [selectedWaLabel, setSelectedWaLabel] = useState("");

  const [selectedEmailId, setSelectedEmailId] = useState("");
  const [selectedEmailLabel, setSelectedEmailLabel] = useState("");

  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // load agents
    const loadAgents = async () => {
      setLoadingAgents(true);
      try {
        const list = await getAgents();
        const normalized = (Array.isArray(list) ? list : []).map((a) => ({
          id: a.id ?? a._id ?? a.agent_id ?? a.agentId ?? "",
          label: a.name ?? a.title ?? `Agent ${a.id ?? ""}`,
          raw: a,
        }));
        setAgents(normalized);
      } catch (err) {
        toast.error(err?.message || "Failed to load agents");
        setAgents([]);
      } finally {
        setLoadingAgents(false);
      }
    };

    // load whatsapp templates
    const loadWa = async () => {
      setLoadingWa(true);
      try {
        const res = await getWhatsappTemplates();
        const list = Array.isArray(res) ? res : res?.templates ?? res?.data ?? res ?? [];

        const normalized = (Array.isArray(list) ? list : []).map((t) => {
          let content = t.content;
          if (typeof content === "string") {
            try {
              content = JSON.parse(content);
            } catch (e) {
              // ignore parse error
            }
          }
          const label =
            t.name ??
            (content && content.friendly_name) ??
            (content && content.twilio_sid) ??
            t.template_name ??
            t.template_id ??
            t.twilio_sid ??
            `Template ${t.id ?? ""}`;
          const id = t.id ?? t.template_id ?? t.twilio_sid ?? "";
          return { id, label, raw: t };
        });

        setWaTemplates(normalized);
      } catch (err) {
        toast.error(err?.message || "Failed to load WhatsApp templates");
        setWaTemplates([]);
      } finally {
        setLoadingWa(false);
      }
    };

    // load email templates
    const loadEmail = async () => {
      setLoadingEmail(true);
      try {
        const list = await getEmailTemplates();
        const normalized = (Array.isArray(list) ? list : []).map((t) => ({
          id: t.id ?? t.template_id ?? t.twilio_sid ?? "",
          label: t.name ?? t.subject ?? `Email ${t.id ?? ""}`,
          raw: t,
        }));
        setEmailTemplates(normalized);
      } catch (err) {
        toast.error(err?.message || "Failed to load email templates");
        setEmailTemplates([]);
      } finally {
        setLoadingEmail(false);
      }
    };

    loadAgents();
    loadWa();
    loadEmail();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!selectedAgentId) {
      toast.error("Please select an Agent");
      return;
    }
    if (!selectedWaId) {
      toast.error("Please select a WhatsApp template");
      return;
    }
    if (!selectedEmailId) {
      toast.error("Please select an Email template");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        agent_id: selectedAgentId,
        facebook_whatsapp_template_id: selectedWaId,
        email_template_twilio_id: selectedEmailId,
      };
      await createAgentWhatsappConnect(payload);
      toast.success("Connection created successfully");
      navigate("/agent-connection");
    } catch (err) {
      toast.error(err?.message || "Failed to create connection");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full bg-white" style={{ minHeight: "100vh" }}>
      <div className="p-4 sm:p-6 w-full">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-700">Create Connection</h2>
          <button
            onClick={() => navigate("/agent-connection")}
            className="px-3 py-1 border rounded"
            disabled={saving}
          >
            Back
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-6 w-full">
          <form onSubmit={handleSave} className="space-y-4">
            <SearchableDropdown
              label="Agent"
              items={agents}
              loading={loadingAgents}
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
              loading={loadingWa}
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
              loading={loadingEmail}
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

            <div className="flex justify-end gap-2 pt-4">
              <button
                type="button"
                className="px-4 py-2 border rounded-md hover:bg-gray-100"
                onClick={() => navigate("/agent-connection")}
                disabled={saving}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                disabled={saving}
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
