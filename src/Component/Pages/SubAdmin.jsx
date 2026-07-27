

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import Cookies from 'js-cookie';
import service from '../../api/axios';
import {
  createTwillioUser,
  getAllTwillioUsers,
  updateTwillioUser,
} from '../../hooks/useAuth';

const SubAdmin = () => {
  const [admins, setAdmins] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);

  // Filters in header (API: twillio-create-readall?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD&role=admin|channelpartner)
  const [filterRole, setFilterRole] = useState(""); // "admin" | "channelpartner"
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");
  
  // Two-way minutes edit modal state
  const [showTwoWayModal, setShowTwoWayModal] = useState(false);
  const [twoWayEditId, setTwoWayEditId] = useState(null);
  const [twoWayLoading, setTwoWayLoading] = useState(false);

  const adminsPerPage = 15;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setValue,
    watch,
  } = useForm();

  // Two-way minutes form
  const {
    register: registerTwoWay,
    handleSubmit: handleSubmitTwoWay,
    reset: resetTwoWay,
    formState: { errors: errorsTwoWay },
    setValue: setValueTwoWay,
  } = useForm();

  const selectedRole = watch('role');

  const formatLocation = (value) => {
    const text = String(value ?? "").trim();
    if (!text || text.toLowerCase() === "null") return "-";
    return text;
  };

  useEffect(() => {
    // Load all data initially and refetch whenever filters change.
    if (filterStartDate && filterEndDate && filterStartDate > filterEndDate) return;
    fetchAdmins();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterRole, filterStartDate, filterEndDate]);

  useEffect(() => {
    if (editMode) return; // 🚫 Don't run when editing
  
    if (selectedRole === "admin") {
      setValue("oneWayMinute", 10);
      setValue("twoWayMinute", 10);
      setValue("internationalMinute", 5);
    } else if (selectedRole === "franchise") {
      setValue("oneWayMinute", 25);
      setValue("twoWayMinute", 25);
      setValue("internationalMinute", 10);
    }
  }, [selectedRole, setValue, editMode]);
  
  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const params = {
        ...(filterRole ? { role: filterRole } : {}),
        ...(filterStartDate ? { start_date: filterStartDate } : {}),
        ...(filterEndDate ? { end_date: filterEndDate } : {}),
      };
      const res = await getAllTwillioUsers(params);
      const list = Array.isArray(res)
        ? res
        : res?.data || res?.data?.data || res?.users || [];
      setAdmins(Array.isArray(list) ? list : []);
    } catch (err) {
      toast.error('Failed to load admins');
    } finally {
      setLoading(false);
    }
  };

  const indexOfLastAdmin = currentPage * adminsPerPage;
  const indexOfFirstAdmin = indexOfLastAdmin - adminsPerPage;
  const currentAdmins = admins.slice(indexOfFirstAdmin, indexOfLastAdmin);
  const totalPages = Math.ceil(admins.length / adminsPerPage);

  const applyFilters = () => {
    const start = String(filterStartDate || "").trim();
    const end = String(filterEndDate || "").trim();

    if (start && end && start > end) return toast.error("Start date must be before end date");

    setCurrentPage(1);
    fetchAdmins();
  };

