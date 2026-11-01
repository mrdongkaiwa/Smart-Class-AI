import React, { useState, useEffect } from 'react';
import { BookOpen, User, MapPin, Clock, Trash2, Check, X, Calendar, AlertCircle } from 'lucide-react';
import { ScheduleItem } from '../../types';
import { Modal } from '../common/Modal';

interface SlotInfo {
  dayOfWeek: 2 | 3 | 4 | 5 | 6 | 7;
  period: number;
  dayLabel: string;
  classId: string;
  className: string;
  defaultStartTime?: string;
  defaultEndTime?: string;
}

interface EditScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  scheduleItem: ScheduleItem | null;
  slotInfo: SlotInfo | null;
  onSave: (data: {
    id?: string;
    classId: string;
    dayOfWeek: 2 | 3 | 4 | 5 | 6 | 7;
    period: number;
    subjectId?: string;
    subjectName: string;
    teacherId?: string;
    teacherName: string;
    room: string;
    startTime: string;
    endTime: string;
  }) => void;
  onDelete?: (id: string, item: ScheduleItem) => void;
}

export const POPULAR_SUBJECTS = [
  'Toán học',
  'Ngữ văn',
  'Tiếng Anh',
  'Vật lý',
  'Hóa học',
  'Sinh học',
  'Lịch sử',
  'Địa lý',
  'GD Kinh tế & Pháp luật',
  'Tin học',
  'Thể dục',
  'HĐ Trải nghiệm',
  'Công nghệ',
  'GD Quốc phòng',
  'Âm nhạc',
  'Mỹ thuật',
];

export const POPULAR_TEACHERS = [
  'Cô Mai (Toán)',
  'Thầy Hưng (Vật lý)',
  'Cô Lan (Tiếng Anh)',
  'Cô Hằng (Ngữ văn)',
  'Thầy Quân (Hóa học)',
  'Thầy Cường (Lịch sử)',
  'Thầy Tùng (Tin học)',
  'Thầy Dũng (Thể dục)',
  'Cô Yến (Sinh học)',
  'Thầy Nam (Địa lý)',
  'Cô Trang (GDCD)',
];

export const POPULAR_ROOMS = [
  'A.302',
  'A.301',
  'A.303',
  'Lab Lý',
  'Lab Hóa',
  'Lab Sinh',
  'Phòng Máy 1',
  'Phòng Máy 2',
  'Nhà thi đấu',
  'Sân Thể Dục',
];

export const PERIOD_TIMES: Record<number, { start: string; end: string; session: 'morning' | 'afternoon' }> = {
  // Buổi sáng (Tiết 1 - 5)
  1: { start: '07:30', end: '08:15', session: 'morning' },
  2: { start: '08:20', end: '09:05', session: 'morning' },
  3: { start: '09:25', end: '10:10', session: 'morning' },
  4: { start: '10:15', end: '11:00', session: 'morning' },
  5: { start: '11:05', end: '11:50', session: 'morning' },
  // Buổi chiều (Tiết 6 - 10)
  6: { start: '13:00', end: '13:45', session: 'afternoon' },
  7: { start: '13:50', end: '14:35', session: 'afternoon' },
  8: { start: '14:50', end: '15:35', session: 'afternoon' },
  9: { start: '15:40', end: '16:25', session: 'afternoon' },
  10: { start: '16:30', end: '17:15', session: 'afternoon' },
};

