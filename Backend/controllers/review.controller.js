const Review = require('../models/review.model');
const Booking = require('../models/booking.model');
const Service = require('../models/service.model');

// POST /api/reviews/:serviceId
const addReview = async (req, res) => {
  try {
    const { serviceId } = req.params;
    const { rating, comment, booking_id } = req.body;

    if (!rating || !booking_id) {
      return res.status(400).json({ success: false, message: 'Rating and booking_id are required' });
    }

    // Verify the booking exists, belongs to this client, is for this service, and is completed
    const booking = await Booking.findOne({
      _id: booking_id,
      client: req.user._id,
      service: serviceId,
      status: 'completed'
    });

    if (!booking) {
      return res.status(400).json({
        success: false,
        message: 'You can only review services from completed bookings'
      });
    }

    // Check if already reviewed this booking
    const existing = await Review.findOne({ booking: booking_id });
    if (existing) {
      return res.status(400).json({ success: false, message: 'You have already reviewed this booking' });
    }

    const review = await Review.create({
      client: req.user._id,
      service: serviceId,
      vendor: booking.vendor,
      booking: booking_id,
      rating,
      comment
    });

    // Recalculate avg_rating and review_count on the service
    const allReviews = await Review.find({ service: serviceId });
    const avg = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

    await Service.findByIdAndUpdate(serviceId, {
      avg_rating: Math.round(avg * 10) / 10,
      review_count: allReviews.length
    });

    res.status(201).json({ success: true, message: 'Review submitted', data: review });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/reviews/:serviceId
const getServiceReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ service: req.params.serviceId })
      .populate('client', 'full_name')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: reviews });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/reviews/my-reviews  — bookings eligible for review by this client
const getReviewableBookings = async (req, res) => {
  try {
    const completedBookings = await Booking.find({
      client: req.user._id,
      status: 'completed'
    }).populate('service', 'title').populate('vendor', 'full_name');

    // Filter out bookings that already have a review
    const reviewed = await Review.find({ client: req.user._id }).select('booking');
    const reviewedIds = reviewed.map(r => r.booking.toString());

    const reviewable = completedBookings.filter(
      b => !reviewedIds.includes(b._id.toString())
    );

    res.json({ success: true, data: reviewable });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { addReview, getServiceReviews, getReviewableBookings };
