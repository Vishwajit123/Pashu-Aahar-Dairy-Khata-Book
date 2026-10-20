import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Phone,
  MapPin,
  FileText,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Clock,
  PlusCircle,
  Receipt,
  Edit2,
  Trash2,
  IndianRupee,
  X,
  CreditCard,
  Check,
  History,
  ArrowDownLeft,
  Wallet,
  TrendingUp,
  Coins,
  ShieldCheck,
  Tag
} from 'lucide-react';
import { expenseApi } from '../services/api';
import { useToast } from '../context/ToastContext';
import { formatCurrency, formatDate, PAYMENT_MODES } from '../utils/formatters';
import { TableSkeleton } from '../components/LoadingSkeleton';

export const CustomerDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [customer, setCustomer] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [payments, setPayments] = useState([]);
  const [activeTab, setActiveTab] = useState('bills'); // 'bills' | 'payments'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Collect Payment Modal state
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentTargetTxn, setPaymentTargetTxn] = useState(null); // null means whole customer khata, or specific txn
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMode, setPaymentMode] = useState('Cash');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentNotes, setPaymentNotes] = useState('');
  const [submittingPayment, setSubmittingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState('');

  const fetchCustomerData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [custData, txnsData, paymentsData] = await Promise.all([
        expenseApi.getCustomerById(id),
        expenseApi.getCustomerTransactions(id),
        expenseApi.getCustomerPayments(id),
      ]);
      setCustomer(custData);
      setTransactions(txnsData || []);
      setPayments(paymentsData || []);
    } catch (err) {
      console.error('Failed to load customer details:', err);
      setError(err.message || 'Failed to load customer profile.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomerData();
  }, [id]);

  const handleOpenCustomerPayment = () => {
    setPaymentTargetTxn(null);
    const due = parseFloat(customer.totalUnpaid || 0);
    setPaymentAmount(due > 0 ? due.toString() : '');
    setPaymentMode('Cash');
    setPaymentDate(new Date().toISOString().split('T')[0]);
    setPaymentNotes('');
    setPaymentError('');
    setIsPaymentModalOpen(true);
  };

  const handleOpenTransactionPayment = (txn) => {
    setPaymentTargetTxn(txn);
    const due = txn.dueAmount != null ? parseFloat(txn.dueAmount) : Math.max(0, parseFloat(txn.amount) - parseFloat(txn.paidAmount || 0));
    setPaymentAmount(due > 0 ? due.toString() : '');
    setPaymentMode('Cash');
    setPaymentDate(new Date().toISOString().split('T')[0]);
    setPaymentNotes(`Payment for: ${txn.expenseName}`);
    setPaymentError('');
    setIsPaymentModalOpen(true);
  };

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    const amt = parseFloat(paymentAmount);
    if (isNaN(amt) || amt <= 0) {
      setPaymentError('Please enter a valid payment amount greater than zero.');
      return;
    }

    setSubmittingPayment(true);
    setPaymentError('');
    try {
      const payload = {
        amount: amt,
        paymentMode,
        paymentDate,
        notes: paymentNotes
      };

      if (paymentTargetTxn) {
        // Payment recorded against specific transaction
        await expenseApi.recordExpensePayment(paymentTargetTxn.id, payload);
        toast.success(`Payment of ${formatCurrency(amt)} recorded against bill #${paymentTargetTxn.id}!`);
      } else {
        // Payment recorded against customer's total khata dues (FIFO allocation)
        const updated = await expenseApi.recordCustomerPayment(id, payload);
        toast.success(`Payment of ${formatCurrency(amt)} received from ${updated.name}! Remaining due: ${formatCurrency(updated.totalUnpaid)}`);
      }

      setIsPaymentModalOpen(false);
      fetchCustomerData();
    } catch (err) {
      setPaymentError(err.message || 'Failed to record payment.');
      toast.error(err.message || 'Failed to record payment.');
    } finally {
      setSubmittingPayment(false);
    }
  };

  const handleDeleteTransaction = async (transactionId, name) => {
    if (!window.confirm(`Delete transaction "${name}"?`)) return;
    try {
      await expenseApi.deleteExpense(transactionId);
      toast.success('Transaction deleted.');
      fetchCustomerData();
    } catch (err) {
      toast.error(err.message || 'Failed to delete transaction.');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <TableSkeleton rows={6} />
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-rose-100 text-rose-600">
        <AlertCircle className="w-8 h-8 mx-auto mb-2" />
        <p>{error || 'Customer not found.'}</p>
        <button
          onClick={() => navigate('/customers')}
          className="mt-4 px-4 py-2 rounded-xl bg-slate-900 text-white text-sm"
        >
          Back to Customers
        </button>
      </div>
    );
  }

  const totalDue = parseFloat(customer.totalUnpaid || 0);
  const totalBilled = parseFloat(customer.totalPurchases || 0);
  const totalPaid = parseFloat(customer.totalPaid || 0);
  const hasDues = totalDue > 0;

  // Calculate sum of payments from the payment history records
  const totalRecordedPayments = payments.reduce((acc, p) => acc + parseFloat(p.amount || 0), 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Back button & Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate('/customers')}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-bold text-slate-900">{customer.name}'s Khata</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                Customer #{customer.id}
              </span>
            </div>
            <p className="text-slate-500 text-xs">Ledger, Billing Records & Payment Audit Trail</p>
          </div>
        </div>

        <div className="flex items-center space-x-3 self-start sm:self-auto">
          {hasDues && (
            <button
              onClick={handleOpenCustomerPayment}
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-bold text-sm shadow-md shadow-amber-500/20 transition-all cursor-pointer"
            >
              <IndianRupee className="w-4 h-4" />
              <span>Collect Payment (जमा करें)</span>
            </button>
          )}

          <Link
            to={`/add-expense?customerId=${customer.id}&customerName=${encodeURIComponent(
              customer.name
            )}&customerPhone=${encodeURIComponent(customer.phone || '')}`}
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-medium shadow-md shadow-emerald-500/20 transition-all"
          >
            <PlusCircle className="w-5 h-5" />
            <span>+ Add Feed / Milk Sale</span>
          </Link>
        </div>
      </div>

      {/* Customer Profile Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
          {/* Info */}
          <div className="flex items-center space-x-4 lg:col-span-1">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white font-bold text-2xl shadow-md shrink-0">
              {customer.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">{customer.name}</h2>
              {customer.phone && (
                <div className="flex items-center space-x-1 text-slate-500 text-sm mt-0.5">
                  <Phone className="w-3.5 h-3.5" />
                  <span>{customer.phone}</span>
                </div>
              )}
              {customer.address && (
                <div className="flex items-center space-x-1 text-slate-400 text-xs mt-1">
                  <MapPin className="w-3 h-3 shrink-0" />
                  <span>{customer.address}</span>
                </div>
              )}
              {customer.notes && (
                <p className="text-xs text-slate-400 mt-1 italic">Note: {customer.notes}</p>
              )}
            </div>
          </div>

          {/* Dues Summary Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 lg:col-span-2 bg-slate-50 p-4 rounded-2xl border border-slate-100 items-center">
            <div>
              <span className="text-xs font-semibold uppercase text-slate-400">Total Billed (कुल बिक्री)</span>
              <p className="text-lg font-bold text-slate-900">{formatCurrency(totalBilled)}</p>
              <span className="text-xs text-slate-500">{transactions.length} bills recorded</span>
            </div>

            <div>
              <span className="text-xs font-semibold uppercase text-emerald-600">Total Received (कुल जमा)</span>
              <p className="text-lg font-bold text-emerald-600">{formatCurrency(totalPaid)}</p>
              <span className="text-xs text-emerald-600/80">{payments.length} payment receipts</span>
            </div>

            <div className="p-3 rounded-xl bg-white border border-rose-100 shadow-xs">
              <span className="text-xs font-semibold uppercase text-rose-500">Remaining Udhaar (बाकी उधार)</span>
              <p className={`text-xl font-extrabold ${hasDues ? 'text-rose-600' : 'text-emerald-600'}`}>
                {formatCurrency(totalDue)}
              </p>
              {hasDues ? (
                <button
                  onClick={handleOpenCustomerPayment}
                  className="mt-1.5 w-full py-1 px-2.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs flex items-center justify-center space-x-1 transition-colors cursor-pointer"
                >
                  <IndianRupee className="w-3 h-3" />
                  <span>Settle Due Now</span>
                </button>
              ) : (
                <span className="text-xs text-emerald-600 font-medium">✓ All accounts settled</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* TABS SWITCHER: Purchase Bills vs Payment History */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('bills')}
          className={`pb-3 px-5 text-sm font-bold flex items-center space-x-2 border-b-2 transition-all cursor-pointer ${
            activeTab === 'bills'
              ? 'border-emerald-600 text-emerald-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>Purchase Bills Ledger (बिक्री बिल)</span>
          <span className={`ml-1.5 px-2 py-0.5 rounded-full text-xs ${
            activeTab === 'bills' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
          }`}>
            {transactions.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('payments')}
          className={`pb-3 px-5 text-sm font-bold flex items-center space-x-2 border-b-2 transition-all cursor-pointer ${
            activeTab === 'payments'
              ? 'border-emerald-600 text-emerald-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Payment History / जमा रसीदें</span>
          <span className={`ml-1.5 px-2 py-0.5 rounded-full text-xs ${
            activeTab === 'payments' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
          }`}>
            {payments.length}
          </span>
        </button>
      </div>

      {/* TAB 1: PURCHASE BILLS LEDGER */}
      {activeTab === 'bills' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-base flex items-center space-x-2">
              <Receipt className="w-5 h-5 text-emerald-600" />
              <span>Customer Transaction Ledger</span>
            </h3>
            <span className="text-xs font-medium text-slate-400">
              Showing {transactions.length} record(s)
            </span>
          </div>

          {transactions.length === 0 ? (
            <div className="p-12 text-center">
              <Receipt className="w-12 h-12 text-slate-300 mx-auto mb-2" />
              <p className="text-slate-500 text-sm">No feed or dairy purchases recorded for this customer yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="py-3.5 px-4 pl-6">Date</th>
                    <th className="py-3.5 px-4">Items / Bill</th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-4 text-right">Bill Total</th>
                    <th className="py-3.5 px-4 text-right">Paid</th>
                    <th className="py-3.5 px-4 text-right">Due Balance</th>
                    <th className="py-3.5 px-4 text-center">Payment Status</th>
                    <th className="py-3.5 px-4 pr-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {transactions.map((txn) => {
                    const billAmt = parseFloat(txn.amount || 0);
                    const paidAmt = txn.paidAmount != null ? parseFloat(txn.paidAmount) : (txn.paymentStatus === 'PAID' ? billAmt : 0);
                    const dueAmt = txn.dueAmount != null ? parseFloat(txn.dueAmount) : Math.max(0, billAmt - paidAmt);
                    const isPaid = txn.paymentStatus === 'PAID' || dueAmt <= 0;
                    const isPartial = txn.paymentStatus === 'PARTIAL' || (!isPaid && paidAmt > 0);

                    return (
                      <tr key={txn.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3.5 px-4 pl-6 text-slate-600 font-medium">
                          {formatDate(txn.expenseDate)}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-semibold text-slate-900 block">{txn.expenseName}</span>
                          {txn.description && (
                            <span className="text-xs text-slate-400 block line-clamp-1">{txn.description}</span>
                          )}
                          <span className="text-[11px] text-slate-400">Mode: {txn.modeOfPayment}</span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600">
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                            {txn.category}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                          {formatCurrency(billAmt)}
                        </td>
                        <td className="py-3.5 px-4 text-right font-semibold text-emerald-600">
                          {formatCurrency(paidAmt)}
                        </td>
                        <td className="py-3.5 px-4 text-right font-bold">
                          <span className={dueAmt > 0 ? 'text-rose-600' : 'text-slate-400 font-normal'}>
                            {formatCurrency(dueAmt)}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          {isPaid ? (
                            <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>PAID</span>
                            </span>
                          ) : isPartial ? (
                            <button
                              onClick={() => handleOpenTransactionPayment(txn)}
                              className="inline-flex flex-col items-center px-3 py-1 rounded-2xl text-xs font-bold bg-amber-100 text-amber-900 hover:bg-amber-200 border border-amber-300 transition-all shadow-xs cursor-pointer"
                              title="Click to settle remaining due"
                            >
                              <span className="flex items-center space-x-1">
                                <Clock className="w-3 h-3 text-amber-700" />
                                <span>PARTIAL</span>
                              </span>
                              <span className="text-[10px] text-amber-700 font-normal">
                                Due: {formatCurrency(dueAmt)}
                              </span>
                            </button>
                          ) : (
                            <button
                              onClick={() => handleOpenTransactionPayment(txn)}
                              className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 hover:bg-rose-200 border border-rose-300 transition-all shadow-xs cursor-pointer animate-pulse"
                              title="Click to record payment"
                            >
                              <Clock className="w-3.5 h-3.5" />
                              <span>UNPAID</span>
                            </button>
                          )}
                        </td>
                        <td className="py-3.5 px-4 pr-6 text-right">
                          <div className="flex items-center justify-end space-x-1">
                            {!isPaid && (
                              <button
                                onClick={() => handleOpenTransactionPayment(txn)}
                                className="px-2.5 py-1 rounded-lg text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors cursor-pointer"
                                title="Collect money against this bill"
                              >
                                Settle
                              </button>
                            )}
                            <Link
                              to={`/edit-expense/${txn.id}`}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                              title="Edit"
                            >
                              <Edit2 className="w-4 h-4" />
                            </Link>
                            <button
                              onClick={() => handleDeleteTransaction(txn.id, txn.expenseName)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: PAYMENT HISTORY / जमा रसीदें */}
      {activeTab === 'payments' && (
        <div className="space-y-4">
          {/* Quick Metrics Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center space-x-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                <ArrowDownLeft className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Total Cash & UPI Collected
                </span>
                <span className="text-xl font-bold text-emerald-700">
                  {formatCurrency(totalRecordedPayments)}
                </span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center space-x-3.5">
              <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
                <Receipt className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Total Payment Receipts
                </span>
                <span className="text-xl font-bold text-slate-800">
                  {payments.length} Receipts
                </span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Latest Payment Date
                </span>
                <span className="text-base font-bold text-slate-800">
                  {payments.length > 0 ? formatDate(payments[0].paymentDate) : 'No payments yet'}
                </span>
              </div>
              {hasDues && (
                <button
                  onClick={handleOpenCustomerPayment}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                >
                  + Add Payment
                </button>
              )}
            </div>
          </div>

          {/* Payment Receipts Ledger Table */}
          <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-slate-900 text-base">
                  Customer Payment Receipts & Audit History (रसीद खाता)
                </h3>
              </div>
              <span className="text-xs font-medium text-slate-400">
                {payments.length} payment event(s) recorded
              </span>
            </div>

            {payments.length === 0 ? (
              <div className="p-12 text-center">
                <Coins className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                <p className="text-slate-600 font-medium text-sm">No payment history recorded for this customer yet.</p>
                <p className="text-slate-400 text-xs mt-1">
                  Payments received via sales down-payment or Khata dues settlement will appear here.
                </p>
                {hasDues && (
                  <button
                    onClick={handleOpenCustomerPayment}
                    className="mt-4 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm"
                  >
                    Receive First Payment Now
                  </button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      <th className="py-3.5 px-4 pl-6">Receipt #</th>
                      <th className="py-3.5 px-4">Payment Date</th>
                      <th className="py-3.5 px-4">Settled Bill / Khata Account</th>
                      <th className="py-3.5 px-4">Payment Mode</th>
                      <th className="py-3.5 px-4">Notes & Remarks</th>
                      <th className="py-3.5 px-4 pr-6 text-right">Amount Received</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {payments.map((p) => {
                      const pAmt = parseFloat(p.amount || 0);
                      const isCash = (p.paymentMode || '').toLowerCase().includes('cash');
                      const isUpi = (p.paymentMode || '').toLowerCase().includes('upi') || (p.paymentMode || '').toLowerCase().includes('phonepe') || (p.paymentMode || '').toLowerCase().includes('gpay');

                      return (
                        <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-3.5 px-4 pl-6">
                            <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-slate-100 text-slate-700">
                              <Receipt className="w-3.5 h-3.5 text-slate-500" />
                              <span>RCP-{p.id}</span>
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="flex items-center space-x-1.5 text-slate-700 font-medium">
                              <Calendar className="w-3.5 h-3.5 text-slate-400" />
                              <span>{formatDate(p.paymentDate)}</span>
                            </div>
                            {p.createdAt && (
                              <span className="text-[11px] text-slate-400 block">
                                {new Date(p.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-slate-900 flex items-center space-x-1.5">
                              <span>{p.billName || 'Khata Settlement'}</span>
                            </div>
                            {p.expenseId && (
                              <span className="text-[11px] text-slate-400">
                                Bill ID: #{p.expenseId}
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                              isCash
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                : isUpi
                                ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                : 'bg-purple-100 text-purple-800 border border-purple-200'
                            }`}>
                              <CreditCard className="w-3 h-3" />
                              <span>{p.paymentMode || 'Cash'}</span>
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-slate-600 text-xs">
                            {p.notes ? (
                              <span className="text-slate-700">{p.notes}</span>
                            ) : (
                              <span className="text-slate-400 italic">Direct Khata payment</span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 pr-6 text-right">
                            <div className="inline-flex items-center space-x-1 text-emerald-600 font-extrabold text-base bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-100">
                              <ArrowDownLeft className="w-4 h-4 text-emerald-600" />
                              <span>+ {formatCurrency(pAmt)}</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* COLLECT PAYMENT / SETTLEMENT MODAL */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-bold">
                  <IndianRupee className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    {paymentTargetTxn ? 'Settle Bill Payment' : 'Collect Customer Khata Payment'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {paymentTargetTxn ? paymentTargetTxn.expenseName : customer.name}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsPaymentModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="p-6 space-y-4">
              {paymentError && (
                <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs font-medium">
                  {paymentError}
                </div>
              )}

              {/* Outstanding Due Overview */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/70 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                    {paymentTargetTxn ? 'Bill Due Balance' : 'Total Customer Due'}
                  </span>
                  <span className="text-xl font-extrabold text-rose-600">
                    {formatCurrency(paymentTargetTxn ? (paymentTargetTxn.dueAmount || paymentTargetTxn.amount) : totalDue)}
                  </span>
                </div>
                <div className="flex space-x-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      const maxDue = paymentTargetTxn ? (paymentTargetTxn.dueAmount || paymentTargetTxn.amount) : totalDue;
                      setPaymentAmount(maxDue.toString());
                    }}
                    className="px-2.5 py-1 text-xs font-bold rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 cursor-pointer"
                  >
                    Pay Full
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const maxDue = paymentTargetTxn ? (paymentTargetTxn.dueAmount || paymentTargetTxn.amount) : totalDue;
                      setPaymentAmount((maxDue / 2).toString());
                    }}
                    className="px-2.5 py-1 text-xs font-bold rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 cursor-pointer"
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
                const maxDue = parseFloat(paymentTargetTxn ? (paymentTargetTxn.dueAmount || paymentTargetTxn.amount) : totalDue);
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
                  placeholder="e.g. Paid in cash, remaining ₹800 promised next Monday"
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Actions */}
              <div className="pt-2 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-medium text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingPayment}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs shadow-md shadow-emerald-500/20 disabled:opacity-50 transition-all flex items-center space-x-1.5 cursor-pointer"
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

export default CustomerDetail;
