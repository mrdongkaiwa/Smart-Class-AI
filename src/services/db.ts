import {
  UserProfile,
  School,
  AcademicYear,
  Classroom,
  Student,
  Parent,
  AttendanceSession,
  ScheduleItem,
  Assignment,
  AssignmentSubmission,
  Question,
  Quiz,
  QuizAttempt,
  LearningResource,
  StudentGradeRecord,
  BehaviorRecord,
  SmartAlert,
  Announcement,
  ChatMessage,
  AuditLog,
  TeacherStats
} from '../types';
import {
  SEED_USERS,
  SEED_SCHOOL,
  SEED_ACADEMIC_YEARS,
  SEED_CLASSES,
  SEED_STUDENTS,
  SEED_PARENTS,
  SEED_ATTENDANCE_SESSIONS,
  SEED_SCHEDULE,
  SEED_ASSIGNMENTS,
  SEED_SUBMISSIONS,
  SEED_QUESTIONS,
  SEED_QUIZZES,
  SEED_RESOURCES,
  SEED_GRADES,
  SEED_BEHAVIORS,
  SEED_ALERTS,
  SEED_ANNOUNCEMENTS,
  SEED_MESSAGES,
  SEED_AUDIT_LOGS
} from '../data/seedData';
import {
  db as firestoreDb,
  OperationType,
  handleFirestoreError,
  sanitizeForFirestore,
  FIREBASE_PROJECT_ID,
  FIREBASE_DATABASE_ID
} from './firebase';
import { doc, setDoc, deleteDoc, collection, onSnapshot } from 'firebase/firestore';

const STORAGE_KEY = 'smartclass_db_v2';

interface DatabaseState {
  users: UserProfile[];
  schools: School[];
  academicYears: AcademicYear[];
  classes: Classroom[];
  students: Student[];
  parents: Parent[];
  attendanceSessions: AttendanceSession[];
  schedules: ScheduleItem[];
  assignments: Assignment[];
  submissions: AssignmentSubmission[];
  questions: Question[];
  quizzes: Quiz[];
  quizAttempts: QuizAttempt[];
  resources: LearningResource[];
  grades: StudentGradeRecord[];
  behaviors: BehaviorRecord[];
  alerts: SmartAlert[];
  announcements: Announcement[];
  messages: ChatMessage[];
  auditLogs: AuditLog[];
}

function loadInitialState(): DatabaseState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to parse state from localStorage, falling back to seed', e);
  }
  return {
    users: SEED_USERS,
    schools: [SEED_SCHOOL],
    academicYears: SEED_ACADEMIC_YEARS,
    classes: SEED_CLASSES,
    students: SEED_STUDENTS,
    parents: SEED_PARENTS,
    attendanceSessions: SEED_ATTENDANCE_SESSIONS,
    schedules: SEED_SCHEDULE,
    assignments: SEED_ASSIGNMENTS,
    submissions: SEED_SUBMISSIONS,
    questions: SEED_QUESTIONS,
    quizzes: SEED_QUIZZES,
    quizAttempts: [],
    resources: SEED_RESOURCES,
    grades: SEED_GRADES,
    behaviors: SEED_BEHAVIORS,
    alerts: SEED_ALERTS,
    announcements: SEED_ANNOUNCEMENTS,
    messages: SEED_MESSAGES,
    auditLogs: SEED_AUDIT_LOGS,
  };
}

class SmartClassDatabase {
  private state: DatabaseState;
  private listeners: (() => void)[] = [];

  constructor() {
    this.state = loadInitialState();
    // Ensure schedule has sample items if it's lacking afternoon/saturday
    if (this.state.schedules && this.state.schedules.length > 0) {
      const hasSaturdayOrAfternoon = this.state.schedules.some(s => s.dayOfWeek === 7 || s.period >= 6);
      if (!hasSaturdayOrAfternoon) {
        const extraSeeds = SEED_SCHEDULE.filter(s => s.dayOfWeek === 7 || s.period >= 6);
        this.state.schedules.push(...extraSeeds);
        this.persist();
      }
    }
    this.initFirestoreSync();
  }

  private syncItemToFirestore(collectionName: string, id: string, data: any) {
    try {
      if (!firestoreDb) return;
      setDoc(doc(firestoreDb, collectionName, id), sanitizeForFirestore(data), { merge: true }).catch(err => {
        handleFirestoreError(err, OperationType.WRITE, `${collectionName}/${id}`);
      });
    } catch (e) {
      console.error(e);
    }
  }

  private deleteItemFromFirestore(collectionName: string, id: string) {
    try {
      if (!firestoreDb) return;
      deleteDoc(doc(firestoreDb, collectionName, id)).catch(err => {
        handleFirestoreError(err, OperationType.DELETE, `${collectionName}/${id}`);
      });
    } catch (e) {
      console.error(e);
    }
  }

  private updateAllClassStudentCounts() {
    try {
      if (!this.state.classes || !this.state.students) return;
      this.state.classes.forEach(cls => {
        const count = this.state.students.filter(s => s.classId === cls.id || s.className === cls.name).length;
        if (cls.studentCount !== count) {
          cls.studentCount = count;
          if (firestoreDb) {
            setDoc(doc(firestoreDb, 'classes', cls.id), sanitizeForFirestore(cls), { merge: true }).catch(err => {
              handleFirestoreError(err, OperationType.UPDATE, `classes/${cls.id}`);
            });
          }
        }
      });
    } catch (e) {
      console.error('Error updating class student counts:', e);
    }
  }

