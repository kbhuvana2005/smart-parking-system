const cron = require('node-cron');
const Booking = require('../models/Booking');
const ParkingSpot = require('../models/ParkingSpot');

// Start all cron jobs
const startCronJobs = () => {
  
  // Job 1: Auto-complete expired bookings (runs every minute)
  cron.schedule('* * * * *', async () => {
    try {
      const now = new Date();
      
      // Find bookings that have passed their end time
      const expiredBookings = await Booking.find({
        bookingStatus: 'active',
        endTime: { $lt: now }
      });

      if (expiredBookings.length > 0) {
        console.log(`🔄 Found ${expiredBookings.length} expired booking(s)`);
      }

      for (const booking of expiredBookings) {
        // Mark booking as completed
        booking.bookingStatus = 'completed';
        await booking.save();

        // Make spot available again
        await ParkingSpot.findByIdAndUpdate(booking.spot, {
          status: 'available'
        });

        console.log(`✅ Auto-completed booking ${booking._id} - Spot now available`);
      }
    } catch (error) {
      console.error('❌ Cron job error (expired bookings):', error.message);
    }
  });

  // Job 2: Check for no-shows (runs every minute)
  cron.schedule('* * * * *', async () => {
    try {
      const now = new Date();
      const gracePeriod = 15 * 60 * 1000; // 15 minutes in milliseconds
      const gracePeriodTime = new Date(now - gracePeriod);
      
      // Find bookings where start time + grace period has passed
      // but booking is still active and spot is still reserved (user didn't arrive)
      const potentialNoShows = await Booking.find({
        bookingStatus: 'active',
        startTime: { $lt: gracePeriodTime },
        endTime: { $gt: now } // Booking hasn't ended yet
      }).populate('spot');

      for (const booking of potentialNoShows) {
        // If spot is still "reserved", user didn't show up
        if (booking.spot && booking.spot.status === 'reserved') {
          booking.bookingStatus = 'no-show';
          await booking.save();

          // Make spot available
          await ParkingSpot.findByIdAndUpdate(booking.spot._id, {
            status: 'available'
          });

          console.log(`⚠️ No-show detected for booking ${booking._id} - Spot released`);
        }
      }
    } catch (error) {
      console.error('❌ Cron job error (no-shows):', error.message);
    }
  });

  console.log('⏰ Cron jobs started:');
  console.log('   - Checking for expired bookings every minute');
  console.log('   - Checking for no-shows every minute (15 min grace period)');
};

module.exports = { startCronJobs };