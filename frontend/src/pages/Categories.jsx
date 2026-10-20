import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  FolderTree,
  TrendingUp,
  Receipt,
  ArrowRight,
  PieChart as PieIcon,
  Tag,
  RefreshCw,
  Plus,
  Pencil,
  Trash2,
  IndianRupee,
  Search,
  Filter,
  Check,
  X,
  RotateCcw,
  Wheat,
  Milk,
  Package,
  Layers,
  ShoppingCart,
  AlertCircle,
  Coins,
  ArrowUpRight
} from 'lucide-react';
import { expenseApi } from '../services/api';
import { productStorage } from '../services/productStorage';
import { useToast } from '../context/ToastContext';
import { TableSkeleton } from '../components/LoadingSkeleton';
import {
  CATEGORIES_LIST,
  formatCurrency,
  formatPercentage,
  getCategoryBadgeStyle
} from '../utils/formatters';

const COMMON_UNITS = [
  'Bag (50kg)',
  'Bag (35kg)',
  'Bag (25kg)',
  'Litre',
  'Kg',
  'Pouch (5kg)',
  'Can (5L)',
  'Tin (1kg)',
  'Unit'
];

export const Categories = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  // Active view tab: 'catalog' (Feed & Dairy Products & Rates) or 'analytics' (Department Sales breakdown)
  const initialTab =
    searchParams.get('tab') === 'analytics' ||
    searchParams.get('tab') === 'departments' ||
    searchParams.get('tab') === 'sales'
      ? 'analytics'
      : 'catalog';
  const [activeTab, setActiveTab] = useState(initialTab);

  // Sync tab if URL param changes
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'analytics' || tabParam === 'departments' || tabParam === 'sales') {
      if (activeTab !== 'analytics') setActiveTab('analytics');
    } else if (tabParam === 'catalog') {
      if (activeTab !== 'catalog') setActiveTab('catalog');
    }
  }, [searchParams]);

  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
    const nextParams = new URLSearchParams(searchParams);
    if (newTab === 'analytics') {
      nextParams.set('tab', 'analytics');
    } else {
      nextParams.delete('tab');
    }
    setSearchParams(nextParams, { replace: true });
  };

  // Products from local persistent storage
  const [products, setProducts] = useState(() => productStorage.getProducts());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('ALL');

  // Inline price editing state: { [productId]: tempPrice }
  const [editingPriceId, setEditingPriceId] = useState(null);
  const [tempPriceValue, setTempPriceValue] = useState('');

  // Add / Edit Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' | 'edit'
  const [editingProductId, setEditingProductId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'Cattle Feed Pellets (Pashu Aahar)',
    defaultPrice: '',
    unit: 'Bag (50kg)',
  });
  const [formErrors, setFormErrors] = useState({});

  // Category sales analytics from API
  const [categories, setCategories] = useState([]);
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);
  const [totalSpent, setTotalSpent] = useState(0);

  // Load products & listen to updates
  const reloadProducts = () => {
    setProducts(productStorage.getProducts());
  };

  useEffect(() => {
    const handleProductsUpdated = () => {
      reloadProducts();
    };
    window.addEventListener('products_updated', handleProductsUpdated);
    return () => {
      window.removeEventListener('products_updated', handleProductsUpdated);
    };
  }, []);

  // Fetch API category analytics
  const fetchAnalytics = async () => {
    setLoadingAnalytics(true);
    try {
      const data = await expenseApi.getCategorySummary();
      setCategories(data || []);

      const grandTotal = (data || []).reduce(
        (sum, item) => sum + (parseFloat(item.totalSpent) || 0),
        0
      );
      setTotalSpent(grandTotal);
    } catch (err) {
      toast.error(err.message || 'Failed to load category summaries.');
    } finally {
      setLoadingAnalytics(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  // Filtered products list
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.unit && p.unit.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCat =
        selectedCategoryFilter === 'ALL' || p.category === selectedCategoryFilter;

      return matchesSearch && matchesCat;
    });
  }, [products, searchQuery, selectedCategoryFilter]);

  // Catalog Summary Statistics
  const catalogStats = useMemo(() => {
    const totalItems = products.length;
    const feedCount = products.filter(
      (p) =>
        p.category.includes('Feed') ||
        p.category.includes('Khal') ||
        p.category.includes('Bran') ||
        p.category.includes('Mineral') ||
        p.category.includes('Fodder')
    ).length;
    const dairyCount = products.filter(
      (p) =>
        p.category.includes('Milk') ||
        p.category.includes('Ghee') ||
        p.category.includes('Paneer') ||
        p.category.includes('Curd')
    ).length;
    const avgRate =
      totalItems > 0
        ? products.reduce((acc, p) => acc + (parseFloat(p.defaultPrice) || 0), 0) / totalItems
        : 0;

    return { totalItems, feedCount, dairyCount, avgRate };
  }, [products]);

  // Modal open handlers
  const handleOpenAddModal = () => {
    setModalMode('add');
    setEditingProductId(null);
    setFormData({
      name: '',
      category: 'Cattle Feed Pellets (Pashu Aahar)',
      defaultPrice: '',
      unit: 'Bag (50kg)',
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (product) => {
    setModalMode('edit');
    setEditingProductId(product.id);
    setFormData({
      name: product.name,
      category: product.category,
      defaultPrice: product.defaultPrice.toString(),
      unit: product.unit || 'Bag (50kg)',
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormErrors({});
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) {
      errors.name = 'Product name is required.';
    }
    if (!formData.defaultPrice) {
      errors.defaultPrice = 'Default rate / price is required.';
    } else {
      const num = parseFloat(formData.defaultPrice);
      if (isNaN(num) || num <= 0) {
        errors.defaultPrice = 'Rate must be a positive number.';
      }
    }
    if (!formData.unit.trim()) {
      errors.unit = 'Unit is required (e.g. Bag 50kg, Litre).';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveProduct = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (modalMode === 'add') {
      productStorage.addProduct(formData);
      toast.success(`"${formData.name}" added to catalog!`);
    } else {
      productStorage.updateProduct(editingProductId, formData);
      toast.success(`"${formData.name}" updated successfully!`);
    }

    reloadProducts();
    handleCloseModal();
  };

  const handleDeleteProduct = (product) => {
    if (window.confirm(`Are you sure you want to remove "${product.name}" from the product list?`)) {
      productStorage.deleteProduct(product.id);
      reloadProducts();
      toast.success(`"${product.name}" removed from catalog.`);
    }
  };

  const handleResetDefaults = () => {
    if (
      window.confirm(
        'Reset product catalog to standard feed & dairy items and rates? Any custom items will be replaced.'
      )
    ) {
      productStorage.resetToDefaults();
      reloadProducts();
      toast.success('Catalog reset to standard feed & dairy items.');
    }
  };

  // Quick inline price editor
  const handleStartInlineEditPrice = (product) => {
    setEditingPriceId(product.id);
    setTempPriceValue(product.defaultPrice.toString());
  };

  const handleSaveInlinePrice = (product) => {
    const newPrice = parseFloat(tempPriceValue);
    if (isNaN(newPrice) || newPrice <= 0) {
      toast.error('Please enter a valid positive price.');
      return;
    }

    productStorage.updateProduct(product.id, {
      ...product,
      defaultPrice: newPrice,
    });

    toast.success(`Updated rate for "${product.name}" to ${formatCurrency(newPrice)}`);
    setEditingPriceId(null);
    reloadProducts();
  };

  const handleCancelInlinePrice = () => {
    setEditingPriceId(null);
    setTempPriceValue('');
  };

  // Quick sell action
  const handleRecordSaleForProduct = (product) => {
    navigate(
      `/add-expense?productName=${encodeURIComponent(product.name)}&category=${encodeURIComponent(
        product.category
      )}&price=${product.defaultPrice}`
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center space-x-2.5">
            <Package className="w-7 h-7 text-emerald-600" />
            <span>Feed & Dairy Product Catalog</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Manage cattle feed bags, oil cakes (khal), dairy products, and set daily selling rates.
          </p>
        </div>

        <div className="flex items-center space-x-2 self-start sm:self-auto">
          {activeTab === 'catalog' ? (
            <>
              <button
                onClick={handleResetDefaults}
                className="px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-xs font-semibold flex items-center space-x-1.5 transition-colors shadow-sm"
                title="Reset to default items"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                <span>Reset Defaults</span>
              </button>

              <button
                onClick={handleOpenAddModal}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold flex items-center space-x-1.5 shadow-md shadow-emerald-500/20 transition-all"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>+ Add Product</span>
              </button>
            </>
          ) : (
            <button
              onClick={fetchAnalytics}
              className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors shadow-sm"
              title="Refresh Analytics"
            >
              <RefreshCw className={`w-4 h-4 ${loadingAnalytics ? 'animate-spin' : ''}`} />
            </button>
          )}
        </div>
      </div>

      {/* Main Tab Navigation */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-1">
        <button
          onClick={() => handleTabChange('catalog')}
          className={`pb-3 px-4 font-bold text-sm flex items-center space-x-2 border-b-2 transition-all cursor-pointer ${
            activeTab === 'catalog'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Products & Daily Rates</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold ml-1">
            {products.length}
          </span>
        </button>

        <button
          onClick={() => handleTabChange('analytics')}
          className={`pb-3 px-4 font-bold text-sm flex items-center space-x-2 border-b-2 transition-all cursor-pointer ${
            activeTab === 'analytics'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Sales by Department (बिक्री विभाग)</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold ml-1">
            {categories.length}
          </span>
        </button>
      </div>

      {/* TAB 1: PRODUCT CATALOG & DAILY RATES */}
      {activeTab === 'catalog' && (
        <div className="space-y-6">
          {/* Quick Stat Highlights */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
                <Wheat className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] text-slate-400 font-semibold uppercase">Feed Items</p>
                <p className="text-lg font-bold text-slate-800">{catalogStats.feedCount} Products</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center font-bold">
                <Milk className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] text-slate-400 font-semibold uppercase">Dairy Items</p>
                <p className="text-lg font-bold text-slate-800">{catalogStats.dairyCount} Products</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                <Package className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] text-slate-400 font-semibold uppercase">Total Catalog</p>
                <p className="text-lg font-bold text-slate-800">{catalogStats.totalItems} Items</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
                <IndianRupee className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] text-slate-400 font-semibold uppercase">Avg Selling Rate</p>
                <p className="text-lg font-bold text-slate-800">{formatCurrency(catalogStats.avgRate)}</p>
              </div>
            </div>
          </div>

          {/* Search and Filters Bar */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search feed, milk, khal, unit..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-slate-800"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center space-x-2 w-full md:w-auto">
              <Filter className="w-4 h-4 text-slate-400 shrink-0" />
              <select
                value={selectedCategoryFilter}
                onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                className="w-full md:w-64 px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-slate-700"
              >
                <option value="ALL">All Categories ({products.length})</option>
                {CATEGORIES_LIST.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Product Cards Grid */}
          {filteredProducts.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm">
              <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-700">No products found</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                No feed or dairy products match your search or filter. Try a different query or add a
                new product.
              </p>
              <button
                onClick={handleOpenAddModal}
                className="mt-4 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold inline-flex items-center space-x-1.5 shadow-sm hover:bg-emerald-700 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Product Now</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProducts.map((product) => {
                const badge = getCategoryBadgeStyle(product.category);
                const isEditingThisPrice = editingPriceId === product.id;

                return (
                  <div
                    key={product.id}
                    className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-card hover:shadow-elevated transition-all flex flex-col justify-between group"
                  >
                    <div>
                      {/* Top Header of Card */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold border ${badge.bg} ${badge.text} ${badge.border}`}
                        >
                          {product.category}
                        </span>

                        <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200/60">
                          {product.unit}
                        </span>
                      </div>

                      {/* Product Name */}
                      <h4 className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-2 mt-1">
                        {product.name}
                      </h4>
                    </div>

                    {/* Rate & Inline Price Update Area */}
                    <div className="mt-4 pt-4 border-t border-slate-100">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                          Selling Rate / Price
                        </span>
                        {!isEditingThisPrice && (
                          <button
                            onClick={() => handleStartInlineEditPrice(product)}
                            className="text-[11px] font-bold text-emerald-600 hover:text-emerald-800 flex items-center space-x-1 transition-colors"
                            title="Quickly change price"
                          >
                            <Pencil className="w-3 h-3" />
                            <span>Update Rate</span>
                          </button>
                        )}
                      </div>

                      {isEditingThisPrice ? (
                        <div className="flex items-center space-x-1.5 animate-in fade-in">
                          <div className="relative flex-1">
                            <IndianRupee className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                            <input
                              type="number"
                              step="0.5"
                              value={tempPriceValue}
                              onChange={(e) => setTempPriceValue(e.target.value)}
                              autoFocus
                              className="w-full pl-7 pr-2 py-1.5 text-sm font-bold bg-amber-50/50 border border-amber-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-900"
                            />
                          </div>
                          <button
                            onClick={() => handleSaveInlinePrice(product)}
                            className="p-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
                            title="Save Rate"
                          >
                            <Check className="w-4 h-4 stroke-[2.5]" />
                          </button>
                          <button
                            onClick={handleCancelInlinePrice}
                            className="p-2 rounded-xl border border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors"
                            title="Cancel"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-baseline justify-between">
                          <span className="text-2xl font-black text-slate-900">
                            {formatCurrency(product.defaultPrice)}
                          </span>
                          <span className="text-xs text-slate-400 font-medium">
                            / {product.unit}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Card Actions Footer */}
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <button
                        onClick={() => handleRecordSaleForProduct(product)}
                        className="flex-1 py-1.5 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center justify-center space-x-1.5 transition-colors border border-emerald-200/60"
                        title="Record sale for this item"
                      >
                        <ShoppingCart className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Record Sale</span>
                      </button>

                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => handleOpenEditModal(product)}
                          className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors"
                          title="Edit full product details"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleDeleteProduct(product)}
                          className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Remove product"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: SALES BY DEPARTMENT (ANALYTICS) */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* Top Banner */}
          <div className="bg-gradient-to-r from-amber-900 via-teal-900 to-emerald-950 rounded-2xl p-6 text-white shadow-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-semibold text-amber-200 uppercase tracking-wider">
                Total Feed & Dairy Revenue
              </span>
              <h3 className="text-3xl font-extrabold mt-1">{formatCurrency(totalSpent)}</h3>
              <p className="text-xs text-teal-100/80 mt-1">
                Spread across {categories.length} active product departments
              </p>
            </div>
            <div className="flex items-center space-x-2 bg-white/10 px-4 py-2 rounded-xl backdrop-blur-sm border border-white/10">
              <FolderTree className="w-5 h-5 text-amber-300" />
              <span className="text-sm font-medium">{categories.length} Active Departments</span>
            </div>
          </div>

          {/* Cards Grid */}
          {loadingAnalytics ? (
            <TableSkeleton rows={4} />
          ) : categories.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 text-slate-500">
              <Tag className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-semibold">No feed or dairy category sales recorded yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {categories.map((item) => {
                const badge = getCategoryBadgeStyle(item.category);
                const percentage = item.percentage || 0;

                return (
                  <div
                    key={item.category}
                    onClick={() =>
                      navigate(`/expenses?category=${encodeURIComponent(item.category)}`)
                    }
                    className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-card hover:shadow-elevated transition-all duration-300 cursor-pointer group flex flex-col justify-between"
                  >
                    <div>
                      {/* Card Header */}
                      <div className="flex items-center justify-between mb-4">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${badge.bg} ${badge.text} ${badge.border}`}
                        >
                          {item.category}
                        </span>
                        <span className="text-xs font-bold text-slate-400 font-mono">
                          {formatPercentage(percentage)}
                        </span>
                      </div>

                      {/* Card Values */}
                      <div className="space-y-1">
                        <span className="text-xs text-slate-400 font-medium">Total Sales</span>
                        <h4 className="text-2xl font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
                          {formatCurrency(item.totalSpent)}
                        </h4>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full bg-slate-100 h-2 rounded-full mt-4 overflow-hidden">
                        <div
                          className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(percentage, 100)}%` }}
                        />
                      </div>
                    </div>

                    {/* Footer details */}
                    <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100 text-xs text-slate-500">
                      <div className="flex items-center space-x-1.5">
                        <Receipt className="w-3.5 h-3.5 text-slate-400" />
                        <span>
                          {item.count} transaction{item.count !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1 text-emerald-600 font-semibold group-hover:translate-x-1 transition-transform">
                        <span>View items</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Detailed Department Performance Table */}
          {categories.length > 0 && (
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <FolderTree className="w-5 h-5 text-emerald-600" />
                  <h3 className="font-bold text-slate-900 text-base">
                    Department Revenue & Volume Breakdown (विभागवार विवरण)
                  </h3>
                </div>
                <span className="text-xs font-semibold text-slate-400">
                  {categories.length} Active Departments
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-slate-50/80 text-slate-500 uppercase font-bold text-[10px] tracking-wider border-b border-slate-100">
                    <tr>
                      <th className="py-3.5 px-6">Department</th>
                      <th className="py-3.5 px-4 text-center">Sales Count</th>
                      <th className="py-3.5 px-4 text-right">Total Revenue</th>
                      <th className="py-3.5 px-4 text-right">Avg Sale / Bill</th>
                      <th className="py-3.5 px-4 text-center">Store Share</th>
                      <th className="py-3.5 px-6 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {categories.map((item) => {
                      const badge = getCategoryBadgeStyle(item.category);
                      const avg = item.count > 0 ? (item.totalSpent / item.count) : 0;
                      return (
                        <tr key={item.category} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-3.5 px-6">
                            <span className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${badge.bg} ${badge.text} ${badge.border}`}>
                              <Tag className="w-3 h-3 opacity-70" />
                              <span>{item.category}</span>
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-center font-bold text-slate-700">
                            {item.count} sales
                          </td>
                          <td className="py-3.5 px-4 text-right font-extrabold text-emerald-600 text-base">
                            {formatCurrency(item.totalSpent)}
                          </td>
                          <td className="py-3.5 px-4 text-right font-medium text-slate-600">
                            {formatCurrency(avg)}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-slate-100 text-slate-700">
                              {formatPercentage(item.percentage)}
                            </span>
                          </td>
                          <td className="py-3.5 px-6 text-right">
                            <button
                              onClick={() => navigate(`/expenses?category=${encodeURIComponent(item.category)}`)}
                              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs border border-emerald-200 transition-colors cursor-pointer"
                              title={`View all ${item.category} sales`}
                            >
                              <span>View Sales</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
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
      )}

      {/* ADD / EDIT PRODUCT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-100 space-y-5 animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  {modalMode === 'add' ? (
                    <Plus className="w-5 h-5 stroke-[2.5]" />
                  ) : (
                    <Pencil className="w-4 h-4" />
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    {modalMode === 'add' ? 'Add Feed or Dairy Product' : 'Edit Product & Rate'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Set product name, category department, unit, and default rate.
                  </p>
                </div>
              </div>

              <button
                onClick={handleCloseModal}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveProduct} className="space-y-4">
              {/* Product Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Product / Item Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. 50kg Kapila Pashu Aahar, Fresh Buffalo Milk, Sarson Khal"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full px-4 py-2.5 text-sm bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 transition-all font-medium ${
                    formErrors.name
                      ? 'border-rose-400 focus:ring-rose-200'
                      : 'border-slate-200 focus:ring-emerald-500/20 focus:border-emerald-500'
                  }`}
                />
                {formErrors.name && (
                  <p className="text-xs text-rose-600 mt-1">{formErrors.name}</p>
                )}
              </div>

              {/* Department Category */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Category / Department <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-slate-700"
                >
                  {CATEGORIES_LIST.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price and Unit Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Default Rate / Price (₹) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <IndianRupee className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="number"
                      step="0.5"
                      min="0.1"
                      placeholder="0.00"
                      value={formData.defaultPrice}
                      onChange={(e) => setFormData({ ...formData, defaultPrice: e.target.value })}
                      className={`w-full pl-9 pr-4 py-2.5 text-sm bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 font-bold ${
                        formErrors.defaultPrice
                          ? 'border-rose-400 focus:ring-rose-200'
                          : 'border-slate-200 focus:ring-emerald-500/20 focus:border-emerald-500'
                      }`}
                    />
                  </div>
                  {formErrors.defaultPrice && (
                    <p className="text-xs text-rose-600 mt-1">{formErrors.defaultPrice}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Unit of Measurement <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Bag (50kg), Litre, Kg"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-slate-700"
                  />
                  {formErrors.unit && (
                    <p className="text-xs text-rose-600 mt-1">{formErrors.unit}</p>
                  )}
                </div>
              </div>

              {/* Quick Unit Presets */}
              <div>
                <span className="text-[11px] font-semibold text-slate-400 block mb-1.5">
                  Quick Unit Presets:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {COMMON_UNITS.map((unitOpt) => (
                    <button
                      key={unitOpt}
                      type="button"
                      onClick={() => setFormData({ ...formData, unit: unitOpt })}
                      className={`text-[11px] px-2.5 py-1 rounded-lg border font-medium transition-all ${
                        formData.unit === unitOpt
                          ? 'bg-emerald-100 border-emerald-300 text-emerald-800'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {unitOpt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold shadow-md shadow-emerald-500/20 transition-all flex items-center space-x-1.5"
                >
                  <Check className="w-4 h-4 stroke-[2.5]" />
                  <span>{modalMode === 'add' ? 'Save Product' : 'Update Product'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Categories;
