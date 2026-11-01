import React from 'react';
import {
  User,
  Users,
  Phone,
  Mail,
  MapPin,
  FileText,
  CheckCircle2,
  AlertCircle,
  Copy,
  ExternalLink,
  Edit2,
  MessageSquare,
  ShieldCheck,
  Briefcase,
  GraduationCap,
  Smartphone,
  HeartHandshake
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { Student } from '../../types';
import { useToast } from '../../contexts/ToastContext';

interface ViewParentModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
  onEdit: (student: Student) => void;
  onContact: (student: Student) => void;
}

export const ViewParentModal: React.FC<ViewParentModalProps> = ({
  isOpen,
  onClose,
  student,
  onEdit,
  onContact,
}) => {
  const { showToast } = useToast();

  if (!student) return null;

  const handleCopy = (text?: string, label: string = 'thông tin') => {
    if (text) {
      navigator.clipboard.writeText(text.replace(/\s+/g, ' '));
      showToast(`Đã sao chép ${label}: ${text}`, 'info');
    }
  };

  const cleanPhone = student.parentPhone ? student.parentPhone.replace(/[^0-9]/g, '') : '';
  const isAppActive = (student.parentAppStatus || 'active') === 'active';

  // Xác định vai trò ban đại diện CMHS nếu có trong ghi chú hoặc chức danh
  const getCommitteeRole = () => {
    const notes = student.parentNotes || '';
    if (notes.includes('Trưởng ban')) return 'Trưởng ban Đại diện Cha mẹ Học sinh';
    if (notes.includes('Phó ban')) return 'Phó ban Đại diện Cha mẹ Học sinh';
    if (notes.includes('Thành viên ban')) return 'Thành viên Ban Đại diện CMHS';
    return 'Phụ huynh học sinh lớp';
  };

  const committeeRole = getCommitteeRole();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Chi tiết Hồ sơ Phụ huynh"
      subtitle={`Học sinh: ${student.fullName} (Mã HS: ${student.studentCode} · Lớp ${student.className || '10A1'})`}
      maxWidth="2xl"
    >
      <div className="space-y-5">
        {/* Banner Tổng quan Phụ huynh */}
        <div className="p-4 bg-gradient-to-r from-blue-50/80 via-indigo-50/50 to-cyan-50/70 border border-blue-100 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-3.5">
            <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-md shadow-blue-500/20 shrink-0">
              {(student.parentName || 'P').charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-bold text-slate-900">
                  {student.parentName || 'Chưa cập nhật tên'}
                </h3>
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full font-bold shadow-2xs ${
                    student.parentRelationship === 'Mẹ'
                      ? 'bg-rose-100 text-rose-700 border border-rose-200'
                      : student.parentRelationship === 'Người giám hộ'
                      ? 'bg-amber-100 text-amber-700 border border-amber-200'
                      : 'bg-blue-100 text-blue-700 border border-blue-200'
                  }`}
                >
                  {student.parentRelationship || 'Bố'}
                </span>
                {committeeRole.includes('Trưởng ban') && (
                  <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-purple-100 text-purple-800 border border-purple-200 flex items-center gap-1 shadow-2xs">
                    <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                    Trưởng ban ĐD CMHS
                  </span>
                )}
                {committeeRole.includes('Phó ban') && (
                  <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-indigo-100 text-indigo-800 border border-indigo-200 flex items-center gap-1 shadow-2xs">
                    <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                    Phó ban ĐD CMHS
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                <span>Phụ huynh đại diện cho học sinh:</span>
                <strong className="text-slate-800 font-semibold">{student.fullName}</strong>
                <span>(STT: {student.rollNumber})</span>
              </p>
            </div>
          </div>

          {/* Trạng thái App */}
          <div className="shrink-0 self-start sm:self-center">
            {isAppActive ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold shadow-2xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Đã kết nối App</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-xl text-xs font-bold shadow-2xs">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <span>Chưa kết nối App</span>
              </span>
            )}
          </div>
        </div>

        {/* ======================================================== */}
        {/* KHU VỰC THÔNG TIN: LABEL BÊN TRÁI, TEXTBOX BÊN PHẢI       */}
        {/* BỐ TRÍ CANH ĐỀU 2 BÊN, RỘNG RÃI, KHÔNG GÒ BÓ               */}
        {/* ======================================================== */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-2xs space-y-4">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 pb-2 border-b border-slate-100 flex items-center justify-between">
            <span>Thông tin chi tiết phụ huynh</span>
            <span className="text-[11px] font-normal lowercase text-slate-400">
              * bố trí chuẩn canh đều hai bên
            </span>
          </div>

          {/* HÀNG 1: Họ và tên phụ huynh */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4 py-2 border-b border-slate-100/80">
            <div className="sm:w-5/12 flex items-center gap-2.5 text-xs font-bold text-slate-600">
              <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <User className="w-4 h-4" />
              </div>
              <span>Họ và tên Phụ huynh:</span>
            </div>
            <div className="sm:w-7/12">
              <div className="w-full px-3.5 py-2.5 bg-slate-50/90 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 shadow-2xs flex items-center justify-between">
                <span>{student.parentName || 'Chưa cập nhật'}</span>
                <span className="text-[11px] font-semibold text-slate-400">
                  {student.parentRelationship || 'Bố'}
                </span>
              </div>
            </div>
          </div>

          {/* HÀNG 2: Mối quan hệ với học sinh */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4 py-2 border-b border-slate-100/80">
            <div className="sm:w-5/12 flex items-center gap-2.5 text-xs font-bold text-slate-600">
              <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                <HeartHandshake className="w-4 h-4" />
              </div>
              <span>Mối quan hệ với học sinh:</span>
            </div>
            <div className="sm:w-7/12">
              <div className="w-full px-3.5 py-2.5 bg-slate-50/90 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 shadow-2xs flex items-center justify-between">
                <span>{student.parentRelationship || 'Bố'}</span>
                <span className="text-[11px] font-normal text-slate-400">Người giám hộ hợp pháp</span>
              </div>
            </div>
          </div>

          {/* HÀNG 3: Con (Học sinh đại diện) */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4 py-2 border-b border-slate-100/80">
            <div className="sm:w-5/12 flex items-center gap-2.5 text-xs font-bold text-slate-600">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <GraduationCap className="w-4 h-4" />
              </div>
              <span>Học sinh (Con):</span>
            </div>
            <div className="sm:w-7/12">
              <div className="w-full px-3.5 py-2.5 bg-slate-50/90 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 shadow-2xs flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <img
                    src={student.avatarUrl}
                    alt={student.fullName}
                    className="w-5 h-5 rounded-full object-cover ring-1 ring-slate-300"
                  />
                  <span>{student.fullName}</span>
                </div>
                <span className="font-mono text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                  {student.studentCode} · Lớp {student.className || '10A1'}
                </span>
              </div>
            </div>
          </div>

          {/* HÀNG 4: Số điện thoại liên hệ chính */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4 py-2 border-b border-slate-100/80">
            <div className="sm:w-5/12 flex items-center gap-2.5 text-xs font-bold text-slate-600">
              <div className="w-7 h-7 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                <Phone className="w-4 h-4" />
              </div>
              <span>Số điện thoại liên hệ chính:</span>
            </div>
            <div className="sm:w-7/12">
              <div className="w-full px-3.5 py-2.5 bg-slate-50/90 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 shadow-2xs flex items-center justify-between flex-wrap gap-2">
                <span className="font-mono font-bold text-sm text-slate-900 tabular-nums">
                  {student.parentPhone || 'Chưa cập nhật SĐT'}
                </span>

                {student.parentPhone && (
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleCopy(student.parentPhone, 'số điện thoại')}
                      className="px-2 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-[11px] font-semibold inline-flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
                      title="Sao chép SĐT"
                    >
                      <Copy className="w-3 h-3 text-slate-500" />
                      <span>Sao chép</span>
                    </button>
                    {cleanPhone && (
                      <>
                        <a
                          href={`tel:${cleanPhone}`}
                          className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-[11px] font-bold inline-flex items-center gap-1 transition-colors shadow-2xs"
                          title="Gọi điện trực tiếp"
                        >
                          <Phone className="w-3 h-3" />
                          <span>Gọi</span>
                        </a>
                        <a
                          href={`https://zalo.me/${cleanPhone}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1 bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 rounded-lg text-[11px] font-bold inline-flex items-center gap-1 transition-colors shadow-2xs"
                          title="Nhắn tin qua Zalo"
                        >
                          <span>Zalo</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* HÀNG 5: Địa chỉ Email */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4 py-2 border-b border-slate-100/80">
            <div className="sm:w-5/12 flex items-center gap-2.5 text-xs font-bold text-slate-600">
              <div className="w-7 h-7 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center shrink-0">
                <Mail className="w-4 h-4" />
              </div>
              <span>Địa chỉ Email liên hệ:</span>
            </div>
            <div className="sm:w-7/12">
              <div className="w-full px-3.5 py-2.5 bg-slate-50/90 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 shadow-2xs flex items-center justify-between">
                <span className="truncate max-w-[240px]">
                  {student.parentEmail || 'Chưa cập nhật email'}
                </span>
                {student.parentEmail && (
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleCopy(student.parentEmail, 'email')}
                      className="p-1 hover:bg-white text-slate-500 rounded-md transition-colors"
                      title="Sao chép email"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <a
                      href={`mailto:${student.parentEmail}`}
                      className="px-2 py-0.5 bg-violet-50 hover:bg-violet-100 text-violet-700 border border-violet-200 rounded-md text-[11px] font-semibold"
                    >
                      Gửi thư
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* HÀNG 6: Địa chỉ thường trú */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2.5 sm:gap-4 py-2 border-b border-slate-100/80">
            <div className="sm:w-5/12 pt-2 flex items-center gap-2.5 text-xs font-bold text-slate-600">
              <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <MapPin className="w-4 h-4" />
              </div>
              <span>Địa chỉ thường trú gia đình:</span>
            </div>
            <div className="sm:w-7/12">
              <div className="w-full px-3.5 py-2.5 bg-slate-50/90 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 leading-relaxed shadow-2xs flex items-start justify-between gap-2">
                <span>{student.address || 'Chưa cập nhật địa chỉ'}</span>
                {student.address && (
                  <button
                    type="button"
                    onClick={() => handleCopy(student.address, 'địa chỉ')}
                    className="p-1 hover:bg-white text-slate-400 hover:text-slate-600 rounded-md shrink-0 transition-colors"
                    title="Sao chép địa chỉ"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* HÀNG 7: Nghề nghiệp / Cơ quan công tác */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4 py-2 border-b border-slate-100/80">
            <div className="sm:w-5/12 flex items-center gap-2.5 text-xs font-bold text-slate-600">
              <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
                <Briefcase className="w-4 h-4" />
              </div>
              <span>Nghề nghiệp / Đơn vị công tác:</span>
            </div>
            <div className="sm:w-7/12">
              <div className="w-full px-3.5 py-2.5 bg-slate-50/90 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 shadow-2xs">
                {student.parentJob || 'Cán bộ / Kinh doanh tự do'}
              </div>
            </div>
          </div>

          {/* HÀNG 8: Ban Đại diện CMHS */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4 py-2 border-b border-slate-100/80">
            <div className="sm:w-5/12 flex items-center gap-2.5 text-xs font-bold text-slate-600">
              <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <span>Ban Đại diện CMHS:</span>
            </div>
            <div className="sm:w-7/12">
              <div className="w-full px-3.5 py-2.5 bg-slate-50/90 border border-slate-200 rounded-xl text-xs font-bold shadow-2xs flex items-center justify-between">
                <span className={committeeRole.includes('ban') ? 'text-purple-800' : 'text-slate-700'}>
                  {committeeRole}
                </span>
                {committeeRole.includes('Trưởng ban') && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 font-bold">
                    Khóa 2024 - 2025
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* HÀNG 9: Ứng dụng di động SmartClass */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4 py-2 border-b border-slate-100/80">
            <div className="sm:w-5/12 flex items-center gap-2.5 text-xs font-bold text-slate-600">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <Smartphone className="w-4 h-4" />
              </div>
              <span>Sổ liên lạc SmartClass App:</span>
            </div>
            <div className="sm:w-7/12">
              <div className="w-full px-3.5 py-2.5 bg-slate-50/90 border border-slate-200 rounded-xl text-xs font-semibold shadow-2xs flex items-center justify-between">
                <span className={isAppActive ? 'text-emerald-700 font-bold' : 'text-amber-700'}>
                  {isAppActive
                    ? 'Đã kết nối ứng dụng (Đang hoạt động)'
                    : 'Chưa kích hoạt tài khoản ứng dụng'}
                </span>
                <span className="text-[11px] font-normal text-slate-400">
                  {isAppActive ? 'Nhận thông báo 24/7' : 'Gửi mã kích hoạt SMS'}
                </span>
              </div>
            </div>
          </div>

          {/* HÀNG 10: Ghi chú của GVCN */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2.5 sm:gap-4 py-2">
            <div className="sm:w-5/12 pt-2 flex items-center gap-2.5 text-xs font-bold text-slate-600">
              <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                <FileText className="w-4 h-4" />
              </div>
              <span>Ghi chú của GVCN:</span>
            </div>
            <div className="sm:w-7/12">
              <div className="w-full px-3.5 py-3 bg-blue-50/40 border border-blue-200/70 rounded-xl text-xs text-slate-800 leading-relaxed min-h-[64px] shadow-2xs">
                {student.parentNotes || 'Chưa có ghi chú đặc biệt từ giáo viên chủ nhiệm.'}
              </div>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* FOOTER ACTIONS                                            */}
        {/* ======================================================== */}
        <div className="pt-2 flex items-center justify-between border-t border-slate-100 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                onEdit(student);
              }}
              className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs shadow-blue-500/25 transition-all hover:scale-[1.02] cursor-pointer"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Chỉnh sửa thông tin</span>
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                onContact(student);
              }}
              className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
              <span>Liên hệ Phụ huynh</span>
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </Modal>
  );
};
