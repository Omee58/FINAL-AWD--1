const mongoose = require('mongoose');

const SubscriptionPlanSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  interval: { type: String, required: true }, // e.g., 'monthly'
  description: { type: String },
  razorpayPlanId: { type: String, required: true },
});

module.exports = mongoose.model('SubscriptionPlan', SubscriptionPlanSchema);