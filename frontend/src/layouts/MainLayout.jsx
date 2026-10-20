import React, { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { Navbar } from '../components/Navbar';
import { ShieldCheck, Phone, Keyboard, HelpCircle } from 'lucide-react';

export const MainLayout = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-100/70 flex relative overflow-x-hidden text-slate-800">
      {/* Sidebar Navigation */}
      <Sidebar
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />

      {/* Main content wrapper */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out
          ${isCollapsed ? 'lg:pl-20' : 'lg:pl-64'}
        `}
      >
        <Navbar setIsMobileOpen={setIsMobileOpen} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>

        {/* Clean Business Application Footer */}
        <footer className="border-t border-slate-200 bg-white/90 px-4 sm:px-8 py-3 text-xs text-slate-500 flex flex-col md:flex-row items-center justify-between gap-2.5">
          <div className="flex items-center space-x-2 text-[11px]">
            <span className="font-bold text-slate-700">पशु आहार एवं डेयरी व्यापार (Pashu Aahar Vyapar)</span>
            <span>•</span>
            <span>v2.4.2</span>
            <span>•</span>
            <span className="text-emerald-700 font-semibold flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Multi-Tenant Cloud Ledger</span>
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[11px] text-slate-500">
            <span className="hidden sm:inline">
              Shortcuts: <kbd className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 font-mono text-[10px]">N</kbd> New Sale • <kbd className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 font-mono text-[10px]">K</kbd> Khata Book
            </span>
            <span>•</span>
            <span>Helpline: +91 98000 12345</span>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default MainLayout;
