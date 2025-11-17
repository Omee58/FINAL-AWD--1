const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth.middleware');
const { 
  getClientBookings, 
  cancelBooking, 
  getAllServices, 
  bookService 
} = require('../controllers/client.controller');
const { getMe } = require('../controllers/auth.controller');
// const { updateProfile } = require('../controllers/auth.controller');

// All routes require authentication
router.use(authMiddleware);

// 1. Get logged-in user profile
router.get('/profile', getMe);

// 2. Get all bookings for logged-in client
router.get('/bookings', getClientBookings);

// 3. Cancel booking (only for pending status)
router.patch('/bookings/:bookingId/cancel', cancelBooking);

// 4. Get all services with filtering
router.get('/services', getAllServices);

// 5. Book a service
router.post('/book-service', bookService);

// 6. Update user profile (unified endpoint - redirects to /api/auth/profile)
// Note: Profile updates are now handled by the unified endpoint at /api/auth/profile

module.exports = router;
