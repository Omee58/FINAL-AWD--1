const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth.middleware');
const { 
  getVendorProfile,
  getBookingRequests,
  getBookedServices,
  addService,
  getMyServices,
  changeBookingStatus,
  updateService,
  getServiceById,
  deleteService
} = require('../controllers/vendor.controller');
const { updateProfile } = require('../controllers/auth.controller');

// Middleware to check if user is a vendor
const vendorMiddleware = (req, res, next) => {
  if (req.user.role !== 'vendor') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Vendor role required.'
    });
  }
  next();
};

// All routes require authentication
router.use(authMiddleware);

// 1. Get logged-in vendor details
router.get('/profile', vendorMiddleware, getVendorProfile);

// 2. Get booking requests (pending bookings for vendor)
router.get('/booking-requests', vendorMiddleware, getBookingRequests);

// 3. Get booked services (current/future bookings)
router.get('/booked-services', vendorMiddleware, getBookedServices);

// 4. Add new service
router.post('/services', vendorMiddleware, addService);

// 5. Get vendor's services
router.get('/my-services', vendorMiddleware, getMyServices);

// 6. Change booking status
router.patch('/bookings/:bookingId/status', vendorMiddleware, changeBookingStatus);

// 7. Update service
router.put('/services/:serviceId', vendorMiddleware, updateService);

// 8. Get individual service by ID (public - no vendor middleware needed)
router.get('/services/:serviceId', getServiceById);

// 9. Delete service
router.delete('/services/:serviceId', vendorMiddleware, deleteService);

// 10. Update vendor profile (unified for all users)
router.put('/profile', vendorMiddleware, updateProfile);

module.exports = router;
