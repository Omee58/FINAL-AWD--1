const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth.middleware');
const { 
  getAdminProfile,
  getVendorRequests,
  acceptVendorRequest,
  getAllUsers,
  getAllBookings
} = require('../controllers/admin.controller');
const { updateProfile } = require('../controllers/auth.controller');

// Middleware to check if user is an admin
const adminMiddleware = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin role required.'
    });
  }
  next();
};

// All routes require authentication
router.use(authMiddleware);

// 1. Get logged-in admin details
router.get('/profile', adminMiddleware, getAdminProfile);

// 2. Get vendor requests (unverified vendors)
router.get('/vendor-requests', adminMiddleware, getVendorRequests);

// 3. Accept vendor request
router.patch('/vendor-requests/:vendorId/accept', adminMiddleware, acceptVendorRequest);

// 4. Get all users (clients and vendors)
router.get('/users', adminMiddleware, getAllUsers);

// 5. Get all bookings (all statuses)
router.get('/bookings', adminMiddleware, getAllBookings);

// 6. Update admin profile (unified endpoint for all users)
router.put('/profile', adminMiddleware, updateProfile);

module.exports = router;
