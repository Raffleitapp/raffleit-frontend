import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/authUtils';

export const ProtectedRoute = ({
  element,
  allowedRoles,
}: {
  element: React.ReactElement;
  allowedRoles: ('host' | 'admin')[];
}) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated || !user?.role) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return element;
};