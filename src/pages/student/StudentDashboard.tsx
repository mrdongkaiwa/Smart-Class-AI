import React, { useState } from 'react';
import {
  Calendar,
  FileText,
  TrendingUp,
  Award,
  Bell,
  Upload,
  CheckCircle2,
  Clock,
  ArrowRight
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { Modal } from '../../components/common/Modal';
import { db } from '../../services/db';
import { Assignment, AssignmentSubmission } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';

export const StudentDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const { showToast } = useToast();

  const student = db.getStudents().find(s => s.fullName.includes('Hoàng Nam')) || db.getStudents()[0];
  const assignments = db.getAssignments('class_10a1');
  const myGrades = db.getGrades('class_10a1').find(g => g.studentId === student.id);

  const [submittingAsg, setSubmittingAsg] = useState<Assignment | null>(null);
  const [submissionContent, setSubmissionContent] = useState('');

  const handleSubmitHomework = (e: React.FormEvent) => {
    e.preventDefault();
    if (!submittingAsg) return;

    db.submitAssignment({
      assignmentId: submittingAsg.id,
      studentId: student.id,
      studentName: student.fullName,
      content: submissionContent,
      fileName: 'HoangNam_BaiLam.pdf',
      status: 'submitted',
    });

    setSubmittingAsg(null);
    setSubmissionContent('');
    showToast('Nộp bài tập thành công!', 'success');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumbItems={[
          { label: 'Góc học tập' },
          { label: `Lớp ${student.className}` },
        ]}
        title={`Chào em, ${currentUser?.fullName || student.fullName}!`}
        subtitle={`Mã HS: ${student.studentCode}`}
        action={
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono bg-[#031526] border border-[#0e3d54] text-cyan-300 px-2.5 py-1 rounded-lg">
              Lớp {student.className}
            </span>
          </div>
        }
      />

      {/* Student KPI Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
          <span className="text-xs text-slate-500 font-medium">Điểm trung bình (ĐTB)</span>
          <div className="text-2xl font-bold text-blue-600 mt-1 tabular-nums">{student.gpa}</div>
          <span className="text-xs text-slate-400 mt-0.5 block">Môn Toán: {myGrades?.averageScore ?? '8.7'}</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
          <span className="text-xs text-slate-500 font-medium">Chuyên cần</span>
          <div className="text-2xl font-bold text-emerald-600 mt-1 tabular-nums">{student.attendanceRate}%</div>
          <span className="text-xs text-emerald-600 mt-0.5 block">Chưa nghỉ buổi nào</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
          <span className="text-xs text-slate-500 font-medium">Bài tập cần hoàn thành</span>
          <div className="text-2xl font-bold text-amber-600 mt-1 tabular-nums">1 bài</div>
          <span className="text-xs text-slate-400 mt-0.5 block">Hạn nộp: 25/02</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
          <span className="text-xs text-slate-500 font-medium">Điểm thi đua nề nếp</span>
          <div className="text-2xl font-bold text-purple-600 mt-1 tabular-nums">+{student.behaviorPoints}</div>
          <span className="text-xs text-purple-600 mt-0.5 block">Hạng 2 trong tổ</span>
        </div>
      </div>

      {/* Schedule & Homework */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Homework list */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Bài tập môn học cần làm</h3>
            <span className="text-xs text-slate-400">{assignments.length} bài tập</span>
          </div>

          <div className="space-y-3">
            {assignments.map(asg => {
              const mySub = db.getStudentSubmission(asg.id, student.id);
              return (
                <div
                  key={asg.id}
                  className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                        {asg.subjectName}
                      </span>
                      <h4 className="font-bold text-slate-900 text-sm">{asg.title}</h4>
                    </div>
                    <p className="text-slate-500 mt-1">{asg.description}</p>
                    <div className="text-[11px] text-slate-400 mt-1">
                      Hạn nộp: {new Date(asg.dueDate).toLocaleString('vi-VN')}
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-3">
                    {mySub ? (
                      <div className="text-right">
                        <span className="text-emerald-700 bg-emerald-50 px-2 py-1 rounded font-semibold block mb-1">
                          Đã nộp bài
                        </span>
                        {mySub.score !== undefined && (
                          <span className="font-bold text-blue-600 text-sm tabular-nums">
                            {mySub.score}/10 điểm
                          </span>
                        )}
                      </div>
                    ) : (
                      <button
                        onClick={() => setSubmittingAsg(asg)}
                        className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-xs flex items-center gap-1.5 transition-colors"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Nộp bài ngay</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Today's Schedule */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Lịch học hôm nay</h3>
            <span className="text-xs text-blue-600 font-semibold">Thứ Năm</span>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-100">
              <span className="font-bold text-blue-700 tabular-nums">Tiết 1 - 2 (07:30 - 09:05)</span>
              <div className="font-bold text-slate-900 text-sm mt-0.5">Tiếng Anh</div>
              <div className="text-slate-500 text-[11px] mt-0.5">Cô Lan · Phòng A.302</div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="font-bold text-slate-600 tabular-nums">Tiết 3 (09:25 - 10:10)</span>
              <div className="font-bold text-slate-900 text-sm mt-0.5">Sinh học</div>
              <div className="text-slate-500 text-[11px] mt-0.5">Cô Yến · Phòng A.302</div>
            </div>
          </div>
        </div>
      </div>

      {/* Homework Submission Modal */}
      {submittingAsg && (
        <Modal
          isOpen={!!submittingAsg}
          onClose={() => setSubmittingAsg(null)}
          title={`Nộp bài tập: ${submittingAsg.title}`}
          subtitle={`Môn ${submittingAsg.subjectName}`}
          maxWidth="md"
        >
          <form onSubmit={handleSubmitHomework} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Lời nhắn / Bài làm text</label>
              <textarea
                rows={3}
                value={submissionContent}
                onChange={e => setSubmissionContent(e.target.value)}
                placeholder="Nhập lời giải hoặc ghi chú cho thầy cô..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Đính kèm file bài làm (PDF, ảnh)</label>
              <input
                type="file"
                className="block w-full text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setSubmittingAsg(null)}
                className="px-4 py-2 font-semibold text-slate-700 hover:bg-slate-100 rounded-lg"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-4 py-2 font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs"
              >
                Xác nhận nộp bài
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
