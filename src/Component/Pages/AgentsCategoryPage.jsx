import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import DOMPurify from "dompurify";
import { getAgentsCategory } from "../../hooks/useAuth";
import { FiEdit, FiRefreshCw } from "react-icons/fi";

/** Column keys whose values are HTML and should render (sanitized), not escaped text. */
const isHtmlColumnKey = (key) => {
  if (!key || typeof key !== "string") return false;
  const k = key.toLowerCase();
  return (
    k === "body" ||
    k === "html" ||
    k === "description" ||
    k === "content" ||
    k === "welcome_message" ||
    k === "welcomemessage"
  );
};

const formatCell = (value) => {
  if (value === undefined || value === null || value === "") return "—";
  if (typeof value === "object") {
    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  }
  return String(value);
};

/** Shown line-by-line in the first “Identifiers” column — not repeated as separate columns. */
const MERGED_IDENTIFIER_KEYS = new Set(["id", "user_id", "userid", "agent_id", "agentid"]);

/** Other fields to hide from the table entirely. */
const HIDDEN_COLUMN_KEYS = new Set([
  "created_at",
  "updated_at",
  "agency_id",
  "agencyid",
  "twilio_agent_id",
  "twilioagentid",
]);

const ID_ALIASES = ["id"];

const getIdentifierValue = (row, aliases) => {
  if (!row || typeof row !== "object") return undefined;
  for (const a of aliases) {
    if (Object.prototype.hasOwnProperty.call(row, a)) {
      const v = row[a];
      if (v !== undefined && v !== null && String(v).trim() !== "") return v;
    }
  }
  const norm = (s) => String(s).toLowerCase().replace(/\s+/g, "_");
  const byNorm = {};
  for (const k of Object.keys(row)) {
    byNorm[norm(k)] = k;
  }
  for (const a of aliases) {
    const key = byNorm[norm(a)];
    if (key) {
      const v = row[key];
      if (v !== undefined && v !== null && String(v).trim() !== "") return v;
    }
  }
  return undefined;
};

/** Resolve a row field when API keys differ (snake_case vs camelCase). */
const getFieldValue = (row, aliases) => {
  if (!row || typeof row !== "object") return undefined;
  for (const a of aliases) {
    if (Object.prototype.hasOwnProperty.call(row, a)) {
      const v = row[a];
      if (v !== undefined && v !== null) return v;
    }
  }
  const norm = (s) => String(s).toLowerCase().replace(/\s+/g, "_");
  const byNorm = {};
  for (const k of Object.keys(row)) {
    byNorm[norm(k)] = k;
  }
  for (const a of aliases) {
    const key = byNorm[norm(a)];
    if (key) {
      const v = row[key];
      if (v !== undefined && v !== null) return v;
    }
  }
  return undefined;
};

const BODY_FIELD_ALIASES = ["body", "Body", "html"];
const WELCOME_FIELD_ALIASES = ["welcome_message", "welcomeMessage", "welcomemessage"];

/** Actual object key on `row` for writing edits back locally (no API). */
const resolveFieldKey = (row, aliases, fallback) => {
  if (!row || typeof row !== "object") return fallback;
  for (const a of aliases) {
    if (Object.prototype.hasOwnProperty.call(row, a)) return a;
  }
  const norm = (s) => String(s).toLowerCase().replace(/\s+/g, "_");
  const byNorm = {};
  for (const k of Object.keys(row)) {
    byNorm[norm(k)] = k;
  }
  for (const a of aliases) {
    const key = byNorm[norm(a)];
    if (key) return key;
  }
  return fallback;
};

const looksLikeHtmlString = (s) => typeof s === "string" && /<[a-z][\s\S]*>/i.test(s);

/** Strip tags for editing: textarea shows readable text, not `<p>…</p>`. */
const htmlToEditablePlain = (value) => {
  if (value == null) return "";
  const s = String(value);
  if (!s.trim()) return "";
  if (!looksLikeHtmlString(s)) return s.replace(/\r\n/g, "\n");
  try {
    const doc = new DOMParser().parseFromString(s, "text/html");
    const text = doc.body?.innerText ?? doc.body?.textContent ?? "";
    return text.replace(/\r\n/g, "\n");
  } catch {
    return s.replace(/\r\n/g, "\n");
  }
};

