const express = require('express');
const router = express.Router();
const softSkillsController = require('../controllers/softSkillsController');

router.get('/question', softSkillsController.generateQuestions);
router.post('/analyze', softSkillsController.analyzeAnswers);

module.exports = router;
