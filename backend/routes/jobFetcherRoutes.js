// routes/jobFetcherRoutes.js
const express = require('express');
const router = express.Router();
const {
  fetchJobs,
  getAllJobs,
  searchJobs,
  getJobById,
  deleteOldJobs,
  getJobStats,
  getServiceStatus
} = require('../controllers/jobFetcherController');

// @route   POST /api/jobs/fetch
// @desc    Manually trigger job fetching
// @access  Private (add auth middleware if needed)
router.post('/fetch', fetchJobs);

// @route   GET /api/jobs/all
// @desc    Get all jobs with pagination
// @access  Public
router.get('/all', getAllJobs);

// @route   GET /api/jobs/search
// @desc    Search jobs with filters
// @access  Public
// Query params: experience_level, job_type, location, skills, company_name, page, limit
router.get('/search', searchJobs);

// @route   GET /api/jobs/stats
// @desc    Get job statistics
// @access  Public
router.get('/stats', getJobStats);

// @route   GET /api/jobs/service-status
// @desc    Get job fetcher service status
// @access  Private (add auth middleware if needed)
router.get('/service-status', getServiceStatus);

// @route   DELETE /api/jobs/old
// @desc    Delete old jobs manually
// @access  Private (add auth middleware if needed)
router.delete('/old', deleteOldJobs);

// @route   GET /api/jobs/:id
// @desc    Get job by ID
// @access  Public
router.get('/:id', getJobById);

module.exports = router;