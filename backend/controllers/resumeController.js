const axios = require('axios');

const resumeController = {
  matchResumeWithJobs: async (req, res) => {
    try {
      const { resume, jobDescriptions } = req.body;

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
