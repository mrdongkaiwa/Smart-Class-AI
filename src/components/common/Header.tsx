import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Bell,
  Search,
  User,
  LogOut,
  Sparkles,
  ChevronDown,
  Layers,
  GraduationCap,
  Calendar,
  Command,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '../../types';

interface HeaderProps {
  onToggleSidebar?: () => void;
  isDark?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar, isDark = true }) => {
  const { currentUser, currentRole, switchRole, logout } = useAuth();
  const navigate = useNavigate();
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const roles: { role: UserRole; label: string; path: string; color: string }[] = [
    { role: 'TEACHER', label: 'Giáo viên', path: '/teacher/dashboard', color: 'bg-cyan-500' },
    { role: 'ADMIN', label: 'Quản trị viên (Admin)', path: '/admin/dashboard', color: 'bg-purple-500' },
    { role: 'STUDENT', label: 'Học sinh', path: '/student/dashboard', color: 'bg-emerald-500' },
    { role: 'PARENT', label: 'Phụ huynh', path: '/parent/dashboard', color: 'bg-amber-500' },
  ];

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md h-16 flex items-center justify-between px-4 sm:px-6 shadow-sm transition-all bg-[#020e1a]/95 border-b border-[#0e3d54] text-white">
      {/* Zone 1: Brand & Toggle */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 -ml-2 rounded-xl md:hidden transition-colors text-slate-400 hover:text-white hover:bg-[#061d33]"
          aria-label="Mở menu"
        >
          <Layers className="w-5 h-5 text-cyan-400" />
        </button>

        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-sky-400 flex items-center justify-center text-white shadow-md shadow-cyan-950 group-hover:scale-105 transition-transform">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm sm:text-base font-extrabold tracking-tight bg-gradient-to-r from-cyan-300 via-sky-300 to-blue-400 bg-clip-text text-transparent">
              THCS LÊ QUÝ ĐÔN
            </span>
            <span className="text-[10px] font-semibold text-cyan-500 uppercase tracking-wider">
              Lớp Học Thông Minh 4.0
            </span>
          </div>
        </Link>
      </div>

      {/* Zone 2: Semester Badge & Search bar (Desktop) */}
      <div className="hidden md:flex items-center gap-4 flex-1 max-w-xl mx-6">
        {/* Semester / Year Pill */}
        <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#041527] border border-[#0e3d54] text-xs font-medium text-slate-200 shrink-0">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-slate-300">Năm học 2024 - 2025</span>
          <span className="text-slate-600">•</span>
          <span className="text-cyan-400 font-semibold">Học kỳ II</span>
        </div>

        {/* Global Search */}
        <div className="relative w-full">
          <Search className="w-4 h-4 text-cyan-500/70 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm kiếm môn học, học sinh, lớp, thời khóa biểu..."
            className="w-full bg-[#03172c] hover:bg-[#041d38] border border-[#0e3d54] rounded-xl pl-9 pr-12 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-400 transition-all"
          />
          <div className="hidden sm:flex items-center gap-0.5 absolute right-2.5 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded bg-[#061d33] border border-[#0e3d54] text-[10px] font-mono text-cyan-400">
            <Command className="w-2.5 h-2.5" />
            <span>K</span>
          </div>
        </div>
      </div>

      {/* Zone 3: Quick actions, notifications, role switcher, profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Fast Role Switcher */}
        <div className="relative">
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[#0e3d54] bg-[#041527] hover:bg-[#061f38] text-xs font-semibold text-slate-200 shadow-2xs transition-all cursor-pointer"
            title="Đổi vai trò người dùng"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="hidden sm:inline text-slate-400 font-normal">Vai trò:</span>
            <span className="text-cyan-300 font-bold">{currentRole}</span>
            <ChevronDown className="w-3.5 h-3.5 text-cyan-400 ml-0.5" />
          </button>

          {showRoleMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-[#041628] rounded-2xl border border-[#0e3d54] shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95">
              <div className="px-3.5 py-1 text-[11px] font-bold text-cyan-400 uppercase tracking-wider">
                Chuyển đổi vai trò trải nghiệm
              </div>
              <div className="mt-1 space-y-0.5">
                {roles.map(r => (
                  <button
                    key={r.role}
                    onClick={() => {
                      switchRole(r.role);
                      setShowRoleMenu(false);
                      navigate(r.path);
                    }}
                    className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between transition-colors ${
                      currentRole === r.role
                        ? 'bg-cyan-950/80 text-cyan-300 font-bold border-l-2 border-cyan-400'
                        : 'text-slate-300 hover:bg-[#062038] hover:text-white font-medium'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${r.color}`} />
                      <span>{r.label}</span>
                    </div>
                    {currentRole === r.role && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Quick Action (for Teachers) */}
        {currentRole === 'TEACHER' && (
          <button
            onClick={() => navigate('/teacher/schedule')}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-[#0284c7] hover:bg-[#0369a1] text-white rounded-xl text-xs font-semibold shadow-xs shadow-cyan-900/30 transition-all cursor-pointer border border-cyan-600/40"
          >
            <Calendar className="w-3.5 h-3.5 text-cyan-200" />
            <span>Thời khóa biểu</span>
          </button>
        )}

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 text-slate-300 hover:text-white hover:bg-[#061d33] rounded-xl relative transition-colors cursor-pointer border border-transparent hover:border-[#0e3d54]"
            aria-label="Thông báo"
          >
            <Bell className="w-4 h-4 text-cyan-400" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-[#020e1a]" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-[#041628] rounded-2xl border border-[#0e3d54] shadow-2xl p-3.5 z-50 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-2 border-b border-[#0e3d54] mb-2">
                <span className="text-xs font-bold text-white">Thông báo mới</span>
                <span className="text-[11px] text-cyan-400 font-semibold hover:underline cursor-pointer">Đã đọc tất cả</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="p-2.5 bg-[#03172c] border border-[#0e3d54] rounded-xl hover:bg-[#06203a] transition-colors">
                  <div className="font-semibold text-slate-200">Lịch thi Giữa kỳ 2</div>
                  <div className="text-slate-400 text-[11px] mt-0.5">Bắt đầu từ ngày 15/03/2025 cho toàn khối 10.</div>
                </div>
                <div className="p-2.5 bg-[#03172c] border border-[#0e3d54] rounded-xl hover:bg-[#06203a] transition-colors">
                  <div className="font-semibold text-slate-200">Cập nhật Thời khóa biểu mới</div>
                  <div className="text-slate-400 text-[11px] mt-0.5">Thời khóa biểu Tuần 24 đã được phê duyệt.</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Profile */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-1 rounded-xl hover:bg-[#061d33] border border-transparent hover:border-[#0e3d54] transition-colors cursor-pointer"
          >
            <img
              src={currentUser?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
              alt={currentUser?.fullName || 'Avatar'}
              className="w-8 h-8 rounded-full object-cover ring-2 ring-cyan-500/40"
            />
            <span className="hidden lg:inline text-xs font-bold text-slate-200 max-w-[120px] truncate">
              {currentUser?.fullName}
            </span>
            <ChevronDown className="hidden lg:inline w-3 h-3 text-cyan-400" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-[#041628] rounded-2xl border border-[#0e3d54] shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95">
              <div className="px-4 py-2.5 border-b border-[#0e3d54]">
                <div className="text-xs font-bold text-white truncate">{currentUser?.fullName}</div>
                <div className="text-[11px] text-slate-400 truncate">{currentUser?.email}</div>
                <div className="text-[10px] text-cyan-400 font-bold mt-1 uppercase tracking-wider">
                  {currentUser?.role}
                </div>
              </div>

              <div className="py-1">
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    navigate(`/${currentRole.toLowerCase()}/profile`);
                  }}
                  className="w-full text-left px-4 py-2 text-xs text-slate-300 hover:bg-[#06203a] hover:text-white flex items-center gap-2.5"
                >
                  <User className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Hồ sơ cá nhân</span>
                </button>
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    navigate('/teacher/schedule');
                  }}
                  className="w-full text-left px-4 py-2 text-xs text-slate-300 hover:bg-[#06203a] hover:text-white flex items-center gap-2.5"
                >
                  <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Thời khóa biểu</span>
                </button>
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    navigate('/teacher/ai');
                  }}
                  className="w-full text-left px-4 py-2 text-xs text-slate-300 hover:bg-[#06203a] hover:text-white flex items-center gap-2.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
                  <span>Trợ lý AI SmartClass</span>
                </button>
              </div>

              <div className="border-t border-[#0e3d54] pt-1">
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    logout();
                    navigate('/login');
                  }}
                  className="w-full text-left px-4 py-2 text-xs text-rose-400 hover:bg-rose-950/40 flex items-center gap-2.5 font-semibold"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Đăng xuất</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
