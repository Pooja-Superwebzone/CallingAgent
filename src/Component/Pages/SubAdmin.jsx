

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
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

    const adminsPerPage = 15;

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
        setValue,
    } = useForm();

    useEffect(() => {
        fetchAdmins();
    }, []);

    const fetchAdmins = async () => {
        setLoading(true);
        try {
            const res = await getAllTwillioUsers();
            setAdmins(res);
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

    const onSubmit = async (data) => {
        const payload = {
            name: data.name,
            email: data.email,
            contact_no: data.contact_no,
            password: data.password,
            minute: data.minute,
        };

        // Include gender only in edit mode
        if (editMode) {
            payload.gender = data.gender;
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
        setValue('name', admin.name);
        setValue('email', admin.email || '');
        setValue('contact_no', admin.contact_no || '');
        setValue('minute', admin.twilio_user_minute?.minute || '');
        setValue('password', '');
        setValue('gender', admin.gender || '');
        setEditId(admin.id);
        setEditMode(true);
        setShowModal(true);
    };

    const handleCreateOpen = () => {
        reset();
        setEditMode(false);
        setEditId(null);
        setValue('name', '');
        setValue('email', '');
        setValue('contact_no', '');
        setValue('password', '');
        setValue('minute', '');
        setShowModal(true);
    };

    return (

        <div className="p-4 sm:p-6 md:p-7 w-full">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-700">SubAdmin</h2>
                <button
                    onClick={handleCreateOpen}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                    Create Admin
                </button>
            </div>
            {/* Table or Loader */}
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
                                <th className="px-4 py-3">Call Minute</th>
                                <th className="px-4 py-3">Action</th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-700">
                            {currentAdmins.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="text-center py-6">
                                        No admins found
                                    </td>
                                </tr>
                            ) : (
                                currentAdmins.map((admin, index) => (
                                    <tr key={admin.id} className="border-b border-gray-300 hover:bg-gray-50">
                                        <td className="px-4 py-2">{indexOfFirstAdmin + index + 1}</td>
                                        <td className="px-4 py-2 capitalize">{admin.name}</td>
                                        <td className="px-4 py-2">{admin.email || '-'}</td>
                                        <td className="px-4 py-2">{admin.contact_no || '-'}</td>
                                        <td className="px-4 py-2 capitalize">{admin.gender || '-'}</td>
                                        <td className="px-4 py-2">{admin.twilio_user_minute?.minute || '0'} min</td>
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
            {/* Pagination */}
            {admins.length > adminsPerPage && (
                <div className="flex flex-col sm:flex-row justify-between mt-4">
                    <div className="text-sm text-gray-600">
                        Showing {indexOfFirstAdmin + 1} to {Math.min(indexOfLastAdmin, admins.length)} of {admins.length} results
                    </div>
                    <div className="flex gap-1">
                        <button
                            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                            disabled={currentPage === 1}
                            className="px-3 py-1 border rounded disabled:opacity-50"
                        >
                            Previous
                        </button>
                        {[...Array(totalPages)].map((_, idx) => (
                            <button
                                key={idx + 1}
                                onClick={() => setCurrentPage(idx + 1)}
                                className={`px-3 py-1 border rounded ${currentPage === idx + 1 ? 'bg-blue-600 text-white' : 'bg-white'}`}
                            >
                                {idx + 1}
                            </button>
                        ))}
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
                <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center">
                    <div className="bg-white max-w-md w-full p-6 rounded-2xl shadow-lg relative mx-3">
                        <h3 className="text-2xl font-semibold mb-4 text-gray-800">
                            {editMode ? 'Edit Admin' : 'Create Admin'}
                        </h3>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <div>
                                <label className="block text-gray-700">Name</label>
                                <input
                                    {...register('name', { required: 'Name is required' })}
                                    className="w-full border px-3 py-2 rounded"
                                    placeholder="Enter name"
                                />
                                {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
                            </div>
                            <div>
                                <label className="block text-gray-700">Email</label>
                                <input
                                    {...register('email')}
                                    className="w-full border px-3 py-2 rounded"
                                    placeholder="Enter email"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-700">Contact No</label>
                                <input
                                    {...register('contact_no')}
                                    className="w-full border px-3 py-2 rounded"
                                    placeholder="Enter contact number"
                                />
                            </div>

                            {editMode && (
                                <div>
                                    <label className="block text-gray-700">Gender</label>
                                    <select
                                        {...register('gender')}
                                        className="w-full border px-3 py-2 rounded"
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
                                        className="w-full border px-3 py-2 rounded"
                                        placeholder="Enter password"
                                    />
                                    {errors.password && (
                                        <p className="text-red-500 text-sm">{errors.password.message}</p>
                                    )}
                                </div>
                            )}

                            <div>
                                <label className="block text-gray-700">Call Minute</label>
                                <input
                                    {...register('minute', { required: 'Call minute is required' })}
                                    type="number"
                                    className="w-full border px-3 py-2 rounded"
                                    placeholder="Enter call minute"
                                />
                                {errors.minute && (
                                    <p className="text-red-500 text-sm">{errors.minute.message}</p>
                                )}
                            </div>
                            <div className="flex justify-end gap-2 pt-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowModal(false);
                                        setEditMode(false);
                                        reset();
                                    }}
                                    className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                                >
                                    {editMode ? 'Update' : 'Create'}
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
