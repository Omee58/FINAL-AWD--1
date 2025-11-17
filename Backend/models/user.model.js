const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  full_name: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/.+@.+\..+/, 'Invalid email address']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
    match: [/^\d{10,15}$/, 'Invalid phone number']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
    // match: [/(?=.*[A-Z])(?=.*\d).{6,}/, 'Password must contain at least one uppercase letter and one number']
  },
  role: {
    type: String,
    enum: {
      values: ['client', 'vendor', 'admin'],
      message: 'Invalid role'
    },
    default: 'client',
    lowercase: true,
    trim: true
  },
  verified: {
    type: Boolean,
    default: function() {
      // Only vendors need verification, clients and admins are verified by default
      return this.role !== 'vendor';
    }
  }
}, {
  timestamps: true
});


// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Compare raw password with hashed password
userSchema.methods.comparePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', userSchema);
