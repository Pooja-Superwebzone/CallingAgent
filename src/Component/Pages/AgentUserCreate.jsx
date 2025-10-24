import React, { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";

import { getAllUsers, createAgent } from "../../hooks/useAuth";

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
  items,
  loading,
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
    // if selectedId changes externally clear query
    if (selectedId && selectedLabel) setQuery("");
  }, [selectedId, selectedLabel]);

  return (
    <div className="relative" ref={ref}>
      <label className="block text-sm font-medium">{label}</label>
      <div className="mt-1 relative">
        <div
          className="w-full border rounded px-3 py-2 flex items-center justify-between cursor-text"
          onClick={() => {
            setOpen((o) => !o);
          }}
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
                    <span>{it.label}</span>
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

export default function AgentUserCreate() {
  const [userId, setUserId] = useState("");
  const [userLabel, setUserLabel] = useState("");
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  const [name, setName] = useState("");
  const [welcomeMessage, setWelcomeMessage] = useState("");
  const [bodyHtml, setBodyHtml] = useState("");
  const [saving, setSaving] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const loadUsers = async () => {
      setLoadingUsers(true);
      try {
        const list = await getAllUsers(); // 🔹 API call: "all-users"
        const normalized = (Array.isArray(list) ? list : []).map((u) => ({
          id: u.id ?? u.user_id ?? "",
          label: u.name ?? u.username ?? u.email ?? `User ${u.id}`,
        }));
        setUsers(normalized);
      } catch (err) {
        toast.error(err?.message || "Failed to load users");
        setUsers([]);
      } finally {
        setLoadingUsers(false);
      }
    };
    loadUsers();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!userId) {
      toast.error("User is required");
      return;
    }
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        user_id: userId,
        name,
        welcome_message: welcomeMessage,
        body: bodyHtml,
      };
      await createAgent(payload);
      toast.success("Agent User created successfully");
      navigate("/Agent-user");
    } catch (err) {
      toast.error(err?.message || "Failed to save Agent User");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full bg-white" style={{ minHeight: '100vh' }}>
      <div className="p-4 sm:p-6 w-full">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-700">Create Agent User</h2>
          <button
            onClick={() => navigate("/Agent-user")}
            className="px-3 py-1 border rounded"
            disabled={saving}
          >
            Back
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-6 w-full">
          <form onSubmit={handleSave} className="space-y-4">
            <SearchableDropdown
              label="User"
              items={users}
              loading={loadingUsers}
              placeholder="Search user..."
              selectedId={userId}
              selectedLabel={userLabel}
              onSelect={(it) => {
                setUserId(it.id);
                setUserLabel(it.label);
              }}
              onClear={() => {
                setUserId("");
                setUserLabel("");
              }}
            />

            {/* Name */}
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

            {/* Welcome Message */}
            <div>
              <label className="block text-sm font-medium">Welcome Message</label>
              <input
                className="mt-1 w-full border rounded px-3 py-2"
                value={welcomeMessage}
                onChange={(e) => setWelcomeMessage(e.target.value)}
                placeholder="Write a message"
              />
            </div>

            {/* Body */}
            <div>
              <label className="block text-sm font-medium">Body</label>
              <CKEditor
                editor={ClassicEditor}
                data={bodyHtml}
                onChange={(event, editor) => setBodyHtml(editor.getData())}
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
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-4">
              <button
                type="button"
                className="px-4 py-2 border rounded-md hover:bg-gray-100"
                onClick={() => navigate("/Agent-user")}
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
