import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getCurrentUser: () => api.get('/auth/me'),
};

// Parking Spots APIs
export const spotsAPI = {
  getAllSpots: (filters) => api.get('/spots', { params: filters }),
  getSpotById: (id) => api.get(`/spots/${id}`),
  createSpot: (spotData) => api.post('/spots', spotData),
  updateSpot: (id, spotData) => api.put(`/spots/${id}`, spotData),
  deleteSpot: (id) => api.delete(`/spots/${id}`),
};

// Bookings APIs
export const bookingsAPI = {
  createBooking: (bookingData) => api.post('/bookings', bookingData),
  getAllBookings: () => api.get('/bookings'),
  getBookingById: (id) => api.get(`/bookings/${id}`),
  cancelBooking: (id) => api.put(`/bookings/${id}/cancel`),
  completeBooking: (id) => api.put(`/bookings/${id}/complete`),
};

export default api;