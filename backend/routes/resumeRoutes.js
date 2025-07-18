const express = require('express');
const router = express.Router();
const resumeMatcherController = require('../controllers/resumeMatcherController');

// POST /api/match-resume
router.post('/match-resume', resumeMatcherController.matchResumeWithJobs);

module.exports = resumeRouter;