const escapeHtmlText = (s) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

/** Turn textarea plain text back into simple `<p>` HTML for table rendering. */
const plainToSimpleHtml = (plain) => {
  const t = String(plain).replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  if (!t.trim()) return "";
  const blocks = t.split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean);
  if (blocks.length === 0) return "";
  return blocks
    .map((block) => {
      const inner = escapeHtmlText(block).replace(/\n/g, "<br />");
      return `<p>${inner}</p>`;
    })
    .join(" ");
};

const collectColumnKeys = (rows) => {
  const keys = new Set();
  (Array.isArray(rows) ? rows : []).forEach((row) => {
    if (row && typeof row === "object" && !Array.isArray(row)) {
      Object.keys(row).forEach((k) => keys.add(k));
    }
  });
  return Array.from(keys)
    .filter((k) => {
      const low = k.toLowerCase();
      return !HIDDEN_COLUMN_KEYS.has(low) && !MERGED_IDENTIFIER_KEYS.has(low);
    })
    .sort((a, b) => {
      if (a === "name") return -1;
      if (b === "name") return 1;
      return a.localeCompare(b);
    });
};

/** Short text columns — fixed width so they don’t collapse into body HTML. */
const isNarrowColumnKey = (key) => {
  if (!key || typeof key !== "string") return false;
  const k = key.toLowerCase();
  return k === "category" || k === "category_id";
};

const renderIdCell = (row) => {
  const val = getIdentifierValue(row, ID_ALIASES);
  if (val === undefined) {
    return <span className="text-sm text-neutral-400">—</span>;
  }
  return (
    <span className="font-mono text-sm tabular-nums text-neutral-900">{String(val)}</span>
  );
};

const SAVE_LOADER_MS = 1200;

