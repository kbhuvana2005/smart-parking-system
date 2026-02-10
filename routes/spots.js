const express = require('express');
const router = express.Router();
const ParkingSpot = require('../models/ParkingSpot');
const { auth, adminAuth } = require('../middleware/auth');

// @route   GET /api/spots
// @desc    Get all parking spots
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { status, type, floor } = req.query;
    let filter = {};

    if (status) filter.status = status;
    if (type) filter.type = type;
    if (floor) filter.floor = floor;

    const spots = await ParkingSpot.find(filter).sort({ spotNumber: 1 });
    res.json(spots);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/spots/:id
// @desc    Get single parking spot
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const spot = await ParkingSpot.findById(req.params.id);
    if (!spot) {
      return res.status(404).json({ message: 'Parking spot not found' });
    }
    res.json(spot);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/spots
// @desc    Create new parking spot (Admin only)
// @access  Private/Admin
router.post('/', auth, adminAuth, async (req, res) => {
  try {
    const { spotNumber, floor, section, type, pricePerHour } = req.body;

    // Check if spot already exists
    let spot = await ParkingSpot.findOne({ spotNumber });
    if (spot) {
      return res.status(400).json({ message: 'Spot number already exists' });
    }

    spot = new ParkingSpot({
      spotNumber,
      floor,
      section,
      type,
      pricePerHour
    });

    await spot.save();
    res.status(201).json({ message: 'Parking spot created successfully', spot });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/spots/:id
// @desc    Update parking spot (Admin only)
// @access  Private/Admin
router.put('/:id', auth, adminAuth, async (req, res) => {
  try {
    const { status, type, pricePerHour, floor, section } = req.body;

    let spot = await ParkingSpot.findById(req.params.id);
    if (!spot) {
      return res.status(404).json({ message: 'Parking spot not found' });
    }

    // Update fields
    if (status) spot.status = status;
    if (type) spot.type = type;
    if (pricePerHour) spot.pricePerHour = pricePerHour;
    if (floor) spot.floor = floor;
    if (section) spot.section = section;

    await spot.save();
    res.json({ message: 'Parking spot updated successfully', spot });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   DELETE /api/spots/:id
// @desc    Delete parking spot (Admin only)
// @access  Private/Admin
router.delete('/:id', auth, adminAuth, async (req, res) => {
  try {
    const spot = await ParkingSpot.findById(req.params.id);
    if (!spot) {
      return res.status(404).json({ message: 'Parking spot not found' });
    }

    await spot.deleteOne();
    res.json({ message: 'Parking spot deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;