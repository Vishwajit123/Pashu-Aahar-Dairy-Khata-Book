import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  IndianRupee,
  Calendar,
  AlertCircle,
  Loader2,
  User,
  Phone,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { expenseApi } from '../services/api';
import { useToast } from '../context/ToastContext';
import { CATEGORIES_LIST, PAYMENT_MODES } from '../utils/formatters';

export const EditExpense = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    expenseName: '',
    description: '',
    amount: '',
    expenseDate: '',
    category: 'Cattle Feed Pellets (Pashu Aahar)',
    modeOfPayment: 'Cash',
    customerId: null,
    customerName: 'Walk-in Customer',
    customerPhone: '',
    paymentStatus: 'PAID',
    paidAmount: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchExpense = async () => {
      setLoading(true);
      try {
        const data = await expenseApi.getExpenseById(id);
        setFormData({
          expenseName: data.expenseName || '',
          description: data.description || '',
          amount: data.amount != null ? data.amount.toString() : '',
          expenseDate: data.expenseDate || '',
          category: data.category || 'Cattle Feed Pellets (Pashu Aahar)',
          modeOfPayment: data.modeOfPayment || 'Cash',
          customerId: data.customerId || null,
          customerName: data.customerName || 'Walk-in Customer',
          customerPhone: data.customerPhone || '',
          paymentStatus: data.paymentStatus || 'PAID',
          paidAmount: data.paidAmount != null ? data.paidAmount.toString() : '',
        });
      } catch (err) {
        toast.error(err.message || `Transaction #${id} could not be loaded.`);
        navigate('/expenses');
      } finally {
        setLoading(false);
      }
    };

    fetchExpense();
  }, [id, navigate, toast]);

  const validate = () => {
    const errs = {};
    if (!formData.expenseName.trim()) {
      errs.expenseName = 'Item or bill name is required.';
    }

    if (!formData.amount) {
      errs.amount = 'Amount is required.';
    } else {
      const num = parseFloat(formData.amount);
      if (isNaN(num) || num <= 0) {
        errs.amount = 'Amount must be greater than 0.';
      }
    }

    if (!formData.customerName.trim()) {
      errs.customerName = 'Customer name is required.';
    }

    if (!formData.expenseDate) {
      errs.expenseDate = 'Date is required.';
    }

    if (formData.paymentStatus === 'PARTIAL') {
      const paid = parseFloat(formData.paidAmount);
      const total = parseFloat(formData.amount);
      if (isNaN(paid) || paid <= 0) {
        errs.paidAmount = 'Please enter the amount paid today.';
      } else if (paid >= total) {
        errs.paidAmount = 'For full payment, select Fully Paid option.';
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const totalAmt = parseFloat(formData.amount);
      let calculatedPaid = totalAmt;
      if (formData.paymentStatus === 'UNPAID') {
        calculatedPaid = 0;
      } else if (formData.paymentStatus === 'PARTIAL') {
        calculatedPaid = parseFloat(formData.paidAmount || 0);
      }

      const payload = {
        expenseName: formData.expenseName.trim(),
        description: formData.description.trim(),
        amount: totalAmt,
        expenseDate: formData.expenseDate,
        category: formData.category,
        modeOfPayment: formData.modeOfPayment,
        customerId: formData.customerId,
        customerName: formData.customerName.trim(),
        customerPhone: formData.customerPhone.trim(),
        paymentStatus: formData.paymentStatus,
        paidAmount: calculatedPaid,
      };

      await expenseApi.updateExpense(id, payload);
      toast.success(`Transaction #${id} updated successfully!`);
      navigate('/expenses');
    } catch (err) {
      toast.error(err.message || 'Failed to update transaction.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center space-x-3">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Edit Feed / Dairy Sale #{id}</h2>
          <p className="text-xs text-slate-500 mt-0.5">Modify feed bags, dairy items, customer details, or payment status.</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Customer info */}
          <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200/70 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Customer / Farmer Name *
              </label>
              <input
                type="text"
                name="customerName"
                value={formData.customerName}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Customer Phone
              </label>
              <input
                type="tel"
                name="customerPhone"
                value={formData.customerPhone}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Payment Settlement Status (PAID, PARTIAL, UNPAID) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Payment Settlement Status <span className="text-rose-500">*</span>
              </label>
              <span className="text-xs text-slate-400">Cash vs Udhaar</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* PAID */}
              <button
                type="button"
                onClick={() =>
                  setFormData((prev) => ({
                    ...prev,
                    paymentStatus: 'PAID',
                    paidAmount: prev.amount,
                    modeOfPayment:
                      prev.modeOfPayment === 'Credit / Udhaar (Khata)' ? 'Cash' : prev.modeOfPayment,
                  }))
                }
                className={`py-3 px-3 rounded-2xl border-2 flex flex-col items-center justify-center space-y-1 font-bold text-xs sm:text-sm transition-all ${
                  formData.paymentStatus === 'PAID'
                    ? 'border-emerald-600 bg-emerald-50/80 text-emerald-800 shadow-sm'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-500'
                }`}
              >
                <div className="flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Fully Paid</span>
                </div>
                <span className="text-[10px] font-normal text-emerald-700">100% Cash/UPI Received</span>
              </button>

              {/* PARTIAL */}
              <button
                type="button"
                onClick={() =>
                  setFormData((prev) => {
                    const total = parseFloat(prev.amount);
                    const defaultHalf = !isNaN(total) && total > 0 ? (total / 2).toString() : '';
                    return {
                      ...prev,
                      paymentStatus: 'PARTIAL',
                      paidAmount: prev.paidAmount || defaultHalf,
                      modeOfPayment:
                        prev.modeOfPayment === 'Credit / Udhaar (Khata)' ? 'Cash' : prev.modeOfPayment,
                    };
                  })
                }
                className={`py-3 px-3 rounded-2xl border-2 flex flex-col items-center justify-center space-y-1 font-bold text-xs sm:text-sm transition-all ${
                  formData.paymentStatus === 'PARTIAL'
                    ? 'border-amber-500 bg-amber-50/90 text-amber-900 shadow-sm ring-2 ring-amber-400/20'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-500'
                }`}
              >
                <div className="flex items-center space-x-1.5">
                  <IndianRupee className="w-4 h-4 text-amber-600" />
                  <span>Partially Paid</span>
                </div>
                <span className="text-[10px] font-normal text-amber-700">Part Cash + Part Udhaar</span>
              </button>

              {/* UNPAID */}
              <button
                type="button"
                onClick={() =>
                  setFormData((prev) => ({
                    ...prev,
                    paymentStatus: 'UNPAID',
                    paidAmount: '0',
                    modeOfPayment: 'Credit / Udhaar (Khata)',
                  }))
                }
                className={`py-3 px-3 rounded-2xl border-2 flex flex-col items-center justify-center space-y-1 font-bold text-xs sm:text-sm transition-all ${
                  formData.paymentStatus === 'UNPAID'
                    ? 'border-rose-600 bg-rose-50/80 text-rose-800 shadow-sm'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-500'
                }`}
              >
                <div className="flex items-center space-x-1.5">
                  <Clock className="w-4 h-4 text-rose-600" />
                  <span>Full Udhaar</span>
                </div>
                <span className="text-[10px] font-normal text-rose-600">Total Bill Pending Due</span>
              </button>
            </div>

            {/* PARTIAL PAYMENT DETAIL BOX */}
            {formData.paymentStatus === 'PARTIAL' && (
              <div className="p-4 bg-gradient-to-br from-amber-50/80 to-orange-50/50 rounded-2xl border border-amber-200 space-y-3 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-900 flex items-center space-x-1.5">
                    <IndianRupee className="w-4 h-4 text-amber-600" />
                    <span>Enter Cash Received (आंशिक नकद जमा)</span>
                  </span>
                  <span className="text-[11px] text-amber-700 font-medium">Customer Khata will track remaining</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 uppercase mb-1">
                      Amount Paid (₹) *
                    </label>
                    <div className="relative">
                      <IndianRupee className="w-4 h-4 text-amber-600 absolute left-3 top-3" />
                      <input
                        type="number"
                        step="0.01"
                        min="0.01"
                        placeholder="e.g. 1200"
                        value={formData.paidAmount}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFormData((prev) => ({ ...prev, paidAmount: val }));
                          if (errors.paidAmount) {
                            setErrors((prev) => ({ ...prev, paidAmount: null }));
                          }
                        }}
                        className="w-full pl-9 pr-3 py-2 bg-white border border-amber-300 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                    {errors.paidAmount && (
                      <p className="text-xs text-rose-600 mt-1 font-medium">{errors.paidAmount}</p>
                    )}
                  </div>

                  {/* Real-time Calculation Badge */}
                  {(() => {
                    const total = parseFloat(formData.amount || 0);
                    const paid = parseFloat(formData.paidAmount || 0);
                    const due = !isNaN(total) && !isNaN(paid) ? Math.max(0, total - paid) : 0;
                    return (
                      <div className="p-3 bg-white/90 rounded-xl border border-amber-200 shadow-xs flex flex-col justify-center">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-500">Total Bill:</span>
                          <span className="font-bold text-slate-800">{formData.amount ? `₹${total.toFixed(2)}` : '₹0.00'}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs mt-1">
                          <span className="text-emerald-600 font-medium">Cash Received:</span>
                          <span className="font-bold text-emerald-700">₹{paid.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs mt-1 pt-1 border-t border-slate-100">
                          <span className="text-rose-600 font-bold">Remaining Due:</span>
                          <span className="font-extrabold text-rose-600 text-sm">₹{due.toFixed(2)}</span>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            )}
          </div>

          {/* Item details */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Product / Item Details *
            </label>
            <input
              type="text"
              name="expenseName"
              value={formData.expenseName}
              onChange={handleChange}
              className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
            />
          </div>

          {/* Amount and Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Total Amount (₹) *
              </label>
              <div className="relative">
                <IndianRupee className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  className="w-full pl-9 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Date *
              </label>
              <input
                type="date"
                name="expenseDate"
                value={formData.expenseDate}
                onChange={handleChange}
                className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Category & Payment Mode */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Category
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl"
              >
                {CATEGORIES_LIST.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Payment Mode
              </label>
              <select
                name="modeOfPayment"
                value={formData.modeOfPayment}
                onChange={handleChange}
                className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl"
              >
                {PAYMENT_MODES.map((mode) => (
                  <option key={mode} value={mode}>
                    {mode}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Notes
            </label>
            <textarea
              name="description"
              rows="2"
              value={formData.description}
              onChange={handleChange}
              className="w-full px-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div className="pt-2 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 font-medium text-sm transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-medium text-sm shadow-md shadow-emerald-500/20 disabled:opacity-50 transition-all flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>{submitting ? 'Updating...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditExpense;