export default function AgentsCategoryPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [editModalRow, setEditModalRow] = useState(null);
  const [editModalSaving, setEditModalSaving] = useState(false);
  const [editDraftBody, setEditDraftBody] = useState("");
  const [editDraftWelcome, setEditDraftWelcome] = useState("");
  const [editBodyKey, setEditBodyKey] = useState("body");
  const [editWelcomeKey, setEditWelcomeKey] = useState("welcome_message");
  const saveTimerRef = useRef(null);
  const pageSize = 15;

  const loadRows = useCallback(async () => {
    setLoading(true);
    try {
      const list = await getAgentsCategory();
      setRows(Array.isArray(list) ? list : []);
    } catch (e) {
      toast.error(e?.message || "Failed to load agents category");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRows();
  }, [loadRows]);

  const columns = useMemo(() => collectColumnKeys(rows), [rows]);
  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  const pageRows = rows.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => {
    setPage((p) => Math.min(Math.max(1, p), totalPages));
  }, [totalPages]);

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current);
    };
  }, []);

  const closeEditModal = useCallback(() => {
    if (saveTimerRef.current) {
      window.clearTimeout(saveTimerRef.current);
      saveTimerRef.current = null;
    }
    setEditModalSaving(false);
    setEditModalRow(null);
    setEditDraftBody("");
    setEditDraftWelcome("");
  }, []);

  const openEditModal = useCallback((row) => {
    const b = getFieldValue(row, BODY_FIELD_ALIASES);
    const w = getFieldValue(row, WELCOME_FIELD_ALIASES);
    setEditDraftBody(htmlToEditablePlain(b));
    setEditDraftWelcome(htmlToEditablePlain(w));
    setEditBodyKey(resolveFieldKey(row, BODY_FIELD_ALIASES, "body"));
    setEditWelcomeKey(resolveFieldKey(row, WELCOME_FIELD_ALIASES, "welcome_message"));
    setEditModalRow(row);
  }, []);

  const handleModalSave = useCallback(() => {
    if (editModalSaving || !editModalRow) return;
    if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current);
    const snapshotRow = editModalRow;
    const snapshotBody = plainToSimpleHtml(editDraftBody);
    const snapshotWelcome = plainToSimpleHtml(editDraftWelcome);
    const snapshotBodyKey = editBodyKey;
    const snapshotWelcomeKey = editWelcomeKey;
    setEditModalSaving(true);
    saveTimerRef.current = window.setTimeout(() => {
      setRows((prev) =>
        prev.map((r) => {
          const sameRef = r === snapshotRow;
          const idA = getIdentifierValue(r, ID_ALIASES);
          const idB = getIdentifierValue(snapshotRow, ID_ALIASES);
          const sameId =
            idA != null && idB != null && String(idA) === String(idB);
          if (!sameRef && !sameId) return r;
          return {
            ...r,
            [snapshotBodyKey]: snapshotBody,
            [snapshotWelcomeKey]: snapshotWelcome,
          };
        }),
      );
      setEditModalSaving(false);
      setEditModalRow(null);
      setEditDraftBody("");
      setEditDraftWelcome("");
      saveTimerRef.current = null;
    }, SAVE_LOADER_MS);
  }, [
    editModalSaving,
    editModalRow,
    editDraftBody,
    editDraftWelcome,
    editBodyKey,
    editWelcomeKey,
  ]);

  const restColCount = Math.max(columns.length, 1);
  const totalColSpan = 1 + restColCount + 1;

  const renderCell = (row, key) => {
    const raw = row?.[key];
    if (isHtmlColumnKey(key) && typeof raw === "string" && raw.trim()) {
      const html = DOMPurify.sanitize(raw, { USE_PROFILES: { html: true } });
      return (
        <div
          className="text-slate-800 leading-relaxed [&_p]:mb-2.5 [&_p:last-child]:mb-0 [&_strong]:font-semibold [&_b]:font-semibold [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_a]:text-indigo-600 [&_a]:underline"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      );
    }
    return (
      <span className="wrap-break-word text-slate-700 leading-relaxed">{formatCell(raw)}</span>
    );
  };

  return (
    <div className="mx-auto  p-4 sm:p-6 sm:pb-10">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-2xl font-bold text-gray-700">
            Agents category
          </h2>

        </div>
        <button
          type="button"
          onClick={() => loadRows()}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-60"
        >
          <FiRefreshCw className={loading ? "animate-spin" : ""} size={16} />
          Refresh
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl bg-white shadow">
        <table className="w-full min-w-4xl border-collapse text-left text-sm text-neutral-900">
          <thead className="bg-neutral-100">
            <tr>
              <th className="w-28 min-w-28 px-5 py-3.5 pl-6 text-left text-sm font-bold text-neutral-900 sm:pl-7">
                ID
              </th>
              {columns.length === 0 ? (
                <th className="px-5 py-3.5 text-left text-sm font-bold text-neutral-900">Details</th>
              ) : (
                columns.map((key) => (
                  <th
                    key={key}
                    className={`px-5 py-3.5 text-left text-sm font-bold text-neutral-900 ${isNarrowColumnKey(key)
                        ? "w-24 min-w-24 max-w-28 whitespace-nowrap"
                        : isHtmlColumnKey(key)
                          ? "min-w-[20rem] w-[62%] lg:min-w-88"
                          : "min-w-40 max-w-xs"
                      }`}
                  >
                    <span className="capitalize">{key.replace(/_/g, " ")}</span>
                  </th>
                ))
              )}
              <th className="w-14 min-w-14 px-3 py-3.5 pr-5 text-left sm:pr-6">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr className="border-t border-neutral-200 align-top">
                <td colSpan={totalColSpan} className="px-6 py-14 text-center text-neutral-500">
                  Loading…
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr className="border-t border-neutral-200 align-top">
                <td colSpan={totalColSpan} className="px-6 py-14 text-center text-neutral-500">
                  No categories returned.
                </td>
              </tr>
            ) : (
              pageRows.map((row, i) => (
                <tr
                  key={row?.id ?? i}
                  className="border-t border-neutral-200 align-top transition-colors hover:bg-neutral-50/90"
                >
                  <td className="w-28 min-w-28 align-top px-5 py-5 pl-6 sm:pl-7">
                    {renderIdCell(row)}
                  </td>
                  {columns.length === 0 ? (
                    <td className="px-5 py-5 align-top text-neutral-400">—</td>
                  ) : (
                    columns.map((key) => (
                      <td
                        key={key}
                        className={`align-top ${isNarrowColumnKey(key)
                            ? "w-24 min-w-24 max-w-28 whitespace-nowrap px-5 py-5 text-sm font-medium tabular-nums text-neutral-900"
                            : isHtmlColumnKey(key)
                              ? "min-w-[20rem] w-[62%] px-5 py-5 text-[15px] leading-relaxed lg:min-w-88"
                              : "min-w-40 max-w-xs px-5 py-5 text-sm font-medium wrap-break-word text-neutral-900"
                          }`}
                      >
                        {renderCell(row, key)}
                      </td>
                    ))
                  )}
                  <td className="w-14 min-w-14 align-top px-3 py-5 pr-5 sm:pr-6">
                    <button
                      type="button"
                      title="Edit"
                      className="rounded border border-neutral-300 bg-white p-2 text-neutral-600 shadow-sm transition hover:bg-neutral-100"
                      onClick={() => openEditModal(row)}
                      aria-label="Edit row"
                    >
                      <FiEdit className="size-4 shrink-0" aria-hidden />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {!loading && rows.length > pageSize ? (
        <div className="mt-6 flex flex-col gap-3 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
          <div>
            Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, rows.length)} of{" "}
            {rows.length}
          </div>
          <div className="flex flex-wrap items-center gap-1">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="rounded-lg border border-slate-200 px-3 py-1.5 disabled:opacity-50"
            >
              Prev
            </button>
            <span className="px-2 text-xs text-slate-500">
              Page {page} of {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="rounded-lg border border-slate-200 px-3 py-1.5 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      ) : null}

      {editModalRow ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="agents-category-edit-title"
          onClick={(e) => {
            if (e.target === e.currentTarget && !editModalSaving) closeEditModal();
          }}
        >
          <div
            className="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-xl border border-neutral-200 bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="shrink-0 border-b border-neutral-100 p-6 pb-4">
              <h3
                id="agents-category-edit-title"
                className="text-lg font-semibold text-neutral-900"
              >
                Edit category
              </h3>
              <p className="mt-2 text-sm text-neutral-500">
                ID{" "}
                <span className="font-mono font-medium text-neutral-800">
                  {formatCell(getIdentifierValue(editModalRow, ID_ALIASES))}
                </span>
              </p>
            </div>
            <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-6 py-4">
              <div className="min-w-0">
                <label
                  htmlFor="agents-category-edit-body"
                  className="text-xs font-bold uppercase tracking-wide text-neutral-500"
                >
                  Body
                </label>
                <textarea
                  id="agents-category-edit-body"
                  value={editDraftBody}
                  onChange={(e) => setEditDraftBody(e.target.value)}
                  disabled={editModalSaving}
                  rows={10}
                  className="mt-2 w-full resize-y rounded-lg border border-neutral-200 bg-white px-3 py-2.5 font-mono text-sm leading-relaxed text-neutral-900 shadow-inner outline-none focus:border-neutral-400 focus:ring-1 focus:ring-neutral-300 disabled:opacity-60"
                  spellCheck={false}
                />
              </div>
              <div className="min-w-0">
                <label
                  htmlFor="agents-category-edit-welcome"
                  className="text-xs font-bold uppercase tracking-wide text-neutral-500"
                >
                  Welcome message
                </label>
                <textarea
                  id="agents-category-edit-welcome"
                  value={editDraftWelcome}
                  onChange={(e) => setEditDraftWelcome(e.target.value)}
                  disabled={editModalSaving}
                  rows={5}
                  className="mt-2 w-full resize-y rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm leading-relaxed text-neutral-900 shadow-inner outline-none focus:border-neutral-400 focus:ring-1 focus:ring-neutral-300 disabled:opacity-60"
                  spellCheck={false}
                />
              </div>
            </div>
            <div className="shrink-0 flex flex-wrap justify-end gap-2 border-t border-neutral-100 p-6 pt-4">
              <button
                type="button"
                disabled={editModalSaving}
                className="rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50 disabled:opacity-50"
                onClick={closeEditModal}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={editModalSaving}
                className="inline-flex min-w-28 items-center justify-center gap-2 rounded-lg bg-neutral-800 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-900 disabled:opacity-80"
                onClick={handleModalSave}
              >
                {editModalSaving ? (
                  <>
                    <FiRefreshCw className="size-4 animate-spin" aria-hidden />
                    Saving…
                  </>
                ) : (
                  "Save"
                )}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
