import React, { useState, useEffect } from 'react';
import {
  User,
  Calendar,
  Phone,
  MapPin,
  Hash,
  Users,
  HeartHandshake,
  ArrowRight,
  ArrowLeft,
  Mail,
  Save,
  GraduationCap,
  AlertCircle,
  CheckCircle2,
  Activity
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { Student, Classroom } from '../../types';
import { db } from '../../services/db';
import { useToast } from '../../contexts/ToastContext';

interface EditStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
  onSuccess: () => void;
}

export const EditStudentModal: React.FC<EditStudentModalProps> = ({
  isOpen,
  onClose,
  student,
  onSuccess,
}) => {
  const { showToast } = useToast();
  const [classes, setClasses] = useState<Classroom[]>([]);

  // 2 Tabs: 'student' (Thông tin học sinh) & 'parent' (Thông tin phụ huynh)
  const [activeTab, setActiveTab] = useState<'student' | 'parent'>('student');

  // --- Student Info States ---
  const [fullName, setFullName] = useState('');
  const [studentCode, setStudentCode] = useState('');
  const [gender, setGender] = useState<'Nam' | 'Nữ'>('Nam');
  const [dob, setDob] = useState('');
  const [classId, setClassId] = useState('');
  const [rollNumber, setRollNumber] = useState<number>(1);
  const [team, setTeam] = useState('Tổ 1');
  const [status, setStatus] = useState<'active' | 'leave' | 'suspended'>('active');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [gpa, setGpa] = useState<number>(8.0);
  const [conduct, setConduct] = useState<'Tốt' | 'Khá' | 'Trung bình'>('Tốt');
  const [attendanceRate, setAttendanceRate] = useState<number>(100);

  // --- Parent Info States ---
  const [parentName, setParentName] = useState('');
  const [parentRelationship, setParentRelationship] = useState<'Bố' | 'Mẹ' | 'Người giám hộ'>('Bố');
  const [parentPhone, setParentPhone] = useState('');
  const [parentEmail, setParentEmail] = useState('');
  const [parentAddress, setParentAddress] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setClasses(db.getClasses());
  }, [isOpen]);

  useEffect(() => {
    if (student && isOpen) {
      setActiveTab('student');
      setFullName(student.fullName || '');
      setStudentCode(student.studentCode || '');
      setGender(student.gender || 'Nam');
      setDob(student.dob || '2009-05-15');
      setClassId(student.classId || '');
      setRollNumber(student.rollNumber || 1);
      setTeam(student.team || 'Tổ 1');
      setStatus(student.status || 'active');
      setPhone(student.phone || '');
      setAddress(student.address || '');
      setGpa(student.gpa ?? 8.0);
      setConduct(student.conduct || 'Tốt');
      setAttendanceRate(student.attendanceRate ?? 100);

      // Parent info
      setParentName(student.parentName || '');
      setParentRelationship((student.parentRelationship as any) || 'Bố');
      setParentPhone(student.parentPhone || '');
      setParentEmail(student.parentEmail || '');
      setParentAddress(student.address || '');
    }
  }, [student, isOpen]);

  if (!student) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setActiveTab('student');
      showToast('Vui lòng nhập họ và tên học sinh', 'warning');
      return;
    }
    if (!studentCode.trim()) {
      setActiveTab('student');
      showToast('Vui lòng nhập mã học sinh', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      const selectedClass = classes.find(c => c.id === classId);
      const targetClassName = selectedClass?.name || student.className;

      const finalAddress = parentAddress.trim() || address.trim() || student.address;

      const updated = db.updateStudent(student.id, {
        fullName: fullName.trim(),
        studentCode: studentCode.trim(),
        gender,
        dob,
        classId: classId || student.classId,
        className: targetClassName,
        rollNumber,
        team,
        status,
        phone: phone.trim() || undefined,
        address: finalAddress,
        gpa,
        conduct,
        attendanceRate,
        parentName: parentName.trim() || undefined,
        parentRelationship,
        parentPhone: parentPhone.trim() || undefined,
        parentEmail: parentEmail.trim() || undefined,
      });

      if (updated) {
        showToast(`Đã cập nhật thông tin học sinh ${updated.fullName} thành công!`, 'success');
        onSuccess();
        onClose();
      } else {
        showToast('Không tìm thấy học sinh cần cập nhật', 'error');
      }
    } catch (err) {
      showToast('Đã có lỗi xảy ra khi cập nhật học sinh', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Sửa thông tin học sinh"
      subtitle={`${student.fullName} (Mã HS: ${student.studentCode} · Lớp: ${student.className})`}
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* ========================================================= */}
        {/* 2 TABS: Thông tin học sinh & Thông tin phụ huynh            */}
        {/* ========================================================= */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200">
          <button
            type="button"
            onClick={() => setActiveTab('student')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'student'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Thông tin học sinh</span>
            {fullName.trim() && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('parent')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'parent'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Thông tin phụ huynh</span>
            {(parentName.trim() || parentPhone.trim()) && (
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
            )}
          </button>
        </div>

        {/* ========================================================= */}
        {/* TAB 1: THÔNG TIN HỌC SINH                                */}
        {/* ========================================================= */}
        {activeTab === 'student' && (
          <div className="space-y-3 py-1">
            {/* Grid 2 cột: Label bên trái, textbox/combobox bên phải */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2.5">
              {/* 1. Họ và tên học sinh */}
              <div className="flex items-center gap-2">
                <label className="w-24 sm:w-28 text-xs font-semibold text-slate-700 shrink-0">
                  Họ và tên <span className="text-red-500">*</span>
                </label>
                <div className="flex-1 relative min-w-0">
                  <User className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="Họ và tên học sinh"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                </div>
              </div>

              {/* 2. Mã học sinh */}
              <div className="flex items-center gap-2">
                <label className="w-24 sm:w-28 text-xs font-semibold text-slate-700 shrink-0">
                  Mã học sinh <span className="text-red-500">*</span>
                </label>
                <div className="flex-1 relative min-w-0">
                  <Hash className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="Mã HS"
                    value={studentCode}
                    onChange={e => setStudentCode(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs font-mono font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                </div>
              </div>

              {/* 3. Lớp học */}
              <div className="flex items-center gap-2">
                <label className="w-24 sm:w-28 text-xs font-semibold text-slate-700 shrink-0">
                  Lớp học
                </label>
                <div className="flex-1 min-w-0">
                  <select
                    value={classId}
                    onChange={e => setClassId(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white cursor-pointer"
                  >
                    {classes.map(c => (
                      <option key={c.id} value={c.id}>
                        Lớp {c.name} (Khối {c.gradeLevel})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 4. Giới tính - Combobox mặc định hiển thị giới tính được chọn */}
              <div className="flex items-center gap-2">
                <label className="w-24 sm:w-28 text-xs font-semibold text-slate-700 shrink-0">
                  Giới tính
                </label>
                <div className="flex-1 min-w-0">
                  <select
                    value={gender}
                    onChange={e => setGender(e.target.value as 'Nam' | 'Nữ')}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white cursor-pointer"
                  >
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                  </select>
                </div>
              </div>

              {/* 5. Ngày sinh */}
              <div className="flex items-center gap-2">
                <label className="w-24 sm:w-28 text-xs font-semibold text-slate-700 shrink-0">
                  Ngày sinh
                </label>
                <div className="flex-1 relative min-w-0">
                  <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="date"
                    value={dob}
                    onChange={e => setDob(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                </div>
              </div>

              {/* 6. Số điện thoại học sinh */}
              <div className="flex items-center gap-2">
                <label className="w-24 sm:w-28 text-xs font-semibold text-slate-700 shrink-0">
                  Số điện thoại
                </label>
                <div className="flex-1 relative min-w-0">
                  <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    placeholder="0987.xxx.xxx"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Trạng thái học tập */}
            <div className="flex items-center gap-2 pt-0.5">
              <label className="w-24 sm:w-28 text-xs font-semibold text-slate-700 shrink-0">
                Trạng thái
              </label>
              <div className="flex-1 min-w-0 flex items-center gap-3">
                <select
                  value={status}
                  onChange={e => setStatus(e.target.value as any)}
                  className={`w-56 px-3 py-1.5 border rounded-lg text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white cursor-pointer ${
                    status === 'active'
                      ? 'border-emerald-300 text-emerald-700 bg-emerald-50/40'
                      : status === 'leave'
                      ? 'border-amber-300 text-amber-700 bg-amber-50/40'
                      : 'border-slate-300 text-slate-700'
                  }`}
                >
                  <option value="active">🟢 Đang theo học</option>
                  <option value="leave">🟠 Đã thôi học</option>
                  <option value="suspended">⚪ Bảo lưu / Đình chỉ</option>
                </select>
                <span className="text-[11px] text-slate-500 hidden sm:inline">
                  {status === 'active'
                    ? '(Bảo vệ dữ liệu, không thể xóa học sinh khi đang theo học)'
                    : '(Cho phép xóa hồ sơ học sinh khi đã thôi học)'}
                </span>
              </div>
            </div>

            {/* Địa chỉ thường trú học sinh */}
            <div className="flex items-center gap-2 pt-0.5">
              <label className="w-24 sm:w-28 text-xs font-semibold text-slate-700 shrink-0">
                Địa chỉ
              </label>
              <div className="flex-1 relative min-w-0">
                <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Số nhà, đường phố, Quận/Huyện, Tỉnh/TP..."
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                />
              </div>
            </div>

            {/* Đánh giá học tập & Rèn luyện: Thanh ngang gọn gàng, tiết kiệm diện tích */}
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80">
              <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
                <span>Kết quả Học tập & Rèn luyện</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div className="flex items-center gap-2 bg-white px-2.5 py-1.5 rounded-lg border border-slate-200">
                  <label className="text-xs font-medium text-slate-600 shrink-0">Điểm TB:</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    value={gpa}
                    onChange={e => setGpa(Number(e.target.value))}
                    className="w-full px-2 py-0.5 border border-slate-300 rounded text-xs font-bold text-blue-700 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex items-center gap-2 bg-white px-2.5 py-1.5 rounded-lg border border-slate-200">
                  <label className="text-xs font-medium text-slate-600 shrink-0">Hạnh kiểm:</label>
                  <select
                    value={conduct}
                    onChange={e => setConduct(e.target.value as any)}
                    className="w-full px-1.5 py-0.5 border border-slate-300 rounded text-xs font-semibold text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  >
                    <option value="Tốt">Tốt</option>
                    <option value="Khá">Khá</option>
                    <option value="Trung bình">Trung bình</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 bg-white px-2.5 py-1.5 rounded-lg border border-slate-200">
                  <label className="text-xs font-medium text-slate-600 shrink-0">Chuyên cần:</label>
                  <div className="flex items-center gap-1 w-full">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={attendanceRate}
                      onChange={e => setAttendanceRate(Number(e.target.value))}
                      className="w-full px-2 py-0.5 border border-slate-300 rounded text-xs font-bold text-emerald-700 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-xs font-medium text-slate-500">%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Hyperlink chuyển nhanh sang tab phụ huynh */}
            <div className="px-3 py-2 bg-slate-50/80 rounded-xl border border-slate-200/70 flex items-center justify-between text-xs">
              <span className="text-slate-600">
                Cần cập nhật thông tin liên hệ Bố/Mẹ cho học sinh này?
              </span>
              <button
                type="button"
                onClick={() => setActiveTab('parent')}
                className="font-bold text-blue-600 hover:text-blue-800 underline underline-offset-2 cursor-pointer inline-flex items-center gap-1 transition-colors"
              >
                <span>Sang tab Phụ huynh</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: THÔNG TIN PHỤ HUYNH                                */}
        {/* ========================================================= */}
        {activeTab === 'parent' && (
          <div className="space-y-3 py-1">
            <div className="p-2.5 bg-indigo-50/70 border border-indigo-100 rounded-xl text-xs text-indigo-900 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>
                  Phụ huynh của học sinh: <strong className="text-indigo-950">{fullName.trim() || student.fullName}</strong>
                </span>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('student')}
                className="text-indigo-700 hover:text-indigo-900 font-semibold underline underline-offset-2 inline-flex items-center gap-1 cursor-pointer text-xs"
              >
                <ArrowLeft className="w-3 h-3" />
                <span>Về tab học sinh</span>
              </button>
            </div>

            {/* Grid 2 cột: Label bên trái, textbox/combobox bên phải */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2.5">
              {/* 1. Họ và tên Bố / Mẹ */}
              <div className="flex items-center gap-2">
                <label className="w-24 sm:w-28 text-xs font-semibold text-slate-700 shrink-0">
                  Họ tên Bố/Mẹ
                </label>
                <div className="flex-1 relative min-w-0">
                  <User className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Ví dụ: Nguyễn Văn Hùng"
                    value={parentName}
                    onChange={e => setParentName(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                </div>
              </div>

              {/* 2. Mối quan hệ */}
              <div className="flex items-center gap-2">
                <label className="w-24 sm:w-28 text-xs font-semibold text-slate-700 shrink-0">
                  Mối quan hệ
                </label>
                <div className="flex-1 min-w-0">
                  <select
                    value={parentRelationship}
                    onChange={e => setParentRelationship(e.target.value as any)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white cursor-pointer"
                  >
                    <option value="Bố">Bố</option>
                    <option value="Mẹ">Mẹ</option>
                    <option value="Người giám hộ">Người giám hộ</option>
                  </select>
                </div>
              </div>

              {/* 3. Số điện thoại */}
              <div className="flex items-center gap-2">
                <label className="w-24 sm:w-28 text-xs font-semibold text-slate-700 shrink-0">
                  Số điện thoại
                </label>
                <div className="flex-1 relative min-w-0">
                  <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    placeholder="0913.xxx.xxx"
                    value={parentPhone}
                    onChange={e => setParentPhone(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs font-mono font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                </div>
              </div>

              {/* 4. Email */}
              <div className="flex items-center gap-2">
                <label className="w-24 sm:w-28 text-xs font-semibold text-slate-700 shrink-0">
                  Email
                </label>
                <div className="flex-1 relative min-w-0">
                  <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    placeholder="phuhuynh@gmail.com"
                    value={parentEmail}
                    onChange={e => setParentEmail(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                </div>
              </div>
            </div>

            {/* 5. Địa chỉ thường trú phụ huynh */}
            <div className="flex items-start gap-2 pt-0.5">
              <div className="w-24 sm:w-28 shrink-0 pt-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Địa chỉ
                </label>
                {address && address !== parentAddress && (
                  <button
                    type="button"
                    onClick={() => setParentAddress(address)}
                    className="text-[11px] text-blue-600 hover:text-blue-800 underline cursor-pointer font-medium mt-0.5 block"
                  >
                    Sao chép từ HS
                  </button>
                )}
              </div>
              <div className="flex-1 relative min-w-0">
                <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <textarea
                  rows={2}
                  placeholder="Số nhà, đường phố, phường/xã, quận/huyện, tỉnh/TP..."
                  value={parentAddress}
                  onChange={e => setParentAddress(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white leading-relaxed resize-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* Footer actions */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <div>
            {activeTab === 'parent' ? (
              <button
                type="button"
                onClick={() => setActiveTab('student')}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Quay lại tab học sinh</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setActiveTab('parent')}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
              >
                <span>Chuyển sang tab phụ huynh</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !fullName.trim()}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Đang lưu...' : 'Lưu thay đổi'}</span>
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
