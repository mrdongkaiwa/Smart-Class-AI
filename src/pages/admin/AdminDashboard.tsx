import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  School,
  Users,
  BookOpen,
  History,
  Download,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Layers
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { StatCard } from '../../components/common/StatCard';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { db } from '../../services/db';
import { AuditLog } from '../../types';
import { useToast } from '../../contexts/ToastContext';

export const AdminDashboard: React.FC = () => {
  const { showToast } = useToast();
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  useEffect(() => {
    setAuditLogs(db.getAuditLogs());
  }, []);

  const handleExportBackup = () => {
    const rawData = localStorage.getItem('smartclass_db_v2');
    const blob = new Blob([rawData || '{}'], { type: 'application/json' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `SmartClass_Backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    showToast('Đã xuất file sao lưu dữ liệu toàn hệ thống!', 'success');
  };

  const handleResetToDefault = () => {
    db.resetToDefault();
    setAuditLogs(db.getAuditLogs());
    showToast('Đã đặt lại dữ liệu hệ thống về mẫu ban đầu!', 'success');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumbItems={[
          { label: 'Hệ thống' },
          { label: 'Quản trị Admin' },
        ]}
        title="Bảng Điều Khiển Quản Trị Hệ Thống (Admin Portal)"
        subtitle="Quản trị trường học & phân quyền RBAC"
        action={
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportBackup}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold shadow-xs transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Sao lưu JSON</span>
            </button>
            <button
              onClick={() => setIsResetConfirmOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-semibold shadow-xs transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Khôi phục mẫu gốc</span>
            </button>
          </div>
        }
      />

      {/* Admin KPI Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Tổng người dùng"
          value={db.getUsers().length + db.getStudents().length}
          subtext="Giáo viên, Học sinh, Phụ huynh"
          icon={<Users className="w-5 h-5 text-blue-500" />}
        />
        <StatCard
          label="Lớp học đang mở"
          value={db.getClasses().length}
          subtext="Thuộc 3 khối lớp"
          icon={<BookOpen className="w-5 h-5 text-purple-500" />}
        />
        <StatCard
          label="Trường / Cơ sở"
          value="1"
          subtext="THPT Chuyên Tri Thức Mới"
          icon={<School className="w-5 h-5 text-emerald-500" />}
        />
        <StatCard
          label="Nhật ký Audit Log"
          value={auditLogs.length}
          subtext="Bảo mật ghi nhận toàn diện"
          icon={<ShieldCheck className="w-5 h-5 text-amber-500" />}
        />
      </div>

      {/* Audit Log Stream */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Nhật ký hoạt động bảo mật (Audit Trail)</h3>
            <p className="text-xs text-slate-400 mt-0.5">Ghi nhận các thao tác thêm, sửa, xóa, điểm danh và chấm điểm trong hệ thống</p>
          </div>
          <span className="text-xs text-slate-400 font-mono">Bất biến · Không thể chỉnh sửa</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 uppercase font-semibold text-slate-500">
              <tr>
                <th className="px-4 py-3">Thời gian</th>
                <th className="px-4 py-3">Người thực hiện</th>
                <th className="px-4 py-3">Hành động</th>
                <th className="px-4 py-3">Đối tượng</th>
                <th className="px-4 py-3">Chi tiết</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {auditLogs.map(log => (
                <tr key={log.id} className="hover:bg-slate-50/60">
                  <td className="px-4 py-3 tabular-nums text-slate-400 font-mono whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString('vi-VN')}
                  </td>
                  <td className="px-4 py-3 font-bold text-slate-800">
                    {log.userName}
                    <span className="block text-[10px] text-slate-400 font-normal">{log.userRole}</span>
                  </td>
                  <td className="px-4 py-3 font-mono font-semibold text-blue-700">
                    {log.action}
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-700">
                    {log.targetEntity}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {log.details}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmDialog
        isOpen={isResetConfirmOpen}
        onClose={() => setIsResetConfirmOpen(false)}
        onConfirm={handleResetToDefault}
        title="Xác nhận khôi phục mẫu gốc"
        message="Hành động này sẽ xóa dữ liệu cục bộ đã chỉnh sửa và phục hồi cơ sở dữ liệu mẫu ban đầu. Bạn có chắc chắn không?"
        confirmText="Khôi phục"
        isDanger={true}
      />
    </div>
  );
};
