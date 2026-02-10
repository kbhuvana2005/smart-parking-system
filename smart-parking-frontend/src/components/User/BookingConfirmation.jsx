import React from 'react';
import './User.css';

const BookingConfirmation = ({ booking, onClose }) => {
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

  const handleDownloadQR = () => {
    const link = document.createElement('a');
    link.download = `parking-qr-${booking.spot?.spotNumber}.png`;
    link.href = booking.qrCode;
    link.click();
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content confirmation-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>🎉 Booking Confirmed!</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="confirmation-content">
          <div className="success-icon">✓</div>
          <p className="confirmation-text">
            Your parking spot has been successfully reserved!
          </p>

          <div className="qr-section">
            <h3>Your Booking QR Code</h3>
            <p className="qr-instruction">Show this QR code at the parking entrance</p>
            
            {booking.qrCode ? (
              <div className="qr-code-container">
                <img 
                  src={booking.qrCode} 
                  alt="Booking QR Code" 
                  className="qr-code-image"
                />
              </div>
            ) : (
              <div className="qr-loading">Generating QR Code...</div>
            )}

            <div className="qr-actions">
              <button className="btn-download" onClick={handleDownloadQR}>
                📥 Download QR Code
              </button>
              <button className="btn-print" onClick={handlePrint}>
                🖨️ Print
              </button>
            </div>
          </div>

          <div className="booking-details-card">
            <h3>Booking Details</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <span className="label">Booking ID:</span>
                <span className="value">{booking._id?.slice(-8)}</span>
              </div>
              <div className="detail-item">
                <span className="label">Parking Spot:</span>
                <span className="value">{booking.spot?.spotNumber}</span>
              </div>
              <div className="detail-item">
                <span className="label">Floor:</span>
                <span className="value">{booking.spot?.floor}</span>
              </div>
              <div className="detail-item">
                <span className="label">Section:</span>
                <span className="value">{booking.spot?.section}</span>
              </div>
              <div className="detail-item">
                <span className="label">Vehicle Number:</span>
                <span className="value">{booking.vehicleNumber}</span>
              </div>
              <div className="detail-item">
                <span className="label">Start Time:</span>
                <span className="value">{formatDateTime(booking.startTime)}</span>
              </div>
              <div className="detail-item">
                <span className="label">End Time:</span>
                <span className="value">{formatDateTime(booking.endTime)}</span>
              </div>
              <div className="detail-item total-amount">
                <span className="label">Total Amount:</span>
                <span className="value">₹{booking.totalAmount}</span>
              </div>
            </div>
          </div>

          <div className="instructions">
            <h4>📌 Important Instructions:</h4>
            <ul>
              <li>Present the QR code at the parking entrance</li>
              <li>Arrive within 15 minutes of your start time</li>
              <li>Keep this QR code safe for exit verification</li>
              <li>Contact support if you face any issues</li>
            </ul>
          </div>

          <div className="modal-actions">
            <button className="btn-primary" onClick={onClose}>
              View My Bookings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmation;