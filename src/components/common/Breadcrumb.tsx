import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ items }) => {
  return (
    <nav className="flex items-center space-x-1.5 text-xs text-slate-400 mb-3" aria-label="Breadcrumb">
      <Link to="/" className="hover:text-cyan-400 transition-colors flex items-center gap-1">
        <Home className="w-3.5 h-3.5 text-cyan-400" />
      </Link>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <React.Fragment key={index}>
            <ChevronRight className="w-3.5 h-3.5 text-[#0e3d54] shrink-0" />
            {isLast || !item.href ? (
              <span className="font-semibold text-white truncate max-w-[200px]">{item.label}</span>
            ) : (
              <Link to={item.href} className="hover:text-cyan-400 transition-colors truncate max-w-[150px]">
                {item.label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};
