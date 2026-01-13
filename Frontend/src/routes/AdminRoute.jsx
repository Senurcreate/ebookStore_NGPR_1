import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminRoute = () => {
  const { currentUser, userRole, loading } = useAuth();

  //  Show a loading state while Firebase checks auth
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{height: "100vh"}}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  // Check if user exists AND if role is admin
  // If not, redirect to login
  if (!currentUser || userRole !== 'admin') {
    return <Navigate to="/login" replace />;
  }

  // If authorized, render the child route (The AdminLayout)
  return <Outlet />;
};

export default AdminRoute;