import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import DOMPurify from "dompurify";
import { FiEdit } from "react-icons/fi";
import { toast } from "react-hot-toast";
import service from "../../../api/axios";
import {
  fetchSalespersons,
  fetchSalespersonVoiceAgents,
  getSalespersonAgentsError,
  getVoiceAgentBody,
} from "../../../api/salespersonAgentsApi";

const PREVIEW_LEN = 80;
const SEARCH_DEBOUNCE_MS = 400;

function ExpandableTextCell({ text }) {
  const [expanded, setExpanded] = useState(false);
  const value = String(text || "").trim();
  if (!value) return <span className="text-slate-400">—</span>;

  const needsTruncate = value.length > PREVIEW_LEN;
  const display = expanded || !needsTruncate
    ? value
    : `${value.slice(0, PREVIEW_LEN)}…`;

  return (
    <div className="max-w-xs text-sm text-slate-700">
      <p className="whitespace-pre-wrap break-words">{display}</p>
      {needsTruncate && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
        >
          {expanded ? "View less" : "View more"}
        </button>
      )}
    </div>
  );
}

function TableSkeleton() {
  return (
    <>
      {[1, 2, 3, 4, 5].map((i) => (
        <tr key={i} className="border-t border-slate-100 animate-pulse">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((c) => (
            <td key={c} className="px-4 py-3">
              <div className="h-4 w-full bg-slate-200 rounded" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

function StatusBadge({ active }) {
  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
        active
          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
          : "bg-slate-100 text-slate-500 border border-slate-200"
      }`}
    >
      {active ? "Active" : "Inactive"}
    </span>
  );
}

export default function BdeAgentsPage() {
  const navigate = useNavigate();

  const [adminId, setAdminId] = useState("");
  const [salespersons, setSalespersons] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loadingSalespersons, setLoadingSalespersons] = useState(true);
  const [loadingAgents, setLoadingAgents] = useState(true);

  const [selectedSalespersonId, setSelectedSalespersonId] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [showInactive, setShowInactive] = useState(false);

  const isAdmin = useMemo(() => {
    return String(Cookies.get("role") || "").trim().toLowerCase() === "admin";
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadProfile = async () => {
      try {
        const res = await service.get("Profile");
        if (cancelled) return;
        const profile = res?.data?.data || res?.data || {};
        const id =
          profile?.id ??
          profile?.user_id ??
          profile?.twilio_create_id ??
          "";
        setAdminId(id ? String(id) : "");
      } catch {
        if (!cancelled) setAdminId("");
      }
    };

    loadProfile();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchInput.trim()), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [searchInput]);

  const loadSalespersons = useCallback(async () => {
    setLoadingSalespersons(true);
    try {
      const params = {};
      if (isAdmin && adminId) params.admin_id = adminId;

      const res = await fetchSalespersons(params);
      setSalespersons(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      toast.error(getSalespersonAgentsError(err, "Failed to load salespersons"));
      setSalespersons([]);
    } finally {
      setLoadingSalespersons(false);
    }
  }, [adminId, isAdmin]);

  const loadAgents = useCallback(async () => {
    setLoadingAgents(true);
    try {
      const params = {};
      if (isAdmin && adminId) params.admin_id = adminId;
      if (selectedSalespersonId) params.user_id = selectedSalespersonId;
      if (debouncedSearch) params.search = debouncedSearch;
      if (showInactive) params.include_inactive = true;

      const res = await fetchSalespersonVoiceAgents(params);
      setAgents(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      toast.error(getSalespersonAgentsError(err, "Failed to load agents"));
      setAgents([]);
    } finally {
      setLoadingAgents(false);
    }
  }, [adminId, debouncedSearch, isAdmin, selectedSalespersonId, showInactive]);

  useEffect(() => {
    if (isAdmin && !adminId) return;
    loadSalespersons();
  }, [loadSalespersons, isAdmin, adminId]);

  useEffect(() => {
    if (isAdmin && !adminId) return;
    loadAgents();
  }, [loadAgents, isAdmin, adminId]);

  const formatSalesperson = (sp) => {
    if (!sp) return "—";
    const name = sp.name || "Unknown";
    const phone = sp.contact_no ? ` · ${sp.contact_no}` : "";
    return `${name}${phone}`;
  };

  return (
    <div className="min-h-screen bg-slate-100 px-3 py-4 sm:px-4 sm:py-6">
      <div className="mx-auto max-w-[1600px]">
        <div className="mb-5">
          <h2 className="text-[24px] font-bold tracking-tight text-gray-700 sm:text-3xl">
            Agents
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Voice AI agents created by salesperson users.
          </p>
        </div>

        <div className="mb-6 rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
          <div className="flex flex-wrap items-end gap-4">
            <div className="min-w-[220px] flex-1">
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Salesperson
              </label>
              <select
                value={selectedSalespersonId}
                onChange={(e) => setSelectedSalespersonId(e.target.value)}
                disabled={loadingSalespersons}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 disabled:opacity-60"
              >
                <option value="">All salespersons</option>
                {salespersons.map((sp) => (
                  <option key={sp.id} value={String(sp.id)}>
                    {sp.name} ({sp.email})
                  </option>
                ))}
              </select>
            </div>

            <div className="min-w-[220px] flex-1">
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Search
              </label>
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search agents or salespersons…"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
              />
            </div>

            <label className="inline-flex items-center gap-2 pb-2 text-sm text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={showInactive}
                onChange={(e) => setShowInactive(e.target.checked)}
                className="rounded border-slate-300"
              />
              Show inactive
            </label>
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-[1400px] w-full text-sm">
              <thead className="bg-slate-50 text-left text-slate-600">
                <tr>
                  <th className="px-4 py-3 font-semibold">Agent name</th>
                  <th className="px-4 py-3 font-semibold">Keyword</th>
                  <th className="px-4 py-3 font-semibold">Salesperson</th>
                  <th className="px-4 py-3 font-semibold">Language</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold min-w-[180px]">Opening message</th>
                  <th className="px-4 py-3 font-semibold min-w-[160px]">Goodbye message</th>
                  <th className="px-4 py-3 font-semibold">Body</th>
                  <th className="px-4 py-3 font-semibold w-16 sticky right-0 bg-slate-50 z-10">Actions</th>
                </tr>
              </thead>
              <tbody className="text-slate-800 align-top">
                {loadingAgents ? (
                  <TableSkeleton />
                ) : agents.length === 0 ? (
                  <tr className="border-t border-slate-100">
                    <td colSpan={9} className="px-4 py-12 text-center text-slate-500">
                      No agents found
                    </td>
                  </tr>
                ) : (
                  agents.map((agent) => {
                    const sp = agent.salesperson || {};
                    const isActive = agent.is_active !== false && agent.is_active !== 0;
                    const bodyHtml = getVoiceAgentBody(agent);
                    return (
                      <tr key={agent.id} className="border-t border-slate-100 hover:bg-slate-50/60">
                        <td className="px-4 py-3 font-medium">{agent.name || "—"}</td>
                        <td className="px-4 py-3">
                          <span className="inline-flex rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700 border border-indigo-100">
                            {agent.keyword || "—"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-medium text-slate-800">{sp.name || "—"}</div>
                          {sp.email && (
                            <div className="text-xs text-slate-500">{sp.email}</div>
                          )}
                          {sp.contact_no && (
                            <div className="text-xs text-slate-500">{sp.contact_no}</div>
                          )}
                        </td>
                        <td className="px-4 py-3">{agent.language || "—"}</td>
                        <td className="px-4 py-3">
                          <StatusBadge active={isActive} />
                        </td>
                        <td className="px-4 py-3">
                          <ExpandableTextCell text={agent.opening_message} />
                        </td>
                        <td className="px-4 py-3">
                          <ExpandableTextCell text={agent.goodbye_message} />
                        </td>
                        <td
                          className="px-4 py-3 whitespace-pre-line break-words"
                          dangerouslySetInnerHTML={{
                            __html: DOMPurify.sanitize(bodyHtml),
                          }}
                        />
                        <td className="px-4 py-3 sticky right-0 bg-white">
                          <button
                            type="button"
                            title="Edit agent"
                            aria-label={`Edit ${agent.name || agent.keyword}`}
                            onClick={() => navigate(`/bde/agents/${agent.id}/edit`)}
                            className="rounded border border-slate-300 bg-white p-2 text-slate-600 shadow-sm transition hover:bg-slate-100"
                          >
                            <FiEdit size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {!loadingAgents && agents.length > 0 && (
          <p className="mt-3 text-sm text-slate-500">
            {agents.length} agent{agents.length === 1 ? "" : "s"} found
            {selectedSalespersonId
              ? ` for ${formatSalesperson(
                  salespersons.find((s) => String(s.id) === selectedSalespersonId)
                )}`
              : ""}
          </p>
        )}
      </div>
    </div>
  );
}
