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

module.exports = router;
