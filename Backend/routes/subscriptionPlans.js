const express = require('express');
const router = express.Router();
// const { } = require('../middleware/auth');
const Razorpay = require('razorpay');
const SubscriptionPlan = require('../models/SubscriptionPlan');

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

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
router.use(adminMiddleware);

// @route   POST /api/subscription-plans
// @desc    Admin creates a new subscription plan
// @access  Admin
router.post('/',  async (req, res) => {
  try {
    const { name, price, interval, description } = req.body;

    // Create plan in Razorpay
    const razorpayPlan = await razorpay.plans.create({
      period: interval, // 'monthly', 'yearly', etc.
      interval: 1,
      item: {
        name,
        amount: price * 100, // in paise
        currency: 'INR',
        description,
      },
    });

    // Save plan in local DB
    const plan = new SubscriptionPlan({
      name,
      price,
      interval,
      description,
      razorpayPlanId: razorpayPlan.id,
    });
    await plan.save();

    res.status(201).json({ message: 'Plan created', plan });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;