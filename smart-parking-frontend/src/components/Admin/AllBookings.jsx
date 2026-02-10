import React, { useState, useEffect } from 'react';
import { bookingsAPI } from '../../services/api';
import './Admin.css';

const AllBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, active, completed, cancelled

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await bookingsAPI.getAllBookings();
      setBookings(response.data);
    } catch (err) {
      console.error('Failed to fetch bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteBooking = async (bookingId) => {
    if (!window.confirm('Mark this booking as completed?')) {
      return;
    }

    try {
      await bookingsAPI.completeBooking(bookingId);
      alert('Booking marked as completed');
      fetchBookings();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to complete booking');
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Cancel this booking?')) {
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

  const getStatusColor = (status) => {
    const colors = {
      active: '#10b981',
      completed: '#6b7280',
      cancelled: '#ef4444',
      'no-show': '#f59e0b',
    };
    return colors[status] || '#6b7280';
  };

  const filteredBookings = bookings.filter(booking => {
    if (filter === 'all') return true;
    return booking.bookingStatus === filter;
  });

  if (loading) {
    return <div className="loading">Loading bookings...</div>;
  }

  return (
    <div className="all-bookings">
      <div className="bookings-header">
        <h3>All Bookings ({filteredBookings.length})</h3>
        <div className="filter-buttons">
          <button 
            className={filter === 'all' ? 'active' : ''}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button 
            className={filter === 'active' ? 'active' : ''}
            onClick={() => setFilter('active')}
          >
            Active
          </button>
          <button 
            className={filter === 'completed' ? 'active' : ''}
            onClick={() => setFilter('completed')}
          >
            Completed
          </button>
          <button 
            className={filter === 'cancelled' ? 'active' : ''}
            onClick={() => setFilter('cancelled')}
          >
            Cancelled
          </button>
        </div>
      </div>

      {filteredBookings.length === 0 ? (
        <div className="empty-state">
          <p>No bookings found</p>
        </div>
      ) : (
        <div className="bookings-table">
          <table>
            <thead>
              <tr>
                <th>User</th>
                <th>Spot</th>
                <th>Vehicle</th>
                <th>Start Time</th>
                <th>End Time</th>
                <th>Amount</th>
                <th>Payment</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map((booking) => (
                <tr key={booking._id}>
                  <td>
                    <div className="user-info">
                      <strong>{booking.user?.name}</strong>
                      <small>{booking.user?.email}</small>
                    </div>
                  </td>
                  <td>
                    <strong>{booking.spot?.spotNumber}</strong>
                    <br />
                    <small>{booking.spot?.floor}</small>
                  </td>
                  <td>{booking.vehicleNumber}</td>
                  <td>{formatDateTime(booking.startTime)}</td>
                  <td>{formatDateTime(booking.endTime)}</td>
                  <td className="amount">₹{booking.totalAmount}</td>
                  <td>
                    <span className={`payment-badge ${booking.paymentStatus}`}>
                      {booking.paymentStatus}
                    </span>
                  </td>
                  <td>
                    <span 
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(booking.bookingStatus) }}
                    >
                      {booking.bookingStatus}
                    </span>
                  </td>
                  <td className="actions">
                    {booking.bookingStatus === 'active' && (
                      <>
                        <button 
                          className="btn-complete"
                          onClick={() => handleCompleteBooking(booking._id)}
                        >
                          Complete
                        </button>
                        <button 
                          className="btn-cancel"
                          onClick={() => handleCancelBooking(booking._id)}
                        >
                          Cancel
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AllBookings;