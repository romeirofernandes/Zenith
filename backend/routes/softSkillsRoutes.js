const express = require('express');
const router = express.Router();
const { verifyFirebaseToken } = require('../middleware/auth');
const softSkillsController = require('../controllers/softSkillsController');

router.get('/question', softSkillsController.generateQuestions);
router.post('/analyze',verifyFirebaseToken, softSkillsController.analyzeAnswers);

module.exports = router;
