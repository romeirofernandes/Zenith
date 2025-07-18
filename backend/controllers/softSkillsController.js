require('dotenv').config();
const fetch = require('node-fetch');
const User = require('../models/User');

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_MODEL = 'llama3-8b-8192'; // or any model like `mixtral-8x7b-32768`

const softSkillsController = {
  // 1. Generate multiple random questions
  generateQuestions: async (req, res) => {
    try {
      const count = parseInt(req.query.count) || 3;
      const questions = [];

      for (let i = 0; i < count; i++) {
        const prompt = `Generate one open-ended interview question to assess a candidate's soft skills. Randomly focus on one of these: communication, leadership, teamwork, adaptability, or problem-solving.`;

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${GROQ_API_KEY}`,
          },
          body: JSON.stringify({
            model: GROQ_MODEL,
            messages: [
              { role: 'system', content: 'You are an expert HR interviewer.' },
              { role: 'user', content: prompt }
            ]
          })
        });

        const data = await response.json();
        const question = data.choices?.[0]?.message?.content?.trim() || 'No question generated.';
        questions.push(question);
      }

      res.json({ success: true, questions });
    } catch (error) {
      console.error('Error generating questions:', error.message);
      res.status(500).json({ success: false, message: 'Failed to generate questions' });
    }
  },

analyzeAnswers: async (req, res) => {
  try {
    const { responses } = req.body;

    if (!Array.isArray(responses) || responses.length === 0) {
      return res.status(400).json({ success: false, message: 'Missing or invalid responses array' });
    }

    const allSkillsSet = new Set();

    for (const { question, answer } of responses) {
      const prompt = `
You are a soft-skills evaluator. Given a user's response to an interview question, identify which soft skills are demonstrated.

Question: ${question}
Answer: ${answer}

Return a JSON array of detected soft skills. Example:
["communication", "adaptability"]
`;

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: GROQ_MODEL,
          messages: [
            { role: 'system', content: 'You are a professional soft-skills evaluator.' },
            { role: 'user', content: prompt }
          ]
        })
      });

      const data = await response.json();
      const outputText = data.choices?.[0]?.message?.content?.trim() || '[]';
      const matches = outputText.match(/\[(.*?)\]/s);
      const skills = matches ? JSON.parse(`[${matches[1]}]`) : [];

      skills.forEach(skill => allSkillsSet.add(skill.toLowerCase()));
    }

    const user = req.user; 
    if (!user || !user._id) {
      return res.status(401).json({ success: false, message: 'Unauthorized: No user context found' });
    }

    await User.findByIdAndUpdate(
      user._id,
      { $set: { 'resume.softskills': Array.from(allSkillsSet) } },
      { new: true }
    );

    res.json({
      success: true,
      combinedSkills: Array.from(allSkillsSet)
    });

  } catch (error) {
    console.error('Error analyzing answers:', error.message);
    res.status(500).json({ success: false, message: 'Failed to analyze soft skills' });
  }
}
};

module.exports = softSkillsController;
