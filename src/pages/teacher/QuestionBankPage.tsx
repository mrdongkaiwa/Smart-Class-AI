import React, { useState, useEffect, useRef } from 'react';
import {
  HelpCircle,
  Plus,
  Sparkles,
  Upload,
  Download,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  FileText,
  Trash2,
  Edit2,
  Copy,
  Eye,
  CheckSquare,
  AlertCircle,
  FileSpreadsheet,
  ArrowLeftRight,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Layers,
  Tag,
  Check,
  X,
  Save,
  Image as ImageIcon
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { Modal } from '../../components/common/Modal';
import { db } from '../../services/db';
import { Question } from '../../types';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';

export const QuestionBankPage: React.FC = () => {
  const { showToast } = useToast();
  const { currentUser } = useAuth();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'approved' | 'pending' | 'draft' | 'review'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [gradeFilter, setGradeFilter] = useState<string>('all');
  const [subjectFilter, setSubjectFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  // Subjects dynamic list state (with + Add new option support)
  const [subjectsList, setSubjectsList] = useState<string[]>([
    'Toán học',
    'Vật lý',
    'Hóa học',
    'Tiếng Anh',
    'Ngữ văn',
    'Sinh học',
    'Lịch sử',
    'Địa lý'
  ]);

  // Add Subject Modal State
  const [isAddSubjectModalOpen, setIsAddSubjectModalOpen] = useState(false);
  const [newSubjectInput, setNewSubjectInput] = useState('');
  const [pendingSubjectSetter, setPendingSubjectSetter] = useState<((s: string) => void) | null>(null);

  const handleSubjectSelectChange = (val: string, setter: (s: string) => void) => {
    if (val === '__add_new__') {
      setPendingSubjectSetter(() => setter);
      setNewSubjectInput('');
      setIsAddSubjectModalOpen(true);
    } else {
      setter(val);
    }
  };

  const handleConfirmAddSubject = () => {
    const trimmed = newSubjectInput.trim();
    if (!trimmed) {
      showToast('Vui lòng nhập tên môn học', 'warning');
      return;
    }
    if (!subjectsList.includes(trimmed)) {
      setSubjectsList(prev => [...prev, trimmed]);
    }
    if (pendingSubjectSetter) {
      pendingSubjectSetter(trimmed);
    }
    showToast(`Đã thêm môn học mới: ${trimmed}`, 'success');
    setIsAddSubjectModalOpen(false);
    setNewSubjectInput('');
    setPendingSubjectSetter(null);
  };

  // Selection for batch actions & creating exam
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<string[]>([]);

  // Main Mode: 'list' (Danh sách ngân hàng) or 'create' (Khu vực tạo câu hỏi theo 3 Tab trực tiếp)
  const [mode, setMode] = useState<'list' | 'create'>('list');
  const [activeCreationTab, setActiveCreationTab] = useState<'import' | 'ai' | 'manual'>('import');

  // Modals for viewing/deleting
  const [viewingQuestion, setViewingQuestion] = useState<Question | null>(null);
  const [deletingQuestionId, setDeletingQuestionId] = useState<string | null>(null);

  // Manual Creation form state
  const [manualSubject, setManualSubject] = useState('Toán học');
  const [manualGrade, setManualGrade] = useState(10);
  const [manualTopic, setManualTopic] = useState('');
  const [manualType, setManualType] = useState<'single' | 'multiple' | 'true_false' | 'fill' | 'short_essay'>('single');
  const [manualDifficulty, setManualDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [manualContent, setManualContent] = useState('');
  const [manualOptA, setManualOptA] = useState('');
  const [manualOptB, setManualOptB] = useState('');
  const [manualOptC, setManualOptC] = useState('');
  const [manualOptD, setManualOptD] = useState('');
  const [manualCorrect, setManualCorrect] = useState('A');
  const [manualExplanation, setManualExplanation] = useState('');

  // AI Wizard state
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiSubject, setAiSubject] = useState('Toán học');
  const [aiGrade, setAiGrade] = useState(10);
  const [aiCount, setAiCount] = useState(5);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiGeneratedList, setAiGeneratedList] = useState<Question[]>([]);

  // AI Source attachment states (PDF, DOCX, URL, Text, Image)
  const [aiSourceType, setAiSourceType] = useState<'text' | 'file' | 'url' | 'image'>('text');
  const [aiAttachedFiles, setAiAttachedFiles] = useState<File[]>([]);
  const [aiUrlInput, setAiUrlInput] = useState('');
  const [aiAttachedImage, setAiAttachedImage] = useState<File | null>(null);

  // Import wizard state
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importLoading, setImportLoading] = useState(false);

  useEffect(() => {
    const allQ = db.getQuestions ? db.getQuestions() : [];
    setQuestions(allQ);
  }, []);

  const handleToggleSelectAll = () => {
    if (selectedQuestionIds.length === filteredQuestions.length) {
      setSelectedQuestionIds([]);
    } else {
      setSelectedQuestionIds(filteredQuestions.map(q => q.id));
    }
  };

  const handleToggleSelectOne = (id: string) => {
    setSelectedQuestionIds(prev =>
      prev.includes(id) ? prev.filter(qId => qId !== id) : [...prev, id]
    );
  };

  const handleDelete = (id: string) => {
    if (db.deleteQuestion) {
      db.deleteQuestion(id);
    }
    setQuestions(prev => prev.filter(q => q.id !== id));
    showToast('Đã xóa câu hỏi thành công!', 'success');
    setDeletingQuestionId(null);
  };

  const handleApprove = (id: string) => {
    setQuestions(prev =>
      prev.map(q => (q.id === id ? { ...q, status: 'approved' as any } : q))
    );
    showToast('Đã phê duyệt câu hỏi thành công!', 'success');
  };

  // Filter logic
  const filteredQuestions = questions.filter(q => {
    const matchesSearch =
      q.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (q.tags && q.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase())));

    const matchesGrade = gradeFilter === 'all' || q.grade.toString() === gradeFilter;
    const matchesSubject = subjectFilter === 'all' || q.subject === subjectFilter;
    const matchesType = typeFilter === 'all' || q.type === typeFilter;

    const status = (q as any).status || 'approved';
    const matchesTab =
      activeTab === 'all' ||
      (activeTab === 'approved' && status === 'approved') ||
      (activeTab === 'pending' && status === 'pending_review') ||
      (activeTab === 'draft' && status === 'draft') ||
      (activeTab === 'review' && (status === 'needs_fix' || status === 'archived'));

    return matchesSearch && matchesGrade && matchesSubject && matchesType && matchesTab;
  });

  const countApproved = questions.filter(q => (q as any).status === 'approved' || !(q as any).status).length;
  const countPending = questions.filter(q => (q as any).status === 'pending_review').length;
  const countDraft = questions.filter(q => (q as any).status === 'draft').length;
  const countReview = questions.filter(q => (q as any).status === 'needs_fix' || (q as any).status === 'archived').length;

  const handleSaveManualQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualContent.trim()) {
      showToast('Vui lòng nhập nội dung câu hỏi', 'warning');
      return;
    }

    if (manualType === 'fill' && !manualCorrect.trim()) {
      showToast('Vui lòng nhập đáp án đúng cho câu hỏi điền vào chỗ trống', 'warning');
      return;
    }

    let finalCorrect = manualCorrect;
    if (manualType === 'single') {
      finalCorrect = (manualCorrect && ['A', 'B', 'C', 'D'].includes(manualCorrect.trim())) ? manualCorrect.trim() : 'A';
    }

    const newQ: Question = {
      id: `q_manual_${Date.now()}`,
      subject: manualSubject,
      grade: manualGrade,
      topic: manualTopic.trim() || 'Chủ đề chung',
      type: manualType,
      difficulty: manualDifficulty,
      content: manualContent.trim(),
      options: manualType === 'single' || manualType === 'multiple' ? [
        { id: 'A', text: manualOptA || 'Đáp án A' },
        { id: 'B', text: manualOptB || 'Đáp án B' },
        { id: 'C', text: manualOptC || 'Đáp án C' },
        { id: 'D', text: manualOptD || 'Đáp án D' },
      ] : undefined,
      correctAnswer: finalCorrect,
      explanation: manualExplanation.trim() || 'Không có giải thích chi tiết.',
      tags: [manualSubject, `Khối ${manualGrade}`],
      status: 'approved' as any,
    };

    if (db.createQuestion) {
      db.createQuestion(newQ);
    }
    setQuestions(prev => [newQ, ...prev]);
    showToast('Đã tạo và lưu câu hỏi thủ công thành công vào Ngân hàng!', 'success');
    setMode('list');
    setManualContent('');
    setManualOptA('');
    setManualOptB('');
    setManualOptC('');
    setManualOptD('');
    setManualExplanation('');
  };

  const handleRunAIGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) {
      showToast('Vui lòng nhập mô tả hoặc nội dung chủ đề cho AI', 'warning');
      return;
    }
    setAiLoading(true);
    setTimeout(() => {
      setAiLoading(false);
      const mockGenerated: Question[] = [
        {
          id: `ai_${Date.now()}_1`,
          subject: aiSubject,
          grade: aiGrade,
          topic: aiPrompt.slice(0, 30),
          type: 'single',
          content: `(AI Đề xuất) Cho hàm số $y = f(x)$ có đạo hàm liên tục trên $\\mathbb{R}$. Tìm mệnh đề đúng về cực trị của hàm số dựa trên thông tin: ${aiPrompt}`,
          options: [
            { id: 'A', text: 'Hàm số đạt cực đại tại điểm đổi dấu của đạo hàm từ dương sang âm.' },
            { id: 'B', text: 'Hàm số đạt cực tiểu tại điểm đạo hàm bằng 0.' },
            { id: 'C', text: 'Đạo hàm đổi dấu từ âm sang dương thì hàm số đạt cực đại.' },
            { id: 'D', text: 'Giá trị cực đại luôn lớn hơn giá trị cực tiểu.' },
          ],
          correctAnswer: 'A',
          explanation: 'Theo định lý về điều kiện đủ để hàm số đạt cực trị: Nếu $f\'(x)$ đổi dấu từ dương sang âm qua điểm $x_0$ thì hàm số đạt cực đại tại $x_0$.',
          difficulty: 'medium',
          tags: ['AI-Generated', aiSubject, `Khối ${aiGrade}`],
          status: 'pending_review',
        } as any,
        {
          id: `ai_${Date.now()}_2`,
          subject: aiSubject,
          grade: aiGrade,
          topic: aiPrompt.slice(0, 30),
          type: 'true_false',
          content: `(AI Đề xuất) Xét tính đúng/sai của các phát biểu sau đối với chủ đề: ${aiPrompt}`,
          options: [
            { id: '1', text: 'Phát biểu 1: Đồ thị hàm số luôn nhận trục tung làm trục đối xứng.' },
            { id: '2', text: 'Phát biểu 2: Tập xác định của hàm số chứa toàn bộ số thực.' },
          ],
          correctAnswer: ['false', 'true'],
          explanation: 'Kiểm tra kỹ lưỡng điều kiện xác định và tính chẵn lẻ.',
          difficulty: 'hard',
          tags: ['AI-Generated', 'Đúng/Sai'],
          status: 'pending_review',
        } as any,
      ];
      setAiGeneratedList(mockGenerated);
      showToast('AI đã tạo thành công 2 câu hỏi bám sát nguồn!', 'success');
    }, 1200);
  };

  const handleSaveAIGenerated = () => {
    setQuestions(prev => [...aiGeneratedList, ...prev]);
    setMode('list');
    setAiGeneratedList([]);
    setAiPrompt('');
    showToast('Đã lưu các câu hỏi AI đã duyệt vào Ngân hàng!', 'success');
  };

  return (
    <div className="space-y-4">
      <PageHeader
        breadcrumbItems={[
          { label: 'Dạy & Học' },
          { label: 'Ngân hàng câu hỏi' },
        ]}
        title="Ngân hàng Câu hỏi Thông minh"
        subtitle="Quản lý kho câu hỏi chuẩn 9 dạng, tích hợp AI & Import đa định dạng"
        action={<div className="hidden" />}
      />

      {/* 3 Tab phương thức tạo câu hỏi trực tiếp trên giao diện (Không dùng popup) */}
      <div className="bg-[#041527] p-3.5 rounded-xl border border-[#0e3d54] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-cyan-300 ml-1">Phương thức:</span>
          <div className="flex items-center gap-1 p-1 bg-[#02101e] rounded-lg border border-[#0e3d54]">
            <button
              onClick={() => {
                setActiveCreationTab('import');
                setMode('create');
              }}
              className={`px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                mode === 'create' && activeCreationTab === 'import' ? 'bg-[#0284c7] text-white shadow-sm' : 'text-slate-300 hover:bg-[#062440]'
              }`}
            >
              <Upload className="w-3.5 h-3.5 text-emerald-400" />
              <span>Tab 1: Nhập câu hỏi bằng cách import</span>
            </button>

            <button
              onClick={() => {
                setActiveCreationTab('ai');
                setMode('create');
              }}
              className={`px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                mode === 'create' && activeCreationTab === 'ai' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-300 hover:bg-[#062440]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-300" />
              <span>Tab 2: Tạo bằng AI thông minh</span>
            </button>

            <button
              onClick={() => {
                setActiveCreationTab('manual');
                setMode('create');
              }}
              className={`px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                mode === 'create' && activeCreationTab === 'manual' ? 'bg-[#0284c7] text-white shadow-sm' : 'text-slate-300 hover:bg-[#062440]'
              }`}
            >
              <Plus className="w-3.5 h-3.5 text-cyan-400" />
              <span>Tab 3: Tạo bằng thủ công</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {mode === 'create' && (
            <button
              onClick={() => setMode('list')}
              className="px-3 py-1.5 bg-[#03172c] hover:bg-[#07243e] text-cyan-300 border border-[#0e3d54] text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              &larr; Quay lại danh sách ngân hàng
            </button>
          )}
        </div>
      </div>

      {/* NẾU ĐANG Ở CHẾ ĐỘ TẠO CÂU HỎI (HIỂN THỊ TRỰC TIẾP 3 TAB) */}
      {mode === 'create' ? (
        <div className="bg-[#041527] p-6 rounded-2xl border border-[#0e3d54] shadow-xl space-y-6">
          {activeCreationTab === 'import' && (
            <div className="space-y-4 text-xs max-w-2xl mx-auto py-2">
              <div className="text-center space-y-1">
                <h3 className="text-base font-bold text-white">Tab 1: Nhập câu hỏi từ file Word / Excel / CSV</h3>
                <p className="text-slate-400">Tải template chuẩn, hệ thống tự động kiểm tra Unicode, validate schema và phát hiện trùng lặp.</p>
              </div>

              <div className="p-4 bg-[#03172c] border border-[#0e3d54] rounded-xl space-y-2">
                <span className="font-bold text-white">Bước 1: Tải template chuẩn định dạng</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => showToast('Đã tải template Excel chuẩn (Questions_Template.xlsx)', 'success')}
                    className="px-3 py-1.5 bg-[#0284c7] text-white rounded-lg font-bold hover:bg-[#0369a1] cursor-pointer"
                  >
                    Tải Template Excel
                  </button>
                  <button
                    onClick={() => showToast('Đã tải template Word quy ước (Questions_Template.docx)', 'success')}
                    className="px-3 py-1.5 bg-[#041527] border border-[#0e3d54] text-slate-200 rounded-lg font-semibold hover:bg-[#072540] cursor-pointer"
                  >
                    Tải Template Word
                  </button>
                </div>
              </div>

              <div className="p-6 border-2 border-dashed border-[#0e3d54] rounded-xl text-center space-y-3 bg-[#02101e]">
                <FileSpreadsheet className="w-10 h-10 text-emerald-400 mx-auto" />
                <div className="font-bold text-white text-sm">Tải lên file câu hỏi (DOCX, XLSX, CSV, JSON)</div>
                <input
                  type="file"
                  accept=".docx,.xlsx,.csv,.json"
                  onChange={e => {
                    if (e.target.files && e.target.files[0]) {
                      setImportFile(e.target.files[0]);
                    }
                  }}
                  className="block mx-auto text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-[#041527] file:text-cyan-300 hover:file:bg-[#072540] cursor-pointer"
                />
              </div>

              {importFile && (
                <div className="p-4 bg-emerald-950/40 border border-emerald-800/60 rounded-xl flex items-center justify-between">
                  <div>
                    <div className="font-bold text-white">Đã chọn file: {importFile.name}</div>
                    <div className="text-[11px] text-emerald-400">Sẵn sàng validate và đọc dữ liệu (0 lỗi nghiêm trọng).</div>
                  </div>
                  <button
                    onClick={() => {
                      setImportLoading(true);
                      setTimeout(() => {
                        setImportLoading(false);
                        setImportFile(null);
                        setMode('list');
                        showToast('Import thành công 15 câu hỏi từ file vào ngân hàng!', 'success');
                      }, 1000);
                    }}
                    disabled={importLoading}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold shadow-sm cursor-pointer disabled:opacity-50"
                  >
                    {importLoading ? 'Đang xử lý...' : 'Xác nhận Import'}
                  </button>
                </div>
              )}
            </div>
          )}

          {activeCreationTab === 'ai' && (
            <div className="space-y-4 text-xs max-w-3xl mx-auto py-2">
              <div className="text-center space-y-1">
                <h3 className="text-base font-bold text-white">Tab 2: Trợ lý AI Gemini - Tạo Ngân hàng câu hỏi thông minh</h3>
                <p className="text-slate-400">Quy trình AI 5 bước: Nhập chủ đề bài học → Cấu hình khối, môn, số lượng → Gemini tạo câu hỏi → Review & Lưu.</p>
              </div>

              <div className="p-3 bg-purple-950/40 border border-purple-800/60 rounded-xl text-purple-200">
                <strong>Chống Hallucination:</strong> AI bám sát nguồn, ghi rõ khi thiếu căn cứ và gắn nhãn cần giáo viên kiểm tra.
              </div>

              <form onSubmit={handleRunAIGenerate} className="space-y-3">
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-1.5 gap-2">
                    <label className="block font-semibold text-slate-300">
                      Nguồn nội dung / Tài liệu gốc cho AI:
                    </label>
                    <div className="flex items-center gap-1 text-[11px] flex-wrap">
                      <button
                        type="button"
                        onClick={() => setAiSourceType('text')}
                        className={`px-2 py-1 rounded-md font-bold transition-colors cursor-pointer ${
                          aiSourceType === 'text' ? 'bg-purple-600 text-white' : 'bg-[#02101e] text-slate-400 hover:text-white'
                        }`}
                      >
                        ✍️ Văn bản
                      </button>
                      <button
                        type="button"
                        onClick={() => setAiSourceType('file')}
                        className={`px-2 py-1 rounded-md font-bold transition-colors cursor-pointer ${
                          aiSourceType === 'file' ? 'bg-purple-600 text-white' : 'bg-[#02101e] text-slate-400 hover:text-white'
                        }`}
                      >
                        📎 File (PDF/Word)
                      </button>
                      <button
                        type="button"
                        onClick={() => setAiSourceType('url')}
                        className={`px-2 py-1 rounded-md font-bold transition-colors cursor-pointer ${
                          aiSourceType === 'url' ? 'bg-purple-600 text-white' : 'bg-[#02101e] text-slate-400 hover:text-white'
                        }`}
                      >
                        🔗 Link Web
                      </button>
                      <button
                        type="button"
                        onClick={() => setAiSourceType('image')}
                        className={`px-2 py-1 rounded-md font-bold transition-colors cursor-pointer ${
                          aiSourceType === 'image' ? 'bg-purple-600 text-white' : 'bg-[#02101e] text-slate-400 hover:text-white'
                        }`}
                      >
                        🖼️ Hình ảnh
                      </button>
                    </div>
                  </div>

                  {aiSourceType === 'text' && (
                    <textarea
                      rows={3}
                      placeholder="Dán hoặc nhập nội dung chủ đề bài học, đoạn trích tài liệu, yêu cầu sinh câu hỏi..."
                      value={aiPrompt}
                      onChange={e => setAiPrompt(e.target.value)}
                      className="w-full bg-[#02101e] border border-[#0e3d54] rounded-lg p-2.5 text-white focus:border-purple-400 focus:outline-none"
                    />
                  )}

                  {aiSourceType === 'file' && (
                    <div className="p-4 border-2 border-dashed border-[#0e3d54] rounded-xl text-center space-y-2 bg-[#02101e]">
                      <FileText className="w-8 h-8 text-purple-400 mx-auto" />
                      <div className="font-bold text-white text-xs">Đính kèm tài liệu PDF, Word (.docx, .txt)</div>
                      <input
                        type="file"
                        accept=".pdf,.docx,.doc,.txt"
                        multiple
                        onChange={e => {
                          if (e.target.files) {
                            const newFiles = Array.from(e.target.files);
                            setAiAttachedFiles(prev => [...prev, ...newFiles]);
                            showToast(`Đã đính kèm ${newFiles.length} file tài liệu thành công!`, 'success');
                          }
                        }}
                        className="block mx-auto text-xs text-slate-400 file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-[#041527] file:text-purple-300 hover:file:bg-[#072540] cursor-pointer"
                      />
                      {aiAttachedFiles.length > 0 && (
                        <div className="mt-2 space-y-1 text-left">
                          {aiAttachedFiles.map((f, idx) => (
                            <div key={idx} className="flex items-center justify-between bg-[#041527] px-2.5 py-1.5 rounded border border-[#0e3d54]">
                              <span className="text-purple-300 truncate font-medium">📄 {f.name}</span>
                              <button
                                type="button"
                                onClick={() => setAiAttachedFiles(prev => prev.filter((_, i) => i !== idx))}
                                className="text-rose-400 hover:text-rose-300 text-[10px] cursor-pointer"
                              >
                                Xóa
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {aiSourceType === 'url' && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="url"
                          placeholder="Dán link trang web tài liệu (ví dụ: https://example.com/bai-hoc)..."
                          value={aiUrlInput}
                          onChange={e => setAiUrlInput(e.target.value)}
                          className="flex-1 bg-[#02101e] border border-[#0e3d54] rounded-lg p-2.5 text-white focus:border-purple-400 focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (aiUrlInput.trim()) {
                              showToast(`Đã liên kết thành công nguồn web: ${aiUrlInput}`, 'success');
                            } else {
                              showToast('Vui lòng nhập URL trang web hợp lệ', 'warning');
                            }
                          }}
                          className="px-3 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-bold shrink-0 cursor-pointer"
                        >
                          Thêm Link
                        </button>
                      </div>
                      {aiUrlInput && (
                        <div className="p-2.5 bg-[#03172c] border border-[#0e3d54] rounded-lg flex items-center justify-between text-slate-300">
                          <span className="truncate text-cyan-300 font-medium">🌐 {aiUrlInput}</span>
                          <span className="text-[10px] text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded font-bold">Đã nạp URL</span>
                        </div>
                      )}
                    </div>
                  )}

                  {aiSourceType === 'image' && (
                    <div className="p-4 border-2 border-dashed border-[#0e3d54] rounded-xl text-center space-y-2 bg-[#02101e]">
                      <ImageIcon className="w-8 h-8 text-cyan-400 mx-auto" />
                      <div className="font-bold text-white text-xs">Tải lên hình ảnh tài liệu hoặc ảnh chụp màn hình bài học (.png, .jpg)</div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={e => {
                          if (e.target.files && e.target.files[0]) {
                            setAiAttachedImage(e.target.files[0]);
                            showToast(`Đã đính kèm hình ảnh ${e.target.files[0].name} thành công!`, 'success');
                          }
                        }}
                        className="block mx-auto text-xs text-slate-400 file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-[#041527] file:text-cyan-300 hover:file:bg-[#072540] cursor-pointer"
                      />
                      {aiAttachedImage && (
                        <div className="mt-2 p-2.5 bg-[#041527] border border-[#0e3d54] rounded-lg flex items-center justify-between">
                          <span className="text-cyan-300 font-medium">📷 {aiAttachedImage.name}</span>
                          <button
                            type="button"
                            onClick={() => setAiAttachedImage(null)}
                            className="text-rose-400 hover:text-rose-300 text-[10px] cursor-pointer"
                          >
                            Xóa ảnh
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Môn học</label>
                    <select
                      value={aiSubject}
                      onChange={e => handleSubjectSelectChange(e.target.value, setAiSubject)}
                      className="w-full bg-[#02101e] border border-[#0e3d54] rounded-lg p-2 text-white"
                    >
                      {subjectsList.map(sub => (
                        <option key={sub} value={sub}>{sub}</option>
                      ))}
                      <option value="__add_new__">+ Thêm môn học mới...</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Khối lớp</label>
                    <select
                      value={aiGrade}
                      onChange={e => setAiGrade(Number(e.target.value))}
                      className="w-full bg-[#02101e] border border-[#0e3d54] rounded-lg p-2 text-white"
                    >
                      <option value={10}>Khối 10</option>
                      <option value={11}>Khối 11</option>
                      <option value={12}>Khối 12</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Số lượng câu tạo</label>
                    <input
                      type="number"
                      min={1}
                      max={20}
                      value={aiCount}
                      onChange={e => setAiCount(Number(e.target.value))}
                      className="w-full bg-[#02101e] border border-[#0e3d54] rounded-lg p-2 text-white"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="submit"
                    disabled={aiLoading}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-bold shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {aiLoading ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Gemini đang tạo câu hỏi...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Bắt đầu tạo bằng AI</span>
                      </>
                    )}
                  </button>
                </div>
              </form>

              {aiGeneratedList.length > 0 && (
                <div className="mt-4 pt-4 border-t border-[#0e3d54] space-y-3">
                  <h4 className="font-bold text-white">Kết quả Review từ AI ({aiGeneratedList.length} câu):</h4>
                  {aiGeneratedList.map((aq, ai) => (
                    <div key={ai} className="p-3 bg-[#02101e] rounded-xl border border-purple-500/40 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-purple-300">Câu {ai + 1} ({aq.type})</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 font-semibold">AI đề xuất - Cần GV kiểm tra</span>
                      </div>
                      <div className="text-white font-medium">{aq.content}</div>
                      <div className="text-slate-400 text-[11px]">Đáp án đúng: <strong className="text-cyan-300">{Array.isArray(aq.correctAnswer) ? aq.correctAnswer.join(', ') : aq.correctAnswer}</strong></div>
                    </div>
                  ))}
                  <div className="flex justify-end pt-2">
                    <button
                      onClick={handleSaveAIGenerated}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold shadow-sm cursor-pointer"
                    >
                      Duyệt & Lưu toàn bộ vào Ngân hàng
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeCreationTab === 'manual' && (
            <div className="space-y-4 text-xs max-w-2xl mx-auto py-2">
              <div className="text-center space-y-1">
                <h3 className="text-base font-bold text-white">Tab 3: Tạo câu hỏi thủ công</h3>
                <p className="text-slate-400">Nhập trực tiếp nội dung, thiết lập đáp án và lời giải chi tiết.</p>
              </div>

              <form onSubmit={handleSaveManualQuestion} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Môn học</label>
                    <select
                      value={manualSubject}
                      onChange={e => handleSubjectSelectChange(e.target.value, setManualSubject)}
                      className="w-full bg-[#02101e] border border-[#0e3d54] rounded-lg p-2 text-white"
                    >
                      {subjectsList.map(sub => (
                        <option key={sub} value={sub}>{sub}</option>
                      ))}
                      <option value="__add_new__">+ Thêm môn học mới...</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Khối lớp</label>
                    <select
                      value={manualGrade}
                      onChange={e => setManualGrade(Number(e.target.value))}
                      className="w-full bg-[#02101e] border border-[#0e3d54] rounded-lg p-2 text-white"
                    >
                      <option value={10}>Khối 10</option>
                      <option value={11}>Khối 11</option>
                      <option value={12}>Khối 12</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Dạng câu hỏi</label>
                    <select
                      value={manualType}
                      onChange={e => {
                        const nextType = e.target.value as any;
                        setManualType(nextType);
                        if (nextType === 'single') {
                          const first = manualCorrect.split(',')[0]?.trim();
                          if (['A', 'B', 'C', 'D'].includes(first)) {
                            setManualCorrect(first);
                          } else {
                            setManualCorrect('A');
                          }
                        } else if (nextType === 'multiple') {
                          if (!manualCorrect || !['A', 'B', 'C', 'D'].some(x => manualCorrect.includes(x))) {
                            setManualCorrect('A');
                          }
                        } else if (nextType === 'true_false') {
                          if (manualCorrect !== 'TRUE' && manualCorrect !== 'FALSE') {
                            setManualCorrect('TRUE');
                          }
                        } else if (nextType === 'fill') {
                          if (['A', 'B', 'C', 'D', 'TRUE', 'FALSE'].includes(manualCorrect.trim())) {
                            setManualCorrect('');
                          }
                        }
                      }}
                      className="w-full bg-[#02101e] border border-[#0e3d54] rounded-lg p-2 text-white"
                    >
                      <option value="single">Trắc nghiệm - Pick One (1 đáp án)</option>
                      <option value="multiple">Nhiều đáp án - Pick Many</option>
                      <option value="true_false">Đúng / Sai</option>
                      <option value="fill">Điền vào chỗ trống</option>
                      <option value="short_essay">Tự luận</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Mức độ</label>
                    <select
                      value={manualDifficulty}
                      onChange={e => setManualDifficulty(e.target.value as any)}
                      className="w-full bg-[#02101e] border border-[#0e3d54] rounded-lg p-2 text-white"
                    >
                      <option value="easy">Nhận biết</option>
                      <option value="medium">Thông hiểu</option>
                      <option value="hard">Vận dụng cao</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Chủ đề bài học</label>
                    <input
                      type="text"
                      placeholder="Ví dụ: Hàm số bậc hai"
                      value={manualTopic}
                      onChange={e => setManualTopic(e.target.value)}
                      className="w-full bg-[#02101e] border border-[#0e3d54] rounded-lg p-2 text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Nội dung câu hỏi (hỗ trợ Markdown / LaTeX):</label>
                  <textarea
                    rows={3}
                    placeholder="Nhập nội dung câu hỏi..."
                    value={manualContent}
                    onChange={e => setManualContent(e.target.value)}
                    className="w-full bg-[#02101e] border border-[#0e3d54] rounded-lg p-2.5 text-white focus:border-cyan-400 focus:outline-none"
                  />
                </div>

                {(manualType === 'single' || manualType === 'multiple') && (
                  <div className="space-y-2">
                    <label className="block font-semibold text-slate-300">Các phương án lựa chọn:</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input type="text" placeholder="Đáp án A" value={manualOptA} onChange={e => setManualOptA(e.target.value)} className="bg-[#02101e] border border-[#0e3d54] rounded-lg p-2 text-white" />
                      <input type="text" placeholder="Đáp án B" value={manualOptB} onChange={e => setManualOptB(e.target.value)} className="bg-[#02101e] border border-[#0e3d54] rounded-lg p-2 text-white" />
                      <input type="text" placeholder="Đáp án C" value={manualOptC} onChange={e => setManualOptC(e.target.value)} className="bg-[#02101e] border border-[#0e3d54] rounded-lg p-2 text-white" />
                      <input type="text" placeholder="Đáp án D" value={manualOptD} onChange={e => setManualOptD(e.target.value)} className="bg-[#02101e] border border-[#0e3d54] rounded-lg p-2 text-white" />
                    </div>
                  </div>
                )}

                {manualType === 'true_false' ? (
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Đáp án đúng:</label>
                    <div className="flex items-center gap-6 mt-2">
                      <label className="flex items-center gap-2 cursor-pointer bg-[#02101e] border border-[#0e3d54] px-4 py-2.5 rounded-lg hover:border-emerald-500 transition-colors">
                        <input
                          type="radio"
                          name="manual_true_false_answer"
                          value="TRUE"
                          checked={manualCorrect === 'TRUE'}
                          onChange={() => setManualCorrect('TRUE')}
                          className="w-4 h-4 text-emerald-600 bg-slate-900 border-slate-700 focus:ring-emerald-500"
                        />
                        <span className="text-sm font-bold text-emerald-400">TRUE (Đúng)</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer bg-[#02101e] border border-[#0e3d54] px-4 py-2.5 rounded-lg hover:border-rose-500 transition-colors">
                        <input
                          type="radio"
                          name="manual_true_false_answer"
                          value="FALSE"
                          checked={manualCorrect === 'FALSE'}
                          onChange={() => setManualCorrect('FALSE')}
                          className="w-4 h-4 text-rose-600 bg-slate-900 border-slate-700 focus:ring-rose-500"
                        />
                        <span className="text-sm font-bold text-rose-400">FALSE (Sai)</span>
                      </label>
                    </div>
                  </div>
                ) : manualType === 'single' ? (
                  <div>
                    <label className="block font-semibold text-slate-300 mb-2">Đáp án đúng (Chọn 1 đáp án):</label>
                    <div className="flex items-center gap-4">
                      {['A', 'B', 'C', 'D'].map(opt => {
                        const isChecked = manualCorrect.trim() === opt;
                        return (
                          <label
                            key={opt}
                            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg border cursor-pointer transition-colors ${
                              isChecked
                                ? 'bg-emerald-950/40 border-emerald-500 text-emerald-300'
                                : 'bg-[#02101e] border-[#0e3d54] text-slate-300 hover:border-slate-600'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => setManualCorrect(opt)}
                              className="w-4 h-4 text-emerald-600 bg-slate-900 border-slate-700 rounded focus:ring-emerald-500 cursor-pointer"
                            />
                            <span className="font-bold">{opt}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ) : manualType === 'multiple' ? (
                  <div>
                    <label className="block font-semibold text-slate-300 mb-2">Đáp án đúng (Chọn nhiều đáp án):</label>
                    <div className="flex items-center gap-4">
                      {['A', 'B', 'C', 'D'].map(opt => {
                        const currentArr = manualCorrect.split(',').map(s => s.trim()).filter(Boolean);
                        const isChecked = currentArr.includes(opt);
                        return (
                          <label
                            key={opt}
                            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg border cursor-pointer transition-colors ${
                              isChecked
                                ? 'bg-emerald-950/40 border-emerald-500 text-emerald-300'
                                : 'bg-[#02101e] border-[#0e3d54] text-slate-300 hover:border-slate-600'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={e => {
                                let newArr = [...currentArr];
                                if (e.target.checked) {
                                  if (!newArr.includes(opt)) newArr.push(opt);
                                } else {
                                  newArr = newArr.filter(item => item !== opt);
                                }
                                setManualCorrect(newArr.join(', '));
                              }}
                              className="w-4 h-4 text-emerald-600 bg-slate-900 border-slate-700 rounded focus:ring-emerald-500 cursor-pointer"
                            />
                            <span className="font-bold">{opt}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ) : manualType === 'fill' ? (
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Đáp án đúng:</label>
                    <input
                      type="text"
                      placeholder="Nhập từ hoặc cụm từ cần điền vào chỗ trống..."
                      value={manualCorrect}
                      onChange={e => setManualCorrect(e.target.value)}
                      className="w-full bg-[#02101e] border border-[#0e3d54] rounded-lg p-2.5 text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Đáp án / Hướng dẫn chấm:</label>
                    <textarea
                      rows={2}
                      placeholder="Nhập hướng dẫn chấm hoặc đáp án mẫu..."
                      value={manualCorrect}
                      onChange={e => setManualCorrect(e.target.value)}
                      className="w-full bg-[#02101e] border border-[#0e3d54] rounded-lg p-2 text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
                    />
                  </div>
                )}

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Lời giải chi tiết:</label>
                  <textarea
                    rows={2}
                    placeholder="Nhập lời giải..."
                    value={manualExplanation}
                    onChange={e => setManualExplanation(e.target.value)}
                    className="w-full bg-[#02101e] border border-[#0e3d54] rounded-lg p-2 text-white"
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold shadow-sm flex items-center gap-1.5 cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>Lưu câu hỏi vào Ngân hàng</span>
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Tabs & Toolbar Filter */}
          <div className="bg-[#041527] p-4 rounded-xl border border-[#0e3d54] space-y-3 shadow-sm">
            {/* Tabs */}
            <div className="flex items-center gap-2 border-b border-[#0e3d54] pb-3 overflow-x-auto custom-horizontal-scrollbar">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
                  activeTab === 'all'
                    ? 'bg-[#0284c7] text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-[#062440]'
                }`}
              >
                Tất cả ({questions.length})
              </button>
              <button
                onClick={() => setActiveTab('approved')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
                  activeTab === 'approved'
                    ? 'bg-[#0284c7] text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-[#062440]'
                }`}
              >
                Đã duyệt ({countApproved})
              </button>
              <button
                onClick={() => setActiveTab('pending')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
                  activeTab === 'pending'
                    ? 'bg-[#0284c7] text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-[#062440]'
                }`}
              >
                Chờ duyệt ({countPending})
              </button>
              <button
                onClick={() => setActiveTab('draft')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
                  activeTab === 'draft'
                    ? 'bg-[#0284c7] text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-[#062440]'
                }`}
              >
                Bản nháp ({countDraft})
              </button>
              <button
                onClick={() => setActiveTab('review')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
                  activeTab === 'review'
                    ? 'bg-[#0284c7] text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-[#062440]'
                }`}
              >
                Cần sửa / Lưu trữ ({countReview})
              </button>
            </div>

            {/* Filters and Search Bar */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2.5 flex-1">
                <div className="relative w-full sm:w-72">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Tìm nội dung câu hỏi, chủ đề, tag..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full bg-[#02101e] border border-[#0e3d54] rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <select
                  value={gradeFilter}
                  onChange={e => setGradeFilter(e.target.value)}
                  className="px-2.5 py-1.5 bg-[#02101e] border border-[#0e3d54] rounded-lg text-xs font-semibold text-white focus:outline-none focus:border-cyan-400"
                >
                  <option value="all">Tất cả khối lớp</option>
                  <option value="10">Khối 10</option>
                  <option value="11">Khối 11</option>
                  <option value="12">Khối 12</option>
                </select>

                <select
                  value={subjectFilter}
                  onChange={e => handleSubjectSelectChange(e.target.value, setSubjectFilter)}
                  className="px-2.5 py-1.5 bg-[#02101e] border border-[#0e3d54] rounded-lg text-xs font-semibold text-white focus:outline-none focus:border-cyan-400"
                >
                  <option value="all">Tất cả môn học</option>
                  {subjectsList.map(sub => (
                    <option key={sub} value={sub}>{sub}</option>
                  ))}
                  <option value="__add_new__">+ Thêm môn học mới...</option>
                </select>

                <select
                  value={typeFilter}
                  onChange={e => setTypeFilter(e.target.value)}
                  className="px-2.5 py-1.5 bg-[#02101e] border border-[#0e3d54] rounded-lg text-xs font-semibold text-white focus:outline-none focus:border-cyan-400"
                >
                  <option value="all">Tất cả 9 dạng câu hỏi</option>
                  <option value="single">Một đáp án (Trắc nghiệm)</option>
                  <option value="multiple">Nhiều đáp án</option>
                  <option value="true_false">Đúng / Sai từng ý</option>
                  <option value="fill">Điền vào chỗ trống</option>
                  <option value="short_essay">Trả lời ngắn</option>
                </select>
              </div>

              {selectedQuestionIds.length > 0 && (
                <div className="flex items-center gap-2 shrink-0 bg-[#03172c] px-3 py-1.5 rounded-lg border border-cyan-500/40">
                  <span className="text-xs font-bold text-cyan-300">Đã chọn {selectedQuestionIds.length} câu</span>
                  <button
                    onClick={() => {
                      showToast(`Đã tạo Đề kiểm tra từ ${selectedQuestionIds.length} câu hỏi đã chọn!`, 'success');
                      setSelectedQuestionIds([]);
                    }}
                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-bold shadow-xs cursor-pointer"
                  >
                    Tạo đề từ câu đã chọn
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Question Table List */}
          <div className="bg-[#041527] rounded-2xl border border-[#0e3d54] overflow-hidden shadow-xl">
            <div className="overflow-x-auto custom-horizontal-scrollbar">
              <table className="w-full min-w-[1050px] text-left text-xs border-collapse">
                <thead className="bg-[#051c33] border-b border-[#0e3d54]">
                  <tr>
                    <th className="px-4 py-3.5 w-12 text-center">
                      <input
                        type="checkbox"
                        checked={selectedQuestionIds.length === filteredQuestions.length && filteredQuestions.length > 0}
                        onChange={handleToggleSelectAll}
                        className="rounded border-slate-700 bg-[#02101e] text-cyan-500 focus:ring-0 cursor-pointer"
                      />
                    </th>
                    <th className="px-4 py-3.5 w-16 text-center text-cyan-300 font-bold uppercase">STT</th>
                    <th className="px-5 py-3.5 min-w-[320px] text-cyan-300 font-bold uppercase">Nội dung câu hỏi</th>
                    <th className="px-4 py-3.5 min-w-[140px] text-cyan-300 font-bold uppercase">Môn / Khối</th>
                    <th className="px-4 py-3.5 min-w-[130px] text-cyan-300 font-bold uppercase">Dạng câu hỏi</th>
                    <th className="px-4 py-3.5 min-w-[110px] text-cyan-300 font-bold uppercase">Mức độ</th>
                    <th className="px-4 py-3.5 min-w-[130px] text-cyan-300 font-bold uppercase">Trạng thái</th>
                    <th className="sticky right-0 z-30 bg-[#051c33] border-l border-[#0e3d54] shadow-[-8px_0_12px_rgba(2,15,28,0.85)] px-4 py-3.5 text-center text-cyan-300 font-bold uppercase w-[135px]">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#0e3d54]/60">
                  {filteredQuestions.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-12 text-center text-slate-400">
                        Không tìm thấy câu hỏi nào phù hợp với bộ lọc.
                      </td>
                    </tr>
                  ) : (
                    filteredQuestions.map((q, idx) => {
                      const status = (q as any).status || 'approved';
                      const isSelected = selectedQuestionIds.includes(q.id);
                      return (
                        <tr key={q.id} className="hover:bg-[#062440] transition-colors group">
                          <td className="px-4 py-3.5 text-center">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleToggleSelectOne(q.id)}
                              className="rounded border-slate-700 bg-[#02101e] text-cyan-500 focus:ring-0 cursor-pointer"
                            />
                          </td>
                          <td className="px-4 py-3.5 text-center font-bold text-slate-400 tabular-nums">{idx + 1}</td>
                          <td className="px-5 py-3.5 text-white font-medium max-w-md truncate" title={q.content}>
                            <div className="truncate">{q.content}</div>
                            <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2">
                              <span>Chủ đề: {q.topic}</span>
                              {q.tags && q.tags.map((t, ti) => (
                                <span key={ti} className="px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 text-[10px]">
                                  {t}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="px-4 py-3.5 text-slate-300 whitespace-nowrap">
                            <div className="font-bold text-cyan-300">{q.subject}</div>
                            <div className="text-[11px] text-slate-400">Khối {q.grade}</div>
                          </td>
                          <td className="px-4 py-3.5 text-slate-300 whitespace-nowrap">
                            <span className="px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800 font-semibold text-[11px]">
                              {q.type === 'single' ? 'Một đáp án' : q.type === 'multiple' ? 'Nhiều đáp án' : q.type === 'true_false' ? 'Đúng/Sai' : q.type === 'fill' ? 'Điền vào chỗ trống' : 'Tự luận/Khác'}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 whitespace-nowrap">
                            <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                              q.difficulty === 'easy' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                              q.difficulty === 'medium' ? 'bg-sky-950 text-sky-300 border border-sky-800' :
                              'bg-purple-950 text-purple-300 border border-purple-800'
                            }`}>
                              {q.difficulty === 'easy' ? 'Nhận biết' : q.difficulty === 'medium' ? 'Thông hiểu' : 'Vận dụng cao'}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 whitespace-nowrap">
                            {status === 'approved' ? (
                              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-300 bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-800">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                Đã duyệt
                              </span>
                            ) : status === 'pending_review' ? (
                              <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-300 bg-amber-950 px-2 py-0.5 rounded-full border border-amber-800">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                                Chờ duyệt
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-300 bg-slate-800 px-2 py-0.5 rounded-full border border-slate-700">
                                Bản nháp
                              </span>
                            )}
                          </td>
                          <td className="sticky right-0 z-20 bg-[#041527] group-hover:bg-[#062440] border-l border-[#0e3d54] shadow-[-8px_0_12px_rgba(2,15,28,0.85)] px-3 py-3.5 text-center whitespace-nowrap w-[135px]">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => setViewingQuestion(q)}
                                className="w-8 h-8 rounded-lg bg-[#031c33] hover:bg-[#073259] text-cyan-300 border border-[#0e3d54] flex items-center justify-center transition-all cursor-pointer shadow-xs"
                                title="Xem chi tiết & đáp án"
                              >
                                <Eye className="w-4 h-4 text-cyan-400" />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  if (status !== 'approved') handleApprove(q.id);
                                  else showToast('Câu hỏi đã được duyệt trước đó', 'info');
                                }}
                                className="w-8 h-8 rounded-lg bg-[#031c33] hover:bg-emerald-950 text-emerald-400 border border-[#0e3d54] flex items-center justify-center transition-all cursor-pointer shadow-xs"
                                title="Phê duyệt nhanh"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeletingQuestionId(q.id)}
                                className="w-8 h-8 rounded-lg bg-[#031c33] hover:bg-rose-950 text-rose-400 border border-[#0e3d54] flex items-center justify-center transition-all cursor-pointer shadow-xs"
                                title="Xóa câu hỏi"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* MODAL: VIEW QUESTION DETAIL */}
      {viewingQuestion && (
        <Modal isOpen={!!viewingQuestion} onClose={() => setViewingQuestion(null)} title="Chi tiết Câu hỏi & Đáp án">
          <div className="space-y-4 text-xs text-slate-200">
            <div className="flex items-center justify-between bg-[#03172c] p-3 rounded-xl border border-[#0e3d54]">
              <div>
                <span className="text-cyan-400 font-bold">Môn: {viewingQuestion.subject}</span>
                <span className="text-slate-400 mx-2">·</span>
                <span className="text-slate-300">Khối {viewingQuestion.grade}</span>
              </div>
              <span className="px-2 py-0.5 bg-blue-950 text-blue-300 border border-blue-800 rounded font-semibold text-[11px]">
                {viewingQuestion.type === 'single' ? 'Một đáp án (Pick One)' : viewingQuestion.type === 'multiple' ? 'Nhiều đáp án (Pick Many)' : viewingQuestion.type === 'true_false' ? 'Đúng / Sai' : viewingQuestion.type === 'fill' ? 'Điền vào chỗ trống' : viewingQuestion.type}
              </span>
            </div>

            <div className="space-y-1">
              <span className="font-bold text-slate-400">Nội dung câu hỏi:</span>
              <div className="p-3 bg-[#02101e] border border-[#0e3d54] rounded-xl text-white font-medium text-sm">
                {viewingQuestion.content}
              </div>
            </div>

            {viewingQuestion.options && viewingQuestion.options.length > 0 && (
              <div className="space-y-1.5">
                <span className="font-bold text-slate-400">Các lựa chọn:</span>
                <div className="grid grid-cols-1 gap-2">
                  {viewingQuestion.options.map(opt => (
                    <div key={opt.id} className="p-2.5 bg-[#02101e] border border-[#0e3d54] rounded-lg flex items-center gap-2">
                      <span className="w-6 h-6 rounded bg-[#041527] border border-[#0e3d54] flex items-center justify-center font-bold text-cyan-400 shrink-0">
                        {opt.id}
                      </span>
                      <span className="text-white">{opt.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="p-3 bg-emerald-950/30 border border-emerald-800/60 rounded-xl space-y-1">
              <span className="font-bold text-emerald-400">Đáp án chính xác:</span>
              <div className="text-white font-bold text-sm">
                {Array.isArray(viewingQuestion.correctAnswer) ? viewingQuestion.correctAnswer.join(', ') : viewingQuestion.correctAnswer}
              </div>
            </div>

            {viewingQuestion.explanation && (
              <div className="p-3 bg-sky-950/30 border border-sky-800/60 rounded-xl space-y-1">
                <span className="font-bold text-sky-400">Lời giải chi tiết:</span>
                <div className="text-slate-300 font-normal">
                  {viewingQuestion.explanation}
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingQuestionId && (
        <Modal isOpen={!!deletingQuestionId} onClose={() => setDeletingQuestionId(null)} title="Xác nhận xóa câu hỏi">
          <div className="space-y-4 text-xs">
            <p className="text-slate-300">Bạn có chắc chắn muốn xóa câu hỏi này khỏi Ngân hàng? Thao tác này không thể hoàn tác nếu câu hỏi chưa được lưu trữ.</p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setDeletingQuestionId(null)}
                className="px-3.5 py-2 bg-slate-800 text-slate-300 rounded-lg font-semibold hover:bg-slate-700 cursor-pointer"
              >
                Hủy
              </button>
              <button
                onClick={() => handleDelete(deletingQuestionId)}
                className="px-3.5 py-2 bg-rose-600 text-white rounded-lg font-bold hover:bg-rose-500 cursor-pointer shadow-sm"
              >
                Xác nhận Xóa
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ADD SUBJECT MODAL */}
      <Modal
        isOpen={isAddSubjectModalOpen}
        onClose={() => setIsAddSubjectModalOpen(false)}
        title="Thêm môn học mới"
        subtitle="Nhập tên môn học để bổ sung vào danh mục hệ thống"
        maxWidth="sm"
      >
        <div className="p-6 space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-300 mb-1.5">Tên môn học mới:</label>
            <input
              type="text"
              placeholder="Ví dụ: Giáo dục công dân, Tin học..."
              value={newSubjectInput}
              onChange={e => setNewSubjectInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') handleConfirmAddSubject();
              }}
              autoFocus
              className="w-full bg-[#02101e] border border-[#0e3d54] rounded-lg p-2.5 text-white focus:border-cyan-400 focus:outline-none text-sm"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAddSubjectModalOpen(false)}
              className="px-4 py-2 bg-[#03172c] hover:bg-[#07243e] text-slate-300 border border-[#0e3d54] rounded-lg font-semibold transition-colors cursor-pointer"
            >
              Đóng
            </button>
            <button
              type="button"
              onClick={handleConfirmAddSubject}
              className="px-4 py-2 bg-[#0284c7] hover:bg-[#0369a1] text-white rounded-lg font-bold shadow-sm cursor-pointer"
            >
              Thêm môn học
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
