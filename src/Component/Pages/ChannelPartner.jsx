import React, { useState, useEffect } from "react";
import {
  getChannelPartners,
  updateChannelPartner,
  getAllTwillioUsers,
  donateChannelPartnerMinute,
} from "../../hooks/useAuth";
import { toast } from "react-hot-toast";

export default function ChannelPartner() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [editing, setEditing] = useState(null); // currently editing row
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone_no: "",
    minute: "",
  });

  const [usersLoading, setUsersLoading] = useState(false);
  const [twilioUsers, setTwilioUsers] = useState([]);

  const [donatingFrom, setDonatingFrom] = useState(null); // channel partner row
  const [donateUserId, setDonateUserId] = useState("");
  const [donateMinute, setDonateMinute] = useState("");

  const [page, setPage] = useState(1);
  const pageSize = 10;

  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  const pageRows = rows.slice((page - 1) * pageSize, page * pageSize);

  const loadRows = async () => {
    setLoading(true);
    try {
      const list = await getChannelPartners();
      setRows(
        (Array.isArray(list) ? list : []).map((r, i) => ({
          id: r.id ?? i + 1,
          name: r.name ?? "",
          email: r.email ?? "",
          phone_no: r.phone_no ?? "",
          minute:
            r.minute ??
            r.minutes ??
            r?.twilio_user_minute?.minute ??
            r?.twilio_user_minute ??
            "",
        }))
      );
    } catch (e) {
      toast.error(e.message || "Failed to fetch channel partners");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRows();
  }, []);

  const openEdit = (row) => {
    setEditing(row);
    setForm({
      name: row?.name ?? "",
      email: row?.email ?? "",
      phone_no: row?.phone_no ?? "",
      minute: row?.minute ?? "",
    });
  };

  const closeEdit = () => {
    setEditing(null);
    setForm({ name: "", email: "", phone_no: "", minute: "" });
  };

  const onChange = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleUpdate = async () => {
    if (!editing?.id) return;

    const name = String(form.name || "").trim();
    const email = String(form.email || "").trim();
    const phone_no = String(form.phone_no || "").trim();
    const minuteRaw = String(form.minute ?? "").trim();

    if (!name) return toast.error("Name is required");
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return toast.error("Enter a valid email");
    if (!phone_no) return toast.error("Phone number is required");

    let minute = null;
    if (minuteRaw !== "") {
      const n = Number(minuteRaw);
      if (!Number.isFinite(n) || n < 0) return toast.error("Minute must be a valid number");
      minute = n;
    }

    const payload = {
      name,
      email,
      phone_no,
      ...(minute !== null ? { minute } : {}),
    };

    setSaving(true);
    try {
      await updateChannelPartner(editing.id, payload);
      toast.success("Channel partner updated");
      closeEdit();
      await loadRows();
    } catch (e) {
      toast.error(e.message || "Failed to update channel partner");
    } finally {
      setSaving(false);
    }
  };

  const ensureUsersLoaded = async () => {
    if (twilioUsers.length > 0) return;
    setUsersLoading(true);
    try {
      const res = await getAllTwillioUsers();
      const list = Array.isArray(res) ? res : res?.data || res?.data?.data || [];
      setTwilioUsers(Array.isArray(list) ? list : []);
    } catch (e) {
      toast.error(e.message || "Failed to load users");
      setTwilioUsers([]);
    } finally {
      setUsersLoading(false);
    }
  };

  const openDonate = async (row) => {
    setDonatingFrom(row);
    setDonateUserId("");
    setDonateMinute("");
    await ensureUsersLoaded();
  };

  const closeDonate = () => {
    setDonatingFrom(null);
    setDonateUserId("");
    setDonateMinute("");
  };

  const handleDonate = async () => {
    if (!donatingFrom?.id) return;
    if (!donateUserId) return toast.error("Please select a user");

    const available = Number(donatingFrom?.minute ?? 0) || 0;
    const n = Number(String(donateMinute ?? "").trim());
    if (!Number.isFinite(n) || n <= 0) return toast.error("Enter valid donate minutes");

    if (n > available) {
      return toast.error("Donate minutes cannot be greater than channel partner minutes");
    }

    setSaving(true);
    try {
      const uidNum = Number(donateUserId);
      const user_id = Number.isFinite(uidNum) ? uidNum : donateUserId;
      await donateChannelPartnerMinute({
        channel_partner_id: donatingFrom.id,
        user_id,
        minute: n,
        channel_partner_name: donatingFrom?.name || "",
      });
      toast.success("Minutes donated successfully");
      closeDonate();
      await loadRows();
    } catch (e) {
      toast.error(e.message || "Failed to donate minutes");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 sm:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-700">Channel Partners</h2>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl shadow">
        <table className="min-w-full bg-white text-sm">
          <thead className="bg-gray-100 text-left text-gray-600">
            <tr>
              <th className="px-4 py-2">Sr No</th>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Email</th>
              <th className="px-4 py-2">Phone No</th>
              <th className="px-4 py-2">Minute</th>
              <th className="px-4 py-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center py-6">
                  Loading…
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-6">
                  No partners found
                </td>
              </tr>
            ) : (
              pageRows.map((r, i) => (
                <tr
                  key={r.id}
                  className="border-b hover:bg-gray-50 text-gray-700"
                >
                  <td className="px-4 py-2">
                    {(page - 1) * pageSize + i + 1}
                  </td>
                  <td className="px-4 py-2">{r.name}</td>
                  <td className="px-4 py-2">{r.email}</td>
                  <td className="px-4 py-2">{r.phone_no}</td>
                  <td className="px-4 py-2">
                    {r.minute === "" || r.minute === null || r.minute === undefined ? "-" : r.minute}
                  </td>
                  <td className="px-4 py-2">
                    <button
                      type="button"
                      onClick={() => openEdit(r)}
                      className="px-3 py-1 rounded bg-indigo-600 text-white hover:bg-indigo-700"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => openDonate(r)}
                      className="ml-2 px-3 py-1 rounded bg-emerald-600 text-white hover:bg-emerald-700"
                    >
                      Donate Minutes
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <div className="text-lg font-semibold text-gray-800">Update Channel Partner</div>
              <button
                type="button"
                onClick={closeEdit}
                className="text-gray-500 hover:text-gray-700"
                disabled={saving}
              >
                ✕
              </button>
            </div>

            <div className="px-5 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  value={form.name}
                  onChange={(e) => onChange("name", e.target.value)}
                  className="w-full border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Name"
                  disabled={saving}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => onChange("email", e.target.value)}
                  className="w-full border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Email"
                  disabled={saving}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone No</label>
                <input
                  value={form.phone_no}
                  onChange={(e) => onChange("phone_no", e.target.value)}
                  className="w-full border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Phone number"
                  disabled={saving}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Minute</label>
                <input
                  type="number"
                  min="0"
                  value={form.minute}
                  onChange={(e) => onChange("minute", e.target.value)}
                  className="w-full border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Minutes"
                  disabled={saving}
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 px-5 py-4 border-t">
              <button
                type="button"
                onClick={closeEdit}
                className="px-4 py-2 rounded-xl border hover:bg-gray-50"
                disabled={saving}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUpdate}
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60"
                disabled={saving}
              >
                {saving ? "Updating..." : "Update"}
              </button>
            </div>
          </div>
        </div>
      )}



      {/* Donate Minutes Modal */}
      {donatingFrom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <div className="text-lg font-semibold text-gray-800">Donate Minutes</div>
              <button
                type="button"
                onClick={closeDonate}
                className="text-gray-500 hover:text-gray-700"
                disabled={saving}
              >
                ✕
              </button>
            </div>

            <div className="px-5 py-4 space-y-4">
              <div className="text-sm text-gray-700">
                Available minutes (channel partner):{" "}
                <span className="font-semibold">{Number(donatingFrom?.minute ?? 0) || 0}</span>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select User</label>
                <select
                  value={donateUserId}
                  onChange={(e) => setDonateUserId(e.target.value)}
                  className="w-full border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  disabled={saving || usersLoading}
                >
                  <option value="">{usersLoading ? "Loading users..." : "Select user"}</option>
                  {twilioUsers.map((u) => (
                    <option key={u.id} value={u.id}>
                      {(u.name || "User") + (u.email ? ` (${u.email})` : "")}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Minute</label>
                <input
                  type="number"
                  min="1"
                  value={donateMinute}
                  onChange={(e) => setDonateMinute(e.target.value)}
                  className="w-full border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Enter minutes to donate"
                  disabled={saving}
                />
              </div>

              <div className="text-xs text-gray-500">
                Note: Donate minutes cannot be greater than channel partner minutes.
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 px-5 py-4 border-t">
              <button
                type="button"
                onClick={closeDonate}
                className="px-4 py-2 rounded-xl border hover:bg-gray-50"
                disabled={saving}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDonate}
                className="px-4 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60"
                disabled={saving || usersLoading}
              >
                {saving ? "Donating..." : "Donate"}
              </button>
            </div>
          </div>
        </div>
      )}

      {rows.length > pageSize && (
        <div className="flex items-center justify-between mt-4 text-sm text-gray-600">
          <div>
            Showing {(page - 1) * pageSize + 1}–
            {Math.min(page * pageSize, rows.length)} of {rows.length}
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
                className={`px-3 py-1 border rounded ${
                  page === idx + 1 ? "bg-indigo-600 text-white" : ""
                }`}
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
    </div>
  );
}
