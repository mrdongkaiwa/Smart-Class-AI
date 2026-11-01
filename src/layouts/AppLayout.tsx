import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from '../components/common/Header';
import { Sidebar } from '../components/common/Sidebar';

export const AppLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-[#020f1c] text-slate-100 selection:bg-cyan-500 selection:text-black">
      <Header onToggleSidebar={() => setSidebarOpen(prev => !prev)} isDark={true} />
      <div className="flex flex-1">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} isDark={true} />
        <main className="flex-1 md:pl-64 min-w-0 bg-[#020f1c] text-slate-100">
          <div className="p-3 sm:p-5 lg:p-6 max-w-[1550px] mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
