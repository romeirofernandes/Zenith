const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyFirebaseToken } = require('../middleware/auth');

// Verify token and create/update user
router.post('/verify', verifyFirebaseToken, authController.verifyUser);

// Get user profile
router.get('/profile', verifyFirebaseToken, authController.getProfile);

// Update user profile
router.put('/profile', verifyFirebaseToken, authController.updateProfile);

// Get all users (admin only)
router.get('/users', verifyFirebaseToken, authController.getAllUsers);

// Delete user account
router.delete('/account', verifyFirebaseToken, authController.deleteAccount);

// Get current user
router.get('/current', verifyFirebaseToken, authController.getCurrentUser);

module.exports = router;