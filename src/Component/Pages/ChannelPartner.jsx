import React, { useState, useEffect, useMemo } from "react";
import {
  getChannelPartners,
  updateChannelPartner,
  getAllTwillioUsers,
  donateChannelPartnerMinute,
  getChannelPartnerDocumentsByUserId,
} from "../../hooks/useAuth";
import { toast } from "react-hot-toast";

export default function ChannelPartner() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");

  const [profileOpen, setProfileOpen] = useState(false);
  const [profileRow, setProfileRow] = useState(null);
  const [profileDocsLoading, setProfileDocsLoading] = useState(false);
  const [profileDocs, setProfileDocs] = useState(null);
  const [profileDocsError, setProfileDocsError] = useState("");

  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone_no: "",
    location: "",
    minute: "",
  });

  const [usersLoading, setUsersLoading] = useState(false);
  const [twilioUsers, setTwilioUsers] = useState([]);

  const [donatingFrom, setDonatingFrom] = useState(null); 
  const [donateUserId, setDonateUserId] = useState("");
  const [donateMinute, setDonateMinute] = useState("");
  const [donateUserSearch, setDonateUserSearch] = useState("");

  const filteredTwilioUsers = useMemo(() => {
    const term = String(donateUserSearch || "").trim().toLowerCase();
    if (!term) return twilioUsers;
    return (Array.isArray(twilioUsers) ? twilioUsers : []).filter((u) => {
      const id = String(u?.id ?? "").toLowerCase();
      const name = String(u?.name ?? "").toLowerCase();
      const email = String(u?.email ?? "").toLowerCase();
      const phone = String(u?.contact_no ?? u?.phone_no ?? "").toLowerCase();
      return (
        id.includes(term) ||
        name.includes(term) ||
        email.includes(term) ||
        phone.includes(term)
      );
    });
  }, [donateUserSearch, twilioUsers]);

  const [page, setPage] = useState(1);
  const pageSize = 10;

  const filteredRows = useMemo(() => {
    const t = String(searchTerm || "").trim().toLowerCase();
    if (!t) return rows;
    return (Array.isArray(rows) ? rows : []).filter((r) => {
      const name = String(r?.name ?? "").toLowerCase();
      const email = String(r?.email ?? "").toLowerCase();
      const phone = String(r?.phone_no ?? "").toLowerCase();
      return name.includes(t) || email.includes(t) || phone.includes(t);
    });
  }, [rows, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const pageRows = filteredRows.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => {
    setPage(1);
  }, [searchTerm]);

  const loadRows = async () => {
    setLoading(true);
    try {
      const list = await getChannelPartners();
      setRows(
        (Array.isArray(list) ? list : []).map((r, i) => {
          const omniMinuteObj = r?.omni_minute ?? r?.omniMinute ?? null;
          const omniMinuteRaw =
            omniMinuteObj && typeof omniMinuteObj === "object"
              ? omniMinuteObj?.minute ??
                omniMinuteObj?.minutes ??
                omniMinuteObj?.remaining_minute ??
                omniMinuteObj?.remainingMinute
              : omniMinuteObj;

          const minuteRaw =
            omniMinuteRaw ??
            r?.minute ??
            r?.minutes ??
            r?.twilio_user_minute?.minute ??
            r?.twilio_user_minute ??
            "";

          return {
            id: r.id ?? i + 1,
            user_id: r?.user_id ?? r?.userId ?? "",
            name: r.name ?? r?.user?.name ?? "",
            email: r.email ?? r?.user?.email ?? "",
            phone_no: r.phone_no ?? r?.user?.contact_no ?? r?.user?.phone_no ?? "",
            location: r?.user?.location ?? r?.location ?? "",
            omni_minute: omniMinuteObj,
            minute: minuteRaw,
          };
        })
      );
    } catch (e) {
      toast.error(e.message || "Failed to fetch ASAs");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRows();
  }, []);

  const formatLocation = (value) => {
    const text = String(value ?? "").trim();
    if (!text || text.toLowerCase() === "null") return "-";
    return text;
  };

  const openEdit = (row) => {
    setEditing(row);
    setForm({
      name: row?.name ?? "",
      email: row?.email ?? "",
      phone_no: row?.phone_no ?? "",
      location: formatLocation(row?.location) === "-" ? "" : String(row?.location ?? "").trim(),
      minute: row?.omni_minute?.minute ?? row?.minute ?? "",
    });
  };

  const closeEdit = () => {
    setEditing(null);
    setForm({ name: "", email: "", phone_no: "", location: "", minute: "" });
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
      location: String(form.location || "").trim(),
      ...(minute !== null ? { minute: minute } : {}),
    };

    setSaving(true);
    try {
      await updateChannelPartner(editing.id, payload);
      toast.success("ASA updated");
      closeEdit();
      await loadRows();
    } catch (e) {
      toast.error(e.message || "Failed to update ASA");
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
    setDonateUserSearch("");
    await ensureUsersLoaded();
  };

  const closeDonate = () => {
    setDonatingFrom(null);
    setDonateUserId("");
    setDonateMinute("");
    setDonateUserSearch("");
  };

  const handleDonate = async () => {
    if (!donatingFrom?.id) return;
    if (!donateUserId) return toast.error("Please select a user");

    const available = Number(donatingFrom?.omni_minute?.minute ?? donatingFrom?.minute ?? 0) || 0;
    const n = Number(String(donateMinute ?? "").trim());
    if (!Number.isFinite(n) || n <= 0) return toast.error("Enter valid donate minutes");

    if (n > available) {
      return toast.error("Donate minutes cannot be greater than ASA minutes");
    }

    setSaving(true);
    try {
      const donorUserIdRaw = String(donatingFrom?.user_id ?? "").trim();
      if (!donorUserIdRaw) {
        toast.error("No profile found");
        return;
      }

      const uidNum = Number(donateUserId);
      const to_user_id = Number.isFinite(uidNum) ? uidNum : donateUserId;
      const donorNum = Number(donorUserIdRaw);
      const user_id = Number.isFinite(donorNum) ? donorNum : donorUserIdRaw;
      await donateChannelPartnerMinute({
        user_id,
        to_user_id,
        minute: n,
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

  const normalizeAssetUrl = (value) => {
    if (!value) return "";
    const s = String(value).trim();
    if (!s) return "";
    if (s.startsWith("http://") || s.startsWith("https://") || s.startsWith("blob:")) return s;
    return s; // backend usually returns full URL; keep as-is for relative too
  };

  const isLikelyPdf = (value) => {
    const s = String(value || "").toLowerCase();
    return s.endsWith(".pdf") || s.includes("application/pdf");
  };

  const openProfile = async (row) => {
    const uid = String(row?.user_id || "").trim();
    if (!uid) return toast.error("No profile found");
    setProfileRow(row);
    setProfileDocs(null);
    setProfileDocsError("");
    setProfileOpen(true);
    setProfileDocsLoading(true);
    try {
      const res = await getChannelPartnerDocumentsByUserId(uid);
      if (res && typeof res === "object" && res.status === false) {
        setProfileDocsError(res?.message || "No documents found");
        setProfileDocs(null);
        return;
      }
      const payload = res?.data?.data ?? res?.data ?? res ?? null;
      const doc = Array.isArray(payload) ? payload[0] : payload;
      setProfileDocs(doc && typeof doc === "object" ? doc : null);
      if (!doc) setProfileDocsError("No documents found");
    } catch (e) {
      setProfileDocsError(e?.message || "Failed to load documents");
      setProfileDocs(null);
    } finally {
      setProfileDocsLoading(false);
    }
  };

  const closeProfile = () => {
    setProfileOpen(false);
    setProfileRow(null);
    setProfileDocs(null);
    setProfileDocsError("");
    setProfileDocsLoading(false);
  };

  return (
    <div className="p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col gap-3 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold text-gray-700">ASAs</h2>
        <div className="w-full sm:w-[360px]">
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, email, phone..."
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl shadow">
        <table className="min-w-full bg-white text-sm">
          <thead className="bg-gray-100 text-left text-gray-600">
            <tr>
              <th className="px-4 py-2">Sr No</th>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Email</th>
              <th className="px-4 py-2">Location</th>
              <th className="px-4 py-2">Phone No</th>
              <th className="px-4 py-2">Minute</th>
              <th className="px-4 py-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="text-center py-6">
                  Loading…
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-6">
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
                  <td className="px-4 py-2">{formatLocation(r.location)}</td>
                  <td className="px-4 py-2">{r.phone_no}</td>
                  <td className="px-4 py-2">
                    {(() => {
                      const m = r?.omni_minute?.minute ?? r?.minute;
                      return m === "" || m === null || m === undefined ? "-" : m;
                    })()}
                  </td>
                  <td className="px-4 py-2">
                    <button
                      type="button"
                      onClick={() => openProfile(r)}
                      className="px-3 py-1 rounded bg-slate-700 text-white hover:bg-slate-800"
                    >
                      View Profile
                    </button>
                    <button
                      type="button"
                      onClick={() => openEdit(r)}
                      className="ml-2 px-3 py-1 rounded bg-indigo-600 text-white hover:bg-indigo-700"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => openDonate(r)}
                      className="ml-2 px-3 py-1 rounded bg-emerald-600 text-white hover:bg-emerald-700"
                    >
                      Sell Minutes
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* View Profile Modal */}
      {profileOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-4">
          <div className="w-full max-w-3xl rounded-2xl bg-white shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-3 px-5 py-4 border-b">
              <div className="min-w-0">
                <div className="text-lg font-semibold text-gray-800">Channel Partner Profile</div>
                <div className="mt-1 text-sm text-gray-600">
                  {profileRow?.name || "-"}{" "}
                  {profileRow?.email ? <span className="text-gray-500">({profileRow.email})</span> : null}
                </div>
              </div>
              <button
                type="button"
                onClick={closeProfile}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="px-5 py-5 space-y-5">
              {profileDocsLoading ? (
                <div className="py-10 text-center text-gray-600">Loading…</div>
              ) : profileDocsError ? (
                <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                  {profileDocsError}
                </div>
              ) : null}

              {profileDocs ? (
                <>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="rounded-xl border border-slate-200 p-4">
                      <div className="text-xs font-semibold uppercase text-slate-500">Aadhar Number</div>
                      <div className="mt-1 text-sm text-slate-800">
                        {profileDocs?.aadhar_number || "-"}
                      </div>
                    </div>
                    <div className="rounded-xl border border-slate-200 p-4">
                      <div className="text-xs font-semibold uppercase text-slate-500">PAN Number</div>
                      <div className="mt-1 text-sm text-slate-800">
                        {profileDocs?.pan_number || "-"}
                      </div>
                    </div>
                    <div className="rounded-xl border border-slate-200 p-4">
                      <div className="text-xs font-semibold uppercase text-slate-500">GST Number</div>
                      <div className="mt-1 text-sm text-slate-800">
                        {profileDocs?.gst_number || "-"}
                      </div>
                    </div>
                    <div className="rounded-xl border border-slate-200 p-4">
                      <div className="text-xs font-semibold uppercase text-slate-500">Bank</div>
                      <div className="mt-1 text-sm text-slate-800 space-y-1">
                        <div>AC No: {profileDocs?.bank_account_number || profileDocs?.bank_ac_no || "-"}</div>
                        <div>AC Name: {profileDocs?.bank_account_name || profileDocs?.bank_ac_name || "-"}</div>
                        <div>
                          Type:{" "}
                          {profileDocs?.bank_account_type ||
                            profileDocs?.account_type ||
                            profileDocs?.type_of_account ||
                            "-"}
                        </div>
                        <div>Bank: {profileDocs?.bank_name || "-"}</div>
                        <div>IFSC: {profileDocs?.bank_ifsc || profileDocs?.ifsc || "-"}</div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    {[
                      {
                        label: "Aadhar Image",
                        key: "aadhar_image",
                        value: profileDocs?.aadhar_image,
                      },
                      {
                        label: "PAN Image",
                        key: "pan_image",
                        value: profileDocs?.pan_image,
                      },
                      {
                        label: "GST Certificate",
                        key: "gst_certificate_image",
                        value: profileDocs?.gst_certificate_image || profileDocs?.gst_image,
                      },
                      {
                        label: "Bank Detail Image",
                        key: "bank_detail_image",
                        value: profileDocs?.bank_detail_image || profileDocs?.bank_image,
                      },
                    ].map((it) => {
                      const url = normalizeAssetUrl(it.value);
                      if (!url) {
                        return (
                          <div key={it.key} className="rounded-xl border border-slate-200 p-4">
                            <div className="text-sm font-semibold text-slate-900">{it.label}</div>
                            <div className="mt-2 text-sm text-slate-600">-</div>
                          </div>
                        );
                      }

                      const pdf = isLikelyPdf(url);
                      return (
                        <div key={it.key} className="rounded-xl border border-slate-200 p-4">
                          <div className="flex items-center justify-between gap-3">
                            <div className="text-sm font-semibold text-slate-900">{it.label}</div>
                            <a
                              href={url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-sm font-semibold text-indigo-600 hover:text-indigo-700"
                            >
                              Open
                            </a>
                          </div>
                          <div className="mt-3">
                            {pdf ? (
                              <div className="text-sm text-slate-700">
                                PDF uploaded. Click <span className="font-semibold">Open</span>.
                              </div>
                            ) : (
                              <img
                                src={url}
                                alt={it.label}
                                className="w-full max-h-[320px] object-contain rounded-lg bg-slate-50"
                                loading="lazy"
                              />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <div className="text-lg font-semibold text-gray-800">Update ASA</div>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input
                  value={form.location}
                  onChange={(e) => onChange("location", e.target.value)}
                  className="w-full border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="City or location"
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
                Available minutes (ASA):{" "}
                <span className="font-semibold">
                  {Number(donatingFrom?.omni_minute?.minute ?? donatingFrom?.minute ?? 0) || 0}
                </span>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select User</label>
                <input
                  value={donateUserSearch}
                  onChange={(e) => setDonateUserSearch(e.target.value)}
                  placeholder="Search user by id, name, email, phone..."
                  className="w-full border rounded-xl px-3 py-2 mb-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  disabled={saving || usersLoading}
                />
                <select
                  value={donateUserId}
                  onChange={(e) => setDonateUserId(e.target.value)}
                  className="w-full border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  disabled={saving || usersLoading}
                >
                  <option value="">{usersLoading ? "Loading users..." : "Select user"}</option>
                  {filteredTwilioUsers.map((u) => (
                    <option key={u.id} value={u.id}>
                      {`${u.id ?? ""} — ${u.name || "User"}${u.email ? ` (${u.email})` : ""}${
                        u.contact_no || u.phone_no ? ` — ${u.contact_no || u.phone_no}` : ""
                      }`}
                    </option>
                  ))}
                </select>
                <div className="mt-1 flex items-center justify-between text-xs text-gray-500">
                  <span>Showing {filteredTwilioUsers.length} user(s)</span>
                  {donateUserSearch.trim() && (
                    <button
                      type="button"
                      onClick={() => setDonateUserSearch("")}
                      className="px-2 py-1 rounded bg-gray-200 hover:bg-gray-300"
                      disabled={saving || usersLoading}
                    >
                      Clear search
                    </button>
                  )}
                </div>
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
                Note: Donate minutes cannot be greater than ASA minutes.
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
