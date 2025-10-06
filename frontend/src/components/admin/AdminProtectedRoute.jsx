import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import LoadingSpinner from '../common/LoadingSpinner';

const AdminProtectedRoute = ({ children }) => {
  const location = useLocation();
  const { isAuthenticated, user, loading } = useSelector(state => state.auth);

  // Show loading spinner while checking authentication
  if (loading) {
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

  // Check if user is admin
  if (user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  // User is authenticated and is admin, render the protected content
  return children;
};

export default AdminProtectedRoute;
