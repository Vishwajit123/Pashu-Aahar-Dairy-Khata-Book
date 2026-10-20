import React from 'react';

export const StatCardSkeleton = () => (
  <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-card animate-pulse">
    <div className="flex items-center justify-between">
      <div className="space-y-2 flex-1 mr-4">
        <div className="h-3.5 bg-slate-200 rounded w-24" />
        <div className="h-7 bg-slate-200 rounded w-32" />
      </div>
      <div className="w-12 h-12 rounded-2xl bg-slate-200 shrink-0" />
    </div>
  </div>
);

export const ChartSkeleton = () => (
  <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-card animate-pulse space-y-4">
    <div className="flex justify-between items-center">
      <div className="h-4 bg-slate-200 rounded w-40" />
      <div className="h-4 bg-slate-200 rounded w-16" />
    </div>
    <div className="h-64 bg-slate-100 rounded-xl" />
  </div>
);

export const TableSkeleton = ({ rows = 5 }) => (
  <div className="bg-white rounded-2xl border border-slate-200/80 shadow-card overflow-hidden animate-pulse">
    <div className="p-4 border-b border-slate-100 flex justify-between">
      <div className="h-4 bg-slate-200 rounded w-32" />
      <div className="h-4 bg-slate-200 rounded w-20" />
    </div>
    <div className="divide-y divide-slate-100">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="p-4 flex items-center justify-between space-x-4">
          <div className="h-4 bg-slate-200 rounded w-16" />
          <div className="h-4 bg-slate-200 rounded w-32" />
          <div className="h-4 bg-slate-200 rounded w-24" />
          <div className="h-4 bg-slate-200 rounded w-20" />
          <div className="h-4 bg-slate-200 rounded w-16" />
        </div>
      ))}
    </div>
  </div>
);
