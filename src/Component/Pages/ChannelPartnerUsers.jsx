import React, { useEffect, useMemo, useState } from "react";
import Cookies from "js-cookie";
import {
  getChannelPartners,
  getAllTwillioUsers,
  donateChannelPartnerMinute,
  getChannelPartnerMinuteTransactions,
  getUserProfile,
} from "../../hooks/useAuth";
import { toast } from "react-hot-toast";

export default function ChannelPartnerUsers() {
  const currentRole = String(Cookies.get("role") || "").trim().toLowerCase();
  const currentEmail = String(Cookies.get("email") || "").trim().toLowerCase();
  const currentPhone = String(Cookies.get("contact_no") || "").trim();
  const currentName = String(Cookies.get("name") || "").trim().toLowerCase();
  const remainingMinutesStorageKey = currentEmail
    ? `channel_partner_remaining_minutes_${currentEmail}`
    : "channel_partner_remaining_minutes";
  const [allRows, setAllRows] = useState([]);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [usersLoading, setUsersLoading] = useState(false);
  const [twilioUsers, setTwilioUsers] = useState([]);
  const [availableMinutes, setAvailableMinutes] = useState(0);
  const [profileUserId, setProfileUserId] = useState("");
  const [profileName, setProfileName] = useState("");
  const [donatingFrom, setDonatingFrom] = useState(null);
  const [donateUserId, setDonateUserId] = useState("");
  const [donateMinute, setDonateMinute] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [donationHistory, setDonationHistory] = useState([]);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const resolveRowOmniMinute = (row) => {
    if (!row) return null;
    const om = row?.omni_minute ?? row?.omniMinute;
    if (om == null) return null;
    if (typeof om === "number") return Number.isFinite(om) ? om : null;
    if (typeof om !== "object") return null;
    const raw =
      om.minute ?? om.minutes ?? om.remaining_minute ?? om.remainingMinute ?? om.two_way;
    const n = Number(raw);
    return Number.isFinite(n) ? n : null;
  };

  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  const pageRows = rows.slice((page - 1) * pageSize, page * pageSize);
  const hasDonations = donationHistory.length > 0;
  const getStoredRemainingMinutes = () => {
    if (typeof window === "undefined") return {};

    try {
      const storedValue = localStorage.getItem(remainingMinutesStorageKey);
      const parsedValue = storedValue ? JSON.parse(storedValue) : {};
      return parsedValue && typeof parsedValue === "object" ? parsedValue : {};
    } catch {
      return {};
    }
  };
  const filteredTwilioUsers = useMemo(() => {
    const search = userSearch.trim().toLowerCase();
    if (!search) return [];
    return twilioUsers.filter((user) => {
      const name = String(user.name || "").toLowerCase();
      const email = String(user.email || "").toLowerCase();
      const phone = String(user.contact_no || user.phone_no || "").toLowerCase();
      return name.includes(search) || email.includes(search) || phone.includes(search);
    });
  }, [twilioUsers, userSearch]);
  const isMatchingDonateUser = (user) =>
    String(user?.id) === String(donateUserId) ||
    String(user?.user_id) === String(donateUserId) ||
    String(user?.twilio_user_minute?.user_id) === String(donateUserId) ||
    String(user?.twilio_two_way_user_minute?.user_id) === String(donateUserId);
  const activeRow = rows[0] || allRows[0] || null;
  const channelPartnerMinutes = Number(donatingFrom?.minute ?? activeRow?.minute ?? 0);
  const selectedDonateUser = filteredTwilioUsers.find(
    (user) => isMatchingDonateUser(user)
  ) || twilioUsers.find((user) => isMatchingDonateUser(user));
  const availableMinutesToUse = Number.isFinite(channelPartnerMinutes)
    ? channelPartnerMinutes
    : 0;

  const extractTxMinuteAmount = (tx) => {
    const raw =
      tx?.minute_amount ??
      tx?.minuteAmount ??
      tx?.minute ??
      tx?.minutes ??
      tx?.amount ??
      tx?.minute_value;
    const n = Number(raw);
    return Number.isFinite(n) ? n : 0;
  };

  const extractTxToUserFields = (tx) => {
    const toUser = tx?.to_user ?? tx?.toUser ?? tx?.recipient_user ?? tx?.recipientUser ?? {};
    const toUserIdRaw =
      tx?.to_user_id ??
      tx?.toUserId ??
      tx?.user_id ??
      tx?.userId ??
      tx?.recipient_user_id ??
      tx?.recipientUserId ??
      tx?.to_user?.user_id ??
      tx?.toUser?.user_id ??
      "";

    const toUserName =
      tx?.to_user_name ??
      tx?.toUserName ??
      tx?.user_name ??
      tx?.userName ??
      tx?.recipient_user_name ??
      tx?.recipientUserName ??
      toUser?.name ??
      toUser?.full_name ??
      toUser?.fullName ??
      toUser?.username ??
      "";

    const email = tx?.to_user?.email ?? tx?.toUser?.email ?? tx?.user?.email ?? toUser?.email ?? "";
    const phone_no =
      toUser?.phone_no ??
      toUser?.contact_no ??
      toUser?.contactNo ??
      toUser?.phoneNo ??
      tx?.to_user?.phone_no ??
      tx?.toUser?.phoneNo ??
      tx?.user?.phone_no ??
      tx?.user?.contact_no ??
      "";

    const donatedAtRaw =
      tx?.created_at ??
      tx?.createdAt ??
      tx?.donated_at ??
      tx?.donatedAt ??
      tx?.timestamp ??
      "";

    return {
      toUserId: String(toUserIdRaw || ""),
      name: String(toUserName || ""),
      email: String(email || ""),
      phone_no: String(phone_no || ""),
      donatedAt: donatedAtRaw ? String(donatedAtRaw) : "",
    };
  };

  const loadDonationsFromApi = async (channelPartnerId, profileUserIdFallback) => {
    if (!channelPartnerId && !profileUserIdFallback) {
      setDonationHistory([]);
      return;
    }

    try {
      const txList = await getChannelPartnerMinuteTransactions();
      const list = Array.isArray(txList) ? txList : [];

      const cpIdStr = String(channelPartnerId);
      const fallbackCpIdStr = profileUserIdFallback ? String(profileUserIdFallback) : "";
      const filtered = list.filter((tx) => {
        const cpId =
          tx?.channel_partner_id ??
          tx?.channelPartnerId ??
          tx?.from_channel_partner_id ??
          tx?.fromChannelPartnerId ??
          tx?.partner_id ??
          tx?.partnerId ??
          tx?.from_channel_partner?.id ??
          tx?.fromChannelPartner?.id ??
          tx?.channel_partner?.id ??
          tx?.channelPartner?.id ??
          "";
        const cpIdResolved = String(cpId);
        return cpIdResolved === cpIdStr || (fallbackCpIdStr && cpIdResolved === fallbackCpIdStr);
      });

      const mapped = filtered.map((tx, index) => {
        const { toUserId, name, email, phone_no, donatedAt } = extractTxToUserFields(tx);
        const minute = extractTxMinuteAmount(tx);
        const id =
          tx?.id ??
          tx?._id ??
          `${cpIdStr}-${toUserId || "user"}-${minute}-${donatedAt || index}`;
        return {
          id,
          name,
          email,
          phone_no,
          minute,
          donatedAt,
        };
      });

      setDonationHistory(mapped);
    } catch (error) {
      toast.error(error.message || "Failed to load donated minutes");
      setDonationHistory([]);
    }
  };

  useEffect(() => {
    loadDonationsFromApi(activeRow?.id, profileUserId);
  }, [activeRow?.id, profileUserId]);

  const loadRows = async () => {
    setLoading(true);
    try {
      const list = await getChannelPartners();
      const storedRemainingMinutes = getStoredRemainingMinutes();
      const mappedRows = (Array.isArray(list) ? list : []).map((row, index) => {
        const rowId = row.id ?? index + 1;
        const omniMinute = resolveRowOmniMinute(row);
        const apiMinuteRaw =
          omniMinute != null
            ? omniMinute
            : row.minute ??
            row.minutes ??
            row?.twilio_user_minute?.minute ??
            row?.twilio_user_minute ??
            0;
        const parsedApiMinute = Number(apiMinuteRaw);
        const apiMinute = Number.isFinite(parsedApiMinute) ? parsedApiMinute : 0;
        const storedMinuteRaw = storedRemainingMinutes[String(rowId)];
        const parsedStoredMinute = Number(storedMinuteRaw);
        const minute =
          omniMinute != null
            ? omniMinute
            : Number.isFinite(parsedStoredMinute)
              ? parsedStoredMinute
              : apiMinute;

        return {
          id: rowId,
          name: row.name ?? "",
          email: row.email ?? "",
          phone_no: row.phone_no ?? "",
          minute,
        };
      });
      setAllRows(mappedRows);

      let filteredRows = mappedRows;

      if (currentEmail || currentPhone || currentName) {
        filteredRows = mappedRows.filter((row) => {
          const rowEmail = String(row.email || "").trim().toLowerCase();
          const rowPhone = String(row.phone_no || "").trim();
          const rowName = String(row.name || "").trim().toLowerCase();
          return (
            (currentEmail && rowEmail === currentEmail) ||
            (currentPhone && rowPhone === currentPhone) ||
            (currentName && rowName === currentName)
          );
        });
      }

      if (filteredRows.length === 0 && mappedRows.length === 1) {
        filteredRows = mappedRows;
      }

      setRows(filteredRows);
    } catch (error) {
      toast.error(error.message || "Failed to fetch users");
      setAllRows([]);
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  const loadProfileUserId = async () => {
    try {
      const response = await getUserProfile();
      const profile = response?.data || response?.data?.data || {};
      const resolvedUserId =
        profile?.user_id ??
        profile?.id ??
        response?.data?.user_id ??
        response?.data?.id ??
        "";
      setProfileUserId(String(resolvedUserId || ""));
      setProfileName(String(profile?.name || response?.data?.name || ""));
    } catch (error) {
      console.error("Failed to load profile user id:", error);
      setProfileUserId("");
      setProfileName("");
    }
  };

  useEffect(() => {
    loadRows();
    loadProfileUserId();
  }, []);

  useEffect(() => {
    const resolvedMinutes = Number(activeRow?.minute ?? 0);
    setAvailableMinutes(Number.isFinite(resolvedMinutes) ? resolvedMinutes : 0);
  }, [activeRow]);

  const ensureUsersLoaded = async () => {
    if (twilioUsers.length > 0) return;
    setUsersLoading(true);
    try {
      const response = await getAllTwillioUsers();
      const list = Array.isArray(response)
        ? response
        : response?.data || response?.data?.data || [];
      setTwilioUsers(Array.isArray(list) ? list : []);
    } catch (error) {
      toast.error(error.message || "Failed to load users");
      setTwilioUsers([]);
    } finally {
      setUsersLoading(false);
    }
  };

  const openDonate = async (row) => {
    setDonatingFrom(row);
    setDonateUserId("");
    setDonateMinute("");
    setUserSearch("");
    const rowMinutes = Number(row?.minute ?? 0);
    setAvailableMinutes(Number.isFinite(rowMinutes) ? rowMinutes : 0);
    await ensureUsersLoaded();
  };

  const closeDonate = () => {
    setDonatingFrom(null);
    setDonateUserId("");
    setDonateMinute("");
    setUserSearch("");
  };

  const handleDonate = async () => {
    if (!donatingFrom?.id) return;
    if (!donateUserId) return toast.error("Please select a user");
    if (!profileUserId) return toast.error("Profile user id not found");
    const parsedMinute = Number(String(donateMinute ?? "").trim());

    if (!Number.isFinite(parsedMinute) || parsedMinute <= 0) {
      return toast.error("Enter valid donate minutes");
    }

    if (parsedMinute > availableMinutesToUse) {
      return toast.error("Donate minutes cannot be greater than allowed available minutes");
    }

    setSaving(true);
    try {
      const parsedUserId = Number(donateUserId);
      const userId = Number.isFinite(parsedUserId) ? parsedUserId : donateUserId;
      await donateChannelPartnerMinute({
        channel_partner_id: donatingFrom?.id || profileUserId,
        user_id: userId,
        minute: parsedMinute,
        channel_partner_name: profileName || donatingFrom?.name || "",
        role: currentRole,
      });
      await loadRows();
      await loadDonationsFromApi(donatingFrom?.id || profileUserId, profileUserId);
      toast.success("Minutes donated successfully");
      closeDonate();
    } catch (error) {
      toast.error(error.message || "Failed to donate minutes");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 px-3 py-4 sm:px-4 sm:py-6">
      <div className="mx-auto">
        <div className="mb-5 sm:mb-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between md:gap-6">
            <div className="min-w-0 flex-1">
              <h2 className="text-[24px] font-bold tracking-tight text-gray-700 sm:text-3xl">
                Channel Partner Users
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Manage your profile, donate minutes to users, and track donated user data.
              </p>
            </div>

            <div className="flex justify-start md:w-auto md:flex-shrink-0 md:justify-end">
              {activeRow ? (
                <button
                  type="button"
                  onClick={() => openDonate(activeRow)}
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 md:min-w-[160px]"
                >
                  Sale Talktime
                </button>
              ) : null}
            </div>
          </div>
        </div>

        <div className="mb-3 rounded-2xl bg-sky-50 px-4 py-3 text-sm text-sky-800">
          Available remaining minutes :{" "}
          <span className="font-semibold">{availableMinutesToUse}</span>
        </div>

        {!hasDonations ? (
          <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-[720px] w-full text-sm">
                <thead className="bg-slate-50 text-left text-slate-600 ">
                  <tr>
                    <th className="px-3 py-3 font-semibold sm:px-4">Sr No</th>
                    <th className="px-3 py-3 font-semibold sm:px-4">Name</th>
                    <th className="px-3 py-3 font-semibold sm:px-4">Email</th>
                    <th className="px-3 py-3 font-semibold sm:px-4">Phone No</th>
                    <th className="px-3 py-3 font-semibold sm:px-4">Minute</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-500">
                        Loading...
                      </td>
                    </tr>
                  ) : rows.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-500">
                        <div className="flex flex-col items-center gap-4 px-4">
                          <span className="text-sm sm:text-base">
                            No channel partner data found for this account
                          </span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    pageRows.map((row, index) => (
                      <tr key={row.id} className="border-t border-slate-100 text-slate-700 hover:bg-slate-50">
                        <td className="px-3 py-3 align-middle sm:px-4">{(page - 1) * pageSize + index + 1}</td>
                        <td className="px-3 py-3 align-middle font-medium sm:px-4">{row.name}</td>
                        <td className="px-3 py-3 align-middle break-words sm:px-4">{row.email || "-"}</td>
                        <td className="px-3 py-3 align-middle sm:px-4">{row.phone_no || "-"}</td>
                        <td className="px-3 py-3 align-middle sm:px-4">
                          {Number.isFinite(Number(row.minute)) ? Number(row.minute) : 0}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}

        {!hasDonations && rows.length > pageSize ? (
          <div className="mt-4 flex flex-col gap-3 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-center sm:text-left">
              Showing {(page - 1) * pageSize + 1}-
              {Math.min(page * pageSize, rows.length)} of {rows.length}
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-end">
              <button
                type="button"
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                className="rounded-lg border border-slate-200 px-3 py-1.5 disabled:opacity-50"
                disabled={page === 1}
              >
                Prev
              </button>
              {[...Array(totalPages)].map((_, index) => (
                <button
                  type="button"
                  key={index}
                  onClick={() => setPage(index + 1)}
                  className={`rounded-lg border px-3 py-1.5 ${page === index + 1
                    ? "border-indigo-600 bg-indigo-600 text-white"
                    : "border-slate-200 bg-white text-slate-700"
                    }`}
                >
                  {index + 1}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                className="rounded-lg border border-slate-200 px-3 py-1.5 disabled:opacity-50"
                disabled={page === totalPages}
              >
                Next
              </button>
            </div>
          </div>
        ) : null}

        {!hasDonations && rows.length > 0 ? (
          <div className="mt-6 rounded-3xl border border-dashed border-slate-300 bg-white p-5 text-center shadow-sm sm:p-6">
            <h3 className="text-lg font-semibold text-slate-900">No user donated yet</h3>
            <p className="mt-2 text-sm text-slate-600">
              Click the <span className="font-semibold">Users</span> button to search a user and donate minutes from this profile.
            </p>
          </div>
        ) : null}

        {hasDonations ? (
          <div className="mt-6 overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-4 py-4 sm:px-5">
              <h3 className="text-lg font-semibold text-slate-900">Donated Users</h3>
              <p className="text-sm text-slate-500">
                Users already donated from this purchased minutes profile.
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-[820px] w-full text-sm">
                <thead className="bg-slate-50 text-left text-slate-600">
                  <tr>
                    <th className="px-3 py-3 font-semibold sm:px-4">Sr No</th>
                    <th className="px-3 py-3 font-semibold sm:px-4">Name</th>
                    <th className="px-3 py-3 font-semibold sm:px-4">Email</th>
                    <th className="px-3 py-3 font-semibold sm:px-4">Phone No</th>
                    <th className="px-3 py-3 font-semibold sm:px-4">Minutes</th>
                    <th className="px-3 py-3 font-semibold sm:px-4">Donated At</th>
                  </tr>
                </thead>

                <tbody>
                  {donationHistory.map((item, index) => (
                    <tr key={item.id} className="border-t border-slate-100 text-slate-700">
                      <td className="px-3 py-3 align-middle sm:px-4">{index + 1}</td>
                      <td className="px-3 py-3 align-middle  sm:px-4">{item.name || "-"}</td>
                      <td className="px-3 py-3 align-middle  break-words sm:px-4">{item.email || "-"}</td>
                      <td className="px-3 py-3 align-middle  sm:px-4">{item.phone_no || "-"}</td>
                      <td className="px-3 py-3 align-middle  sm:px-4">{item.minute || "-"}</td>
                      <td className="px-3 py-3 align-middle  sm:px-4">
                        {item.donatedAt ? new Date(item.donatedAt).toLocaleString() : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}
      </div>

      {donatingFrom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-3 py-4 sm:px-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white shadow-2xl">
            <div className="flex items-start justify-between gap-3 border-b border-slate-200 px-4 py-4 sm:px-5">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Donate Minutes</h2>
                <p className="text-sm text-slate-500">
                  Transfer available minutes from this channel partner account.
                </p>
              </div>
              <button
                type="button"
                onClick={closeDonate}
                className="text-slate-500 transition hover:text-slate-600"
                disabled={saving}
              >
                X
              </button>
            </div>

            <div className="space-y-4 px-4 py-5 sm:px-5">
              <div className="rounded-2xl bg-sky-50 px-4 py-3 text-sm text-sky-800">
                Available remaining minutes : {" "}
                <span className="font-semibold">{availableMinutesToUse}</span>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Search User</label>
                <input
                  type="text"
                  value={userSearch}
                  onChange={(event) => setUserSearch(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                  placeholder="Search by name, email, or phone"
                  disabled={saving || usersLoading}
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Select User</label>
                <select
                  value={donateUserId}
                  onChange={(event) => setDonateUserId(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                  disabled={saving || usersLoading}
                >
                  <option value="">
                    {usersLoading
                      ? "Loading users..."
                      : userSearch.trim() === ""
                        ? "Search user first"
                        : filteredTwilioUsers.length > 0
                          ? "Select user"
                          : "No matching users found"}
                  </option>
                  {filteredTwilioUsers.map((user) => (
                    <option key={user.id} value={user.id}>
                      {(user.name || "User") +
                        (user.email ? ` (${user.email})` : "")}
                    </option>
                  ))}
                </select>
              </div>

              {selectedDonateUser ? (
                <div className="space-y-2 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                  <div>
                    Selected user email:{" "}
                    <span className="font-semibold">{selectedDonateUser.email || "-"}</span>
                  </div>
                </div>
              ) : null}

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Minute</label>
                <input
                  type="number"
                  min="1"
                  value={donateMinute}
                  onChange={(event) => setDonateMinute(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                  placeholder="Enter minutes to donate"
                  disabled={saving}
                />
              </div>

              <div className="text-xs text-slate-500">
                {currentRole === "channelpartner"
                  ? "Note: for channel partner role, donation uses the profile matched two-way minutes."
                  : "Note: donation must be within both channel partner minutes and profile matched user's two-way minutes."}
              </div>
            </div>

            <div className="flex flex-col-reverse gap-2 border-t border-slate-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-end sm:px-5">
              <button
                type="button"
                onClick={closeDonate}
                className="w-full rounded-xl border border-slate-200 px-4 py-2 hover:bg-slate-50 sm:w-auto"
                disabled={saving}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDonate}
                className="w-full rounded-xl bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700 disabled:opacity-60 sm:w-auto"
                disabled={saving || usersLoading}
              >
                {saving ? "  Sale Talktime..." : "Sale Talktime"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
