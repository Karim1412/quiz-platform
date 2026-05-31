import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function ProtectedRoute({ children, role }) {
  const { isLoggedIn, isTeacher, isStudent } = useAuth();
  const location = useLocation();

  if (!isLoggedIn) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  if (role === 'teacher' && !isTeacher) {
    return <Navigate to="/student/dashboard" replace />;
  }
  if (role === 'student' && !isStudent) {
    return <Navigate to="/teacher/dashboard" replace />;
  }
  return children;
}
