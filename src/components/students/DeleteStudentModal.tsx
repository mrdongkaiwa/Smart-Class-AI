import React from 'react';
import {
  AlertTriangle,
  ShieldAlert,
  Trash2,
  X,
  UserCheck,
  UserX,
  Pencil,
  Info
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { Student } from '../../types';

interface DeleteStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
  onConfirmDelete: (student: Student) => void;
  onSwitchToEdit?: (student: Student) => void;
}

export const DeleteStudentModal: React.FC<DeleteStudentModalProps> = ({
  isOpen,
  onClose,
  student,
  onConfirmDelete,
  onSwitchToEdit,
}) => {
  if (!student || !isOpen) return null;

  // Nghiệp vụ: Học sinh đang theo học ('active') và có lớp đang học => KHÔNG ĐƯỢC XÓA!
  const isCurrentlyEnrolled = student.status === 'active' && Boolean(student.classId);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isCurrentlyEnrolled ? 'Không thể xóa học sinh đang theo học' : 'Xác nhận xóa hồ sơ học sinh'}
      subtitle={`Học sinh: ${student.fullName} (Mã HS: ${student.studentCode} · Lớp ${student.className})`}
      maxWidth="md"
    >
      <div className="space-y-4">
        {/* CASE 1: HỌC SINH ĐANG THEO HỌC VÀ CÓ LỚP => RÀNG BUỘC NGHIỆP VỤ CHẶN XÓA */}
        {isCurrentlyEnrolled ? (
          <div className="space-y-4">
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3.5">
              <div className="p-2 bg-rose-100 text-rose-700 rounded-xl shrink-0 mt-0.5">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div className="space-y-1.5 flex-1 text-xs">
                <div className="font-bold text-rose-900 text-sm flex items-center gap-1.5">
                  <span>Ràng buộc nghiệp vụ: Không cho phép xóa</span>
                </div>
                <p className="text-rose-800 leading-relaxed">
                  Học sinh <strong>{student.fullName}</strong> đang có trạng thái{' '}
                  <span className="font-bold px-1.5 py-0.5 bg-rose-200 text-rose-900 rounded">
                    Đang theo học
                  </span>{' '}
                  trong biên chế lớp <strong>{student.className}</strong>.
                </p>
                <p className="text-rose-700 leading-relaxed">
                  Theo quy định quản lý đào tạo, hệ thống <strong>chặn thao tác xóa</strong> đối với học sinh đang theo học để đảm bảo toàn vẹn dữ liệu sổ điểm, thời khóa biểu, điểm danh và sổ liên lạc gia đình.
                </p>
              </div>
            </div>

            {/* Hướng dẫn giải quyết */}
            <div className="p-3.5 bg-amber-50 border border-amber-200/80 rounded-xl text-xs space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-amber-900">
                <Info className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Quy trình xử lý đúng nghiệp vụ:</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-amber-800 pl-1">
                <li>
                  Nếu học sinh này chuyển trường hoặc thôi học: hãy bấm nút <strong>"Sửa trạng thái học sinh"</strong> bên dưới để đổi trạng thái sang <strong>"Đã thôi học / Chuyển trường"</strong>.
                </li>
                <li>
                  Sau khi đổi trạng thái (không còn trong biên chế lớp đang theo học), bạn mới có thể thực hiện xóa hồ sơ nếu thực sự cần thiết.
                </li>
              </ul>
            </div>

            {/* Footer Buttons for Blocked Case */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                Đóng
              </button>
              {onSwitchToEdit && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onSwitchToEdit(student);
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  <span>Sửa trạng thái học sinh</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          /* CASE 2: HỌC SINH ĐÃ THÔI HỌC / TẠM HOÃN => HIỂN THỊ CẢNH BÁO VÀ CHO PHÉP XÁC NHẬN XÓA */
          <div className="space-y-4">
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3.5">
              <div className="p-2 bg-amber-100 text-amber-700 rounded-xl shrink-0 mt-0.5">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="space-y-1.5 flex-1 text-xs">
                <div className="font-bold text-amber-900 text-sm">
                  Cảnh báo trước khi xóa vĩnh viễn
                </div>
                <p className="text-amber-800 leading-relaxed">
                  Học sinh <strong>{student.fullName}</strong> hiện ở trạng thái:{' '}
                  <span className="font-bold px-1.5 py-0.5 bg-amber-200 text-amber-900 rounded">
                    {student.status === 'leave'
                      ? 'Đã thôi học / Chuyển trường'
                      : student.status === 'suspended'
                      ? 'Bảo lưu / Tạm đình chỉ'
                      : 'Không có lớp'}
                  </span>
                </p>
                <p className="text-amber-700 leading-relaxed">
                  Bạn có chắc chắn muốn xóa vĩnh viễn hồ sơ này không? Toàn bộ thông tin học tập, bảng điểm và liên hệ phụ huynh của học sinh này sẽ bị loại bỏ hoàn toàn và <strong>không thể phục hồi</strong>.
                </p>
              </div>
            </div>

            {/* Student mini card */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-3">
              <img
                src={student.avatarUrl}
                alt={student.fullName}
                className="w-10 h-10 rounded-full object-cover ring-1 ring-slate-300"
              />
              <div className="flex-1 min-w-0 text-xs">
                <div className="font-bold text-slate-900 truncate">{student.fullName}</div>
                <div className="text-[11px] text-slate-500">
                  Mã: <span className="font-mono text-slate-700 font-semibold">{student.studentCode}</span> · STT {student.rollNumber} · Lớp {student.className}
                </div>
              </div>
            </div>

            {/* Footer Buttons for Confirmation Case */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={() => {
                  onConfirmDelete(student);
                  onClose();
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Xác nhận xóa vĩnh viễn</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
