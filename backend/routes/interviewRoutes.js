const express = require('express');
const router = express.Router();
const interviewController = require('../controllers/interviewController');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

router.post('/questions', interviewController.generateQuestions);
router.post('/submit', upload.array('media'), interviewController.submitInterview);

module.exports = router;