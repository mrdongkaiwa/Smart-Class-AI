import React, { useState, useEffect } from 'react';
import { Modal } from '../../components/common/Modal';
import { Classroom } from '../../types';
import { db } from '../../services/db';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';

interface CreateClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (cls: Classroom) => void;
  initialData?: Classroom | null;
}

export const CreateClassModal: React.FC<CreateClassModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialData,
}) => {
  const { currentUser } = useAuth();
  const { showToast } = useToast();

  const [name, setName] = useState(initialData?.name || '');
  const [gradeLevel, setGradeLevel] = useState<number>(initialData?.gradeLevel || 10);
  const [roomNumber, setRoomNumber] = useState(initialData?.roomNumber || 'A.302');
  const [color, setColor] = useState(initialData?.color || '#2563EB');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Keep form fields synced when initialData or modal open status changes
  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setGradeLevel(initialData.gradeLevel || 10);
      setRoomNumber(initialData.roomNumber || 'A.302');
      setColor(initialData.color || '#2563EB');
    } else {
      setName('');
      setGradeLevel(10);
      setRoomNumber('A.302');
      setColor('#2563EB');
    }
  }, [initialData, isOpen]);

  const colors = [
    '#2563EB', // Blue
    '#7C3AED', // Purple
    '#16A34A', // Green
    '#F59E0B', // Amber
    '#EF4444', // Red
    '#06B6D4', // Cyan
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Vui lòng nhập tên lớp học!', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      if (initialData) {
        const updated = db.updateClass(initialData.id, {
          name,
          gradeLevel,
          roomNumber,
          color,
        });
        if (updated) {
          showToast(`Đã cập nhật thông tin lớp ${updated.name}`, 'success');
          onSuccess(updated);
        }
      } else {
        const created = db.createClass({
          name: name.trim(),
          code: `${name.trim()}-2024`,
          gradeLevel,
          academicYearId: 'ay_2024_2025',
          roomNumber,
          homeroomTeacherId: currentUser?.id || 'user_teacher_1',
          homeroomTeacherName: currentUser?.fullName || 'Cô Nguyễn Thị Mai',
          color,
        });
        showToast(`Đã tạo thành công lớp học ${created.name}`, 'success');
        onSuccess(created);
      }
      onClose();
    } catch (err) {
      showToast('Đã có lỗi xảy ra khi lưu lớp học', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Chỉnh sửa thông tin lớp' : 'Thêm lớp học mới'}
      subtitle="Thiết lập thông tin quản lý cho lớp học số"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Tên lớp học *
          </label>
          <input
            type="text"
            placeholder="Ví dụ: 1A1, 5C, 6B2, 10A1, 12A3..."
            value={name}
            onChange={e => setName(e.target.value)}
            required
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Khối lớp (12 khối)
            </label>
            <select
              value={gradeLevel}
              onChange={e => setGradeLevel(Number(e.target.value))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white cursor-pointer"
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
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Phòng học
            </label>
            <input
              type="text"
              placeholder="Ví dụ: A.302"
              value={roomNumber}
              onChange={e => setRoomNumber(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-2">
            Màu nhận diện
          </label>
          <div className="flex items-center gap-3">
            {colors.map(c => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={`w-7 h-7 rounded-full transition-transform ${
                  color === c ? 'scale-125 ring-2 ring-offset-2 ring-slate-400' : 'hover:scale-110'
                }`}
                style={{ backgroundColor: c }}
                aria-label={`Chọn màu ${c}`}
              />
            ))}
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors disabled:opacity-50"
          >
            {initialData ? 'Lưu thay đổi' : 'Tạo lớp học'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
