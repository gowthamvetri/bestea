import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import LoadingSpinner from '../common/LoadingSpinner';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const location = useLocation();
  const { isAuthenticated, isLoading, user } = useSelector(state => state.auth);

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // Check if user is authenticated
  if (!isAuthenticated) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Check if admin access is required
  if (adminOnly && user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  // User is authenticated, render the protected content
  return children;
};

export default ProtectedRoute;
