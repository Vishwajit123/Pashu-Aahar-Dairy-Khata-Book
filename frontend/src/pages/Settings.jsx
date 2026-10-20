import React, { useState } from 'react';
import {
  Store,
  Receipt,
  HardDrive,
  Server,
  ShieldCheck,
  CheckCircle,
  RefreshCw,
  Download,
  Phone,
  MapPin,
  FileText,
  Clock,
  Printer
} from 'lucide-react';
import { expenseApi } from '../services/api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

export const Settings = () => {
  const toast = useToast();
  const { user, isGuest } = useAuth();
  const [checkingApi, setCheckingApi] = useState(false);
  const [apiStatus, setApiStatus] = useState('Online (Port 8080)');
  const [exporting, setExporting] = useState(false);

  // Business Profile Form state
  const [shopName, setShopName] = useState(
    user?.user_metadata?.full_name || 'Kisan Pashu Aahar & Dairy Vyapar'
  );
  const [ownerPhone, setOwnerPhone] = useState('9812345678');
  const [mandiAddress, setMandiAddress] = useState('Shop No. 14, Main Krishi Mandi & Dairy Complex');
  const [defaultPaymentMode, setDefaultPaymentMode] = useState('Cash');
  const [printFormat, setPrintFormat] = useState('thermal');
  const [invoiceNote, setInvoiceNote] = useState('धन्यवाद! फिर पधारें • शुद्ध पशुआहार व ताजा दूध विक्रेता');

  const testConnection = async () => {
    setCheckingApi(true);
    try {
      await expenseApi.getSummary();
      setApiStatus('Online (Port 8080) - Connected');
      toast.success('Spring Boot REST API is connected and responding normally.');
    } catch (err) {
      setApiStatus('Error: Cannot reach backend');
      toast.error('Connection test failed: ' + err.message);
    } finally {
      setCheckingApi(false);
    }
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    toast.success('Store profile and invoice preferences saved successfully.');
  };

  const handleExportData = async () => {
    setExporting(true);
    try {
      await expenseApi.exportCsv();
      toast.success('Day-book transactions exported to CSV.');
    } catch (err) {
      toast.error('Failed to export CSV: ' + err.message);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200 pb-12">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Business Profile & Store Settings (दुकान विवरण व सेटिंग्स)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your shop details, billing preferences, receipt layout, and database connectivity.
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs text-slate-500 font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>{isGuest ? 'Offline Demo Ledger' : 'Multi-Tenant Cloud Sync'}</span>
        </div>
      </div>

      {/* Store Profile Settings Card */}
      <form onSubmit={handleSaveProfile} className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm space-y-5">
        <div className="flex items-center space-x-3 pb-3 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800">Shop & Business Details (दुकान की जानकारी)</h3>
            <p className="text-xs text-slate-400">Printed on customer receipts and khata statements</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Shop / Vyapar Name (दुकान का नाम)
            </label>
            <input
              type="text"
              value={shopName}
              onChange={(e) => setShopName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none text-slate-800 font-medium"
              placeholder="e.g. Kisan Pashu Aahar & Dairy Farm"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Contact / WhatsApp Phone (मोबाइल नंबर)
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={ownerPhone}
                onChange={(e) => setOwnerPhone(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none text-slate-800 font-medium"
                placeholder="e.g. 9812345678"
              />
            </div>
          </div>

          <div className="sm:col-span-2">
            <label className="block font-semibold text-slate-700 mb-1">
              Mandi / Shop Address (दुकान का पता)
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <textarea
                rows={2}
                value={mandiAddress}
                onChange={(e) => setMandiAddress(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none text-slate-800 font-medium"
                placeholder="e.g. Main Road, Near Milk Chilling Centre"
              />
            </div>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors shadow-sm"
          >
            Save Shop Profile
          </button>
        </div>
      </form>

      {/* Invoice & Receipt Preferences Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm space-y-5">
        <div className="flex items-center space-x-3 pb-3 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
            <Receipt className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800">Billing & Receipt Preferences (बिल सेटिंग्स)</h3>
            <p className="text-xs text-slate-400">Default options applied when creating sales and bills</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Default Payment Method (डिफ़ॉल्ट भुगतान)
            </label>
            <select
              value={defaultPaymentMode}
              onChange={(e) => setDefaultPaymentMode(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none text-slate-800 font-medium bg-white"
            >
              <option value="Cash">Cash (नकद)</option>
              <option value="UPI (PhonePe / GPay / Paytm)">UPI (PhonePe / GPay / Paytm)</option>
              <option value="Credit / Udhaar (Khata)">Credit / Udhaar (खाता उधारी)</option>
              <option value="Bank Transfer / IMPS">Bank Transfer / IMPS</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Bill Print Format (प्रिंट फॉर्मेट)
            </label>
            <select
              value={printFormat}
              onChange={(e) => setPrintFormat(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none text-slate-800 font-medium bg-white"
            >
              <option value="thermal">3-Inch Thermal Receipt (80mm POS)</option>
              <option value="a4">Standard A4 / Half-Page Bill</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="block font-semibold text-slate-700 mb-1">
              Invoice Footer Note (बिल फुटर संदेश)
            </label>
            <input
              type="text"
              value={invoiceNote}
              onChange={(e) => setInvoiceNote(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none text-slate-800 font-medium"
            />
          </div>
        </div>
      </div>

      {/* Data Management & Backend Diagnostics */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-wrap gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">Data Management & Server Diagnostics</h3>
              <p className="text-xs text-slate-400">Database connection health, backups, and exports</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={testConnection}
              disabled={checkingApi}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${checkingApi ? 'animate-spin' : ''}`} />
              <span>Test Server</span>
            </button>

            <button
              onClick={handleExportData}
              disabled={exporting}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors disabled:opacity-50"
            >
              <Download className={`w-3.5 h-3.5 ${exporting ? 'animate-bounce' : ''}`} />
              <span>Export All to CSV</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60">
            <span className="text-slate-500 font-medium block">Server REST API</span>
            <span className="font-bold text-slate-800 text-sm mt-0.5 block">{apiStatus}</span>
            <p className="text-slate-400 text-[11px] mt-1 font-mono">http://localhost:8080/api</p>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60">
            <span className="text-slate-500 font-medium block">Storage Engine</span>
            <span className="font-bold text-emerald-700 text-sm mt-0.5 block">PostgreSQL Cloud DB</span>
            <p className="text-slate-400 text-[11px] mt-1">Multi-tenant isolated tables</p>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60">
            <span className="text-slate-500 font-medium block">Software Version</span>
            <span className="font-bold text-slate-800 text-sm mt-0.5 block">v2.4.2 (Stable Release)</span>
            <p className="text-slate-400 text-[11px] mt-1">FY 2026-27 Day-Book Ready</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
