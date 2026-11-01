import React, { useState, useEffect } from 'react';
import {
  UserPlus,
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
  ChevronRight
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { db } from '../../services/db';
import { useToast } from '../../contexts/ToastContext';

interface AddSingleStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  classId: string;
  className?: string;
  onSuccess: () => void;
}

export const AddSingleStudentModal: React.FC<AddSingleStudentModalProps> = ({
  isOpen,
  onClose,
  classId,
  className,
  onSuccess,
}) => {
  const { showToast } = useToast();

  // 2 Tabs inside Add Student Modal: 'student' (Thông tin học sinh) & 'parent' (Thông tin phụ huynh)
  const [activeTab, setActiveTab] = useState<'student' | 'parent'>('student');

  // --- Student Info States ---
  const [fullName, setFullName] = useState('');
  const [studentCode, setStudentCode] = useState('');
  const [gender, setGender] = useState<'Nam' | 'Nữ'>('Nam');
  const [dob, setDob] = useState('2009-05-15');
  const [rollNumber, setRollNumber] = useState<number>(1);
  const [team, setTeam] = useState('Tổ 1');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('Hà Nội');

  // --- Parent Info States ---
  // Gồm: Tên bố / mẹ, SĐT, Email, Địa chỉ thường trú (bỏ mục nghề nghiệp)
  const [parentName, setParentName] = useState('');
  const [parentRelationship, setParentRelationship] = useState<'Bố' | 'Mẹ' | 'Người giám hộ'>('Bố');
  const [parentPhone, setParentPhone] = useState('');
  const [parentEmail, setParentEmail] = useState('');
  const [parentAddress, setParentAddress] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto calculate default next roll number & code when modal opens
  useEffect(() => {
    if (isOpen && classId) {
      setActiveTab('student');
      const existing = db.getStudents(classId);
      const nextNum = existing.length + 1;
      setRollNumber(nextNum);
      setStudentCode(`HS2024-${String(nextNum).padStart(3, '0')}`);
      setTeam(`Tổ ${Math.min(4, Math.floor((nextNum - 1) / 8) + 1)}`);
      setFullName('');
      setPhone('');
      setAddress('Hà Nội');
      setParentName('');
      setParentRelationship('Bố');
      setParentPhone('');
      setParentEmail('');
      setParentAddress('');
    }
  }, [isOpen, classId]);

  // When student address changes, auto-suggest for parent address if empty
  const handleStudentAddressChange = (val: string) => {
    setAddress(val);
    if (!parentAddress || parentAddress === address) {
      setParentAddress(val);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setActiveTab('student');
      showToast('Vui lòng nhập họ và tên học sinh', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      const targetClass = db.getClassById(classId);
      const currentClassName = className || targetClass?.name || '10A1';

      const avatarImages = [
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150',
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
        'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      ];
      const avatarUrl = avatarImages[Math.floor(Math.random() * avatarImages.length)];

      const finalAddress = parentAddress.trim() || address.trim() || 'Hà Nội';

      const created = db.createStudent({
        studentCode: studentCode.trim() || `HS2024-${String(rollNumber).padStart(3, '0')}`,
        fullName: fullName.trim(),
        dob,
        gender,
        classId,
        className: currentClassName,
        rollNumber,
        team,
        avatarUrl,
        address: finalAddress,
        phone: phone.trim() || '',
        parentName: parentName.trim() || '',
        parentRelationship,
        parentPhone: parentPhone.trim() || '',
        parentEmail: parentEmail.trim() || '',
        parentAppStatus: 'active',
        status: 'active',
      });

      showToast(`Đã thêm thành công học sinh ${created.fullName} vào lớp!`, 'success');
      onSuccess();
      onClose();
    } catch (err) {
      showToast('Đã xảy ra lỗi khi thêm học sinh', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Thêm từng học sinh"
      subtitle={`Nhập hồ sơ học sinh và thông tin phụ huynh vào lớp ${className || ''}`}
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* ========================================================= */}
        {/* 2 TABS: 1 tab tên: Thông tin học sinh, 1 tab tên: Thông tin phụ huynh */}
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
                    autoFocus
                    placeholder="Ví dụ: Nguyễn Hoàng Nam..."
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

              {/* 3. Giới tính - Combobox mặc định hiển thị giới tính được chọn */}
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

              {/* 4. Ngày sinh */}
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

              {/* 5. Số điện thoại học sinh */}
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

              {/* 6. Lớp học cố định */}
              <div className="flex items-center gap-2">
                <label className="w-24 sm:w-28 text-xs font-semibold text-slate-700 shrink-0">
                  Phân vào lớp
                </label>
                <div className="flex-1 min-w-0">
                  <div className="px-3 py-1.5 bg-slate-100 rounded-lg border border-slate-200 text-xs font-bold text-slate-700">
                    Lớp {className}
                  </div>
                </div>
              </div>
            </div>

            {/* 7. Địa chỉ thường trú học sinh */}
            <div className="flex items-center gap-2 pt-0.5">
              <label className="w-24 sm:w-28 text-xs font-semibold text-slate-700 shrink-0">
                Địa chỉ
              </label>
              <div className="flex-1 relative min-w-0">
                <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Quận/Huyện, Tỉnh/TP..."
                  value={address}
                  onChange={e => handleStudentAddressChange(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                />
              </div>
            </div>

            {/* HYPERLINK AT THE BOTTOM: CHUYỂN SANG TAB PHỤ HUYNH */}
            <div className="px-3 py-2 bg-slate-50/80 border border-slate-200/70 rounded-xl flex items-center justify-between text-xs">
              <span className="text-slate-600">
                Cần thêm thông tin liên lạc Bố/Mẹ cho học sinh này?
              </span>
              <button
                type="button"
                onClick={() => setActiveTab('parent')}
                className="font-bold text-blue-600 hover:text-blue-800 underline underline-offset-2 cursor-pointer inline-flex items-center gap-1 transition-colors"
                title="Bấm vào hyperlink này để nhảy qua tab thông tin phụ huynh"
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
            {/* Header context card with back-link */}
            <div className="p-2.5 bg-indigo-50/70 border border-indigo-100 rounded-xl text-xs text-indigo-900 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>
                  Phụ huynh đại diện cho học sinh: <strong className="text-indigo-950">{fullName.trim() || 'Chưa đặt tên'}</strong>
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
                    autoFocus
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

            {/* 5. Địa chỉ thường trú */}
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
                  placeholder="Nhập địa chỉ thường trú đầy đủ của phụ huynh (Số nhà, đường phố, phường/xã, quận/huyện, tỉnh/TP)..."
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
              <UserPlus className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Đang lưu...' : 'Thêm học sinh ngay'}</span>
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
