import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  Calendar,
  MessageSquare,
  ArrowRight,
  Plus,
  Compass,
  Sparkles,
  ClipboardCheck,
  ChevronRight,
  TrendingUp,
  School
} from 'lucide-react';
import { db } from '../../services/db';
import { Classroom, SmartAlert, AuditLog } from '../../types';
import { StatCard } from '../../components/common/StatCard';
import { PageHeader } from '../../components/common/PageHeader';
import { useAuth } from '../../contexts/AuthContext';

export const TeacherDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, setActiveClassId } = useAuth();

  const [classes, setClasses] = useState<Classroom[]>([]);
  const [alerts, setAlerts] = useState<SmartAlert[]>([]);
  const [recentLogs, setRecentLogs] = useState<AuditLog[]>([]);

  useEffect(() => {
    const loadData = () => {
      setClasses(db.getClasses());
      setAlerts(db.getAlerts().filter(a => a.status !== 'resolved'));
      setRecentLogs(db.getAuditLogs().slice(0, 5));
    };
    loadData();
    return db.subscribe(loadData);
  }, []);

  const stats = db.getTeacherStats(currentUser?.id);

  const handleOpenClass = (classId: string) => {
    setActiveClassId(classId);
    navigate(`/teacher/classes/${classId}`);
  };

  return (
    <div className="space-y-6 text-slate-100">
      {/* Page Header */}
      <PageHeader
        breadcrumbItems={[
          { label: 'Tổng quan' },
          { label: 'Bàn làm việc giáo viên' },
        ]}
        title={`Xin chào, ${currentUser?.fullName || 'Thầy/Cô'}!`}
        subtitle="Hôm nay là Thứ Năm, ngày 20/02/2025 · Năm học 2024 - 2025"
        action={
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/teacher/schedule')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl text-xs font-bold shadow-sm shadow-cyan-950 transition-all cursor-pointer border border-cyan-500/30"
            >
              <Calendar className="w-4 h-4 text-cyan-200" />
              <span>Thời khóa biểu</span>
            </button>
            <button
              onClick={() => navigate('/teacher/attendance')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#041527] border border-[#0e3d54] hover:bg-[#07243e] text-slate-200 rounded-xl text-xs font-semibold shadow-sm transition-colors cursor-pointer"
            >
              <ClipboardCheck className="w-4 h-4 text-emerald-400" />
              <span>Điểm danh</span>
            </button>
          </div>
        }
      />

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          label="Tổng học sinh phụ trách"
          value={stats.totalStudents}
          subtext="Thuộc 4 lớp học"
          icon={<Users className="w-5 h-5 text-cyan-400" />}
        />
        <StatCard
          label="Có mặt hôm nay"
          value={stats.presentToday}
          subtext={`Vắng: ${stats.absentToday} · Đi muộn: ${stats.lateToday}`}
          icon={<CheckCircle2 className="w-5 h-5 text-emerald-400" />}
          trend={{ value: '96.8% chuyên cần', isPositive: true }}
        />
        <StatCard
          label="Bài tập chờ chấm"
          value={stats.pendingGradingCount}
          subtext="Bài tập Hàm số bậc hai"
          icon={<FileText className="w-5 h-5 text-amber-400" />}
          onClick={() => navigate('/teacher/assignments')}
        />
        <StatCard
          label="Cảnh báo học tập & nề nếp"
          value={stats.activeAlertsCount}
          subtext="Cần theo dõi và hỗ trợ"
          icon={<AlertTriangle className="w-5 h-5 text-rose-400" />}
          onClick={() => navigate('/teacher/alerts')}
        />
      </div>

      {/* Quick Action Ribbon */}
      <div className="bg-[#041527] rounded-2xl border border-[#0e3d54] p-4 sm:p-5 shadow-sm">
        <div className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-3">
          Tác vụ nhanh thường dùng
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          <button
            onClick={() => navigate('/teacher/schedule')}
            className="flex flex-col items-center justify-center p-3 rounded-xl border border-[#0e3d54] bg-[#03172c] hover:bg-[#072540] hover:border-cyan-400 transition-all text-center group cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-cyan-950/80 text-cyan-400 border border-cyan-800 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
              <Calendar className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-slate-200 group-hover:text-cyan-300">Thời khóa biểu</span>
          </button>

          <button
            onClick={() => navigate('/teacher/attendance')}
            className="flex flex-col items-center justify-center p-3 rounded-xl border border-[#0e3d54] bg-[#03172c] hover:bg-[#072540] hover:border-emerald-400 transition-all text-center group cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-950/80 text-emerald-400 border border-emerald-800 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
              <ClipboardCheck className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-slate-200 group-hover:text-emerald-300">Điểm danh</span>
          </button>

          <button
            onClick={() => navigate('/teacher/assignments')}
            className="flex flex-col items-center justify-center p-3 rounded-xl border border-[#0e3d54] bg-[#03172c] hover:bg-[#072540] hover:border-purple-400 transition-all text-center group cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-purple-950/80 text-purple-400 border border-purple-800 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
              <FileText className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-slate-200 group-hover:text-purple-300">Giao bài tập</span>
          </button>

          <button
            onClick={() => navigate('/teacher/grades')}
            className="flex flex-col items-center justify-center p-3 rounded-xl border border-[#0e3d54] bg-[#03172c] hover:bg-[#072540] hover:border-teal-400 transition-all text-center group cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-teal-950/80 text-teal-400 border border-teal-800 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
              <TrendingUp className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-slate-200 group-hover:text-teal-300">Nhập sổ điểm</span>
          </button>

          <button
            onClick={() => navigate('/teacher/tools/wheel')}
            className="flex flex-col items-center justify-center p-3 rounded-xl border border-[#0e3d54] bg-[#03172c] hover:bg-[#072540] hover:border-amber-400 transition-all text-center group cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-amber-950/80 text-amber-400 border border-amber-800 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
              <Compass className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-slate-200 group-hover:text-amber-300">Vòng quay lớp</span>
          </button>

          <button
            onClick={() => navigate('/teacher/ai')}
            className="flex flex-col items-center justify-center p-3 rounded-xl border border-[#0e3d54] bg-[#03172c] hover:bg-[#072540] hover:border-indigo-400 transition-all text-center group cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-indigo-950/80 text-cyan-300 border border-indigo-800 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-slate-200 group-hover:text-cyan-300">AI Soạn bài</span>
          </button>
        </div>
      </div>

      {/* Main Content Grid: Classes Overview & Schedule/Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: My Classes (2 spans) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white">
              Lớp học đang phụ trách ({classes.length})
            </h2>
            <button
              onClick={() => navigate('/teacher/classes')}
              className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
            >
              <span>Xem tất cả</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {classes.map(cls => (
              <div
                key={cls.id}
                onClick={() => handleOpenClass(cls.id)}
                className="bg-[#041527] rounded-xl border border-[#0e3d54] p-5 hover:border-cyan-400 hover:shadow-lg hover:shadow-cyan-950/40 transition-all duration-150 cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-xs font-medium text-slate-400">
                        Khối {cls.gradeLevel} · Phòng {cls.roomNumber}
                      </span>
                      <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors">
                        Lớp {cls.name}
                      </h3>
                    </div>
                    <span
                      className="w-3 h-3 rounded-full shrink-0 ring-2 ring-[#041527]"
                      style={{ backgroundColor: cls.color }}
                    />
                  </div>

                  <div className="mt-3 text-xs text-slate-400 space-y-1">
                    <div>
                      GVCN: <span className="font-semibold text-slate-200">{cls.homeroomTeacherName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>Sĩ số: <strong className="text-white tabular-nums">{cls.studentCount}</strong> học sinh</span>
                      <span>·</span>
                      <span className="font-mono text-cyan-400/80">Mã: {cls.joinCode}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-[#0e3d54] flex items-center justify-between text-xs font-medium text-cyan-400">
                  <span>Mở không gian lớp học</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>

          {/* Today's Schedule Timeline */}
          <div className="bg-[#041527] rounded-xl border border-[#0e3d54] p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-white">Lịch giảng dạy hôm nay</h3>
              </div>
              <button
                onClick={() => navigate('/teacher/schedule')}
                className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 hover:underline cursor-pointer"
              >
                Xem tuần
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#03172c] border border-[#0e3d54] text-xs">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-cyan-300 bg-[#06203a] px-2 py-1 rounded-md border border-cyan-800 tabular-nums">
                    Tiết 1-2
                  </span>
                  <div>
                    <span className="font-bold text-white">Toán học · Lớp 10A1</span>
                    <div className="text-slate-400 text-[11px]">07:30 - 09:05 · Phòng A.302</div>
                  </div>
                </div>
                <button
                  onClick={() => handleOpenClass('class_10a1')}
                  className="px-2.5 py-1 bg-[#0284c7] hover:bg-[#0369a1] text-white font-medium rounded-lg transition-colors cursor-pointer border border-cyan-500/40"
                >
                  Vào lớp
                </button>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-[#03172c] border border-[#0e3d54] text-xs">
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-slate-300 bg-[#06203a] px-2 py-1 rounded-md border border-[#0e3d54] tabular-nums">
                    Tiết 4
                  </span>
                  <div>
                    <span className="font-bold text-white">Toán học · Lớp 10A2</span>
                    <div className="text-slate-400 text-[11px]">10:15 - 11:00 · Phòng A.304</div>
                  </div>
                </div>
                <span className="text-slate-500 text-xs font-medium">Chưa bắt đầu</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Smart Alerts & Activity Stream (1 span) */}
        <div className="space-y-4">
          {/* Smart Alerts */}
          <div className="bg-[#041527] rounded-xl border border-[#0e3d54] p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-white">Cảnh báo thông minh</h3>
              </div>
              <span className="text-xs font-semibold text-cyan-400 tabular-nums">
                {alerts.length} việc cần làm
              </span>
            </div>

            <div className="space-y-2.5">
              {alerts.length === 0 ? (
                <div className="text-xs text-slate-400 py-4 text-center">
                  Không có cảnh báo nào đang tồn tại.
                </div>
              ) : (
                alerts.map(alt => (
                  <div
                    key={alt.id}
                    onClick={() => navigate('/teacher/alerts')}
                    className="p-3 rounded-xl border border-[#0e3d54] bg-[#03172c] hover:bg-[#06203a] hover:border-cyan-400/80 transition-all cursor-pointer text-xs"
                  >
                    <div className="flex items-center justify-between font-semibold text-slate-200">
                      <span className="truncate">{alt.studentName} ({alt.className})</span>
                      <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-sm ${
                        alt.level === 'critical'
                          ? 'text-rose-400 bg-rose-950/80 border border-rose-800'
                          : 'text-amber-400 bg-amber-950/80 border border-amber-800'
                      }`}>
                        {alt.level === 'critical' ? 'Nghiêm trọng' : 'Cần chú ý'}
                      </span>
                    </div>
                    <div className="text-slate-400 text-[11px] mt-1 line-clamp-2">
                      {alt.description}
                    </div>
                  </div>
                ))
              )}
            </div>

            <button
              onClick={() => navigate('/teacher/alerts')}
              className="mt-3 w-full py-2 text-center text-xs font-semibold text-cyan-400 hover:text-cyan-300 hover:bg-[#06203a] rounded-xl transition-colors border border-dashed border-[#0e3d54] cursor-pointer"
            >
              Xem toàn bộ cảnh báo
            </button>
          </div>

          {/* Activity Logs Stream */}
          <div className="bg-[#041527] rounded-xl border border-[#0e3d54] p-5">
            <h3 className="text-sm font-bold text-white mb-3">Hoạt động gần đây</h3>
            <div className="space-y-3">
              {recentLogs.map(log => (
                <div key={log.id} className="text-xs border-l-2 border-cyan-400 pl-3 py-0.5">
                  <div className="font-semibold text-slate-200 leading-tight">
                    {log.details}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1 tabular-nums">
                    {new Date(log.timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} · {log.userName}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
