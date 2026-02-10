const express = require('express');
const router = express.Router();
const QRCode = require('qrcode');
const Booking = require('../models/Booking');
const ParkingSpot = require('../models/ParkingSpot');
const User = require('../models/User');
const { auth, adminAuth } = require('../middleware/auth');
const { sendBookingConfirmation, sendCancellationEmail } = require('../config/emailService');

// @route   POST /api/bookings
// @desc    Create a new booking
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { spotId, vehicleNumber, startTime, endTime } = req.body;

    const spot = await ParkingSpot.findById(spotId);
    if (!spot) {
      return res.status(404).json({ message: 'Parking spot not found' });
    }

    if (spot.status !== 'available') {
      return res.status(400).json({ message: 'Parking spot is not available' });
    }

    const conflictingBooking = await Booking.findOne({
      spot: spotId,
      bookingStatus: 'active',
      $or: [
        { startTime: { $lt: endTime, $gte: startTime } },
        { endTime: { $gt: startTime, $lte: endTime } },
        { startTime: { $lte: startTime }, endTime: { $gte: endTime } }
      ]
    });

    if (conflictingBooking) {
      return res.status(400).json({ message: 'Spot is already booked for this time slot' });
    }

    const start = new Date(startTime);
    const end = new Date(endTime);
    const hours = Math.ceil((end - start) / (1000 * 60 * 60));
    const totalAmount = hours * spot.pricePerHour;

    const booking = new Booking({
      user: req.user.id,
      spot: spotId,
      vehicleNumber,
      startTime,
      endTime,
      totalAmount
    });

    await booking.save();

    const qrData = JSON.stringify({
      bookingId: booking._id,
      spotNumber: spot.spotNumber,
      vehicleNumber: vehicleNumber,
      startTime: startTime,
      endTime: endTime,
    });

    const qrCodeDataURL = await QRCode.toDataURL(qrData);
    booking.qrCode = qrCodeDataURL;
    await booking.save();

    spot.status = 'reserved';
    await spot.save();

    await booking.populate('spot user', 'spotNumber floor section name email');

    // Send confirmation email
    try {
      await sendBookingConfirmation(booking, booking.user);
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError);
    }

    res.status(201).json({
      message: 'Booking created successfully',
      booking
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/bookings
// @desc    Get all bookings (Admin) or user's bookings (User)
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    let bookings;

    if (req.user.role === 'admin') {
      bookings = await Booking.find()
        .populate('user', 'name email phone')
        .populate('spot', 'spotNumber floor section')
        .sort({ createdAt: -1 });
    } else {
      bookings = await Booking.find({ user: req.user.id })
        .populate('spot', 'spotNumber floor section')
        .sort({ createdAt: -1 });
    }

    res.json(bookings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/bookings/:id
// @desc    Get single booking
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate('spot', 'spotNumber floor section type');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(booking);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/bookings/:id/cancel
// @desc    Cancel a booking
// @access  Private
router.put('/:id/cancel', auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (booking.bookingStatus === 'cancelled') {
      return res.status(400).json({ message: 'Booking already cancelled' });
    }

    booking.bookingStatus = 'cancelled';
    await booking.save();

    const spot = await ParkingSpot.findById(booking.spot);
    if (spot && spot.status === 'reserved') {
      spot.status = 'available';
      await spot.save();
    }

    await booking.populate('user spot', 'name email spotNumber floor');

    // Send cancellation email
    try {
      await sendCancellationEmail(booking, booking.user);
    } catch (emailError) {
      console.error('Failed to send cancellation email:', emailError);
    }

    res.json({ message: 'Booking cancelled successfully', booking });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/bookings/:id/complete
// @desc    Mark booking as completed (Admin only)
// @access  Private/Admin
router.put('/:id/complete', auth, adminAuth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    booking.bookingStatus = 'completed';
    await booking.save();

    const spot = await ParkingSpot.findById(booking.spot);
    if (spot) {
      spot.status = 'available';
      await spot.save();
    }

    res.json({ message: 'Booking marked as completed', booking });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;