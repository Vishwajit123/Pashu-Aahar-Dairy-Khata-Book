import React from 'react';
import { Link } from 'react-router-dom';
import { Inbox, Plus } from 'lucide-react';

export const EmptyState = ({
  title = 'No Sales Records in Register (कोई रिकॉर्ड नहीं)',
  description = 'This register is currently empty. Record your first sale of cattle feed sacks, khal, or milk supply to start your day-book.',
  actionText = 'Create First Sale Bill [F2]',
  actionLink = '/add-expense',
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-2xl border border-slate-200/80 shadow-subtle">
      <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
        <Inbox className="w-8 h-8 stroke-[1.75]" />
      </div>
      <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
      <p className="text-sm text-slate-500 max-w-sm mt-1 mb-6 leading-relaxed">
        {description}
      </p>

      {actionLink ? (
        <Link
          to={actionLink}
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl font-medium text-sm bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm shadow-emerald-600/30 transition-all active:scale-[0.98]"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>{actionText}</span>
        </Link>
      ) : onAction ? (
        <button
          onClick={onAction}
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl font-medium text-sm bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm shadow-emerald-600/30 transition-all active:scale-[0.98]"
        >
          <span>{actionText}</span>
        </button>
      ) : null}
    </div>
  );
};
