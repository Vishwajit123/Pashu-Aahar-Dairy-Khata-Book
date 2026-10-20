import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { MainLayout } from './layouts/MainLayout';
import { Dashboard } from './pages/Dashboard';
import { AllExpenses } from './pages/AllExpenses';
import { AddExpense } from './pages/AddExpense';
import { EditExpense } from './pages/EditExpense';
import { Customers } from './pages/Customers';
import { CustomerDetail } from './pages/CustomerDetail';
import { Categories } from './pages/Categories';
import { Reports } from './pages/Reports';
import { Settings } from './pages/Settings';
import { Login } from './pages/Login';
import { NotFound } from './pages/NotFound';

export const App = () => {
  return (
    <ToastProvider>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public Auth Route */}
            <Route path="/login" element={<Login />} />

            {/* Protected Application Routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="customers" element={<Customers />} />
              <Route path="customers/:id" element={<CustomerDetail />} />
              <Route path="expenses" element={<AllExpenses />} />
              <Route path="add-expense" element={<AddExpense />} />
              <Route path="edit-expense/:id" element={<EditExpense />} />
              <Route path="categories" element={<Categories />} />
              <Route path="reports" element={<Reports />} />
              <Route path="settings" element={<Settings />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </ToastProvider>
  );
};

export default App;
