import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { getAllTwillioUsers } from "../../hooks/useAuth";
import service from "../../api/axios";

const STATIC_MINUTE = "1";

const normalizeUsers = (res) => {
  if (Array.isArray(res)) return res;
  if (Array.isArray(res?.data)) return res.data;
  if (Array.isArray(res?.data?.data)) return res.data.data;
  return [];
};

export default function DynamicMinutePage() {
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [saving, setSaving] = useState(false);

  const [userId, setUserId] = useState("");
  const [price, setPrice] = useState("");

  const selectedUser = useMemo(() => {
    const uid = String(userId || "");
    return users.find((u) => String(u?.id ?? u?.user_id ?? "") === uid) || null;
  }, [userId, users]);

  useEffect(() => {
    const load = async () => {
      setLoadingUsers(true);
      try {
        const res = await getAllTwillioUsers();
        setUsers(normalizeUsers(res));
      } catch (e) {
        toast.error(e?.message || "Failed to load users");
        setUsers([]);
      } finally {
        setLoadingUsers(false);
      }
    };
    load();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userId) return toast.error("Please select a user");

    const rawPrice = String(price || "").trim();
    const n = Number(rawPrice);
    if (!rawPrice || !Number.isFinite(n) || n <= 0) {
      return toast.error("Please enter a valid price");
    }

    setSaving(true);
    try {
      await service.post("dynamic-minute", {
        minute: STATIC_MINUTE,
        user_id: String(userId),
        price: rawPrice,
      });
      toast.success("Dynamic minute saved");
      setPrice("");
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to save dynamic minute";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="mx-auto max-w-3xl bg-white rounded-2xl shadow p-6">
        <div className="mb-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 border border-indigo-100">
            Admin
          </div>
          <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold text-gray-800">
            Dynamic Minute
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Set per-user pricing (minute is fixed to {STATIC_MINUTE}).
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              User
            </label>
            <select
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="w-full border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              disabled={loadingUsers || saving}
              required
            >
              <option value="">
                {loadingUsers ? "Loading users..." : "-- Select a user --"}
              </option>
              {users.map((u) => {
                const id = u?.id ?? u?.user_id;
                const name = u?.name || "User";
                const email = u?.email || "";
                const contact = u?.contact_no || u?.phone_no || "";
                return (
                  <option key={id} value={id}>
                    {id} — {name}
                    {email ? ` (${email})` : ""}
                    {contact ? ` — ${contact}` : ""}
                  </option>
                );
              })}
            </select>
            {selectedUser && (
              <div className="mt-2 text-xs text-gray-500">
                Selected:{" "}
                <span className="font-semibold text-gray-700">
                  {selectedUser.name || "User"}
                </span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Minute
              </label>
              <input
                value={STATIC_MINUTE}
                disabled
                className="w-full border rounded-xl px-3 py-2 bg-gray-50 text-gray-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                placeholder="Enter price"
                disabled={saving}
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setPrice("")}
              className="px-4 py-2 rounded-xl bg-gray-200 hover:bg-gray-300"
              disabled={saving}
            >
              Clear
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold disabled:opacity-60"
              disabled={saving || loadingUsers}
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