const onSubmit = async (data) => {
  const payload = {
    name: data.name,
    email: data.email,
    contact_no: data.contact_no,
    location: String(data.location || "").trim(),
    minute: data.oneWayMinute, // Keep legacy field for backward compatibility
    one_way: data.oneWayMinute,
    two_way: data.twoWayMinute,
    international: data.internationalMinute,
    role: data.role,
    total_duration_minutes: data.total_duration_minutes,
  };

  if (editMode) {
    payload.gender = data.gender || '';
  } else {
    payload.password = data.password;
  }

  try {
    if (editMode) {
      await updateTwillioUser(editId, payload);
      toast.success('Admin updated successfully');
    } else {
      await createTwillioUser(payload);
      toast.success('Admin created successfully');
    }

    reset();
    setShowModal(false);
    setEditMode(false);
    setEditId(null);
    fetchAdmins();
  } catch (err) {
    const errorMessage =
      err?.response?.data?.message ||
      Object.values(err?.response?.data?.errors || {})[0]?.[0] ||
      err?.message ||
      'Operation failed';
    toast.error(errorMessage);
  }
};


  const handleEdit = (admin) => {
    console.log("Editing admin:", admin); // Debug log
    setEditMode(true);
    setEditId(admin.id);
    setValue('name', admin.name || '');
    setValue('email', admin.email || '');
    setValue('contact_no', admin.contact_no || '');
    setValue(
      'location',
      formatLocation(admin.location) === "-" ? "" : String(admin.location ?? "").trim()
    );
    setValue('oneWayMinute', admin.twilio_user_minute?.one_way || admin.twilio_user_minute?.oneWay || admin.twilio_user_minute?.outbound || admin.twilio_user_minute?.outbound_minute || admin.twilio_user_minute?.minute || '');
    setValue('twoWayMinute', admin.twilio_two_way_user_minute?.minute || admin.twilio_user_minute?.two_way || admin.twilio_user_minute?.twoWay || admin.twilio_user_minute?.inbound || admin.twilio_user_minute?.inbound_minute || '');
    setValue('internationalMinute', admin.twilio_user_minute?.international || admin.twilio_user_minute?.international_minute || admin.twilio_user_minute?.intl || '');
    setValue('password', '');
    setValue('gender', admin.gender || '');
    setValue('role', admin.role || '');
    setShowModal(true);
  };

  const handleCreateOpen = () => {
    reset();
    setEditMode(false);
    setEditId(null);
    setValue('name', '');
    setValue('email', '');
    setValue('contact_no', '');
    setValue('location', '');
    setValue('password', '');
    setValue('role', '');
    setValue('oneWayMinute', '');
    setValue('twoWayMinute', '');
    setValue('internationalMinute', '');
    setShowModal(true);
  };

  // Handle two-way minutes edit
  const handleTwoWayEdit = (admin) => {
    setTwoWayEditId(admin.id);
    setValueTwoWay('twoWayMinute', admin.twilio_two_way_user_minute?.minute || admin.twilio_user_minute?.two_way || admin.twilio_user_minute?.twoWay || admin.twilio_user_minute?.inbound || admin.twilio_user_minute?.inbound_minute || '0');
    setShowTwoWayModal(true);
  };

  // Submit two-way minutes update
  const onSubmitTwoWay = async (data) => {
    setTwoWayLoading(true);
    try {
      const response = await service.post('add-minute', {
        minute: data.twoWayMinute,
        user_id: twoWayEditId
      }, {
        headers: { 
          Authorization: `Bearer ${Cookies.get("CallingAgent")}` 
        }
      });

      toast.success('Two-way minutes updated successfully');
      
      // Close modal
      setShowTwoWayModal(false);
      setTwoWayEditId(null);
      resetTwoWay();
      
      // Refresh data from server
      fetchAdmins();
    } catch (err) {
      console.error('Error updating two-way minutes:', err);
      const errorMessage = err?.response?.data?.message || 'Failed to update two-way minutes';
      toast.error(errorMessage);
    } finally {
      setTwoWayLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-7 w-full">
      <div className="flex flex-col gap-3 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold text-gray-700">SubAdmin</h2>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:gap-3">
          <div className="flex flex-wrap items-end gap-2">
            <div>
              <label className="block text-[11px] font-semibold text-gray-600 mb-1">Role</label>
              <select
                value={filterRole}
                onChange={(e) => {
                  setFilterRole(e.target.value);
                  setCurrentPage(1);
                }}
                className="rounded-xl border border-slate-300 px-3 py-2 text-sm text-gray-700 bg-white"
              >
                <option value="">All roles</option>
                <option value="admin">admin</option>
                <option value="channelpartner">channelpartner</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-gray-600 mb-1">Start date</label>
              <input
                type="date"
                value={filterStartDate}
                onChange={(e) => {
                  setFilterStartDate(e.target.value);
                  setCurrentPage(1);
                }}
                className="rounded-xl border border-slate-300 px-3 py-2 text-sm text-gray-700 bg-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-gray-600 mb-1">End date</label>
              <input
                type="date"
                value={filterEndDate}
                onChange={(e) => {
                  setFilterEndDate(e.target.value);
                  setCurrentPage(1);
                }}
                className="rounded-xl border border-slate-300 px-3 py-2 text-sm text-gray-700 bg-white"
              />
            </div>

            <button
              type="button"
              onClick={applyFilters}
              className="h-[38px] px-4 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700"
            >
              Apply
            </button>
          </div>

          <button
            onClick={handleCreateOpen}
            className="h-[38px] px-4 bg-gray-600 text-white rounded-xl hover:bg-gray-700 text-sm font-semibold"
          >
            Create Admin
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col justify-center items-center h-[50vh] gap-4 bg-white rounded-xl shadow">
          <div className="animate-spin h-10 w-10 rounded-full border-4 border-blue-500 border-t-transparent" />
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl shadow">
          <table className="min-w-full bg-white text-md">
            <thead className="bg-gray-100 text-left text-gray-600">
              <tr>
                <th className="px-4 py-3">Sr No.</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3">Gender</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3">Minutes Used</th>
                <th className="px-4 py-3">Customer Care Head No</th>
                <th className="px-4 py-3">One-way Minutes</th>
                <th className="px-4 py-3">Two-way Minutes</th>
                <th className="px-4 py-3">International Minutes</th>
                <th className="px-4 py-3">Date & Time</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="text-gray-700">
              {currentAdmins.length === 0 ? (
                <tr>
                  <td colSpan="14" className="text-center py-6">
                    No admins found
                  </td>
                </tr>
              ) : (
                currentAdmins.map((admin, index) => (
                  <tr
                    key={admin.id}
                    className="border-b border-gray-300 hover:bg-gray-50"
                  >
                    <td className="px-4 py-2">{indexOfFirstAdmin + index + 1}</td>
                    <td className="px-4 py-2 capitalize">{admin.name}</td>
                    <td className="px-4 py-2">{admin.email || '-'}</td>
                    <td className="px-4 py-2">{admin.contact_no || '-'}</td>
                    <td className="px-4 py-2 capitalize">{admin.gender || '-'}</td>
                    <td className="px-4 py-2 capitalize">{admin.role || '-'}</td>
                    <td className="px-4 py-2">{formatLocation(admin.location)}</td>
                    <td className="px-4 py-2">{admin.total_duration_minutes || '-'}</td>
                    <td className="px-4 py-2">{admin.customer_care_head_no || '-'}</td>
                    <td className="px-4 py-2">
                      {admin.twilio_user_minute?.one_way || admin.twilio_user_minute?.oneWay || admin.twilio_user_minute?.outbound || admin.twilio_user_minute?.outbound_minute || admin.twilio_user_minute?.minute || '0'} min
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-2">
                        <span>{admin.twilio_two_way_user_minute?.minute || admin.twilio_user_minute?.two_way || admin.twilio_user_minute?.twoWay || admin.twilio_user_minute?.inbound || admin.twilio_user_minute?.inbound_minute || '0'} min</span>
                        <button
                          onClick={() => handleTwoWayEdit(admin)}
                          className="text-blue-600 hover:text-blue-800"
                          title="Edit two-way minutes"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-2">
                      {admin.twilio_user_minute?.international || admin.twilio_user_minute?.international_minute || admin.twilio_user_minute?.intl || '0'} min
                    </td>
                    <td className="px-4 py-2">
                      {admin.created_at 
                        ? new Date(admin.created_at).toLocaleString() 
                        : '-'}
                    </td>
                    <td className="px-4 py-2">
                      <button
                        onClick={() => handleEdit(admin)}
                        className="text-blue-600 hover:underline"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {!loading && admins.length > adminsPerPage && (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mt-4">
          <div className="text-sm text-gray-600">
            Showing {indexOfFirstAdmin + 1} to {Math.min(indexOfLastAdmin, admins.length)} of {admins.length} results
          </div>
          <div className="flex items-center flex-wrap gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Prev
            </button>
            <button
              className={`px-3 py-1 border rounded ${currentPage === 1 ? 'bg-blue-600 text-white' : ''}`}
              onClick={() => setCurrentPage(1)}
            >
              1
            </button>
            {currentPage > 3 && <span className="px-2">...</span>}
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(
                (page) =>
                  page !== 1 &&
                  page !== totalPages &&
                  Math.abs(currentPage - page) <= 1
              )
              .map((page) => (
                <button
                  key={page}
                  className={`px-3 py-1 border rounded ${currentPage === page ? 'bg-blue-600 text-white' : ''}`}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </button>
              ))}
            {currentPage < totalPages - 2 && <span className="px-2">...</span>}
            {totalPages > 1 && (
              <button
                className={`px-3 py-1 border rounded ${currentPage === totalPages ? 'bg-blue-600 text-white' : ''}`}
                onClick={() => setCurrentPage(totalPages)}
              >
                {totalPages}
              </button>
            )}
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-2">
          <div className="bg-white w-full max-w-sm p-3 rounded-lg shadow-lg relative max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-2 text-gray-800">
              {editMode ? 'Edit Admin' : 'Create Admin'}
            </h3>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
              <div>
                <label className="block text-gray-700">Name</label>
                <input
                  {...register('name', { required: 'Name is required' })}
                  className="w-full border px-2 py-1.5 rounded text-sm"
                  placeholder="Enter name"
                />
                {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
              </div>
              <div>
                <label className="block text-gray-700">Email</label>
                <input
                  {...register('email')}
                  className="w-full border px-2 py-1.5 rounded text-sm"
                  placeholder="Enter email"
                />
              </div>
              <div>
                <label className="block text-gray-700">Contact No</label>
                <input
                  {...register('contact_no')}
                  className="w-full border px-2 py-1.5 rounded text-sm"
                  placeholder="Enter contact number"
                />
              </div>
              <div>
                <label className="block text-gray-700">Location</label>
                <input
                  {...register('location')}
                  className="w-full border px-2 py-1.5 rounded text-sm"
                  placeholder="Enter city or location"
                />
              </div>
              <div>
                <label className="block text-gray-700">Role</label>
                <select
                  {...register('role', { required: 'Role is required' })}
                  className="w-full border px-2 py-1.5 rounded text-sm"
                >
                  <option value="">Select Role</option>
                  <option value="admin">Admin</option>
                  <option value="franchise">Franchise</option>
                  <option value="channelpartner">ASA</option>
                </select>
                {errors.role && <p className="text-red-500 text-sm">{errors.role.message}</p>}
              </div>

              {editMode && (
                <div>
                  <label className="block text-gray-700">Gender</label>
                  <select
                    {...register('gender')}
                    className="w-full border px-2 py-1.5 rounded text-sm"
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
              )}

              {!editMode && (
                <div>
                  <label className="block text-gray-700">Password</label>
                  <input
                    {...register('password', {
                      required: 'Password is required',
                      minLength: { value: 6, message: 'Min 6 characters' },
                    })}
                    type="password"
                    className="w-full border px-2 py-1.5 rounded text-sm"
                    placeholder="Enter password"
                  />
                  {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
                </div>
              )}

              <div>
                <label className="block text-gray-700 font-semibold mb-1">Call Minutes</label>
                <div className="space-y-1.5">
                  <div>
                    <label className="block text-gray-700 text-xs mb-1">One-way Minutes</label>
                    <input
                      {...register('oneWayMinute', { required: 'One-way minutes is required' })}
                      type="number"
                      min="0"
                      className="w-full border px-2 py-1.5 rounded text-sm"
                      placeholder="Enter one-way minutes"
                    />
                    {errors.oneWayMinute && <p className="text-red-500 text-xs">{errors.oneWayMinute.message}</p>}
                  </div>
                  <div>
                    <label className="block text-gray-700 text-xs mb-1">Two-way Minutes</label>
                    <input
                      {...register('twoWayMinute', { required: 'Two-way minutes is required' })}
                      type="number"
                      min="0"
                      className="w-full border px-2 py-1.5 rounded text-sm"
                      placeholder="Enter two-way minutes"
                    />
                    {errors.twoWayMinute && <p className="text-red-500 text-xs">{errors.twoWayMinute.message}</p>}
                  </div>
                  <div>
                    <label className="block text-gray-700 text-xs mb-1">International Minutes</label>
                    <input
                      {...register('internationalMinute', { required: 'International minutes is required' })}
                      type="number"
                      min="0"
                      className="w-full border px-2 py-1.5 rounded text-sm"
                      placeholder="Enter international minutes"
                    />
                    {errors.internationalMinute && <p className="text-red-500 text-xs">{errors.internationalMinute.message}</p>}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditMode(false);
                    reset();
                  }}
                  className="bg-gray-300 text-gray-800 px-3 py-1.5 rounded text-sm hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-3 py-1.5 rounded text-sm hover:bg-blue-700"
                >
                  {editMode ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Two-way Minutes Edit Modal */}
      {showTwoWayModal && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-2">
          <div className="bg-white w-full max-w-sm p-3 rounded-lg shadow-lg relative max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-2 text-gray-800">
              Edit Two-way Minutes
            </h3>
            <form onSubmit={handleSubmitTwoWay(onSubmitTwoWay)} className="space-y-2">
              <div>
                <label className="block text-gray-700 text-sm mb-1">Two-way Minutes</label>
                <input
                  {...registerTwoWay('twoWayMinute', { 
                    required: 'Two-way minutes is required',
                    min: { value: 0, message: 'Minutes must be 0 or greater' }
                  })}
                  type="number"
                  min="0"
                  className="w-full border px-2 py-1.5 rounded text-sm"
                  placeholder="Enter two-way minutes"
                />
                {errorsTwoWay.twoWayMinute && <p className="text-red-500 text-xs">{errorsTwoWay.twoWayMinute.message}</p>}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowTwoWayModal(false);
                    setTwoWayEditId(null);
                    resetTwoWay();
                  }}
                  className="bg-gray-300 text-gray-800 px-3 py-1.5 rounded text-sm hover:bg-gray-400"
                  disabled={twoWayLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-3 py-1.5 rounded text-sm hover:bg-blue-700 disabled:opacity-50"
                  disabled={twoWayLoading}
                >
                  {twoWayLoading ? 'Updating...' : 'Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubAdmin;
