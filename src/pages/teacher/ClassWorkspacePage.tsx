import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Users,
  ClipboardCheck,
  FileText,
  TrendingUp,
  Award,
  Calendar,
  BarChart3,
  Plus,
  Save,
  CheckCircle2,
  AlertCircle,
  Clock,
  Search,
  Filter,
  Download,
  Share2,
  Trash2,
  Edit2,
  Eye,
  Sparkles,
  ChevronRight,
  UserPlus,
  Compass,
  X,
  Maximize2,
  Upload,
  FileSpreadsheet
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { Breadcrumb } from '../../components/common/Breadcrumb';
import { StatCard } from '../../components/common/StatCard';
import { EmptyState } from '../../components/common/EmptyState';
import { Modal } from '../../components/common/Modal';
import { AddSingleStudentModal } from '../../components/students/AddSingleStudentModal';
import { ImportExcelStudentsModal } from '../../components/students/ImportExcelStudentsModal';
import { EditStudentModal } from '../../components/students/EditStudentModal';
import { DeleteStudentModal } from '../../components/students/DeleteStudentModal';
import { db } from '../../services/db';
import { Classroom, Student, AttendanceStatus, StudentGradeRecord, Assignment, BehaviorRecord } from '../../types';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';

export interface ClassWorkspaceProps {
  classIdProp?: string;
  isModal?: boolean;
  onClose?: () => void;
  initialTab?: string;
}

