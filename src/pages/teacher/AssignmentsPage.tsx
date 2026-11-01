import React, { useState, useEffect } from 'react';
import {
  FileText,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  ExternalLink,
  Save,
  MessageSquare
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { Breadcrumb } from '../../components/common/Breadcrumb';
import { Modal } from '../../components/common/Modal';
import { db } from '../../services/db';
import { Assignment, AssignmentSubmission, Classroom } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';

export const AssignmentsPage: React.FC = () => {
  const { activeClassId } = useAuth();
  const { showToast } = useToast();

  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [selectedAsg, setSelectedAsg] = useState<Assignment | null>(null);
  const [submissions, setSubmissions] = useState<AssignmentSubmission[]>([]);

  // Grading modal state
  const [gradingSubmission, setGradingSubmission] = useState<AssignmentSubmission | null>(null);
  const [scoreInput, setScoreInput] = useState<number>(10);
  const [feedbackInput, setFeedbackInput] = useState<string>('');

  useEffect(() => {
    const list = db.getAssignments();
    setAssignments(list);
    if (list.length > 0 && !selectedAsg) {
      setSelectedAsg(list[0]);
      setSubmissions(db.getSubmissions(list[0].id));
    }
  }, []);

  const handleSelectAsg = (asg: Assignment) => {
    setSelectedAsg(asg);
    setSubmissions(db.getSubmissions(asg.id));
  };

  const handleOpenGrading = (sub: AssignmentSubmission) => {
    setGradingSubmission(sub);
    setScoreInput(sub.score ?? 10);
    setFeedbackInput(sub.feedback || 'Bài làm tốt, trình bày sạch đẹp.');
  };

  const handleSaveGrading = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gradingSubmission) return;

    db.gradeSubmission(gradingSubmission.id, scoreInput, feedbackInput);
    if (selectedAsg) {
      setSubmissions(db.getSubmissions(selectedAsg.id));
    }
    setGradingSubmission(null);
    showToast(`Đã chấm điểm thành công cho em ${gradingSubmission.studentName}!`, 'success');
  };

  return (
    <div className="space-y-4 text-slate-100">
      <PageHeader
        breadcrumbItems={[
          { label: 'Dạy & Học', href: '/teacher/classes' },
          { label: 'Quản lý Bài tập' },
        ]}
        title="Quản lý & Chấm bài tập"
        action={
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono bg-[#031526] border border-[#0e3d54] text-cyan-300 px-2.5 py-1 rounded-lg">
              Tổng số: {assignments.length} bài tập
            </span>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Assignments list */}
        <div className="bg-[#041527] rounded-2xl border border-[#0e3d54] p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#0e3d54]">
            <h3 className="text-sm font-bold text-white">Danh sách bài tập ({assignments.length})</h3>
          </div>

          <div className="space-y-2">
            {assignments.map(asg => (
              <div
                key={asg.id}
                onClick={() => handleSelectAsg(asg)}
                className={`p-3.5 rounded-xl border text-xs cursor-pointer transition-all ${
                  selectedAsg?.id === asg.id
                    ? 'border-cyan-400 bg-cyan-950/60 shadow-xs'
                    : 'border-[#0e3d54] bg-[#03172c] hover:bg-[#06203a]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-cyan-300">{asg.className}</span>
                  <span className="text-[10px] text-slate-400">
                    Hạn: {new Date(asg.dueDate).toLocaleDateString('vi-VN')}
                  </span>
                </div>
                <div className="font-bold text-white mt-1 text-sm">{asg.title}</div>
                <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
                  <span>Đã nộp: <strong className="text-white tabular-nums">{asg.submissionCount}/{asg.totalStudents}</strong></span>
                  <span className="text-emerald-400 font-semibold">Đã chấm: {asg.gradedCount}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Submissions of selected assignment */}
        <div className="lg:col-span-2 bg-[#041527] rounded-2xl border border-[#0e3d54] p-5 shadow-sm space-y-4">
          {selectedAsg ? (
            <>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#0e3d54] gap-2">
                <div>
                  <h3 className="text-base font-bold text-white">{selectedAsg.title}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Lớp {selectedAsg.className} · Thang điểm {selectedAsg.points} · Hạn nộp: {new Date(selectedAsg.dueDate).toLocaleString('vi-VN')}
                  </p>
                </div>
              </div>

              {/* Submissions List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
                  <span>Bài nộp của học sinh ({submissions.length})</span>
                  <span>Đã nộp {submissions.length} / {selectedAsg.totalStudents} HS</span>
                </div>

                {submissions.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-400 border border-dashed border-[#0e3d54] rounded-xl">
                    Chưa có bài nộp nào cho bài tập này.
                  </div>
                ) : (
                  submissions.map(sub => (
                    <div
                      key={sub.id}
                      className="p-3.5 rounded-xl border border-[#0e3d54] bg-[#03172c] hover:bg-[#06203a] hover:border-cyan-400/80 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-sm">{sub.studentName}</span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            sub.status === 'graded' ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800' : 'bg-cyan-950/80 text-cyan-300 border border-cyan-800'
                          }`}>
                            {sub.status === 'graded' ? 'Đã chấm điểm' : 'Mới nộp bài'}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          Nộp lúc: {new Date(sub.submittedAt).toLocaleString('vi-VN')} · File: {sub.fileName || 'Bai_lam.pdf'}
                        </div>
                        {sub.feedback && (
                          <div className="text-xs text-slate-300 mt-1 italic">
                            &ldquo;{sub.feedback}&rdquo;
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        {sub.score !== undefined && (
                          <div className="text-right">
                            <span className="text-xs text-slate-400 block">Điểm số</span>
                            <span className="text-base font-bold text-cyan-400 tabular-nums">
                              {sub.score}/10
                            </span>
                          </div>
                        )}
                        <button
                          onClick={() => handleOpenGrading(sub)}
                          className="px-3.5 py-1.5 bg-[#0284c7] hover:bg-[#0369a1] text-white rounded-lg font-semibold shadow-xs transition-colors cursor-pointer border border-cyan-500/40"
                        >
                          {sub.status === 'graded' ? 'Sửa điểm' : 'Chấm bài'}
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          ) : (
            <div className="p-8 text-center text-xs text-slate-400">Chọn một bài tập để xem chi tiết bài nộp.</div>
          )}
        </div>
      </div>

      {/* Grading Modal */}
      {gradingSubmission && (
        <Modal
          isOpen={!!gradingSubmission}
          onClose={() => setGradingSubmission(null)}
          title={`Chấm bài · Em ${gradingSubmission.studentName}`}
          subtitle={`Bài tập: ${selectedAsg?.title}`}
          maxWidth="md"
        >
          <form onSubmit={handleSaveGrading} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-200 mb-1">
                Điểm số (Thang điểm 10) *
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                max="10"
                required
                value={scoreInput}
                onChange={e => setScoreInput(Number(e.target.value))}
                className="w-full px-3 py-2 border border-[#0e3d54] rounded-lg text-sm font-bold text-cyan-300 bg-[#020e1a] focus:border-cyan-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-200 mb-1">
                Nhận xét & Lời khuyên giáo viên
              </label>
              <textarea
                rows={3}
                value={feedbackInput}
                onChange={e => setFeedbackInput(e.target.value)}
                placeholder="Nhận xét chi tiết giúp học sinh phát triển..."
                className="w-full px-3 py-2 border border-[#0e3d54] rounded-lg text-xs text-white bg-[#020e1a] focus:border-cyan-400 focus:outline-none"
              />
            </div>

            <div className="pt-3 border-t border-[#0e3d54] flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setGradingSubmission(null)}
                className="px-4 py-2 font-semibold text-slate-300 hover:bg-[#06203a] rounded-lg border border-[#0e3d54] cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-4 py-2 font-semibold text-white bg-[#0284c7] hover:bg-[#0369a1] rounded-lg shadow-xs cursor-pointer border border-cyan-500/40"
              >
                Lưu kết quả & Trả bài
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
