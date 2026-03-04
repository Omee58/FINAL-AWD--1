const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db.config');
require('dotenv').config();

const authRoutes = require('./routes/auth.routes');
const clientRoutes = require('./routes/client.routes');
const vendorRoutes = require('./routes/vendor.routes');
const adminRoutes = require('./routes/admin.routes');
const reviewRoutes = require('./routes/review.routes');

const app = express();

app.use(cors());
app.use(express.json());

// Serve uploaded images statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

connectDB();

app.get('/status', (req, res) => {
  res.json({ success: true, message: 'ShadiSeva Backend is running' });
});

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to ShadiSeva',
    endpoints: { auth: '/api/auth', client: '/api/client', vendor: '/api/vendor', admin: '/api/admin', reviews: '/api/reviews' }
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/client', clientRoutes);
app.use('/api/vendor', vendorRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/reviews', reviewRoutes);

app.use('*', (req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

app.use((err, req, res, next) => {
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    return res.status(400).json({ success: false, message });
  }
  if (err.code === 11000) {
    return res.status(400).json({ success: false, message: 'Email already exists' });
  }
  res.status(500).json({ success: false, message: 'Server Error' });
});

module.exports = app;
