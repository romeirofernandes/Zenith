const User = require('../models/User');

const authController = {
  // Verify token and create/update user
  verifyUser: async (req, res) => {
    try {
      const firebaseUser = req.user;
      
      // Create or update user in database
      const user = await User.createFromFirebase(firebaseUser);
      
      res.json({
        success: true,
        user: {
          id: user._id,
          firebaseUid: user.firebaseUid,
          email: user.email,
          displayName: user.displayName,
          role: user.role,
          isActive: user.isActive,
          lastLogin: user.lastLogin
        }
      });
    } catch (error) {
      console.error('User verification error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // Get user profile
  getProfile: async (req, res) => {
    try {
      const user = await User.findByFirebaseUid(req.user.uid);
      
      if (!user) {
        return res.status(404).json({ 
          success: false, 
          message: 'User not found in database' 
        });
      }

      res.json({
        success: true,
        user: {
          id: user._id,
          firebaseUid: user.firebaseUid,
          email: user.email,
          displayName: user.displayName,
          phoneNumber: user.phoneNumber,
          role: user.role,
          isActive: user.isActive,
          profile: user.profile,
          preferences: user.preferences,
          lastLogin: user.lastLogin,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          fullName: user.getFullName()
        }
      });
    } catch (error) {
      console.error('Profile fetch error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // Update user profile
  updateProfile: async (req, res) => {
    try {
      const { displayName, profile, preferences, phoneNumber } = req.body;
      
      const user = await User.findOneAndUpdate(
        { firebaseUid: req.user.uid },
        { 
          displayName,
          phoneNumber,
          profile,
          preferences,
          lastLogin: new Date()
        },
        { new: true }
      );

      if (!user) {
        return res.status(404).json({ 
          success: false, 
          message: 'User not found' 
        });
      }

      res.json({
        success: true,
        message: 'Profile updated successfully',
        user: {
          id: user._id,
          email: user.email,
          displayName: user.displayName,
          phoneNumber: user.phoneNumber,
          profile: user.profile,
          preferences: user.preferences,
          fullName: user.getFullName()
        }
      });
    } catch (error) {
      console.error('Profile update error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // Get all users (admin only)
  getAllUsers: async (req, res) => {
    try {
      const currentUser = await User.findByFirebaseUid(req.user.uid);
      
      if (!currentUser || currentUser.role !== 'admin') {
        return res.status(403).json({ 
          success: false, 
          message: 'Access denied. Admin role required.' 
        });
      }

      const users = await User.find({ isActive: true })
        .select('-__v')
        .sort({ createdAt: -1 });

      res.json({
        success: true,
        count: users.length,
        users: users.map(user => ({
          id: user._id,
          email: user.email,
          displayName: user.displayName,
          role: user.role,
          isActive: user.isActive,
          lastLogin: user.lastLogin,
          createdAt: user.createdAt,
          fullName: user.getFullName()
        }))
      });
    } catch (error) {
      console.error('Users fetch error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // Delete user account
  deleteAccount: async (req, res) => {
    try {
      const user = await User.findOneAndUpdate(
        { firebaseUid: req.user.uid },
        { isActive: false },
        { new: true }
      );

      if (!user) {
        return res.status(404).json({ 
          success: false, 
          message: 'User not found' 
        });
      }

      res.json({
        success: true,
        message: 'Account deactivated successfully'
      });
    } catch (error) {
      console.error('Account deletion error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }


};

module.exports = authController;