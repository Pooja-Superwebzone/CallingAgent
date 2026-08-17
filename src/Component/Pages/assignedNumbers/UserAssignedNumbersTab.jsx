import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import { getAllUsers } from "../../../hooks/useAuth";
import {
  createUserAssignedNumber,
  deleteUserAssignedNumber,
  getApiErrorMessage,
  getAssignedNumbers,
  getUserAssignedNumbers,
  normalizePhoneInput,
  updateUserAssignedNumber,
  validatePhoneNo,
} from "../../../api/assignedNumbersApi";

function formatDateTime(value) {
  if (!value) return "-";
  try {
    return new Date(value).toLocaleString();
  } catch {
    return String(value);
  }
}

function isSalespersonUser(user) {
  return String(user?.role || "").trim().toLowerCase() === "salesperson";
}

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
  disabled,
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
        String(it.subLabel || "").toLowerCase().includes(q) ||
        String(it.id || "").toLowerCase().includes(q)
    );
  }, [items, query]);

  return (
    <div className="relative" ref={ref}>
      <label className="block text-sm font-medium text-slate-700">{label}</label>
      <div className="mt-1 relative">
        <div
          className={`w-full border rounded-lg px-3 py-2 flex items-center justify-between ${disabled ? "bg-slate-100 cursor-not-allowed" : "cursor-text"}`}
          onClick={() => !disabled && setOpen((o) => !o)}
        >
          <input
            type="text"
            className="w-full outline-none bg-transparent text-sm"
            placeholder={selectedLabel || placeholder}
            value={selectedId ? selectedLabel : query}
            onChange={(e) => {
              if (disabled) return;
              setQuery(e.target.value);
              if (!open) setOpen(true);
            }}
            onFocus={() => !disabled && setOpen(true)}
            disabled={disabled}
          />
          {selectedId && !disabled && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onClear();
                setQuery("");
                setOpen(false);
              }}
              className="text-gray-400 hover:text-gray-600 px-1"
            >
              ×
            </button>
          )}
        </div>
        {open && !disabled && (
          <div className="absolute z-50 mt-1 w-full max-h-56 overflow-auto bg-white border rounded-lg shadow">
            {loading ? (
              <div className="p-2 text-xs text-gray-500">Loading…</div>
            ) : filtered.length === 0 ? (
              <div className="p-2 text-xs text-gray-500">No items found</div>
            ) : (
              <ul>
                {filtered.map((it) => (
                  <li
                    key={it.id}
                    className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                    onClick={() => {
                      onSelect(it);
                      setOpen(false);
                      setQuery("");
                    }}
                  >
                    <div>{it.label}</div>
                    {it.subLabel && (
                      <div className="text-xs text-gray-400">{it.subLabel}</div>
                    )}
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

function TableSkeleton() {
  return (
    <>
      {[1, 2, 3, 4].map((i) => (
        <tr key={i} className="border-t border-slate-100 animate-pulse">
          {[1, 2, 3, 4, 5, 6, 7].map((c) => (
            <td key={c} className="px-4 py-3">
              <div className="h-4 bg-slate-200 rounded w-full max-w-[100px]" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

export default function UserAssignedNumbersTab() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [assignedNumbers, setAssignedNumbers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingNumbers, setLoadingNumbers] = useState(true);

  const [filterUserId, setFilterUserId] = useState("");
  const [filterAssignedNumberId, setFilterAssignedNumberId] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formUserId, setFormUserId] = useState("");
  const [formUserLabel, setFormUserLabel] = useState("");
  const [formAssignedNumberId, setFormAssignedNumberId] = useState("");
  const [transferNumber, setTransferNumber] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const userOptions = useMemo(
    () =>
      (users || [])
        .filter(isSalespersonUser)
        .map((u) => ({
          id: String(u.id ?? u.user_id ?? ""),
          label: u.name || `User ${u.id}`,
          subLabel: u.email || u.contact_no || "",
        })),
    [users]
  );

  const assignedNumberOptions = useMemo(
    () =>
      (assignedNumbers || []).map((n) => ({
        id: String(n.id),
        label: n.phone_no,
      })),
    [assignedNumbers]
  );

  const fetchLookups = useCallback(async () => {
    setLoadingUsers(true);
    setLoadingNumbers(true);
    try {
      const [usersList, numbersRes] = await Promise.all([
        getAllUsers(),
        getAssignedNumbers(),
      ]);
      setUsers(
        (Array.isArray(usersList) ? usersList : []).filter(isSalespersonUser)
      );
      setAssignedNumbers(Array.isArray(numbersRes.data) ? numbersRes.data : []);
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to load dropdown data"));
    } finally {
      setLoadingUsers(false);
      setLoadingNumbers(false);
    }
  }, []);

  const fetchRows = useCallback(async (filters = {}) => {
    setLoading(true);
    try {
      const params = {};
      if (filters.user_id) params.user_id = Number(filters.user_id);
      if (filters.assigned_number_id) {
        params.assigned_number_id = Number(filters.assigned_number_id);
      }
      const res = await getUserAssignedNumbers(params);
      setRows(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to load user assignments"));
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLookups();
    fetchRows();
  }, [fetchLookups, fetchRows]);

  const applyFilters = () => {
    fetchRows({
      user_id: filterUserId || undefined,
      assigned_number_id: filterAssignedNumberId || undefined,
    });
  };

  const clearFilters = () => {
    setFilterUserId("");
    setFilterAssignedNumberId("");
    fetchRows();
  };

  const openCreate = () => {
    setEditId(null);
    setFormUserId("");
    setFormUserLabel("");
    setFormAssignedNumberId("");
    setTransferNumber("");
    setFieldErrors({});
    setShowModal(true);
  };

  const openEdit = (row) => {
    setEditId(row.id);
    setFormUserId(String(row.user_id ?? ""));
    setFormUserLabel(row.user?.name || row.user?.email || `User ${row.user_id}`);
    setFormAssignedNumberId(String(row.assigned_number_id ?? ""));
    setTransferNumber(row.transfer_number || "");
    setFieldErrors({});
    setShowModal(true);
  };

  const closeModal = () => {
    if (saving) return;
    setShowModal(false);
    setEditId(null);
    setFieldErrors({});
  };

  const validateForm = () => {
    const errors = {};
    if (!formUserId) errors.user_id = "User is required";
    if (!formAssignedNumberId) errors.assigned_number_id = "Assigned phone number is required";
    const normalizedTransfer = normalizePhoneInput(transferNumber);
    const transferErr = validatePhoneNo(normalizedTransfer);
    if (transferErr) errors.transfer_number = transferErr;
    setFieldErrors(errors);
    return { ok: Object.keys(errors).length === 0, normalizedTransfer };
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const { ok, normalizedTransfer } = validateForm();
    if (!ok) return;

    const payload = {
      user_id: Number(formUserId),
      assigned_number_id: Number(formAssignedNumberId),
      transfer_number: normalizedTransfer,
    };

    setSaving(true);
    try {
      if (editId) {
        const res = await updateUserAssignedNumber(editId, payload);
        toast.success(res.message || "Assignment updated");
      } else {
        const res = await createUserAssignedNumber(payload);
        toast.success(res.message || "Number assigned to user");
      }
      closeModal();
      fetchRows({
        user_id: filterUserId || undefined,
        assigned_number_id: filterAssignedNumberId || undefined,
      });
    } catch (err) {
      const msg = getApiErrorMessage(err, "Failed to save assignment");
      toast.error(msg);
      setFieldErrors((prev) => ({ ...prev, _form: msg }));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (row) => {
    const ok = window.confirm("Delete this user number assignment?");
    if (!ok) return;
    try {
      const res = await deleteUserAssignedNumber(row.id);
      toast.success(res.message || "Assignment deleted");
      fetchRows({
        user_id: filterUserId || undefined,
        assigned_number_id: filterAssignedNumberId || undefined,
      });
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to delete assignment"));
    }
  };

  return (
    <>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-xl font-bold text-gray-700">User Number Assignments</h3>
          <p className="mt-1 text-sm text-slate-500">
            Link users to Plivo caller numbers and transfer numbers.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="self-start rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
        >
          Assign Number
        </button>
      </div>

      <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Filter by User</label>
          <select
            value={filterUserId}
            onChange={(e) => setFilterUserId(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="">All users</option>
            {userOptions.map((u) => (
              <option key={u.id} value={u.id}>
                {u.label} {u.subLabel ? `(${u.subLabel})` : ""}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">
            Filter by Assigned Number
          </label>
          <select
            value={filterAssignedNumberId}
            onChange={(e) => setFilterAssignedNumberId(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="">All numbers</option>
            {assignedNumberOptions.map((n) => (
              <option key={n.id} value={n.id}>
                {n.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-end gap-2 sm:col-span-2">
          <button
            type="button"
            onClick={applyFilters}
            className="rounded-lg bg-gray-600 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
          >
            Apply Filters
          </button>
          {(filterUserId || filterAssignedNumberId) && (
            <button
              type="button"
              onClick={clearFilters}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-[1100px] w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-600">
              <tr>
                <th className="px-4 py-3 font-semibold">ID</th>
                <th className="px-4 py-3 font-semibold">User Name</th>
                <th className="px-4 py-3 font-semibold">User Email</th>
                <th className="px-4 py-3 font-semibold">Assigned Phone</th>
                <th className="px-4 py-3 font-semibold">Transfer Number</th>
                <th className="px-4 py-3 font-semibold">Created At</th>
                <th className="px-4 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-slate-800">
              {loading ? (
                <TableSkeleton />
              ) : rows.length === 0 ? (
                <tr className="border-t border-slate-100">
                  <td colSpan={7} className="px-4 py-10 text-center text-slate-500">
                    No user assignments yet. Click Assign Number.
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={row.id} className="border-t border-slate-100 hover:bg-slate-50/60">
                    <td className="px-4 py-3">{row.id}</td>
                    <td className="px-4 py-3">{row.user?.name || "-"}</td>
                    <td className="px-4 py-3">{row.user?.email || "-"}</td>
                    <td className="px-4 py-3">{row.assigned_number?.phone_no || "-"}</td>
                    <td className="px-4 py-3">{row.transfer_number || "-"}</td>
                    <td className="px-4 py-3">{formatDateTime(row.created_at)}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEdit(row)}
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium hover:bg-slate-100"
                        >
                          <FiEdit size={14} /> Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(row)}
                          className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                        >
                          <FiTrash2 size={14} /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <h4 className="text-lg font-bold text-gray-800">
              {editId ? "Edit User Assignment" : "Assign Number to User"}
            </h4>
            <form onSubmit={handleSave} className="mt-4 space-y-4">
              <SearchableDropdown
                label="User"
                items={userOptions}
                loading={loadingUsers}
                placeholder="Search user..."
                selectedId={formUserId}
                selectedLabel={formUserLabel}
                onSelect={(it) => {
                  setFormUserId(it.id);
                  setFormUserLabel(it.label);
                  setFieldErrors((prev) => ({ ...prev, user_id: "" }));
                }}
                onClear={() => {
                  setFormUserId("");
                  setFormUserLabel("");
                }}
                disabled={saving}
              />
              {fieldErrors.user_id && (
                <p className="text-xs text-red-600 -mt-2">{fieldErrors.user_id}</p>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Assigned Phone Number
                </label>
                <select
                  value={formAssignedNumberId}
                  onChange={(e) => {
                    setFormAssignedNumberId(e.target.value);
                    setFieldErrors((prev) => ({ ...prev, assigned_number_id: "" }));
                  }}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  disabled={saving || loadingNumbers}
                >
                  <option value="">Select phone number</option>
                  {assignedNumberOptions.map((n) => (
                    <option key={n.id} value={n.id}>
                      {n.label}
                    </option>
                  ))}
                </select>
                {fieldErrors.assigned_number_id && (
                  <p className="mt-1 text-xs text-red-600">{fieldErrors.assigned_number_id}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Transfer Number
                </label>
                <input
                  type="text"
                  value={transferNumber}
                  onChange={(e) => {
                    setTransferNumber(e.target.value);
                    setFieldErrors((prev) => ({ ...prev, transfer_number: "" }));
                  }}
                  onBlur={() => setTransferNumber((v) => normalizePhoneInput(v))}
                  placeholder="+919876543210"
                  maxLength={32}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  disabled={saving}
                />
                {fieldErrors.transfer_number && (
                  <p className="mt-1 text-xs text-red-600">{fieldErrors.transfer_number}</p>
                )}
              </div>

              {fieldErrors._form && (
                <p className="text-xs text-red-600">{fieldErrors._form}</p>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm hover:bg-slate-50 disabled:opacity-60"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
                >
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
