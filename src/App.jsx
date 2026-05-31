import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { NotificationProvider } from './context/NotificationContext.jsx';
import { QuizProvider }         from './context/QuizContext.jsx';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';

import LoginPage    from './pages/auth/LoginPage.jsx';
import RegisterPage from './pages/auth/RegisterPage.jsx';

import TeacherDashboard    from './pages/teacher/TeacherDashboard.jsx';
import TeacherGeneratePage from './pages/teacher/TeacherGeneratePage.jsx';

import StudentDashboard from './pages/student/StudentDashboard.jsx';
import StudentQuizPage  from './pages/student/StudentQuizPage.jsx';
import LeaderboardPage  from './pages/student/LeaderboardPage.jsx';

import ProtectedRoute from './components/ProtectedRoute.jsx';

function RootRedirect() {
  const { isLoggedIn, isTeacher } = useAuth();
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  return <Navigate to={isTeacher ? '/teacher/dashboard' : '/student/dashboard'} replace />;
}

export default function App() {
  return (
    <NotificationProvider>
      <AuthProvider>
        <QuizProvider>
          <BrowserRouter>
            <Routes>
              {/* Root redirect based on role */}
              <Route path="/" element={<RootRedirect />} />

              {/* Public */}
              <Route path="/login"    element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Teacher */}
              <Route path="/teacher/dashboard" element={
                <ProtectedRoute role="teacher"><TeacherDashboard /></ProtectedRoute>
              } />
              <Route path="/teacher/generate" element={
                <ProtectedRoute role="teacher"><TeacherGeneratePage /></ProtectedRoute>
              } />
              <Route path="/teacher/leaderboard" element={
                <ProtectedRoute role="teacher"><LeaderboardPage /></ProtectedRoute>
              } />

              {/* Student */}
              <Route path="/student/dashboard" element={
                <ProtectedRoute role="student"><StudentDashboard /></ProtectedRoute>
              } />
              <Route path="/student/quiz/:id" element={
                <ProtectedRoute role="student"><StudentQuizPage /></ProtectedRoute>
              } />
              <Route path="/student/leaderboard" element={
                <ProtectedRoute role="student"><LeaderboardPage /></ProtectedRoute>
              } />

              {/* Catch-all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </QuizProvider>
      </AuthProvider>
    </NotificationProvider>
  );
}
