import React, { useState } from 'react';
import {
  Sparkles,
  HelpCircle,
  FileText,
  UserCheck,
  Copy,
  Plus,
  Check,
  RotateCcw,
  BookOpen
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { Breadcrumb } from '../../components/common/Breadcrumb';
import { aiService, GeneratedQuestion, StudentCommentSuggestion } from '../../services/aiService';
import { db } from '../../services/db';
import { useToast } from '../../contexts/ToastContext';

export const AIAssistantPage: React.FC = () => {
  const { showToast } = useToast();

  const [activeMode, setActiveMode] = useState<'quiz' | 'comment' | 'lesson_plan'>('quiz');

  // Quiz generator state
  const [topic, setTopic] = useState('Hàm số bậc hai và đồ thị Parabol');
  const [subject, setSubject] = useState('Toán học');
  const [grade, setGrade] = useState(10);
  const [questionCount, setQuestionCount] = useState(3);
  const [isLoadingQuiz, setIsLoadingQuiz] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<GeneratedQuestion[]>([]);

  // Comment generator state
  const [studentName, setStudentName] = useState('Nguyễn Hoàng Nam');
  const [gpa, setGpa] = useState(8.8);
  const [attendanceRate, setAttendanceRate] = useState(98);
  const [behaviorPoints, setBehaviorPoints] = useState(45);
  const [isLoadingComment, setIsLoadingComment] = useState(false);
  const [suggestedComment, setSuggestedComment] = useState<StudentCommentSuggestion | null>(null);

  // Lesson plan state
  const [lessonTopic, setLessonTopic] = useState('Hệ thức lượng trong tam giác và Định lý Cosin');
  const [isLoadingLesson, setIsLoadingLesson] = useState(false);
  const [lessonPlanText, setLessonPlanText] = useState('');

  const [copied, setCopied] = useState(false);

  const handleGenerateQuestions = async () => {
    setIsLoadingQuiz(true);
    try {
      const res = await aiService.generateQuestions(topic, subject, grade, questionCount);
      setGeneratedQuestions(res);
      showToast(`Đã tạo thành công ${res.length} câu hỏi gợi ý!`, 'success');
    } catch (e) {
      showToast('Đã có lỗi xảy ra khi tạo câu hỏi', 'error');
    } finally {
      setIsLoadingQuiz(false);
    }
  };

  const handleAddQuestionToBank = (q: GeneratedQuestion) => {
    db.createQuestion({
      subject,
      grade,
      topic,
      type: q.type,
      content: q.content,
      options: q.options,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation,
      difficulty: q.difficulty,
      tags: [topic, subject],
    });
    showToast('Đã lưu câu hỏi vào Ngân hàng câu hỏi!', 'success');
  };

  const handleGenerateComment = async () => {
    setIsLoadingComment(true);
    try {
      const res = await aiService.generateStudentComment(studentName, gpa, attendanceRate, behaviorPoints);
      setSuggestedComment(res);
      showToast('Đã tạo nhận xét thành công!', 'success');
    } catch (e) {
      showToast('Lỗi tạo nhận xét', 'error');
    } finally {
      setIsLoadingComment(false);
    }
  };

  const handleGenerateLessonPlan = async () => {
    setIsLoadingLesson(true);
    try {
      const res = await aiService.generateLessonPlanOutline(lessonTopic, subject, grade);
      setLessonPlanText(res);
      showToast('Đã tạo khung kế hoạch bài dạy!', 'success');
    } catch (e) {
      showToast('Lỗi tạo giáo án', 'error');
    } finally {
      setIsLoadingLesson(false);
    }
  };

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    showToast('Đã sao chép vào bộ nhớ tạm!', 'info');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      <PageHeader
        breadcrumbItems={[
          { label: 'Dạy & Học', href: '/teacher/classes' },
          { label: 'AI Hỗ trợ sư phạm' },
        ]}
        title="Trợ lý AI Hỗ trợ Sư phạm Smart Class"
        action={
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono bg-[#031526] border border-[#0e3d54] text-cyan-300 px-2.5 py-1 rounded-lg">
              Smart Assistant v2.0
            </span>
          </div>
        }
      />

      {/* Mode Switcher */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl max-w-lg text-xs font-semibold">
        <button
          onClick={() => setActiveMode('quiz')}
          className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-colors ${
            activeMode === 'quiz' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Tạo câu hỏi / Quiz</span>
        </button>
        <button
          onClick={() => setActiveMode('comment')}
          className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-colors ${
            activeMode === 'comment' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <UserCheck className="w-3.5 h-3.5" />
          <span>Gợi ý nhận xét học sinh</span>
        </button>
        <button
          onClick={() => setActiveMode('lesson_plan')}
          className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-colors ${
            activeMode === 'lesson_plan' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Soạn giáo án CV 5512</span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* MODE 1: TẠO CÂU HỎI TRẮC NGHIỆM                          */}
      {/* ========================================================= */}
      {activeMode === 'quiz' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Thiết lập yêu cầu</h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Môn học</label>
              <select
                value={subject}
                onChange={e => setSubject(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white text-slate-800"
              >
                <option value="Toán học">Toán học</option>
                <option value="Vật lý">Vật lý</option>
                <option value="Hóa học">Hóa học</option>
                <option value="Ngữ văn">Ngữ văn</option>
                <option value="Tiếng Anh">Tiếng Anh</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Khối lớp (12 khối)</label>
              <select
                value={grade}
                onChange={e => setGrade(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white text-slate-800"
              >
                <optgroup label="Cấp Tiểu học (Khối 1 - 5)">
                  <option value={1}>Khối 1</option>
                  <option value={2}>Khối 2</option>
                  <option value={3}>Khối 3</option>
                  <option value={4}>Khối 4</option>
                  <option value={5}>Khối 5</option>
                </optgroup>
                <optgroup label="Cấp THCS (Khối 6 - 9)">
                  <option value={6}>Khối 6</option>
                  <option value={7}>Khối 7</option>
                  <option value={8}>Khối 8</option>
                  <option value={9}>Khối 9</option>
                </optgroup>
                <optgroup label="Cấp THPT (Khối 10 - 12)">
                  <option value={10}>Khối 10</option>
                  <option value={11}>Khối 11</option>
                  <option value={12}>Khối 12</option>
                </optgroup>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Chủ đề bài học *</label>
              <input
                type="text"
                value={topic}
                onChange={e => setTopic(e.target.value)}
                placeholder="Ví dụ: Hàm số bậc hai, Vectơ..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Số lượng câu hỏi</label>
              <input
                type="number"
                min="1"
                max="5"
                value={questionCount}
                onChange={e => setQuestionCount(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-800"
              />
            </div>

            <button
              onClick={handleGenerateQuestions}
              disabled={isLoadingQuiz || !topic.trim()}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center justify-center gap-2 transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isLoadingQuiz ? 'AI đang biên soạn...' : 'Tạo câu hỏi với AI'}</span>
            </button>
          </div>

          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">
                Câu hỏi được gợi ý ({generatedQuestions.length})
              </h3>
              {generatedQuestions.length > 0 && (
                <span className="text-xs text-slate-400">
                  Thầy/Cô có thể kiểm tra và lưu vào Ngân hàng câu hỏi
                </span>
              )}
            </div>

            {generatedQuestions.length === 0 ? (
              <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-8 text-center text-xs text-slate-400">
                Nhấn &ldquo;Tạo câu hỏi với AI&rdquo; để nhận danh sách câu hỏi phù hợp với chương trình GDPT.
              </div>
            ) : (
              generatedQuestions.map((q, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="font-bold text-slate-900 text-xs">
                      Câu {idx + 1}. {q.content}
                    </span>
                    <span className="text-[10px] uppercase font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-sm shrink-0">
                      Độ khó: {q.difficulty}
                    </span>
                  </div>

                  {q.options && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {q.options.map(opt => (
                        <div
                          key={opt.id}
                          className={`p-2 rounded-lg border text-xs flex items-center gap-2 ${
                            opt.id === q.correctAnswer
                              ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-semibold'
                              : 'bg-slate-50 border-slate-200 text-slate-700'
                          }`}
                        >
                          <span className="w-5 h-5 rounded-full bg-white border border-slate-200 flex items-center justify-center font-bold text-[11px]">
                            {opt.id}
                          </span>
                          <span>{opt.text}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600">
                    <strong className="text-slate-800">Lời giải chi tiết:</strong> {q.explanation}
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={() => handleAddQuestionToBank(q)}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Lưu vào Ngân hàng câu hỏi</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODE 2: GỢI Ý NHẬN XÉT HỌC SINH                           */}
      {/* ========================================================= */}
      {activeMode === 'comment' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Dữ liệu học sinh</h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Tên học sinh *</label>
              <input
                type="text"
                value={studentName}
                onChange={e => setStudentName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-800"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Điểm TB (ĐTB)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  value={gpa}
                  onChange={e => setGpa(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-800"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Chuyên cần (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={attendanceRate}
                  onChange={e => setAttendanceRate(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Điểm nề nếp thi đua</label>
              <input
                type="number"
                value={behaviorPoints}
                onChange={e => setBehaviorPoints(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-800"
              />
            </div>

            <button
              onClick={handleGenerateComment}
              disabled={isLoadingComment || !studentName.trim()}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center justify-center gap-2 transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isLoadingComment ? 'AI đang phân tích...' : 'Gợi ý lời nhận xét'}</span>
            </button>
          </div>

          <div className="lg:col-span-2">
            {suggestedComment ? (
              <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className="text-sm font-bold text-slate-900">
                    Bản thảo nhận xét cho em {suggestedComment.studentName}
                  </h3>
                  <button
                    onClick={() => handleCopyText(suggestedComment.fullDraft)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Đã sao chép' : 'Sao chép văn bản'}</span>
                  </button>
                </div>

                <div className="p-4 rounded-xl bg-blue-50/40 border border-blue-100 text-sm leading-relaxed text-slate-800 whitespace-pre-wrap">
                  {suggestedComment.fullDraft}
                </div>

                <div className="space-y-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-slate-50">
                    <span className="font-bold text-slate-700">Học lực:</span> {suggestedComment.academicPerformance}
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-50">
                    <span className="font-bold text-slate-700">Nề nếp:</span> {suggestedComment.conductComment}
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-50">
                    <span className="font-bold text-slate-700">Phương hướng:</span> {suggestedComment.encouragement}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-8 text-center text-xs text-slate-400">
                Nhập thông số học sinh và nhấn tạo nhận xét để xem gợi ý sư phạm.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODE 3: SOẠN GIÁO ÁN CV 5512                              */}
      {/* ========================================================= */}
      {activeMode === 'lesson_plan' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Thông tin bài dạy</h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Tên bài học *</label>
              <input
                type="text"
                value={lessonTopic}
                onChange={e => setLessonTopic(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-800"
              />
            </div>

            <button
              onClick={handleGenerateLessonPlan}
              disabled={isLoadingLesson || !lessonTopic.trim()}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center justify-center gap-2 transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isLoadingLesson ? 'AI đang lập dàn ý...' : 'Lập khung giáo án 5512'}</span>
            </button>
          </div>

          <div className="lg:col-span-2">
            {lessonPlanText ? (
              <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className="text-sm font-bold text-slate-900">Khung Kế hoạch Bài dạy (Công văn 5512)</h3>
                  <button
                    onClick={() => handleCopyText(lessonPlanText)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Đã sao chép' : 'Sao chép văn bản'}</span>
                  </button>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 font-mono text-xs leading-relaxed text-slate-800 whitespace-pre-wrap max-h-[500px] overflow-y-auto">
                  {lessonPlanText}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-8 text-center text-xs text-slate-400">
                Nhập tên bài học và nhấn &ldquo;Lập khung giáo án 5512&rdquo;.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
