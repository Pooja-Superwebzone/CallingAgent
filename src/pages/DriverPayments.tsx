import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { mockDriverPayments, mockDrivers, mockLogSheets } from '@/data/mockData';
import { Plus, Edit2, Filter, Search } from 'lucide-react';

const PAGE_SIZE = 5;

const DriverPayments: React.FC = () => {
  const [payments, setPayments] = useState([...mockDriverPayments]);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [form, setForm] = useState<any>({});
  const [editJustification, setEditJustification] = useState('');
  const [formError, setFormError] = useState('');

  // Filtered and searched payments
  const filteredPayments = useMemo(() => {
    let data = payments;
    if (search) {
      data = data.filter(p =>
        p.driverName.toLowerCase().includes(search.toLowerCase()) ||
        p.logSheetId.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (filterStatus !== 'all') {
      data = data.filter(p => p.status === filterStatus);
    }
    return data;
  }, [payments, search, filterStatus]);

  // Pagination
  const totalPages = Math.ceil(filteredPayments.length / PAGE_SIZE);
  const paginatedPayments = filteredPayments.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  // Handlers
  const openCreate = () => {
    setModalMode('create');
    setForm({ amount: '', date: '', status: 'Pending', notes: '', logSheetId: '' });
    setEditJustification('');
    setFormError('');
    setShowModal(true);
  };
  const openEdit = (payment: any) => {
    setModalMode('edit');
    setForm({ ...payment });
    setEditJustification('');
    setFormError('');
    setShowModal(true);
  };
  const closeModal = () => setShowModal(false);

  const handleFormChange = (field: string, value: any) => {
    setForm((f: any) => ({ ...f, [field]: value }));
  };

  const handleSave = () => {
    // Validation
    if (!form.amount || !form.date || !form.status || !form.logSheetId) {
      setFormError('All fields are required.');
      return;
    }
    if (modalMode === 'edit' && !editJustification.trim()) {
      setFormError('Justification is required for editing a payment.');
      return;
    }
    if (modalMode === 'create') {
      // Get driver from log sheet
      const logSheet = mockLogSheets.find(ls => ls.id === form.logSheetId);
      const driver = mockDrivers.find(d => d.id === logSheet?.driverId);
      const newPayment = {
        id: `p${payments.length + 1}`,
        driverId: driver?.id || '',
        driverName: driver?.name || '',
        logSheetId: form.logSheetId,
        amount: Number(form.amount),
        date: form.date,
        status: form.status,
        notes: form.notes || '',
      };
      setPayments([newPayment, ...payments]);
    } else {
      setPayments(payments.map(p => p.id === form.id ? { ...form } : p));
    }
    setShowModal(false);
  };

  // Table columns: Payment ID, Driver Name, Log Sheet ID, Amount, Date, Status, Actions
  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-blue-700">Driver Payments</h1>
          <p className="text-muted-foreground">Manage and track payments to drivers</p>
        </div>
        <Button onClick={openCreate} className="bg-blue-600 text-white"><Plus className="mr-2 h-4 w-4" /> New Payment</Button>
      </div>
      <Card>
        <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-2">
          <div className="flex gap-2 items-center">
            <Input
              placeholder="Search by driver or log sheet..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-64"
            />
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Paid">Paid</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto" style={{ maxHeight: 400 }}>
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-blue-50">
                <th className="p-2 text-left">Payment ID</th>
                <th className="p-2 text-left">Driver Name</th>
                <th className="p-2 text-left">Log Sheet ID</th>
                <th className="p-2 text-left">Amount</th>
                <th className="p-2 text-left">Date</th>
                <th className="p-2 text-left">Status</th>
                <th className="p-2 text-left">Notes</th>
                <th className="p-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedPayments.map((p, i) => (
                <tr key={p.id} className="border-b hover:bg-blue-50">
                  <td className="p-2 font-medium">{p.id}</td>
                  <td className="p-2">{p.driverName}</td>
                  <td className="p-2">{p.logSheetId}</td>
                  <td className="p-2">₹{p.amount.toLocaleString()}</td>
                  <td className="p-2">{p.date}</td>
                  <td className="p-2">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      p.status === 'Paid' ? 'bg-green-100 text-green-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="p-2">{p.notes}</td>
                  <td className="p-2">
                    <Button size="sm" variant="outline" onClick={() => openEdit(p)}><Edit2 className="h-4 w-4" /></Button>
                  </td>
                </tr>
              ))}
              {paginatedPayments.length === 0 && (
                <tr><td colSpan={8} className="text-center p-4 text-gray-400">No payments found.</td></tr>
              )}
            </tbody>
          </table>
        </CardContent>
        {/* Pagination */}
        <div className="flex justify-end items-center gap-2 p-4">
          <Button size="sm" variant="outline" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>Prev</Button>
          <span>Page {currentPage} of {totalPages || 1}</span>
          <Button size="sm" variant="outline" disabled={currentPage === totalPages || totalPages === 0} onClick={() => setCurrentPage(p => p + 1)}>Next</Button>
        </div>
      </Card>

      {/* Modal for Create/Edit */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{modalMode === 'create' ? 'Create Payment' : 'Edit Payment'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {modalMode === 'create' && (
              <div>
                <label className="block text-sm font-medium mb-1">Log Sheet</label>
                <Select value={form.logSheetId} onValueChange={v => handleFormChange('logSheetId', v)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Log Sheet" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockLogSheets.map(ls => (
                      <SelectItem key={ls.id} value={ls.id}>{ls.description} ({ls.date})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.logSheetId && (
                  <div className="text-xs text-gray-500 mt-1">
                    Driver: {mockDrivers.find(d => d.id === mockLogSheets.find(ls => ls.id === form.logSheetId)?.driverId)?.name || '-'}
                  </div>
                )}
              </div>
            )}
            {modalMode === 'edit' && (
              <div>
                <label className="block text-sm font-medium mb-1">Log Sheet ID</label>
                <Input value={form.logSheetId} disabled className="bg-gray-100" />
                <div className="text-xs text-gray-500 mt-1">
                  Driver: {form.driverName}
                </div>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium mb-1">Amount</label>
              <Input type="number" value={form.amount} onChange={e => handleFormChange('amount', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Date</label>
              <Input type="date" value={form.date} onChange={e => handleFormChange('date', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <Select value={form.status} onValueChange={v => handleFormChange('status', v)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Paid">Paid</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Notes</label>
              <Input value={form.notes} onChange={e => handleFormChange('notes', e.target.value)} />
            </div>
            {modalMode === 'edit' && (
              <div>
                <label className="block text-sm font-medium mb-1">Justification <span className="text-red-500">*</span></label>
                <Input value={editJustification} onChange={e => setEditJustification(e.target.value)} required />
              </div>
            )}
            {formError && <div className="text-red-500 text-sm">{formError}</div>}
          </div>
          <DialogFooter className="mt-4">
            <Button onClick={handleSave} className="bg-blue-600 text-white w-full">{modalMode === 'create' ? 'Create Payment' : 'Save Changes'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DriverPayments; 