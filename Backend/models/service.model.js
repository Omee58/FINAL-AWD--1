const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Service title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Service description is required'],
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  price: {
    type: Number,
    required: [true, 'Service price is required'],
    min: [0, 'Price cannot be negative']
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
    category: {
    type: String,
    required: [true, 'Service category is required'],
    lowercase: true
  },
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Vendor is required']
  },
  location: {
    type: String,
    required: [true, 'Service location is required'],
    trim: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Service', serviceSchema);