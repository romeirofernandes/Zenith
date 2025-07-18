const axios = require('axios');
const User = require('../models/User');

const resumeController = {
  matchResumeWithJobs: async (req, res) => {
    try {
      const {jobDescriptions } = req.body;

      const user = await User.findById(req.user)
    if (!user || !user._id) {
      return res.status(401).json({ success: false, message: 'Unauthorized: No user context found' });
    }
      resume = await User.findById(user._id).select('resume.resumeText').lean();

      if (!resume || !Array.isArray(jobDescriptions) || jobDescriptions.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Missing resume or jobDescriptions'
        });
      }

      // Call FastAPI backend
      const response = await axios.post('http://localhost:8000/match', {
        resume,
        job_descriptions: jobDescriptions
      });

      res.json({
        success: true,
        results: response.data.results
      });

    } catch (error) {
      console.error('Error calling FastAPI matcher:', error.message);
      res.status(500).json({
        success: false,
        message: 'Resume matching failed',
        error: error.response?.data || error.message
      });
    }
  }
};

module.exports = resumeController;
