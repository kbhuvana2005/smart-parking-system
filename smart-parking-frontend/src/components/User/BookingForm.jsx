import React, { useState } from 'react';
import { bookingsAPI } from '../../services/api';
import './User.css';

const BookingForm = ({ spot, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    vehicleNumber: '',
    startTime: '',
    endTime: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const calculateDuration = () => {
    if (formData.startTime && formData.endTime) {
      const start = new Date(formData.startTime);
      const end = new Date(formData.endTime);
      const hours = Math.ceil((end - start) / (1000 * 60 * 60));
      return hours > 0 ? hours : 0;
    }
    return 0;
  };

  const calculateAmount = () => {
    const hours = calculateDuration();
    return hours * spot.pricePerHour;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // For vehicle number, convert to uppercase
    if (name === 'vehicleNumber') {
      setFormData({
        ...formData,
        [name]: value.toUpperCase(),
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }

    // Clear error
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Vehicle number validation (Indian format)
    if (!formData.vehicleNumber.trim()) {
      newErrors.vehicleNumber = 'Vehicle number is required';
    } else if (!/^[A-Z]{2}[0-9]{2}[A-Z]{1,2}[0-9]{4}$/.test(formData.vehicleNumber)) {
      newErrors.vehicleNumber = 'Invalid format (e.g., TN01AB1234)';
    }

    // Start time validation
    if (!formData.startTime) {
      newErrors.startTime = 'Start time is required';
    } else {
      const now = new Date();
      const start = new Date(formData.startTime);
      if (start < now) {
        newErrors.startTime = 'Start time cannot be in the past';
      }
    }

    // End time validation
    if (!formData.endTime) {
      newErrors.endTime = 'End time is required';
    } else if (formData.startTime) {
      const start = new Date(formData.startTime);
      const end = new Date(formData.endTime);
      if (end <= start) {
        newErrors.endTime = 'End time must be after start time';
      }
      const hours = (end - start) / (1000 * 60 * 60);
      if (hours > 24) {
        newErrors.endTime = 'Booking cannot exceed 24 hours';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const bookingData = {
        spotId: spot._id,
        vehicleNumber: formData.vehicleNumber,
        startTime: formData.startTime,
        endTime: formData.endTime,
      };

      await bookingsAPI.createBooking(bookingData);
      onSuccess('Booking created successfully!');
      onClose();
    } catch (error) {
      setErrors({
        submit: error.response?.data?.message || 'Failed to create booking',
      });
    } finally {
      setLoading(false);
    }
  };

  const duration = calculateDuration();
  const totalAmount = calculateAmount();

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Book Parking Spot</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="spot-info">
          <h3>Spot: {spot.spotNumber}</h3>
          <p>Floor: {spot.floor} | Section: {spot.section}</p>
          <p>Type: {spot.type} | Price: ₹{spot.pricePerHour}/hour</p>
        </div>

        {errors.submit && (
          <div className="error-message">{errors.submit}</div>
        )}

        <form onSubmit={handleSubmit} className="booking-form">
          <div className="form-group">
            <label>Vehicle Number *</label>
            <input
              type="text"
              name="vehicleNumber"
              value={formData.vehicleNumber}
              onChange={handleChange}
              placeholder="TN01AB1234"
              maxLength="10"
              className={errors.vehicleNumber ? 'input-error' : ''}
            />
            {errors.vehicleNumber && (
              <span className="field-error">{errors.vehicleNumber}</span>
            )}
            <span className="field-hint">Format: TN01AB1234</span>
          </div>

          <div className="form-group">
            <label>Start Time *</label>
            <input
              type="datetime-local"
              name="startTime"
              value={formData.startTime}
              onChange={handleChange}
              className={errors.startTime ? 'input-error' : ''}
            />
            {errors.startTime && (
              <span className="field-error">{errors.startTime}</span>
            )}
          </div>

          <div className="form-group">
            <label>End Time *</label>
            <input
              type="datetime-local"
              name="endTime"
              value={formData.endTime}
              onChange={handleChange}
              className={errors.endTime ? 'input-error' : ''}
            />
            {errors.endTime && (
              <span className="field-error">{errors.endTime}</span>
            )}
          </div>

          {duration > 0 && (
            <div className="booking-summary">
              <div className="summary-row">
                <span>Duration:</span>
                <strong>{duration} hour{duration > 1 ? 's' : ''}</strong>
              </div>
              <div className="summary-row">
                <span>Rate:</span>
                <strong>₹{spot.pricePerHour}/hour</strong>
              </div>
              <div className="summary-row total">
                <span>Total Amount:</span>
                <strong>₹{totalAmount}</strong>
              </div>
            </div>
          )}

          <div className="modal-actions">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={loading || duration === 0}
            >
              {loading ? 'Booking...' : 'Confirm Booking'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookingForm;