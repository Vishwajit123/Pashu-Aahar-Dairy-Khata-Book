import React from 'react';

export const StatCard = ({ title, value, icon: Icon, color = 'emerald', subtitle, badge, trend }) => {
  const colorMap = {
    emerald: {
      bg: 'bg-emerald-500/10',
      text: 'text-emerald-600',
      border: 'border-emerald-500/20',
      accent: 'from-emerald-500 to-teal-500',
      pill: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    },
    teal: {
      bg: 'bg-teal-500/10',
      text: 'text-teal-600',
      border: 'border-teal-500/20',
      accent: 'from-teal-500 to-cyan-500',
      pill: 'bg-teal-50 text-teal-700 border-teal-200/80',
    },
    amber: {
      bg: 'bg-amber-500/10',
      text: 'text-amber-600',
      border: 'border-amber-500/20',
      accent: 'from-amber-500 to-orange-500',
      pill: 'bg-amber-50 text-amber-800 border-amber-200/80',
    },
    rose: {
      bg: 'bg-rose-500/10',
      text: 'text-rose-600',
      border: 'border-rose-500/20',
      accent: 'from-rose-500 to-red-500',
      pill: 'bg-rose-50 text-rose-700 border-rose-200/80',
    },
    blue: {
      bg: 'bg-sky-500/10',
      text: 'text-sky-600',
      border: 'border-sky-500/20',
      accent: 'from-sky-500 to-blue-500',
      pill: 'bg-sky-50 text-sky-700 border-sky-200/80',
    },
    purple: {
      bg: 'bg-indigo-500/10',
      text: 'text-indigo-600',
      border: 'border-indigo-500/20',
      accent: 'from-indigo-500 to-purple-500',
      pill: 'bg-indigo-50 text-indigo-700 border-indigo-200/80',
    },
  };

  const scheme = colorMap[color] || colorMap.emerald;

  return (
    <div className="relative bg-white/95 backdrop-blur-md rounded-3xl p-6 border border-slate-200/80 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.05)] hover:shadow-[0_12px_30px_-4px_rgba(15,23,42,0.08)] hover:-translate-y-1 transition-all duration-300 group overflow-hidden">
      {/* Top subtle gradient accent line */}
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${scheme.accent} opacity-80 group-hover:opacity-100 transition-opacity`} />

      <div className="flex items-start justify-between">
        <div className="space-y-1 min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 truncate">
            {title}
          </p>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-none mt-1">
            {value}
          </h3>
          
          <div className="flex items-center space-x-2 pt-1.5 flex-wrap gap-y-1">
            {subtitle && (
              <span className="text-xs text-slate-500 font-medium">
                {subtitle}
              </span>
            )}
            {badge && (
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${scheme.pill}`}>
                {badge}
              </span>
            )}
          </div>
        </div>

        <div className={`w-12 h-12 rounded-2xl ${scheme.bg} ${scheme.border} border flex items-center justify-center ${scheme.text} shadow-sm group-hover:scale-110 transition-transform duration-300 shrink-0 ml-3`}>
          <Icon className="w-6 h-6 stroke-[2]" />
        </div>
      </div>
    </div>
  );
};

export default StatCard;
