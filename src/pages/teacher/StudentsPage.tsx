import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Search,
  Plus,
  Upload,
  Download,
  Filter,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  Trash2,
  Edit2,
  UserPlus,
  Phone,
  Mail,
  Eye,
  MapPin,
  MessageSquare,
  ExternalLink,
  Copy,
  HeartHandshake,
  ShieldCheck,
  Send,
  UserCheck,
  BookOpen,
  Info,
  Clock,
  Sparkles,
  Home,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  ArrowLeftRight,
  RefreshCw
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { Breadcrumb } from '../../components/common/Breadcrumb';
import { AddSingleStudentModal } from '../../components/students/AddSingleStudentModal';
import { ImportExcelStudentsModal } from '../../components/students/ImportExcelStudentsModal';
import { EditParentModal } from '../../components/students/EditParentModal';
import { ViewParentModal } from '../../components/students/ViewParentModal';
import { ContactParentModal } from '../../components/students/ContactParentModal';
import { EditStudentModal } from '../../components/students/EditStudentModal';
import { DeleteStudentModal } from '../../components/students/DeleteStudentModal';
import { Modal } from '../../components/common/Modal';
import { db } from '../../services/db';
import { Student, Classroom } from '../../types';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';

export const StudentsPage: React.FC = () => {
  const { showToast } = useToast();
  const { activeClassId } = useAuth();

  // 2 Master Tabs: 'students' (Danh sách học sinh) and 'parents' (Thông tin phụ huynh)
  const [activeTab, setActiveTab] = useState<'students' | 'parents'>('students');

  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<Classroom[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>(activeClassId || 'class_10a1');
  const [searchTerm, setSearchTerm] = useState('');

  // Parent Tab Filters
  const [relationshipFilter, setRelationshipFilter] = useState<string>('all');
  const [appStatusFilter, setAppStatusFilter] = useState<string>('all');

  // Modals
  const [isAddSingleModalOpen, setIsAddSingleModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [deletingStudent, setDeletingStudent] = useState<Student | null>(null);
  const [viewingParentStudent, setViewingParentStudent] = useState<Student | null>(null);
  const [editingParentStudent, setEditingParentStudent] = useState<Student | null>(null);
  const [contactingParentStudent, setContactingParentStudent] = useState<Student | null>(null);
  const [selectedStudentProfile, setSelectedStudentProfile] = useState<Student | null>(null);
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [isBroadcasting, setIsBroadcasting] = useState(false);

  // Always-Visible Horizontal Scroll Synchronization for Tab 2: Parents Table
  const parentTableContainerRef = React.useRef<HTMLDivElement>(null);
  const parentTopScrollRef = React.useRef<HTMLDivElement>(null);
  const parentBottomScrollRef = React.useRef<HTMLDivElement>(null);
  const [parentScrollLeft, setParentScrollLeft] = useState(0);
  const [parentMaxScrollLeft, setParentMaxScrollLeft] = useState(0);
  const [parentScrollWidth, setParentScrollWidth] = useState(1150);

  // Always-Visible Horizontal Scroll Synchronization for Tab 1: Students Table
  const studentTableContainerRef = React.useRef<HTMLDivElement>(null);
  const studentTopScrollRef = React.useRef<HTMLDivElement>(null);
  const studentBottomScrollRef = React.useRef<HTMLDivElement>(null);
  const [studentScrollLeft, setStudentScrollLeft] = useState(0);
  const [studentMaxScrollLeft, setStudentMaxScrollLeft] = useState(0);
  const [studentScrollWidth, setStudentScrollWidth] = useState(1100);

  const updateTableScrollMetrics = React.useCallback(() => {
    if (parentTableContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = parentTableContainerRef.current;
      setParentScrollLeft(scrollLeft);
      setParentMaxScrollLeft(Math.max(0, scrollWidth - clientWidth));
      setParentScrollWidth(scrollWidth);
    }
    if (studentTableContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = studentTableContainerRef.current;
      setStudentScrollLeft(scrollLeft);
      setStudentMaxScrollLeft(Math.max(0, scrollWidth - clientWidth));
      setStudentScrollWidth(scrollWidth);
    }
  }, []);

  const handleParentTableScroll = () => {
    if (!parentTableContainerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = parentTableContainerRef.current;
    setParentScrollLeft(scrollLeft);
    setParentMaxScrollLeft(Math.max(0, scrollWidth - clientWidth));
    if (parentTopScrollRef.current && Math.abs(parentTopScrollRef.current.scrollLeft - scrollLeft) > 1) {
      parentTopScrollRef.current.scrollLeft = scrollLeft;
    }
    if (parentBottomScrollRef.current && Math.abs(parentBottomScrollRef.current.scrollLeft - scrollLeft) > 1) {
      parentBottomScrollRef.current.scrollLeft = scrollLeft;
    }
  };

  const handleParentTopScroll = () => {
    if (!parentTopScrollRef.current || !parentTableContainerRef.current) return;
    parentTableContainerRef.current.scrollLeft = parentTopScrollRef.current.scrollLeft;
  };

  const handleParentBottomScroll = () => {
    if (!parentBottomScrollRef.current || !parentTableContainerRef.current) return;
    parentTableContainerRef.current.scrollLeft = parentBottomScrollRef.current.scrollLeft;
  };

  const scrollParentBy = (amount: number) => {
    if (parentTableContainerRef.current) {
      parentTableContainerRef.current.scrollBy({ left: amount, behavior: 'smooth' });
    }
  };

  const scrollParentToExtreme = (toEnd: boolean) => {
    if (parentTableContainerRef.current) {
      parentTableContainerRef.current.scrollTo({
        left: toEnd ? parentTableContainerRef.current.scrollWidth : 0,
        behavior: 'smooth',
      });
    }
  };

  // Student table scroll handlers
  const handleStudentTableScroll = () => {
    if (!studentTableContainerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = studentTableContainerRef.current;
    setStudentScrollLeft(scrollLeft);
    setStudentMaxScrollLeft(Math.max(0, scrollWidth - clientWidth));
    if (studentTopScrollRef.current && Math.abs(studentTopScrollRef.current.scrollLeft - scrollLeft) > 1) {
      studentTopScrollRef.current.scrollLeft = scrollLeft;
    }
    if (studentBottomScrollRef.current && Math.abs(studentBottomScrollRef.current.scrollLeft - scrollLeft) > 1) {
      studentBottomScrollRef.current.scrollLeft = scrollLeft;
    }
  };

  const handleStudentTopScroll = () => {
    if (!studentTopScrollRef.current || !studentTableContainerRef.current) return;
    studentTableContainerRef.current.scrollLeft = studentTopScrollRef.current.scrollLeft;
  };

  const handleStudentBottomScroll = () => {
    if (!studentBottomScrollRef.current || !studentTableContainerRef.current) return;
    studentTableContainerRef.current.scrollLeft = studentBottomScrollRef.current.scrollLeft;
  };

  const scrollStudentBy = (amount: number) => {
    if (studentTableContainerRef.current) {
      studentTableContainerRef.current.scrollBy({ left: amount, behavior: 'smooth' });
    }
  };

  const scrollStudentToExtreme = (toEnd: boolean) => {
    if (studentTableContainerRef.current) {
      studentTableContainerRef.current.scrollTo({
        left: toEnd ? studentTableContainerRef.current.scrollWidth : 0,
        behavior: 'smooth',
      });
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      updateTableScrollMetrics();
    }, 150);
    window.addEventListener('resize', updateTableScrollMetrics);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateTableScrollMetrics);
    };
  }, [activeTab, students, updateTableScrollMetrics]);

  useEffect(() => {
    const refresh = () => {
      setClasses(db.getClasses());
      setStudents(db.getStudents(selectedClassId));
    };
    refresh();
    return db.subscribe(refresh);
  }, [selectedClassId]);

  const refreshStudents = () => {
    setStudents(db.getStudents(selectedClassId));
    setClasses(db.getClasses());
  };

  const handleConfirmDeleteStudent = (studentToDelete: Student) => {
    const res = db.deleteStudent(studentToDelete.id);
    if (res.success) {
      showToast(`Đã xóa học sinh ${studentToDelete.fullName} thành công!`, 'success');
      refreshStudents();
    } else {
      showToast(res.message || 'Không thể xóa học sinh', 'error');
    }
  };

  const selectedClass = classes.find(c => c.id === selectedClassId);

  // Filtered Students for Tab 1
  const filteredStudents = students.filter(s =>
    s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.studentCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.team.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.parentName && s.parentName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (s.parentPhone && s.parentPhone.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Filtered Parents for Tab 2
  const filteredParents = students.filter(s => {
    const matchesSearch =
      (s.parentName && s.parentName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.studentCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.parentPhone && s.parentPhone.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (s.parentEmail && s.parentEmail.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (s.address && s.address.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesRelationship =
      relationshipFilter === 'all' || s.parentRelationship === relationshipFilter;

    const matchesAppStatus =
      appStatusFilter === 'all' || (s.parentAppStatus || 'active') === appStatusFilter;

    return matchesSearch && matchesRelationship && matchesAppStatus;
  });

  // Parent Stats for KPIs
  const activeAppCount = students.filter(s => (s.parentAppStatus || 'active') === 'active').length;
  const hasPhoneCount = students.filter(s => !!s.parentPhone).length;
  const fatherCount = students.filter(s => s.parentRelationship === 'Bố' || !s.parentRelationship).length;
  const motherCount = students.filter(s => s.parentRelationship === 'Mẹ').length;

  const handleCopyPhone = (e: React.MouseEvent, phone?: string) => {
    e.stopPropagation();
    if (phone) {
      navigator.clipboard.writeText(phone.replace(/\s+/g, ''));
      showToast(`Đã sao chép số điện thoại: ${phone}`, 'info');
    }
  };

  const handleExportParentsToCSV = () => {
    if (students.length === 0) {
      showToast('Không có dữ liệu phụ huynh để xuất', 'warning');
      return;
    }

    const headers = [
      'STT',
      'Họ và tên Học sinh',
      'Mã học sinh',
      'Họ và tên Phụ huynh',
      'Mối quan hệ',
      'Số điện thoại',
      'Email',
      'Địa chỉ thường trú gia đình',
      'Trạng thái App SmartClass',
      'Ghi chú GVCN'
    ];

    const rows = students.map((s, idx) => [
      s.rollNumber || idx + 1,
      `"${s.fullName}"`,
      s.studentCode,
      `"${s.parentName || ''}"`,
      `"${s.parentRelationship || 'Bố'}"`,
      `"${s.parentPhone || ''}"`,
      `"${s.parentEmail || ''}"`,
      `"${s.address || ''}"`,
      `"${s.parentAppStatus === 'active' ? 'Đã kết nối' : 'Chưa kết nối'}"`,
      `"${s.parentNotes || ''}"`
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map(e => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Danh_ba_phu_huynh_lop_${selectedClass?.name || '10A1'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Đã xuất danh bạ ${students.length} phụ huynh ra file Excel / CSV`, 'success');
  };

  const handleSendBroadcastMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastMessage.trim()) {
      showToast('Vui lòng nhập nội dung thông báo', 'warning');
      return;
    }
    setIsBroadcasting(true);
    setTimeout(() => {
      setIsBroadcasting(false);
      showToast(`Đã phát thông báo thành công đến toàn bộ ${students.length} phụ huynh lớp ${selectedClass?.name || '10A1'}`, 'success');
      setBroadcastMessage('');
      setIsBroadcastModalOpen(false);
    }, 600);
  };

  return (
    <div className="space-y-4">
      <PageHeader
        breadcrumbItems={[
          { label: 'Lớp học', href: '/teacher/classes' },
          { label: activeTab === 'students' ? 'Hồ sơ học sinh' : 'Thông tin phụ huynh' },
        ]}
        title="Quản lý Học sinh & Phụ huynh"
        action={
          <div className="flex items-center gap-2 shrink-0">
            {activeTab === 'parents' ? (
              <>
                <button
                  onClick={handleExportParentsToCSV}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#041527] border border-[#0e3d54] hover:bg-[#072540] text-slate-200 rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                  title="Xuất danh bạ phụ huynh cả lớp ra file Excel / CSV"
                >
                  <Download className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Xuất danh bạ Excel</span>
                </button>
                <button
                  onClick={() => setIsBroadcastModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0284c7] hover:bg-[#0369a1] text-white rounded-lg text-xs font-bold shadow-sm shadow-cyan-950 transition-colors cursor-pointer border border-cyan-500/40"
                  title="Gửi tin nhắn hoặc thông báo nhanh đến toàn thể phụ huynh trong lớp"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Gửi tin nhắn cả lớp</span>
                </button>
              </>
            ) : (
              <>
                {/* CÁCH 1: THÊM TỪNG HỌC SINH */}
                <button
                  onClick={() => setIsAddSingleModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0284c7] hover:bg-[#0369a1] text-white rounded-lg text-xs font-bold shadow-sm shadow-cyan-950 transition-colors cursor-pointer border border-cyan-500/40"
                  title="Thêm từng học sinh mới vào lớp"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Thêm từng học sinh</span>
                </button>

                {/* CÁCH 2: IMPORT EXCEL */}
                <button
                  onClick={() => setIsImportModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#041527] border border-[#0e3d54] hover:bg-[#072540] text-slate-200 rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                  title="Import danh sách học sinh từ file Excel/CSV"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Import Excel / CSV</span>
                </button>

                {/* ĐỒNG BỘ FIRESTORE */}
                <button
                  onClick={async () => {
                    showToast('Đang đồng bộ dữ liệu lớp & học sinh lên Cloud Firestore...', 'info');
                    try {
                      const res = await db.syncAllToFirestore();
                      showToast(`Đã đồng bộ ${res.classesCount} lớp và ${res.studentsCount} học sinh lên Cloud Firestore!`, 'success');
                    } catch {
                      showToast('Không thể đồng bộ lên Cloud Firestore', 'error');
                    }
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#03233e] hover:bg-[#07355c] text-cyan-300 border border-cyan-500/30 rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                  title="Đồng bộ ngay dữ liệu lên Firestore (Database ID: ai-studio-smartclassqunllp-7b24930b-ccfc-4468-a5eb-d6a1017f55fb)"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Đồng bộ Firestore</span>
                </button>
              </>
            )}
          </div>
        }
      />

      {/* 2 MAIN TABS: 'Danh sách học sinh' & 'Thông tin phụ huynh' */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTab('students')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'students'
              ? 'border-blue-600 text-blue-700 bg-white rounded-t-lg shadow-2xs'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/50'
          }`}
        >
          <Users className="w-4 h-4 text-blue-600" />
          <span>Danh sách học sinh</span>
          <span className="ml-1 text-[11px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-mono">
            {students.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('parents')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'parents'
              ? 'border-blue-600 text-blue-700 bg-white rounded-t-lg shadow-2xs'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/50'
          }`}
        >
          <HeartHandshake className="w-4 h-4 text-indigo-600" />
          <span>Thông tin phụ huynh</span>
          <span className="ml-1 text-[11px] px-1.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-mono">
            {students.length} PH
          </span>
        </button>
      </div>

      {/* Class Switcher and Search Bar: Bố trí theo thứ tự 1 -> 2 -> 3 từ trái qua phải, bỏ combobox Quan hệ viền đỏ */}
      <div className="bg-[#041527] px-3.5 py-2.5 rounded-xl border border-[#0e3d54] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-xs">
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-0">
          {/* 1 (Bên trái): Textbox tìm kiếm */}
          <div className="relative w-full sm:w-80 md:w-96 min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={
                activeTab === 'parents'
                  ? 'Tìm tên phụ huynh, SĐT, email, tên con, địa chỉ...'
                  : 'Tìm tên học sinh, mã HS, tên phụ huynh, SĐT...'
              }
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-[#02101e] border border-[#0e3d54] rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
            />
          </div>

          {/* 2 (Ở giữa): Combobox Lớp học */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-xs font-semibold text-slate-300">Lớp học:</span>
            <select
              value={selectedClassId}
              onChange={e => setSelectedClassId(e.target.value)}
              className="px-2.5 py-1.5 bg-[#02101e] border border-[#0e3d54] rounded-lg text-xs font-bold text-white focus:outline-none focus:border-cyan-400"
            >
              {classes.map(c => (
                <option key={c.id} value={c.id} className="bg-[#041527] text-white">
                  Lớp {c.name} ({c.studentCount} HS)
                </option>
              ))}
            </select>
          </div>

          {/* 3 (Bên phải): Combobox App SmartClass (Đã bỏ combobox Quan hệ viền đỏ) */}
          {activeTab === 'parents' && (
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-xs font-semibold text-slate-300">App SmartClass:</span>
              <select
                value={appStatusFilter}
                onChange={e => setAppStatusFilter(e.target.value)}
                className="px-2.5 py-1.5 bg-[#02101e] border border-[#0e3d54] rounded-lg text-xs font-semibold text-white focus:outline-none focus:border-cyan-400"
              >
                <option value="all" className="bg-[#041527] text-white">Tất cả trạng thái</option>
                <option value="active" className="bg-[#041527] text-white">Đã kết nối app</option>
                <option value="pending" className="bg-[#041527] text-white">Đang chờ kích hoạt</option>
                <option value="not_registered" className="bg-[#041527] text-white">Chưa đăng ký</option>
              </select>
            </div>
          )}
        </div>

        <div className="text-xs text-slate-400 flex items-center gap-2 shrink-0">
          <span>
            Hiển thị{' '}
            <strong className="text-white tabular-nums">
              {activeTab === 'parents' ? filteredParents.length : filteredStudents.length}
            </strong>{' '}
            {activeTab === 'parents' ? 'phụ huynh' : 'học sinh'}
          </span>
          <span className="text-slate-600">·</span>
          <span className="text-cyan-400 font-semibold">{selectedClass?.name || '10A1'}</span>
        </div>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: DANH SÁCH HỌC SINH                                */}
      {/* ========================================================= */}
      {activeTab === 'students' && (
        <div className="bg-[#041527] rounded-2xl border border-[#0e3d54] overflow-hidden shadow-xl">
          {/* Header & Always-Visible Top Horizontal Scrollbar - Luôn hiển thị ngay đầu bảng để cuộn ngang tức thì */}
          <div className="px-4 py-2.5 bg-[#03172c] border-b border-[#0e3d54] flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-slate-300 font-semibold shrink-0">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span>Danh sách học sinh ({filteredStudents.length} học sinh)</span>
            </div>

            {/* Thanh trượt ngang luôn hiển thị trên màn hình - Synced Top Scrollbar */}
            <div className="flex items-center gap-2 flex-1 max-w-lg min-w-[260px] bg-[#02101e] px-2.5 py-1 rounded-xl border border-[#0e3d54]/80">
              <span className="text-[11px] text-cyan-300 font-bold whitespace-nowrap hidden sm:flex items-center gap-1 shrink-0">
                <ArrowLeftRight className="w-3.5 h-3.5 text-cyan-400" />
                Cuộn ngang:
              </span>
              <div
                ref={studentTopScrollRef}
                onScroll={handleStudentTopScroll}
                className="flex-1 overflow-x-auto custom-horizontal-scrollbar py-0.5"
              >
                <div style={{ width: `${Math.max(studentScrollWidth, 1200)}px`, height: '6px' }} />
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => scrollStudentBy(-200)}
                  className="px-2 py-0.5 rounded bg-[#062440] hover:bg-[#0c406e] text-cyan-300 border border-[#0e3d54] text-[10px] font-bold flex items-center gap-0.5 cursor-pointer transition-colors"
                  title="Cuộn sang trái 200px"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Trái</span>
                </button>
                <button
                  type="button"
                  onClick={() => scrollStudentBy(200)}
                  className="px-2 py-0.5 rounded bg-[#062440] hover:bg-[#0c406e] text-cyan-300 border border-[#0e3d54] text-[10px] font-bold flex items-center gap-0.5 cursor-pointer transition-colors"
                  title="Cuộn sang phải 200px"
                >
                  <span className="hidden md:inline">Phải</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          <div
            ref={studentTableContainerRef}
            onScroll={handleStudentTableScroll}
            className="overflow-x-auto custom-horizontal-scrollbar"
          >
            <table className="w-full min-w-[1100px] text-left text-xs border-collapse">
              <thead className="bg-[#051c33] border-b border-[#0e3d54]">
                <tr>
                  <th className="px-4 py-3.5 w-16 text-center text-cyan-300 font-bold uppercase tracking-wider whitespace-nowrap">STT</th>
                  <th className="px-5 py-3.5 min-w-[240px] text-cyan-300 font-bold uppercase tracking-wider whitespace-nowrap">Học sinh</th>
                  <th className="px-5 py-3.5 min-w-[140px] text-cyan-300 font-bold uppercase tracking-wider whitespace-nowrap">Mã học sinh</th>
                  <th className="px-4 py-3.5 min-w-[110px] text-cyan-300 font-bold uppercase tracking-wider whitespace-nowrap">Giới tính</th>
                  <th className="px-5 py-3.5 min-w-[260px] text-cyan-300 font-bold uppercase tracking-wider whitespace-nowrap">Phụ huynh liên hệ</th>
                  <th className="px-4 py-3.5 min-w-[110px] text-cyan-300 font-bold uppercase tracking-wider whitespace-nowrap">Điểm TB</th>
                  <th className="px-4 py-3.5 min-w-[120px] text-cyan-300 font-bold uppercase tracking-wider whitespace-nowrap">Chuyên cần</th>
                  <th className="sticky right-0 z-30 bg-[#051c33] border-l border-[#0e3d54] shadow-[-8px_0_12px_rgba(2,15,28,0.85)] px-4 py-3.5 text-center text-cyan-300 font-bold uppercase tracking-wider whitespace-nowrap w-[135px] min-w-[135px]">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#0e3d54]/60">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center text-slate-400">
                      <div className="max-w-md mx-auto flex flex-col items-center">
                        <div className="w-12 h-12 rounded-2xl bg-cyan-950/80 border border-cyan-800 text-cyan-400 flex items-center justify-center mb-2.5">
                          <Users className="w-6 h-6" />
                        </div>
                        <p className="text-sm font-bold text-white mb-1">
                          Chưa có học sinh nào trong danh sách
                        </p>
                        <p className="text-xs text-slate-400 mb-4">
                          Chọn một trong hai phương thức thêm học sinh dưới đây:
                        </p>
                        <div className="flex flex-wrap items-center justify-center gap-2.5">
                          <button
                            type="button"
                            onClick={() => setIsAddSingleModalOpen(true)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#0284c7] hover:bg-[#0369a1] text-white rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer border border-cyan-500/40"
                          >
                            <UserPlus className="w-3.5 h-3.5" />
                            <span>Cách 1: Thêm từng học sinh</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setIsImportModalOpen(true)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#041527] border border-[#0e3d54] hover:bg-[#072540] text-slate-200 rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer"
                          >
                            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Cách 2: Import file Excel</span>
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map(st => (
                    <tr
                      key={st.id}
                      onClick={() => setSelectedStudentProfile(st)}
                      className="hover:bg-[#062440] transition-colors cursor-pointer group"
                    >
                      <td className="px-4 py-3.5 text-center font-bold text-slate-400 tabular-nums whitespace-nowrap transition-colors hover:bg-cyan-500/15">{st.rollNumber}</td>
                      <td className="px-5 py-3.5 whitespace-nowrap transition-colors hover:bg-cyan-500/15">
                        <div className="flex items-center gap-2.5 whitespace-nowrap">
                          <img
                            src={st.avatarUrl}
                            alt={st.fullName}
                            className="w-7 h-7 rounded-full object-cover ring-1 ring-cyan-500/40 shrink-0"
                          />
                          <span className="font-bold text-white text-xs sm:text-sm whitespace-nowrap">{st.fullName}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 font-mono text-cyan-300 font-semibold whitespace-nowrap transition-colors hover:bg-cyan-500/15">{st.studentCode}</td>
                      <td className="px-4 py-3.5 text-slate-300 whitespace-nowrap transition-colors hover:bg-cyan-500/15">{st.gender}</td>
                      {/* Phụ huynh liên hệ info right in student table */}
                      <td className="px-5 py-3.5 whitespace-nowrap transition-colors hover:bg-cyan-500/15" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center gap-2 whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => setEditingParentStudent(st)}
                            className="font-medium text-left transition-colors cursor-pointer flex items-center gap-2 whitespace-nowrap"
                            title="Bấm để xem và sửa thông tin phụ huynh"
                          >
                            <span className="text-white font-bold text-xs hover:text-cyan-300">{st.parentName || 'Chưa cập nhật'}</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-950 text-blue-300 border border-blue-800 font-semibold">
                              {st.parentRelationship || 'Bố'}
                            </span>
                            <span className="text-xs font-mono text-cyan-300 tabular-nums">
                              {st.parentPhone || '—'}
                            </span>
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 font-bold tabular-nums text-emerald-400 whitespace-nowrap transition-colors hover:bg-cyan-500/15">{st.gpa}</td>
                      <td className="px-4 py-3.5 tabular-nums font-semibold text-cyan-300 whitespace-nowrap transition-colors hover:bg-cyan-500/15">{st.attendanceRate}%</td>
                      <td className="sticky right-0 z-20 bg-[#041527] group-hover:bg-[#062440] border-l border-[#0e3d54] shadow-[-8px_0_12px_rgba(2,15,28,0.85)] px-3 py-3.5 text-center whitespace-nowrap w-[135px] min-w-[135px] transition-colors" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1.5 whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => setSelectedStudentProfile(st)}
                            className="w-8 h-8 rounded-lg text-slate-300 hover:text-cyan-300 bg-[#03172c] hover:bg-[#072a4a] border border-[#0e3d54] hover:border-cyan-400 flex items-center justify-center transition-all cursor-pointer shadow-xs hover:scale-110 shrink-0"
                            title="Xem toàn bộ thông tin chi tiết học sinh"
                          >
                            <Eye className="w-4 h-4 text-cyan-400" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingStudent(st)}
                            className="w-8 h-8 rounded-lg text-slate-300 hover:text-blue-300 bg-[#03172c] hover:bg-[#072a4a] border border-[#0e3d54] hover:border-blue-400 flex items-center justify-center transition-all cursor-pointer shadow-xs hover:scale-110 shrink-0"
                            title="Sửa thông tin học sinh"
                          >
                            <Edit2 className="w-4 h-4 text-blue-400" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeletingStudent(st)}
                            className="w-8 h-8 rounded-lg text-slate-300 hover:text-rose-400 bg-[#03172c] hover:bg-rose-950/60 border border-[#0e3d54] hover:border-rose-500/60 flex items-center justify-center transition-all cursor-pointer shadow-xs hover:scale-110 shrink-0"
                            title="Xóa học sinh (Có kiểm tra ràng buộc nghiệp vụ)"
                          >
                            <Trash2 className="w-4 h-4 text-rose-400" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Sticky Bottom Horizontal Scrollbar - Luôn hiển thị ở chân màn hình để người dùng trượt xem dữ liệu */}
          <div className="sticky bottom-0 z-30 bg-[#03172c]/95 backdrop-blur-md border-t border-[#0e3d54] px-4 py-2 flex items-center justify-between gap-3 shadow-[-4px_-4px_12px_rgba(2,15,28,0.85)]">
            <div className="flex items-center gap-2 shrink-0">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-xs font-bold text-cyan-300">Thanh trượt ngang:</span>
            </div>
            <div
              ref={studentBottomScrollRef}
              onScroll={handleStudentBottomScroll}
              className="flex-1 overflow-x-auto custom-horizontal-scrollbar py-1"
            >
              <div style={{ width: `${Math.max(studentScrollWidth, 1200)}px`, height: '8px' }} />
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => scrollStudentToExtreme(false)}
                className="px-2 py-1 rounded bg-[#062440] hover:bg-[#0c406e] text-cyan-300 border border-[#0e3d54] text-xs font-semibold cursor-pointer transition-colors"
                title="Về đầu bảng"
              >
                Đầu bảng
              </button>
              <button
                type="button"
                onClick={() => scrollStudentBy(-250)}
                className="p-1.5 rounded-lg bg-[#062440] hover:bg-[#0c406e] text-cyan-300 border border-[#0e3d54] text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                title="Cuộn sang trái 250px"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Trái</span>
              </button>
              <button
                type="button"
                onClick={() => scrollStudentBy(250)}
                className="p-1.5 rounded-lg bg-[#062440] hover:bg-[#0c406e] text-cyan-300 border border-[#0e3d54] text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                title="Cuộn sang phải 250px"
              >
                <span className="hidden sm:inline">Phải</span>
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => scrollStudentToExtreme(true)}
                className="px-2 py-1 rounded bg-[#062440] hover:bg-[#0c406e] text-cyan-300 border border-[#0e3d54] text-xs font-semibold cursor-pointer transition-colors"
                title="Đến cuối bảng"
              >
                Cuối bảng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: THÔNG TIN PHỤ HUYNH                                */}
      {/* ========================================================= */}
      {activeTab === 'parents' && (
        <div className="space-y-4">
          {/* Quick Parent KPIs - Bố trí tất cả trên 1 dòng duy nhất để tối ưu không gian */}
          <div className="bg-[#041527] px-3 py-1.5 rounded-xl border border-[#0e3d54] shadow-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[#0e3d54]/70 items-center gap-y-1 sm:gap-y-0">
              {/* Item 1: Tổng số Phụ huynh - 1 dòng */}
              <div className="flex items-center gap-2 sm:pr-2.5 py-1 min-w-0">
                <div className="w-6 h-6 rounded-lg bg-cyan-950/80 border border-cyan-800 text-cyan-400 flex items-center justify-center shrink-0">
                  <Users className="w-3.5 h-3.5" />
                </div>
                <div className="flex items-center gap-1.5 text-xs min-w-0 truncate">
                  <span className="text-slate-400 whitespace-nowrap">Tổng số Phụ huynh:</span>
                  <span className="font-extrabold text-white tabular-nums">{students.length}</span>
                  <span className="text-[11px] text-slate-400 whitespace-nowrap">người</span>
                  <span className="text-[11px] text-slate-500 whitespace-nowrap hidden xl:inline">({fatherCount} Bố · {motherCount} Mẹ)</span>
                </div>
              </div>

              {/* Item 2: Đã kết nối App - 1 dòng */}
              <div className="flex items-center gap-2 sm:px-2.5 py-1 min-w-0">
                <div className="w-6 h-6 rounded-lg bg-emerald-950/80 border border-emerald-800 text-emerald-400 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <div className="flex items-center gap-1.5 text-xs whitespace-nowrap min-w-0">
                  <span className="text-slate-400 whitespace-nowrap">Đã kết nối App:</span>
                  <span className="font-extrabold text-emerald-400 tabular-nums">
                    {activeAppCount}/{students.length}
                  </span>
                  <span className="text-[11px] text-emerald-400 font-semibold whitespace-nowrap">
                    ({Math.round((activeAppCount / (students.length || 1)) * 100)}%)
                  </span>
                </div>
              </div>

              {/* Item 3: Đầy đủ số điện thoại - 1 dòng */}
              <div className="flex items-center gap-2 sm:px-2.5 py-1 min-w-0">
                <div className="w-6 h-6 rounded-lg bg-sky-950/80 border border-sky-800 text-sky-400 flex items-center justify-center shrink-0">
                  <Phone className="w-3.5 h-3.5" />
                </div>
                <div className="flex items-center gap-1.5 text-xs whitespace-nowrap min-w-0">
                  <span className="text-slate-400 whitespace-nowrap">Đầy đủ số điện thoại:</span>
                  <span className="font-extrabold text-sky-400 tabular-nums">
                    {hasPhoneCount}/{students.length}
                  </span>
                  <span className="text-[11px] text-sky-400 font-semibold whitespace-nowrap">
                    ({Math.round((hasPhoneCount / (students.length || 1)) * 100)}%)
                  </span>
                </div>
              </div>

              {/* Item 4: Ban Đại diện CMHS - 1 dòng */}
              <div className="flex items-center gap-2 sm:pl-2.5 py-1 min-w-0">
                <div className="w-6 h-6 rounded-lg bg-purple-950/80 border border-purple-800 text-purple-400 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
                <div className="flex items-center gap-1.5 text-xs truncate min-w-0">
                  <span className="text-slate-400 whitespace-nowrap shrink-0">Ban Đại diện CMHS:</span>
                  <span className="font-bold text-white truncate">Trần Văn Kiên</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-950 text-purple-300 border border-purple-800 font-bold shrink-0 whitespace-nowrap">
                    Trưởng ban
                  </span>
                  <span className="text-[11px] text-slate-500 truncate hidden xl:inline">
                    · Vũ Thị Loan
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Parents Table: Bố trí lại thông tin phụ huynh, tinh gọn các cột quan trọng, xem chi tiết bấm View */}
          <div className="bg-[#041527] rounded-2xl border border-[#0e3d54] overflow-hidden shadow-xl">
            {/* Header bar with Always-Visible Top Horizontal Scrollbar */}
            <div className="px-4 py-2.5 bg-[#03172c] border-b border-[#0e3d54] flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-slate-300 font-semibold shrink-0">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                <span>Danh bạ chi tiết phụ huynh ({filteredParents.length} phụ huynh)</span>
              </div>

              {/* Thanh trượt ngang luôn hiển thị trên màn hình - Synced Top Scrollbar */}
              <div className="flex items-center gap-2 flex-1 max-w-lg min-w-[260px] bg-[#02101e] px-2.5 py-1 rounded-xl border border-[#0e3d54]/80">
                <span className="text-[11px] text-cyan-300 font-bold whitespace-nowrap hidden sm:flex items-center gap-1 shrink-0">
                  <ArrowLeftRight className="w-3.5 h-3.5 text-cyan-400" />
                  Cuộn ngang:
                </span>
                <div
                  ref={parentTopScrollRef}
                  onScroll={handleParentTopScroll}
                  className="flex-1 overflow-x-auto custom-horizontal-scrollbar py-0.5"
                >
                  <div style={{ width: `${Math.max(parentScrollWidth, 1200)}px`, height: '6px' }} />
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => scrollParentBy(-200)}
                    className="px-2 py-0.5 rounded bg-[#062440] hover:bg-[#0c406e] text-cyan-300 border border-[#0e3d54] text-[10px] font-bold flex items-center gap-0.5 cursor-pointer transition-colors"
                    title="Cuộn sang trái 200px"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span className="hidden md:inline">Trái</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => scrollParentBy(200)}
                    className="px-2 py-0.5 rounded bg-[#062440] hover:bg-[#0c406e] text-cyan-300 border border-[#0e3d54] text-[10px] font-bold flex items-center gap-0.5 cursor-pointer transition-colors"
                    title="Cuộn sang phải 200px"
                  >
                    <span className="hidden md:inline">Phải</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            <div
              ref={parentTableContainerRef}
              onScroll={handleParentTableScroll}
              className="overflow-x-auto custom-horizontal-scrollbar"
            >
              <table className="w-full min-w-[1100px] text-left text-xs border-collapse">
                <thead className="bg-[#051c33] border-b border-[#0e3d54]">
                  <tr>
                    <th className="px-4 py-3.5 w-16 text-center text-cyan-300 font-bold uppercase tracking-wider whitespace-nowrap">
                      STT
                    </th>
                    <th className="px-5 py-3.5 min-w-[240px] text-cyan-300 font-bold uppercase tracking-wider whitespace-nowrap">
                      Phụ huynh đại diện
                    </th>
                    <th className="px-5 py-3.5 min-w-[200px] text-cyan-300 font-bold uppercase tracking-wider whitespace-nowrap">
                      Con (Học sinh)
                    </th>
                    <th className="px-5 py-3.5 min-w-[230px] text-cyan-300 font-bold uppercase tracking-wider whitespace-nowrap">
                      Số điện thoại liên hệ
                    </th>
                    <th className="px-5 py-3.5 min-w-[160px] text-cyan-300 font-bold uppercase tracking-wider whitespace-nowrap">
                      SmartClass App
                    </th>
                    {/* Cột Thao tác: CỐ ĐỊNH BÊN PHẢI MÀN HÌNH (sticky right-0) */}
                    <th className="sticky right-0 z-30 bg-[#051c33] border-l border-[#0e3d54] shadow-[-8px_0_12px_rgba(2,15,28,0.85)] px-4 py-3.5 text-center text-cyan-300 font-bold uppercase tracking-wider whitespace-nowrap w-[135px] min-w-[135px]">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#0e3d54]/60">
                  {filteredParents.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-12 text-center text-slate-400">
                        Không tìm thấy phụ huynh nào phù hợp với bộ lọc hiện tại.
                      </td>
                    </tr>
                  ) : (
                    filteredParents.map((st, idx) => (
                      <tr
                        key={st.id}
                        className="hover:bg-[#062440] transition-colors group"
                      >
                        {/* STT */}
                        <td className="px-4 py-3.5 text-center font-bold text-slate-400 tabular-nums whitespace-nowrap transition-colors hover:bg-cyan-500/15">
                          {st.rollNumber || idx + 1}
                        </td>

                        {/* Phụ huynh đại diện: Bỏ badge Trưởng ban / Phó ban CMHS theo yêu cầu */}
                        <td className="px-5 py-3.5 whitespace-nowrap transition-colors hover:bg-cyan-500/15">
                          <div className="flex items-center gap-3 whitespace-nowrap">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-600 to-blue-600 text-white flex items-center justify-center font-bold shrink-0 text-xs shadow-xs border border-cyan-400/40">
                              {(st.parentName || 'P').charAt(0)}
                            </div>
                            <div className="flex items-center gap-2 whitespace-nowrap">
                              <span className="font-bold text-white text-xs sm:text-sm whitespace-nowrap">
                                {st.parentName || 'Chưa cập nhật'}
                              </span>
                              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold whitespace-nowrap shrink-0 border ${
                                st.parentRelationship === 'Mẹ'
                                  ? 'bg-rose-950/80 text-rose-300 border-rose-700/60'
                                  : st.parentRelationship === 'Người giám hộ'
                                  ? 'bg-amber-950/80 text-amber-300 border-amber-700/60'
                                  : 'bg-blue-950/80 text-blue-300 border-blue-700/60'
                              }`}>
                                {st.parentRelationship || 'Bố'}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Con (Học sinh): Bỏ mã học sinh và lớp, chỉ giữ Avatar và Tên học sinh */}
                        <td className="px-5 py-3.5 whitespace-nowrap transition-colors hover:bg-cyan-500/15">
                          <div className="flex items-center gap-2.5 whitespace-nowrap">
                            <img
                              src={st.avatarUrl}
                              alt={st.fullName}
                              className="w-7 h-7 rounded-full object-cover ring-1 ring-cyan-500/40 shrink-0 shadow-xs"
                            />
                            <span className="font-bold text-slate-100 text-xs sm:text-sm whitespace-nowrap">
                              {st.fullName}
                            </span>
                          </div>
                        </td>

                        {/* Phone with quick call / Zalo / copy */}
                        <td className="px-5 py-3.5 whitespace-nowrap transition-colors hover:bg-cyan-500/15">
                          <div className="flex items-center gap-2.5 whitespace-nowrap">
                            <span className="font-mono font-bold text-cyan-300 text-xs sm:text-sm tracking-wide whitespace-nowrap">
                              {st.parentPhone || '—'}
                            </span>
                            {st.parentPhone && (
                              <div className="flex items-center gap-1 shrink-0 whitespace-nowrap">
                                <button
                                  type="button"
                                  onClick={e => handleCopyPhone(e, st.parentPhone)}
                                  className="p-1.5 text-slate-400 hover:text-cyan-300 hover:bg-[#072a4a] rounded-lg transition-colors cursor-pointer border border-[#0e3d54]/60 hover:border-cyan-500/50"
                                  title="Sao chép số điện thoại"
                                >
                                  <Copy className="w-3 h-3" />
                                </button>
                                <a
                                  href={`tel:${st.parentPhone.replace(/[^0-9]/g, '')}`}
                                  className="p-1.5 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-950/70 rounded-lg transition-colors border border-emerald-800/60 hover:border-emerald-600/60"
                                  title="Gọi điện trực tiếp"
                                >
                                  <Phone className="w-3 h-3" />
                                </a>
                                <a
                                  href={`https://zalo.me/${st.parentPhone.replace(/[^0-9]/g, '')}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-2 py-0.5 text-[11px] font-bold bg-[#0284c7]/20 hover:bg-[#0284c7]/40 text-cyan-300 rounded-lg transition-colors border border-cyan-500/50 shadow-2xs whitespace-nowrap"
                                  title="Mở nhắn tin Zalo"
                                >
                                  Zalo
                                </a>
                              </div>
                            )}
                          </div>
                        </td>

                        {/* SmartClass App Status */}
                        <td className="px-5 py-3.5 whitespace-nowrap transition-colors hover:bg-cyan-500/15">
                          {(st.parentAppStatus || 'active') === 'active' ? (
                            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-300 bg-emerald-950/80 px-2.5 py-1 rounded-full border border-emerald-500/50 shadow-xs whitespace-nowrap">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)] animate-pulse" />
                              <span>Đã kết nối</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-300 bg-amber-950/80 px-2.5 py-1 rounded-full border border-amber-500/50 shadow-xs whitespace-nowrap">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                              <span>Chưa kết nối</span>
                            </span>
                          )}
                        </td>

                        {/* Cột Thao tác: CỐ ĐỊNH BÊN PHẢI (sticky right-0) - 3 nút chỉ giữ lại Icon, không ghi chữ */}
                        <td className="sticky right-0 z-20 bg-[#041527] group-hover:bg-[#062440] border-l border-[#0e3d54] shadow-[-8px_0_12px_rgba(2,15,28,0.85)] px-3 py-3.5 text-center whitespace-nowrap w-[135px] min-w-[135px] transition-colors">
                          <div className="flex items-center justify-center gap-1.5 whitespace-nowrap">
                            {/* Nút VIEW: Chỉ Icon */}
                            <button
                              type="button"
                              onClick={() => setViewingParentStudent(st)}
                              className="w-8 h-8 rounded-lg bg-[#031c33] hover:bg-[#073259] text-cyan-300 hover:text-cyan-100 border border-[#0e3d54] hover:border-cyan-400 shadow-xs hover:scale-110 flex items-center justify-center transition-all cursor-pointer shrink-0"
                              title="Xem chi tiết đầy đủ thông tin phụ huynh"
                            >
                              <Eye className="w-4 h-4 text-cyan-400" />
                            </button>

                            {/* Nút EDIT: Chỉ Icon */}
                            <button
                              type="button"
                              onClick={() => setEditingParentStudent(st)}
                              className="w-8 h-8 rounded-lg bg-[#031c33] hover:bg-[#073259] text-blue-300 hover:text-blue-100 border border-[#0e3d54] hover:border-blue-400 shadow-xs hover:scale-110 flex items-center justify-center transition-all cursor-pointer shrink-0"
                              title="Chỉnh sửa thông tin phụ huynh"
                            >
                              <Edit2 className="w-4 h-4 text-blue-400" />
                            </button>

                            {/* Nút LIÊN HỆ: Chỉ Icon */}
                            <button
                              type="button"
                              onClick={() => setContactingParentStudent(st)}
                              className="w-8 h-8 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-xs hover:scale-110 flex items-center justify-center transition-all border border-cyan-400/40 cursor-pointer shrink-0"
                              title="Gửi tin nhắn hoặc gọi điện trực tiếp"
                            >
                              <MessageSquare className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Sticky Bottom Horizontal Scrollbar - Luôn hiển thị ở chân màn hình khi người dùng cuộn dọc danh sách */}
            <div className="sticky bottom-0 z-30 bg-[#03172c]/95 backdrop-blur-md border-t border-[#0e3d54] px-4 py-2 flex items-center justify-between gap-3 shadow-[-4px_-4px_12px_rgba(2,15,28,0.85)]">
              <div className="flex items-center gap-2 shrink-0">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                <span className="text-xs font-bold text-cyan-300">Thanh trượt ngang:</span>
              </div>
              <div
                ref={parentBottomScrollRef}
                onScroll={handleParentBottomScroll}
                className="flex-1 overflow-x-auto custom-horizontal-scrollbar py-1"
              >
                <div style={{ width: `${Math.max(parentScrollWidth, 1200)}px`, height: '8px' }} />
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => scrollParentToExtreme(false)}
                  className="px-2 py-1 rounded bg-[#062440] hover:bg-[#0c406e] text-cyan-300 border border-[#0e3d54] text-xs font-semibold cursor-pointer transition-colors"
                  title="Về đầu bảng"
                >
                  Đầu bảng
                </button>
                <button
                  type="button"
                  onClick={() => scrollParentBy(-250)}
                  className="p-1.5 rounded-lg bg-[#062440] hover:bg-[#0c406e] text-cyan-300 border border-[#0e3d54] text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                  title="Cuộn sang trái 250px"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">Trái</span>
                </button>
                <button
                  type="button"
                  onClick={() => scrollParentBy(250)}
                  className="p-1.5 rounded-lg bg-[#062440] hover:bg-[#0c406e] text-cyan-300 border border-[#0e3d54] text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                  title="Cuộn sang phải 250px"
                >
                  <span className="hidden sm:inline">Phải</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => scrollParentToExtreme(true)}
                  className="px-2 py-1 rounded bg-[#062440] hover:bg-[#0c406e] text-cyan-300 border border-[#0e3d54] text-xs font-semibold cursor-pointer transition-colors"
                  title="Đến cuối bảng"
                >
                  Cuối bảng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: THÊM TỪNG HỌC SINH */}
      <AddSingleStudentModal
        isOpen={isAddSingleModalOpen}
        onClose={() => setIsAddSingleModalOpen(false)}
        classId={selectedClassId}
        className={selectedClass?.name}
        onSuccess={refreshStudents}
      />

      {/* MODAL 2: IMPORT EXCEL / CSV */}
      <ImportExcelStudentsModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        classId={selectedClassId}
        className={selectedClass?.name}
        onSuccess={refreshStudents}
      />

      {/* MODAL: XEM CHI TIẾT THÔNG TIN PHỤ HUYNH (LABEL BÊN TRÁI, TEXTBOX BÊN PHẢI, CANH ĐỀU 2 BÊN) */}
      <ViewParentModal
        isOpen={Boolean(viewingParentStudent)}
        onClose={() => setViewingParentStudent(null)}
        student={viewingParentStudent}
        onEdit={(st) => {
          setViewingParentStudent(null);
          setEditingParentStudent(st);
        }}
        onContact={(st) => {
          setViewingParentStudent(null);
          setContactingParentStudent(st);
        }}
      />

      {/* MODAL 3: SỬA THÔNG TIN PHỤ HUYNH */}
      <EditParentModal
        isOpen={!!editingParentStudent}
        onClose={() => setEditingParentStudent(null)}
        student={editingParentStudent}
        onSuccess={refreshStudents}
      />

      {/* MODAL 4: LIÊN HỆ PHỤ HUYNH */}
      <ContactParentModal
        isOpen={!!contactingParentStudent}
        onClose={() => setContactingParentStudent(null)}
        student={contactingParentStudent}
      />

      {/* MODAL 5: GỬI THÔNG BÁO CHO TOÀN THỂ PHỤ HUYNH LỚP */}
      <Modal
        isOpen={isBroadcastModalOpen}
        onClose={() => setIsBroadcastModalOpen(false)}
        title={`Gửi tin nhắn toàn thể Phụ huynh Lớp ${selectedClass?.name || '10A1'}`}
        subtitle={`Gửi thông báo tới ${students.length} phụ huynh qua Sổ liên lạc điện tử SmartClass`}
        maxWidth="md"
      >
        <form onSubmit={handleSendBroadcastMessage} className="space-y-4">
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-start gap-2">
            <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              Tin nhắn này sẽ được chuyển ngay lập tức tới ứng dụng di động SmartClass của tất cả phụ huynh lớp <strong>{selectedClass?.name || '10A1'}</strong>.
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Nội dung thông báo *
            </label>
            <textarea
              rows={4}
              required
              placeholder="Ví dụ: Kính gửi quý phụ huynh, xin thông báo lịch họp phụ huynh học kỳ 2 vào lúc 8h30 Chủ nhật ngày 15/03/2025 tại phòng A.302..."
              value={broadcastMessage}
              onChange={e => setBroadcastMessage(e.target.value)}
              className="w-full p-2.5 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsBroadcastModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isBroadcasting || !broadcastMessage.trim()}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isBroadcasting ? 'Đang gửi...' : 'Gửi thông báo ngay'}</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL 6: HỒ SƠ HỌC SINH 360° (XEM TOÀN BỘ THÔNG TIN CHI TIẾT) */}
      {selectedStudentProfile && (
        <Modal
          isOpen={!!selectedStudentProfile}
          onClose={() => setSelectedStudentProfile(null)}
          title={`Hồ sơ Toàn diện Học sinh 360° · ${selectedStudentProfile.fullName}`}
          subtitle={`Mã HS: ${selectedStudentProfile.studentCode} · Lớp ${selectedStudentProfile.className || selectedClass?.name || '10A1'} · STT: ${selectedStudentProfile.rollNumber}`}
          maxWidth="lg"
        >
          <div className="space-y-4">
            {/* Student Header */}
            <div className="flex items-center gap-4 pb-3 border-b border-slate-100">
              <img
                src={selectedStudentProfile.avatarUrl}
                alt={selectedStudentProfile.fullName}
                className="w-16 h-16 rounded-2xl object-cover ring-2 ring-slate-100 shadow-2xs"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900">{selectedStudentProfile.fullName}</h3>
                  <span className="text-xs px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md font-bold font-mono">
                    STT: {selectedStudentProfile.rollNumber}
                  </span>
                  <span className="text-xs px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-md font-semibold">
                    Đang theo học
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 mt-1">
                  <span>Mã HS: <strong className="font-mono text-slate-700">{selectedStudentProfile.studentCode}</strong></span>
                  <span>·</span>
                  <span>Lớp: <strong className="text-slate-700">{selectedStudentProfile.className || selectedClass?.name || '10A1'}</strong></span>
                  <span>·</span>
                  <span>Giới tính: <strong className="text-slate-700">{selectedStudentProfile.gender}</strong></span>
                </div>
              </div>
            </div>

            {/* Mục 1: Thông tin chi tiết học sinh & Rèn luyện */}
            <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                  <BookOpen className="w-4 h-4 text-blue-600" />
                  <span>Thông tin học sinh & Kết quả học tập rèn luyện</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const st = selectedStudentProfile;
                    setSelectedStudentProfile(null);
                    setEditingStudent(st);
                  }}
                  className="text-xs font-bold text-blue-600 hover:underline inline-flex items-center gap-1 cursor-pointer"
                >
                  <Edit2 className="w-3 h-3" />
                  <span>Sửa thông tin HS</span>
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="bg-white p-2.5 rounded-lg border border-slate-200/60">
                  <span className="text-slate-400 block text-[11px]">Ngày sinh</span>
                  <span className="font-semibold text-slate-800 mt-0.5 block">{selectedStudentProfile.dob || 'Chưa cập nhật'}</span>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-slate-200/60">
                  <span className="text-slate-400 block text-[11px]">Tổ học tập</span>
                  <span className="font-semibold text-slate-800 mt-0.5 block">{selectedStudentProfile.team || 'Tổ 1'}</span>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-slate-200/60">
                  <span className="text-slate-400 block text-[11px]">Điểm TB (ĐTB)</span>
                  <span className="font-bold text-blue-700 mt-0.5 block tabular-nums">{selectedStudentProfile.gpa}</span>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-slate-200/60">
                  <span className="text-slate-400 block text-[11px]">Hạnh kiểm</span>
                  <span className="font-bold text-emerald-700 mt-0.5 block">{selectedStudentProfile.conduct}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                <div>
                  <span className="text-slate-400">Địa chỉ thường trú học sinh:</span>
                  <div className="font-medium text-slate-800 mt-0.5 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{selectedStudentProfile.address}</span>
                  </div>
                </div>
                <div>
                  <span className="text-slate-400">Tỷ lệ chuyên cần:</span>
                  <div className="font-semibold text-slate-800 mt-0.5 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                    <span className="text-purple-700 font-bold">{selectedStudentProfile.attendanceRate}%</span>
                    <span className="text-slate-400 text-[11px]">(Có mặt đầy đủ các tiết)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Mục 2: Chi tiết Thông tin Phụ huynh đại diện */}
            <div className="p-3.5 bg-blue-50/50 rounded-xl border border-blue-100 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900">
                  <HeartHandshake className="w-4 h-4 text-blue-600" />
                  <span>Thông tin Phụ huynh đại diện (Sổ liên lạc điện tử)</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const st = selectedStudentProfile;
                    setSelectedStudentProfile(null);
                    setEditingParentStudent(st);
                  }}
                  className="text-xs font-bold text-blue-700 hover:underline inline-flex items-center gap-1 cursor-pointer"
                >
                  <Edit2 className="w-3 h-3" />
                  <span>Sửa thông tin PH</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-400">Họ và tên Phụ huynh:</span>
                  <div className="font-bold text-slate-900 mt-0.5 flex items-center gap-1.5">
                    <span>{selectedStudentProfile.parentName || 'Chưa cập nhật'}</span>
                    <span className="text-[10px] px-1.5 py-0.2 bg-blue-100 text-blue-700 rounded font-bold">
                      {selectedStudentProfile.parentRelationship || 'Bố'}
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-slate-400">Số điện thoại liên hệ:</span>
                  <div className="font-mono font-bold text-slate-900 mt-0.5 flex items-center gap-2">
                    <span>{selectedStudentProfile.parentPhone || '—'}</span>
                    {selectedStudentProfile.parentPhone && (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={e => handleCopyPhone(e, selectedStudentProfile.parentPhone)}
                          className="p-1 text-slate-400 hover:text-slate-700 hover:bg-white rounded transition-colors"
                          title="Sao chép SĐT"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                        <a
                          href={`tel:${selectedStudentProfile.parentPhone.replace(/[^0-9]/g, '')}`}
                          className="p-1 text-blue-600 hover:bg-white rounded transition-colors"
                          title="Gọi điện"
                        >
                          <Phone className="w-3 h-3" />
                        </a>
                        <a
                          href={`https://zalo.me/${selectedStudentProfile.parentPhone.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-1.5 py-0.2 text-[10px] font-bold bg-sky-50 text-sky-700 hover:bg-sky-100 rounded border border-sky-200"
                        >
                          Zalo
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <span className="text-slate-400">Email phụ huynh:</span>
                  <div className="font-semibold text-slate-800 mt-0.5 truncate">
                    {selectedStudentProfile.parentEmail || 'Chưa cập nhật'}
                  </div>
                </div>

                <div>
                  <span className="text-slate-400">Trạng thái App SmartClass:</span>
                  <div className="mt-0.5">
                    {(selectedStudentProfile.parentAppStatus || 'active') === 'active' ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span>Đã kết nối ứng dụng</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                        <span>Chưa kết nối ứng dụng</span>
                      </span>
                    )}
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <span className="text-slate-400">Địa chỉ thường trú gia đình:</span>
                  <div className="font-semibold text-slate-800 mt-0.5">
                    {selectedStudentProfile.address}
                  </div>
                </div>

                {selectedStudentProfile.parentNotes && (
                  <div className="sm:col-span-2 p-2.5 bg-white rounded-lg border border-blue-100">
                    <span className="text-[11px] font-bold text-blue-800">Lưu ý / Ghi chú của GVCN:</span>
                    <p className="text-xs text-slate-700 mt-0.5">
                      {selectedStudentProfile.parentNotes}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-slate-100">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const st = selectedStudentProfile;
                    setSelectedStudentProfile(null);
                    setEditingStudent(st);
                  }}
                  className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5 text-blue-600" />
                  <span>Chỉnh sửa học sinh</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const st = selectedStudentProfile;
                    setSelectedStudentProfile(null);
                    setContactingParentStudent(st);
                  }}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Liên hệ Phụ huynh</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedStudentProfile(null)}
                  className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Edit Student Modal */}
      <EditStudentModal
        isOpen={Boolean(editingStudent)}
        onClose={() => setEditingStudent(null)}
        student={editingStudent}
        onSuccess={refreshStudents}
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
  );
};