export const ClassWorkspacePage: React.FC<ClassWorkspaceProps> = ({
  classIdProp,
  isModal = false,
  onClose,
  initialTab,
}) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { showToast } = useToast();
  const { currentUser, setActiveClassId } = useAuth();

  const tabQuery = initialTab || searchParams.get('tab');
  const validTabs = ['overview', 'students', 'attendance', 'assignments', 'grades', 'behavior', 'schedule', 'reports'];

  const [currentClass, setCurrentClass] = useState<Classroom | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'students' | 'attendance' | 'assignments' | 'grades' | 'behavior' | 'schedule' | 'reports'>(
    validTabs.includes(tabQuery || '') ? (tabQuery as any) : 'overview'
  );

  useEffect(() => {
    if (tabQuery && validTabs.includes(tabQuery)) {
      setActiveTab(tabQuery as any);
    }
  }, [tabQuery]);

  // Tab 2: Students state
  const [students, setStudents] = useState<Student[]>([]);
  const [studentSearch, setStudentSearch] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [deletingStudent, setDeletingStudent] = useState<Student | null>(null);
  const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState(false);
  const [isImportStudentModalOpen, setIsImportStudentModalOpen] = useState(false);

  const handleConfirmDeleteStudent = (studentToDelete: Student) => {
    const res = db.deleteStudent(studentToDelete.id);
    if (res.success) {
      showToast(`Đã xóa học sinh ${studentToDelete.fullName} thành công!`, 'success');
      loadClassData(classId);
    } else {
      showToast(res.message || 'Không thể xóa học sinh', 'error');
    }
  };

  // Tab 3: Attendance state
  const [attendanceDate, setAttendanceDate] = useState('2025-02-20');
  const [attendanceRecords, setAttendanceRecords] = useState<{ [studentId: string]: { status: AttendanceStatus; note: string } }>({});
  const [attendanceDirty, setAttendanceDirty] = useState(false);

  // Tab 4: Assignments state
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isCreateAsgModalOpen, setIsCreateAsgModalOpen] = useState(false);
  const [asgTitle, setAsgTitle] = useState('');
  const [asgDesc, setAsgDesc] = useState('');
  const [asgDueDate, setAsgDueDate] = useState('2025-03-01T23:59');

  // Tab 5: Gradebook state
  const [gradeRecords, setGradeRecords] = useState<StudentGradeRecord[]>([]);
  const [gradesDirty, setGradesDirty] = useState(false);

  // Tab 6: Behavior state
  const [behaviors, setBehaviors] = useState<BehaviorRecord[]>([]);
  const [isLogBehaviorModalOpen, setIsLogBehaviorModalOpen] = useState(false);
  const [behaviorStudentId, setBehaviorStudentId] = useState('');
  const [behaviorType, setBehaviorType] = useState<'positive' | 'negative'>('positive');
  const [behaviorCategory, setBehaviorCategory] = useState('Phát biểu xây dựng bài tích cực');
  const [behaviorPoints, setBehaviorPoints] = useState(5);
  const [behaviorNote, setBehaviorNote] = useState('');

  const classId = classIdProp || id || 'class_10a1';

  // Load class data
  useEffect(() => {
    const cls = db.getClassById(classId);
    if (cls) {
      setCurrentClass(cls);
      setActiveClassId(cls.id);
      loadClassData(cls.id);
    }
  }, [classId]);

  const loadClassData = (targetId: string) => {
    const stds = db.getStudents(targetId);
    setStudents(stds);
    setAssignments(db.getAssignments(targetId));
    setGradeRecords(db.getGrades(targetId));
    setBehaviors(db.getBehaviors(targetId));

    // Initialize attendance records
    const session = db.getAttendanceSessionByDate(targetId, attendanceDate);
    const initialAtt: { [studentId: string]: { status: AttendanceStatus; note: string } } = {};
    if (session) {
      session.records.forEach(r => {
        initialAtt[r.studentId] = { status: r.status, note: r.note || '' };
      });
    } else {
      stds.forEach(st => {
        initialAtt[st.id] = { status: 'present', note: '' };
      });
    }
    setAttendanceRecords(initialAtt);
    setAttendanceDirty(false);
  };

  if (!currentClass) {
    return (
      <EmptyState
        title="Không tìm thấy lớp học"
        description="Lớp học này có thể đã bị xóa hoặc không tồn tại trong hệ thống."
        action={
          <button
            onClick={() => navigate('/teacher/classes')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold"
          >
            Quay lại danh sách lớp
          </button>
        }
      />
    );
  }

  // Attendance handlers
  const handleMarkAllPresent = () => {
    const nextAtt: { [studentId: string]: { status: AttendanceStatus; note: string } } = {};
    students.forEach(st => {
      nextAtt[st.id] = { status: 'present', note: '' };
    });
    setAttendanceRecords(nextAtt);
    setAttendanceDirty(true);
    showToast('Đã đánh dấu tất cả học sinh có mặt', 'info');
  };

  const handleUpdateStudentAttendance = (studentId: string, status: AttendanceStatus) => {
    setAttendanceRecords(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status,
      },
    }));
    setAttendanceDirty(true);
  };

  const handleSaveAttendance = () => {
    const records = students.map(st => {
      const att = attendanceRecords[st.id] || { status: 'present', note: '' };
      return {
        id: `ar_${st.id}`,
        studentId: st.id,
        studentName: st.fullName,
        rollNumber: st.rollNumber,
        status: att.status,
        note: att.note,
      };
    });

    const summary = {
      total: records.length,
      present: records.filter(r => r.status === 'present').length,
      absentExcused: records.filter(r => r.status === 'absent_excused').length,
      absentUnexcused: records.filter(r => r.status === 'absent_unexcused').length,
      late: records.filter(r => r.status === 'late').length,
      earlyLeave: records.filter(r => r.status === 'early_leave').length,
    };

    db.saveAttendanceSession({
      classId: currentClass.id,
      className: currentClass.name,
      date: attendanceDate,
      period: 1,
      sessionType: 'morning',
      takenByTeacherId: currentUser?.id || 'user_teacher_1',
      takenByTeacherName: currentUser?.fullName || 'Cô Nguyễn Thị Mai',
      records,
      summary,
    });

    setAttendanceDirty(false);
    showToast(`Đã lưu điểm danh ngày ${attendanceDate} cho lớp ${currentClass.name}`, 'success');
  };

  // Create Assignment handler
  const handleCreateAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!asgTitle.trim()) return;

    const newAsg = db.createAssignment({
      classId: currentClass.id,
      className: currentClass.name,
      subjectId: 'sub_math',
      subjectName: 'Toán học',
      title: asgTitle.trim(),
      description: asgDesc.trim() || 'Bài tập thực hành rèn luyện kỹ năng',
      dueDate: new Date(asgDueDate).toISOString(),
      points: 10,
      status: 'published',
      createdByTeacherId: currentUser?.id || 'user_teacher_1',
      target: 'all',
      totalStudents: students.length,
    });

    setAssignments(prev => [newAsg, ...prev]);
    setIsCreateAsgModalOpen(false);
    setAsgTitle('');
    setAsgDesc('');
    showToast(`Đã giao bài tập mới: ${newAsg.title}`, 'success');
  };

  // Grade cell update handler
  const handleGradeCellChange = (recordId: string, field: keyof StudentGradeRecord, value: string) => {
    const num = value === '' ? undefined : parseFloat(value);
    setGradeRecords(prev =>
      prev.map(r => (r.id === recordId ? { ...r, [field]: num } : r))
    );
    setGradesDirty(true);
  };

  const handleSaveGrades = () => {
    db.batchSaveGrades(gradeRecords);
    setGradesDirty(false);
    showToast('Đã lưu cập nhật sổ điểm thành công', 'success');
  };

  // Log behavior handler
  const handleSaveBehavior = (e: React.FormEvent) => {
    e.preventDefault();
    if (!behaviorStudentId) {
      showToast('Vui lòng chọn học sinh!', 'warning');
      return;
    }
    const student = students.find(s => s.id === behaviorStudentId);
    if (!student) return;

    const delta = behaviorType === 'positive' ? Math.abs(behaviorPoints) : -Math.abs(behaviorPoints);
    const newBh = db.addBehavior({
      studentId: student.id,
      studentName: student.fullName,
      classId: currentClass.id,
      type: behaviorType,
      category: behaviorCategory,
      pointsDelta: delta,
      note: behaviorNote || behaviorCategory,
      recordedByTeacherName: currentUser?.fullName || 'Giáo viên',
      date: new Date().toISOString().split('T')[0],
    });

    setBehaviors(prev => [newBh, ...prev]);
    setIsLogBehaviorModalOpen(false);
    setBehaviorNote('');
    showToast(`Đã ghi nhận nề nếp cho ${student.fullName} (${delta > 0 ? '+' : ''}${delta} điểm)`, 'success');
  };

  // Attendance metrics summary
  const presentCount = Object.values(attendanceRecords).filter(r => r.status === 'present').length;
  const absentExcusedCount = Object.values(attendanceRecords).filter(r => r.status === 'absent_excused').length;
  const absentUnexcusedCount = Object.values(attendanceRecords).filter(r => r.status === 'absent_unexcused').length;
  const lateCount = Object.values(attendanceRecords).filter(r => r.status === 'late').length;

  return (
    <div className={`space-y-5 ${isModal ? 'h-full flex flex-col overflow-hidden bg-slate-50' : ''}`}>
      {/* If modal, show top title bar with Close and Maximize actions */}
      {isModal ? (
        <div className="bg-white border-b border-slate-200 px-5 py-3 flex items-center justify-between shrink-0 shadow-2xs">
          <div className="flex items-center gap-3">
            <span
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-base shadow-xs shrink-0"
              style={{ backgroundColor: currentClass.color }}
            >
              {currentClass.name}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  Không gian làm việc Lớp {currentClass.name}
                </h2>
                <span className="text-[11px] font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-semibold">
                  {currentClass.joinCode}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-500 mt-0.5">
                <span>Khối {currentClass.gradeLevel}</span>
                <span>·</span>
                <span>Phòng {currentClass.roomNumber}</span>
                <span>·</span>
                <span>Sĩ số: <strong className="text-slate-700 font-semibold">{students.length} HS</strong></span>
                <span>·</span>
                <span>GVCN: <span className="font-semibold text-slate-700">{currentClass.homeroomTeacherName}</span></span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                if (onClose) onClose();
                navigate(`/teacher/classes/${currentClass.id}?tab=${activeTab}`);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
              title="Mở toàn màn hình dạng trang riêng biệt"
            >
              <Maximize2 className="w-3.5 h-3.5 text-blue-600" />
              <span className="hidden sm:inline">Toàn trang</span>
            </button>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                title="Đóng cửa sổ"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Hàng trên cùng: Breadcrumb bên trái • Tên màn hình trên cùng 1 hàng, các nút thao tác bên phải theo đúng mẫu */
        <PageHeader
          breadcrumbItems={[
            { label: 'Lớp học', href: '/teacher/classes' },
            { label: `Lớp ${currentClass.name}` },
          ]}
          title={`Không gian Lớp ${currentClass.name}`}
          action={
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono bg-[#031526] border border-[#0e3d54] text-cyan-300 px-2.5 py-1 rounded-lg">
                Mã: {currentClass.joinCode}
              </span>
              <button
                onClick={() => setActiveTab('attendance')}
                className="px-3 py-1.5 bg-[#0284c7] hover:bg-[#0369a1] text-white rounded-lg text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer border border-cyan-500/40"
              >
                <ClipboardCheck className="w-3.5 h-3.5" />
                <span>Điểm danh</span>
              </button>
              <button
                onClick={() => navigate('/teacher/tools/wheel')}
                className="px-3 py-1.5 bg-[#041527] border border-[#0e3d54] hover:bg-[#072540] text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Compass className="w-3.5 h-3.5 text-purple-400" />
                <span>Vòng quay</span>
              </button>
            </div>
          }
        />
      )}

      {/* Main workspace inner content area */}
      <div className={isModal ? 'flex-1 overflow-y-auto px-4 sm:px-6 pb-6 space-y-4' : 'space-y-4'}>
        {/* Class Sub-info Banner & Tabs */}
        <div className="bg-[#041527] rounded-xl border border-[#0e3d54] p-3 sm:p-4 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3">
              <span
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-base shadow-xs shrink-0"
                style={{ backgroundColor: currentClass.color }}
              >
                {currentClass.name}
              </span>
              <div>
                <p className="text-xs text-slate-300 font-medium">
                  Khối {currentClass.gradeLevel} · Phòng {currentClass.roomNumber} · GVCN: {currentClass.homeroomTeacherName} · Sĩ số: <strong className="text-white">{students.length} học sinh</strong>
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Năm học 2024 - 2025 · Học kỳ 2
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('assignments')}
                className="px-2.5 py-1.5 bg-[#03172c] border border-[#0e3d54] hover:bg-[#06203a] text-slate-300 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <FileText className="w-3.5 h-3.5 text-cyan-400" />
                <span>Giao bài</span>
              </button>
              <button
                onClick={() => setActiveTab('grades')}
                className="px-2.5 py-1.5 bg-[#03172c] border border-[#0e3d54] hover:bg-[#06203a] text-slate-300 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Award className="w-3.5 h-3.5 text-amber-400" />
                <span>Sổ điểm</span>
              </button>
            </div>
          </div>

          {/* Workspace Navigation Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto border-t border-slate-100 mt-4 pt-2 scrollbar-none text-xs font-medium">
            {[
              { id: 'overview', label: 'Tổng quan', icon: <BarChart3 className="w-3.5 h-3.5" /> },
              { id: 'students', label: `Học sinh (${students.length})`, icon: <Users className="w-3.5 h-3.5" /> },
              { id: 'attendance', label: 'Điểm danh', icon: <ClipboardCheck className="w-3.5 h-3.5" /> },
              { id: 'assignments', label: `Bài tập (${assignments.length})`, icon: <FileText className="w-3.5 h-3.5" /> },
              { id: 'grades', label: 'Sổ điểm', icon: <TrendingUp className="w-3.5 h-3.5" /> },
              { id: 'behavior', label: 'Thi đua & Nề nếp', icon: <Award className="w-3.5 h-3.5" /> },
              { id: 'schedule', label: 'Thời khóa biểu', icon: <Calendar className="w-3.5 h-3.5" /> },
              { id: 'reports', label: 'Báo cáo', icon: <BarChart3 className="w-3.5 h-3.5" /> },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-blue-50 text-blue-700 font-semibold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

      {/* ========================================================= */}
      {/* TAB 1: TỔNG QUAN                                          */}
      {/* ========================================================= */}
      {activeTab === 'overview' && (
        <div className="space-y-5">
          {/* Prompt banner to add students if class has 0 students */}
          {students.length === 0 && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/90 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
              <div>
                <h4 className="text-sm font-bold text-blue-900 flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-600" />
                  <span>Lớp học chưa có học sinh nào</span>
                </h4>
                <p className="text-xs text-blue-700/90 mt-0.5">
                  Bắt đầu quản lý lớp bằng cách thêm từng học sinh hoặc import danh sách hàng loạt từ file Excel.
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsAddStudentModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                  title="Thêm từng học sinh thủ công"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Thêm từng học sinh</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsImportStudentModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-blue-300 hover:bg-blue-50 text-blue-800 rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                  title="Import danh sách học sinh từ file Excel / CSV"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Import Excel</span>
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard
              label="Sĩ số lớp"
              value={students.length}
              subtext="Đủ điều kiện lên lớp"
              icon={<Users className="w-5 h-5 text-blue-500" />}
            />
            <StatCard
              label="Chuyên cần hôm nay"
              value={`${presentCount}/${students.length}`}
              subtext={`Vắng: ${absentExcusedCount + absentUnexcusedCount} · Muộn: ${lateCount}`}
              icon={<CheckCircle2 className="w-5 h-5 text-emerald-500" />}
            />
            <StatCard
              label="Bài tập đang giao"
              value={assignments.length}
              subtext="2 bài cần chấm"
              icon={<FileText className="w-5 h-5 text-purple-500" />}
            />
            <StatCard
              label="Điểm trung bình lớp"
              value="8.4"
              subtext="Môn Toán học kỳ 2"
              icon={<TrendingUp className="w-5 h-5 text-amber-500" />}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200/90 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900">Bài tập gần đây của lớp</h3>
                <button
                  onClick={() => setActiveTab('assignments')}
                  className="text-xs text-blue-600 font-semibold hover:underline"
                >
                  Xem tất cả
                </button>
              </div>

              <div className="space-y-3">
                {assignments.map(asg => (
                  <div
                    key={asg.id}
                    className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/60 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-semibold text-slate-900 text-xs">{asg.title}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Hạn nộp: {new Date(asg.dueDate).toLocaleDateString('vi-VN')} · Đã nộp: {asg.submissionCount}/{students.length} HS
                      </div>
                    </div>
                    <span className="text-xs font-semibold px-2 py-1 rounded bg-white border border-slate-200 text-slate-700">
                      {asg.status === 'published' ? 'Đang giao' : 'Bản nháp'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200/90 p-5 space-y-3">
              <h3 className="text-sm font-bold text-slate-900">Ban cán sự lớp 10A1</h3>
              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-800">Trần Bảo Anh</div>
                    <div className="text-slate-400 text-[11px]">Lớp trưởng</div>
                  </div>
                  <span className="text-emerald-600 font-semibold">9.5 ĐTB</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-800">Nguyễn Hoàng Nam</div>
                    <div className="text-slate-400 text-[11px]">Lớp phó học tập</div>
                  </div>
                  <span className="text-blue-600 font-semibold">8.7 ĐTB</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-800">Phạm Quỳnh Chi</div>
                    <div className="text-slate-400 text-[11px]">Lớp phó phong trào</div>
                  </div>
                  <span className="text-purple-600 font-semibold">9.1 ĐTB</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: HỌC SINH                                           */}
      {/* ========================================================= */}
      {activeTab === 'students' && (
        <div className="space-y-4">
          <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm học sinh theo tên, mã HS, phụ huynh..."
                value={studentSearch}
                onChange={e => setStudentSearch(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center gap-2">
              {/* CÁCH 1: THÊM TỪNG HỌC SINH */}
              <button
                type="button"
                onClick={() => setIsAddStudentModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                title="Thêm từng học sinh mới vào lớp"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Thêm từng học sinh</span>
              </button>

              {/* CÁCH 2: IMPORT EXCEL / CSV */}
              <button
                type="button"
                onClick={() => setIsImportStudentModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                title="Import danh sách học sinh từ file Excel / CSV"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                <span>Import Excel</span>
              </button>
            </div>
          </div>

          {/* Students Data Table or Empty State */}
          {students.length === 0 ? (
            <div className="bg-white rounded-xl border border-dashed border-slate-300 p-8 sm:p-12 text-center flex flex-col items-center justify-center shadow-2xs">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3.5 shadow-2xs">
                <Users className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-slate-800">
                Lớp {currentClass.name} chưa có học sinh nào
              </h3>
              <p className="text-xs text-slate-500 max-w-md mt-1 mb-5">
                Vui lòng chọn 1 trong 2 cách bên dưới để nhập danh sách học sinh vào lớp học:
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddStudentModalOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Cách 1: Thêm từng học sinh</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsImportStudentModalOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  <span>Cách 2: Import file Excel</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200/90 overflow-hidden shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="px-4 py-3">STT</th>
                      <th className="px-4 py-3">Học sinh</th>
                      <th className="px-4 py-3">Mã HS</th>
                      <th className="px-4 py-3">Giới tính</th>
                      <th className="px-4 py-3">Phụ huynh liên hệ</th>
                      <th className="px-4 py-3">ĐTB</th>
                      <th className="px-4 py-3">Chuyên cần</th>
                      <th className="px-4 py-3 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {students
                      .filter(s =>
                        s.fullName.toLowerCase().includes(studentSearch.toLowerCase()) ||
                        s.studentCode.toLowerCase().includes(studentSearch.toLowerCase()) ||
                        s.team.toLowerCase().includes(studentSearch.toLowerCase()) ||
                        (s.parentName && s.parentName.toLowerCase().includes(studentSearch.toLowerCase())) ||
                        (s.parentPhone && s.parentPhone.toLowerCase().includes(studentSearch.toLowerCase()))
                      )
                      .length === 0 ? (
                      <tr>
                        <td colSpan={8} className="px-4 py-8 text-center text-slate-400">
                          Không tìm thấy học sinh nào phù hợp với từ khóa "{studentSearch}"
                        </td>
                      </tr>
                    ) : (
                      students
                        .filter(s =>
                          s.fullName.toLowerCase().includes(studentSearch.toLowerCase()) ||
                          s.studentCode.toLowerCase().includes(studentSearch.toLowerCase()) ||
                          s.team.toLowerCase().includes(studentSearch.toLowerCase()) ||
                          (s.parentName && s.parentName.toLowerCase().includes(studentSearch.toLowerCase())) ||
                          (s.parentPhone && s.parentPhone.toLowerCase().includes(studentSearch.toLowerCase()))
                        )
                        .map(st => (
                          <tr
                            key={st.id}
                            onClick={() => setSelectedStudent(st)}
                            className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                          >
                            <td className="px-4 py-3 font-semibold text-slate-400 tabular-nums">
                              {st.rollNumber}
                            </td>
                            <td className="px-4 py-3 font-bold text-slate-900 flex items-center gap-2.5">
                              <img
                                src={st.avatarUrl}
                                alt={st.fullName}
                                className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-200"
                              />
                              <span>{st.fullName}</span>
                            </td>
                            <td className="px-4 py-3 font-mono text-slate-500">{st.studentCode}</td>
                            <td className="px-4 py-3 text-slate-700">{st.gender}</td>
                            <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                              <div className="font-medium text-slate-900 flex items-center gap-1">
                                <span>{st.parentName || 'Chưa cập nhật'}</span>
                                <span className="text-[10px] px-1 py-0.2 rounded bg-blue-50 text-blue-700 font-semibold">
                                  {st.parentRelationship || 'Bố'}
                                </span>
                              </div>
                              <div className="text-[11px] font-mono text-slate-500">
                                {st.parentPhone || '—'}
                              </div>
                            </td>
                            <td className="px-4 py-3 font-bold tabular-nums text-slate-800">{st.gpa}</td>
                            <td className="px-4 py-3 tabular-nums font-semibold">{st.attendanceRate}%</td>
                            <td className="px-4 py-3 text-right" onClick={e => e.stopPropagation()}>
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  type="button"
                                  onClick={() => setSelectedStudent(st)}
                                  className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                                  title="Xem toàn bộ thông tin chi tiết học sinh"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditingStudent(st)}
                                  className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                                  title="Sửa thông tin học sinh"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setDeletingStudent(st)}
                                  className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                  title="Xóa học sinh (Có kiểm tra ràng buộc nghiệp vụ)"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: ĐIỂM DANH                                          */}
      {/* ========================================================= */}
      {activeTab === 'attendance' && (
        <div className="space-y-4">
          {/* Attendance Controls Bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200/90 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 sticky top-16 z-20 shadow-xs">
            <div className="flex items-center gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-0.5">
                  Ngày điểm danh
                </label>
                <input
                  type="date"
                  value={attendanceDate}
                  onChange={e => {
                    setAttendanceDate(e.target.value);
                    const session = db.getAttendanceSessionByDate(currentClass.id, e.target.value);
                    if (session) {
                      const initialAtt: { [studentId: string]: { status: AttendanceStatus; note: string } } = {};
                      session.records.forEach(r => {
                        initialAtt[r.studentId] = { status: r.status, note: r.note || '' };
                      });
                      setAttendanceRecords(initialAtt);
                    }
                  }}
                  className="px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 bg-white"
                />
              </div>

              {/* Real-time Summary Pills */}
              <div className="hidden sm:flex items-center gap-2 text-xs font-semibold">
                <span className="text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 tabular-nums">
                  Có mặt: {presentCount}
                </span>
                <span className="text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200 tabular-nums">
                  Vắng CP: {absentExcusedCount}
                </span>
                <span className="text-rose-700 bg-rose-50 px-2.5 py-1 rounded-md border border-rose-200 tabular-nums">
                  Vắng KP: {absentUnexcusedCount}
                </span>
                <span className="text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200 tabular-nums">
                  Muộn: {lateCount}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleMarkAllPresent}
                className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Đánh dấu tất cả có mặt
              </button>
              <button
                type="button"
                onClick={handleSaveAttendance}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs flex items-center gap-1.5 transition-colors"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Lưu điểm danh</span>
              </button>
            </div>
          </div>

          {/* Attendance Student Grid */}
          <div className="bg-white rounded-xl border border-slate-200/90 overflow-hidden">
            <div className="divide-y divide-slate-100">
              {students.map(st => {
                const currentStatus = attendanceRecords[st.id]?.status || 'present';
                return (
                  <div
                    key={st.id}
                    className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/60 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 text-xs font-bold text-slate-400 tabular-nums text-center">
                        {st.rollNumber}
                      </span>
                      <img
                        src={st.avatarUrl}
                        alt={st.fullName}
                        className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200"
                      />
                      <div>
                        <div className="font-bold text-slate-900 text-xs">{st.fullName}</div>
                        <div className="text-[11px] text-slate-500 font-mono">{st.studentCode} · {st.team}</div>
                      </div>
                    </div>

                    {/* Quick status selector buttons */}
                    <div className="flex items-center gap-1.5 overflow-x-auto">
                      <button
                        type="button"
                        onClick={() => handleUpdateStudentAttendance(st.id, 'present')}
                        className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors ${
                          currentStatus === 'present'
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        Có mặt
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUpdateStudentAttendance(st.id, 'absent_excused')}
                        className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors ${
                          currentStatus === 'absent_excused'
                            ? 'bg-amber-600 text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        Vắng CP
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUpdateStudentAttendance(st.id, 'absent_unexcused')}
                        className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors ${
                          currentStatus === 'absent_unexcused'
                            ? 'bg-rose-600 text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        Vắng KP
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUpdateStudentAttendance(st.id, 'late')}
                        className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors ${
                          currentStatus === 'late'
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
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
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 4: BÀI TẬP                                            */}
      {/* ========================================================= */}
      {activeTab === 'assignments' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Danh sách bài tập của lớp ({assignments.length})</h3>
            <button
              onClick={() => setIsCreateAsgModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Giao bài tập mới</span>
            </button>
          </div>

          <div className="space-y-3">
            {assignments.length === 0 ? (
              <EmptyState
                title="Chưa có bài tập nào"
                description="Giao bài tập đầu tiên cho lớp để học sinh có thể nộp bài và nhận điểm."
              />
            ) : (
              assignments.map(asg => (
                <div
                  key={asg.id}
                  className="bg-white rounded-xl border border-slate-200/90 p-4 hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                        {asg.subjectName}
                      </span>
                      <h4 className="font-bold text-slate-900 text-sm">{asg.title}</h4>
                    </div>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-1">{asg.description}</p>
                    <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-3">
                      <span>Hạn: {new Date(asg.dueDate).toLocaleString('vi-VN')}</span>
                      <span>·</span>
                      <span>Thang điểm: {asg.points}</span>
                      <span>·</span>
                      <span className="text-blue-600 font-semibold">Đã nộp: {asg.submissionCount}/{students.length} HS</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => navigate(`/teacher/assignments`)}
                      className="px-3 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                    >
                      Chấm điểm bài nộp
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 5: SỔ ĐIỂM                                            */}
      {/* ========================================================= */}
      {activeTab === 'grades' && (
        <div className="space-y-4">
          <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 flex items-center justify-between gap-3">
            <div className="text-xs text-slate-600">
              Môn học: <strong className="text-slate-900">Toán học</strong> · Học kỳ 2 · Thang điểm 10
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSaveGrades}
                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Lưu sổ điểm</span>
              </button>
            </div>
          </div>

          {/* Gradebook Spreadsheet Grid */}
          <div className="bg-white rounded-xl border border-slate-200/90 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="px-3 py-2.5">STT</th>
                    <th className="px-3 py-2.5 min-w-[140px]">Họ và tên</th>
                    <th className="px-3 py-2.5 text-center">Miệng 1</th>
                    <th className="px-3 py-2.5 text-center">Miệng 2</th>
                    <th className="px-3 py-2.5 text-center">15 Phút 1</th>
                    <th className="px-3 py-2.5 text-center">15 Phút 2</th>
                    <th className="px-3 py-2.5 text-center">Giữa kỳ (x2)</th>
                    <th className="px-3 py-2.5 text-center">Cuối kỳ (x3)</th>
                    <th className="px-3 py-2.5 text-center bg-blue-50/50">ĐTB Môn</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {gradeRecords.map((gr, idx) => (
                    <tr key={gr.id} className="hover:bg-slate-50/60">
                      <td className="px-3 py-2 text-slate-400 font-semibold tabular-nums text-center">
                        {idx + 1}
                      </td>
                      <td className="px-3 py-2 font-bold text-slate-800 truncate max-w-[150px]">
                        {gr.studentName}
                      </td>
                      <td className="px-2 py-1 text-center">
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="10"
                          value={gr.oral1 ?? ''}
                          onChange={e => handleGradeCellChange(gr.id, 'oral1', e.target.value)}
                          className="w-12 text-center py-1 border border-slate-200 rounded focus:border-blue-500 text-xs tabular-nums"
                        />
                      </td>
                      <td className="px-2 py-1 text-center">
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="10"
                          value={gr.oral2 ?? ''}
                          onChange={e => handleGradeCellChange(gr.id, 'oral2', e.target.value)}
                          className="w-12 text-center py-1 border border-slate-200 rounded focus:border-blue-500 text-xs tabular-nums"
                        />
                      </td>
                      <td className="px-2 py-1 text-center">
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="10"
                          value={gr.test15m1 ?? ''}
                          onChange={e => handleGradeCellChange(gr.id, 'test15m1', e.target.value)}
                          className="w-12 text-center py-1 border border-slate-200 rounded focus:border-blue-500 text-xs tabular-nums"
                        />
                      </td>
                      <td className="px-2 py-1 text-center">
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="10"
                          value={gr.test15m2 ?? ''}
                          onChange={e => handleGradeCellChange(gr.id, 'test15m2', e.target.value)}
                          className="w-12 text-center py-1 border border-slate-200 rounded focus:border-blue-500 text-xs tabular-nums"
                        />
                      </td>
                      <td className="px-2 py-1 text-center">
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="10"
                          value={gr.midterm ?? ''}
                          onChange={e => handleGradeCellChange(gr.id, 'midterm', e.target.value)}
                          className="w-12 text-center py-1 border border-slate-200 rounded focus:border-blue-500 text-xs font-semibold tabular-nums"
                        />
                      </td>
                      <td className="px-2 py-1 text-center">
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="10"
                          value={gr.finalTerm ?? ''}
                          onChange={e => handleGradeCellChange(gr.id, 'finalTerm', e.target.value)}
                          className="w-12 text-center py-1 border border-slate-200 rounded focus:border-blue-500 text-xs font-semibold tabular-nums"
                        />
                      </td>
                      <td className="px-3 py-2 text-center font-bold tabular-nums bg-blue-50/50 text-blue-700">
                        {gr.averageScore ?? '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 6: THI ĐUA & HÀNH VI                                  */}
      {/* ========================================================= */}
      {activeTab === 'behavior' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Nhật ký nề nếp & thi đua ({behaviors.length})</h3>
            <button
              onClick={() => setIsLogBehaviorModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Ghi nhận nề nếp</span>
            </button>
          </div>

          <div className="space-y-2.5">
            {behaviors.map(bh => (
              <div
                key={bh.id}
                className="p-3.5 bg-white rounded-xl border border-slate-200/90 flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-xs">{bh.studentName}</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      bh.type === 'positive' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                    }`}>
                      {bh.category}
                    </span>
                  </div>
                  <div className="text-slate-500 text-xs mt-1">{bh.note}</div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    Ghi nhận bởi: {bh.recordedByTeacherName} · Ngày {bh.date}
                  </div>
                </div>

                <div className={`text-sm font-bold tabular-nums ${
                  bh.pointsDelta > 0 ? 'text-emerald-600' : 'text-rose-600'
                }`}>
                  {bh.pointsDelta > 0 ? `+${bh.pointsDelta}` : bh.pointsDelta} điểm
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 7: THỜI KHÓA BIỂU                                     */}
      {/* ========================================================= */}
      {activeTab === 'schedule' && (
        <div className="bg-white rounded-xl border border-slate-200/90 p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Thời khóa biểu tuần · Lớp {currentClass.name}</h3>
              <p className="text-xs text-slate-500 mt-0.5">Lịch dạy và học tuần hiện tại của lớp</p>
            </div>
            <button
              onClick={() => navigate('/teacher/schedule')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer self-start sm:self-auto"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Chỉnh sửa & Quản lý thời khóa biểu</span>
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 text-xs">
            {[
              { day: 2, label: 'Thứ 2' },
              { day: 3, label: 'Thứ 3' },
              { day: 4, label: 'Thứ 4' },
              { day: 5, label: 'Thứ 5' },
              { day: 6, label: 'Thứ 6' },
              { day: 7, label: 'Thứ 7' },
            ].map(d => {
              const classSchedule = db.getSchedule(currentClass.id).filter(s => s.dayOfWeek === d.day);
              return (
                <div key={d.day} className="p-3 rounded-lg border border-slate-100 bg-slate-50">
                  <div className="font-bold text-slate-900 pb-2 border-b border-slate-200 mb-2 flex items-center justify-between">
                    <span>{d.label}</span>
                    <span className="text-[10px] font-normal text-slate-400">{classSchedule.length} tiết</span>
                  </div>
                  <div className="space-y-2">
                    {classSchedule.length > 0 ? (
                      classSchedule
                        .sort((a, b) => a.period - b.period)
                        .map(item => (
                          <div
                            key={item.id}
                            onClick={() => navigate('/teacher/schedule')}
                            className="p-2 bg-white rounded-lg border border-slate-200 hover:border-blue-300 hover:shadow-2xs transition-all cursor-pointer group"
                            title="Bấm để chỉnh sửa trên trang Thời khóa biểu"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-blue-700 group-hover:text-blue-800">{item.subjectName}</span>
                              <span className="text-[10px] font-mono text-slate-400">T{item.period}</span>
                            </div>
                            <div className="text-[11px] text-slate-500 mt-0.5 flex items-center justify-between">
                              <span>{item.teacherName}</span>
                              <span className="text-[10px] text-slate-400 font-mono">{item.room}</span>
                            </div>
                          </div>
                        ))
                    ) : (
                      <div className="text-center py-4 text-slate-400 text-xs italic">Không có tiết học</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 8: BÁO CÁO                                            */}
      {/* ========================================================= */}
      {activeTab === 'reports' && (
        <div className="bg-white rounded-xl border border-slate-200/90 p-5 space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Thống kê học tập & chuyên cần lớp {currentClass.name}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <div className="text-xs font-semibold text-slate-500">Tỷ lệ Chuyên cần Trung bình</div>
              <div className="text-2xl font-bold text-slate-900 mt-1 tabular-nums">97.2%</div>
              <div className="text-xs text-emerald-600 mt-1">Đạt chuẩn lớp Tiên tiến</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <div className="text-xs font-semibold text-slate-500">Học lực Giỏi & Khá</div>
              <div className="text-2xl font-bold text-slate-900 mt-1 tabular-nums">85.4%</div>
              <div className="text-xs text-blue-600 mt-1">Tăng 3.2% so với kỳ 1</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <div className="text-xs font-semibold text-slate-500">Hoàn thành bài tập về nhà</div>
              <div className="text-2xl font-bold text-slate-900 mt-1 tabular-nums">92%</div>
              <div className="text-xs text-slate-400 mt-1">Tính trên 5 đợt bài tập</div>
            </div>
          </div>
        </div>
      )}

      {/* 360 Student Profile Drawer/Modal */}
      {selectedStudent && (
        <Modal
          isOpen={!!selectedStudent}
          onClose={() => setSelectedStudent(null)}
          title={`Hồ sơ học sinh 360° · ${selectedStudent.fullName}`}
          subtitle={`Mã HS: ${selectedStudent.studentCode} · ${selectedStudent.className}`}
          maxWidth="lg"
        >
          <div className="space-y-4">
            <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
              <img
                src={selectedStudent.avatarUrl}
                alt={selectedStudent.fullName}
                className="w-16 h-16 rounded-2xl object-cover ring-2 ring-slate-100"
              />
              <div>
                <h3 className="text-lg font-bold text-slate-900">{selectedStudent.fullName}</h3>
                <p className="text-xs text-slate-500">
                  Ngày sinh: {selectedStudent.dob} · Giới tính: {selectedStudent.gender} · {selectedStudent.team}
                </p>
                <div className="flex items-center gap-2 mt-2 text-xs font-semibold">
                  <span className="text-blue-700 bg-blue-50 px-2 py-0.5 rounded">ĐTB: {selectedStudent.gpa}</span>
                  <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">Hạnh kiểm: {selectedStudent.conduct}</span>
                  <span className="text-purple-700 bg-purple-50 px-2 py-0.5 rounded">Chuyên cần: {selectedStudent.attendanceRate}%</span>
                </div>
              </div>
            </div>

            {/* Parent Information Card */}
            <div className="p-3.5 bg-blue-50/50 rounded-xl border border-blue-100 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-blue-600" />
                  <span>Thông tin Phụ huynh đại diện (Sổ liên lạc điện tử)</span>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  (selectedStudent.parentAppStatus || 'active') === 'active'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  {(selectedStudent.parentAppStatus || 'active') === 'active' ? '● Đã kết nối App SmartClass' : '○ Chưa kết nối App'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-400">Họ tên Phụ huynh:</span>
                  <div className="font-bold text-slate-800 mt-0.5 flex items-center gap-1.5">
                    <span>{selectedStudent.parentName || 'Chưa cập nhật'}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-100 text-blue-700 font-semibold">
                      {selectedStudent.parentRelationship || 'Bố'}
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-slate-400">Số điện thoại liên hệ:</span>
                  <div className="font-mono font-bold text-slate-800 mt-0.5 flex items-center gap-1.5">
                    <span>{selectedStudent.parentPhone || '—'}</span>
                    {selectedStudent.parentPhone && (
                      <a
                        href={`https://zalo.me/${selectedStudent.parentPhone.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] font-bold px-1.5 py-0.2 bg-sky-50 text-sky-700 hover:bg-sky-100 rounded border border-sky-200"
                        title="Nhắn tin Zalo"
                      >
                        Zalo
                      </a>
                    )}
                  </div>
                </div>

                <div>
                  <span className="text-slate-400">Email:</span>
                  <div className="font-medium text-slate-700 mt-0.5 truncate">
                    {selectedStudent.parentEmail || 'Chưa có email'}
                  </div>
                </div>

                <div>
                  <span className="text-slate-400">Tổ học tập:</span>
                  <div className="font-medium text-slate-700 mt-0.5">
                    {selectedStudent.team || 'Tổ 1'}
                  </div>
                </div>

                <div className="col-span-2">
                  <span className="text-slate-400">Địa chỉ thường trú gia đình:</span>
                  <div className="font-medium text-slate-800 mt-0.5">{selectedStudent.address}</div>
                </div>

                {selectedStudent.parentNotes && (
                  <div className="col-span-2 p-2 bg-white rounded-lg border border-blue-100 text-xs">
                    <span className="font-bold text-blue-800">Lưu ý của GVCN: </span>
                    <span className="text-slate-700">{selectedStudent.parentNotes}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  const st = selectedStudent;
                  setSelectedStudent(null);
                  setEditingStudent(st);
                }}
                className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5 text-blue-600" />
                <span>Chỉnh sửa học sinh</span>
              </button>

              <button
                onClick={() => setSelectedStudent(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold cursor-pointer"
              >
                Đóng hồ sơ
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* CÁCH 1: MODAL THÊM TỪNG HỌC SINH */}
      <AddSingleStudentModal
        isOpen={isAddStudentModalOpen}
        onClose={() => setIsAddStudentModalOpen(false)}
        classId={currentClass.id}
        className={currentClass.name}
        onSuccess={() => loadClassData(currentClass.id)}
      />

      {/* CÁCH 2: MODAL IMPORT EXCEL / CSV */}
      <ImportExcelStudentsModal
        isOpen={isImportStudentModalOpen}
        onClose={() => setIsImportStudentModalOpen(false)}
        classId={currentClass.id}
        className={currentClass.name}
        onSuccess={() => loadClassData(currentClass.id)}
      />

      {/* Create Assignment Modal */}
      <Modal
        isOpen={isCreateAsgModalOpen}
        onClose={() => setIsCreateAsgModalOpen(false)}
        title="Giao bài tập mới"
        subtitle={`Giao cho cả lớp ${currentClass.name}`}
        maxWidth="md"
      >
        <form onSubmit={handleCreateAssignment} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Tiêu đề bài tập *</label>
            <input
              type="text"
              required
              placeholder="Ví dụ: Bài tập Parabol và Hàm số bậc hai"
              value={asgTitle}
              onChange={e => setAsgTitle(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Mô tả & Hướng dẫn làm bài</label>
            <textarea
              rows={3}
              placeholder="Yêu cầu học sinh làm bài tập vẽ đồ thị và nộp file PDF..."
              value={asgDesc}
              onChange={e => setAsgDesc(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Hạn nộp</label>
            <input
              type="datetime-local"
              value={asgDueDate}
              onChange={e => setAsgDueDate(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 bg-white"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsCreateAsgModalOpen(false)}
              className="px-4 py-2 font-semibold text-slate-700 hover:bg-slate-100 rounded-lg"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs"
            >
              Phát hành bài tập
            </button>
          </div>
        </form>
      </Modal>

      {/* Log Behavior Modal */}
      <Modal
        isOpen={isLogBehaviorModalOpen}
        onClose={() => setIsLogBehaviorModalOpen(false)}
        title="Ghi nhận nề nếp & thi đua"
        subtitle={`Lớp ${currentClass.name}`}
        maxWidth="md"
      >
        <form onSubmit={handleSaveBehavior} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Chọn học sinh *</label>
            <select
              value={behaviorStudentId}
              onChange={e => setBehaviorStudentId(e.target.value)}
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 bg-white"
            >
              <option value="">-- Chọn học sinh trong danh sách --</option>
              {students.map(st => (
                <option key={st.id} value={st.id}>
                  {st.rollNumber}. {st.fullName} ({st.studentCode})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Loại ghi nhận</label>
              <select
                value={behaviorType}
                onChange={e => setBehaviorType(e.target.value as any)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 bg-white"
              >
                <option value="positive">Khen ngợi (+)</option>
                <option value="negative">Nhắc nhở (-)</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Điểm thi đua</label>
              <input
                type="number"
                min="1"
                max="20"
                value={behaviorPoints}
                onChange={e => setBehaviorPoints(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Hành vi / Nội dung</label>
            <input
              type="text"
              value={behaviorCategory}
              onChange={e => setBehaviorCategory(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Ghi chú thêm</label>
            <textarea
              rows={2}
              value={behaviorNote}
              onChange={e => setBehaviorNote(e.target.value)}
              placeholder="Chi tiết tình huống..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsLogBehaviorModalOpen(false)}
              className="px-4 py-2 font-semibold text-slate-700 hover:bg-slate-100 rounded-lg"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs"
            >
              Lưu ghi nhận
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Student Modal */}
      <EditStudentModal
        isOpen={Boolean(editingStudent)}
        onClose={() => setEditingStudent(null)}
        student={editingStudent}
        onSuccess={() => loadClassData(classId)}
      />

      {/* Delete Student Modal with strict business constraints */}
      <DeleteStudentModal
        isOpen={Boolean(deletingStudent)}
        onClose={() => setDeletingStudent(null)}
        student={deletingStudent}
        onConfirmDelete={handleConfirmDeleteStudent}
        onSwitchToEdit={st => {
          setDeletingStudent(null);
          setEditingStudent(st);
        }}
      />
      </div>
    </div>
  );
};
