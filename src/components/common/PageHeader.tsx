import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ChevronRight } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  breadcrumbItems?: BreadcrumbItem[];
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  action,
  breadcrumbItems,
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 pb-1">
      <div className="flex items-center gap-1.5 flex-wrap min-w-0">
        <nav className="flex items-center space-x-1.5 text-xs text-slate-300 font-bold shrink-0" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-cyan-400 transition-colors flex items-center gap-1" title="Trang chủ">
            <Home className="w-3.5 h-3.5 text-cyan-400" />
          </Link>
          {breadcrumbItems && breadcrumbItems.map((item, idx) => (
            <React.Fragment key={idx}>
              <ChevronRight className="w-3.5 h-3.5 text-[#0e3d54] shrink-0" />
              {item.href ? (
                <Link to={item.href} className="hover:text-cyan-400 transition-colors">
                  {item.label}
                </Link>
              ) : (
                <span className="text-slate-300 font-bold">{item.label}</span>
              )}
            </React.Fragment>
          ))}
          <span className="text-slate-600 font-bold mx-0.5">•</span>
        </nav>

        <span className="text-xs font-bold tracking-tight text-slate-300 truncate">
          {title}
        </span>

        {subtitle && (
          <span className="text-xs text-slate-400 hidden xl:inline font-normal">
            ({subtitle})
          </span>
        )}
      </div>

      {action && <div className="flex items-center gap-2 shrink-0">{action}</div>}
    </div>
  );
};
