import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  UserPlus,
  Search,
  Phone,
  MapPin,
  FileText,
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  Receipt,
  X,
  Edit2,
  Trash2,
  IndianRupee,
  Check
} from 'lucide-react';
import { expenseApi } from '../services/api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { formatCurrency, formatDate, PAYMENT_MODES } from '../utils/formatters';
import { TableSkeleton } from '../components/LoadingSkeleton';

export const Customers = () => {
  const toast = useToast();
  const { user } = useAuth();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all'); // all, dues, settled

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    notes: ''
  });

  // Collect Payment Modal state
  const [paymentCustomer, setPaymentCustomer] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMode, setPaymentMode] = useState('Cash');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentNotes, setPaymentNotes] = useState('');
  const [submittingPayment, setSubmittingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState('');

  const fetchCustomers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await expenseApi.getCustomers();
      setCustomers(data || []);
    } catch (err) {
      console.error('Failed to load customers:', err);
      setError(err.message || 'Failed to load customer list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [user?.id]);

  const handleOpenAdd = () => {
    setEditingCustomer(null);
    setFormData({ name: '', phone: '', address: '', notes: '' });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (customer, e) => {
    e.stopPropagation();
    setEditingCustomer(customer);
    setFormData({
      name: customer.name || '',
      phone: customer.phone || '',
      address: customer.address || '',
      notes: customer.notes || ''
    });
    setIsAddModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Customer name is required.');
      return;
    }

    setSubmitting(true);
    try {
      if (editingCustomer) {
        await expenseApi.updateCustomer(editingCustomer.id, formData);
        toast.success(`Customer "${formData.name}" updated successfully!`);
      } else {
        await expenseApi.createCustomer(formData);
        toast.success(`Customer "${formData.name}" added to Khata!`);
      }
      setIsAddModalOpen(false);
      fetchCustomers();
    } catch (err) {
      toast.error(err.message || 'Failed to save customer.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, name, e) => {
    e.stopPropagation();
    if (!window.confirm(`Are you sure you want to delete customer "${name}"?`)) {
      return;
    }
    try {
      await expenseApi.deleteCustomer(id);
      toast.success(`Customer "${name}" deleted.`);
      fetchCustomers();
    } catch (err) {
      toast.error(err.message || 'Failed to delete customer.');
    }
  };

  const handleOpenPaymentModal = (customer) => {
    setPaymentCustomer(customer);
    const due = parseFloat(customer.totalUnpaid || 0);
    setPaymentAmount(due > 0 ? due.toString() : '');
    setPaymentMode('Cash');
    setPaymentDate(new Date().toISOString().split('T')[0]);
    setPaymentNotes('');
    setPaymentError('');
  };

  const handleRecordPaymentSubmit = async (e) => {
    e.preventDefault();
    if (!paymentCustomer) return;
    const amt = parseFloat(paymentAmount);
    if (isNaN(amt) || amt <= 0) {
      setPaymentError('Payment amount must be greater than zero.');
      return;
    }

    setSubmittingPayment(true);
    setPaymentError('');
    try {
      const payload = {
        amount: amt,
        paymentMode,
        paymentDate,
        notes: paymentNotes,
      };

      const updated = await expenseApi.recordCustomerPayment(paymentCustomer.id, payload);
      toast.success(`Collected ${formatCurrency(amt)} from ${updated.name}! Remaining due: ${formatCurrency(updated.totalUnpaid)}`);
      setPaymentCustomer(null);
      fetchCustomers();
    } catch (err) {
      setPaymentError(err.message || 'Failed to record payment.');
      toast.error(err.message || 'Failed to record payment.');
    } finally {
      setSubmittingPayment(false);
    }
  };

  // Filtered customer list
  const filteredCustomers = customers.filter((c) => {
    const q = search.toLowerCase().trim();
    const matchesSearch =
      !q ||
      c.name.toLowerCase().includes(q) ||
      (c.phone && c.phone.includes(q)) ||
      (c.address && c.address.toLowerCase().includes(q));

    if (!matchesSearch) return false;

    if (filter === 'dues') {
      return parseFloat(c.totalUnpaid || 0) > 0;
    }
    if (filter === 'settled') {
      return parseFloat(c.totalUnpaid || 0) <= 0;
    }
    return true;
  });

  // Calculate totals
  const totalDues = customers.reduce((sum, c) => sum + parseFloat(c.totalUnpaid || 0), 0);
  const totalSales = customers.reduce((sum, c) => sum + parseFloat(c.totalPurchases || 0), 0);
  const totalPaid = customers.reduce((sum, c) => sum + parseFloat(c.totalPaid || 0), 0);
  const customersWithDues = customers.filter((c) => parseFloat(c.totalUnpaid || 0) > 0).length;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight">
            Farmer & Customer Khata Book
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Manage accounts for dairy farmers, milk buyers, and cattle feed purchasers. Track purchases and collect pending udhaar.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-medium shadow-md shadow-emerald-500/20 hover:shadow-lg transition-all"
        >
          <UserPlus className="w-5 h-5" />
          <span>New Customer Profile</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold uppercase text-slate-400">Total Customers</span>
            <h3 className="text-2xl font-bold text-slate-900">{customers.length}</h3>
            <span className="text-xs text-slate-500">{customersWithDues} with pending dues</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-rose-200 shadow-sm flex items-center space-x-4 bg-gradient-to-br from-rose-50/50 to-white">
          <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold uppercase text-rose-500">Total Udhaar / Due</span>
            <h3 className="text-2xl font-bold text-rose-600">{formatCurrency(totalDues)}</h3>
            <span className="text-xs text-rose-500/80 font-medium">To be collected</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold uppercase text-slate-400">Paid Collected</span>
            <h3 className="text-2xl font-bold text-emerald-600">{formatCurrency(totalPaid)}</h3>
            <span className="text-xs text-slate-500">From customer bills</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold uppercase text-slate-400">Customer Sales</span>
            <h3 className="text-2xl font-bold text-slate-900">{formatCurrency(totalSales)}</h3>
            <span className="text-xs text-slate-500">Gross customer ledger</span>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search customer name, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
              filter === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All ({customers.length})
          </button>
          <button
            onClick={() => setFilter('dues')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
              filter === 'dues'
                ? 'bg-rose-600 text-white'
                : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
            }`}
          >
            Pending Dues ({customersWithDues})
          </button>
          <button
            onClick={() => setFilter('settled')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
              filter === 'settled'
                ? 'bg-emerald-600 text-white'
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
            }`}
          >
            Settled ({customers.length - customersWithDues})
          </button>
        </div>
      </div>

      {/* Customer List */}
      {loading ? (
        <TableSkeleton rows={5} />
      ) : error ? (
        <div className="p-8 text-center bg-white rounded-2xl border border-rose-100 text-rose-600">
          <AlertCircle className="w-8 h-8 mx-auto mb-2" />
          <p>{error}</p>
        </div>
      ) : filteredCustomers.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200/80">
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-700">No Customers Found</h3>
          <p className="text-slate-500 text-sm mt-1 max-w-sm mx-auto">
            {search
              ? 'No customer matched your search. Try another keyword.'
              : 'Add your first grocery customer profile to start tracking their khata!'}
          </p>
          {!search && (
            <button
              onClick={handleOpenAdd}
              className="mt-4 inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add First Customer</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCustomers.map((cust) => {
            const hasDues = parseFloat(cust.totalUnpaid || 0) > 0;
            return (
              <div
                key={cust.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 hover:shadow-md transition-all hover:border-slate-300 flex flex-col justify-between"
              >
                <div>
                  {/* Top Bar */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                        {cust.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-base leading-tight">
                          {cust.name}
                        </h4>
                        {cust.phone ? (
                          <div className="flex items-center space-x-1 text-slate-400 text-xs mt-0.5">
                            <Phone className="w-3 h-3" />
                            <span>{cust.phone}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-xs">No phone recorded</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-1">
                      <button
                        onClick={(e) => handleOpenEdit(cust, e)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                        title="Edit Customer"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => handleDelete(cust.id, cust.name, e)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Delete Customer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Address / Notes */}
                  {(cust.address || cust.notes) && (
                    <div className="mt-3 text-xs text-slate-500 space-y-1 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      {cust.address && (
                        <div className="flex items-start space-x-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                          <span className="line-clamp-1">{cust.address}</span>
                        </div>
                      )}
                      {cust.notes && (
                        <div className="flex items-start space-x-1.5">
                          <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                          <span className="line-clamp-1 text-slate-400">{cust.notes}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Financial Breakdown */}
                  <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-xs text-slate-400 font-medium">Total Billed</span>
                      <p className="text-sm font-semibold text-slate-700">
                        {formatCurrency(cust.totalPurchases || 0)}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-xs text-slate-400 font-medium">Pending Due</span>
                      <p
                        className={`text-base font-bold ${
                          hasDues ? 'text-rose-600' : 'text-emerald-600'
                        }`}
                      >
                        {formatCurrency(cust.totalUnpaid || 0)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span
                    className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                      hasDues
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}
                  >
                    {hasDues ? <Clock className="w-3 h-3 mr-1" /> : <CheckCircle2 className="w-3 h-3 mr-1" />}
                    <span>{hasDues ? 'Udhaar Due' : 'All Settled'}</span>
                  </span>

                  <div className="flex items-center space-x-1.5">
                    {hasDues && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenPaymentModal(cust);
                        }}
                        className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-amber-800 bg-amber-100 hover:bg-amber-200 transition-colors flex items-center space-x-1 shadow-xs"
                        title="Collect Due Payment"
                      >
                        <IndianRupee className="w-3 h-3" />
                        <span>Collect</span>
                      </button>
                    )}
                    <Link
                      to={`/add-expense?customerId=${cust.id}&customerName=${encodeURIComponent(
                        cust.name
                      )}&customerPhone=${encodeURIComponent(cust.phone || '')}`}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors"
                    >
                      + Sale
                    </Link>
                    <Link
                      to={`/customers/${cust.id}`}
                      className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 transition-colors"
                    >
                      <span>Ledger</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Customer Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-100">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-lg">
                {editingCustomer ? 'Edit Customer' : 'Add New Customer'}
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Customer Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kumar, Sunita Devi"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  placeholder="e.g. 9876543210"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Address / Locality
                </label>
                <input
                  type="text"
                  placeholder="e.g. House 44, Gali No. 2, Near Mandir"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Notes
                </label>
                <textarea
                  rows="2"
                  placeholder="e.g. Regular milk buyer, pays monthly on 5th"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                />
              </div>

              <div className="pt-3 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-medium text-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-medium text-sm shadow-md shadow-emerald-500/20 disabled:opacity-50 transition-all"
                >
                  {submitting ? 'Saving...' : editingCustomer ? 'Update Profile' : 'Save Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* COLLECT PAYMENT MODAL */}
      {paymentCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-bold">
                  <IndianRupee className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Collect Due Payment</h3>
                  <p className="text-xs text-slate-500">{paymentCustomer.name}</p>
                </div>
              </div>
              <button
                onClick={() => setPaymentCustomer(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRecordPaymentSubmit} className="p-6 space-y-4">
              {paymentError && (
                <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs font-medium">
                  {paymentError}
                </div>
              )}

              {/* Outstanding Due Overview */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/70 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Total Udhaar Pending
                  </span>
                  <span className="text-xl font-extrabold text-rose-600">
                    {formatCurrency(paymentCustomer.totalUnpaid || 0)}
                  </span>
                </div>
                <div className="flex space-x-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setPaymentAmount(paymentCustomer.totalUnpaid.toString());
                    }}
                    className="px-2.5 py-1 text-xs font-bold rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
                  >
                    Pay Full
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const half = (parseFloat(paymentCustomer.totalUnpaid || 0) / 2).toFixed(2);
                      setPaymentAmount(half);
                    }}
                    className="px-2.5 py-1 text-xs font-bold rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200"
                  >
                    Pay 50%
                  </button>
                </div>
              </div>

              {/* Payment Amount Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Payment Amount to Collect (₹) *
                </label>
                <div className="relative">
                  <IndianRupee className="w-4 h-4 text-emerald-600 absolute left-3.5 top-3" />
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    placeholder="e.g. 1200"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-base font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Live Remaining Balance Preview */}
              {(() => {
                const maxDue = parseFloat(paymentCustomer.totalUnpaid || 0);
                const entering = parseFloat(paymentAmount || 0);
                const remaining = Math.max(0, maxDue - entering);
                return (
                  <div className="p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-xl flex items-center justify-between text-xs">
                    <span className="font-semibold text-emerald-800">Remaining Due After Payment:</span>
                    <span className="font-extrabold text-sm text-emerald-900">
                      {formatCurrency(remaining)}
                    </span>
                  </div>
                );
              })()}

              {/* Payment Mode and Date */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Payment Mode
                  </label>
                  <select
                    value={paymentMode}
                    onChange={(e) => setPaymentMode(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {PAYMENT_MODES.filter(m => m !== 'Credit / Udhaar (Khata)').map((mode) => (
                      <option key={mode} value={mode}>
                        {mode}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Payment Date
                  </label>
                  <input
                    type="date"
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Payment Note (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Paid in cash, remaining balance next week"
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Actions */}
              <div className="pt-2 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setPaymentCustomer(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-medium text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingPayment}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs shadow-md shadow-emerald-500/20 disabled:opacity-50 transition-all flex items-center space-x-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>{submittingPayment ? 'Recording...' : 'Confirm & Collect'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customers;
