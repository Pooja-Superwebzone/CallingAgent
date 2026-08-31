import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import {
  fetchSalespersonVoiceAgents,
  fetchVoiceAgentById,
  ensureHtmlBody,
  getSalespersonAgentsError,
  getVoiceAgentBody,
  updateVoiceAgent,
} from "../../../api/salespersonAgentsApi";

export default function BdeAgentEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [keyword, setKeyword] = useState("");
  const [language, setLanguage] = useState("");
  const [welcomeMessage, setWelcomeMessage] = useState("");
  const [goodbyeMessage, setGoodbyeMessage] = useState("");
  const [context, setContext] = useState("");
  const [bodyHtml, setBodyHtml] = useState("<p></p>");
  const [isActive, setIsActive] = useState(true);
  const [salespersonLabel, setSalespersonLabel] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadAgent = async () => {
      setLoading(true);
      try {
        let agent = null;
        try {
          const res = await fetchVoiceAgentById(id);
          agent = res.data;
        } catch {
          const listRes = await fetchSalespersonVoiceAgents({ include_inactive: true });
          const list = Array.isArray(listRes.data) ? listRes.data : [];
          agent = list.find((a) => String(a.id) === String(id)) || null;
        }

        if (cancelled) return;
        if (!agent) {
          toast.error("Agent not found");
          navigate("/bde/agents", { replace: true });
          return;
        }

        setName(agent.name || "");
        setKeyword(agent.keyword || "");
        setLanguage(agent.language || "");
        setWelcomeMessage(
          agent.welcome_message ?? agent.opening_message ?? ""
        );
        setGoodbyeMessage(agent.goodbye_message || "");
        setContext(agent.context || "");
        setBodyHtml(ensureHtmlBody(agent.body ?? getVoiceAgentBody(agent)));
        setIsActive(agent.is_active !== false && agent.is_active !== 0);

        const sp = agent.salesperson || {};
        setSalespersonLabel(
          [sp.name, sp.email].filter(Boolean).join(" · ") || ""
        );
      } catch (err) {
        if (!cancelled) {
          toast.error(getSalespersonAgentsError(err, "Failed to load agent"));
          navigate("/bde/agents", { replace: true });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadAgent();
    return () => {
      cancelled = true;
    };
  }, [id, navigate]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }

    setSaving(true);
    try {
      const res = await updateVoiceAgent(id, {
        name: name.trim(),
        welcome_message: welcomeMessage,
        body: bodyHtml,
      });
      toast.success(res.message || "Agent updated successfully");
      navigate("/bde/agents");
    } catch (err) {
      toast.error(getSalespersonAgentsError(err, "Failed to update agent"));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 px-4 py-6">
        <p className="text-slate-500">Loading agent…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 px-3 py-4 sm:px-4 sm:py-6">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-700">Edit Agent</h2>
            {salespersonLabel && (
              <p className="mt-1 text-sm text-slate-500">Salesperson: {salespersonLabel}</p>
            )}
          </div>
          <button
            type="button"
            onClick={() => navigate("/bde/agents")}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            disabled={saving}
          >
            Back
          </button>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">Name</label>
              <input
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-700">Keyword</label>
                <input
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-mono text-slate-600"
                  value={keyword}
                  readOnly
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Language</label>
                <input
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600"
                  value={language}
                  readOnly
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Welcome message</label>
              <textarea
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm min-h-[100px]"
                value={welcomeMessage}
                onChange={(e) => setWelcomeMessage(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Goodbye message</label>
              <textarea
                className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm min-h-[80px] text-slate-600"
                value={goodbyeMessage}
                readOnly
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Context</label>
              <textarea
                className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm min-h-[120px] text-slate-600"
                value={context}
                readOnly
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Body</label>
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

            <label className="inline-flex items-center gap-2 text-sm text-slate-500 cursor-default">
              <input
                type="checkbox"
                checked={isActive}
                readOnly
                disabled
                className="rounded border-slate-300"
              />
              Active (voice agent #{id})
            </label>

            <div className="flex justify-end gap-2 pt-4">
              <button
                type="button"
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold hover:bg-slate-50"
                onClick={() => navigate("/bde/agents")}
                disabled={saving}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
                disabled={saving}
              >
                {saving ? "Saving…" : "Update"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
