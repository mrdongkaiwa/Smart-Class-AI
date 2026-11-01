import React, { useState } from 'react';
import {
  BarChart3,
  Download,
  Printer,
  TrendingUp,
  Users,
  Award,
  Calendar
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { Breadcrumb } from '../../components/common/Breadcrumb';
import { db } from '../../services/db';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';

export const ReportsPage: React.FC = () => {
  const { activeClassId } = useAuth();
  const { showToast } = useToast();
  const students = db.getStudents(activeClassId || 'class_10a1');

  const handlePrint = () => {
    window.print();
  };

  const handleExportPDF = () => {
    showToast('Đang tạo file PDF báo cáo kết quả...', 'info');
    setTimeout(() => {
      showToast('Đã tải xuống Báo cáo tổng kết Lớp 10A1!', 'success');
    }, 1000);
  };

  return (
    <div className="space-y-4">

      <PageHeader
        breadcrumbItems={[
          { label: 'Báo cáo' },
          { label: 'Báo cáo tổng kết sư phạm' },
        ]}
        title="Trung tâm Báo cáo & Thống kê Tổng kết"
        action={
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#041527] border border-[#0e3d54] hover:bg-[#072540] text-slate-200 rounded-lg text-xs font-semibold shadow-xs cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-cyan-400" />
              <span>In báo cáo</span>
            </button>
            <button
              onClick={handleExportPDF}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0284c7] hover:bg-[#0369a1] text-white rounded-lg text-xs font-bold shadow-sm shadow-cyan-950 cursor-pointer border border-cyan-500/40"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Xuất file PDF</span>
            </button>
          </div>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200">
          <span className="text-xs text-slate-500 font-medium">Chuyên cần trung bình</span>
          <div className="text-2xl font-bold text-slate-900 mt-1 tabular-nums">96.8%</div>
          <span className="text-xs text-emerald-600 mt-0.5 block">Xếp loại Tốt</span>
        </div>
        <div className="p-4 rounded-xl bg-white border border-slate-200">
          <span className="text-xs text-slate-500 font-medium">Điểm TB toàn lớp</span>
          <div className="text-2xl font-bold text-slate-900 mt-1 tabular-nums">8.4 / 10</div>
          <span className="text-xs text-blue-600 mt-0.5 block">Khá Giỏi: 88%</span>
        </div>
        <div className="p-4 rounded-xl bg-white border border-slate-200">
          <span className="text-xs text-slate-500 font-medium">Tỷ lệ nộp bài tập</span>
          <div className="text-2xl font-bold text-slate-900 mt-1 tabular-nums">94.2%</div>
          <span className="text-xs text-slate-400 mt-0.5 block">4 bài đã giao</span>
        </div>
        <div className="p-4 rounded-xl bg-white border border-slate-200">
          <span className="text-xs text-slate-500 font-medium">Học sinh cần bồi dưỡng</span>
          <div className="text-2xl font-bold text-amber-600 mt-1 tabular-nums">2 em</div>
          <span className="text-xs text-amber-600 mt-0.5 block">Đã có kế hoạch phụ đạo</span>
        </div>
      </div>

      {/* Distribution visual analysis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-3">
          <h3 className="text-sm font-bold text-slate-900">Phân bố Học lực Lớp 10A1</h3>
          <div className="space-y-2.5 text-xs">
            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span>Xuất sắc & Giỏi (8.0 - 10.0)</span>
                <span className="tabular-nums">68% (8 HS)</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 rounded-full" style={{ width: '68%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span>Khá (6.5 - 7.9)</span>
                <span className="tabular-nums">24% (3 HS)</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-purple-500 rounded-full" style={{ width: '24%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span>Trung bình (5.0 - 6.4)</span>
                <span className="tabular-nums">8% (1 HS)</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: '8%' }} />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-3">
          <h3 className="text-sm font-bold text-slate-900">Xếp loại Hạnh kiểm & Rèn luyện</h3>
          <div className="space-y-2.5 text-xs">
            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span>Hạnh kiểm Tốt</span>
                <span className="tabular-nums">91.6% (11 HS)</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: '91.6%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span>Hạnh kiểm Khá</span>
                <span className="tabular-nums">8.4% (1 HS)</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: '8.4%' }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
