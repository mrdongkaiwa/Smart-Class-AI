import React from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  icon?: React.ReactNode;
  trend?: {
    value: string;
    isPositive?: boolean;
  };
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  subtext,
  icon,
  trend,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={`bg-[#041527] rounded-2xl border border-[#0e3d54] p-4 sm:p-5 shadow-sm hover:border-cyan-400/80 hover:shadow-cyan-950/40 transition-all duration-200 ${
        onClick ? 'cursor-pointer group' : ''
      }`}
    >
      <div className="flex items-center justify-between gap-3 mb-3">
        <span className="text-xs font-semibold text-slate-400 truncate">{label}</span>
        {icon && (
          <div className="w-9 h-9 rounded-xl bg-[#061d33] border border-[#0e3d54] flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform text-cyan-400">
            {icon}
          </div>
        )}
      </div>

      <div className="flex items-baseline justify-between gap-2">
        <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white tabular-nums">
          {value}
        </span>
        {trend && (
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold ${
              trend.isPositive
                ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800'
                : 'bg-rose-950/80 text-rose-300 border border-rose-800'
            }`}
          >
            {trend.value}
          </span>
        )}
      </div>

      {subtext && (
        <div className="mt-2 text-xs text-slate-400 truncate font-medium">
          {subtext}
        </div>
      )}
    </div>
  );
};
