import React, { useState, useEffect } from 'react';
import {
  Users,
  CheckCircle2,
  TrendingUp,
  FileText,
  Award,
  MessageSquare,
  Send,
  Calendar,
  Clock,
  ShieldCheck
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { Modal } from '../../components/common/Modal';
import { db } from '../../services/db';
import { Student, ChatMessage, AttendanceSession } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';

export const ParentDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const { showToast } = useToast();

  const students = db.getStudents();
  const [selectedStudent, setSelectedStudent] = useState<Student>(students[0]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);

  useEffect(() => {
    if (selectedStudent) {
      setMessages(db.getMessages(currentUser?.id || 'user_parent_1', 'user_teacher_1'));
    }
  }, [selectedStudent, currentUser]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const newMsg = db.sendMessage({
      senderId: currentUser?.id || 'user_parent_1',
      senderName: currentUser?.fullName || 'Nguyễn Văn Hùng',
      senderRole: 'PARENT',
      receiverId: 'user_teacher_1',
      receiverName: 'Cô Nguyễn Thị Mai',
      studentId: selectedStudent.id,
      studentName: selectedStudent.fullName,
      content: chatInput.trim(),
    });

    setMessages(prev => [...prev, newMsg]);
    setChatInput('');
    showToast('Đã gửi tin nhắn đến Giáo viên Chủ nhiệm!', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Page Header with Breadcrumb and Title horizontally aligned, Child Switcher on right */}
      <PageHeader
        breadcrumbItems={[
          { label: 'Cổng phụ huynh' },
          { label: `Học sinh: ${selectedStudent.fullName}` },
        ]}
        title="Cổng Thông Tin Phụ Huynh"
        action={
          <div className="flex items-center gap-2 p-1 bg-[#041527] border border-[#0e3d54] rounded-xl shadow-xs">
            <span className="text-xs font-semibold text-slate-400 pl-2">Chọn con:</span>
            <select
              value={selectedStudent.id}
              onChange={e => {
                const match = students.find(s => s.id === e.target.value);
                if (match) setSelectedStudent(match);
              }}
              className="px-2 py-1 text-xs font-bold text-cyan-300 bg-transparent border-0 focus:outline-none cursor-pointer"
            >
              {students.slice(0, 2).map(st => (
                <option key={st.id} value={st.id} className="bg-[#031526] text-white">
                  {st.fullName} (Lớp {st.className})
                </option>
              ))}
            </select>
          </div>
        }
      />

      {/* Child KPI Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
          <span className="text-xs text-slate-500 font-medium">Chuyên cần tháng này</span>
          <div className="text-2xl font-bold text-emerald-600 mt-1 tabular-nums">
            {selectedStudent.attendanceRate}%
          </div>
          <span className="text-xs text-emerald-600 mt-0.5 block">Đầy đủ · Đúng giờ</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
          <span className="text-xs text-slate-500 font-medium">Điểm trung bình (ĐTB)</span>
          <div className="text-2xl font-bold text-blue-600 mt-1 tabular-nums">
            {selectedStudent.gpa} / 10
          </div>
          <span className="text-xs text-blue-600 mt-0.5 block">Học lực Giỏi</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
          <span className="text-xs text-slate-500 font-medium">Hạnh kiểm học kỳ 2</span>
          <div className="text-2xl font-bold text-purple-600 mt-1">
            {selectedStudent.conduct}
          </div>
          <span className="text-xs text-purple-600 mt-0.5 block">Xếp loại Tốt</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
          <span className="text-xs text-slate-500 font-medium">Điểm thi đua nề nếp</span>
          <div className="text-2xl font-bold text-amber-600 mt-1 tabular-nums">
            +{selectedStudent.behaviorPoints}
          </div>
          <span className="text-xs text-slate-400 mt-0.5 block">Tổ 1 · Lớp 10A1</span>
        </div>
      </div>

      {/* Main Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Teacher Comment & Today Status */}
        <div className="lg:col-span-2 space-y-4">
          {/* Teacher Comment Card */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-purple-600" />
                <h3 className="text-sm font-bold text-slate-900">Nhận xét của Giáo viên Chủ nhiệm</h3>
              </div>
              <span className="text-xs text-slate-400">Cô Nguyễn Thị Mai</span>
            </div>
            <div className="p-4 rounded-xl bg-purple-50/40 border border-purple-100 text-xs leading-relaxed text-slate-700">
              &ldquo;Em {selectedStudent.fullName} có tinh thần tự giác cao, bài tập môn Toán luôn hoàn thành đúng hạn và rất tích cực giúp đỡ các bạn trong tổ. Gia đình tiếp tục động viên con giữ vững phong độ!&rdquo;
            </div>
          </div>

          {/* Recent Attendance Records */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900">Lịch sử điểm danh gần đây</h3>
            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-800">Thứ Năm, ngày 20/02/2025 (Tiết 1)</div>
                  <div className="text-[11px] text-slate-400">Điểm danh bởi Cô Mai</div>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Có mặt
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-800">Thứ Tư, ngày 19/02/2025 (Tiết 1)</div>
                  <div className="text-[11px] text-slate-400">Điểm danh bởi Cô Mai</div>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Có mặt
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Direct Chat with Homeroom Teacher */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex flex-col justify-between h-[420px]">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Trao đổi với GVCN</h3>
                <span className="text-xs text-slate-400">Cô Nguyễn Thị Mai (Lớp 10A1)</span>
              </div>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" title="Đang trực tuyến" />
            </div>

            <div className="py-3 space-y-3 max-h-64 overflow-y-auto pr-1 text-xs">
              {messages.map(m => (
                <div
                  key={m.id}
                  className={`flex flex-col ${
                    m.senderRole === 'PARENT' ? 'items-end' : 'items-start'
                  }`}
                >
                  <div
                    className={`p-3 rounded-xl max-w-[85%] leading-relaxed ${
                      m.senderRole === 'PARENT'
                        ? 'bg-blue-600 text-white rounded-br-xs'
                        : 'bg-slate-100 text-slate-800 rounded-bl-xs'
                    }`}
                  >
                    {m.content}
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 tabular-nums">
                    {new Date(m.timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <form onSubmit={handleSendMessage} className="pt-2 border-t border-slate-100 flex items-center gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              placeholder="Nhắn tin cho cô giáo..."
              className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              aria-label="Gửi tin nhắn"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
