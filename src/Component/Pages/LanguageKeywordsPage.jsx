import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import service from "../../api/axios";

const extractRows = (payload) => {
  const raw = payload?.data !== undefined ? payload.data : payload;
  if (Array.isArray(raw)) return raw;
  if (Array.isArray(raw?.data)) return raw.data;
  if (Array.isArray(raw?.data?.data)) return raw.data.data;
  return [];
};

export default function LanguageKeywordsPage() {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);
  const [q, setQ] = useState("");
  const [openLang, setOpenLang] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const res = await service.get("language-keywords");
      const list = extractRows(res?.data);
      setRows(Array.isArray(list) ? list : []);
      if (!openLang && Array.isArray(list) && list[0]?.language) {
        setOpenLang(String(list[0].language));
      }
    } catch (e) {
      toast.error(e?.response?.data?.message || e?.message || "Failed to load language keywords");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const term = String(q || "").trim().toLowerCase();
    if (!term) return rows;
    return rows
      .map((r) => {
        const language = String(r?.language || "");
        const keywords = Array.isArray(r?.keywords) ? r.keywords : [];
        const matchLang = language.toLowerCase().includes(term);
        const matchKeywords = keywords.filter((k) => String(k).toLowerCase().includes(term));
        if (!matchLang && matchKeywords.length === 0) return null;
        return { language, keywords: matchLang ? keywords : matchKeywords };
      })
      .filter(Boolean);
  }, [q, rows]);

  return (
    <div className="p-4 sm:p-6">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 border border-indigo-100">
              Admin
            </div>
            <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold text-gray-800">Language</h2>
            <p className="text-sm text-gray-600 mt-1">
              Data from <span className="font-semibold">language-keywords</span>
            </p>
          </div>

          <div className="w-full sm:w-[520px] flex flex-col sm:flex-row gap-2 sm:items-end">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Search (language or keyword)
              </label>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
                placeholder="Search..."
              />
            </div>
            <button
              type="button"
              onClick={load}
              disabled={loading}
              className="px-4 py-2 rounded-xl bg-gray-200 hover:bg-gray-300 text-sm font-semibold disabled:opacity-60"
            >
              {loading ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </div>

        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            Loading…
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            No data found
          </div>
        ) : (
          <div className="grid gap-4">
            {filtered.map((r) => {
              const language = String(r.language || "");
              const keywords = Array.isArray(r.keywords) ? r.keywords : [];
              const isOpen = openLang === language;
              return (
                <div
                  key={language}
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                >
                  <button
                    type="button"
                    onClick={() => setOpenLang((prev) => (prev === language ? "" : language))}
                    className="w-full flex items-center justify-between px-5 py-4 bg-gradient-to-r from-indigo-50 via-fuchsia-50 to-cyan-50"
                  >
                    <div className="text-left">
                      <div className="text-lg font-extrabold text-slate-900">{language}</div>
                      <div className="text-xs text-slate-600">{keywords.length} keywords</div>
                    </div>
                    <div className="text-slate-700 font-bold">{isOpen ? "−" : "+"}</div>
                  </button>

                  {isOpen && (
                    <div className="px-5 py-4">
                      <div className="flex flex-wrap gap-2">
                        {keywords.map((k, idx) => (
                          <span
                            key={`${language}-${idx}`}
                            className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                          >
                            {String(k)}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

