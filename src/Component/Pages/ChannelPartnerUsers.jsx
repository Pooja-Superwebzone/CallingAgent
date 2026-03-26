import React, { useEffect, useMemo, useState } from "react";
import Cookies from "js-cookie";
import {
  getChannelPartners,
  updateChannelPartner,
  getAllTwillioUsers,
  donateChannelPartnerMinute,
  getUserProfile,
} from "../../hooks/useAuth";
import { toast } from "react-hot-toast";

export default function ChannelPartnerUsers() {
  const currentRole = String(Cookies.get("role") || "").trim().toLowerCase();
  const currentEmail = String(Cookies.get("email") || "").trim().toLowerCase();
  const currentPhone = String(Cookies.get("contact_no") || "").trim();
  const currentName = String(Cookies.get("name") || "").trim().toLowerCase();
  const donationStorageKey = currentEmail
    ? `channel_partner_donations_${currentEmail}`
    : "channel_partner_donations";
  const remainingMinutesStorageKey = currentEmail
    ? `channel_partner_remaining_minutes_${currentEmail}`
    : "channel_partner_remaining_minutes";
  const [allRows, setAllRows] = useState([]);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone_no: "",
    minute: "",
  });

  const [usersLoading, setUsersLoading] = useState(false);
  const [twilioUsers, setTwilioUsers] = useState([]);
  const [availableMinutes, setAvailableMinutes] = useState(0);
  const [profileUserId, setProfileUserId] = useState("");

  const [donatingFrom, setDonatingFrom] = useState(null);
  const [donateUserId, setDonateUserId] = useState("");
  const [donateMinute, setDonateMinute] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [donationHistory, setDonationHistory] = useState([]);
  const [baseProfileMinutes, setBaseProfileMinutes] = useState(0);

  const [page, setPage] = useState(1);
  const pageSize = 10;

  const resolveUserTwoWayMinutes = (user) => {
    if (!user) return 0;

    const minuteSources = [
      user?.twilio_two_way_user_minute?.minute,
      user?.twilio_user_minute?.two_way,
      user?.twilio_user_minute?.twoWay,
      user?.twilio_user_minute?.inbound,
      user?.twilio_user_minute?.inbound_minute,
    ];

    const matchedMinute = minuteSources.find((value) => {
      const parsedValue = Number(value);
      return Number.isFinite(parsedValue);
    });

    return Number.isFinite(Number(matchedMinute)) ? Number(matchedMinute) : 0;
  };

  const calculateRemainingProfileMinutes = (baseMinutes, history) => {
    const donatedTotal = history.reduce((sum, item) => {
      const parsedMinute = Number(item?.minute ?? 0);
      return sum + (Number.isFinite(parsedMinute) ? parsedMinute : 0);
    }, 0);

    return Math.max(0, Number(baseMinutes ?? 0) - donatedTotal);
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
  const setStoredRemainingMinutes = (rowId, minute) => {
    if (typeof window === "undefined" || !rowId) return;

    const storedMinutes = getStoredRemainingMinutes();
    storedMinutes[String(rowId)] = minute;
    localStorage.setItem(remainingMinutesStorageKey, JSON.stringify(storedMinutes));
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
  const isMatchingProfileUser = (user) =>
    String(user?.id) === String(profileUserId) ||
    String(user?.user_id) === String(profileUserId) ||
    String(user?.twilio_user_minute?.user_id) === String(profileUserId) ||
    String(user?.twilio_two_way_user_minute?.user_id) === String(profileUserId);
  const isMatchingDonateUser = (user) =>
    String(user?.id) === String(donateUserId) ||
    String(user?.user_id) === String(donateUserId) ||
    String(user?.twilio_user_minute?.user_id) === String(donateUserId) ||
    String(user?.twilio_two_way_user_minute?.user_id) === String(donateUserId);
  const activeRow = rows[0] || allRows[0] || null;
  const matchedProfileTwilioUser = twilioUsers.find((user) => isMatchingProfileUser(user));
  const matchedProfileTwoWayMinutes = resolveUserTwoWayMinutes(matchedProfileTwilioUser);
  const donationSourceMinutes = calculateRemainingProfileMinutes(
    baseProfileMinutes,
    donationHistory
  );
  const channelPartnerMinutes = Number(donatingFrom?.minute ?? activeRow?.minute ?? 0);
  const selectedDonateUser = filteredTwilioUsers.find(
    (user) => isMatchingDonateUser(user)
  ) || twilioUsers.find((user) => isMatchingDonateUser(user));
  const availableMinutesToUse =
    currentRole === "channelpartner"
      ? Number.isFinite(donationSourceMinutes)
        ? donationSourceMinutes
        : 0
      : Math.min(
        Number.isFinite(channelPartnerMinutes) ? channelPartnerMinutes : 0,
        Number.isFinite(donationSourceMinutes) ? donationSourceMinutes : 0
      );

  useEffect(() => {
    setBaseProfileMinutes(Number(matchedProfileTwoWayMinutes ?? 0));
  }, [matchedProfileTwoWayMinutes]);

  useEffect(() => {
    if (typeof window === "undefined" || !currentEmail) return;
    try {
      const storedHistory = localStorage.getItem(donationStorageKey);
      setDonationHistory(storedHistory ? JSON.parse(storedHistory) : []);
    } catch {
      setDonationHistory([]);
    }
  }, [currentEmail, donationStorageKey]);

  const loadRows = async () => {
    setLoading(true);
    try {
      const list = await getChannelPartners();
      const storedRemainingMinutes = getStoredRemainingMinutes();
      const mappedRows = (Array.isArray(list) ? list : []).map((row, index) => {
        const rowId = row.id ?? index + 1;
        const apiMinute =
          row.minute ??
          row.minutes ??
          row?.twilio_user_minute?.minute ??
          row?.twilio_user_minute ??
          "";
        const parsedStoredMinute = Number(storedRemainingMinutes[String(rowId)]);
        const minute =
          Number.isFinite(parsedStoredMinute) && parsedStoredMinute >= 0
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
    } catch (error) {
      console.error("Failed to load profile user id:", error);
      setProfileUserId("");
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

  const openEdit = (row) => {
    setEditing(row);
    setForm({
      name: row?.name ?? "",
      email: row?.email ?? "",
      phone_no: row?.phone_no ?? "",
      minute: row?.minute ?? "",
    });
  };

  const openDonatedUserEdit = (item) => {
    setEditing({
      id: item.id,
      isDonationHistory: true,
    });
    setForm({
      name: item?.name ?? "",
      email: item?.email ?? "",
      phone_no: item?.phone_no ?? "",
      minute: item?.minute ?? "",
    });
  };

  const closeEdit = () => {
    setEditing(null);
    setForm({ name: "", email: "", phone_no: "", minute: "" });
  };

  const onChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleUpdate = async () => {
    if (!editing?.id) return;

    const name = String(form.name || "").trim();
    const email = String(form.email || "").trim();
    const phoneNo = String(form.phone_no || "").trim();
    const minuteRaw = String(form.minute ?? "").trim();

    if (!name) return toast.error("Name is required");
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return toast.error("Enter a valid email");
    }
    if (!phoneNo) return toast.error("Phone number is required");

    let minute = null;
    if (minuteRaw !== "") {
      const parsedMinute = Number(minuteRaw);
      if (!Number.isFinite(parsedMinute) || parsedMinute < 0) {
        return toast.error("Minute must be a valid number");
      }
      minute = parsedMinute;
    }

    const payload = {
      name,
      email,
      phone_no: phoneNo,
      ...(minute !== null ? { minute } : {}),
    };

    if (editing?.isDonationHistory) {
      const existingDonation = donationHistory.find((item) => item.id === editing.id);
      const previousMinute = Number(existingDonation?.minute ?? 0);
      const nextMinute = Number(minute !== null ? minute : existingDonation?.minute ?? 0);
      const minuteDelta =
        (Number.isFinite(nextMinute) ? nextMinute : 0) -
        (Number.isFinite(previousMinute) ? previousMinute : 0);
      const updatedHistory = donationHistory.map((item) =>
        item.id === editing.id
          ? {
            ...item,
            name,
            email,
            phone_no: phoneNo,
            minute: minute !== null ? minute : item.minute,
          }
          : item
      );
      const currentAvailableMinutes = Number(activeRow?.minute ?? availableMinutes ?? 0);
      const nextAvailableMinutes = Math.max(
        0,
        (Number.isFinite(currentAvailableMinutes) ? currentAvailableMinutes : 0) - minuteDelta
      );

      setDonationHistory(updatedHistory);
      setAvailableMinutes(nextAvailableMinutes);
      setDonatingFrom((prev) =>
        prev && activeRow && String(prev.id) === String(activeRow.id)
          ? { ...prev, minute: nextAvailableMinutes }
          : prev
      );
      setRows((prev) =>
        prev.map((row) =>
          activeRow && String(row.id) === String(activeRow.id)
            ? { ...row, minute: nextAvailableMinutes }
            : row
        )
      );
      setAllRows((prev) =>
        prev.map((row) =>
          activeRow && String(row.id) === String(activeRow.id)
            ? { ...row, minute: nextAvailableMinutes }
            : row
        )
      );
      if (typeof window !== "undefined" && currentEmail) {
        localStorage.setItem(donationStorageKey, JSON.stringify(updatedHistory));
      }
      if (activeRow?.id) {
        setStoredRemainingMinutes(activeRow.id, nextAvailableMinutes);
      }
      toast.success("Donated user updated");
      closeEdit();
      return;
    }

    setSaving(true);
    try {
      await updateChannelPartner(editing.id, payload);
      toast.success("User updated");
      closeEdit();
      await loadRows();
    } catch (error) {
      toast.error(error.message || "Failed to update user");
    } finally {
      setSaving(false);
    }
  };

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
        user_id: userId,
        minute: parsedMinute,
        role: currentRole,
      });
      const newDonation = {
        id: `${donatingFrom.id}-${userId}-${Date.now()}`,
        name: selectedDonateUser?.name || "User",
        email: selectedDonateUser?.email || "",
        phone_no:
          selectedDonateUser?.phone_no ||
          selectedDonateUser?.contact_no ||
          "",
        minute: parsedMinute,
        donatedAt: new Date().toISOString(),
      };
      const updatedHistory = [newDonation, ...donationHistory];
      const nextAvailableMinutes = Math.max(
        0,
        Number(availableMinutes ?? donatingFrom?.minute ?? 0) - parsedMinute
      );

      setDonationHistory(updatedHistory);
      setAvailableMinutes(nextAvailableMinutes);
      setDonatingFrom((prev) =>
        prev ? { ...prev, minute: nextAvailableMinutes } : prev
      );
      setRows((prev) =>
        prev.map((row) =>
          String(row.id) === String(donatingFrom.id)
            ? { ...row, minute: nextAvailableMinutes }
            : row
        )
      );
      setAllRows((prev) =>
        prev.map((row) =>
          String(row.id) === String(donatingFrom.id)
            ? { ...row, minute: nextAvailableMinutes }
            : row
        )
      );
      if (typeof window !== "undefined") {
        localStorage.setItem(donationStorageKey, JSON.stringify(updatedHistory));
      }
      setStoredRemainingMinutes(donatingFrom.id, nextAvailableMinutes);
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
                  Donate More
                </button>
              ) : null}
            </div>
          </div>
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
                    <th className="px-3 py-3 font-semibold sm:px-4">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-500">
                        Loading...
                      </td>
                    </tr>
                  ) : rows.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-500">
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
                        <td className="px-3 py-3 align-middle sm:px-4">{availableMinutes}</td>
                        <td className="px-3 py-3 align-middle sm:px-4">
                          <div className="flex flex-wrap items-center gap-2">
                            <button
                              type="button"
                              onClick={() => openEdit(row)}
                              className="rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-2 text-sm font-medium text-indigo-700 transition hover:bg-indigo-100"
                            >
                              Edit
                            </button>
                            {Number(availableMinutes ?? 0) > 0 ? (
                              <button
                                type="button"
                                onClick={() => openDonate(row)}
                                className="rounded-xl bg-emerald-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-emerald-700"
                              >
                                Users
                              </button>
                            ) : (
                              <span className="rounded-xl bg-slate-100 px-3 py-2 text-sm text-slate-500">
                                No minutes to donate
                              </span>
                            )}
                          </div>
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
                    <th className="px-3 py-3 font-semibold sm:px-4">Action</th>
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
                      <td className="px-3 py-3 align-top sm:px-4">
                        <button
                          type="button"
                          onClick={() => openDonatedUserEdit(item)}
                          className="rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-2 text-sm font-medium text-indigo-700 transition hover:bg-indigo-100"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-3 py-4 sm:px-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white shadow-2xl">
            <div className="flex items-start justify-between gap-3 border-b border-slate-200 px-4 py-4 sm:px-5">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Edit User</h2>
                <p className="text-sm text-slate-500">Update user details and minute balance.</p>
              </div>
              <button
                type="button"
                onClick={closeEdit}
                className="text-slate-500 transition hover:text-slate-600"
                disabled={saving}
              >
                X
              </button>
            </div>

            <div className="space-y-4 px-4 py-5 sm:px-5">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Name</label>
                <input
                  value={form.name}
                  onChange={(event) => onChange("name", event.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  placeholder="Name"
                  disabled={saving}
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(event) => onChange("email", event.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  placeholder="Email"
                  disabled={saving}
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Phone No</label>
                <input
                  value={form.phone_no}
                  onChange={(event) => onChange("phone_no", event.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  placeholder="Phone number"
                  disabled={saving}
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Minute</label>
                <input
                  type="number"
                  min="0"
                  value={form.minute}
                  onChange={(event) => onChange("minute", event.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  placeholder="Minutes"
                  disabled={saving}
                />
              </div>
            </div>

            <div className="flex flex-col-reverse gap-2 border-t border-slate-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-end sm:px-5">
              <button
                type="button"
                onClick={closeEdit}
                className="w-full rounded-xl border border-slate-200 px-4 py-2 hover:bg-slate-50 sm:w-auto"
                disabled={saving}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUpdate}
                className="w-full rounded-xl bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 disabled:opacity-60 sm:w-auto"
                disabled={saving}
              >
                {saving ? "Updating..." : "Update"}
              </button>
            </div>
          </div>
        </div>
      )}

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
                Available profile matched two-way minutes:{" "}
                <span className="font-semibold">{donationSourceMinutes}</span>
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
                {saving ? "Donating..." : "Donate"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
