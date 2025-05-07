import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/authUtils';

export function ProtectedRoute({
  element,
  allowedRoles,
}: {
  element: React.ReactElement;
  allowedRoles: ('host' | 'admin')[];
}) {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!user.role || !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />; // Redirect to dashboard home if unauthorized
  }

  return element;
}