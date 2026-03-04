const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth.middleware');
const { addReview, getServiceReviews, getReviewableBookings } = require('../controllers/review.controller');

router.use(authMiddleware);

router.post('/:serviceId', addReview);
router.get('/my-reviewable', getReviewableBookings);
router.get('/:serviceId', getServiceReviews);

module.exports = router;
