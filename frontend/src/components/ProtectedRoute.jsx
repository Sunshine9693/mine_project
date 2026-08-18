import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loader from './Loader';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen w-full flex flex-col justify-center items-center bg-gradient-aura">
        <Loader size="lg" />
        <p className="mt-4 text-xs font-semibold tracking-wider text-aura-soft-purple uppercase animate-pulse">
          Securing Session...
          
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
