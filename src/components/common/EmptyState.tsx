import React from 'react';
import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = <Inbox className="w-10 h-10 text-cyan-500/50" />,
  title,
  description,
  action,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center bg-[#041527] rounded-2xl border border-dashed border-[#0e3d54]">
      <div className="mb-3">{icon}</div>
      <h3 className="text-base font-semibold text-white">{title}</h3>
      <p className="text-sm text-slate-400 max-w-sm mt-1 mb-4 leading-relaxed">
        {description}
      </p>
      {action}
    </div>
  );
};
