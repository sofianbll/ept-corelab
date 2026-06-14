import ProtectedRoute from './components/auth/ProtectedRoute';
import { Routes, Route } from 'react-router-dom';

import LoginPage from './pages/LoginPage';
import FirstLoginPage from './pages/FirstLoginPage';
import StudentDashboard from './pages/StudentDashboard';
import CoursesPage from './pages/CoursesPage';
import CourseDetailPage from './pages/CourseDetailPage';
import QuizPage from './pages/QuizPage';
import UsersPage from './pages/UsersPage';
import CourseManagementPage from './pages/CourseManagementPage';

import DashboardLayout from './layouts/DashboardLayout';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/first-login" element={<FirstLoginPage />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardLayout title="Tableau de bord">
              <StudentDashboard />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/courses"
        element={
          <ProtectedRoute>
            <DashboardLayout title="Mes cours">
              <CoursesPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/courses/:courseId"
        element={
          <ProtectedRoute>
            <DashboardLayout title="Cours">
              <CourseDetailPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/quizzes/:quizId"
        element={
          <ProtectedRoute roles={['student']}>
            <DashboardLayout title="QCM">
              <QuizPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/users"
        element={
          <ProtectedRoute roles={['admin']}>
            <DashboardLayout title="Gestion utilisateurs">
              <UsersPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/courses"
        element={
          <ProtectedRoute roles={['admin']}>
            <DashboardLayout title="Gestion cours">
              <CourseManagementPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
