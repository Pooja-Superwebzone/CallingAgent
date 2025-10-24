// src/pages/AgentCreatePage.jsx
import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";

import {
  createAgent,
} from "../../hooks/useAuth";

export default function AgentCreatePage() {
  const [name, setName] = useState("");
  const [welcomeMessage, setWelcomeMessage] = useState("");
  const [bodyHtml, setBodyHtml] = useState("<p></p>");
  const [saving, setSaving] = useState(false);

  const navigate = useNavigate();

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
      await createAgent(payload);
      toast.success("Agent created successfully");
      
      navigate("/agents");
    } catch (err) {
      toast.error(err?.message || "Failed to save agent");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-700">Create Agent</h2>
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
            <label className="block text-sm font-medium">Body</label>
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
            //  className="px-4 py-2 border rounded"
              className="px-4 py-2 border rounded-md hover:bg-gray-100"

              onClick={() => navigate("/agents_page")}
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
             // className="px-4 py-2 bg-indigo-600 text-white rounded"
               className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              disabled={saving}
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
