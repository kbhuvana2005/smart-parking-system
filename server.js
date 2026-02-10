const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const { startCronJobs } = require('./utils/cronJobs');

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();

// Connect to database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/spots', require('./routes/spots'));
app.use('/api/bookings', require('./routes/bookings'));

// Test route
app.get('/', (req, res) => {
  res.send('Smart Parking API is running');
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  startCronJobs();
});