import React, { useCallback, useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import {
  createAssignedNumber,
  deleteAssignedNumber,
  getApiErrorMessage,
  getAssignedNumbers,
  normalizePhoneInput,
  updateAssignedNumber,
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

function TableSkeleton() {
  return (
    <>
      {[1, 2, 3, 4].map((i) => (
        <tr key={i} className="border-t border-slate-100 animate-pulse">
          <td className="px-4 py-3"><div className="h-4 w-8 bg-slate-200 rounded" /></td>
          <td className="px-4 py-3"><div className="h-4 w-36 bg-slate-200 rounded" /></td>
          <td className="px-4 py-3"><div className="h-4 w-40 bg-slate-200 rounded" /></td>
          <td className="px-4 py-3"><div className="h-4 w-20 bg-slate-200 rounded ml-auto" /></td>
        </tr>
      ))}
    </>
  );
}

export default function AssignedPhoneNumbersTab({ onAddNumber }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [phoneNo, setPhoneNo] = useState("");
  const [fieldError, setFieldError] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchRows = useCallback(async (phoneFilter) => {
    setLoading(true);
    try {
      const res = await getAssignedNumbers(phoneFilter || undefined);
      setRows(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to load phone numbers"));
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRows();
  }, [fetchRows]);

  const handleSearch = (e) => {
    e.preventDefault();
    const q = searchInput.trim();
    setSearch(q);
    fetchRows(q || undefined);
  };

  const openCreate = () => {
    setEditId(null);
    setPhoneNo("");
    setFieldError("");
    setShowModal(true);
  };

  const openEdit = (row) => {
    setEditId(row.id);
    setPhoneNo(row.phone_no || "");
    setFieldError("");
    setShowModal(true);
  };

  const closeModal = () => {
    if (saving) return;
    setShowModal(false);
    setEditId(null);
    setPhoneNo("");
    setFieldError("");
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const normalized = normalizePhoneInput(phoneNo);
    const validation = validatePhoneNo(normalized);
    if (validation) {
      setFieldError(validation);
      return;
    }
    setFieldError("");
    setSaving(true);
    try {
      if (editId) {
        const res = await updateAssignedNumber(editId, normalized);
        toast.success(res.message || "Phone number updated");
      } else {
        const res = await createAssignedNumber(normalized);
        toast.success(res.message || "Phone number added");
      }
      closeModal();
      fetchRows(search || undefined);
    } catch (err) {
      const msg = getApiErrorMessage(err, "Failed to save phone number");
      setFieldError(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (row) => {
    const ok = window.confirm(
      "Delete this number? User assignments using it will also be removed."
    );
    if (!ok) return;
    try {
      const res = await deleteAssignedNumber(row.id);
      toast.success(res.message || "Phone number deleted");
      fetchRows(search || undefined);
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to delete phone number"));
    }
  };

  return (
    <>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-xl font-bold text-gray-700">Assigned Phone Numbers</h3>
          <p className="mt-1 text-sm text-slate-500">
            Master pool of Plivo numbers used for outbound and drip calls.
          </p>
        </div>
        <button
          type="button"
          onClick={() => (onAddNumber ? onAddNumber() : openCreate())}
          className="self-start rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
        >
          Add Number
        </button>
      </div>

      <form onSubmit={handleSearch} className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center">
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search by phone number..."
          className="w-full sm:max-w-xs rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
        <button
          type="submit"
          className="rounded-lg bg-gray-600 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
        >
          Search
        </button>
        {search && (
          <button
            type="button"
            onClick={() => {
              setSearchInput("");
              setSearch("");
              fetchRows();
            }}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
          >
            Clear
          </button>
        )}
      </form>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-[760px] w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-600">
              <tr>
                <th className="px-4 py-3 font-semibold">ID</th>
                <th className="px-4 py-3 font-semibold">Phone Number</th>
                <th className="px-4 py-3 font-semibold">Created At</th>
                <th className="px-4 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-slate-800">
              {loading ? (
                <TableSkeleton />
              ) : rows.length === 0 ? (
                <tr className="border-t border-slate-100">
                  <td colSpan={4} className="px-4 py-10 text-center text-slate-500">
                    No phone numbers yet. Click Add Number.
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={row.id} className="border-t border-slate-100 hover:bg-slate-50/60">
                    <td className="px-4 py-3">{row.id}</td>
                    <td className="px-4 py-3 font-medium">{row.phone_no}</td>
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
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h4 className="text-lg font-bold text-gray-800">
              {editId ? "Edit Phone Number" : "Add Phone Number"}
            </h4>
            <form onSubmit={handleSave} className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={phoneNo}
                  onChange={(e) => {
                    setPhoneNo(e.target.value);
                    setFieldError("");
                  }}
                  onBlur={() => setPhoneNo((v) => normalizePhoneInput(v))}
                  placeholder="+918031453036"
                  maxLength={32}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  disabled={saving}
                  autoFocus
                />
                <p className="mt-1 text-xs text-slate-500">
                  E.164 format preferred. 10-digit Indian numbers auto-prefix +91.
                </p>
                {fieldError && (
                  <p className="mt-1 text-xs text-red-600">{fieldError}</p>
                )}
              </div>
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
