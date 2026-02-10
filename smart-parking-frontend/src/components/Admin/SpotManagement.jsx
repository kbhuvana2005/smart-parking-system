import React, { useState, useEffect } from 'react';
import { spotsAPI } from '../../services/api';
import './Admin.css';

const SpotManagement = ({ onSuccess }) => {
  const [spots, setSpots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSpot, setEditingSpot] = useState(null);
  const [formData, setFormData] = useState({
    spotNumber: '',
    floor: 'Ground Floor',
    section: 'A',
    type: 'regular',
    pricePerHour: 50,
    status: 'available'
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchSpots();
  }, []);

  const fetchSpots = async () => {
    try {
      setLoading(true);
      const response = await spotsAPI.getAllSpots({});
      setSpots(response.data);
    } catch (err) {
      console.error('Failed to fetch spots:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.spotNumber.trim()) {
      newErrors.spotNumber = 'Spot number is required';
    }
    if (!formData.floor) {
      newErrors.floor = 'Floor is required';
    }
    if (!formData.section.trim()) {
      newErrors.section = 'Section is required';
    }
    if (formData.pricePerHour <= 0) {
      newErrors.pricePerHour = 'Price must be greater than 0';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      if (editingSpot) {
        await spotsAPI.updateSpot(editingSpot._id, formData);
        onSuccess('Parking spot updated successfully!');
      } else {
        await spotsAPI.createSpot(formData);
        onSuccess('Parking spot created successfully!');
      }
      resetForm();
      fetchSpots();
    } catch (err) {
      setErrors({
        submit: err.response?.data?.message || 'Failed to save spot'
      });
    }
  };

  const handleEdit = (spot) => {
    setEditingSpot(spot);
    setFormData({
      spotNumber: spot.spotNumber,
      floor: spot.floor,
      section: spot.section,
      type: spot.type,
      pricePerHour: spot.pricePerHour,
      status: spot.status
    });
    setShowForm(true);
  };

  const handleDelete = async (spotId) => {
    if (!window.confirm('Are you sure you want to delete this parking spot?')) {
      return;
    }

    try {
      await spotsAPI.deleteSpot(spotId);
      onSuccess('Parking spot deleted successfully!');
      fetchSpots();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete spot');
    }
  };

  const resetForm = () => {
    setFormData({
      spotNumber: '',
      floor: 'Ground Floor',
      section: 'A',
      type: 'regular',
      pricePerHour: 50,
      status: 'available'
    });
    setEditingSpot(null);
    setShowForm(false);
    setErrors({});
  };

  const getStatusColor = (status) => {
    const colors = {
      available: '#10b981',
      occupied: '#ef4444',
      reserved: '#f59e0b',
      maintenance: '#6b7280'
    };
    return colors[status] || '#6b7280';
  };

  if (loading) {
    return <div className="loading">Loading spots...</div>;
  }

  return (
    <div className="spot-management">
      <div className="management-header">
        <h3>Parking Spots ({spots.length})</h3>
        <button 
          className="btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Cancel' : '+ Add New Spot'}
        </button>
      </div>

      {showForm && (
        <div className="spot-form-container">
          <h4>{editingSpot ? 'Edit Parking Spot' : 'Add New Parking Spot'}</h4>
          
          {errors.submit && (
            <div className="error-message">{errors.submit}</div>
          )}

          <form onSubmit={handleSubmit} className="spot-form">
            <div className="form-row">
              <div className="form-group">
                <label>Spot Number *</label>
                <input
                  type="text"
                  name="spotNumber"
                  value={formData.spotNumber}
                  onChange={handleChange}
                  placeholder="A-101"
                  disabled={!!editingSpot}
                  className={errors.spotNumber ? 'input-error' : ''}
                />
                {errors.spotNumber && (
                  <span className="field-error">{errors.spotNumber}</span>
                )}
              </div>

              <div className="form-group">
                <label>Floor *</label>
                <select
                  name="floor"
                  value={formData.floor}
                  onChange={handleChange}
                >
                  <option value="Ground Floor">Ground Floor</option>
                  <option value="First Floor">First Floor</option>
                  <option value="Second Floor">Second Floor</option>
                  <option value="Third Floor">Third Floor</option>
                </select>
              </div>

              <div className="form-group">
                <label>Section *</label>
                <input
                  type="text"
                  name="section"
                  value={formData.section}
                  onChange={handleChange}
                  placeholder="A"
                  maxLength="2"
                  className={errors.section ? 'input-error' : ''}
                />
                {errors.section && (
                  <span className="field-error">{errors.section}</span>
                )}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Type *</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                >
                  <option value="regular">Regular</option>
                  <option value="disabled">Disabled</option>
                  <option value="ev-charging">EV Charging</option>
                  <option value="vip">VIP</option>
                </select>
              </div>

              <div className="form-group">
                <label>Price per Hour (₹) *</label>
                <input
                  type="number"
                  name="pricePerHour"
                  value={formData.pricePerHour}
                  onChange={handleChange}
                  min="1"
                  className={errors.pricePerHour ? 'input-error' : ''}
                />
                {errors.pricePerHour && (
                  <span className="field-error">{errors.pricePerHour}</span>
                )}
              </div>

              <div className="form-group">
                <label>Status *</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option value="available">Available</option>
                  <option value="occupied">Occupied</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>
            </div>

            <div className="form-actions">
              <button type="button" onClick={resetForm} className="btn-secondary">
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                {editingSpot ? 'Update Spot' : 'Create Spot'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="spots-table">
        <table>
          <thead>
            <tr>
              <th>Spot Number</th>
              <th>Floor</th>
              <th>Section</th>
              <th>Type</th>
              <th>Price/Hour</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {spots.map((spot) => (
              <tr key={spot._id}>
                <td><strong>{spot.spotNumber}</strong></td>
                <td>{spot.floor}</td>
                <td>{spot.section}</td>
                <td className="capitalize">{spot.type}</td>
                <td>₹{spot.pricePerHour}</td>
                <td>
                  <span 
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(spot.status) }}
                  >
                    {spot.status}
                  </span>
                </td>
                <td className="actions">
                  <button 
                    className="btn-edit"
                    onClick={() => handleEdit(spot)}
                  >
                    Edit
                  </button>
                  <button 
                    className="btn-delete"
                    onClick={() => handleDelete(spot._id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SpotManagement;