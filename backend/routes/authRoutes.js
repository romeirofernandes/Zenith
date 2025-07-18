const express = require('express');
const router = express.Router();
const { verifyFirebaseToken } = require('../middleware/auth');
const authController = require('../controllers/authController');

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

module.exports = router;