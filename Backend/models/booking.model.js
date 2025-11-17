const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: true
  },
  booking_date: {
    type: Date,
    required: true,
    validate: {
      validator: function(date) {
        // Only validate if it's a valid date
        if (!date || isNaN(date.getTime())) {
          return false;
        }
        // Check if the date is in the future (comparing with start of today)
        const today = new Date();
        const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        return date > todayStart;
      },
      message: 'Booking date must be a valid date in the future'
    }
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'pending'
  },
  total_amount: {
    type: Number,
    min: 0
  }
}, {
  timestamps: true
});

// Prevent booking where client and vendor are the same
bookingSchema.pre('save', function(next) {
  if (this.client.toString() === this.vendor.toString()) {
    return next(new Error('Client and vendor cannot be the same user'));
  }
  next();
});

module.exports = mongoose.model('Booking', bookingSchema);
