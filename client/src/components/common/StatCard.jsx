import React from 'react';

export const StatCard = ({ title, value, icon: Icon, color = 'brand', trend, subtitle, onClick, isActive }) => {
  const colorStyles = {
    brand: 'text-brand-400 bg-brand-500/10 border-brand-500/20',
    emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    amber: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    purple: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    rose: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
    blue: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  };

  const style = colorStyles[color] || colorStyles.brand;

  return (
    <div
      onClick={onClick}
      className={`glass-card rounded-2xl p-6 relative overflow-hidden transition-all duration-300 ${
        onClick ? 'cursor-pointer hover:scale-[1.03] hover:border-brand-500/40 active:scale-[0.98]' : 'hover:scale-[1.01]'
      } ${isActive ? 'ring-2 ring-brand-500 border-brand-500/50 bg-slate-900/90 shadow-xl shadow-brand-500/10' : ''}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">{title}</p>
          <h3 className="text-3xl font-extrabold text-white tracking-tight">{value}</h3>
          {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3.5 rounded-2xl border ${style} shrink-0`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
      {trend && (
        <div className="mt-4 flex items-center text-xs font-medium text-slate-400 pt-3 border-t border-slate-800/80">
          <span className="text-emerald-400 font-semibold mr-1">{trend}</span> vs previous period
        </div>
      )}
    </div>
  );
};
