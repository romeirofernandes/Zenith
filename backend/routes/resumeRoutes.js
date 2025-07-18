const express = require('express');
const router = express.Router();
const resumeController = require('../controllers/resumeController');

// POST /api/match-resume
router.post('/match-resume', resumeController.matchResumeWithJobs);

module.exports = router;
