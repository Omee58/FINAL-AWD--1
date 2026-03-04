const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');
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

const vendorMiddleware = (req, res, next) => {
  if (req.user.role !== 'vendor') {
    return res.status(403).json({ success: false, message: 'Access denied. Vendor role required.' });
  }
  next();
};

router.use(authMiddleware);

router.get('/profile', vendorMiddleware, getVendorProfile);
router.put('/profile', vendorMiddleware, updateProfile);
router.get('/booking-requests', vendorMiddleware, getBookingRequests);
router.get('/booked-services', vendorMiddleware, getBookedServices);
router.post('/services', vendorMiddleware, upload.array('images', 5), addService);
router.get('/my-services', vendorMiddleware, getMyServices);
router.patch('/bookings/:bookingId/status', vendorMiddleware, changeBookingStatus);
router.put('/services/:serviceId', vendorMiddleware, upload.array('images', 5), updateService);
router.get('/services/:serviceId', getServiceById);
router.delete('/services/:serviceId', vendorMiddleware, deleteService);

module.exports = router;