export const EditScheduleModal: React.FC<EditScheduleModalProps> = ({
  isOpen,
  onClose,
  scheduleItem,
  slotInfo,
  onSave,
  onDelete,
}) => {
  const [subjectName, setSubjectName] = useState('');
  const [teacherName, setTeacherName] = useState('');
  const [room, setRoom] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setError(null);
      if (scheduleItem) {
        setSubjectName(scheduleItem.subjectName);
        setTeacherName(scheduleItem.teacherName);
        setRoom(scheduleItem.room);
        setStartTime(scheduleItem.startTime);
        setEndTime(scheduleItem.endTime);
      } else if (slotInfo) {
        setSubjectName('');
        setTeacherName('');
        setRoom('A.302');
        const defaultTimes = PERIOD_TIMES[slotInfo.period] || { start: '07:30', end: '08:15' };
        setStartTime(slotInfo.defaultStartTime || defaultTimes.start);
        setEndTime(slotInfo.defaultEndTime || defaultTimes.end);
      }
    }
  }, [isOpen, scheduleItem, slotInfo]);

  if (!isOpen || (!scheduleItem && !slotInfo)) return null;

  const currentPeriod = scheduleItem ? scheduleItem.period : slotInfo?.period || 1;
  const currentDay = scheduleItem ? scheduleItem.dayOfWeek : slotInfo?.dayOfWeek || 2;
  const dayName =
    slotInfo?.dayLabel ||
    (currentDay === 2
      ? 'Thứ Hai'
      : currentDay === 3
      ? 'Thứ Ba'
      : currentDay === 4
      ? 'Thứ Tư'
      : currentDay === 5
      ? 'Thứ Năm'
      : currentDay === 6
      ? 'Thứ Sáu'
      : 'Thứ Bảy');

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!subjectName.trim()) {
      setError('Vui lòng chọn hoặc nhập tên môn học');
      return;
    }
    if (!teacherName.trim()) {
      setError('Vui lòng nhập tên giáo viên giảng dạy');
      return;
    }

    const classId = scheduleItem?.classId || slotInfo?.classId || 'class_10a1';

    onSave({
      id: scheduleItem?.id,
      classId,
      dayOfWeek: currentDay,
      period: currentPeriod,
      subjectName: subjectName.trim(),
      teacherName: teacherName.trim(),
      room: room.trim() || 'A.302',
      startTime: startTime || PERIOD_TIMES[currentPeriod]?.start || '07:30',
      endTime: endTime || PERIOD_TIMES[currentPeriod]?.end || '08:15',
    });

    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={scheduleItem ? `Chỉnh sửa môn học · ${dayName}` : `Thêm môn học mới · ${dayName}`}
      subtitle={`${currentPeriod <= 5 ? 'Buổi Sáng' : 'Buổi Chiều'} · Tiết ${currentPeriod} (${startTime || '07:30'} - ${endTime || '08:15'}) · Lớp ${slotInfo?.className || '10A1'}`}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} onKeyDown={handleKeyDown} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-2 text-rose-700 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Thông tin vị trí tiết học */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-600" />
            <span className="font-semibold text-slate-800">{dayName}</span>
            <span className="text-slate-400">·</span>
            <span className="font-medium text-slate-600">
              {currentPeriod <= 5 ? 'Buổi Sáng' : 'Buổi Chiều'} · Tiết {currentPeriod}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-500 font-mono text-[11px]">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>{startTime} - {endTime}</span>
          </div>
        </div>

        {/* Môn học */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-blue-600" />
              Môn học <span className="text-rose-500">*</span>
            </span>
            <span className="text-[11px] font-normal text-slate-400">Chọn hoặc nhập trực tiếp</span>
          </label>
          <div className="space-y-2">
            <input
              type="text"
              list="popular-subjects"
              value={subjectName}
              onChange={e => {
                setSubjectName(e.target.value);
                if (error) setError(null);
              }}
              placeholder="VD: Toán học, Ngữ văn, Tiếng Anh..."
              className="w-full text-xs font-medium text-slate-900 bg-white border border-slate-300 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 shadow-2xs transition-all"
              autoFocus
            />
            <datalist id="popular-subjects">
              {POPULAR_SUBJECTS.map(subj => (
                <option key={subj} value={subj} />
              ))}
            </datalist>

            {/* Quick chips for fast selection */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {POPULAR_SUBJECTS.slice(0, 7).map(subj => (
                <button
                  key={subj}
                  type="button"
                  onClick={() => {
                    setSubjectName(subj);
                    if (error) setError(null);
                  }}
                  className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                    subjectName === subj
                      ? 'bg-blue-50 border-blue-300 text-blue-700 font-semibold shadow-2xs'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-800'
                  }`}
                >
                  {subj}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Giáo viên & Phòng học */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {/* Giáo viên */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-blue-600" />
              Giáo viên giảng dạy <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              list="popular-teachers"
              value={teacherName}
              onChange={e => {
                setTeacherName(e.target.value);
                if (error) setError(null);
              }}
              placeholder="VD: Cô Mai, Thầy Hưng..."
              className="w-full text-xs font-medium text-slate-900 bg-white border border-slate-300 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 shadow-2xs transition-all"
            />
            <datalist id="popular-teachers">
              {POPULAR_TEACHERS.map(t => (
                <option key={t} value={t.split(' ')[0] + ' ' + t.split(' ')[1]} />
              ))}
            </datalist>
          </div>

          {/* Phòng học */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-blue-600" />
              Phòng học
            </label>
            <input
              type="text"
              list="popular-rooms"
              value={room}
              onChange={e => setRoom(e.target.value)}
              placeholder="VD: A.302, Lab Lý..."
              className="w-full text-xs font-medium text-slate-900 bg-white border border-slate-300 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 shadow-2xs transition-all"
            />
            <datalist id="popular-rooms">
              {POPULAR_ROOMS.map(r => (
                <option key={r} value={r} />
              ))}
            </datalist>
          </div>
        </div>

        {/* Khung giờ tiết học */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              Giờ bắt đầu
            </label>
            <input
              type="time"
              value={startTime}
              onChange={e => setStartTime(e.target.value)}
              className="w-full text-xs font-mono font-medium text-slate-800 bg-white border border-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              Giờ kết thúc
            </label>
            <input
              type="time"
              value={endTime}
              onChange={e => setEndTime(e.target.value)}
              className="w-full text-xs font-mono font-medium text-slate-800 bg-white border border-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
            />
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-200 mt-5">
          {scheduleItem && onDelete ? (
            <button
              type="button"
              onClick={() => onDelete(scheduleItem.id, scheduleItem)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl border border-rose-200 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Xóa môn khỏi tiết này</span>
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs hover:shadow transition-all cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Lưu thay đổi</span>
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
