import React, { useState, useEffect } from 'react';
import { bookingsAPI } from '../../services/api';
import './User.css';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedQR, setSelectedQR] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await bookingsAPI.getAllBookings();
      setBookings(response.data);
      setError('');
    } catch (err) {
      setError('Failed to load bookings');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    try {
      await bookingsAPI.cancelBooking(bookingId);
      alert('Booking cancelled successfully');
      fetchBookings();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel booking');
    }
  };

  const handleViewQR = (booking) => {
    setSelectedQR(booking);
  };

  const handleDownloadQR = (booking) => {
    const link = document.createElement('a');
    link.download = `parking-qr-${booking.spot?.spotNumber}.png`;
    link.href = booking.qrCode;
    link.click();
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status) => {
    const colors = {
      active: '#10b981',
      completed: '#6b7280',
      cancelled: '#ef4444',
      'no-show': '#f59e0b',
    };
    return (
      <span
        className="status-badge"
        style={{ backgroundColor: colors[status] || '#6b7280' }}
      >
        {status}
      </span>
    );
  };

  if (loading) {
    return <div className="loading">Loading your bookings...</div>;
  }

  if (error) {
    return <div className="error-box">{error}</div>;
  }

  if (bookings.length === 0) {
    return (
      <div className="empty-state">
        <h3>No Bookings Yet</h3>
        <p>You haven't made any parking reservations yet.</p>
        <p>Browse available parking spots and make your first booking!</p>
      </div>
    );
  };

  return (
    <div className="bookings-container">
      <h2>My Bookings</h2>
      <div className="bookings-list">
        {bookings.map((booking) => (
          <div key={booking._id} className="booking-card">
            <div className="booking-header">
              <div>
                <h3>Spot: {booking.spot?.spotNumber}</h3>
                <p className="booking-floor">
                  {booking.spot?.floor} - {booking.spot?.section}
                </p>
              </div>
              {getStatusBadge(booking.bookingStatus)}
            </div>

            <div className="booking-details">
              <div className="detail-row">
                <span className="label">Vehicle:</span>
                <span className="value">{booking.vehicleNumber}</span>
              </div>
              <div className="detail-row">
                <span className="label">Start:</span>
                <span className="value">{formatDateTime(booking.startTime)}</span>
              </div>
              <div className="detail-row">
                <span className="label">End:</span>
                <span className="value">{formatDateTime(booking.endTime)}</span>
              </div>
              <div className="detail-row">
                <span className="label">Amount:</span>
                <span className="value amount">₹{booking.totalAmount}</span>
              </div>
              <div className="detail-row">
                <span className="label">Payment:</span>
                <span className={`value ${booking.paymentStatus}`}>
                  {booking.paymentStatus}
                </span>
              </div>
            </div>

            <div className="booking-actions">
              {booking.qrCode && (
                <>
                  <button
                    className="btn-view-qr"
                    onClick={() => handleViewQR(booking)}
                  >
                    View QR Code
                  </button>
                  <button
                    className="btn-download-qr"
                    onClick={() => handleDownloadQR(booking)}
                  >
                    Download QR
                  </button>
                </>
              )}
              {booking.bookingStatus === 'active' && (
                <button
                  className="btn-cancel"
                  onClick={() => handleCancelBooking(booking._id)}
                >
                  Cancel Booking
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* QR Code Modal */}
      {selectedQR && (
        <div className="modal-overlay" onClick={() => setSelectedQR(null)}>
          <div className="modal-content qr-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Booking QR Code</h2>
              <button className="close-btn" onClick={() => setSelectedQR(null)}>×</button>
            </div>
            <div className="qr-display">
              <p className="qr-instruction">Show this at parking entrance</p>
              <img src={selectedQR.qrCode} alt="QR Code" className="qr-code-large" />
              <div className="qr-details">
                <p><strong>Spot:</strong> {selectedQR.spot?.spotNumber}</p>
                <p><strong>Vehicle:</strong> {selectedQR.vehicleNumber}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBookings;