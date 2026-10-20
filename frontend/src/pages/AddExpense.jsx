import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  IndianRupee,
  Calendar,
  AlertCircle,
  User,
  Phone,
  CheckCircle2,
  Clock,
  Wheat,
  Milk,
  Zap,
  Plus,
  Settings,
  X,
  Check,
  Package
} from 'lucide-react';
import { expenseApi } from '../services/api';
import { productStorage } from '../services/productStorage';
import { useToast } from '../context/ToastContext';
import {
  CATEGORIES_LIST,
  PAYMENT_MODES,
  formatCurrency
} from '../utils/formatters';

const COMMON_UNITS = [
  'Bag (50kg)',
  'Bag (35kg)',
  'Bag (25kg)',
  'Litre',
  'Kg',
  'Pouch (5kg)',
  'Can (5L)',
  'Unit'
];

export const AddExpense = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const toast = useToast();

  const todayStr = new Date().toISOString().split('T')[0];

  const paramCustomerId = searchParams.get('customerId');
  const paramCustomerName = searchParams.get('customerName');
  const paramCustomerPhone = searchParams.get('customerPhone');
  const paramProductName = searchParams.get('productName');
  const paramCategory = searchParams.get('category');
  const paramPrice = searchParams.get('price');

  const [customers, setCustomers] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState(paramCustomerId || '');

  // Persistent dynamic products from productStorage
  const [products, setProducts] = useState(() => productStorage.getProducts());

  // Quick Add Item Modal state
  const [quickAddModalOpen, setQuickAddModalOpen] = useState(false);
  const [quickAddForm, setQuickAddForm] = useState({
    name: '',
    category: 'Cattle Feed Pellets (Pashu Aahar)',
    defaultPrice: '',
    unit: 'Bag (50kg)',
  });
  const [quickAddError, setQuickAddError] = useState('');

  const [formData, setFormData] = useState({
    expenseName: paramProductName || '',
    description: '',
    amount: paramPrice || '',
    expenseDate: todayStr,
    category: paramCategory || 'Cattle Feed Pellets (Pashu Aahar)',
    modeOfPayment: 'Cash',
    customerId: paramCustomerId ? parseInt(paramCustomerId) : null,
    customerName: paramCustomerName || 'Walk-in Customer',
    customerPhone: paramCustomerPhone || '',
    paymentStatus: 'PAID', // PAID, PARTIAL, UNPAID
    paidAmount: '',
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Sync products when modified anywhere in the app
  useEffect(() => {
    const handleProductsUpdated = () => {
      setProducts(productStorage.getProducts());
    };
    window.addEventListener('products_updated', handleProductsUpdated);
    return () => window.removeEventListener('products_updated', handleProductsUpdated);
  }, []);

  const handleQuickProductSelect = (prod) => {
    setFormData((prev) => ({
      ...prev,
      expenseName: prod.name,
      category: prod.category,
      amount: prod.defaultPrice ? prod.defaultPrice.toString() : prev.amount,
    }));
    setErrors((prev) => ({ ...prev, expenseName: null, amount: null }));
  };

  useEffect(() => {
    const loadCustomers = async () => {
      try {
        const list = await expenseApi.getCustomers();
        setCustomers(list || []);
      } catch (err) {
        console.error('Failed to load customers:', err);
      }
    };
    loadCustomers();
  }, []);

  const handleCustomerSelect = (e) => {
    const val = e.target.value;
    setSelectedCustomerId(val);

    if (val === '') {
      // Walk-in
      setFormData((prev) => ({
        ...prev,
        customerId: null,
        customerName: 'Walk-in Customer',
        customerPhone: '',
      }));
    } else if (val === 'new') {
      // Custom entry
      setFormData((prev) => ({
        ...prev,
        customerId: null,
        customerName: '',
        customerPhone: '',
      }));
    } else {
      const found = customers.find((c) => String(c.id) === val);
      if (found) {
        setFormData((prev) => ({
          ...prev,
          customerId: found.id,
          customerName: found.name,
          customerPhone: found.phone || '',
        }));
      }
    }
  };

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
        errs.paidAmount = 'For full payment, please select Fully Paid option.';
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

      const result = await expenseApi.createExpense(payload);
      toast.success(
        `Sale for "${result.customerName}" (${formData.paymentStatus === 'PARTIAL' ? 'Partially Paid' : formData.paymentStatus}) recorded successfully!`
      );

      if (formData.customerId) {
        navigate(`/customers/${formData.customerId}`);
      } else {
        navigate('/expenses');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to save transaction.');
    } finally {
      setSubmitting(false);
    }
  };

  // Quick Add new item handler right from sales screen
  const handleSaveQuickProduct = (e) => {
    e.preventDefault();
    if (!quickAddForm.name.trim()) {
      setQuickAddError('Product name is required');
      return;
    }
    const priceNum = parseFloat(quickAddForm.defaultPrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      setQuickAddError('Valid price is required');
      return;
    }

    const newProd = productStorage.addProduct({
      name: quickAddForm.name,
      category: quickAddForm.category,
      defaultPrice: priceNum,
      unit: quickAddForm.unit,
    });

    toast.success(`"${newProd.name}" added to catalog & applied to sale!`);

    // Auto-select this newly created product in current form
    handleQuickProductSelect(newProd);

    // Reset and close quick add modal
    setQuickAddForm({
      name: '',
      category: 'Cattle Feed Pellets (Pashu Aahar)',
      defaultPrice: '',
      unit: 'Bag (50kg)',
    });
    setQuickAddError('');
    setQuickAddModalOpen(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Record Feed & Dairy Sale</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Log cattle feed bags, dairy items, assign to customer Khata, and track cash or udhaar dues.
          </p>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Customer Selection Section */}
          <div className="bg-slate-50/80 p-4 sm:p-5 rounded-2xl border border-slate-200/70 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center space-x-1.5">
                <User className="w-4 h-4 text-emerald-600" />
                <span>Customer / Farmer Account</span>
              </span>
              <span className="text-xs text-slate-400">Select or enter new</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">
                  Choose Customer Profile
                </label>
                <select
                  value={selectedCustomerId}
                  onChange={handleCustomerSelect}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-medium text-slate-700"
                >
                  <option value="">Walk-in Customer (No profile)</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.phone ? `(${c.phone})` : ''}
                    </option>
                  ))}
                  <option value="new">+ Type Custom Customer Name</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">
                  Customer / Farmer Name *
                </label>
                <input
                  type="text"
                  name="customerName"
                  placeholder="e.g. Kundan Koli / Ramesh"
                  value={formData.customerName}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-medium text-slate-700"
                />
                {errors.customerName && (
                  <p className="text-xs text-rose-600 mt-1">{errors.customerName}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">
                Customer Phone
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="tel"
                  name="customerPhone"
                  placeholder="e.g. 9876543210"
                  value={formData.customerPhone}
                  onChange={handleChange}
                  className="w-full pl-9 pr-3.5 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
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
                    <span>Enter Cash Received Today (आंशिक नकद जमा)</span>
                  </span>
                  <span className="text-[11px] text-amber-700 font-medium">Customer Khata will track remaining</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 uppercase mb-1">
                      Amount Paid Today (₹) *
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
                          <span className="font-bold text-slate-800">{formatCurrency(total || 0)}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs mt-1">
                          <span className="text-emerald-600 font-medium">Cash Received:</span>
                          <span className="font-bold text-emerald-700">{formatCurrency(paid || 0)}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs mt-1 pt-1 border-t border-slate-100">
                          <span className="text-rose-600 font-bold">Remaining Due:</span>
                          <span className="font-extrabold text-rose-600 text-sm">{formatCurrency(due)}</span>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            )}
          </div>

          {/* Quick Product Presets for Feed & Dairy */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center space-x-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                <span>Quick Select Feed & Dairy Products</span>
              </label>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setQuickAddModalOpen(true)}
                  className="text-[11px] font-bold text-emerald-700 hover:text-emerald-900 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200 flex items-center space-x-1 transition-colors"
                >
                  <Plus className="w-3 h-3" />
                  <span>New Product</span>
                </button>

                <Link
                  to="/categories"
                  className="text-[11px] font-bold text-slate-500 hover:text-emerald-700 flex items-center space-x-1 transition-colors"
                  title="Manage all products and rates"
                >
                  <Settings className="w-3 h-3" />
                  <span>Update Rates</span>
                </Link>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-2.5 bg-slate-50 rounded-2xl border border-slate-200/70">
              {products.map((prod) => {
                const isSelected = formData.expenseName === prod.name;
                return (
                  <button
                    key={prod.id || prod.name}
                    type="button"
                    onClick={() => handleQuickProductSelect(prod)}
                    className={`text-xs px-3 py-1.5 rounded-xl border font-medium transition-all flex items-center space-x-1.5 ${
                      isSelected
                        ? 'bg-amber-600 border-amber-600 text-white shadow-sm'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-amber-400 hover:bg-amber-50/50'
                    }`}
                  >
                    <span>{prod.name}</span>
                    <span
                      className={`text-[10px] font-mono px-1 rounded ${
                        isSelected
                          ? 'bg-amber-700 text-amber-100'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {formatCurrency(prod.defaultPrice)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Items / Bill Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Product / Item Details <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="expenseName"
              placeholder="e.g. 50kg Cattle Feed Bag, Sarson Khal 40kg, Cow Milk 10L, Desi Ghee 1kg"
              value={formData.expenseName}
              onChange={handleChange}
              className={`w-full px-4 py-2.5 text-sm bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                errors.expenseName
                  ? 'border-rose-300 focus:ring-rose-500/20'
                  : 'border-slate-200 focus:ring-emerald-500/20 focus:border-emerald-500'
              }`}
            />
            {errors.expenseName && (
              <p className="text-xs text-rose-600 mt-1">{errors.expenseName}</p>
            )}
          </div>

          {/* Amount and Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Total Amount (₹) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <IndianRupee className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  name="amount"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={handleChange}
                  className="w-full pl-9 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-slate-900"
                />
              </div>
              {errors.amount && (
                <p className="text-xs text-rose-600 mt-1">{errors.amount}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Date <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="date"
                  name="expenseDate"
                  value={formData.expenseDate}
                  onChange={handleChange}
                  className="w-full pl-9 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-slate-700"
                />
              </div>
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
                className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-700"
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
                className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-700"
              >
                {PAYMENT_MODES.map((mode) => (
                  <option key={mode} value={mode}>
                    {mode}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description / Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Notes / Description (Optional)
            </label>
            <textarea
              name="description"
              rows="2"
              placeholder="e.g. Will pay remaining dues on Saturday"
              value={formData.description}
              onChange={handleChange}
              className="w-full px-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Submit Buttons */}
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
              <span>{submitting ? 'Saving...' : 'Record Sale'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* QUICK ADD PRODUCT MODAL DIRECTLY IN SALES FORM */}
      {quickAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Add New Product</h3>
                  <p className="text-[11px] text-slate-400">Save to catalog and select for this sale</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setQuickAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {quickAddError && (
              <div className="p-2.5 rounded-xl bg-rose-50 text-rose-700 text-xs font-medium">
                {quickAddError}
              </div>
            )}

            <form onSubmit={handleSaveQuickProduct} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Product Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Kapila High Energy 50kg"
                  value={quickAddForm.name}
                  onChange={(e) => setQuickAddForm({ ...quickAddForm, name: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Category *
                </label>
                <select
                  value={quickAddForm.category}
                  onChange={(e) => setQuickAddForm({ ...quickAddForm, category: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {CATEGORIES_LIST.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Rate (₹) *
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    placeholder="e.g. 1650"
                    value={quickAddForm.defaultPrice}
                    onChange={(e) =>
                      setQuickAddForm({ ...quickAddForm, defaultPrice: e.target.value })
                    }
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Unit *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Bag (50kg)"
                    value={quickAddForm.unit}
                    onChange={(e) => setQuickAddForm({ ...quickAddForm, unit: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <span className="text-[10px] font-semibold text-slate-400 block mb-1">
                  Common units:
                </span>
                <div className="flex flex-wrap gap-1">
                  {COMMON_UNITS.slice(0, 5).map((u) => (
                    <button
                      key={u}
                      type="button"
                      onClick={() => setQuickAddForm({ ...quickAddForm, unit: u })}
                      className={`text-[10px] px-2 py-0.5 rounded border ${
                        quickAddForm.unit === u
                          ? 'bg-emerald-100 border-emerald-300 text-emerald-800'
                          : 'bg-white border-slate-200 text-slate-600'
                      }`}
                    >
                      {u}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setQuickAddModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm"
                >
                  Save & Apply
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddExpense;
