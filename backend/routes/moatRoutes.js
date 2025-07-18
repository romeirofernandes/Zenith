const express = require("express");
const router = express.Router();
const { verifyFirebaseToken } = require("../middleware/auth");
const moatController = require("../controllers/moatController");

router.post(
  "/analyze",
  moatController.generateJobReadinessAnalysis
);

module.exports = router;
