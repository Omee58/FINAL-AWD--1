const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'No token provided' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid token' 
      });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ 
      success: false, 
      message: 'Invalid token' 
    });
  }
};

const updatePasswordMiddleware = async (req, res, next) => {
  const { password, old_password } = req.body;

  //check if user is verified
  if (!req.user.verified) {
    return res.status(403).json({
      success: false,
      message: "Access denied. Vendor account must be verified by admin before updating password.",
    });
  }
  
  // validate the request body
  if (!password || !old_password) {
    return res.status(400).json({
      success: false,
      message: "All fields are required",
    });
  }
  next();
};

module.exports = { authMiddleware, updatePasswordMiddleware };
