import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Receipt,
  TrendingUp,
  Plus,
  ArrowRight,
  CreditCard,
  RefreshCw,
  AlertCircle,
  Users,
  CheckCircle2,
  Clock,
  UserPlus,
  Wheat,
  Milk,
  AlertTriangle,
  ArrowUpRight,
  IndianRupee,
  Layers,
  FolderTree,
  Tag,
  Terminal,
  Copy
} from 'lucide-react';
import {
  AreaChart,
  Area,
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
import { StatCard } from '../components/StatCard';
import { StatCardSkeleton, ChartSkeleton, TableSkeleton } from '../components/LoadingSkeleton';
import { formatCurrency, formatDate, getCategoryBadgeStyle, CATEGORY_COLORS } from '../utils/formatters';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

export const Dashboard = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [categorySummaries, setCategorySummaries] = useState([]);
  const [monthlyTrend, setMonthlyTrend] = useState([]);
  const [recentExpenses, setRecentExpenses] = useState([]);
  const [updatingStatusId, setUpdatingStatusId] = useState(null);
  const [retryCountdown, setRetryCountdown] = useState(5);
  const [copiedCmd, setCopiedCmd] = useState(false);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [sumRes, custRes, catRes, trendRes, expRes] = await Promise.all([
        expenseApi.getSummary(),
        expenseApi.getCustomers(),
        expenseApi.getCategorySummary(),
        expenseApi.getMonthlyTrend(),
        expenseApi.getExpenses({ sortBy: 'date', sortDir: 'desc' })
      ]);

      setSummary(sumRes);
      setCustomers(custRes || []);
      setCategorySummaries(catRes || []);
      setMonthlyTrend(trendRes || []);
      
      const list = Array.isArray(expRes) ? expRes : (expRes.content || []);
      setRecentExpenses(list.slice(0, 6));
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setError(err.message || 'Failed to communicate with Spring Boot backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user?.id]);

  // Auto-reconnect polling timer when in error state
  useEffect(() => {
    if (!error) {
      setRetryCountdown(5);
      return;
    }

    const timer = setInterval(() => {
      setRetryCountdown((prev) => {
        if (prev <= 1) {
          fetchDashboardData();
          return 5;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [error]);

  const handleMarkPaid = async (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    setUpdatingStatusId(id);
    try {
      await expenseApi.updatePaymentStatus(id, 'PAID');
      toast.success('Sale marked as PAID! Customer balance updated.');
      fetchDashboardData();
    } catch (err) {
      toast.error('Failed to update status: ' + err.message);
    } finally {
      setUpdatingStatusId(null);
    }
  };

  if (error) {
    return (
      <div className="max-w-xl mx-auto my-12 bg-white rounded-3xl border border-rose-200/80 shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-rose-500 via-rose-600 to-amber-600 p-6 text-white text-center relative overflow-hidden">
          <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mx-auto mb-3 shadow-inner">
            <RefreshCw className="w-7 h-7 text-white animate-spin" style={{ animationDuration: '3s' }} />
          </div>
          <h3 className="text-xl font-black tracking-tight mb-1">Connecting to Backend Server</h3>
          <p className="text-xs text-rose-100 font-medium max-w-sm mx-auto">
            Spring Boot REST API on port 8080 is not yet reachable or is starting up.
          </p>
        </div>

        <div className="p-6 sm:p-8 space-y-5">
          <div className="flex items-center justify-between p-3.5 bg-amber-50 rounded-2xl border border-amber-200/70 text-xs text-amber-900">
            <div className="flex items-center space-x-2.5">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
              </span>
              <span className="font-bold">Auto-reconnecting in {retryCountdown}s...</span>
            </div>
            <button
              onClick={() => { setRetryCountdown(5); fetchDashboardData(); }}
              disabled={loading}
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold transition-all flex items-center space-x-1.5 shadow-sm active:scale-95 text-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Retry Now</span>
            </button>
          </div>

          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">How to start backend</h4>
            <div className="p-3.5 bg-slate-900 rounded-2xl text-slate-100 font-mono text-xs flex items-center justify-between">
              <div className="flex items-center space-x-2 truncate">
                <Terminal className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-emerald-300">run-all.bat</span>
                <span className="text-slate-400 text-[11px]">(starts both frontend & backend)</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard?.writeText('run-all.bat');
                  setCopiedCmd(true);
                  setTimeout(() => setCopiedCmd(false), 2000);
                }}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                title="Copy command"
              >
                {copiedCmd ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Tip: In your project root folder, double-click <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700 font-bold">run-all.bat</code> or <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700 font-bold">run-backend.bat</code>. Once started, this page will automatically reconnect!
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Trend data for Recharts
  const trendChartData = monthlyTrend.map(item => ({
    name: item.yearMonth,
    amount: typeof item.totalSpent === 'number' ? item.totalSpent : parseFloat(item.totalSpent || 0),
    count: item.count,
  }));

  // Pie chart data
  const pieChartData = categorySummaries.map((cat) => ({
    name: cat.category,
    value: typeof cat.totalSpent === 'number' ? cat.totalSpent : parseFloat(cat.totalSpent || 0),
    count: cat.count,
    color: CATEGORY_COLORS[cat.category] || '#059669',
  }));

  const totalSpent = summary?.totalMoneySpent ?? 0;
  const totalPaid = summary?.totalPaid ?? 0;
  const totalUnpaid = summary?.totalUnpaid ?? 0;
  const totalCount = summary?.totalExpenses ?? 0;

  const paidPercent = totalSpent > 0 ? Math.round((totalPaid / totalSpent) * 100) : 0;
  const unpaidPercent = totalSpent > 0 ? Math.round((totalUnpaid / totalSpent) * 100) : 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-12">
      {/* Hero Welcome & Quick Action Bar */}
      <div className="rounded-2xl bg-slate-900 text-white p-6 sm:p-7 shadow-sm border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-1.5">
            <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-md bg-slate-800 text-[11px] font-semibold text-emerald-400 border border-slate-700">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>दैनिक रोकड़ बही (Daily Day-Book) • FY 2026-27</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
              Dairy & Feed Sales Register (बिक्री रजिस्टर)
            </h2>
            <p className="text-xs text-slate-400 max-w-xl leading-relaxed">
              Track cattle feed sacks, mustard cake (khal), wheat choker, and daily milk collection. Manage farmer Udhaar khata balances in real time.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              to="/add-expense"
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>New Bill [F2]</span>
            </Link>

            <Link
              to="/customers"
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition-colors"
            >
              <UserPlus className="w-4 h-4 text-emerald-400" />
              <span>Grahak Khata (खाता)</span>
            </Link>

            <Link
              to="/categories?tab=analytics"
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition-colors"
              title="View sales breakdown by department"
            >
              <FolderTree className="w-4 h-4 text-slate-400" />
              <span>Dept Sales</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Udhaar / Unpaid Warning Banner if any dues exist */}
      {totalUnpaid > 0 && (
        <div className="rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-transparent border border-amber-300/80 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-800 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <p className="text-xs font-bold text-amber-950">
                Outstanding Farmer Udhaar (Credit): {formatCurrency(totalUnpaid)}
              </p>
              <p className="text-[11px] text-amber-800 mt-0.5">
                {unpaidPercent}% of recorded sales are pending collection across farmer Khata accounts.
              </p>
            </div>
          </div>

          <Link
            to="/customers"
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-sm transition-all shrink-0 self-start sm:self-auto"
          >
            <span>Review Farmer Khata</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Top 4 Key Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {loading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          <>
            <StatCard
              title="Total Turnover / Sales"
              value={formatCurrency(totalSpent)}
              icon={Receipt}
              color="emerald"
              subtitle={`${totalCount} Total Sales`}
              badge="Turnover"
            />
            <StatCard
              title="Cash & UPI Collected"
              value={formatCurrency(totalPaid)}
              icon={CheckCircle2}
              color="teal"
              subtitle={`${paidPercent}% Paid`}
              badge="Received"
            />
            <StatCard
              title="Pending Udhaar (Dues)"
              value={formatCurrency(totalUnpaid)}
              icon={Clock}
              color="rose"
              subtitle={`${unpaidPercent}% Unpaid`}
              badge="Action Needed"
            />
            <StatCard
              title="Registered Farmers"
              value={customers.length.toString()}
              icon={Users}
              color="blue"
              subtitle="Khata Profiles"
              badge="Active"
            />
          </>
        )}
      </div>

      {/* Interactive Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Trend Area Chart */}
        <div className="lg:col-span-2 bg-white/95 backdrop-blur-md rounded-3xl p-6 border border-slate-200/80 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.05)] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 tracking-tight">Monthly Sales Trend</h3>
              <p className="text-xs text-slate-400 font-medium">Turnover over time across all products</p>
            </div>
            <div className="flex items-center space-x-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200/60">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Monthly Volume</span>
            </div>
          </div>

          {loading ? (
            <ChartSkeleton height={280} />
          ) : trendChartData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-slate-400 text-xs font-medium">
              No sales data recorded yet.
            </div>
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendChartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#059669" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#059669" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip
                    formatter={(val) => [formatCurrency(val), 'Sales']}
                    contentStyle={{ borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)', fontSize: '12px' }}
                  />
                  <Area type="monotone" dataKey="amount" stroke="#059669" strokeWidth={3} fillOpacity={1} fill="url(#colorSpend)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Category Breakdown Donut Chart */}
        <div className="bg-white/95 backdrop-blur-md rounded-3xl p-6 border border-slate-200/80 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.05)] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center space-x-1.5">
                <FolderTree className="w-4 h-4 text-emerald-600" />
                <span>Sales by Department</span>
              </h3>
              <p className="text-xs text-slate-400 font-medium">Click any department to filter sales</p>
            </div>
            <Link
              to="/categories?tab=analytics"
              className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center space-x-0.5 group"
            >
              <span>All Departments</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          {loading ? (
            <ChartSkeleton height={260} />
          ) : pieChartData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-slate-400 text-xs font-medium">
              No category data available.
            </div>
          ) : (
            <div className="h-64 w-full flex flex-col justify-center">
              <ResponsiveContainer width="100%" height="75%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={52}
                    outerRadius={78}
                    paddingAngle={3}
                    dataKey="value"
                    className="cursor-pointer"
                    onClick={(data) => {
                      if (data && data.name) {
                        navigate(`/expenses?category=${encodeURIComponent(data.name)}`);
                      }
                    }}
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color}
                        className="cursor-pointer hover:opacity-80 transition-opacity"
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val) => [formatCurrency(val), 'Turnover']} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap justify-center gap-1.5 mt-2">
                {pieChartData.slice(0, 5).map((cat) => (
                  <Link
                    key={cat.name}
                    to={`/expenses?category=${encodeURIComponent(cat.name)}`}
                    className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-lg bg-slate-50 hover:bg-emerald-50 text-[11px] text-slate-700 hover:text-emerald-700 font-medium transition-colors border border-slate-100 hover:border-emerald-200"
                    title={`View sales in ${cat.name}`}
                  >
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                    <span className="truncate max-w-[120px]">{cat.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recent Transactions Section */}
      <div className="bg-white/95 backdrop-blur-md rounded-3xl border border-slate-200/80 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.05)] overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 tracking-tight">Recent Sales Records</h3>
            <p className="text-xs text-slate-400 font-medium">Latest cattle feed bags and dairy sales</p>
          </div>
          <Link
            to="/expenses"
            className="inline-flex items-center space-x-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100/80 px-3.5 py-2 rounded-xl transition-colors self-start sm:self-auto"
          >
            <span>View All Records</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <TableSkeleton rows={5} />
        ) : recentExpenses.length === 0 ? (
          <div className="p-12 text-center text-slate-500 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
              <Wheat className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-slate-700">No feed or dairy sales recorded yet.</p>
            <p className="text-xs text-slate-400">Record your first sale to start tracking farmer dues.</p>
            <Link
              to="/add-expense"
              className="mt-2 inline-flex items-center space-x-1.5 text-xs font-bold px-4 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Record Sale Now</span>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">Customer / Farmer</th>
                  <th className="px-6 py-4">Product / Item</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-right">Amount</th>
                  <th className="px-6 py-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentExpenses.map((expense) => {
                  const badge = getCategoryBadgeStyle(expense.category);
                  const isPaid = expense.paymentStatus === 'PAID';
                  const isPartial = expense.paymentStatus === 'PARTIAL';
                  const custName = expense.customerName || 'Walk-in Customer';
                  const isUpdating = updatingStatusId === expense.id;

                  return (
                    <tr
                      key={expense.id}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      <td className="px-6 py-4 font-semibold text-slate-900 whitespace-nowrap">
                        <div className="flex items-center space-x-2.5">
                          <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-500 text-white flex items-center justify-center font-bold text-[10px] shadow-sm">
                            {custName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className="block font-bold text-slate-900">{custName}</span>
                            {expense.customerPhone && (
                              <span className="text-[10px] text-slate-400">{expense.customerPhone}</span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 font-semibold text-slate-800">
                        <div>
                          <span className="block font-bold text-slate-900">{expense.expenseName}</span>
                          {expense.description && (
                            <p className="text-[11px] text-slate-400 truncate max-w-xs mt-0.5">
                              {expense.description}
                            </p>
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <Link
                          to={`/expenses?category=${encodeURIComponent(expense.category)}`}
                          className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${badge.bg} ${badge.text} ${badge.border} hover:ring-2 hover:ring-emerald-400 transition-all cursor-pointer`}
                          title={`Filter sales by "${expense.category}" department`}
                        >
                          <Tag className="w-2.5 h-2.5 opacity-70" />
                          <span>{expense.category}</span>
                        </Link>
                      </td>

                      <td className="px-6 py-4 text-slate-500 font-medium whitespace-nowrap">
                        {formatDate(expense.expenseDate)}
                      </td>

                      <td className="px-6 py-4 text-center">
                        {isPaid ? (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            <span>PAID</span>
                          </span>
                        ) : isPartial ? (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                            <span>PARTIAL</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200 animate-pulse">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                            <span>UNPAID</span>
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4 text-right font-extrabold text-slate-900 text-sm whitespace-nowrap">
                        <div>
                          <span>{formatCurrency(expense.amount)}</span>
                          {isPartial && (
                            <span className="text-[10px] text-amber-700 font-semibold block">
                              Due: {formatCurrency(expense.dueAmount != null ? expense.dueAmount : Math.max(0, expense.amount - (expense.paidAmount || 0)))}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-4 text-center whitespace-nowrap">
                        {!isPaid ? (
                          <button
                            onClick={(e) => handleMarkPaid(expense.id, e)}
                            disabled={isUpdating}
                            className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] shadow-sm transition-all active:scale-95 disabled:opacity-50"
                            title="Click to clear Udhaar balance"
                          >
                            <CheckCircle2 className="w-3 h-3" />
                            <span>{isUpdating ? '...' : 'Mark Paid'}</span>
                          </button>
                        ) : (
                          <span className="text-[11px] font-medium text-slate-400">
                            Settled
                          </span>
                        )}
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
  );
};

export default Dashboard;
