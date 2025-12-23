import { Navigate } from 'react-router-dom';
import useAuthStore from '@/store/authStore';
import { useEffect, useState } from 'react';

export default function ProtectedRoute({ children, requiredRole }) {
  const { isAuthenticated, user, checkAuth } = useAuthStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyAuth = async () => {
      if (!isAuthenticated) {
        await checkAuth();
      }
      setLoading(false);
    };
    verifyAuth();
  }, [isAuthenticated, checkAuth]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

