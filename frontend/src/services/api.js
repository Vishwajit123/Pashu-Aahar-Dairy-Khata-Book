import axios from 'axios';
import { supabase } from './supabaseClient';

// In Vite development, use '/api' to leverage Vite's dev proxy (eliminates CORS and IPv4/IPv6 localhost issues)
const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (typeof window !== 'undefined' && window.location.port === '5173'
    ? '/api'
    : 'http://localhost:8080/api');

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 12000,
});

// Automatically attach Supabase JWT token and User ID to every request if user is logged in
apiClient.interceptors.request.use(async (config) => {
  try {
    const { data } = await supabase.auth.getSession();
    const session = data?.session;
    if (session?.access_token) {
      config.headers.Authorization = `Bearer ${session.access_token}`;
    }
    if (session?.user?.id) {
      config.headers['X-User-Id'] = session.user.id;
      if (session.user.email) {
        config.headers['X-User-Email'] = session.user.email;
      }
    } else {
      const isGuest = sessionStorage.getItem('pashu_guest_mode') === 'true';
      if (isGuest) {
        config.headers['X-User-Id'] = 'guest';
      }
    }
  } catch (err) {
    // Proceed without token if auth not initialized
  }
  return config;
});

// Auto-retry interceptor for transient startup / connection errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;
    const isStartupOrNetworkError =
      !error.response ||
      error.message === 'Network Error' ||
      error.code === 'ECONNABORTED' ||
      error.response?.status === 502 ||
      error.response?.status === 503 ||
      error.response?.data?.error === 'BACKEND_NOT_READY';

    // Auto-retry idempotent GET requests up to 3 times while Spring Boot boots up
    if (config && isStartupOrNetworkError && config.method === 'get') {
      config.__retryCount = config.__retryCount || 0;
      const MAX_RETRIES = 3;
      if (config.__retryCount < MAX_RETRIES) {
        config.__retryCount += 1;
        const delay = config.__retryCount * 1500; // 1.5s, 3.0s, 4.5s
        await new Promise((res) => setTimeout(res, delay));
        return apiClient(config);
      }
    }

    let message = 'An unexpected error occurred. Please try again.';
    if (error.response?.data?.message) {
      message = error.response.data.message;
    } else if (error.response?.data?.validationErrors) {
      message = Object.values(error.response.data.validationErrors).join(', ');
    } else if (isStartupOrNetworkError) {
      message = 'Cannot connect to backend server. Ensure Spring Boot is running on port 8080.';
    }
    return Promise.reject(new Error(message));
  }
);

export const expenseApi = {
  // Quick health probe to verify if Spring Boot on 8080 is live
  checkHealth: async () => {
    try {
      await apiClient.get('/reports/summary', { timeout: 4000 });
      return true;
    } catch {
      return false;
    }
  },

  // Expenses CRUD
  getExpenses: async (params = {}) => {
    const response = await apiClient.get('/expenses', { params });
    return response.data;
  },

  getExpenseById: async (id) => {
    const response = await apiClient.get(`/expenses/${id}`);
    return response.data;
  },

  createExpense: async (expenseData) => {
    const response = await apiClient.post('/expenses', expenseData);
    return response.data;
  },

  updateExpense: async (id, expenseData) => {
    const response = await apiClient.put(`/expenses/${id}`, expenseData);
    return response.data;
  },

  deleteExpense: async (id) => {
    await apiClient.delete(`/expenses/${id}`);
    return true;
  },

  updatePaymentStatus: async (id, status = 'PAID', paidAmount = null) => {
    const params = { status };
    if (paidAmount !== null && paidAmount !== undefined) {
      params.paidAmount = paidAmount;
    }
    const response = await apiClient.patch(`/expenses/${id}/status`, null, { params });
    return response.data;
  },

  recordExpensePayment: async (id, paymentData) => {
    const response = await apiClient.post(`/expenses/${id}/payments`, paymentData);
    return response.data;
  },

  recordCustomerPayment: async (customerId, paymentData) => {
    const response = await apiClient.post(`/customers/${customerId}/payments`, paymentData);
    return response.data;
  },

  getCustomerPayments: async (customerId) => {
    const response = await apiClient.get(`/customers/${customerId}/payments`);
    return response.data;
  },

  getAllCustomerPayments: async () => {
    const response = await apiClient.get('/customers/payments');
    return response.data;
  },

  // Customer & Khata API
  getCustomers: async () => {
    const response = await apiClient.get('/customers');
    return response.data;
  },

  getCustomerById: async (id) => {
    const response = await apiClient.get(`/customers/${id}`);
    return response.data;
  },

  createCustomer: async (customerData) => {
    const response = await apiClient.post('/customers', customerData);
    return response.data;
  },

  updateCustomer: async (id, customerData) => {
    const response = await apiClient.put(`/customers/${id}`, customerData);
    return response.data;
  },

  deleteCustomer: async (id) => {
    await apiClient.delete(`/customers/${id}`);
    return true;
  },

  getCustomerTransactions: async (id) => {
    const response = await apiClient.get(`/customers/${id}/transactions`);
    return response.data;
  },

  searchExpenses: async (query) => {
    const response = await apiClient.get('/expenses/search', { params: { q: query } });
    return response.data;
  },

  getByCategory: async (category) => {
    const response = await apiClient.get('/expenses/category', { params: { category } });
    return response.data;
  },

  getByDate: async (date) => {
    const response = await apiClient.get(`/expenses/date/${date}`);
    return response.data;
  },

  getByPaymentMode: async (mode) => {
    const response = await apiClient.get('/expenses/payment-mode', { params: { mode } });
    return response.data;
  },

  // Reports & Analytics
  getSummary: async () => {
    const response = await apiClient.get('/reports/summary');
    return response.data;
  },

  getCategorySummary: async () => {
    const response = await apiClient.get('/reports/category');
    return response.data;
  },

  getMonthlySummary: async (yearMonth) => {
    const response = await apiClient.get('/reports/monthly', { params: { yearMonth } });
    return response.data;
  },

  getMonthlyTrend: async () => {
    const response = await apiClient.get('/reports/monthly-trend');
    return response.data;
  },

  getPaymentModeSummary: async () => {
    const response = await apiClient.get('/reports/payment-mode');
    return response.data;
  },

  getHighestExpense: async () => {
    const response = await apiClient.get('/reports/highest');
    return response.data;
  },

  getLowestExpense: async () => {
    const response = await apiClient.get('/reports/lowest');
    return response.data;
  },

  exportCsv: async () => {
    const response = await apiClient.get('/reports/export-csv', {
      responseType: 'blob',
    });
    const blob = new Blob([response.data], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `expenses-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};

export default apiClient;
