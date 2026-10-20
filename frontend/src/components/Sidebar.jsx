import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Receipt,
  PlusCircle,
  FolderTree,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Wheat,
  Milk,
  Users,
  X,
  LogOut
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { name: 'Dashboard (डैशबोर्ड)', path: '/', icon: LayoutDashboard },
  { name: 'Farmer & Khata (खाता)', path: '/customers', icon: Users, badge: 'Khata' },
  { name: 'Sales Day-Book (बिक्री)', path: '/expenses', icon: Receipt },
  { name: 'New Sale Bill (नया बिल)', path: '/add-expense', icon: PlusCircle, highlight: true },
  { name: 'Products & Rates (दर सूची)', path: '/categories', icon: FolderTree },
  { name: 'Reports & P&L (रिपोर्ट)', path: '/reports', icon: BarChart3 },
  { name: 'Store Settings (सेटिंग्स)', path: '/settings', icon: Settings },
];

export const Sidebar = ({ isCollapsed, setIsCollapsed, isMobileOpen, setIsMobileOpen }) => {
  const { user, signOut, isGuest } = useAuth();
  const userDisplayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || (isGuest ? 'Guest User' : 'Shop Owner');

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40 lg:hidden animate-in fade-in duration-200"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-white border-r border-slate-200 shadow-sm transition-all duration-300 ease-in-out
          ${isCollapsed ? 'w-20' : 'w-64'}
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Brand header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200">
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-sm shrink-0">
              <Wheat className="w-5 h-5 stroke-[2.2]" />
            </div>
            {!isCollapsed && (
              <div className="leading-tight">
                <span className="font-extrabold text-sm text-slate-800 block truncate">
                  Pashu Aahar & Dairy
                </span>
                <span className="block text-[10px] text-slate-500 font-bold tracking-wide">
                  BAHI-KHATA 2026-27
                </span>
              </div>
            )}
          </div>

          {/* Mobile close button */}
          <button
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation list */}
        <div className="flex-1 py-5 px-3 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                onClick={() => setIsMobileOpen(false)}
                className={({ isActive }) => `
                  flex items-center px-3.5 py-2.5 rounded-2xl font-semibold text-xs transition-all duration-200 group relative
                  ${isActive
                    ? 'bg-emerald-50 text-emerald-800 shadow-sm border border-emerald-200/60'
                    : 'text-slate-600 hover:bg-slate-100/70 hover:text-slate-900'}
                  ${isCollapsed ? 'justify-center' : 'justify-between'}
                `}
                title={isCollapsed ? item.name : undefined}
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center space-x-3 min-w-0">
                      <div className={`p-1.5 rounded-xl transition-colors ${
                        isActive 
                          ? 'bg-emerald-600 text-white shadow-sm' 
                          : 'text-slate-500 group-hover:text-emerald-600 group-hover:bg-emerald-50'
                      }`}>
                        <Icon className="w-4 h-4 shrink-0" />
                      </div>
                      {!isCollapsed && <span className="truncate">{item.name}</span>}
                    </div>

                    {!isCollapsed && item.badge && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-amber-100/80 text-amber-800 border border-amber-200/60">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* User Card in Footer */}
        {!isCollapsed ? (
          <div className="p-3 m-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
            <div className="flex items-center space-x-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                {userDisplayName.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 leading-tight">
                <p className="text-xs font-bold text-slate-800 truncate">{userDisplayName}</p>
                <p className="text-[10px] font-medium text-emerald-600 flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>{isGuest ? 'Local Ledger' : 'Cloud Sync'}</span>
                </p>
              </div>
            </div>
            <button
              onClick={() => signOut()}
              title="Sign Out"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="p-3 flex justify-center border-t border-slate-100">
            <button
              onClick={() => signOut()}
              title="Sign Out"
              className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Collapse toggle (Desktop only) */}
        <div className="p-2 border-t border-slate-100 hidden lg:block">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="w-full flex items-center justify-center p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100/70 transition-colors text-xs font-semibold"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : (
              <div className="flex items-center space-x-1.5 text-slate-500">
                <ChevronLeft className="w-4 h-4" />
                <span className="text-[11px]">Minimize</span>
              </div>
            )}
          </button>
        </div>
      </aside>
    </>
  );
};
