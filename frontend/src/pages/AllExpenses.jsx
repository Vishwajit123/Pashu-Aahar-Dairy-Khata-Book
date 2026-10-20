import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Search,
  Filter,
  Trash2,
  Edit2,
  Eye,
  Plus,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  AlertTriangle,
  CreditCard,
  Calendar,
  X,
  Tag,
  FolderTree,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { expenseApi } from '../services/api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { Modal } from '../components/Modal';
import { EmptyState } from '../components/EmptyState';
import { TableSkeleton } from '../components/LoadingSkeleton';
import {
  formatCurrency,
  formatDate,
  getCategoryBadgeStyle,
  CATEGORIES_LIST,
  PAYMENT_MODES
} from '../utils/formatters';

export const AllExpenses = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search state initialized from URL query params
  const [searchTerm, setSearchTerm] = useState(
    searchParams.get('search') || searchParams.get('q') || ''
  );
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get('category') || 'ALL'
  );
  const [selectedMode, setSelectedMode] = useState(
    searchParams.get('mode') || 'ALL'
  );
  const [selectedStatus, setSelectedStatus] = useState(
    searchParams.get('status') || searchParams.get('paymentStatus') || 'ALL'
  );
  const [customerId, setCustomerId] = useState(
    searchParams.get('customerId') || null
  );
  const [startDate, setStartDate] = useState(searchParams.get('startDate') || '');
  const [endDate, setEndDate] = useState(searchParams.get('endDate') || '');
  const [sortBy, setSortBy] = useState('date');
  const [sortDir, setSortDir] = useState('desc');

  // Sync state if URL query params change (e.g. from Dashboard or Catalog clicks)
  useEffect(() => {
    const urlCat = searchParams.get('category');
    if (urlCat && urlCat !== selectedCategory) {
      setSelectedCategory(urlCat);
    }

    const urlSearch = searchParams.get('search') || searchParams.get('q');
    if (urlSearch !== null && urlSearch !== searchTerm) {
      setSearchTerm(urlSearch);
    }

    const urlStatus = searchParams.get('status') || searchParams.get('paymentStatus');
    if (urlStatus && urlStatus !== selectedStatus) {
      setSelectedStatus(urlStatus);
    }

    const urlCust = searchParams.get('customerId');
    if (urlCust !== customerId) {
      setCustomerId(urlCust);
    }
  }, [searchParams]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Modals state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [expenseToView, setExpenseToView] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const data = await expenseApi.getExpenses({
        search: searchTerm,
        category: selectedCategory === 'ALL' ? '' : selectedCategory,
        mode: selectedMode === 'ALL' ? '' : selectedMode,
        paymentStatus: selectedStatus === 'ALL' ? '' : selectedStatus,
        customerId: customerId ? parseInt(customerId, 10) : null,
        startDate: startDate || null,
        endDate: endDate || null,
        sortBy,
        sortDir,
      });
      setExpenses(Array.isArray(data) ? data : (data.content || []));
      setCurrentPage(1); // reset to first page on filter change
    } catch (err) {
      toast.error(err.message || 'Failed to fetch expenses.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [searchTerm, selectedCategory, selectedMode, selectedStatus, customerId, startDate, endDate, sortBy, sortDir, user?.id]);

  // Dynamic categories list combining default list + custom categories in active expenses
  const allCategoriesList = useMemo(() => {
    const set = new Set(CATEGORIES_LIST);
    expenses.forEach((e) => {
      if (e.category && e.category.trim()) {
        set.add(e.category.trim());
      }
    });
    if (selectedCategory && selectedCategory !== 'ALL') {
      set.add(selectedCategory);
    }
    return Array.from(set);
  }, [expenses, selectedCategory]);

  const handleCategoryChange = (newCat) => {
    setSelectedCategory(newCat);
    const nextParams = new URLSearchParams(searchParams);
    if (newCat && newCat !== 'ALL') {
      nextParams.set('category', newCat);
    } else {
      nextParams.delete('category');
    }
    setSearchParams(nextParams, { replace: true });
  };

  const handleStatusChange = (newStatus) => {
    setSelectedStatus(newStatus);
    const nextParams = new URLSearchParams(searchParams);
    if (newStatus && newStatus !== 'ALL') {
      nextParams.set('status', newStatus);
    } else {
      nextParams.delete('status');
    }
    setSearchParams(nextParams, { replace: true });
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('ALL');
    setSelectedMode('ALL');
    setSelectedStatus('ALL');
    setCustomerId(null);
    setStartDate('');
    setEndDate('');
    setSortBy('date');
    setSortDir('desc');
    setSearchParams({}, { replace: true });
  };

  const hasActiveFilters =
    searchTerm !== '' ||
    selectedCategory !== 'ALL' ||
    selectedMode !== 'ALL' ||
    selectedStatus !== 'ALL' ||
    customerId !== null ||
    startDate !== '' ||
    endDate !== '';

  // Confirm delete
  const handleDeleteConfirm = async () => {
    if (!expenseToDelete) return;
    setIsDeleting(true);
    try {
      await expenseApi.deleteExpense(expenseToDelete.id);
      toast.success(`Expense #${expenseToDelete.id} deleted successfully.`);
      setDeleteModalOpen(false);
      setExpenseToDelete(null);
      fetchExpenses();
    } catch (err) {
      toast.error(err.message || 'Failed to delete expense.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Client-side pagination slices for snappy navigation
  const totalRecords = expenses.length;
  const totalPages = Math.ceil(totalRecords / pageSize) || 1;
  const paginatedExpenses = useMemo(() => {
    const from = (currentPage - 1) * pageSize;
    return expenses.slice(from, from + pageSize);
  }, [expenses, currentPage, pageSize]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">All Feed & Dairy Sales</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
              {totalRecords} records
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Search, filter, view details, and manage cattle feed bags and dairy transactions.
          </p>
        </div>

        <Link
          to="/add-expense"
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl font-medium text-sm bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm shadow-emerald-600/30 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>+ Record Sale</span>
        </Link>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-card space-y-4">
        {/* Status Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2 pb-3 border-b border-slate-100">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mr-1">Status:</span>
          <button
            onClick={() => handleStatusChange('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              selectedStatus === 'ALL'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Sales
          </button>
          <button
            onClick={() => handleStatusChange('PAID')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              selectedStatus === 'PAID'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
            }`}
          >
            Paid (Received)
          </button>
          <button
            onClick={() => handleStatusChange('PARTIAL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              selectedStatus === 'PARTIAL'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
            }`}
          >
            Partially Paid (आंशिक)
          </button>
          <button
            onClick={() => handleStatusChange('UNPAID')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              selectedStatus === 'UNPAID'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
            }`}
          >
            Unpaid (Udhaar / Due)
          </button>
        </div>

        {/* Active Filter Chips Notification */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-200/80">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center space-x-1">
              <Filter className="w-3 h-3 text-emerald-600" />
              <span>Active Filters:</span>
            </span>

            {selectedCategory !== 'ALL' && (
              <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-xs">
                <FolderTree className="w-3.5 h-3.5 text-emerald-700" />
                <span>Department: {selectedCategory}</span>
                <button
                  onClick={() => handleCategoryChange('ALL')}
                  className="ml-1 hover:text-emerald-950 p-0.5 rounded-full hover:bg-emerald-200 cursor-pointer"
                  title="Clear department filter"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            )}

            {selectedStatus !== 'ALL' && (
              <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-bold bg-slate-200 text-slate-800 border border-slate-300 shadow-xs">
                <span>Status: {selectedStatus}</span>
                <button
                  onClick={() => handleStatusChange('ALL')}
                  className="ml-1 hover:text-slate-950 p-0.5 rounded-full hover:bg-slate-300 cursor-pointer"
                  title="Clear status filter"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            )}

            {customerId && (
              <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-300 shadow-xs">
                <span>Customer #{customerId}</span>
                <button
                  onClick={() => {
                    setCustomerId(null);
                    const nextParams = new URLSearchParams(searchParams);
                    nextParams.delete('customerId');
                    setSearchParams(nextParams, { replace: true });
                  }}
                  className="ml-1 hover:text-blue-950 p-0.5 rounded-full hover:bg-blue-200 cursor-pointer"
                  title="Clear customer filter"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            )}

            {searchTerm && (
              <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300 shadow-xs">
                <span>Search: "{searchTerm}"</span>
                <button
                  onClick={() => setSearchTerm('')}
                  className="ml-1 hover:text-amber-950 p-0.5 rounded-full hover:bg-amber-200 cursor-pointer"
                  title="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            )}

            <button
              onClick={handleResetFilters}
              className="text-xs text-rose-600 hover:text-rose-700 font-bold hover:underline ml-auto cursor-pointer"
            >
              Reset All Filters
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {/* Search input */}
          <div className="relative md:col-span-2 lg:col-span-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search farmer, customer, feed, milk..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50/70 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Category / Department Filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50/70 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium text-slate-800"
            >
              <option value="ALL">All Departments / Categories</option>
              {allCategoriesList.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Payment Mode Filter */}
          <div>
            <select
              value={selectedMode}
              onChange={(e) => setSelectedMode(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50/70 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            >
              <option value="ALL">All Payment Modes</option>
              {PAYMENT_MODES.map((mode) => (
                <option key={mode} value={mode}>
                  {mode}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div className="flex items-center space-x-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50/70 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            >
              <option value="date">Sort by Date</option>
              <option value="amount">Sort by Amount</option>
              <option value="name">Sort by Name</option>
              <option value="id">Sort by ID</option>
            </select>
            <button
              onClick={() => setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'))}
              title={`Sorting ${sortDir.toUpperCase()}`}
              className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600 transition-colors shrink-0"
            >
              <ArrowUpDown className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Date Range Sub-row & Clear Filters */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <span className="font-semibold text-slate-700 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" /> Date Range:
            </span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-2.5 py-1 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500"
            />
            <span>to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-2.5 py-1 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500"
            />
          </div>

          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="inline-flex items-center space-x-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100/70 px-3 py-1.5 rounded-lg transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear All Filters</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Table */}
      {loading ? (
        <TableSkeleton rows={8} />
      ) : totalRecords === 0 ? (
        <EmptyState
          title="No Matching Expenses"
          description={
            hasActiveFilters
              ? 'No expense matches your active search or filter criteria. Try adjusting your filters or resetting.'
              : 'You have not added any expenses yet.'
          }
          actionText={hasActiveFilters ? 'Clear Filters' : 'Add First Expense'}
          actionLink={hasActiveFilters ? undefined : '/add-expense'}
          onAction={hasActiveFilters ? handleResetFilters : undefined}
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/75 text-slate-500 text-xs uppercase font-semibold border-b border-slate-100">
                <tr>
                  <th className="px-5 py-4">ID</th>
                  <th className="px-5 py-4">Customer</th>
                  <th className="px-5 py-4">Items / Bill</th>
                  <th className="px-5 py-4">Category</th>
                  <th className="px-5 py-4">Date</th>
                  <th className="px-5 py-4">Mode</th>
                  <th className="px-5 py-4 text-right">Amount</th>
                  <th className="px-5 py-4 text-center">Payment Status</th>
                  <th className="px-5 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedExpenses.map((expense) => {
                  const badge = getCategoryBadgeStyle(expense.category);
                  const isPaid = expense.paymentStatus === 'PAID';
                  return (
                    <tr
                      key={expense.id}
                      className="hover:bg-slate-50/75 transition-colors group"
                    >
                      <td className="px-5 py-4 font-mono text-xs font-semibold text-slate-400">
                        #{expense.id}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className="font-semibold text-slate-900 block text-xs sm:text-sm">
                          {expense.customerName || 'Walk-in Customer'}
                        </span>
                        {expense.customerPhone && (
                          <span className="text-[11px] text-slate-400 block">{expense.customerPhone}</span>
                        )}
                      </td>
                      <td className="px-5 py-4 font-medium text-slate-900 max-w-xs">
                        <span className="block truncate">{expense.expenseName}</span>
                        {expense.description && (
                          <span className="text-xs text-slate-400 block truncate">{expense.description}</span>
                        )}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleCategoryChange(expense.category)}
                          className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${badge.bg} ${badge.text} ${badge.border} hover:opacity-80 hover:ring-2 hover:ring-emerald-400 transition-all cursor-pointer`}
                          title={`Click to filter sales for "${expense.category}" department`}
                        >
                          <Tag className="w-3 h-3 opacity-70" />
                          <span>{expense.category}</span>
                        </button>
                      </td>
                      <td className="px-5 py-4 text-xs text-slate-500 whitespace-nowrap">
                        {formatDate(expense.expenseDate)}
                      </td>
                      <td className="px-5 py-4 text-xs text-slate-600 whitespace-nowrap">
                        <span className="inline-flex items-center space-x-1 bg-slate-100 px-2 py-0.5 rounded-md text-slate-700">
                          <CreditCard className="w-3 h-3 text-slate-400" />
                          <span>{expense.modeOfPayment}</span>
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right whitespace-nowrap">
                        <span className="font-bold text-slate-900 block text-sm">
                          {formatCurrency(expense.amount)}
                        </span>
                        {expense.paymentStatus === 'PARTIAL' && (
                          <span className="text-[10px] text-rose-600 font-semibold block">
                            Due: {formatCurrency(expense.dueAmount != null ? expense.dueAmount : Math.max(0, expense.amount - (expense.paidAmount || 0)))}
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-center whitespace-nowrap">
                        {expense.paymentStatus === 'PAID' ? (
                          <button
                            onClick={async () => {
                              try {
                                await expenseApi.updatePaymentStatus(expense.id, 'UNPAID');
                                toast.success(`Bill #${expense.id} marked as UNPAID!`);
                                fetchExpenses();
                              } catch (err) {
                                toast.error(err.message || 'Failed to update payment status.');
                              }
                            }}
                            className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border border-emerald-300 transition-all shadow-xs"
                            title="Click to toggle UNPAID"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>PAID</span>
                          </button>
                        ) : expense.paymentStatus === 'PARTIAL' ? (
                          <button
                            onClick={() => {
                              navigate(`/customers/${expense.customerId || ''}`);
                            }}
                            className="inline-flex flex-col items-center px-2.5 py-0.5 rounded-xl text-xs font-bold bg-amber-100 text-amber-900 hover:bg-amber-200 border border-amber-300 transition-all shadow-xs"
                            title="Click to view Customer Khata & settle"
                          >
                            <span className="flex items-center space-x-1">
                              <Clock className="w-3 h-3 text-amber-700" />
                              <span>PARTIAL</span>
                            </span>
                            <span className="text-[10px] text-amber-800 font-normal">
                              Paid: {formatCurrency(expense.paidAmount || 0)}
                            </span>
                          </button>
                        ) : (
                          <button
                            onClick={async () => {
                              try {
                                await expenseApi.updatePaymentStatus(expense.id, 'PAID');
                                toast.success(`Bill #${expense.id} marked as PAID!`);
                                fetchExpenses();
                              } catch (err) {
                                toast.error(err.message || 'Failed to update payment status.');
                              }
                            }}
                            className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 hover:bg-rose-200 border border-rose-300 transition-all shadow-xs animate-pulse"
                            title="Click to mark as PAID"
                          >
                            <Clock className="w-3.5 h-3.5" />
                            <span>UNPAID</span>
                          </button>
                        )}
                      </td>
                      <td className="px-5 py-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center space-x-1.5">
                          {/* View detail button */}
                          <button
                            onClick={() => {
                              setExpenseToView(expense);
                              setViewModalOpen(true);
                            }}
                            title="View details"
                            className="p-1.5 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Edit button */}
                          <button
                            onClick={() => navigate(`/edit-expense/${expense.id}`)}
                            title="Edit transaction"
                            className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          {/* Delete button */}
                          <button
                            onClick={() => {
                              setExpenseToDelete(expense);
                              setDeleteModalOpen(true);
                            }}
                            title="Delete transaction"
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
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

          {/* Pagination Footer */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
              <div>
                Showing {(currentPage - 1) * pageSize + 1} to{' '}
                {Math.min(currentPage * pageSize, totalRecords)} of {totalRecords} records
              </div>

              <div className="flex items-center space-x-1.5">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {Array.from({ length: totalPages }).map((_, idx) => {
                  const pNum = idx + 1;
                  const isActive = pNum === currentPage;
                  return (
                    <button
                      key={pNum}
                      onClick={() => setCurrentPage(pNum)}
                      className={`w-8 h-8 rounded-lg font-medium transition-colors ${
                        isActive
                          ? 'bg-emerald-600 text-white font-bold'
                          : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {pNum}
                    </button>
                  );
                })}

                <button
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Confirm Expense Deletion"
      >
        <div className="space-y-4">
          <div className="flex items-start space-x-3 text-rose-600 bg-rose-50 p-4 rounded-xl">
            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="text-sm text-rose-800">
              <p className="font-semibold">Are you sure you want to delete this expense?</p>
              <p className="text-xs text-rose-600 mt-1">
                This action will immediately remove the expense from memory and disk storage.
              </p>
            </div>
          </div>

          {expenseToDelete && (
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-xs space-y-1 text-slate-600">
              <p><span className="font-medium text-slate-800">ID:</span> #{expenseToDelete.id}</p>
              <p><span className="font-medium text-slate-800">Name:</span> {expenseToDelete.expenseName}</p>
              <p><span className="font-medium text-slate-800">Amount:</span> {formatCurrency(expenseToDelete.amount)}</p>
              <p><span className="font-medium text-slate-800">Category:</span> {expenseToDelete.category}</p>
            </div>
          )}

          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
            <button
              onClick={() => setDeleteModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="px-4 py-2 text-sm font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-sm transition-colors disabled:opacity-50"
            >
              {isDeleting ? 'Deleting...' : 'Delete Permanently'}
            </button>
          </div>
        </div>
      </Modal>

      {/* View Details Modal */}
      <Modal
        isOpen={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        title="Expense Details"
        maxWidth="max-w-lg"
      >
        {expenseToView && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-slate-50 p-3 rounded-xl">
                <span className="text-xs text-slate-400 block font-medium">Expense ID</span>
                <span className="font-bold text-slate-800 font-mono">#{expenseToView.id}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl">
                <span className="text-xs text-slate-400 block font-medium">Amount</span>
                <span className="font-bold text-emerald-700 text-lg">
                  {formatCurrency(expenseToView.amount)}
                </span>
              </div>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl space-y-2 text-sm">
              <div>
                <span className="text-xs text-slate-400 block font-medium">Expense Name</span>
                <span className="font-semibold text-slate-900">{expenseToView.expenseName}</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block font-medium">Description</span>
                <span className="text-slate-600 text-xs">
                  {expenseToView.description || 'No description provided.'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl">
                <span className="text-slate-400 block font-medium">Category</span>
                <span className="font-semibold text-slate-800">{expenseToView.category}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl">
                <span className="text-slate-400 block font-medium">Date</span>
                <span className="font-semibold text-slate-800">{formatDate(expenseToView.expenseDate)}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl">
                <span className="text-slate-400 block font-medium">Payment Mode</span>
                <span className="font-semibold text-slate-800">{expenseToView.modeOfPayment}</span>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => {
                  setViewModalOpen(false);
                  navigate(`/edit-expense/${expenseToView.id}`);
                }}
                className="px-4 py-2 text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-xl transition-colors"
              >
                Edit Expense
              </button>
              <button
                onClick={() => setViewModalOpen(false)}
                className="px-4 py-2 text-xs font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
