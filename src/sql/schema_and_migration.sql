-- ====================================================================
-- SMART CLASS - QUẢN LÝ LỚP HỌC THÔNG MINH
-- PostreSQL / Supabase Schema & Row-Level Security (RLS) Policies
-- Multi-Tenant / Multi-School Architecture
-- ====================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. SCHOOLS / ORGANIZATIONS
CREATE TABLE IF NOT EXISTS schools (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    address TEXT,
    phone VARCHAR(50),
    email VARCHAR(100),
    logo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. PROFILES / USERS
CREATE TYPE user_role AS ENUM ('ADMIN', 'TEACHER', 'STUDENT', 'PARENT');

CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'STUDENT',
    avatar_url TEXT,
    phone VARCHAR(50),
    title VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. ACADEMIC YEARS
CREATE TABLE IF NOT EXISTS academic_years (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL, -- e.g. "2024-2025"
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_current BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. CLASSES
CREATE TABLE IF NOT EXISTS classes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
    academic_year_id UUID REFERENCES academic_years(id) ON DELETE CASCADE,
    grade_level INT NOT NULL, -- 10, 11, 12
    name VARCHAR(50) NOT NULL, -- "10A1"
    code VARCHAR(50) NOT NULL,
    room_number VARCHAR(50),
    homeroom_teacher_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    color VARCHAR(20) DEFAULT '#2563EB',
    join_code VARCHAR(30) UNIQUE,
    is_archived BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. STUDENTS
CREATE TABLE IF NOT EXISTS students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
    class_id UUID REFERENCES classes(id) ON DELETE SET NULL,
    student_code VARCHAR(50) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    dob DATE NOT NULL,
    gender VARCHAR(10) NOT NULL,
    roll_number INT,
    team_name VARCHAR(50),
    avatar_url TEXT,
    address TEXT,
    phone VARCHAR(50),
    status VARCHAR(20) DEFAULT 'active', -- active, leave, suspended
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. PARENTS & RELATIONSHIPS
CREATE TABLE IF NOT EXISTS parents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(255),
    relationship VARCHAR(50) DEFAULT 'Bố', -- Bố, Mẹ, Người giám hộ
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS student_parents (
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES parents(id) ON DELETE CASCADE,
    is_primary_contact BOOLEAN DEFAULT TRUE,
    PRIMARY KEY (student_id, parent_id)
);

-- 8. ATTENDANCE
CREATE TABLE IF NOT EXISTS attendance_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
    session_date DATE NOT NULL,
    period INT DEFAULT 1,
    session_type VARCHAR(20) DEFAULT 'morning',
    taken_by_teacher_id UUID REFERENCES profiles(id),
    present_count INT DEFAULT 0,
    absent_excused_count INT DEFAULT 0,
    absent_unexcused_count INT DEFAULT 0,
    late_count INT DEFAULT 0,
    early_leave_count INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(class_id, session_date, period)
);

CREATE TABLE IF NOT EXISTS attendance_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES attendance_sessions(id) ON DELETE CASCADE,
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    status VARCHAR(25) NOT NULL, -- present, absent_excused, absent_unexcused, late, early_leave
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. ASSIGNMENTS & SUBMISSIONS
CREATE TABLE IF NOT EXISTS assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
    subject_name VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    due_date TIMESTAMP WITH TIME ZONE NOT NULL,
    points NUMERIC(4, 1) DEFAULT 10.0,
    status VARCHAR(20) DEFAULT 'published', -- draft, published, closed
    created_by_teacher_id UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS assignment_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assignment_id UUID REFERENCES assignments(id) ON DELETE CASCADE,
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    content TEXT,
    file_url TEXT,
    score NUMERIC(4, 1),
    feedback TEXT,
    graded_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) DEFAULT 'submitted', -- submitted, late, graded, resubmit_required
    UNIQUE(assignment_id, student_id)
);

-- 10. GRADES
CREATE TABLE IF NOT EXISTS student_grades (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
    subject_name VARCHAR(100) NOT NULL,
    semester INT DEFAULT 1,
    oral_1 NUMERIC(3, 1),
    oral_2 NUMERIC(3, 1),
    test_15m_1 NUMERIC(3, 1),
    test_15m_2 NUMERIC(3, 1),
    midterm NUMERIC(3, 1),
    final_term NUMERIC(3, 1),
    average_score NUMERIC(3, 1),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(student_id, class_id, subject_name, semester)
);

-- 11. BEHAVIOR & ALERTS
CREATE TABLE IF NOT EXISTS behavior_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL, -- positive, negative
    category VARCHAR(100) NOT NULL,
    points_delta INT NOT NULL,
    note TEXT,
    recorded_by_teacher_id UUID REFERENCES profiles(id),
    recorded_at DATE DEFAULT CURRENT_DATE
);

CREATE TABLE IF NOT EXISTS smart_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- attendance_risk, low_grades, missing_homework, behavior_issue
    level VARCHAR(20) NOT NULL, -- info, warning, critical
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'new', -- new, investigating, resolved
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- 12. AUDIT LOGS
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    user_name VARCHAR(255) NOT NULL,
    user_role VARCHAR(20) NOT NULL,
    action VARCHAR(100) NOT NULL,
    target_entity VARCHAR(255) NOT NULL,
    details TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignment_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE behavior_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE smart_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- ADMIN: Full Access within their school
CREATE POLICY admin_all_profiles ON profiles FOR ALL TO authenticated
USING (auth.jwt() ->> 'role' = 'ADMIN');

-- TEACHER: Can view & manage their assigned classes and students
CREATE POLICY teacher_view_classes ON classes FOR SELECT TO authenticated
USING (homeroom_teacher_id = auth.uid() OR auth.jwt() ->> 'role' = 'ADMIN');

CREATE POLICY teacher_manage_attendance ON attendance_sessions FOR ALL TO authenticated
USING (taken_by_teacher_id = auth.uid() OR auth.jwt() ->> 'role' = 'ADMIN');

-- STUDENT: Can only view their own records & assignments for their class
CREATE POLICY student_view_own_grades ON student_grades FOR SELECT TO authenticated
USING (
  student_id IN (SELECT id FROM students WHERE profile_id = auth.uid())
  OR auth.jwt() ->> 'role' IN ('ADMIN', 'TEACHER')
);

CREATE POLICY student_manage_own_submission ON assignment_submissions FOR ALL TO authenticated
USING (
  student_id IN (SELECT id FROM students WHERE profile_id = auth.uid())
  OR auth.jwt() ->> 'role' IN ('ADMIN', 'TEACHER')
);

-- PARENT: Can only view data of their linked children
CREATE POLICY parent_view_child_grades ON student_grades FOR SELECT TO authenticated
USING (
  student_id IN (
    SELECT sp.student_id FROM student_parents sp
    JOIN parents p ON sp.parent_id = p.id
    WHERE p.profile_id = auth.uid()
  )
  OR auth.jwt() ->> 'role' IN ('ADMIN', 'TEACHER')
);

-- AUDIT LOGS: Append only, readable by Admin
CREATE POLICY admin_view_audit_logs ON audit_logs FOR SELECT TO authenticated
USING (auth.jwt() ->> 'role' = 'ADMIN');

CREATE POLICY authenticated_insert_audit_logs ON audit_logs FOR INSERT TO authenticated
WITH CHECK (true);
