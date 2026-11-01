import React, { useState, useEffect } from 'react';
import {
  ClipboardCheck,
  Calendar,
  Save,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Search,
  Filter
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { Breadcrumb } from '../../components/common/Breadcrumb';
import { db } from '../../services/db';
import { Classroom, Student, AttendanceStatus } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';

export const AttendancePage: React.FC = () => {
  const { activeClassId, currentUser } = useAuth();
  const { showToast } = useToast();

  const [classes, setClasses] = useState<Classroom[]>([]);
  const [selectedClassId, setSelectedClassId] = useState(activeClassId || 'class_10a1');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [period, setPeriod] = useState(1);
  const [students, setStudents] = useState<Student[]>([]);
  const [records, setRecords] = useState<{ [id: string]: { status: AttendanceStatus; note: string } }>({});

  useEffect(() => {
    setClasses(db.getClasses());
  }, []);

  useEffect(() => {
    const list = db.getStudents(selectedClassId);
    setStudents(list);

    const session = db.getAttendanceSessionByDate(selectedClassId, date);
    const map: { [id: string]: { status: AttendanceStatus; note: string } } = {};
    if (session) {
      session.records.forEach(r => {
        map[r.studentId] = { status: r.status, note: r.note || '' };
      });
    } else {
      list.forEach(st => {
        map[st.id] = { status: 'present', note: '' };
      });
    }
    setRecords(map);
  }, [selectedClassId, date]);

  const handleStatusChange = (stId: string, status: AttendanceStatus) => {
    setRecords(prev => ({
      ...prev,
      [stId]: { ...prev[stId], status }
    }));
  };

  const handleMarkAll = () => {
    const map: { [id: string]: { status: AttendanceStatus; note: string } } = {};
    students.forEach(st => {
      map[st.id] = { status: 'present', note: '' };
    });
    setRecords(map);
    showToast('Đã đánh dấu tất cả có mặt!', 'info');
  };

  const handleSave = () => {
    const recList = students.map(st => ({
      id: `ar_${st.id}`,
      studentId: st.id,
      studentName: st.fullName,
      rollNumber: st.rollNumber,
      status: records[st.id]?.status || 'present',
      note: records[st.id]?.note || '',
    }));

    const summary = {
      total: recList.length,
      present: recList.filter(r => r.status === 'present').length,
      absentExcused: recList.filter(r => r.status === 'absent_excused').length,
      absentUnexcused: recList.filter(r => r.status === 'absent_unexcused').length,
      late: recList.filter(r => r.status === 'late').length,
      earlyLeave: recList.filter(r => r.status === 'early_leave').length,
    };

    const cls = db.getClassById(selectedClassId);
    db.saveAttendanceSession({
      classId: selectedClassId,
      className: cls?.name || '10A1',
      date,
      period,
      sessionType: 'morning',
      takenByTeacherId: currentUser?.id || 'user_teacher_1',
      takenByTeacherName: currentUser?.fullName || 'Cô Nguyễn Thị Mai',
      records: recList,
      summary,
    });

    showToast('Lưu điểm danh thành công!', 'success');
  };

  const present = Object.values(records).filter(r => r.status === 'present').length;
  const absentEx = Object.values(records).filter(r => r.status === 'absent_excused').length;
  const absentUn = Object.values(records).filter(r => r.status === 'absent_unexcused').length;
  const late = Object.values(records).filter(r => r.status === 'late').length;

  return (
    <div className="space-y-4 text-slate-100">
      <PageHeader
        breadcrumbItems={[
          { label: 'Lớp học' },
          { label: 'Điểm danh hằng ngày' },
        ]}
        title="Sổ Điểm danh Trực tuyến"
        action={
          <button
            onClick={handleSave}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold shadow-sm shadow-emerald-950 transition-colors cursor-pointer border border-emerald-500/40"
          >
            <Save className="w-4 h-4" />
            <span>Lưu điểm danh</span>
          </button>
        }
      />

      {/* Class and Date selector toolbar */}
      <div className="bg-[#041527] p-4 rounded-xl border border-[#0e3d54] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
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
            <span className="text-xs font-semibold text-slate-400">Ngày:</span>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="px-2.5 py-1.5 border border-[#0e3d54] rounded-lg text-xs font-semibold text-white bg-[#020e1a] focus:border-cyan-400 focus:outline-none"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleMarkAll}
            className="px-3 py-1.5 bg-[#03172c] hover:bg-[#07243e] text-cyan-300 border border-[#0e3d54] text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            Tất cả có mặt
          </button>
        </div>
      </div>

      {/* KPI Ribbon - Đưa lên cùng 1 dòng ngang duy nhất */}
      <div className="bg-[#041527] p-3.5 rounded-xl border border-[#0e3d54] shadow-xs">
        <div className="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[#0e3d54]/70 items-center text-xs">
          <div className="flex items-center justify-between sm:justify-start sm:gap-3 px-3 py-1">
            <span className="text-slate-400 font-medium">Có mặt:</span>
            <span className="text-sm font-bold text-emerald-400 tabular-nums">{present} / {students.length}</span>
          </div>
          <div className="flex items-center justify-between sm:justify-start sm:gap-3 px-3 py-1">
            <span className="text-slate-400 font-medium">Vắng có phép:</span>
            <span className="text-sm font-bold text-amber-400 tabular-nums">{absentEx}</span>
          </div>
          <div className="flex items-center justify-between sm:justify-start sm:gap-3 px-3 py-1">
            <span className="text-slate-400 font-medium">Vắng không phép:</span>
            <span className="text-sm font-bold text-rose-400 tabular-nums">{absentUn}</span>
          </div>
          <div className="flex items-center justify-between sm:justify-start sm:gap-3 px-3 py-1">
            <span className="text-slate-400 font-medium">Đi trễ:</span>
            <span className="text-sm font-bold text-cyan-400 tabular-nums">{late}</span>
          </div>
        </div>
      </div>

      {/* Attendance List */}
      <div className="bg-[#041527] rounded-xl border border-[#0e3d54] overflow-hidden shadow-sm divide-y divide-[#0e3d54]/70">
        {students.map(st => {
          const currentStatus = records[st.id]?.status || 'present';
          return (
            <div
              key={st.id}
              className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#06203a] transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="w-6 text-xs font-bold text-slate-400 tabular-nums text-center">
                  {st.rollNumber}
                </span>
                <img
                  src={st.avatarUrl}
                  alt={st.fullName}
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-[#0e3d54]"
                />
                <div>
                  <div className="font-bold text-white text-xs">{st.fullName}</div>
                  <div className="text-[11px] text-slate-400">{st.studentCode} · {st.team}</div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto">
                <button
                  onClick={() => handleStatusChange(st.id, 'present')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    currentStatus === 'present'
                      ? 'bg-emerald-600 text-white font-bold shadow-xs'
                      : 'bg-[#020e1a] text-slate-300 hover:bg-[#07243e] border border-[#0e3d54]'
                  }`}
                >
                  Có mặt
                </button>
                <button
                  onClick={() => handleStatusChange(st.id, 'absent_excused')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    currentStatus === 'absent_excused'
                      ? 'bg-amber-600 text-white font-bold shadow-xs'
                      : 'bg-[#020e1a] text-slate-300 hover:bg-[#07243e] border border-[#0e3d54]'
                  }`}
                >
                  Vắng có phép
                </button>
                <button
                  onClick={() => handleStatusChange(st.id, 'absent_unexcused')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    currentStatus === 'absent_unexcused'
                      ? 'bg-rose-600 text-white font-bold shadow-xs'
                      : 'bg-[#020e1a] text-slate-300 hover:bg-[#07243e] border border-[#0e3d54]'
                  }`}
                >
                  Vắng không phép
                </button>
                <button
                  onClick={() => handleStatusChange(st.id, 'late')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    currentStatus === 'late'
                      ? 'bg-[#0284c7] text-white font-bold shadow-xs'
                      : 'bg-[#020e1a] text-slate-300 hover:bg-[#07243e] border border-[#0e3d54]'
                  }`}
                >
                  Đi trễ
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
