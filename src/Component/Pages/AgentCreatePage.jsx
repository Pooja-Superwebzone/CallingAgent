// src/pages/AgentCreatePage.jsx
import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";

import { createAgent, getAgents, updateAgent } from "../../hooks/useAuth";

export default function AgentCreatePage() {
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [name, setName] = useState("");
  const [welcomeMessage, setWelcomeMessage] = useState("");
  const [bodyHtml, setBodyHtml] = useState("<p></p>");
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (!isEdit) return;

    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const list = await getAgents();
        const agent = (Array.isArray(list) ? list : []).find(
          (a) =>
            String(a.agent_id ?? a.agentId ?? "") === String(id) ||
            String(a.id ?? "") === String(id)
        );
        if (cancelled) return;
        if (!agent) {
          toast.error("Agent not found");
          navigate("/agents_page");
          return;
        }
        setName(agent?.name ?? "");
        setWelcomeMessage(agent?.welcome_message ?? agent?.welcomeMessage ?? "");
        setBodyHtml(agent?.body ?? "<p></p>");
      } catch (err) {
        if (!cancelled) {
          toast.error(err?.message || "Failed to load agent");
          navigate("/agents_page");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id, isEdit, navigate]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name?.trim()) {
      toast.error("Name is required");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name,
        welcome_message: welcomeMessage,
        body: bodyHtml,
      };
      if (isEdit) {
        await updateAgent(id, payload);
        toast.success("Agent updated successfully");
      } else {
        await createAgent(payload);
        toast.success("Agent created successfully");
      }
      navigate("/agents_page");
    } catch (err) {
      toast.error(err?.message || `Failed to ${isEdit ? "update" : "save"} agent`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-6 max-w-3xl mx-auto">
        <p className="text-gray-500">Loading agent…</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-700">
          {isEdit ? "Edit Agent" : "Create Agent"}
        </h2>
        <button
          onClick={() => navigate("/agents_page")}
          className="px-3 py-1 border rounded"
          disabled={saving}
        >
          Back
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Name</label>
            <input
              className="mt-1 w-full border rounded px-3 py-2"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter a Name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Welcome Message</label>
            <input
              className="mt-1 w-full border rounded px-3 py-2"
              value={welcomeMessage}
              onChange={(e) => setWelcomeMessage(e.target.value)}
              placeholder="Write a message"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">FAQ</label>
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

          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              className="px-4 py-2 border rounded-md hover:bg-gray-100"
              onClick={() => navigate("/agents_page")}
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              disabled={saving}
            >
              {saving ? "Saving..." : isEdit ? "Update" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
