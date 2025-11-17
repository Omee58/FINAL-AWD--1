import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, isAuthenticated, loading } = useAuth();

  console.log('ProtectedRoute: user:', user);
  console.log('ProtectedRoute: isAuthenticated:', isAuthenticated);
  console.log('ProtectedRoute: allowedRoles:', allowedRoles);
  console.log('ProtectedRoute: loading:', loading);

  // Show loading while checking authentication
  if (loading) {
    console.log('ProtectedRoute: Still loading, showing loading state');
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '200px' }}>
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    console.log('ProtectedRoute: Not authenticated, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  // If user exists but no role is specified, allow access
  if (allowedRoles.length === 0) {
    return children;
  }

  // Check if user's role is allowed
  if (user && allowedRoles.includes(user.role)) {
    return children;
  }

  // If role is not allowed, redirect based on user's role
  if (user) {
    switch (user.role) {
      case 'client':
        return <Navigate to="/dashboard" replace />;
      case 'vendor':
        return <Navigate to="/vendor/dashboard" replace />;
      case 'admin':
        return <Navigate to="/admin/dashboard" replace />;
      default:
        return <Navigate to="/login" replace />;
    }
  }

  // Fallback to login
  return <Navigate to="/login" replace />;
};

export default ProtectedRoute;