  private initFirestoreSync() {
    try {
      if (!firestoreDb) return;
      const colNames = [
        'users', 'schools', 'academicYears', 'classes', 'students', 'parents',
        'attendanceSessions', 'schedules', 'assignments', 'submissions',
        'questions', 'quizzes', 'quizAttempts', 'resources', 'grades',
        'behaviors', 'alerts', 'announcements', 'messages', 'auditLogs'
      ];

      colNames.forEach(colName => {
        onSnapshot(collection(firestoreDb, colName), (snapshot) => {
          if (!snapshot.empty) {
            snapshot.forEach(docSnap => {
              const data = docSnap.data();
              const stateArray = (this.state as any)[colName];
              if (Array.isArray(stateArray)) {
                const idx = stateArray.findIndex((item: any) => item.id === data.id || item.id === docSnap.id || (item.email && item.email === data.email));
                if (idx >= 0) {
                  stateArray[idx] = { ...stateArray[idx], ...data };
                } else {
                  stateArray.unshift(data);
                }
              }
            });
            if (colName === 'students' || colName === 'classes') {
              this.updateAllClassStudentCounts();
            }
            this.persist();
          }
        }, (err) => {
          console.warn(`Firestore listener notice for ${colName}:`, err);
        });
      });
    } catch (e) {
      console.warn('Could not initialize Firestore sync:', e);
    }
  }

  public async syncAllToFirestore(): Promise<Record<string, number>> {
    const counts: Record<string, number> = {};
    const collections = [
      { name: 'users', data: this.state.users },
      { name: 'schools', data: this.state.schools },
      { name: 'academicYears', data: this.state.academicYears },
      { name: 'classes', data: this.state.classes },
      { name: 'students', data: this.state.students },
      { name: 'parents', data: this.state.parents },
      { name: 'attendanceSessions', data: this.state.attendanceSessions },
      { name: 'schedules', data: this.state.schedules },
      { name: 'assignments', data: this.state.assignments },
      { name: 'submissions', data: this.state.submissions },
      { name: 'questions', data: this.state.questions },
      { name: 'quizzes', data: this.state.quizzes },
      { name: 'quizAttempts', data: this.state.quizAttempts },
      { name: 'resources', data: this.state.resources },
      { name: 'grades', data: this.state.grades },
      { name: 'behaviors', data: this.state.behaviors },
      { name: 'alerts', data: this.state.alerts },
      { name: 'announcements', data: this.state.announcements },
      { name: 'messages', data: this.state.messages },
      { name: 'auditLogs', data: this.state.auditLogs },
    ];

    try {
      for (const col of collections) {
        let count = 0;
        for (const item of col.data) {
          const itemId = (item as any).id || (item as any).email || (item as any).code || `item_${Math.random()}`;
          await setDoc(doc(firestoreDb, col.name, String(itemId)), sanitizeForFirestore(item));
          count++;
        }
        counts[col.name] = count;
      }
    } catch (e) {
      console.error('Error during syncAllToFirestore:', e);
    }
    return counts;
  }

