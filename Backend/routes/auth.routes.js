const express = require('express');
const { register, login, getMe, updateProfile, updatePassword } = require('../controllers/auth.controller');
const { authMiddleware, updatePasswordMiddleware } = require('../middleware/auth.middleware');

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/me', authMiddleware, getMe);
router.put('/profile', authMiddleware, updateProfile);
router.put('/password', authMiddleware, updatePasswordMiddleware, updatePassword);


module.exports = router;
