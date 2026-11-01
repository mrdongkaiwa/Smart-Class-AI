export type UserRole = 'ADMIN' | 'TEACHER' | 'STUDENT' | 'PARENT';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  avatarUrl: string;
  phone?: string;
  schoolId: string;
  schoolName: string;
  title?: string;
  createdAt: string;
}

export interface School {
  id: string;
  name: string;
  code: string;
  address: string;
  phone: string;
  email: string;
  logoUrl?: string;
  activeAcademicYearId: string;
}

export interface AcademicYear {
  id: string;
  name: string; // e.g. "2024-2025"
  startDate: string;
  endDate: string;
  isCurrent: boolean;
}

export interface GradeLevel {
  id: string;
  level: number; // 1 đến 12 (Tiểu học, THCS, THPT)
  name: string; // "Khối 1" ... "Khối 12"
}

export const GRADE_LEVELS = [
  { level: 1, name: 'Khối 1', category: 'Tiểu học', label: 'Khối 1 (Tiểu học)' },
  { level: 2, name: 'Khối 2', category: 'Tiểu học', label: 'Khối 2 (Tiểu học)' },
  { level: 3, name: 'Khối 3', category: 'Tiểu học', label: 'Khối 3 (Tiểu học)' },
  { level: 4, name: 'Khối 4', category: 'Tiểu học', label: 'Khối 4 (Tiểu học)' },
  { level: 5, name: 'Khối 5', category: 'Tiểu học', label: 'Khối 5 (Tiểu học)' },
  { level: 6, name: 'Khối 6', category: 'THCS', label: 'Khối 6 (Cấp THCS)' },
  { level: 7, name: 'Khối 7', category: 'THCS', label: 'Khối 7 (Cấp THCS)' },
  { level: 8, name: 'Khối 8', category: 'THCS', label: 'Khối 8 (Cấp THCS)' },
  { level: 9, name: 'Khối 9', category: 'THCS', label: 'Khối 9 (Cấp THCS)' },
  { level: 10, name: 'Khối 10', category: 'THPT', label: 'Khối 10 (Cấp THPT)' },
  { level: 11, name: 'Khối 11', category: 'THPT', label: 'Khối 11 (Cấp THPT)' },
  { level: 12, name: 'Khối 12', category: 'THPT', label: 'Khối 12 (Cấp THPT)' },
] as const;

export interface Subject {
  id: string;
  code: string;
  name: string;
  gradeLevelId: string;
  icon?: string;
}

export interface Classroom {
  id: string;
  name: string; // "10A1"
  code: string;
  gradeLevel: number;
  academicYearId: string;
  roomNumber: string;
  homeroomTeacherId: string;
  homeroomTeacherName: string;
  subjectTeachers?: { subjectId: string; subjectName: string; teacherId: string; teacherName: string }[];
  studentCount: number;
  color: string;
  joinCode: string;
  isArchived: boolean;
  createdAt: string;
}

export interface Student {
  id: string;
  studentCode: string; // "HS2024-001"
  fullName: string;
  dob: string;
  gender: 'Nam' | 'Nữ';
  classId: string;
  className: string;
  rollNumber: number; // STT
  team: string; // "Tổ 1"
  avatarUrl: string;
  address: string;
  phone?: string;
  parentId?: string;
  parentName?: string;
  parentPhone?: string;
  parentEmail?: string;
  parentRelationship?: 'Bố' | 'Mẹ' | 'Người giám hộ' | string;
  parentJob?: string;
  parentNotes?: string;
  parentAppStatus?: 'active' | 'pending' | 'not_registered';
  status: 'active' | 'leave' | 'suspended';
  // Aggregate stats
  gpa: number;
  conduct: 'Tốt' | 'Khá' | 'Trung bình';
  attendanceRate: number; // percentage
  behaviorPoints: number; // thi đua / nề nếp
}

export interface Parent {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  relationship: 'Bố' | 'Mẹ' | 'Người giám hộ';
  job?: string;
  address: string;
  avatarUrl: string;
  childrenIds: string[];
  appStatus?: 'active' | 'pending' | 'not_registered';
  notes?: string;
}

export type AttendanceStatus = 'present' | 'absent_excused' | 'absent_unexcused' | 'late' | 'early_leave';

export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  rollNumber: number;
  status: AttendanceStatus;
  note?: string;
}

