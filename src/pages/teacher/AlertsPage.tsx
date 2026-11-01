import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Filter,
  Search,
  ArrowRight
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { Breadcrumb } from '../../components/common/Breadcrumb';
import { db } from '../../services/db';
import { SmartAlert } from '../../types';
import { useToast } from '../../contexts/ToastContext';

export const AlertsPage: React.FC = () => {
  const { showToast } = useToast();
  const [alerts, setAlerts] = useState<SmartAlert[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    setAlerts(db.getAlerts());
  }, []);

  const handleUpdateStatus = (id: string, status: SmartAlert['status']) => {
    db.updateAlertStatus(id, status);
    setAlerts(db.getAlerts());
    showToast('Đã cập nhật trạng thái cảnh báo!', 'success');
  };

  const filtered = alerts.filter(a => {
    if (filterStatus === 'all') return true;
    return a.status === filterStatus;
  });

  return (
    <div className="space-y-4">
      <PageHeader
        breadcrumbItems={[
          { label: 'Theo dõi', href: '/teacher/classes' },
          { label: 'Cảnh báo thông minh' },
        ]}
        title="Trung tâm Cảnh báo Học tập & Chuyên cần"
        action={
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono bg-[#031526] border border-[#0e3d54] text-rose-400 px-2.5 py-1 rounded-lg">
              {alerts.filter(a => a.status === 'new').length} cảnh báo mới
            </span>
          </div>
        }
      />

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl max-w-sm text-xs font-semibold">
        <button
          onClick={() => setFilterStatus('all')}
          className={`flex-1 py-1.5 px-3 rounded-lg transition-colors ${
            filterStatus === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
          }`}
        >
          Tất cả ({alerts.length})
        </button>
        <button
          onClick={() => setFilterStatus('new')}
          className={`flex-1 py-1.5 px-3 rounded-lg transition-colors ${
            filterStatus === 'new' ? 'bg-white text-rose-700 shadow-xs' : 'text-slate-600'
          }`}
        >
          Mới ({alerts.filter(a => a.status === 'new').length})
        </button>
        <button
          onClick={() => setFilterStatus('investigating')}
          className={`flex-1 py-1.5 px-3 rounded-lg transition-colors ${
            filterStatus === 'investigating' ? 'bg-white text-amber-700 shadow-xs' : 'text-slate-600'
          }`}
        >
          Đang xử lý
        </button>
        <button
          onClick={() => setFilterStatus('resolved')}
          className={`flex-1 py-1.5 px-3 rounded-lg transition-colors ${
            filterStatus === 'resolved' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600'
          }`}
        >
          Đã giải quyết
        </button>
      </div>

      {/* Alerts Stream */}
      <div className="space-y-3">
        {filtered.map(alt => (
          <div
            key={alt.id}
            className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                  alt.level === 'critical'
                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                    : alt.level === 'warning'
                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                    : 'bg-blue-50 text-blue-700 border border-blue-200'
                }`}>
                  {alt.level === 'critical' ? 'Nguy cơ cao' : alt.level === 'warning' ? 'Cảnh báo' : 'Thông tin'}
                </span>
                <h4 className="font-bold text-slate-900 text-sm">{alt.title}</h4>
              </div>

              <div className="text-xs text-slate-600 mt-1">
                Học sinh: <strong className="text-slate-900">{alt.studentName}</strong> (Lớp {alt.className})
              </div>

              <p className="text-xs text-slate-500 mt-1 leading-relaxed">{alt.description}</p>
              <div className="text-[11px] text-slate-400 mt-1">
                Phát hiện lúc: {new Date(alt.createdAt).toLocaleString('vi-VN')}
              </div>
            </div>

            {/* Workflow Action Buttons */}
            <div className="flex items-center gap-2 shrink-0">
              {alt.status !== 'investigating' && alt.status !== 'resolved' && (
                <button
                  onClick={() => handleUpdateStatus(alt.id, 'investigating')}
                  className="px-3 py-1.5 bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-lg text-xs font-semibold transition-colors"
                >
                  Bắt đầu xử lý
                </button>
              )}
              {alt.status !== 'resolved' && (
                <button
                  onClick={() => handleUpdateStatus(alt.id, 'resolved')}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
                >
                  Đánh dấu đã giải quyết
                </button>
              )}
              {alt.status === 'resolved' && (
                <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Đã xử lý xong</span>
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
