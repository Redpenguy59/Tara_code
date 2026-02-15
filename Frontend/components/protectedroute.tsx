// src/components/ProtectedRoute.tsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }: { children: React.ReactElement }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex h-screen items-center justify-center">Loading TARA...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;