import React, { useState } from 'react';
import {
  Phone,
  Mail,
  MessageSquare,
  Copy,
  ExternalLink,
  Send,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { Student } from '../../types';
import { db } from '../../services/db';
import { useToast } from '../../contexts/ToastContext';

interface ContactParentModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
}

export const ContactParentModal: React.FC<ContactParentModalProps> = ({
  isOpen,
  onClose,
  student,
}) => {
  const { showToast } = useToast();
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  if (!student) return null;

  const handleCopyPhone = () => {
    if (student.parentPhone) {
      navigator.clipboard.writeText(student.parentPhone.replace(/\s+/g, ''));
      showToast(`Đã sao chép số điện thoại: ${student.parentPhone}`, 'info');
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      showToast('Vui lòng nhập nội dung tin nhắn gửi phụ huynh', 'warning');
      return;
    }

    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      showToast(`Đã gửi tin nhắn đến phụ huynh ${student.parentName} (${student.fullName})`, 'success');
      setMessage('');
      onClose();
    }, 500);
  };

  const cleanPhone = student.parentPhone ? student.parentPhone.replace(/[^0-9]/g, '') : '';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Liên hệ Phụ huynh"
      subtitle={`Phụ huynh em: ${student.fullName} (Lớp ${student.className})`}
      maxWidth="md"
    >
      <div className="space-y-4">
        {/* Parent Card */}
        <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl space-y-2.5">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-slate-500">Phụ huynh đại diện</div>
              <div className="text-sm font-bold text-slate-900 mt-0.5">
                {student.parentName || 'Chưa cập nhật tên'}
                <span className="ml-2 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                  {student.parentRelationship || 'Bố'}
                </span>
              </div>
            </div>
            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
              student.parentAppStatus === 'active'
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-amber-100 text-amber-700'
            }`}>
              {student.parentAppStatus === 'active' ? '● Đã kết nối app' : '○ Chưa kết nối app'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-200/60">
            <div>
              <span className="text-slate-400">Số điện thoại:</span>
              <div className="font-mono font-bold text-slate-800 mt-0.5">
                {student.parentPhone || 'Chưa có SĐT'}
              </div>
            </div>
            <div>
              <span className="text-slate-400">Email:</span>
              <div className="font-semibold text-slate-800 mt-0.5 truncate">
                {student.parentEmail || 'Chưa có email'}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Connection Channels */}
        <div className="grid grid-cols-3 gap-2">
          {/* Call */}
          <a
            href={student.parentPhone ? `tel:${cleanPhone}` : undefined}
            className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-colors ${
              student.parentPhone
                ? 'bg-blue-50/70 border-blue-200 text-blue-700 hover:bg-blue-100'
                : 'bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <Phone className="w-5 h-5 mb-1" />
            <span className="text-xs font-bold">Gọi điện</span>
          </a>

          {/* Zalo */}
          <a
            href={student.parentPhone ? `https://zalo.me/${cleanPhone}` : undefined}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-colors ${
              student.parentPhone
                ? 'bg-sky-50/70 border-sky-200 text-sky-700 hover:bg-sky-100'
                : 'bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <ExternalLink className="w-5 h-5 mb-1 text-sky-600" />
            <span className="text-xs font-bold">Mở Zalo</span>
          </a>

          {/* Copy Phone */}
          <button
            type="button"
            onClick={handleCopyPhone}
            disabled={!student.parentPhone}
            className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-center transition-colors cursor-pointer disabled:opacity-50"
          >
            <Copy className="w-5 h-5 mb-1 text-slate-500" />
            <span className="text-xs font-bold">Sao chép SĐT</span>
          </button>
        </div>

        {/* In-App Direct Notification to Parent */}
        <form onSubmit={handleSendMessage} className="space-y-2.5 pt-2 border-t border-slate-100">
          <label className="block text-xs font-bold text-slate-700">
            Gửi tin nhắn thông báo đến sổ liên lạc SmartClass của phụ huynh
          </label>
          <textarea
            rows={3}
            required
            placeholder={`Nhập nội dung nhắn gửi tới phụ huynh em ${student.fullName}... (ví dụ: Thông báo tình hình học tập, nhắc nhở lịch họp, sinh hoạt...)`}
            value={message}
            onChange={e => setMessage(e.target.value)}
            className="w-full p-2.5 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              Đóng
            </button>
            <button
              type="submit"
              disabled={isSending || !message.trim()}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSending ? 'Đang gửi...' : 'Gửi tin nhắn'}</span>
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};
