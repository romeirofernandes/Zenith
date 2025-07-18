const express = require("express");
const router = express.Router();
const profileController = require("../controllers/profileController");
const { verifyFirebaseToken } = require('../middleware/auth');

router.get("/profile", verifyFirebaseToken, profileController.getProfile);
router.post(
  "/profile-completion",
  verifyFirebaseToken,
  profileController.completeProfile
);

router.get("/analytics", verifyFirebaseToken, profileController.getProfileAnalytics);
// --- Add this route for resume ---
router.get("/resume", verifyFirebaseToken, profileController.getResume);

module.exports = router;
