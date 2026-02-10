import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import ParkingGrid from './ParkingGrid';
import BookingForm from './BookingForm';
import MyBookings from './MyBookings';
import BookingConfirmation from './BookingConfirmation';
import './User.css';

const UserDashboard = () => {
  const { user, logout } = useAuth();
  const [selectedSpot, setSelectedSpot] = useState(null);
  const [confirmedBooking, setConfirmedBooking] = useState(null);
  const [activeTab, setActiveTab] = useState('parking');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSpotSelect = (spot) => {
    setSelectedSpot(spot);
  };

  const handleBookingCreated = (booking) => {
    // Show confirmation modal with QR code
    setConfirmedBooking(booking);
  };

  const handleConfirmationClose = () => {
    setConfirmedBooking(null);
    setActiveTab('bookings'); // Switch to bookings tab
    setSuccessMessage('Booking confirmed! Check your bookings tab.');
    setTimeout(() => setSuccessMessage(''), 5000);
  };

  return (
    <div className="dashboard-container">
      <nav className="navbar">
        <div className="nav-content">
          <h1 className="nav-title">🅿️ Smart Parking</h1>
          <div className="nav-right">
            <span className="user-name">Welcome, {user?.name}</span>
            <button onClick={logout} className="btn-logout">
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="dashboard-content">
        <div className="tabs">
          <button
            className={`tab ${activeTab === 'parking' ? 'active' : ''}`}
            onClick={() => setActiveTab('parking')}
          >
            Available Parking
          </button>
          <button
            className={`tab ${activeTab === 'bookings' ? 'active' : ''}`}
            onClick={() => setActiveTab('bookings')}
          >
            My Bookings
          </button>
        </div>

        {successMessage && (
          <div className="success-message">
            {successMessage}
          </div>
        )}

        <div className="tab-content">
          {activeTab === 'parking' ? (
            <ParkingGrid onSpotSelect={handleSpotSelect} />
          ) : (
            <MyBookings />
          )}
        </div>
      </div>

      {selectedSpot && (
        <BookingForm
          spot={selectedSpot}
          onClose={() => setSelectedSpot(null)}
          onSuccess={handleBookingCreated}
        />
      )}

      {confirmedBooking && (
        <BookingConfirmation
          booking={confirmedBooking}
          onClose={handleConfirmationClose}
        />
      )}
    </div>
  );
};

export default UserDashboard;