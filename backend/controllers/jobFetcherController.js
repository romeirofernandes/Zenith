// controllers/jobFetcherController.js
const JobFetcher = require('../services/jobFetcher');
const Job = require('../models/Jobs');

// Initialize job fetcher instance
const jobFetcher = new JobFetcher();

// @desc    Manually trigger job fetching
// @route   POST /api/jobs/fetch
// @access  Private (you can add auth middleware)
const fetchJobs = async (req, res) => {
  try {
    console.log('Manual job fetch triggered');
    const jobs = await jobFetcher.runManually();
    
    res.status(200).json({
      success: true,
      message: `Successfully fetched and stored ${jobs.length} jobs`,
      count: jobs.length,
      jobs: jobs
    });
  } catch (error) {
    console.error('Error in fetchJobs controller:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching jobs',
      error: error.message
    });
  }
};

// @desc    Get all jobs from database
// @route   GET /api/jobs/all
// @access  Public
const getAllJobs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const jobs = await Job.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalJobs = await Job.countDocuments();
    const totalPages = Math.ceil(totalJobs / limit);

    res.status(200).json({
      success: true,
      count: jobs.length,
      totalJobs,
      totalPages,
      currentPage: page,
      jobs: jobs
    });
  } catch (error) {
    console.error('Error in getAllJobs controller:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching jobs from database',
      error: error.message
    });
  }
};

// @desc    Search jobs with filters
// @route   GET /api/jobs/search
// @access  Public
const searchJobs = async (req, res) => {
  try {
    const { 
      experience_level, 
      job_type, 
      location, 
      skills,
      company_name,
      salary_min,
      salary_max,
      page = 1,
      limit = 10
    } = req.query;
    
    let query = {};
    
    // Build search query
    if (experience_level) {
      query.experience_level = { $regex: experience_level, $options: 'i' };
    }
    
    if (job_type) {
      query.job_type = { $regex: job_type, $options: 'i' };
    }
    
    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }
    
    if (skills) {
      const skillsArray = skills.split(',').map(skill => skill.trim());
      query.required_skills = { $in: skillsArray };
    }
    
    if (company_name) {
      query.company_name = { $regex: company_name, $options: 'i' };
    }

    // Salary range filtering (basic implementation)
    if (salary_min || salary_max) {
      query.salary = {};
      if (salary_min) {
        query.salary.$regex = new RegExp(`\\$${salary_min}`, 'i');
      }
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const jobs = await Job.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalJobs = await Job.countDocuments(query);
    const totalPages = Math.ceil(totalJobs / parseInt(limit));
    
    res.status(200).json({
      success: true,
      count: jobs.length,
      totalJobs,
      totalPages,
      currentPage: parseInt(page),
      searchFilters: req.query,
      jobs: jobs
    });
  } catch (error) {
    console.error('Error in searchJobs controller:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching jobs',
      error: error.message
    });
  }
};

// @desc    Get job by ID
// @route   GET /api/jobs/:id
// @access  Public
const getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    res.status(200).json({
      success: true,
      job: job
    });
  } catch (error) {
    console.error('Error in getJobById controller:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching job',
      error: error.message
    });
  }
};

// @desc    Delete old jobs manually
// @route   DELETE /api/jobs/old
// @access  Private (you can add auth middleware)
const deleteOldJobs = async (req, res) => {
  try {
    const deletedCount = await jobFetcher.removeOldJobs();
    
    res.status(200).json({
      success: true,
      message: `Removed ${deletedCount} old jobs`,
      deletedCount: deletedCount
    });
  } catch (error) {
    console.error('Error in deleteOldJobs controller:', error);
    res.status(500).json({
      success: false,
      message: 'Error removing old jobs',
      error: error.message
    });
  }
};

// @desc    Get job statistics
// @route   GET /api/jobs/stats
// @access  Public
const getJobStats = async (req, res) => {
  try {
    const totalJobs = await Job.countDocuments();
    
    // Get jobs by experience level
    const experienceStats = await Job.aggregate([
      { $group: { _id: '$experience_level', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Get jobs by job type
    const jobTypeStats = await Job.aggregate([
      { $group: { _id: '$job_type', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Get top companies
    const topCompanies = await Job.aggregate([
      { $group: { _id: '$company_name', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Get top skills
    const topSkills = await Job.aggregate([
      { $unwind: '$required_skills' },
      { $group: { _id: '$required_skills', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 15 }
    ]);

    // Get recent jobs count (last 24 hours)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const recentJobs = await Job.countDocuments({
      createdAt: { $gte: yesterday }
    });

    res.status(200).json({
      success: true,
      stats: {
        totalJobs,
        recentJobs,
        experienceStats,
        jobTypeStats,
        topCompanies,
        topSkills
      }
    });
  } catch (error) {
    console.error('Error in getJobStats controller:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching job statistics',
      error: error.message
    });
  }
};

// @desc    Get job fetcher service status
// @route   GET /api/jobs/service-status
// @access  Private (you can add auth middleware)
const getServiceStatus = async (req, res) => {
  try {
    const totalJobs = await Job.countDocuments();
    const latestJob = await Job.findOne().sort({ createdAt: -1 });
    
    // Check if jobs are recent (within last 12 hours)
    const twelveHoursAgo = new Date();
    twelveHoursAgo.setHours(twelveHoursAgo.getHours() - 12);
    const recentJobsCount = await Job.countDocuments({
      createdAt: { $gte: twelveHoursAgo }
    });

    const serviceStatus = {
      isActive: recentJobsCount > 0,
      totalJobs,
      latestJobDate: latestJob ? latestJob.createdAt : null,
      recentJobsCount,
      lastFetchStatus: recentJobsCount > 0 ? 'Success' : 'No recent activity'
    };

    res.status(200).json({
      success: true,
      serviceStatus
    });
  } catch (error) {
    console.error('Error in getServiceStatus controller:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking service status',
      error: error.message
    });
  }
};

module.exports = {
  fetchJobs,
  getAllJobs,
  searchJobs,
  getJobById,
  deleteOldJobs,
  getJobStats,
  getServiceStatus
};