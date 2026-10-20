/**
 * Persistent Product Catalog & Rate Manager for Feed & Dairy Products
 * Stored in localStorage so user manual additions, price updates, and deletions
 * persist seamlessly across sessions.
 */

const STORAGE_KEY = 'pashu_feed_dairy_products_v1';

export const INITIAL_PRODUCTS = [
  {
    id: 'prod-1',
    name: '50kg Cattle Feed (Pashu Aahar Bag)',
    category: 'Cattle Feed Pellets (Pashu Aahar)',
    defaultPrice: 1550,
    unit: 'Bag (50kg)',
  },
  {
    id: 'prod-2',
    name: 'Sarson Khal 50kg (Mustard Cake)',
    category: 'Oil Cakes & Khal (Sarson / Binola)',
    defaultPrice: 1800,
    unit: 'Bag (50kg)',
  },
  {
    id: 'prod-3',
    name: 'Binola Khal 50kg (Cottonseed)',
    category: 'Oil Cakes & Khal (Sarson / Binola)',
    defaultPrice: 1950,
    unit: 'Bag (50kg)',
  },
  {
    id: 'prod-4',
    name: 'Wheat Bran 35kg (Gehun Choker)',
    category: 'Bran & Churi (Wheat Bran / Churi)',
    defaultPrice: 950,
    unit: 'Bag (35kg)',
  },
  {
    id: 'prod-5',
    name: 'Chana Churi 50kg Bag',
    category: 'Bran & Churi (Wheat Bran / Churi)',
    defaultPrice: 1600,
    unit: 'Bag (50kg)',
  },
  {
    id: 'prod-6',
    name: 'Mineral Mixture 5kg Pouch',
    category: 'Mineral Mixture & Supplements',
    defaultPrice: 650,
    unit: 'Pouch (5kg)',
  },
  {
    id: 'prod-7',
    name: 'Calcium Tonic (5 Litre Can)',
    category: 'Mineral Mixture & Supplements',
    defaultPrice: 850,
    unit: 'Can (5L)',
  },
  {
    id: 'prod-8',
    name: 'Fresh Cow Milk (Per Litre)',
    category: 'Fresh Milk (Cow / Buffalo)',
    defaultPrice: 55,
    unit: 'Litre',
  },
  {
    id: 'prod-9',
    name: 'Fresh Buffalo Milk (Per Litre)',
    category: 'Fresh Milk (Cow / Buffalo)',
    defaultPrice: 70,
    unit: 'Litre',
  },
  {
    id: 'prod-10',
    name: 'Pure Desi Ghee (1kg Tin)',
    category: 'Desi Ghee & Butter (Makhan)',
    defaultPrice: 650,
    unit: 'Tin (1kg)',
  },
  {
    id: 'prod-11',
    name: 'Fresh Paneer (1 kg)',
    category: 'Paneer & Khoya (Mawa)',
    defaultPrice: 380,
    unit: 'Kg',
  },
  {
    id: 'prod-12',
    name: 'Curd / Fresh Dahi (1 kg)',
    category: 'Curd & Chaas (Dahi / Lassi)',
    defaultPrice: 80,
    unit: 'Kg',
  },
];

export const productStorage = {
  getProducts: () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to read products from localStorage:', e);
    }
    // Initialize with defaults if empty
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_PRODUCTS));
    return INITIAL_PRODUCTS;
  },

  saveProducts: (products) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
      window.dispatchEvent(new Event('products_updated'));
      return true;
    } catch (e) {
      console.error('Failed to save products to localStorage:', e);
      return false;
    }
  },

  addProduct: (productData) => {
    const products = productStorage.getProducts();
    const newProduct = {
      id: 'prod-' + Date.now(),
      name: productData.name.trim(),
      category: productData.category || 'Cattle Feed Pellets (Pashu Aahar)',
      defaultPrice: parseFloat(productData.defaultPrice) || 0,
      unit: productData.unit?.trim() || 'Unit',
    };
    const updated = [newProduct, ...products];
    productStorage.saveProducts(updated);
    return newProduct;
  },

  updateProduct: (id, productData) => {
    const products = productStorage.getProducts();
    const updated = products.map((p) => {
      if (p.id === id) {
        return {
          ...p,
          name: productData.name.trim(),
          category: productData.category || p.category,
          defaultPrice: parseFloat(productData.defaultPrice) || 0,
          unit: productData.unit?.trim() || p.unit,
        };
      }
      return p;
    });
    productStorage.saveProducts(updated);
    return true;
  },

  deleteProduct: (id) => {
    const products = productStorage.getProducts();
    const filtered = products.filter((p) => p.id !== id);
    productStorage.saveProducts(filtered);
    return true;
  },

  resetToDefaults: () => {
    productStorage.saveProducts(INITIAL_PRODUCTS);
    return INITIAL_PRODUCTS;
  },
};

export default productStorage;
