# Smart Parking Reservation System

A web-based smart parking reservation system for hospitals and malls.

## Features

### User Features
- Browse available parking spots
- Book parking spots with date/time selection
- QR code generation for parking entry
- View and manage bookings
- Cancel bookings

### Admin Features
- Real-time analytics dashboard
- Manage parking spots (Add/Edit/Delete)
- View all bookings
- Mark bookings as completed
- Track revenue and occupancy

## Technology Stack

**Frontend:**
- React.js
- CSS3
- Axios

**Backend:**
- Node.js
- Express.js
- MongoDB
- JWT Authentication
- Nodemailer
- QR Code Generation
- Node-Cron (Auto-expiry)

## Installation & Setup

### Prerequisites
- Node.js installed
- MongoDB installed (or MongoDB Atlas account)

### Backend Setup

1. Navigate to backend folder:
```bash
   cd smart-parking-backend
```

2. Install dependencies:
```bash
   npm install
```

3. Create `.env` file:
```
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   EMAIL_USER=your_email
   EMAIL_PASS=your_email_password
```

4. Start server:
```bash
   npm run dev
```

### Frontend Setup

1. Navigate to frontend folder:
```bash
   cd smart-parking-frontend
```

2. Install dependencies:
```bash
   npm install
```

3. Start application:
```bash
   npm start
```

The application will open at `http://localhost:3000`

## Default Credentials

Create admin user through registration with role: "admin"

## Project Structure
```
smart-parking-system/
├── smart-parking-backend/
│   ├── config/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── utils/
│   └── server.js
└── smart-parking-frontend/
    ├── src/
    │   ├── components/
    │   ├── context/
    │   └── services/
    └── public/
```

