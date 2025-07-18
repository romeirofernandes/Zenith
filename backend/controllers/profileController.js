const User = require("../models/User");

const profileController = {
  // Get user profile
  async getProfile(req, res) {
    try {
      const user = await User.findByFirebaseUid(req.user.uid);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error) {
      console.error("Error fetching profile:", error);
      res.status(500).json({ error: "Failed to fetch profile" });
    }
  },

  // Complete/Update profile
  async completeProfile(req, res) {
    try {
      const { uid } = req.user;
      const profileData = req.body;

      // Find user by Firebase UID
      const user = await User.findByFirebaseUid(uid);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Update user profile with the provided data
      if (profileData.profile) {
        user.profile = { ...user.profile, ...profileData.profile };
      }

      if (profileData.resume) {
        user.resume = { ...user.resume, ...profileData.resume };
      }

      // Save the updated user
      await user.save();

      res.json({
        success: true,
        message: "Profile updated successfully",
        user: user,
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ error: "Failed to update profile" });
    }
  },
};

module.exports = profileController;
