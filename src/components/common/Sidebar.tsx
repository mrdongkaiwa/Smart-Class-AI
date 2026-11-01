import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Calendar,
  ClipboardCheck,
  FileText,
  HelpCircle,
  FolderOpen,
  Sparkles,
  BarChart3,
  Award,
  AlertTriangle,
  Wrench,
  Bell,
  Settings,
  ShieldCheck,
  UserCheck,
  GraduationCap,
  History,
  MessageSquare,
  Compass,
  CheckSquare,
  Clock,
  Shuffle,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  isDark?: boolean;
}

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  badge?: string | number;
}

interface NavGroup {
  id?: string;
  groupLabel?: string;
  items: NavItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, isDark = true }) => {
  const { currentRole } = useAuth();
  const location = useLocation();

  // State to track which groups are open or closed
  // Default all open so users can see full system initially
  const [openGroups, setOpenGroups] = useState<{ [key: string]: boolean }>({
    'lop-hoc': true,
    'day-va-hoc': true,
    'theo-doi': true,
    'tien-ich': true,
    'giao-tiep': true,
    'quan-tri': true,
    'van-hanh': true,
  });

  const toggleGroup = (groupId: string) => {
    setOpenGroups(prev => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  };

  const getTeacherNav = (): NavGroup[] => [
    {
      id: 'tong-quan',
      items: [
        { label: 'Tổng quan', path: '/teacher/dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
      ],
    },
    {
      id: 'lop-hoc',
      groupLabel: 'LỚP HỌC',
      items: [
        { label: 'Lớp của tôi', path: '/teacher/classes', icon: <BookOpen className="w-4 h-4" /> },
        { label: 'Học sinh', path: '/teacher/students', icon: <Users className="w-4 h-4" /> },
        { label: 'Điểm danh', path: '/teacher/attendance', icon: <ClipboardCheck className="w-4 h-4" /> },
        { label: 'Thời khóa biểu', path: '/teacher/schedule', icon: <Calendar className="w-4 h-4" /> },
      ],
    },
    {
      id: 'day-va-hoc',
      groupLabel: 'DẠY & HỌC',
      items: [
        { label: 'Ngân hàng câu hỏi', path: '/teacher/question-bank', icon: <HelpCircle className="w-4 h-4" /> },
        { label: 'Giao bài tập', path: '/teacher/assignments', icon: <FileText className="w-4 h-4" />, badge: '4' },
        { label: 'Chấm bài tự động', path: '/teacher/quizzes', icon: <CheckSquare className="w-4 h-4" /> },
        { label: 'Tài liệu số', path: '/teacher/resources', icon: <FolderOpen className="w-4 h-4" /> },
        { label: 'AI Hỗ trợ', path: '/teacher/ai', icon: <Sparkles className="w-4 h-4 text-purple-600" /> },
      ],
    },
    {
      id: 'theo-doi',
      groupLabel: 'THEO DÕI & ĐÁNH GIÁ',
      items: [
        { label: 'Sổ điểm điện tử', path: '/teacher/grades', icon: <BarChart3 className="w-4 h-4" /> },
        { label: 'Chuyên cần', path: '/teacher/attendance-analytics', icon: <UserCheck className="w-4 h-4" /> },
        { label: 'Hành vi & Nề nếp', path: '/teacher/behavior', icon: <Award className="w-4 h-4" /> },
        { label: 'Cảnh báo thông minh', path: '/teacher/alerts', icon: <AlertTriangle className="w-4 h-4 text-amber-500" />, badge: '3' },
      ],
    },
    {
      id: 'tien-ich',
      groupLabel: 'TIỆN ÍCH LỚP HỌC',
      items: [
        { label: 'Công cụ tương tác', path: '/teacher/tools', icon: <Wrench className="w-4 h-4" /> },
        { label: 'Vòng quay may mắn', path: '/teacher/tools/wheel', icon: <Compass className="w-4 h-4" /> },
        { label: 'Chọn học sinh', path: '/teacher/tools/random', icon: <Shuffle className="w-4 h-4" /> },
        { label: 'Đồng hồ đếm ngược', path: '/teacher/tools/timer', icon: <Clock className="w-4 h-4" /> },
      ],
    },
    {
      id: 'giao-tiep',
      groupLabel: 'GIAO TIẾP & BÁO CÁO',
      items: [
        { label: 'Thông báo', path: '/teacher/announcements', icon: <Bell className="w-4 h-4" /> },
        { label: 'Báo cáo tổng kết', path: '/teacher/reports', icon: <BarChart3 className="w-4 h-4" /> },
        { label: 'Cài đặt', path: '/teacher/settings', icon: <Settings className="w-4 h-4" /> },
      ],
    },
  ];

  const getStudentNav = (): NavGroup[] => [
    {
      id: 'student-main',
      items: [
        { label: 'Trang chủ', path: '/student/dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
        { label: 'Lịch học', path: '/student/schedule', icon: <Calendar className="w-4 h-4" /> },
        { label: 'Bài tập cần nộp', path: '/student/assignments', icon: <FileText className="w-4 h-4" />, badge: '2' },
        { label: 'Kiểm tra / Quiz', path: '/student/quizzes', icon: <CheckSquare className="w-4 h-4" /> },
        { label: 'Học liệu', path: '/student/resources', icon: <FolderOpen className="w-4 h-4" /> },
        { label: 'Bảng điểm cá nhân', path: '/student/grades', icon: <BarChart3 className="w-4 h-4" /> },
        { label: 'Chuyên cần', path: '/student/attendance', icon: <ClipboardCheck className="w-4 h-4" /> },
        { label: 'Thành tích & Huy hiệu', path: '/student/achievements', icon: <Award className="w-4 h-4" /> },
        { label: 'Thông báo', path: '/student/announcements', icon: <Bell className="w-4 h-4" /> },
      ],
    },
  ];

  const getParentNav = (): NavGroup[] => [
    {
      id: 'parent-main',
      items: [
        { label: 'Tổng quan con', path: '/parent/dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
        { label: 'Kết quả học tập', path: '/parent/grades', icon: <BarChart3 className="w-4 h-4" /> },
        { label: 'Theo dõi chuyên cần', path: '/parent/attendance', icon: <ClipboardCheck className="w-4 h-4" /> },
        { label: 'Bài tập của con', path: '/parent/assignments', icon: <FileText className="w-4 h-4" /> },
        { label: 'Nhận xét giáo viên', path: '/parent/achievements', icon: <Award className="w-4 h-4" /> },
        { label: 'Thời khóa biểu', path: '/parent/schedule', icon: <Calendar className="w-4 h-4" /> },
        { label: 'Thông báo nhà trường', path: '/parent/announcements', icon: <Bell className="w-4 h-4" /> },
        { label: 'Trao đổi với GV', path: '/parent/messages', icon: <MessageSquare className="w-4 h-4" /> },
      ],
    },
  ];

  const getAdminNav = (): NavGroup[] => [
    {
      id: 'admin-dashboard',
      items: [
        { label: 'Dashboard Hệ thống', path: '/admin/dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
      ],
    },
    {
      id: 'quan-tri',
      groupLabel: 'QUẢN TRỊ TRƯỜNG HỌC',
      items: [
        { label: 'Thông tin trường', path: '/admin/schools', icon: <GraduationCap className="w-4 h-4" /> },
        { label: 'Năm học & Khối môn', path: '/admin/academic-years', icon: <Calendar className="w-4 h-4" /> },
        { label: 'Quản lý Lớp học', path: '/admin/classes', icon: <BookOpen className="w-4 h-4" /> },
        { label: 'Người dùng & Tài khoản', path: '/admin/users', icon: <Users className="w-4 h-4" /> },
        { label: 'Phân quyền (RBAC)', path: '/admin/roles', icon: <ShieldCheck className="w-4 h-4" /> },
      ],
    },
    {
      id: 'van-hanh',
      groupLabel: 'VẬN HÀNH & AN TOÀN',
      items: [
        { label: 'Báo cáo toàn trường', path: '/admin/reports', icon: <BarChart3 className="w-4 h-4" /> },
        { label: 'Nhật ký Audit Log', path: '/admin/audit-logs', icon: <History className="w-4 h-4" /> },
        { label: 'Cấu hình & Sao lưu DB', path: '/admin/settings', icon: <Settings className="w-4 h-4" /> },
      ],
    },
  ];

  let navGroups: NavGroup[] = [];
  if (currentRole === 'ADMIN') navGroups = getAdminNav();
  else if (currentRole === 'STUDENT') navGroups = getStudentNav();
  else if (currentRole === 'PARENT') navGroups = getParentNav();
  else navGroups = getTeacherNav();

  // Auto-expand group if current path is inside it
  useEffect(() => {
    navGroups.forEach(g => {
      if (g.id && g.items.some(it => location.pathname.startsWith(it.path))) {
        setOpenGroups(prev => ({ ...prev, [g.id!]: true }));
      }
    });
  }, [location.pathname]);

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs md:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 md:z-30 w-64 transition-transform duration-200 ease-in-out md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } flex flex-col pt-16 ${
          isDark
            ? 'bg-[#020e1a] border-r border-[#0e3d54] text-slate-200'
            : 'bg-white border-r border-slate-200'
        }`}
      >
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-3">
          {/* Dark Mode Classroom Header (Khớp với Hình 1, 2, 3) */}
          {isDark && (
            <div className="px-3 pb-3 mb-2 border-b border-[#0e3d54]">
              <div className="flex items-center justify-between text-[11px] text-cyan-400 font-bold">
                <span>KHÔNG GIAN LỚP</span>
                <span className="px-1.5 py-0.5 rounded bg-cyan-950/90 text-cyan-300 border border-cyan-800 text-[10px] font-bold">
                  31 HS
                </span>
              </div>
              <div className="text-sm font-extrabold text-white mt-1">Lớp 6A1</div>
            </div>
          )}

          {navGroups.map((group, gIdx) => {
            const groupId = group.id || `group-${gIdx}`;
            const isGroupOpen = group.groupLabel ? (openGroups[groupId] ?? true) : true;

            return (
              <div key={groupId} className="space-y-1">
                {group.groupLabel && (
                  <button
                    type="button"
                    onClick={() => toggleGroup(groupId)}
                    className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-[11px] font-bold tracking-wider transition-colors group cursor-pointer ${
                      isDark
                        ? 'text-cyan-400/90 hover:text-cyan-200 hover:bg-[#061d33]'
                        : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/70'
                    }`}
                    title={isGroupOpen ? `Đóng module ${group.groupLabel}` : `Mở module ${group.groupLabel}`}
                  >
                    <span className="uppercase">{group.groupLabel}</span>
                    <div className="flex items-center gap-1">
                      <span className={`text-[10px] font-mono ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                        ({group.items.length})
                      </span>
                      {isGroupOpen ? (
                        <ChevronDown className="w-3.5 h-3.5 opacity-70 group-hover:opacity-100 transition-transform" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5 opacity-70 group-hover:opacity-100 transition-transform" />
                      )}
                    </div>
                  </button>
                )}

                {/* Submenu items list */}
                {isGroupOpen && (
                  <div className="space-y-0.5 animate-in fade-in slide-in-from-top-1 duration-150 pl-0.5">
                    {group.items.map(item => (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        onClick={onClose}
                        className={({ isActive }) =>
                          `flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all ${
                            isActive
                              ? isDark
                                ? 'bg-[#0088cc] text-white font-bold shadow-md shadow-cyan-900/40'
                                : 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold shadow-xs shadow-blue-500/20'
                              : isDark
                              ? 'text-slate-300 hover:text-cyan-300 hover:bg-[#061d33] font-medium'
                              : 'text-slate-600 hover:text-blue-600 hover:bg-slate-100/70 font-medium'
                          }`
                        }
                      >
                        {({ isActive }) => (
                          <>
                            <div className="flex items-center gap-2.5">
                              <span className={isActive ? 'text-white' : isDark ? 'text-cyan-400' : 'text-slate-500'}>
                                {item.icon}
                              </span>
                              <span>{item.label}</span>
                            </div>
                            {item.badge && (
                              <span
                                className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                                  isActive
                                    ? 'bg-white/20 text-white'
                                    : 'bg-rose-50 text-rose-600 border border-rose-200/60'
                                }`}
                              >
                                {item.badge}
                              </span>
                            )}
                          </>
                        )}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer info in sidebar */}
        <div className={`p-3.5 border-t text-[11px] ${
          isDark
            ? 'border-[#0e3d54] bg-[#020e1a] text-slate-400'
            : 'border-slate-100/80 bg-slate-50/50 text-slate-400'
        }`}>
          <div className={`font-bold truncate ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
            {isDark ? 'Năm học 2024–2025' : 'THCS Lê Quý Đôn'}
          </div>
          <div className="text-[10px] text-slate-500">
            {isDark ? 'Học kỳ 1 • Tuần học 06' : 'Lớp Học Thông Minh 4.0'}
          </div>
        </div>
      </aside>
    </>
  );
};

