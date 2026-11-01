import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Save,
  Download,
  Filter,
  CheckCircle2,
  FileSpreadsheet
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { Breadcrumb } from '../../components/common/Breadcrumb';
import { db } from '../../services/db';
import { Classroom, StudentGradeRecord } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';

export const GradesPage: React.FC = () => {
  const { activeClassId } = useAuth();
  const { showToast } = useToast();

  const [classes, setClasses] = useState<Classroom[]>([]);
  const [selectedClassId, setSelectedClassId] = useState(activeClassId || 'class_10a1');
  const [semester, setSemester] = useState<1 | 2>(2);
  const [grades, setGrades] = useState<StudentGradeRecord[]>([]);

  useEffect(() => {
    setClasses(db.getClasses());
  }, []);

  useEffect(() => {
    setGrades(db.getGrades(selectedClassId, semester));
  }, [selectedClassId, semester]);

  const handleCellChange = (id: string, field: keyof StudentGradeRecord, val: string) => {
    const num = val === '' ? undefined : parseFloat(val);
    setGrades(prev => prev.map(g => (g.id === id ? { ...g, [field]: num } : g)));
  };

  const handleSave = () => {
    db.batchSaveGrades(grades);
    showToast('Đã lưu toàn bộ sổ điểm môn học!', 'success');
  };

  const handleExportCSV = () => {
    const cls = db.getClassById(selectedClassId);
    let csv = `BẢNG ĐIỂM LỚP ${cls?.name || '10A1'} - HỌC KỲ ${semester}\n`;
    csv += "STT,Mã HS,Họ và tên,Miệng 1,Miệng 2,15P 1,15P 2,Giữa kỳ,Cuối kỳ,ĐTB Môn\n";
    grades.forEach((g, idx) => {
      csv += `${idx + 1},${g.studentCode},"${g.studentName}",${g.oral1 ?? ''},${g.oral2 ?? ''},${g.test15m1 ?? ''},${g.test15m2 ?? ''},${g.midterm ?? ''},${g.finalTerm ?? ''},${g.averageScore ?? ''}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `Bang_diem_lop_${cls?.name || '10A1'}_HK${semester}.csv`;
    link.click();
    showToast('Đã xuất file bảng điểm CSV thành công!', 'info');
  };

  return (
    <div className="space-y-4 text-slate-100">
      <PageHeader
        breadcrumbItems={[
          { label: 'Theo dõi' },
          { label: 'Sổ điểm điện tử' },
        ]}
        title="Sổ Điểm Điện Tử"
        action={
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#041527] border border-[#0e3d54] hover:bg-[#072540] text-slate-200 rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>Xuất CSV</span>
            </button>
            <button
              onClick={handleSave}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#0284c7] hover:bg-[#0369a1] text-white rounded-lg text-xs font-bold shadow-xs shadow-cyan-950 transition-colors cursor-pointer border border-cyan-500/40"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Lưu sổ điểm</span>
            </button>
          </div>
        }
      />

      {/* Class and Semester Toolbar */}
      <div className="bg-[#041527] p-3.5 rounded-xl border border-[#0e3d54] flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-400">Lớp:</span>
            <select
              value={selectedClassId}
              onChange={e => setSelectedClassId(e.target.value)}
              className="px-2.5 py-1.5 border border-[#0e3d54] rounded-lg text-xs font-bold text-white bg-[#020e1a] focus:border-cyan-400 focus:outline-none"
            >
              {classes.map(c => (
                <option key={c.id} value={c.id}>
                  Lớp {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-400">Học kỳ:</span>
            <select
              value={semester}
              onChange={e => setSemester(Number(e.target.value) as 1 | 2)}
              className="px-2.5 py-1.5 border border-[#0e3d54] rounded-lg text-xs font-bold text-white bg-[#020e1a] focus:border-cyan-400 focus:outline-none"
            >
              <option value={1}>Học kỳ 1</option>
              <option value={2}>Học kỳ 2</option>
            </select>
          </div>

          <span className="text-xs text-slate-400">
            Môn học: <strong className="text-cyan-300">Toán học</strong>
          </span>
        </div>

        <span className="text-xs text-slate-400">
          Công thức: ĐTB = (Miệng + 15P + GK&times;2 + CK&times;3) / Tổng hệ số
        </span>
      </div>

      {/* Gradebook Table */}
      <div className="bg-[#041527] rounded-xl border border-[#0e3d54] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#051c33] border-b border-[#0e3d54] text-cyan-300 font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-3 py-2.5 text-center">STT</th>
                <th className="px-3 py-2.5 min-w-[150px]">Họ và tên</th>
                <th className="px-3 py-2.5 text-center">Mã HS</th>
                <th className="px-3 py-2.5 text-center">Miệng 1</th>
                <th className="px-3 py-2.5 text-center">Miệng 2</th>
                <th className="px-3 py-2.5 text-center">15P 1</th>
                <th className="px-3 py-2.5 text-center">15P 2</th>
                <th className="px-3 py-2.5 text-center font-bold">Giữa kỳ (x2)</th>
                <th className="px-3 py-2.5 text-center font-bold">Cuối kỳ (x3)</th>
                <th className="px-3 py-2.5 text-center bg-cyan-950/80 text-cyan-300 font-bold border-l border-[#0e3d54]">ĐTB Môn</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#0e3d54]/70">
              {grades.map((gr, idx) => (
                <tr key={gr.id} className="hover:bg-[#06203a] transition-colors">
                  <td className="px-3 py-2 text-slate-400 font-semibold tabular-nums text-center">
                    {idx + 1}
                  </td>
                  <td className="px-3 py-2 font-bold text-white">{gr.studentName}</td>
                  <td className="px-3 py-2 font-mono text-slate-400 text-center">{gr.studentCode}</td>
                  <td className="px-2 py-1 text-center">
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="10"
                      value={gr.oral1 ?? ''}
                      onChange={e => handleCellChange(gr.id, 'oral1', e.target.value)}
                      className="w-12 text-center py-1 border border-[#0e3d54] rounded bg-[#020e1a] text-white focus:border-cyan-400 text-xs tabular-nums focus:outline-none"
                    />
                  </td>
                  <td className="px-2 py-1 text-center">
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="10"
                      value={gr.oral2 ?? ''}
                      onChange={e => handleCellChange(gr.id, 'oral2', e.target.value)}
                      className="w-12 text-center py-1 border border-[#0e3d54] rounded bg-[#020e1a] text-white focus:border-cyan-400 text-xs tabular-nums focus:outline-none"
                    />
                  </td>
                  <td className="px-2 py-1 text-center">
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="10"
                      value={gr.test15m1 ?? ''}
                      onChange={e => handleCellChange(gr.id, 'test15m1', e.target.value)}
                      className="w-12 text-center py-1 border border-[#0e3d54] rounded bg-[#020e1a] text-white focus:border-cyan-400 text-xs tabular-nums focus:outline-none"
                    />
                  </td>
                  <td className="px-2 py-1 text-center">
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="10"
                      value={gr.test15m2 ?? ''}
                      onChange={e => handleCellChange(gr.id, 'test15m2', e.target.value)}
                      className="w-12 text-center py-1 border border-[#0e3d54] rounded bg-[#020e1a] text-white focus:border-cyan-400 text-xs tabular-nums focus:outline-none"
                    />
                  </td>
                  <td className="px-2 py-1 text-center">
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="10"
                      value={gr.midterm ?? ''}
                      onChange={e => handleCellChange(gr.id, 'midterm', e.target.value)}
                      className="w-12 text-center py-1 border border-[#0e3d54] rounded bg-[#020e1a] text-white focus:border-cyan-400 text-xs font-semibold tabular-nums focus:outline-none"
                    />
                  </td>
                  <td className="px-2 py-1 text-center">
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="10"
                      value={gr.finalTerm ?? ''}
                      onChange={e => handleCellChange(gr.id, 'finalTerm', e.target.value)}
                      className="w-12 text-center py-1 border border-[#0e3d54] rounded bg-[#020e1a] text-white focus:border-cyan-400 text-xs font-semibold tabular-nums focus:outline-none"
                    />
                  </td>
                  <td className="px-3 py-2 text-center font-bold tabular-nums bg-cyan-950/60 text-cyan-300 border-l border-[#0e3d54]">
                    {gr.averageScore ?? '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
