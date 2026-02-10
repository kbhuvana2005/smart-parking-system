import React, { useState, useEffect } from 'react';
import { spotsAPI } from '../../services/api';
import './User.css';

const ParkingGrid = ({ onSpotSelect }) => {
  const [spots, setSpots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState({
    floor: '',
    type: '',
    status: 'available'
  });

  useEffect(() => {
    fetchSpots();
  }, [filter]);

  const fetchSpots = async () => {
    try {
      setLoading(true);
      const response = await spotsAPI.getAllSpots(filter);
      setSpots(response.data);
      setError('');
    } catch (err) {
      setError('Failed to load parking spots');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'available':
        return '#10b981'; // Green
      case 'occupied':
        return '#ef4444'; // Red
      case 'reserved':
        return '#f59e0b'; // Yellow
      case 'maintenance':
        return '#6b7280'; // Gray
      default:
        return '#9ca3af';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'disabled':
        return '♿';
      case 'ev-charging':
        return '⚡';
      case 'vip':
        return '⭐';
      default:
        return '🚗';
    }
  };

  // Group spots by floor
  const spotsByFloor = spots.reduce((acc, spot) => {
    if (!acc[spot.floor]) {
      acc[spot.floor] = [];
    }
    acc[spot.floor].push(spot);
    return acc;
  }, {});

  if (loading) {
    return <div className="loading">Loading parking spots...</div>;
  }

  if (error) {
    return <div className="error-box">{error}</div>;
  }

  return (
    <div className="parking-grid-container">
      <div className="filter-section">
        <h3>Filter Parking Spots</h3>
        <div className="filters">
          <select
            value={filter.floor}
            onChange={(e) => setFilter({ ...filter, floor: e.target.value })}
          >
            <option value="">All Floors</option>
            <option value="Ground Floor">Ground Floor</option>
            <option value="First Floor">First Floor</option>
            <option value="Second Floor">Second Floor</option>
          </select>

          <select
            value={filter.type}
            onChange={(e) => setFilter({ ...filter, type: e.target.value })}
          >
            <option value="">All Types</option>
            <option value="regular">Regular</option>
            <option value="disabled">Disabled</option>
            <option value="ev-charging">EV Charging</option>
            <option value="vip">VIP</option>
          </select>

          <select
            value={filter.status}
            onChange={(e) => setFilter({ ...filter, status: e.target.value })}
          >
            <option value="">All Status</option>
            <option value="available">Available</option>
            <option value="occupied">Occupied</option>
            <option value="reserved">Reserved</option>
          </select>
        </div>
      </div>

      <div className="legend">
        <div className="legend-item">
          <span className="legend-color" style={{ backgroundColor: '#10b981' }}></span>
          Available
        </div>
        <div className="legend-item">
          <span className="legend-color" style={{ backgroundColor: '#f59e0b' }}></span>
          Reserved
        </div>
        <div className="legend-item">
          <span className="legend-color" style={{ backgroundColor: '#ef4444' }}></span>
          Occupied
        </div>
        <div className="legend-item">
          <span className="legend-color" style={{ backgroundColor: '#6b7280' }}></span>
          Maintenance
        </div>
      </div>

      {Object.keys(spotsByFloor).length === 0 ? (
        <div className="no-spots">No parking spots found with current filters</div>
      ) : (
        Object.keys(spotsByFloor).map((floor) => (
          <div key={floor} className="floor-section">
            <h3 className="floor-title">{floor}</h3>
            <div className="spots-grid">
              {spotsByFloor[floor].map((spot) => (
                <div
                  key={spot._id}
                  className={`spot-card ${spot.status === 'available' ? 'clickable' : 'disabled'}`}
                  style={{ borderColor: getStatusColor(spot.status) }}
                  onClick={() => spot.status === 'available' && onSpotSelect(spot)}
                >
                  <div className="spot-icon">{getTypeIcon(spot.type)}</div>
                  <div className="spot-number">{spot.spotNumber}</div>
                  <div className="spot-type">{spot.type}</div>
                  <div className="spot-price">₹{spot.pricePerHour}/hr</div>
                  <div 
                    className="spot-status"
                    style={{ color: getStatusColor(spot.status) }}
                  >
                    {spot.status}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default ParkingGrid;