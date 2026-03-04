const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth.middleware');
const {
  getAdminProfile,
  getVendorRequests,
  acceptVendorRequest,
  rejectVendorRequest,
  getAllUsers,
  getAllBookings,
  getStats
} = require('../controllers/admin.controller');
const { updateProfile } = require('../controllers/auth.controller');

const adminMiddleware = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Access denied. Admin role required.' });
  }
  next();
};

router.use(authMiddleware);

router.get('/profile', adminMiddleware, getAdminProfile);
router.put('/profile', adminMiddleware, updateProfile);
router.get('/vendor-requests', adminMiddleware, getVendorRequests);
router.patch('/vendor-requests/:vendorId/accept', adminMiddleware, acceptVendorRequest);
router.patch('/vendor-requests/:vendorId/reject', adminMiddleware, rejectVendorRequest);
router.get('/users', adminMiddleware, getAllUsers);
router.get('/bookings', adminMiddleware, getAllBookings);
router.get('/stats', adminMiddleware, getStats);

module.exports = router;
