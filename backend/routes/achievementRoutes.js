const express = require("express");
const router = express.Router();
const { verifyFirebaseToken } = require("../middleware/auth");
const achievementController = require("../controllers/achievementController");

router.get("/", verifyFirebaseToken, achievementController.getAchievements);

module.exports = router;