  private persist() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch (e) {
      console.error('Failed to save to localStorage', e);
    }
    this.notifyListeners();
  }

  public subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(l => l());
  }

  public resetToDefault() {
    localStorage.removeItem(STORAGE_KEY);
    this.state = {
      users: SEED_USERS,
      schools: [SEED_SCHOOL],
      academicYears: SEED_ACADEMIC_YEARS,
      classes: SEED_CLASSES,
      students: SEED_STUDENTS,
      parents: SEED_PARENTS,
      attendanceSessions: SEED_ATTENDANCE_SESSIONS,
      schedules: SEED_SCHEDULE,
      assignments: SEED_ASSIGNMENTS,
      submissions: SEED_SUBMISSIONS,
      questions: SEED_QUESTIONS,
      quizzes: SEED_QUIZZES,
      quizAttempts: [],
      resources: SEED_RESOURCES,
      grades: SEED_GRADES,
      behaviors: SEED_BEHAVIORS,
      alerts: SEED_ALERTS,
      announcements: SEED_ANNOUNCEMENTS,
      messages: SEED_MESSAGES,
      auditLogs: SEED_AUDIT_LOGS,
    };
    this.persist();
  }

  public recordAuditLog(log: Omit<AuditLog, 'id' | 'timestamp'>) {
    const newLog: AuditLog = {
      ...log,
      id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      timestamp: new Date().toISOString(),
    };
    this.state.auditLogs.unshift(newLog);
    this.persist();
  }

  // --- Users / Auth ---
  public getUsers(): UserProfile[] {
    return this.state.users;
  }

  public getUserById(id: string): UserProfile | undefined {
    return this.state.users.find(u => u.id === id);
  }

  public getUserByEmail(email: string): UserProfile | undefined {
    return this.state.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  // --- Academic Years ---
  public getAcademicYears(): AcademicYear[] {
    return this.state.academicYears;
  }

  public getCurrentAcademicYear(): AcademicYear {
    const current = this.state.academicYears.find(ay => ay.isCurrent);
    if (current) return current;
    if (this.state.academicYears.length > 0) return this.state.academicYears[0];
    const defaultYear: AcademicYear = {
      id: 'ay_2024_2025',
      name: '2024 - 2025',
      startDate: '2024-09-05',
      endDate: '2025-05-31',
      isCurrent: true,
    };
    this.state.academicYears.push(defaultYear);
    this.persist();
    return defaultYear;
  }

  public updateCurrentAcademicYearName(newName: string): AcademicYear {
    const current = this.getCurrentAcademicYear();
    current.name = newName.trim();
    this.recordAuditLog({
      userId: 'user_teacher_1',
      userName: 'Giáo viên',
      userRole: 'TEACHER',
      action: 'UPDATE_ACADEMIC_YEAR',
      targetEntity: `AcademicYear (${current.name})`,
      details: `Đã cập nhật tên năm học thành: ${current.name}`,
    });
    this.persist();
    return current;
  }

  // --- Classes ---
  public getClasses(includeArchived = false): Classroom[] {
    return includeArchived ? this.state.classes : this.state.classes.filter(c => !c.isArchived);
  }

  public getClassById(id: string): Classroom | undefined {
    return this.state.classes.find(c => c.id === id);
  }

  public createClass(cls: Omit<Classroom, 'id' | 'createdAt' | 'isArchived' | 'joinCode' | 'studentCount'>): Classroom {
    const newClass: Classroom = {
      ...cls,
      id: `class_${Date.now()}`,
      joinCode: `CLS-${cls.name}-${Math.floor(100 + Math.random() * 900)}`,
      isArchived: false,
      studentCount: 0,
      createdAt: new Date().toISOString(),
    };
    this.state.classes.unshift(newClass);
    try {
      setDoc(doc(firestoreDb, 'classes', newClass.id), sanitizeForFirestore(newClass)).catch(err => {
        handleFirestoreError(err, OperationType.CREATE, `classes/${newClass.id}`);
      });
    } catch (e) {
      console.error(e);
    }
    this.recordAuditLog({
      userId: cls.homeroomTeacherId,
      userName: cls.homeroomTeacherName,
      userRole: 'TEACHER',
      action: 'CREATE_CLASS',
      targetEntity: `Classroom (${newClass.name})`,
      details: `Đã tạo lớp học mới ${newClass.name} - Khối ${newClass.gradeLevel} tại phòng ${newClass.roomNumber}`,
    });
    this.persist();
    return newClass;
  }

  public updateClass(id: string, updates: Partial<Classroom>): Classroom | null {
    const idx = this.state.classes.findIndex(c => c.id === id);
    if (idx === -1) return null;
    this.state.classes[idx] = { ...this.state.classes[idx], ...updates };
    try {
      setDoc(doc(firestoreDb, 'classes', id), sanitizeForFirestore(this.state.classes[idx]), { merge: true }).catch(err => {
        handleFirestoreError(err, OperationType.UPDATE, `classes/${id}`);
      });
    } catch (e) {
      console.error(e);
    }
    this.persist();
    return this.state.classes[idx];
  }

  public archiveClass(id: string, archived = true): boolean {
    const cls = this.getClassById(id);
    if (!cls) return false;
    cls.isArchived = archived;
    try {
      setDoc(doc(firestoreDb, 'classes', id), { isArchived: archived }, { merge: true }).catch(err => {
        handleFirestoreError(err, OperationType.UPDATE, `classes/${id}`);
      });
    } catch (e) {
      console.error(e);
    }
    this.persist();
    return true;
  }

  public deleteClass(id: string): boolean {
    this.state.classes = this.state.classes.filter(c => c.id !== id);
    this.state.students = this.state.students.filter(s => s.classId !== id);
    try {
      deleteDoc(doc(firestoreDb, 'classes', id)).catch(err => {
        handleFirestoreError(err, OperationType.DELETE, `classes/${id}`);
      });
    } catch (e) {
      console.error(e);
    }
    this.persist();
    return true;
  }

  // --- Students ---
  private ensureStudentParent(s: Student): Student {
    if (!s.parentName || !s.parentPhone) {
      const seedMatch = SEED_STUDENTS.find(seed => seed.id === s.id || seed.studentCode === s.studentCode);
      if (seedMatch && seedMatch.parentName) {
        return {
          ...s,
          parentName: s.parentName || seedMatch.parentName,
          parentPhone: s.parentPhone || seedMatch.parentPhone,
          parentEmail: s.parentEmail || seedMatch.parentEmail,
          parentRelationship: s.parentRelationship || seedMatch.parentRelationship || 'Bố',
          parentJob: s.parentJob || seedMatch.parentJob || 'Kinh doanh',
          parentNotes: s.parentNotes || seedMatch.parentNotes || 'Phụ huynh kết nối thường xuyên',
          parentAppStatus: s.parentAppStatus || seedMatch.parentAppStatus || 'active',
        };
      }
      const familyName = s.fullName.split(' ')[0] || 'Nguyễn';
      return {
        ...s,
        parentName: s.parentName || `${familyName} Văn An`,
        parentPhone: s.parentPhone || '0912 345 678',
        parentEmail: s.parentEmail || `phuhuynh.${s.studentCode.toLowerCase()}@smartclass.edu.vn`,
        parentRelationship: s.parentRelationship || 'Bố',
        parentJob: s.parentJob || 'Cán bộ công chức',
        parentNotes: s.parentNotes || 'Người liên hệ chính của học sinh',
        parentAppStatus: s.parentAppStatus || 'active',
      };
    }
    return s;
  }

  public getStudents(classId?: string): Student[] {
    let list = classId
      ? this.state.students.filter(s => s.classId === classId)
      : this.state.students;
    return list.map(s => this.ensureStudentParent(s));
  }

  public getStudentById(id: string): Student | undefined {
    const s = this.state.students.find(s => s.id === id);
    return s ? this.ensureStudentParent(s) : undefined;
  }

  public createStudent(studentData: Omit<Student, 'id' | 'gpa' | 'conduct' | 'attendanceRate' | 'behaviorPoints'>): Student {
    const newStudent: Student = {
      ...studentData,
      id: `std_${Date.now()}`,
      gpa: 8.0,
      conduct: 'Tốt',
      attendanceRate: 100,
      behaviorPoints: 20,
      parentAppStatus: studentData.parentAppStatus || 'active',
      parentRelationship: studentData.parentRelationship || 'Bố',
    };
    this.state.students.push(newStudent);
    try {
      setDoc(doc(firestoreDb, 'students', newStudent.id), sanitizeForFirestore(newStudent)).catch(err => {
        handleFirestoreError(err, OperationType.CREATE, `students/${newStudent.id}`);
      });
    } catch (e) {
      console.error(e);
    }
    this.updateAllClassStudentCounts();
    this.recordAuditLog({
      userId: 'user_teacher_1',
      userName: 'Giáo viên',
      userRole: 'TEACHER',
      action: 'CREATE_STUDENT',
      targetEntity: `Student (${newStudent.fullName})`,
      details: `Thêm học sinh ${newStudent.fullName} (${newStudent.studentCode}) vào lớp ${newStudent.className}`,
    });
    this.persist();
    return newStudent;
  }

  public updateStudent(id: string, updates: Partial<Student>): Student | null {
    const idx = this.state.students.findIndex(s => s.id === id);
    if (idx === -1) return null;
    this.state.students[idx] = { ...this.state.students[idx], ...updates };
    const newStudent = this.state.students[idx];

    try {
      setDoc(doc(firestoreDb, 'students', id), sanitizeForFirestore(newStudent), { merge: true }).catch(err => {
        handleFirestoreError(err, OperationType.UPDATE, `students/${id}`);
      });
    } catch (e) {
      console.error(e);
    }

    this.updateAllClassStudentCounts();

    this.persist();
    return this.state.students[idx];
  }

  public updateStudentParentInfo(
    studentId: string,
    parentData: {
      parentName: string;
      parentPhone: string;
      parentEmail?: string;
      parentRelationship?: 'Bố' | 'Mẹ' | 'Người giám hộ' | string;
      parentJob?: string;
      parentNotes?: string;
      parentAppStatus?: 'active' | 'pending' | 'not_registered';
      address?: string;
    }
  ): Student | null {
    const student = this.getStudentById(studentId);
    if (!student) return null;
    const updated = this.updateStudent(studentId, {
      parentName: parentData.parentName,
      parentPhone: parentData.parentPhone,
      parentEmail: parentData.parentEmail,
      parentRelationship: parentData.parentRelationship,
      parentJob: parentData.parentJob,
      parentNotes: parentData.parentNotes,
      parentAppStatus: parentData.parentAppStatus || student.parentAppStatus || 'active',
      address: parentData.address || student.address,
    });
    this.recordAuditLog({
      userId: 'user_teacher_1',
      userName: 'Giáo viên',
      userRole: 'TEACHER',
      action: 'UPDATE_PARENT',
      targetEntity: `Parent (${parentData.parentName} - Con: ${student.fullName})`,
      details: `Cập nhật thông tin phụ huynh cho học sinh ${student.fullName} (${student.className})`,
    });
    return updated;
  }

  public canDeleteStudent(id: string): { canDelete: boolean; reason?: string } {
    const s = this.getStudentById(id);
    if (!s) return { canDelete: false, reason: 'Không tìm thấy học sinh trong hệ thống.' };

    // Ràng buộc nghiệp vụ: Nếu học sinh đang theo học ('active') và có lớp học, không được xóa!
    if (s.status === 'active' && s.classId) {
      return {
        canDelete: false,
        reason: `Học sinh ${s.fullName} hiện đang trong trạng thái "Đang theo học" tại lớp ${s.className}. Theo quy định nghiệp vụ, không được xóa học sinh đang trong biên chế lớp học để bảo đảm toàn vẹn dữ liệu sổ điểm và điểm danh. Vui lòng chuyển trạng thái học sinh sang "Đã thôi học / Chuyển trường" trước khi xóa.`
      };
    }

    return { canDelete: true };
  }

  public deleteStudent(id: string, force = false): { success: boolean; message?: string } {
    const s = this.getStudentById(id);
    if (!s) return { success: false, message: 'Học sinh không tồn tại' };

    if (!force) {
      const check = this.canDeleteStudent(id);
      if (!check.canDelete) {
        return { success: false, message: check.reason };
      }
    }

    this.state.students = this.state.students.filter(item => item.id !== id);
    this.updateAllClassStudentCounts();
    try {
      deleteDoc(doc(firestoreDb, 'students', id)).catch(err => {
        handleFirestoreError(err, OperationType.DELETE, `students/${id}`);
      });
    } catch (e) {
      console.error(e);
    }
    this.recordAuditLog({
      userId: 'user_teacher_1',
      userName: 'Giáo viên',
      userRole: 'TEACHER',
      action: 'DELETE_STUDENT',
      targetEntity: `Student (${s.fullName})`,
      details: `Đã xóa học sinh ${s.fullName} (${s.studentCode}) khỏi hệ thống`,
    });
    this.persist();
    return { success: true };
  }

  public batchImportStudents(classId: string, students: Array<Omit<Student, 'id' | 'classId' | 'className' | 'gpa' | 'conduct' | 'attendanceRate' | 'behaviorPoints'>>): { successCount: number; errors: string[] } {
    const cls = this.getClassById(classId);
    if (!cls) return { successCount: 0, errors: ['Không tìm thấy lớp học hợp lệ'] };

    let count = 0;
    students.forEach((data, index) => {
      const student: Student = {
        ...data,
        id: `std_import_${Date.now()}_${index}`,
        classId: cls.id,
        className: cls.name,
        rollNumber: data.rollNumber || (this.state.students.filter(s => s.classId === cls.id).length + 1),
        gpa: 8.0,
        conduct: 'Tốt',
        attendanceRate: 100,
        behaviorPoints: 20,
      };
      this.state.students.push(student);
      try {
        setDoc(doc(firestoreDb, 'students', student.id), sanitizeForFirestore(student)).catch(err => {
          handleFirestoreError(err, OperationType.CREATE, `students/${student.id}`);
        });
      } catch (e) {
        console.error(e);
      }
      count++;
    });

    this.updateAllClassStudentCounts();
    this.recordAuditLog({
      userId: 'user_teacher_1',
      userName: 'Giáo viên',
      userRole: 'TEACHER',
      action: 'IMPORT_STUDENTS',
      targetEntity: `Classroom (${cls.name})`,
      details: `Đã import thành công ${count} học sinh vào lớp ${cls.name}`,
    });
    this.persist();
    return { successCount: count, errors: [] };
  }

  // --- Attendance ---
  public getAttendanceSessions(classId?: string): AttendanceSession[] {
    if (classId) {
      return this.state.attendanceSessions.filter(a => a.classId === classId);
    }
    return this.state.attendanceSessions;
  }

  public getAttendanceSessionByDate(classId: string, date: string): AttendanceSession | undefined {
    return this.state.attendanceSessions.find(a => a.classId === classId && a.date === date);
  }

  public saveAttendanceSession(session: Omit<AttendanceSession, 'id' | 'createdAt' | 'updatedAt'>): AttendanceSession {
    const existingIdx = this.state.attendanceSessions.findIndex(
      a => a.classId === session.classId && a.date === session.date && a.period === session.period
    );

    const now = new Date().toISOString();
    let savedSession: AttendanceSession;

    if (existingIdx >= 0) {
      savedSession = {
        ...this.state.attendanceSessions[existingIdx],
        ...session,
        updatedAt: now,
      };
      this.state.attendanceSessions[existingIdx] = savedSession;
    } else {
      savedSession = {
        ...session,
        id: `att_${Date.now()}`,
        createdAt: now,
        updatedAt: now,
      };
      this.state.attendanceSessions.unshift(savedSession);
    }

    this.recordAuditLog({
      userId: session.takenByTeacherId,
      userName: session.takenByTeacherName,
      userRole: 'TEACHER',
      action: 'RECORD_ATTENDANCE',
      targetEntity: `AttendanceSession (${session.className} - ${session.date})`,
      details: `Lưu điểm danh ngày ${session.date}: Có mặt ${session.summary.present}/${session.summary.total}, Vắng CP: ${session.summary.absentExcused}, Vắng KP: ${session.summary.absentUnexcused}, Muộn: ${session.summary.late}`,
    });

    this.persist();
    return savedSession;
  }

  // --- Schedule ---
  public getSchedule(classId: string): ScheduleItem[] {
    return this.state.schedules.filter(s => s.classId === classId);
  }

  public saveScheduleItem(item: Omit<ScheduleItem, 'id'>): ScheduleItem {
    const newItem: ScheduleItem = {
      ...item,
      id: `sch_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    };
    this.state.schedules.push(newItem);
    this.recordAuditLog({
      userId: 'user_teacher_1',
      userName: 'Giáo viên',
      userRole: 'TEACHER',
      action: 'CREATE_SCHEDULE',
      targetEntity: `Schedule (${newItem.subjectName})`,
      details: `Thêm môn ${newItem.subjectName} vào Thứ ${newItem.dayOfWeek} Tiết ${newItem.period} (${newItem.room})`,
    });
    this.persist();
    return newItem;
  }

  public updateScheduleItem(id: string, updates: Partial<ScheduleItem>): ScheduleItem | null {
    const idx = this.state.schedules.findIndex(s => s.id === id);
    if (idx === -1) return null;
    const old = this.state.schedules[idx];
    this.state.schedules[idx] = { ...old, ...updates };
    const updated = this.state.schedules[idx];
    this.recordAuditLog({
      userId: 'user_teacher_1',
      userName: 'Giáo viên',
      userRole: 'TEACHER',
      action: 'UPDATE_SCHEDULE',
      targetEntity: `Schedule (${updated.subjectName})`,
      details: `Cập nhật môn ${updated.subjectName} Thứ ${updated.dayOfWeek} Tiết ${updated.period} - GV: ${updated.teacherName} - Phòng: ${updated.room}`,
    });
    this.persist();
    return updated;
  }

  public upsertScheduleItem(data: {
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
  }): ScheduleItem {
    if (data.id) {
      const updated = this.updateScheduleItem(data.id, data);
      if (updated) return updated;
    }
    const existing = this.state.schedules.find(
      s => s.classId === data.classId && s.dayOfWeek === data.dayOfWeek && s.period === data.period
    );
    if (existing) {
      return this.updateScheduleItem(existing.id, data)!;
    }
    return this.saveScheduleItem({
      classId: data.classId,
      dayOfWeek: data.dayOfWeek,
      period: data.period,
      subjectId: data.subjectId || 'sub_general',
      subjectName: data.subjectName,
      teacherId: data.teacherId || 'user_teacher_1',
      teacherName: data.teacherName,
      room: data.room,
      startTime: data.startTime,
      endTime: data.endTime,
    });
  }

  public deleteScheduleItem(id: string): boolean {
    const item = this.state.schedules.find(s => s.id === id);
    if (item) {
      this.recordAuditLog({
        userId: 'user_teacher_1',
        userName: 'Giáo viên',
        userRole: 'TEACHER',
        action: 'DELETE_SCHEDULE',
        targetEntity: `Schedule (${item.subjectName})`,
        details: `Đã xóa môn ${item.subjectName} khỏi Thứ ${item.dayOfWeek} Tiết ${item.period}`,
      });
    }
    this.state.schedules = this.state.schedules.filter(s => s.id !== id);
    this.persist();
    return true;
  }

  public resetScheduleToSeed(classId: string): void {
    this.state.schedules = this.state.schedules.filter(s => s.classId !== classId);
    const defaults = SEED_SCHEDULE.filter(s => s.classId === classId);
    this.state.schedules.push(...defaults);
    this.persist();
  }

  // --- Assignments ---
  public getAssignments(classId?: string): Assignment[] {
    if (classId) {
      return this.state.assignments.filter(a => a.classId === classId);
    }
    return this.state.assignments;
  }

  public getAssignmentById(id: string): Assignment | undefined {
    return this.state.assignments.find(a => a.id === id);
  }

  public createAssignment(data: Omit<Assignment, 'id' | 'createdAt' | 'submissionCount' | 'gradedCount'>): Assignment {
    const newAsg: Assignment = {
      ...data,
      id: `asg_${Date.now()}`,
      submissionCount: 0,
      gradedCount: 0,
      createdAt: new Date().toISOString(),
    };
    this.state.assignments.unshift(newAsg);
    this.recordAuditLog({
      userId: data.createdByTeacherId,
      userName: 'Giáo viên',
      userRole: 'TEACHER',
      action: 'CREATE_ASSIGNMENT',
      targetEntity: `Assignment (${newAsg.title})`,
      details: `Tạo bài tập ${newAsg.title} cho lớp ${newAsg.className}, hạn nộp: ${new Date(newAsg.dueDate).toLocaleDateString('vi-VN')}`,
    });
    this.persist();
    return newAsg;
  }

  public updateAssignment(id: string, updates: Partial<Assignment>): Assignment | null {
    const idx = this.state.assignments.findIndex(a => a.id === id);
    if (idx === -1) return null;
    this.state.assignments[idx] = { ...this.state.assignments[idx], ...updates };
    this.persist();
    return this.state.assignments[idx];
  }

  public deleteAssignment(id: string): boolean {
    this.state.assignments = this.state.assignments.filter(a => a.id !== id);
    this.state.submissions = this.state.submissions.filter(s => s.assignmentId !== id);
    this.persist();
    return true;
  }

  // --- Submissions ---
  public getSubmissions(assignmentId: string): AssignmentSubmission[] {
    return this.state.submissions.filter(s => s.assignmentId === assignmentId);
  }

  public getStudentSubmission(assignmentId: string, studentId: string): AssignmentSubmission | undefined {
    return this.state.submissions.find(s => s.assignmentId === assignmentId && s.studentId === studentId);
  }

  public submitAssignment(submission: Omit<AssignmentSubmission, 'id' | 'submittedAt'>): AssignmentSubmission {
    const existingIdx = this.state.submissions.findIndex(
      s => s.assignmentId === submission.assignmentId && s.studentId === submission.studentId
    );

    const now = new Date().toISOString();
    let saved: AssignmentSubmission;

    if (existingIdx >= 0) {
      saved = {
        ...this.state.submissions[existingIdx],
        ...submission,
        submittedAt: now,
      };
      this.state.submissions[existingIdx] = saved;
    } else {
      saved = {
        ...submission,
        id: `sub_${Date.now()}`,
        submittedAt: now,
      };
      this.state.submissions.push(saved);
      // update assignment submission count
      const asg = this.getAssignmentById(submission.assignmentId);
      if (asg) {
        asg.submissionCount = this.getSubmissions(asg.id).length;
      }
    }
    this.persist();
    return saved;
  }

  public gradeSubmission(submissionId: string, score: number, feedback: string): AssignmentSubmission | null {
    const sub = this.state.submissions.find(s => s.id === submissionId);
    if (!sub) return null;
    sub.score = score;
    sub.feedback = feedback;
    sub.gradedAt = new Date().toISOString();
    sub.status = 'graded';

    // update assignment graded count
    const asg = this.getAssignmentById(sub.assignmentId);
    if (asg) {
      asg.gradedCount = this.state.submissions.filter(s => s.assignmentId === asg.id && s.status === 'graded').length;
    }

    this.recordAuditLog({
      userId: 'user_teacher_1',
      userName: 'Giáo viên',
      userRole: 'TEACHER',
      action: 'GRADE_SUBMISSION',
      targetEntity: `Submission (${sub.studentName})`,
      details: `Chấm điểm bài tập cho học sinh ${sub.studentName}: ${score}/10 điểm`,
    });

    this.persist();
    return sub;
  }

  // --- Quizzes & Questions ---
  public getQuestions(): Question[] {
    return this.state.questions;
  }

  public createQuestion(q: Omit<Question, 'id'>): Question {
    const newQ: Question = { ...q, id: `q_${Date.now()}` };
    this.state.questions.unshift(newQ);
    this.persist();
    return newQ;
  }

  public deleteQuestion(id: string): boolean {
    this.state.questions = this.state.questions.filter(q => q.id !== id);
    this.persist();
    return true;
  }

  public getQuizzes(classId?: string): Quiz[] {
    if (classId) {
      return this.state.quizzes.filter(q => q.classId === classId);
    }
    return this.state.quizzes;
  }

  public createQuiz(quiz: Omit<Quiz, 'id' | 'attemptsCount'>): Quiz {
    const newQuiz: Quiz = {
      ...quiz,
      id: `quiz_${Date.now()}`,
      attemptsCount: 0,
    };
    this.state.quizzes.unshift(newQuiz);
    this.persist();
    return newQuiz;
  }

  public submitQuizAttempt(attempt: Omit<QuizAttempt, 'id' | 'submittedAt'>): QuizAttempt {
    const newAttempt: QuizAttempt = {
      ...attempt,
      id: `att_quiz_${Date.now()}`,
      submittedAt: new Date().toISOString(),
    };
    this.state.quizAttempts.push(newAttempt);
    const quiz = this.state.quizzes.find(q => q.id === attempt.quizId);
    if (quiz) {
      quiz.attemptsCount++;
    }
    this.persist();
    return newAttempt;
  }

  // --- Learning Resources ---
  public getResources(grade?: number): LearningResource[] {
    if (grade) {
      return this.state.resources.filter(r => r.gradeLevel === grade);
    }
    return this.state.resources;
  }

  public addResource(res: Omit<LearningResource, 'id' | 'createdAt' | 'downloadCount'>): LearningResource {
    const newRes: LearningResource = {
      ...res,
      id: `res_${Date.now()}`,
      downloadCount: 0,
      createdAt: new Date().toISOString(),
    };
    this.state.resources.unshift(newRes);
    this.persist();
    return newRes;
  }

  public deleteResource(id: string): boolean {
    this.state.resources = this.state.resources.filter(r => r.id !== id);
    this.persist();
    return true;
  }

  // --- Gradebook ---
  public getGrades(classId: string, semester: 1 | 2 = 2): StudentGradeRecord[] {
    let records = this.state.grades.filter(g => g.classId === classId && g.semester === semester);
    // If some students in class don't have record yet, seed blank records
    const students = this.getStudents(classId);
    const existingStudentIds = new Set(records.map(r => r.studentId));

    let addedNew = false;
    students.forEach(st => {
      if (!existingStudentIds.has(st.id)) {
        const newRecord: StudentGradeRecord = {
          id: `gr_${Date.now()}_${st.id}`,
          studentId: st.id,
          studentName: st.fullName,
          studentCode: st.studentCode,
          classId: classId,
          subjectId: 'sub_math',
          semester: semester,
        };
        records.push(newRecord);
        this.state.grades.push(newRecord);
        addedNew = true;
      }
    });

    if (addedNew) {
      this.persist();
    }

    return records;
  }

  public batchSaveGrades(records: StudentGradeRecord[]) {
    records.forEach(updated => {
      // Calculate weighted average score: (oral1 + oral2 + 15m1 + 15m2 + midterm*2 + final*3) / 9
      const scores = [
        updated.oral1,
        updated.oral2,
        updated.test15m1,
        updated.test15m2,
        updated.midterm !== undefined ? updated.midterm * 2 : undefined,
        updated.finalTerm !== undefined ? updated.finalTerm * 3 : undefined,
      ].filter((s): s is number => s !== undefined && s !== null);

      const weights = [
        updated.oral1 !== undefined ? 1 : 0,
        updated.oral2 !== undefined ? 1 : 0,
        updated.test15m1 !== undefined ? 1 : 0,
        updated.test15m2 !== undefined ? 1 : 0,
        updated.midterm !== undefined ? 2 : 0,
        updated.finalTerm !== undefined ? 3 : 0,
      ].reduce((a, b) => a + b, 0);

      if (weights > 0 && scores.length > 0) {
        const sum = scores.reduce((a, b) => a + b, 0);
        updated.averageScore = parseFloat((sum / weights).toFixed(1));
      }

      const idx = this.state.grades.findIndex(g => g.id === updated.id);
      if (idx >= 0) {
        this.state.grades[idx] = updated;
      } else {
        this.state.grades.push(updated);
      }
    });

    this.recordAuditLog({
      userId: 'user_teacher_1',
      userName: 'Giáo viên',
      userRole: 'TEACHER',
      action: 'UPDATE_GRADES',
      targetEntity: `Gradebook`,
      details: `Đã lưu cập nhật bảng điểm cho ${records.length} học sinh`,
    });

    this.persist();
  }

  // --- Behavior & Rewards ---
  public getBehaviors(classId?: string): BehaviorRecord[] {
    if (classId) {
      return this.state.behaviors.filter(b => b.classId === classId);
    }
    return this.state.behaviors;
  }

  public addBehavior(b: Omit<BehaviorRecord, 'id'>): BehaviorRecord {
    const newRecord: BehaviorRecord = {
      ...b,
      id: `bh_${Date.now()}`,
    };
    this.state.behaviors.unshift(newRecord);
    // adjust student behavior points
    const student = this.getStudentById(b.studentId);
    if (student) {
      student.behaviorPoints = Math.max(0, student.behaviorPoints + b.pointsDelta);
    }
    this.persist();
    return newRecord;
  }

  // --- Smart Alerts ---
  public getAlerts(classId?: string): SmartAlert[] {
    if (classId) {
      return this.state.alerts.filter(a => a.classId === classId);
    }
    return this.state.alerts;
  }

  public updateAlertStatus(alertId: string, status: SmartAlert['status']): boolean {
    const alert = this.state.alerts.find(a => a.id === alertId);
    if (!alert) return false;
    alert.status = status;
    if (status === 'resolved') {
      alert.resolvedAt = new Date().toISOString();
    }
    this.persist();
    return true;
  }

  // --- Announcements ---
  public getAnnouncements(): Announcement[] {
    return this.state.announcements;
  }

  public createAnnouncement(anc: Omit<Announcement, 'id' | 'createdAt' | 'readCount'>): Announcement {
    const newAnc: Announcement = {
      ...anc,
      id: `anc_${Date.now()}`,
      readCount: 0,
      createdAt: new Date().toISOString(),
    };
    this.state.announcements.unshift(newAnc);
    this.recordAuditLog({
      userId: anc.authorId,
      userName: anc.authorName,
      userRole: anc.authorRole,
      action: 'POST_ANNOUNCEMENT',
      targetEntity: `Announcement (${newAnc.title})`,
      details: `Đăng thông báo mới mức độ ${newAnc.priority}: ${newAnc.title}`,
    });
    this.persist();
    return newAnc;
  }

  public markAnnouncementRead(id: string) {
    const anc = this.state.announcements.find(a => a.id === id);
    if (anc) {
      anc.readCount = Math.min(anc.totalRecipients, anc.readCount + 1);
      this.persist();
    }
  }

  // --- Direct Messages ---
  public getMessages(userId1: string, userId2: string): ChatMessage[] {
    return this.state.messages.filter(
      m => (m.senderId === userId1 && m.receiverId === userId2) || (m.senderId === userId2 && m.receiverId === userId1)
    );
  }

  public sendMessage(msg: Omit<ChatMessage, 'id' | 'timestamp' | 'isRead'>): ChatMessage {
    const newMsg: ChatMessage = {
      ...msg,
      id: `msg_${Date.now()}`,
      timestamp: new Date().toISOString(),
      isRead: false,
    };
    this.state.messages.push(newMsg);
    this.persist();
    return newMsg;
  }

  // --- Audit Logs ---
  public getAuditLogs(): AuditLog[] {
    return this.state.auditLogs;
  }

  // --- Statistics for Teacher Dashboard ---
  public getTeacherStats(teacherId = 'user_teacher_1'): TeacherStats {
    const classes = this.getClasses().filter(c => c.homeroomTeacherId === teacherId);
    const totalStudents = classes.reduce((acc, c) => acc + c.studentCount, 0);

    // Today's attendance session
    const todayStr = '2025-02-20'; // Reference date in seed
    const todaySessions = this.state.attendanceSessions.filter(a => a.date === todayStr);

    let present = 0;
    let absent = 0;
    let late = 0;

    todaySessions.forEach(s => {
      present += s.summary.present;
      absent += (s.summary.absentExcused + s.summary.absentUnexcused);
      late += s.summary.late;
    });

    const pendingGradingCount = this.state.submissions.filter(s => s.status === 'submitted' || s.status === 'late').length;
    const activeAlertsCount = this.state.alerts.filter(a => a.status !== 'resolved').length;

    return {
      totalStudents: totalStudents || 32,
      presentToday: present || 30,
      absentToday: absent || 1,
      lateToday: late || 1,
      pendingGradingCount,
      missingSubmissionsCount: 4,
      activeAlertsCount,
      todayClassesCount: 4,
    };
  }
}

export const db = new SmartClassDatabase();
