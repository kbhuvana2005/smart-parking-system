import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import UserDashboard from './components/User/UserDashboard';
import AdminDashboard from './components/Admin/AdminDashboard';
import './App.css';

// Protected Route Component - Redirects to appropriate dashboard
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading, isAdmin } = useAuth();

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-text">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return children;
};

// Dashboard Router - Shows correct dashboard based on role
const DashboardRouter = () => {
  const { isAdmin } = useAuth();
  
  return isAdmin ? <AdminDashboard /> : <UserDashboard />;
};

// Public Route
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-text">Loading...</div>
      </div>
    );
  }

  return isAuthenticated ? <Navigate to="/dashboard" /> : children;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardRouter />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;