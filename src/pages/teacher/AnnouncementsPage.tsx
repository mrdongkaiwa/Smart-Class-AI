import React, { useState, useEffect } from 'react';
import {
  Bell,
  Plus,
  Send,
  CheckCircle2,
  Users,
  Eye,
  Paperclip
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { Breadcrumb } from '../../components/common/Breadcrumb';
import { Modal } from '../../components/common/Modal';
import { db } from '../../services/db';
import { Announcement } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';

export const AnnouncementsPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { showToast } = useToast();

  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [priority, setPriority] = useState<'normal' | 'important' | 'urgent'>('normal');
  const [scope, setScope] = useState<'all' | 'class' | 'parents'>('class');

  useEffect(() => {
    setAnnouncements(db.getAnnouncements());
  }, []);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    const newAnc = db.createAnnouncement({
      title: title.trim(),
      content: content.trim(),
      authorId: currentUser?.id || 'user_teacher_1',
      authorName: currentUser?.fullName || 'Cô Nguyễn Thị Mai',
      authorRole: currentUser?.role || 'TEACHER',
      targetScope: scope,
      priority,
      totalRecipients: 32,
    });

    setAnnouncements(prev => [newAnc, ...prev]);
    setIsCreateModalOpen(false);
    setTitle('');
    setContent('');
    showToast('Đã phát hành thông báo thành công!', 'success');
  };

  return (
    <div className="space-y-4">
      <PageHeader
        breadcrumbItems={[
          { label: 'Giao tiếp' },
          { label: 'Bảng tin thông báo' },
        ]}
        title="Bảng tin & Thông báo Lớp học"
        action={
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0284c7] hover:bg-[#0369a1] text-white rounded-lg text-xs font-bold shadow-sm shadow-cyan-950 transition-colors cursor-pointer border border-cyan-500/40"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tạo thông báo mới</span>
          </button>
        }
      />

      <div className="space-y-4">
        {announcements.map(anc => (
          <div
            key={anc.id}
            className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-3"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                  anc.priority === 'urgent'
                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                    : anc.priority === 'important'
                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                    : 'bg-blue-50 text-blue-700 border border-blue-200'
                }`}>
                  {anc.priority === 'urgent' ? 'Khẩn cấp' : anc.priority === 'important' ? 'Quan trọng' : 'Tin thường'}
                </span>
                <h3 className="font-bold text-slate-900 text-sm sm:text-base">{anc.title}</h3>
              </div>

              <div className="text-xs text-slate-400 flex items-center gap-3">
                <span className="flex items-center gap-1 font-medium text-slate-600">
                  <Eye className="w-3.5 h-3.5" />
                  <strong className="tabular-nums">{anc.readCount}</strong>/{anc.totalRecipients} đã đọc
                </span>
                <span>·</span>
                <span>{new Date(anc.createdAt).toLocaleDateString('vi-VN')}</span>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
              {anc.content}
            </p>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
              <span>Đăng bởi: <strong className="text-slate-700">{anc.authorName}</strong></span>
              <span className="text-[11px] font-mono uppercase bg-slate-100 px-2 py-0.5 rounded">
                Phạm vi: {anc.targetScope === 'all' ? 'Toàn trường' : anc.targetScope === 'parents' ? 'Phụ huynh' : 'Lớp học'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Create Announcement Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Tạo thông báo mới"
        subtitle="Thông báo sẽ được gửi trực tiếp đến ứng dụng của người nhận"
        maxWidth="lg"
      >
        <form onSubmit={handleCreate} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Tiêu đề thông báo *</label>
            <input
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Ví dụ: Lịch họp phụ huynh định kỳ..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Phạm vi đối tượng</label>
              <select
                value={scope}
                onChange={e => setScope(e.target.value as any)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white text-slate-900"
              >
                <option value="class">Học sinh trong lớp</option>
                <option value="parents">Phụ huynh học sinh</option>
                <option value="all">Toàn thể nhà trường</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Mức độ ưu tiên</label>
              <select
                value={priority}
                onChange={e => setPriority(e.target.value as any)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white text-slate-900"
              >
                <option value="normal">Bình thường</option>
                <option value="important">Quan trọng</option>
                <option value="urgent">Khẩn cấp</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Nội dung chi tiết *</label>
            <textarea
              rows={5}
              required
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="Nhập nội dung thông báo đầy đủ..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="px-4 py-2 font-semibold text-slate-700 hover:bg-slate-100 rounded-lg"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Gửi thông báo</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
