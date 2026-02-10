import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import SpotManagement from './SpotManagement';
import AllBookings from './AllBookings';
import Analytics from './Analytics';
import './Admin.css';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('analytics'); // 'analytics', 'spots', 'bookings'
  const [successMessage, setSuccessMessage] = useState('');

  const showSuccess = (message) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(''), 5000);
  };

  return (
    <div className="dashboard-container">
      <nav className="navbar admin">
        <div className="nav-content">
          <h1 className="nav-title">🅿️ Smart Parking - Admin</h1>
          <div className="nav-right">
            <span className="user-name">Admin: {user?.name}</span>
            <button onClick={logout} className="btn-logout">
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="dashboard-content">
        <div className="admin-header">
          <h2>Admin Dashboard</h2>
          <p>Manage parking spots, bookings and view analytics</p>
        </div>

        <div className="tabs">
          <button
            className={`tab ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            Analytics
          </button>
          <button
            className={`tab ${activeTab === 'spots' ? 'active' : ''}`}
            onClick={() => setActiveTab('spots')}
          >
            Manage Parking Spots
          </button>
          <button
            className={`tab ${activeTab === 'bookings' ? 'active' : ''}`}
            onClick={() => setActiveTab('bookings')}
          >
            All Bookings
          </button>
        </div>

        {successMessage && (
          <div className="success-message">
            {successMessage}
          </div>
        )}

        <div className="tab-content">
          {activeTab === 'analytics' && <Analytics />}
          {activeTab === 'spots' && <SpotManagement onSuccess={showSuccess} />}
          {activeTab === 'bookings' && <AllBookings />}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;