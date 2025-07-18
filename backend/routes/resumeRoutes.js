const express = require('express');
const router = express.Router();
const { verifyFirebaseToken } = require('../middleware/auth');
const resumeController = require('../controllers/resumeController');

// POST /api/match-resume
router.post('/match-resume',verifyFirebaseToken, resumeController.matchResumeWithJobs);

module.exports = router;
