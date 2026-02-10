const mongoose = require('mongoose');

const ParkingSpotSchema = new mongoose.Schema({
  spotNumber: {
    type: String,
    required: true,
    unique: true
  },
  floor: {
    type: String,
    required: true
  },
  section: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['regular', 'disabled', 'ev-charging', 'vip'],
    default: 'regular'
  },
  status: {
    type: String,
    enum: ['available', 'occupied', 'reserved', 'maintenance'],
    default: 'available'
  },
  pricePerHour: {
    type: Number,
    required: true,
    default: 50
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('ParkingSpot', ParkingSpotSchema);