export interface AttendanceSession {
  id: string;
  classId: string;
  className: string;
  date: string; // YYYY-MM-DD
  period: number; // Tiết 1, 2, ... or Buổi sáng / Chiều
  sessionType: 'morning' | 'afternoon' | 'full_day' | 'period';
  takenByTeacherId: string;
  takenByTeacherName: string;
  records: AttendanceRecord[];
  summary: {
    total: number;
    present: number;
    absentExcused: number;
    absentUnexcused: number;
    late: number;
    earlyLeave: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ScheduleItem {
  id: string;
  classId: string;
  dayOfWeek: 2 | 3 | 4 | 5 | 6 | 7; // Thứ 2 -> Thứ 7
  period: number; // 1-5 (sáng), 6-9 (chiều)
  subjectId: string;
  subjectName: string;
  teacherId: string;
  teacherName: string;
  room: string;
  startTime: string; // "07:30"
  endTime: string; // "08:15"
}

export type AssignmentStatus = 'published' | 'draft' | 'closed';

export interface Assignment {
  id: string;
  classId: string;
  className: string;
  subjectId: string;
  subjectName: string;
  title: string;
  description: string;
  dueDate: string; // ISO string
  points: number; // thang điểm e.g. 10
  status: AssignmentStatus;
  createdByTeacherId: string;
  attachments?: { name: string; url: string; size: string }[];
  target: 'all' | 'group' | 'individual';
  targetStudentIds?: string[];
  submissionCount: number;
  totalStudents: number;
  gradedCount: number;
  createdAt: string;
}

export interface AssignmentSubmission {
  id: string;
  assignmentId: string;
  studentId: string;
  studentName: string;
  submittedAt: string;
  content?: string;
  fileUrl?: string;
  fileName?: string;
  score?: number;
  feedback?: string;
  gradedAt?: string;
  status: 'submitted' | 'late' | 'graded' | 'resubmit_required';
}

export interface Question {
  id: string;
  subject: string;
  grade: number;
  topic: string;
  type: 'single' | 'multiple' | 'true_false' | 'fill' | 'short_essay';
  content: string;
  options?: { id: string; text: string }[];
  correctAnswer: string | string[];
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
  status?: 'approved' | 'pending_review' | 'draft' | 'needs_fix' | 'archived';
  createdAt?: string;
  updated_at?: string;
}

export interface Quiz {
  id: string;
  title: string;
  classId: string;
  className: string;
  subjectName: string;
  durationMinutes: number;
  totalQuestions: number;
  questions: Question[];
  openDate: string;
  closeDate: string;
  shuffleQuestions: boolean;
  status: 'active' | 'upcoming' | 'closed';
  attemptsCount: number;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  studentId: string;
  studentName: string;
  score: number;
  maxScore: number;
  submittedAt: string;
  timeSpentSeconds: number;
  answers: { questionId: string; answer: any; isCorrect: boolean }[];
}

export interface LearningResource {
  id: string;
  title: string;
  type: 'pdf' | 'docx' | 'pptx' | 'video' | 'link' | 'image';
  gradeLevel: number;
  subjectName: string;
  unit: string;
  fileUrl: string;
  fileSize: string;
  uploadedBy: string;
  downloadCount: number;
  isPinned: boolean;
  createdAt: string;
}

export interface StudentGradeRecord {
  id: string;
  studentId: string;
  studentName: string;
  studentCode: string;
  classId: string;
  subjectId: string;
  semester: 1 | 2;
  // Specific score columns
  oral1?: number; // Miệng 1
  oral2?: number; // Miệng 2
  test15m1?: number; // 15 phút 1
  test15m2?: number; // 15 phút 2
  midterm?: number; // Giữa kỳ (hệ số 2)
  finalTerm?: number; // Cuối kỳ (hệ số 3)
  averageScore?: number; // Điểm trung bình môn
  note?: string;
}

export interface BehaviorRecord {
  id: string;
  studentId: string;
  studentName: string;
  classId: string;
  type: 'positive' | 'negative';
  category: string; // e.g. "Phát biểu tích cực", "Đi muộn", "Không thuộc bài"
  pointsDelta: number; // e.g. +5 or -2
  note: string;
  recordedByTeacherName: string;
  date: string;
}

export interface SmartAlert {
  id: string;
  studentId: string;
  studentName: string;
  classId: string;
  className: string;
  type: 'attendance_risk' | 'low_grades' | 'missing_homework' | 'behavior_issue';
  level: 'warning' | 'critical' | 'info';
  title: string;
  description: string;
  status: 'new' | 'investigating' | 'resolved';
  createdAt: string;
  resolvedAt?: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  authorRole: UserRole;
  targetScope: 'all' | 'class' | 'parents' | 'teachers';
  targetClassId?: string;
  priority: 'normal' | 'important' | 'urgent';
  createdAt: string;
  readCount: number;
  totalRecipients: number;
  attachments?: { name: string; url: string; size: string }[];
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  receiverId: string;
  receiverName: string;
  studentId?: string;
  studentName?: string;
  content: string;
  timestamp: string;
  isRead: boolean;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string; // e.g. "UPDATE_GRADE", "MARK_ATTENDANCE", "DELETE_CLASS"
  targetEntity: string;
  details: string;
  ipAddress?: string;
  timestamp: string;
}

export interface TeacherStats {
  totalStudents: number;
  presentToday: number;
  absentToday: number;
  lateToday: number;
  pendingGradingCount: number;
  missingSubmissionsCount: number;
  activeAlertsCount: number;
  todayClassesCount: number;
}
