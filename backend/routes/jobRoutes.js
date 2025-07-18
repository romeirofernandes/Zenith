// routes/jobRoutes.js
const express = require('express');
const router = express.Router();
const { postJob, getAllJobs, getJobById  } = require('../controllers/jobController');
const { addToWishlist } = require('../controllers/jobController');

router.post('/postjd', postJob);
router.get('/all', getAllJobs);
router.get('/:id', getJobById); // ✅ GET job by 
router.post('/wishlist/:jobId', addToWishlist);

module.exports = router;
