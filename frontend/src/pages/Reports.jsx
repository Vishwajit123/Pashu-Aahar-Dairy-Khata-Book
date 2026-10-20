import React, { useState, useEffect } from 'react';
import {
  Download,
  Calendar,
  Wallet,
  Receipt,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  CreditCard,
  FolderTree,
  Filter,
  RefreshCw,
  FileSpreadsheet
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { expenseApi } from '../services/api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { StatCard } from '../components/StatCard';
import { StatCardSkeleton, TableSkeleton } from '../components/LoadingSkeleton';
import {
  formatCurrency,
  formatDate,
  formatPercentage,
  getCategoryBadgeStyle,
  CATEGORY_COLORS
} from '../utils/formatters';

export const Reports = () => {
  const toast = useToast();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [categories, setCategories] = useState([]);
  const [paymentModes, setPaymentModes] = useState([]);
  const [exporting, setExporting] = useState(false);

  // Monthly summary selection state
  const currentMonthStr = new Date().toISOString().substring(0, 7); // e.g. 2026-10
  const [selectedMonth, setSelectedMonth] = useState(currentMonthStr);
  const [monthlyData, setMonthlyData] = useState(null);
  const [loadingMonthly, setLoadingMonthly] = useState(false);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const [sumRes, catRes, modeRes] = await Promise.all([
        expenseApi.getSummary(),
        expenseApi.getCategorySummary(),
        expenseApi.getPaymentModeSummary(),
      ]);

      setSummary(sumRes);
      setCategories(catRes || []);
      setPaymentModes(modeRes || []);
    } catch (err) {
      toast.error(err.message || 'Failed to load report analytics.');
    } finally {
      setLoading(false);
    }
  };

  const fetchMonthlySummary = async (month) => {
    setLoadingMonthly(true);
    try {
      const data = await expenseApi.getMonthlySummary(month);
      setMonthlyData(data);
    } catch (err) {
      toast.error(err.message || `Failed to load monthly summary for ${month}.`);
    } finally {
      setLoadingMonthly(false);
    }
  };

  useEffect(() => {
    fetchReports();
    fetchMonthlySummary(selectedMonth);
  }, [user?.id]);

  const handleMonthChange = (e) => {
    const val = e.target.value;
    setSelectedMonth(val);
    fetchMonthlySummary(val);
  };

  const handleExportCsv = async () => {
    setExporting(true);
    try {
      await expenseApi.exportCsv();
      toast.success('Expense report exported successfully as CSV.');
    } catch (err) {
      toast.error(err.message || 'Failed to download CSV report.');
    } finally {
      setExporting(false);
    }
  };

  const paymentColors = ['#10b981', '#06b6d4', '#6366f1', '#f59e0b', '#ec4899', '#8b5cf6'];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header with Export Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Feed & Dairy Reports & Analytics
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Analyze cattle feed revenue, dairy sales volume, payment methods, and monthly performance.
          </p>
        </div>

        <button
          onClick={handleExportCsv}
          disabled={exporting}
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl font-semibold text-sm bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-600/30 transition-all self-start sm:self-auto disabled:opacity-50"
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>{exporting ? 'Generating CSV...' : 'Export to CSV'}</span>
        </button>
      </div>

      {/* 5 Key Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {loading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          <>
            <StatCard
              title="Total Revenue"
              value={formatCurrency(summary?.totalMoneySpent)}
              icon={Wallet}
              color="emerald"
            />
            <StatCard
              title="Total Sales"
              value={summary?.totalExpenses ?? 0}
              icon={Receipt}
              color="teal"
            />
            <StatCard
              title="Average Sale"
              value={formatCurrency(summary?.averageExpense)}
              icon={TrendingUp}
              color="blue"
            />
            <StatCard
              title="Highest Bill"
              value={formatCurrency(summary?.highestExpense?.amount)}
              icon={ArrowUpRight}
              color="amber"
              subtitle={summary?.highestExpense?.expenseName || 'None'}
            />
            <StatCard
              title="Lowest Bill"
              value={formatCurrency(summary?.lowestExpense?.amount)}
              icon={ArrowDownRight}
              color="purple"
              subtitle={summary?.lowestExpense?.expenseName || 'None'}
            />
          </>
        )}
      </div>

      {/* Monthly Summary Selector Section */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-card space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">Monthly Expense Breakdown</h3>
            <p className="text-xs text-slate-400">Select any month to inspect transactions and total spend</p>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-slate-600">Select Month:</span>
            <input
              type="month"
              value={selectedMonth}
              onChange={handleMonthChange}
              className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 font-semibold"
            />
          </div>
        </div>

        {loadingMonthly ? (
          <TableSkeleton rows={4} />
        ) : !monthlyData || monthlyData.count === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm">
            <Calendar className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p>No expenses found for month {selectedMonth}.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Month Summary Banner */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-emerald-50/70 border border-emerald-100 p-4 rounded-xl">
              <div>
                <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">
                  Total Spent in {monthlyData.yearMonth}
                </span>
                <p className="text-2xl font-bold text-emerald-900 mt-0.5">
                  {formatCurrency(monthlyData.totalSpent)}
                </p>
              </div>
              <div>
                <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">
                  Total Transactions
                </span>
                <p className="text-2xl font-bold text-emerald-900 mt-0.5">
                  {monthlyData.count} recorded
                </p>
              </div>
            </div>

            {/* Monthly Items List */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold">
                  <tr>
                    <th className="px-4 py-3">ID</th>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Mode</th>
                    <th className="px-4 py-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {monthlyData.expenses.map((expense) => {
                    const badge = getCategoryBadgeStyle(expense.category);
                    return (
                      <tr key={expense.id} className="hover:bg-slate-50/50">
                        <td className="px-4 py-3 font-mono text-xs text-slate-400">#{expense.id}</td>
                        <td className="px-4 py-3 font-medium text-slate-800">{expense.expenseName}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium border ${badge.bg} ${badge.text} ${badge.border}`}>
                            {expense.category}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-500">{formatDate(expense.expenseDate)}</td>
                        <td className="px-4 py-3 text-xs text-slate-600">{expense.modeOfPayment}</td>
                        <td className="px-4 py-3 text-right font-bold text-slate-900">
                          {formatCurrency(expense.amount)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* 2 Column Charts: Payment Modes & Category Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Mode Distribution */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-card flex flex-col">
          <div className="flex items-center space-x-2.5 mb-4">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">Spending by Payment Mode</h3>
              <p className="text-xs text-slate-400">Cash, UPI, Credit Card, etc.</p>
            </div>
          </div>

          {loading ? (
            <div className="h-64 flex items-center justify-center bg-slate-50 rounded-xl animate-pulse" />
          ) : paymentModes.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-slate-400 text-sm">
              No payment mode data available.
            </div>
          ) : (
            <div className="h-64 w-full flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={paymentModes}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="totalSpent"
                    nameKey="paymentMode"
                  >
                    {paymentModes.map((entry, index) => (
                      <Cell key={`mode-${index}`} fill={paymentColors[index % paymentColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [formatCurrency(value), 'Total Spent']}
                    contentStyle={{ borderRadius: '12px', fontSize: '12px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Category Breakdown Table */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-card flex flex-col">
          <div className="flex items-center space-x-2.5 mb-4">
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
              <FolderTree className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">Category Expense Summary</h3>
              <p className="text-xs text-slate-400">Total volume and percentage share</p>
            </div>
          </div>

          <div className="overflow-y-auto max-h-64 flex-1">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-semibold sticky top-0">
                <tr>
                  <th className="px-3 py-2">Category</th>
                  <th className="px-3 py-2 text-right">Transactions</th>
                  <th className="px-3 py-2 text-right">Total</th>
                  <th className="px-3 py-2 text-right">Share</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {categories.map((c) => (
                  <tr key={c.category} className="hover:bg-slate-50/50">
                    <td className="px-3 py-2.5 font-medium text-slate-800">{c.category}</td>
                    <td className="px-3 py-2.5 text-right text-slate-500">{c.count}</td>
                    <td className="px-3 py-2.5 text-right font-bold text-slate-900">
                      {formatCurrency(c.totalSpent)}
                    </td>
                    <td className="px-3 py-2.5 text-right font-mono font-semibold text-emerald-600">
                      {formatPercentage(c.percentage)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
