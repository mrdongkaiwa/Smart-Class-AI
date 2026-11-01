import React, { useState, useEffect } from 'react';
import {
  Users,
  User,
  Phone,
  Mail,
  MapPin,
  FileText,
  CheckCircle2,
  AlertCircle,
  Save,
  X,
  Briefcase,
  ShieldCheck,
  HeartHandshake
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { Student } from '../../types';
import { db } from '../../services/db';
import { useToast } from '../../contexts/ToastContext';

interface EditParentModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
  onSuccess: () => void;
}

export const EditParentModal: React.FC<EditParentModalProps> = ({
  isOpen,
  onClose,
  student,
  onSuccess,
}) => {
  const { showToast } = useToast();

  const [parentName, setParentName] = useState('');
  const [parentRelationship, setParentRelationship] = useState<'Bố' | 'Mẹ' | 'Người giám hộ'>('Bố');
  const [parentPhone, setParentPhone] = useState('');
  const [parentEmail, setParentEmail] = useState('');
  const [parentJob, setParentJob] = useState('');
  const [address, setAddress] = useState('');
  const [parentAppStatus, setParentAppStatus] = useState<'active' | 'pending' | 'not_registered'>('active');
  const [committeeRole, setCommitteeRole] = useState<'none' | 'truong_ban' | 'pho_ban' | 'thanh_vien'>('none');
  const [parentNotes, setParentNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (student && isOpen) {
      setParentName(student.parentName || '');
      setParentRelationship((student.parentRelationship as any) || 'Bố');
      setParentPhone(student.parentPhone || '');
      setParentEmail(student.parentEmail || '');
      setParentJob(student.parentJob || '');
      setAddress(student.address || '');
      setParentAppStatus(student.parentAppStatus || 'active');

      const notes = student.parentNotes || '';
      if (notes.includes('Trưởng ban')) {
        setCommitteeRole('truong_ban');
      } else if (notes.includes('Phó ban')) {
        setCommitteeRole('pho_ban');
      } else if (notes.includes('Thành viên ban')) {
        setCommitteeRole('thanh_vien');
      } else {
        setCommitteeRole('none');
      }

      setParentNotes(notes);
    }
  }, [student, isOpen]);

  if (!student) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!parentName.trim()) {
      showToast('Vui lòng nhập họ và tên phụ huynh', 'warning');
      return;
    }
    if (!parentPhone.trim()) {
      showToast('Vui lòng nhập số điện thoại phụ huynh', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      // Chuẩn hóa ghi chú kèm chức vụ ban đại diện
      let cleanNotes = parentNotes.trim();
      // Remove any previous role keywords from notes to avoid duplication
      cleanNotes = cleanNotes
        .replace(/Trưởng ban đại diện CMHS\.?\s*/g, '')
        .replace(/Trưởng ban ĐD CMHS\.?\s*/g, '')
        .replace(/Phó ban đại diện CMHS\.?\s*/g, '')
        .replace(/Phó ban ĐD CMHS\.?\s*/g, '')
        .replace(/Thành viên Ban Đại diện CMHS\.?\s*/g, '')
        .trim();

      let finalNotes = cleanNotes;
      if (committeeRole === 'truong_ban') {
        finalNotes = cleanNotes ? `Trưởng ban đại diện CMHS. ${cleanNotes}` : 'Trưởng ban đại diện CMHS';
      } else if (committeeRole === 'pho_ban') {
        finalNotes = cleanNotes ? `Phó ban đại diện CMHS. ${cleanNotes}` : 'Phó ban đại diện CMHS';
      } else if (committeeRole === 'thanh_vien') {
        finalNotes = cleanNotes ? `Thành viên Ban Đại diện CMHS. ${cleanNotes}` : 'Thành viên Ban Đại diện CMHS';
      }

      const updated = db.updateStudentParentInfo(student.id, {
        parentName: parentName.trim(),
        parentRelationship,
        parentPhone: parentPhone.trim(),
        parentEmail: parentEmail.trim(),
        parentJob: parentJob.trim(),
        address: address.trim(),
        parentAppStatus,
        parentNotes: finalNotes,
      });

      if (updated) {
        showToast(`Đã cập nhật thông tin phụ huynh cho học sinh ${student.fullName}`, 'success');
        onSuccess();
        onClose();
      } else {
        showToast('Không tìm thấy học sinh cần cập nhật', 'error');
      }
    } catch (err) {
      showToast('Đã có lỗi xảy ra khi cập nhật', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Chỉnh sửa Thông tin Phụ huynh"
      subtitle={`Học sinh: ${student.fullName} (STT: ${student.rollNumber} · Lớp ${student.className || '10A1'})`}
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Student Mini Summary Banner */}
        <div className="flex items-center gap-3 p-3.5 bg-blue-50/70 border border-blue-100 rounded-2xl shadow-2xs">
          <img
            src={student.avatarUrl}
            alt={student.fullName}
            className="w-10 h-10 rounded-full object-cover ring-2 ring-white shadow-2xs"
          />
          <div className="flex-1 min-w-0">
            <div className="text-xs font-bold text-slate-900 truncate">
              {student.fullName}
            </div>
            <div className="text-[11px] text-slate-500">
              Mã HS: <span className="font-mono text-slate-700 font-semibold">{student.studentCode}</span> · {student.team} · Lớp {student.className || '10A1'}
            </div>
          </div>
          <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-blue-100 text-blue-700">
            STT: {student.rollNumber}
          </span>
        </div>

        {/* Khung nhập liệu canh đều 2 bên, không gò bó */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-2xs space-y-4">
          {/* Row 1: Họ tên & Mối quan hệ */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-blue-600" />
                <span>Họ và tên Phụ huynh *</span>
              </label>
              <input
                type="text"
                required
                placeholder="Ví dụ: Nguyễn Văn Hùng"
                value={parentName}
                onChange={e => setParentName(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <HeartHandshake className="w-3.5 h-3.5 text-indigo-600" />
                <span>Mối quan hệ *</span>
              </label>
              <select
                value={parentRelationship}
                onChange={e => setParentRelationship(e.target.value as any)}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-2xs"
              >
                <option value="Bố">Bố</option>
                <option value="Mẹ">Mẹ</option>
                <option value="Người giám hộ">Người giám hộ</option>
              </select>
            </div>
          </div>

          {/* Row 2: Số điện thoại & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-sky-600" />
                <span>Số điện thoại liên hệ chính *</span>
              </label>
              <input
                type="tel"
                required
                placeholder="0913 556 778"
                value={parentPhone}
                onChange={e => setParentPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-violet-600" />
                <span>Email phụ huynh</span>
              </label>
              <input
                type="email"
                placeholder="phuhuynh@smartclass.edu.vn"
                value={parentEmail}
                onChange={e => setParentEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs bg-white"
              />
            </div>
          </div>

          {/* Row 3: Nghề nghiệp & Ban Đại diện CMHS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-teal-600" />
                <span>Nghề nghiệp / Đơn vị công tác</span>
              </label>
              <input
                type="text"
                placeholder="Ví dụ: Kỹ sư phần mềm / Kinh doanh"
                value={parentJob}
                onChange={e => setParentJob(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                <span>Ban Đại diện Cha mẹ Học sinh</span>
              </label>
              <select
                value={committeeRole}
                onChange={e => setCommitteeRole(e.target.value as any)}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-2xs"
              >
                <option value="none">Phụ huynh học sinh lớp (Không tham gia BĐD)</option>
                <option value="truong_ban">Trưởng ban Đại diện CMHS</option>
                <option value="pho_ban">Phó ban Đại diện CMHS</option>
                <option value="thanh_vien">Thành viên Ban Đại diện CMHS</option>
              </select>
            </div>
          </div>

          {/* Row 4: Trạng thái ứng dụng SmartClass */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Trạng thái kết nối ứng dụng SmartClass</span>
            </label>
            <select
              value={parentAppStatus}
              onChange={e => setParentAppStatus(e.target.value as any)}
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-2xs"
            >
              <option value="active">Đã kết nối ứng dụng (Sổ liên lạc online hoạt động)</option>
              <option value="pending">Đang chờ kích hoạt tài khoản</option>
              <option value="not_registered">Chưa đăng ký tài khoản ứng dụng</option>
            </select>
          </div>

          {/* Row 5: Địa chỉ thường trú */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-amber-600" />
              <span>Địa chỉ thường trú gia đình</span>
            </label>
            <textarea
              rows={2}
              placeholder="Số nhà, đường phố, phường/xã, quận/huyện, tỉnh/thành phố..."
              value={address}
              onChange={e => setAddress(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white leading-relaxed resize-y shadow-2xs min-h-[60px]"
            />
          </div>

          {/* Row 6: Ghi chú của GVCN */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-rose-600" />
              <span>Ghi chú riêng của GVCN (Lưu ý về gia đình, kênh trao đổi...)</span>
            </label>
            <textarea
              rows={2}
              placeholder="Ví dụ: Phụ huynh rất quan tâm, thường xuyên trao đổi qua Zalo. Nhắn tin trước khi gọi..."
              value={parentNotes}
              onChange={e => setParentNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-2xs min-h-[60px]"
            />
          </div>
        </div>

        {/* Footer actions */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-xs shadow-blue-500/25 transition-all hover:scale-[1.01] cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{isSubmitting ? 'Đang lưu...' : 'Lưu thông tin phụ huynh'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
