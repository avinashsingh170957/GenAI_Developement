import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Wraps pages that require login (and optionally a specific role)
const ProtectedRoute = ({ children, allowedRole }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500 text-lg">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && user.role !== allowedRole) {
    return <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />;
  }

  return children;
};

export default ProtectedRoute;
