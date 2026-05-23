import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import service from "../../api/axios";
import { signupTwillioUser } from "../../hooks/useAuth";

const extractRows = (payload) => {
  const raw = payload?.data !== undefined ? payload.data : payload;
  if (Array.isArray(raw)) return raw;
  if (Array.isArray(raw?.data)) return raw.data;
  if (Array.isArray(raw?.data?.data)) return raw.data.data;
  return [];
};

export default function AiCertificateAdminPage() {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);
  const [q, setQ] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createForm, setCreateForm] = useState({
    full_name: "",
    email: "",
    mobile: "",
    meeting_date: "",
    meeting_time: "8 AM",
    payment_status: 0,
  });

  const formatMeetingDate = (value) => {
    if (!value) return "-";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return String(value);
    // meeting_date comes like 1991-06-26T18:30:00Z (midnight IST). Display in IST.
    return new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      timeZone: "Asia/Kolkata",
    }).format(d);
  };

  const formatIsoToLocal = (value) => {
    if (!value) return "-";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return String(value);
    return new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(d);
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await service.get("ai-training-booking");
        const list = extractRows(res?.data);
        setRows(Array.isArray(list) ? list : []);
      } catch (e) {
        toast.error(e?.response?.data?.message || e?.message || "Failed to load bookings");
        setRows([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const reload = async () => {
    setLoading(true);
    try {
      const res = await service.get("ai-training-booking");
      const list = extractRows(res?.data);
      setRows(Array.isArray(list) ? list : []);
    } catch (e) {
      toast.error(e?.response?.data?.message || e?.message || "Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setCreateForm({
      full_name: "",
      email: "",
      mobile: "",
      meeting_date: "",
      meeting_time: "8 AM",
      payment_status: 0,
    });
    setShowCreate(true);
  };

  const closeCreate = () => {
    if (creating) return;
    setShowCreate(false);
  };

  const submitCreate = async (e) => {
    e.preventDefault();
    const full_name = String(createForm.full_name || "").trim();
    const email = String(createForm.email || "").trim();
    const mobile = String(createForm.mobile || "").trim();
    const meeting_date = String(createForm.meeting_date || "").trim(); // YYYY-MM-DD
    const meeting_time = String(createForm.meeting_time || "").trim();
    const payment_status = Number(createForm.payment_status) ? 1 : 0;

    if (!full_name) return toast.error("Full name is required");
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return toast.error("Valid email is required");
    if (!mobile) return toast.error("Mobile is required");
    if (!meeting_date) return toast.error("Meeting date is required");
    if (!meeting_time) return toast.error("Meeting time is required");

    setCreating(true);
    try {
      // Signup first (required before booking). If user already exists, continue.
      try {
        await signupTwillioUser({
          name: full_name,
          email,
          contact_no: mobile,
          password: "12345678",
          confirmPassword: "12345678",
          minute: "10",
          role: "admin",
        });
      } catch (signupErr) {
        const msg = String(
          signupErr?.message || signupErr?.response?.data?.message || ""
        ).toLowerCase();
        // allow "already exists" cases to proceed
        if (msg && (msg.includes("exist") || msg.includes("already"))) {
          // proceed
        } else {
          toast.error("Signup failed, creating booking anyway.");
        }
      }

      await service.post("ai-training-booking", {
        full_name,
        email,
        mobile,
        meeting_date,
        meeting_time,
        payment_status,
      });
      toast.success("Booking created");
      setShowCreate(false);
      await reload();
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || "Failed to create booking");
    } finally {
      setCreating(false);
    }
  };

  const filtered = useMemo(() => {
    const term = String(q || "").trim().toLowerCase();
    if (!term) return rows;
    return rows.filter((r) => {
      const name = String(r?.full_name ?? r?.name ?? r?.fullName ?? "").toLowerCase();
      const email = String(r?.email ?? r?.user_email ?? r?.customer_email ?? "").toLowerCase();
      const mobile = String(r?.mobile ?? r?.contact_no ?? r?.phone_no ?? "");
      const paymentStatus = String(r?.payment_status ?? r?.status ?? "").toLowerCase();
      const meetingDate = String(r?.meeting_date ?? r?.meetingDate ?? "");
      const meetingTime = String(r?.meeting_time ?? r?.meetingTime ?? "");
      return (
        name.includes(term) ||
        email.includes(term) ||
        mobile.includes(term) ||
        paymentStatus.includes(term) ||
        meetingDate.toLowerCase().includes(term) ||
        meetingTime.toLowerCase().includes(term)
      );
    });
  }, [q, rows]);

  return (
    <div className="p-4 sm:p-6">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 border border-indigo-100">
              Admin
            </div>
            <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold text-gray-800">
              AI Certificate
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Data from <span className="font-semibold">ai-training-booking</span>
            </p>
          </div>

          <div className="w-full sm:w-[520px] flex flex-col sm:flex-row gap-2 sm:items-end">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Search (name / email / mobile / status / meeting)
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
              onClick={reload}
              disabled={loading}
              className="px-4 py-2 rounded-xl bg-gray-200 hover:bg-gray-300 text-sm font-semibold disabled:opacity-60"
            >
              {loading ? "Refreshing..." : "Refresh"}
            </button>
            <button
              type="button"
              onClick={openCreate}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold"
            >
              Create Booking
            </button>
          </div>
        </div>

        <div className="w-full overflow-x-auto rounded-2xl shadow bg-white">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 text-left text-gray-600">
              <tr>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Full Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Mobile</th>
                <th className="px-4 py-3">Meeting Date</th>
                <th className="px-4 py-3">Meeting Time</th>
                <th className="px-4 py-3">Payment Status</th>
                <th className="px-4 py-3">Created</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td className="px-4 py-6 text-center" colSpan={8}>
                    Loading…
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td className="px-4 py-6 text-center" colSpan={8}>
                    No records found
                  </td>
                </tr>
              ) : (
                filtered.map((r, idx) => {
                  const id = r?.id ?? r?.booking_id ?? idx + 1;
                  const fullName = r?.full_name ?? r?.name ?? r?.fullName ?? "-";
                  const email = r?.email ?? r?.user_email ?? r?.customer_email ?? "-";
                  const mobile = r?.mobile ?? r?.contact_no ?? r?.phone_no ?? "-";
                  const meetingDate = formatMeetingDate(r?.meeting_date);
                  const meetingTime = r?.meeting_time ?? "-";
                  const ps = r?.payment_status;
                  const paymentStatus =
                    ps === 1 || ps === "1" || ps === true
                      ? "Paid"
                      : ps === 0 || ps === "0" || ps === false
                        ? "Unpaid"
                        : String(ps ?? "-");
                  const created = formatIsoToLocal(r?.created_at ?? r?.createdAt);

                  return (
                    <tr key={String(id)} className="border-b last:border-b-0 hover:bg-gray-50 text-gray-700">
                      <td className="px-4 py-3">{id}</td>
                      <td className="px-4 py-3">{fullName}</td>
                      <td className="px-4 py-3">{email}</td>
                      <td className="px-4 py-3">{mobile}</td>
                      <td className="px-4 py-3">{meetingDate}</td>
                      <td className="px-4 py-3">{meetingTime}</td>
                      <td className="px-4 py-3">{paymentStatus}</td>
                      <td className="px-4 py-3">{created}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {showCreate && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
            onClick={(e) => e.target === e.currentTarget && closeCreate()}
          >
            <div className="w-full max-w-xl rounded-2xl bg-white shadow-xl">
              <div className="flex items-center justify-between px-5 py-4 border-b">
                <div className="text-lg font-semibold text-gray-800">Create Booking</div>
                <button
                  type="button"
                  onClick={closeCreate}
                  className="text-gray-500 hover:text-gray-700"
                  disabled={creating}
                >
                  ✕
                </button>
              </div>

              <form onSubmit={submitCreate} className="px-5 py-4 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input
                      value={createForm.full_name}
                      onChange={(e) => setCreateForm((p) => ({ ...p, full_name: e.target.value }))}
                      className="w-full border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                      disabled={creating}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={createForm.email}
                      onChange={(e) => setCreateForm((p) => ({ ...p, email: e.target.value }))}
                      className="w-full border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                      disabled={creating}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mobile</label>
                    <input
                      value={createForm.mobile}
                      onChange={(e) => setCreateForm((p) => ({ ...p, mobile: e.target.value }))}
                      className="w-full border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                      disabled={creating}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Meeting Date</label>
                    <input
                      type="date"
                      value={createForm.meeting_date}
                      onChange={(e) => setCreateForm((p) => ({ ...p, meeting_date: e.target.value }))}
                      className="w-full border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                      disabled={creating}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Meeting Time</label>
                    <select
                      value={createForm.meeting_time}
                      onChange={(e) => setCreateForm((p) => ({ ...p, meeting_time: e.target.value }))}
                      className="w-full border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                      disabled={creating}
                    >
                      {["8 AM", "9 AM", "10 AM", "11 AM", "12 PM", "1 PM", "2 PM", "3 PM", "4 PM", "5 PM", "6 PM"].map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-end">
                    <label className="inline-flex items-center gap-2 text-sm font-medium text-gray-700">
                      <input
                        type="checkbox"
                        checked={Number(createForm.payment_status) === 1}
                        onChange={(e) => setCreateForm((p) => ({ ...p, payment_status: e.target.checked ? 1 : 0 }))}
                        disabled={creating}
                      />
                      Paid
                    </label>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t">
                  <button
                    type="button"
                    onClick={closeCreate}
                    className="px-4 py-2 rounded-xl bg-gray-200 hover:bg-gray-300 text-sm font-semibold disabled:opacity-60"
                    disabled={creating}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold disabled:opacity-60"
                    disabled={creating}
                  >
                    {creating ? "Creating..." : "Create"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

