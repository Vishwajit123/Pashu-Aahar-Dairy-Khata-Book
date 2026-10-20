/**
 * Utilities for formatting monetary amounts, dates, and category pills
 * Tailored for Pashu Aahar (Cattle Feed) & Dairy Products Khata
 */

export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return '₹0.00';
  const num = typeof amount === 'number' ? amount : parseFloat(amount);
  if (isNaN(num)) return '₹0.00';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
};

export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    if (dateString instanceof Date) {
      return new Intl.DateTimeFormat('en-IN', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }).format(dateString);
    }
    const str = String(dateString).trim();
    const datePart = str.includes('T') ? str.split('T')[0] : str;
    const parts = datePart.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10);
      const day = parseInt(parts[2], 10);
      if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
        const date = new Date(year, month - 1, day);
        return new Intl.DateTimeFormat('en-IN', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }).format(date);
      }
    }
    const parsed = new Date(str);
    if (!isNaN(parsed.getTime())) {
      return new Intl.DateTimeFormat('en-IN', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }).format(parsed);
    }
    return str;
  } catch (e) {
    return String(dateString);
  }
};

export const formatPercentage = (percent) => {
  if (percent === null || percent === undefined) return '0.0%';
  const num = typeof percent === 'number' ? percent : parseFloat(percent);
  return `${num.toFixed(1)}%`;
};

export const CATEGORY_COLORS = {
  // --- Cattle Feed Products ---
  'Cattle Feed Pellets (Pashu Aahar)': { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200', hex: '#d97706' },
  'Oil Cakes & Khal (Sarson / Binola)': { bg: 'bg-yellow-50', text: 'text-yellow-800', border: 'border-yellow-200', hex: '#ca8a04' },
  'Bran & Churi (Wheat Bran / Churi)': { bg: 'bg-orange-50', text: 'text-orange-800', border: 'border-orange-200', hex: '#ea580c' },
  'Mineral Mixture & Supplements': { bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-200', hex: '#059669' },
  'Fodder & Silage (Bhoosa / Chara)': { bg: 'bg-lime-50', text: 'text-lime-800', border: 'border-lime-200', hex: '#65a30d' },

  // --- Dairy Products ---
  'Fresh Milk (Cow / Buffalo)': { bg: 'bg-sky-50', text: 'text-sky-800', border: 'border-sky-200', hex: '#0284c7' },
  'Desi Ghee & Butter (Makhan)': { bg: 'bg-amber-100', text: 'text-amber-900', border: 'border-amber-300', hex: '#b45309' },
  'Paneer & Khoya (Mawa)': { bg: 'bg-indigo-50', text: 'text-indigo-800', border: 'border-indigo-200', hex: '#4f46e5' },
  'Curd & Chaas (Dahi / Lassi)': { bg: 'bg-cyan-50', text: 'text-cyan-800', border: 'border-cyan-200', hex: '#0891b2' },
  'Other Feed & Dairy Supplies': { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200', hex: '#64748b' },

  // --- Fallbacks for legacy/existing records ---
  'Food': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', hex: '#f59e0b' },
  'Shopping': { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200', hex: '#4f46e5' },
  'Grains & Pulses': { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200', hex: '#d97706' },
  'Other': { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200', hex: '#64748b' },
};

export const getCategoryBadgeStyle = (category) => {
  if (!category) return CATEGORY_COLORS.Other;
  const match = Object.keys(CATEGORY_COLORS).find(
    (key) => key.toLowerCase() === category.trim().toLowerCase()
  );
  return match ? CATEGORY_COLORS[match] : CATEGORY_COLORS.Other;
};

export const PAYMENT_MODES = [
  'Cash',
  'UPI (PhonePe / GPay / Paytm)',
  'Credit / Udhaar (Khata)',
  'Bank Transfer / IMPS',
  'Cheque',
  'Other',
];

export const CATEGORIES_LIST = [
  'Cattle Feed Pellets (Pashu Aahar)',
  'Oil Cakes & Khal (Sarson / Binola)',
  'Bran & Churi (Wheat Bran / Churi)',
  'Mineral Mixture & Supplements',
  'Fodder & Silage (Bhoosa / Chara)',
  'Fresh Milk (Cow / Buffalo)',
  'Desi Ghee & Butter (Makhan)',
  'Paneer & Khoya (Mawa)',
  'Curd & Chaas (Dahi / Lassi)',
  'Other Feed & Dairy Supplies',
];

/**
 * Common quick-fill products for quick entry in Pashu Aahar & Dairy shops
 */
export const QUICK_FEED_DAIRY_PRODUCTS = [
  { name: '50kg Cattle Feed (Pashu Aahar Bag)', category: 'Cattle Feed Pellets (Pashu Aahar)', defaultPrice: 1550 },
  { name: 'Sarson Khal 50kg (Mustard Cake)', category: 'Oil Cakes & Khal (Sarson / Binola)', defaultPrice: 1800 },
  { name: 'Binola Khal 50kg (Cottonseed)', category: 'Oil Cakes & Khal (Sarson / Binola)', defaultPrice: 1950 },
  { name: 'Wheat Bran 35kg (Gehun Choker)', category: 'Bran & Churi (Wheat Bran / Churi)', defaultPrice: 950 },
  { name: 'Chana Churi 50kg Bag', category: 'Bran & Churi (Wheat Bran / Churi)', defaultPrice: 1600 },
  { name: 'Mineral Mixture 5kg Pouch', category: 'Mineral Mixture & Supplements', defaultPrice: 650 },
  { name: 'Calcium Tonic (5 Litre Can)', category: 'Mineral Mixture & Supplements', defaultPrice: 850 },
  { name: 'Fresh Buffalo Milk (Per Litre)', category: 'Fresh Milk (Cow / Buffalo)', defaultPrice: 70 },
  { name: 'Fresh Cow Milk (Per Litre)', category: 'Fresh Milk (Cow / Buffalo)', defaultPrice: 55 },
  { name: 'Pure Desi Ghee 1kg Tin', category: 'Desi Ghee & Butter (Makhan)', defaultPrice: 650 },
  { name: 'Fresh Paneer (1 kg)', category: 'Paneer & Khoya (Mawa)', defaultPrice: 380 },
  { name: 'Fresh Dahi / Curd (1 kg)', category: 'Curd & Chaas (Dahi / Lassi)', defaultPrice: 80 },
];

