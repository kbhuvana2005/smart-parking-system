import React, { useState, useEffect } from 'react';
import { bookingsAPI, spotsAPI } from '../../services/api';
import './Admin.css';

const Analytics = () => {
  const [stats, setStats] = useState({
    totalBookings: 0,
    activeBookings: 0,
    completedBookings: 0,
    totalRevenue: 0,
    todayRevenue: 0,
    totalSpots: 0,
    availableSpots: 0,
    occupancyRate: 0,
  });
  const [recentBookings, setRecentBookings] = useState([]);
  const [popularSpots, setPopularSpots] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);

      // Fetch all bookings
      const bookingsResponse = await bookingsAPI.getAllBookings();
      const bookings = bookingsResponse.data;

      // Fetch all spots
      const spotsResponse = await spotsAPI.getAllSpots({});
      const spots = spotsResponse.data;

      // Calculate stats
      const totalBookings = bookings.length;
      const activeBookings = bookings.filter(b => b.bookingStatus === 'active').length;
      const completedBookings = bookings.filter(b => b.bookingStatus === 'completed').length;
      
      // Calculate total revenue
      const totalRevenue = bookings
        .filter(b => b.paymentStatus === 'completed')
        .reduce((sum, b) => sum + b.totalAmount, 0);

      // Calculate today's revenue
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayRevenue = bookings
        .filter(b => {
          const bookingDate = new Date(b.createdAt);
          bookingDate.setHours(0, 0, 0, 0);
          return bookingDate.getTime() === today.getTime() && b.paymentStatus === 'completed';
        })
        .reduce((sum, b) => sum + b.totalAmount, 0);

      // Spot statistics
      const totalSpots = spots.length;
      const availableSpots = spots.filter(s => s.status === 'available').length;
      const occupancyRate = totalSpots > 0 
        ? ((totalSpots - availableSpots) / totalSpots * 100).toFixed(1)
        : 0;

      // Get recent bookings (last 5)
      const recent = bookings
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);

      // Calculate popular spots
      const spotCounts = {};
      bookings.forEach(booking => {
        const spotId = booking.spot?._id || booking.spot;
        if (spotId) {
          spotCounts[spotId] = (spotCounts[spotId] || 0) + 1;
        }
      });

      const popular = Object.entries(spotCounts)
        .map(([spotId, count]) => {
          const spot = bookings.find(b => 
            (b.spot?._id === spotId || b.spot === spotId)
          )?.spot;
          return { spot, count };
        })
        .filter(item => item.spot)
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      setStats({
        totalBookings,
        activeBookings,
        completedBookings,
        totalRevenue,
        todayRevenue,
        totalSpots,
        availableSpots,
        occupancyRate,
      });

      setRecentBookings(recent);
      setPopularSpots(popular);
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return <div className="loading">Loading analytics...</div>;
  }

  return (
    <div className="analytics-container">
      <h2>Analytics & Reports</h2>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card revenue">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <h3>Total Revenue</h3>
            <p className="stat-value">₹{stats.totalRevenue.toLocaleString()}</p>
            <span className="stat-label">All time</span>
          </div>
        </div>

        <div className="stat-card today-revenue">
          <div className="stat-icon">📈</div>
          <div className="stat-content">
            <h3>Today's Revenue</h3>
            <p className="stat-value">₹{stats.todayRevenue.toLocaleString()}</p>
            <span className="stat-label">Last 24 hours</span>
          </div>
        </div>

        <div className="stat-card bookings">
          <div className="stat-icon">📋</div>
          <div className="stat-content">
            <h3>Total Bookings</h3>
            <p className="stat-value">{stats.totalBookings}</p>
            <span className="stat-label">
              {stats.activeBookings} active, {stats.completedBookings} completed
            </span>
          </div>
        </div>

        <div className="stat-card occupancy">
          <div className="stat-icon">🅿️</div>
          <div className="stat-content">
            <h3>Occupancy Rate</h3>
            <p className="stat-value">{stats.occupancyRate}%</p>
            <span className="stat-label">
              {stats.availableSpots} of {stats.totalSpots} available
            </span>
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="analytics-grid">
        {/* Popular Spots */}
        <div className="analytics-section">
          <h3>🏆 Most Popular Spots</h3>
          {popularSpots.length > 0 ? (
            <div className="popular-spots-list">
              {popularSpots.map((item, index) => (
                <div key={index} className="popular-spot-item">
                  <div className="spot-rank">#{index + 1}</div>
                  <div className="spot-details">
                    <strong>{item.spot?.spotNumber || 'Unknown'}</strong>
                    <small>{item.spot?.floor}</small>
                  </div>
                  <div className="spot-bookings">
                    <span className="booking-count">{item.count}</span>
                    <small>bookings</small>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-data">No booking data yet</p>
          )}
        </div>

        {/* Recent Bookings */}
        <div className="analytics-section">
          <h3>🕐 Recent Bookings</h3>
          {recentBookings.length > 0 ? (
            <div className="recent-bookings-list">
              {recentBookings.map((booking) => (
                <div key={booking._id} className="recent-booking-item">
                  <div className="booking-spot-info">
                    <strong>{booking.spot?.spotNumber}</strong>
                    <small>{booking.user?.name}</small>
                  </div>
                  <div className="booking-time-info">
                    <span className="booking-amount">₹{booking.totalAmount}</span>
                    <small>{formatDateTime(booking.createdAt)}</small>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-data">No bookings yet</p>
          )}
        </div>
      </div>

      {/* Revenue Chart Placeholder */}
      <div className="analytics-section full-width">
        <h3>📊 Revenue Overview</h3>
        <div className="chart-placeholder">
          <div className="placeholder-content">
            <p>Revenue Trend Chart</p>
            <small>Visual chart showing daily/weekly revenue trends</small>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;