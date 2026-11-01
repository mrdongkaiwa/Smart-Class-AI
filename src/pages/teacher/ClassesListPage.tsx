import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  Filter,
  Users,
  QrCode,
  Archive,
  MoreVertical,
  ChevronRight,
  ChevronDown,
  Edit2,
  Trash2,
  Copy,
  Layers,
  LayoutGrid,
  List,
  FolderOpen,
  ClipboardCheck,
  FileText,
  TrendingUp,
  Calendar,
  Award,
  BarChart3,
  Maximize2,
  Minimize2,
  BookOpen,
  Pencil,
  Check,
  RefreshCw
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { Breadcrumb } from '../../components/common/Breadcrumb';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { CreateClassModal } from './CreateClassModal';
import { EmptyState } from '../../components/common/EmptyState';
import { db } from '../../services/db';
import { Classroom } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { ClassWorkspacePage } from './ClassWorkspacePage';

export const ClassesListPage: React.FC = () => {
  const navigate = useNavigate();
  const { setActiveClassId, currentUser } = useAuth();
  const { showToast } = useToast();

  // 2 Master Tabs: 'classes' (Lớp của tôi) and 'create' (Thêm mới lớp)
  const [activeMainTab, setActiveMainTab] = useState<'classes' | 'create'>('classes');

  const [classes, setClasses] = useState<Classroom[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGrade, setSelectedGrade] = useState<number | 'all'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // New Class Form State for 'create' Tab
  const [newClassName, setNewClassName] = useState('');
  const [newGradeLevel, setNewGradeLevel] = useState<number>(10);
  const [newRoomNumber, setNewRoomNumber] = useState('A.306');
  const [newColor, setNewColor] = useState('#2563EB');
  const [isSubmittingNewClass, setIsSubmittingNewClass] = useState(false);

  // Academic Year State: Click to edit, Enter to auto-save
  const [academicYearName, setAcademicYearName] = useState(() => db.getCurrentAcademicYear()?.name || '2024 - 2025');
  const [isEditingAcademicYear, setIsEditingAcademicYear] = useState(false);
  const [academicYearInput, setAcademicYearInput] = useState(academicYearName);
  const academicYearInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditingAcademicYear && academicYearInputRef.current) {
      academicYearInputRef.current.focus();
      academicYearInputRef.current.select();
    }
  }, [isEditingAcademicYear]);

  const handleSaveAcademicYear = () => {
    let trimmed = academicYearInput.trim();
    if (!trimmed) {
      trimmed = '2024 - 2025';
    }
    trimmed = trimmed.replace(/^Năm\s*học\s*/i, '').trim();
    if (!trimmed) {
      trimmed = '2024 - 2025';
    }
    setAcademicYearName(trimmed);
    setAcademicYearInput(trimmed);
    setIsEditingAcademicYear(false);
    db.updateCurrentAcademicYearName(trimmed);
    showToast(`Đã lưu năm học: Năm học ${trimmed}`, 'success');
  };

  // Active Class for Large Workspace Window Modal
  const [activeWorkspaceClassId, setActiveWorkspaceClassId] = useState<string | null>(null);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<Classroom | null>(null);
  const [deletingClassId, setDeletingClassId] = useState<string | null>(null);

  useEffect(() => {
    const loadClasses = () => {
      setClasses(db.getClasses());
    };
    loadClasses();
    return db.subscribe(loadClasses);
  }, []);

  const filteredClasses = classes.filter(cls => {
    const matchesSearch =
      cls.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cls.roomNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cls.joinCode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGrade = selectedGrade === 'all' || cls.gradeLevel === selectedGrade;
    return matchesSearch && matchesGrade;
  });

  const handleOpenClassWorkspace = (classId: string, initialTab = 'overview') => {
    setActiveClassId(classId);
    navigate(`/teacher/classes/${classId}?tab=${initialTab}`);
  };

  const handleOpenLargeWorkspaceModal = (classId: string) => {
    setActiveClassId(classId);
    setActiveWorkspaceClassId(classId);
  };

  const handleCopyJoinCode = (e: React.MouseEvent, code: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    showToast(`Đã sao chép mã tham gia: ${code}`, 'info');
  };

  const handleDeleteClass = () => {
    if (deletingClassId) {
      db.deleteClass(deletingClassId);
      showToast('Đã xóa lớp học thành công', 'success');
      setDeletingClassId(null);
    }
  };

  const handleCreateNewClassFromTab = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName.trim()) {
      showToast('Vui lòng nhập tên lớp học!', 'warning');
      return;
    }

    setIsSubmittingNewClass(true);
    try {
      const created = db.createClass({
        name: newClassName.trim(),
        code: `${newClassName.trim()}-2024`,
        gradeLevel: newGradeLevel,
        academicYearId: 'ay_2024_2025',
        roomNumber: newRoomNumber.trim() || 'A.301',
        homeroomTeacherId: currentUser?.id || 'user_teacher_1',
        homeroomTeacherName: currentUser?.fullName || 'Cô Nguyễn Thị Mai',
        color: newColor,
      });

      showToast(`Đã tạo thành công lớp học ${created.name}!`, 'success');
      setClasses(db.getClasses());
      // Reset form and switch to classes list tab
      setNewClassName('');
      setNewRoomNumber('A.306');
      setActiveMainTab('classes');
      // Automatically open large workspace of the new class
      setActiveWorkspaceClassId(created.id);
    } catch (err) {
      showToast('Đã xảy ra lỗi khi tạo lớp học', 'error');
    } finally {
      setIsSubmittingNewClass(false);
    }
  };

  const colorOptions = [
    '#2563EB', // Blue
    '#7C3AED', // Purple
    '#16A34A', // Green
    '#F59E0B', // Amber
    '#EF4444', // Red
    '#06B6D4', // Cyan
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        breadcrumbItems={[{ label: 'Lớp học' }, { label: 'Lớp của tôi' }]}
        title="Quản lý Lớp học"
        action={
          <div className="flex items-center gap-2">
            <button
              onClick={async () => {
                showToast('Đang đồng bộ dữ liệu lớp & học sinh lên Cloud Firestore...', 'info');
                try {
                  const res = await db.syncAllToFirestore();
                  showToast(`Đã đồng bộ ${res.classesCount} lớp và ${res.studentsCount} học sinh lên Cloud Firestore!`, 'success');
                } catch {
                  showToast('Lỗi khi đồng bộ lên Cloud Firestore', 'error');
                }
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#03233e] hover:bg-[#07355c] text-cyan-300 border border-cyan-500/30 rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              title="Đồng bộ danh sách lớp và học sinh lên Cloud Firestore"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Đồng bộ Firestore</span>
            </button>
            {activeMainTab === 'classes' ? (
              <button
                onClick={() => setActiveMainTab('create')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0284c7] hover:bg-[#0369a1] text-white rounded-lg text-xs font-bold shadow-sm shadow-cyan-950 transition-colors cursor-pointer border border-cyan-500/40"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Thêm mới lớp</span>
              </button>
            ) : (
              <button
                onClick={() => setActiveMainTab('classes')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#041527] border border-[#0e3d54] hover:bg-[#072540] text-slate-200 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
              >
                <span>&larr; Về danh sách lớp</span>
              </button>
            )}
          </div>
        }
      />

      {/* 2 MAIN TABS: 'Lớp của tôi' & 'Thêm mới lớp' */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          type="button"
          onClick={() => setActiveMainTab('classes')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
            activeMainTab === 'classes'
              ? 'border-blue-600 text-blue-700 bg-white rounded-t-lg shadow-2xs'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/50'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Lớp của tôi</span>
          <span className="ml-1 text-[11px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-mono">
            {classes.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveMainTab('create')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
            activeMainTab === 'create'
              ? 'border-blue-600 text-blue-700 bg-white rounded-t-lg shadow-2xs'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/50'
          }`}
        >
          <Plus className="w-4 h-4" />
          <span>Thêm mới lớp</span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: LỚP CỦA TÔI                                        */}
      {/* ========================================================= */}
      {activeMainTab === 'classes' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          {/* Filter and Search Bar */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex flex-1 items-center gap-2 max-w-md">
              <div className="relative w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Tìm theo tên lớp, phòng, mã tham gia..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Grade filter - Hỗ trợ cả 12 khối lớp */}
              <div className="flex items-center">
                <select
                  value={selectedGrade}
                  onChange={e => setSelectedGrade(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200/80 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer transition-colors"
                >
                  <option value="all">Tất cả 12 khối lớp</option>
                  <optgroup label="Cấp Tiểu học (Khối 1 - 5)">
                    <option value={1}>Khối 1 (Tiểu học)</option>
                    <option value={2}>Khối 2 (Tiểu học)</option>
                    <option value={3}>Khối 3 (Tiểu học)</option>
                    <option value={4}>Khối 4 (Tiểu học)</option>
                    <option value={5}>Khối 5 (Tiểu học)</option>
                  </optgroup>
                  <optgroup label="Cấp THCS (Khối 6 - 9)">
                    <option value={6}>Khối 6 (Cấp THCS)</option>
                    <option value={7}>Khối 7 (Cấp THCS)</option>
                    <option value={8}>Khối 8 (Cấp THCS)</option>
                    <option value={9}>Khối 9 (Cấp THCS)</option>
                  </optgroup>
                  <optgroup label="Cấp THPT (Khối 10 - 12)">
                    <option value={10}>Khối 10 (Cấp THPT)</option>
                    <option value={11}>Khối 11 (Cấp THPT)</option>
                    <option value={12}>Khối 12 (Cấp THPT)</option>
                  </optgroup>
                </select>
              </div>

              {/* Grid / Table Switcher */}
              <div className="hidden sm:flex items-center gap-1 p-0.5 bg-slate-100 rounded-lg text-xs">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-md ${
                    viewMode === 'grid' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-500'
                  }`}
                  title="Xem dạng thẻ"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`p-1.5 rounded-md ${
                    viewMode === 'table' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-500'
                  }`}
                  title="Xem dạng bảng"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Classes Grid or Table */}
          {filteredClasses.length === 0 ? (
            <EmptyState
              title="Không tìm thấy lớp học phù hợp"
              description="Thử đổi bộ lọc tìm kiếm hoặc tạo một lớp học mới để bắt đầu quản lý."
              action={
                <button
                  onClick={() => setActiveMainTab('create')}
                  className="px-3.5 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold shadow-xs"
                >
                  Tạo lớp học ngay
                </button>
              }
            />
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {filteredClasses.map(cls => (
                <div
                  key={cls.id}
                  className="bg-white rounded-xl border border-slate-200/90 p-3.5 sm:p-4 hover:border-slate-300 hover:shadow-xs transition-all duration-150 flex flex-col justify-between"
                >
                  <div>
                    {/* Header Row: Dot + Class Name + Join Code (raised on same row) + Actions */}
                    <div className="flex items-center justify-between gap-2">
                      <div
                        onClick={() => handleOpenLargeWorkspaceModal(cls.id)}
                        className="flex items-center gap-2 cursor-pointer group min-w-0"
                      >
                        <span
                          className="w-3 h-3 rounded-full shrink-0"
                          style={{ backgroundColor: cls.color }}
                        />
                        <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                          Lớp {cls.name}
                        </h3>

                        {/* Join code raised onto the same row as class name */}
                        <button
                          type="button"
                          onClick={e => handleCopyJoinCode(e, cls.joinCode)}
                          className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-600 font-mono text-[11px] transition-colors border border-slate-200/70 shrink-0 cursor-pointer"
                          title="Nhấn để sao chép mã tham gia"
                        >
                          <QrCode className="w-3 h-3 text-slate-400" />
                          <span>{cls.joinCode}</span>
                          <Copy className="w-2.5 h-2.5 text-slate-400 opacity-60" />
                        </button>
                      </div>

                      <div className="flex items-center gap-0.5 shrink-0">
                        <button
                          onClick={() => {
                            setEditingClass(cls);
                            setIsCreateModalOpen(true);
                          }}
                          className="p-1 text-slate-400 hover:text-blue-600 rounded hover:bg-slate-100 transition-colors"
                          title="Sửa lớp"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeletingClassId(cls.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-slate-100 transition-colors"
                          title="Xóa lớp"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Phòng, Sĩ số, GVCN luôn trên cùng 1 dòng theo yêu cầu */}
                    <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-400 whitespace-nowrap overflow-hidden">
                      <span className="shrink-0">
                        Phòng: <strong className="font-semibold text-white">{cls.roomNumber}</strong>
                      </span>
                      <span className="text-slate-600 shrink-0">·</span>
                      <span className="shrink-0">
                        Sĩ số: <strong className="font-semibold text-white tabular-nums">{cls.studentCount} HS</strong>
                      </span>
                      <span className="text-slate-600 shrink-0">·</span>
                      <span className="truncate" title={`GVCN: ${cls.homeroomTeacherName}`}>
                        GVCN: <strong className="font-semibold text-slate-200">{cls.homeroomTeacherName}</strong>
                      </span>
                    </div>
                  </div>

                  {/* Bottom: Link vào không gian làm việc chính (đã bỏ nút Mở to cửa sổ bôi đỏ) */}
                  <div className="mt-3 pt-2.5 border-t border-[#0e3d54] flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => handleOpenLargeWorkspaceModal(cls.id)}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer group/link"
                      title="Vào không gian làm việc chính của lớp"
                    >
                      <span>Vào không gian làm việc chính</span>
                      <ChevronRight className="w-3.5 h-3.5 group-hover/link:translate-x-0.5 transition-transform" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200/90 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="px-4 py-3">Tên lớp</th>
                      <th className="px-4 py-3">Khối</th>
                      <th className="px-4 py-3">Phòng</th>
                      <th className="px-4 py-3">Sĩ số</th>
                      <th className="px-4 py-3">Mã tham gia</th>
                      <th className="px-4 py-3">GV Chủ nhiệm</th>
                      <th className="px-4 py-3 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredClasses.map(cls => (
                      <tr
                        key={cls.id}
                        onClick={() => handleOpenLargeWorkspaceModal(cls.id)}
                        className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                      >
                        <td className="px-4 py-3 font-bold text-slate-900 flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cls.color }} />
                          <span>{cls.name}</span>
                        </td>
                        <td className="px-4 py-3">Khối {cls.gradeLevel}</td>
                        <td className="px-4 py-3">{cls.roomNumber}</td>
                        <td className="px-4 py-3 font-semibold tabular-nums text-slate-800">{cls.studentCount} HS</td>
                        <td className="px-4 py-3 font-mono">{cls.joinCode}</td>
                        <td className="px-4 py-3 font-medium text-slate-700">{cls.homeroomTeacherName}</td>
                        <td className="px-4 py-3 text-right" onClick={e => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleOpenLargeWorkspaceModal(cls.id)}
                              className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-md text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                              title="Mở to không gian làm việc"
                            >
                              <Maximize2 className="w-3.5 h-3.5" />
                              <span>Vào lớp</span>
                            </button>
                            <button
                              onClick={() => {
                                setEditingClass(cls);
                                setIsCreateModalOpen(true);
                              }}
                              className="p-1 hover:text-blue-600 rounded-md hover:bg-slate-100 transition-colors"
                              title="Sửa lớp"
                            >
                              <Edit2 className="w-3.5 h-3.5 text-slate-400 hover:text-blue-600" />
                            </button>
                            <button
                              onClick={() => setDeletingClassId(cls.id)}
                              className="p-1 hover:text-rose-600 rounded-md hover:bg-slate-100 transition-colors"
                              title="Xóa lớp"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-slate-400 hover:text-rose-600" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: THÊM MỚI LỚP (DEDICATED FORM TAB)                  */}
      {/* ========================================================= */}
      {activeMainTab === 'create' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs animate-in fade-in duration-150 max-w-3xl mx-auto">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6 gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">Thiết lập Lớp học Mới</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Khai báo thông tin lớp học số, chỉ định giáo viên chủ nhiệm, phòng học và màu nhận diện
              </p>
            </div>

            {/* Academic Year: Click to edit, Enter to auto-save */}
            {isEditingAcademicYear ? (
              <div className="flex items-center gap-1.5 bg-blue-50/70 py-1 px-2.5 rounded-lg border border-blue-200 shadow-2xs">
                <span className="text-xs font-semibold text-slate-600 shrink-0">Năm học</span>
                <input
                  ref={academicYearInputRef}
                  type="text"
                  value={academicYearInput}
                  onChange={e => setAcademicYearInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleSaveAcademicYear();
                    } else if (e.key === 'Escape') {
                      setIsEditingAcademicYear(false);
                      setAcademicYearInput(academicYearName);
                    }
                  }}
                  onBlur={handleSaveAcademicYear}
                  placeholder="2024 - 2025"
                  className="w-28 px-2 py-0.5 text-xs font-mono font-bold text-blue-700 bg-white border border-blue-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onMouseDown={e => {
                    e.preventDefault();
                    handleSaveAcademicYear();
                  }}
                  title="Lưu năm học (Enter)"
                  className="p-1 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded cursor-pointer transition-colors"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setAcademicYearInput(academicYearName);
                  setIsEditingAcademicYear(true);
                }}
                title="Bấm vào đây để chỉnh sửa thông tin năm học (nhấn Enter để lưu)"
                className="group inline-flex items-center gap-1.5 text-xs font-mono bg-blue-50 hover:bg-blue-100 text-blue-700 hover:text-blue-900 px-3 py-1.5 rounded-lg font-semibold border border-blue-200/80 hover:border-blue-400 transition-all cursor-pointer shadow-2xs shrink-0"
              >
                <span>Năm học {academicYearName}</span>
                <Pencil className="w-3 h-3 text-blue-400 group-hover:text-blue-600 transition-colors" />
              </button>
            )}
          </div>

          <form onSubmit={handleCreateNewClassFromTab} className="space-y-6">
            {/* Form Input Fields (Preview Card Removed) */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Tên lớp học *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: 1A1, 5C, 6B2, 10A3, 12A1..."
                  value={newClassName}
                  onChange={e => setNewClassName(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Tên lớp dùng để hiển thị trên sổ điểm, thời khóa biểu và cổng phụ huynh/học sinh.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Khối lớp (12 khối)
                  </label>
                  <select
                    value={newGradeLevel}
                    onChange={e => setNewGradeLevel(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white cursor-pointer"
                  >
                    <optgroup label="Cấp Tiểu học (Khối 1 - 5)">
                      <option value={1}>Khối 1 (Tiểu học)</option>
                      <option value={2}>Khối 2 (Tiểu học)</option>
                      <option value={3}>Khối 3 (Tiểu học)</option>
                      <option value={4}>Khối 4 (Tiểu học)</option>
                      <option value={5}>Khối 5 (Tiểu học)</option>
                    </optgroup>
                    <optgroup label="Cấp THCS (Khối 6 - 9)">
                      <option value={6}>Khối 6 (Cấp THCS)</option>
                      <option value={7}>Khối 7 (Cấp THCS)</option>
                      <option value={8}>Khối 8 (Cấp THCS)</option>
                      <option value={9}>Khối 9 (Cấp THCS)</option>
                    </optgroup>
                    <optgroup label="Cấp THPT (Khối 10 - 12)">
                      <option value={10}>Khối 10 (Cấp THPT)</option>
                      <option value={11}>Khối 11 (Cấp THPT)</option>
                      <option value={12}>Khối 12 (Cấp THPT)</option>
                    </optgroup>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Phòng học
                  </label>
                  <input
                    type="text"
                    placeholder="Ví dụ: A.306, B.201..."
                    value={newRoomNumber}
                    onChange={e => setNewRoomNumber(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Giáo viên chủ nhiệm phụ trách
                </label>
                <input
                  type="text"
                  disabled
                  value={`${currentUser?.fullName || 'Cô Nguyễn Thị Mai'} (Tài khoản hiện tại)`}
                  className="w-full px-3.5 py-2.5 border border-slate-200 bg-slate-50 rounded-xl text-xs text-slate-600 font-medium cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Màu sắc nhận diện lớp học
                </label>
                <div className="flex items-center gap-3">
                  {colorOptions.map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setNewColor(c)}
                      className={`w-8 h-8 rounded-full transition-transform cursor-pointer ${
                        newColor === c
                          ? 'scale-125 ring-2 ring-offset-2 ring-slate-700'
                          : 'hover:scale-110'
                      }`}
                      style={{ backgroundColor: c }}
                      aria-label={`Chọn màu ${c}`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setNewClassName('');
                  setNewRoomNumber('A.306');
                  setActiveMainTab('classes');
                }}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                disabled={isSubmittingNewClass || !newClassName.trim()}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{isSubmittingNewClass ? 'Đang tạo lớp...' : 'Tạo lớp học ngay'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Edit Class Modal (For Editing Existing Class) */}
      <CreateClassModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setEditingClass(null);
        }}
        initialData={editingClass}
        onSuccess={() => {
          setClasses(db.getClasses());
          setEditingClass(null);
        }}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deletingClassId}
        onClose={() => setDeletingClassId(null)}
        onConfirm={handleDeleteClass}
        title="Xác nhận xóa lớp học"
        message="Hành động này sẽ xóa lớp học và dữ liệu liên quan. Bạn có chắc chắn muốn xóa không?"
        confirmText="Xóa lớp"
        isDanger={true}
      />

      {/* CỬA SỔ TO KHÔNG GIAN LÀM VIỆC LỚP HỌC */}
      {activeWorkspaceClassId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-hidden animate-in fade-in duration-150">
          <div className="bg-slate-50 w-full max-w-7xl h-[92vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200">
            <ClassWorkspacePage
              classIdProp={activeWorkspaceClassId}
              isModal={true}
              onClose={() => setActiveWorkspaceClassId(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

