import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from '../layouts/AppLayout';
import { RoleGuard } from '../components/common/RoleGuard';
import { LoginPage } from '../pages/auth/LoginPage';
import { UnauthorizedPage } from '../pages/auth/UnauthorizedPage';
import { NotFoundPage } from '../pages/auth/NotFoundPage';

// Teacher pages
import { TeacherDashboard } from '../pages/teacher/TeacherDashboard';
import { ClassesListPage } from '../pages/teacher/ClassesListPage';
import { ClassWorkspacePage } from '../pages/teacher/ClassWorkspacePage';
import { StudentsPage } from '../pages/teacher/StudentsPage';
import { AttendancePage } from '../pages/teacher/AttendancePage';
import { AssignmentsPage } from '../pages/teacher/AssignmentsPage';
import { GradesPage } from '../pages/teacher/GradesPage';
import { AlertsPage } from '../pages/teacher/AlertsPage';
import { AnnouncementsPage } from '../pages/teacher/AnnouncementsPage';
import { SchedulePage } from '../pages/teacher/SchedulePage';
import { ReportsPage } from '../pages/teacher/ReportsPage';
import { AIAssistantPage } from '../pages/teacher/AIAssistantPage';
import { WheelOfFortunePage } from '../pages/teacher/tools/WheelOfFortunePage';
import { QuestionBankPage } from '../pages/teacher/QuestionBankPage';

// Student, Parent, Admin pages
import { StudentDashboard } from '../pages/student/StudentDashboard';
import { ParentDashboard } from '../pages/parent/ParentDashboard';
import { AdminDashboard } from '../pages/admin/AdminDashboard';
import { useAuth } from '../contexts/AuthContext';

const RootRedirect: React.FC = () => {
  const { currentRole, isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (currentRole === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
  if (currentRole === 'STUDENT') return <Navigate to="/student/dashboard" replace />;
  if (currentRole === 'PARENT') return <Navigate to="/parent/dashboard" replace />;
  return <Navigate to="/teacher/dashboard" replace />;
};

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/403" element={<UnauthorizedPage />} />
      <Route path="/404" element={<NotFoundPage />} />

      {/* Teacher Protected Routes */}
      <Route
        path="/teacher"
        element={
          <RoleGuard allowedRoles={['TEACHER', 'ADMIN']}>
            <AppLayout />
          </RoleGuard>
        }
      >
        <Route index element={<Navigate to="/teacher/dashboard" replace />} />
        <Route path="dashboard" element={<TeacherDashboard />} />
        <Route path="classes" element={<ClassesListPage />} />
        <Route path="classes/:id" element={<ClassWorkspacePage />} />
        <Route path="students" element={<StudentsPage />} />
        <Route path="attendance" element={<AttendancePage />} />
        <Route path="attendance-analytics" element={<AttendancePage />} />
        <Route path="schedule" element={<SchedulePage />} />
        <Route path="assignments" element={<AssignmentsPage />} />
        <Route path="grades" element={<GradesPage />} />
        <Route path="alerts" element={<AlertsPage />} />
        <Route path="behavior" element={<ClassWorkspacePage />} />
        <Route path="announcements" element={<AnnouncementsPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="ai" element={<AIAssistantPage />} />
        <Route path="tools" element={<WheelOfFortunePage />} />
        <Route path="tools/wheel" element={<WheelOfFortunePage />} />
        <Route path="tools/random" element={<WheelOfFortunePage />} />
        <Route path="tools/timer" element={<WheelOfFortunePage />} />
        <Route path="settings" element={<ReportsPage />} />
        <Route path="profile" element={<ReportsPage />} />
        <Route path="quizzes" element={<AIAssistantPage />} />
        <Route path="question-bank" element={<QuestionBankPage />} />
        <Route path="resources" element={<ReportsPage />} />
      </Route>

      {/* Student Protected Routes */}
      <Route
        path="/student"
        element={
          <RoleGuard allowedRoles={['STUDENT', 'ADMIN', 'TEACHER']}>
            <AppLayout />
          </RoleGuard>
        }
      >
        <Route index element={<Navigate to="/student/dashboard" replace />} />
        <Route path="dashboard" element={<StudentDashboard />} />
        <Route path="schedule" element={<SchedulePage />} />
        <Route path="assignments" element={<StudentDashboard />} />
        <Route path="quizzes" element={<StudentDashboard />} />
        <Route path="resources" element={<StudentDashboard />} />
        <Route path="grades" element={<StudentDashboard />} />
        <Route path="attendance" element={<StudentDashboard />} />
        <Route path="achievements" element={<StudentDashboard />} />
        <Route path="announcements" element={<AnnouncementsPage />} />
        <Route path="profile" element={<StudentDashboard />} />
      </Route>

      {/* Parent Protected Routes */}
      <Route
        path="/parent"
        element={
          <RoleGuard allowedRoles={['PARENT', 'ADMIN', 'TEACHER']}>
            <AppLayout />
          </RoleGuard>
        }
      >
        <Route index element={<Navigate to="/parent/dashboard" replace />} />
        <Route path="dashboard" element={<ParentDashboard />} />
        <Route path="children" element={<ParentDashboard />} />
        <Route path="grades" element={<ParentDashboard />} />
        <Route path="attendance" element={<ParentDashboard />} />
        <Route path="assignments" element={<ParentDashboard />} />
        <Route path="comments" element={<ParentDashboard />} />
        <Route path="achievements" element={<ParentDashboard />} />
        <Route path="schedule" element={<SchedulePage />} />
        <Route path="announcements" element={<AnnouncementsPage />} />
        <Route path="messages" element={<ParentDashboard />} />
        <Route path="profile" element={<ParentDashboard />} />
      </Route>

      {/* Admin Protected Routes */}
      <Route
        path="/admin"
        element={
          <RoleGuard allowedRoles={['ADMIN']}>
            <AppLayout />
          </RoleGuard>
        }
      >
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="schools" element={<AdminDashboard />} />
        <Route path="academic-years" element={<AdminDashboard />} />
        <Route path="classes" element={<ClassesListPage />} />
        <Route path="users" element={<AdminDashboard />} />
        <Route path="roles" element={<AdminDashboard />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="audit-logs" element={<AdminDashboard />} />
        <Route path="settings" element={<AdminDashboard />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};
