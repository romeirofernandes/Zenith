// controllers/jobController.js
const Job = require("../models/Jobs");
const User = require("../models/User");

const addToWishlist = async (req, res) => {
  try {
    const { firebaseUid } = req.body;
    const { jobId } = req.params;

    console.log("Received firebaseUid:", firebaseUid);

    // Check if job exists
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    // Find user by firebaseUid
    let user = await User.findOne({ firebaseUid });
    if (!user) {
      // Optionally, create the user if they don't exist
      return res.status(404).json({ message: "User not found" });
    }

    // Add job to user's wishlist if not already present
    if (user.wishlist.includes(jobId)) {
      return res.status(400).json({ message: "Job already in wishlist" });
    }

    user.wishlist.push(jobId);
    await user.save();

    res
      .status(200)
      .json({ message: "Job added to wishlist", wishlist: user.wishlist });
  } catch (error) {
    console.error("Error adding to wishlist:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

const removeFromWishlist = async (req, res) => {
  try {
    const { firebaseUid } = req.body;
    const { jobId } = req.params;

    // Find user by firebaseUid
    let user = await User.findOne({ firebaseUid });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Remove job from user's wishlist
    user.wishlist = user.wishlist.filter((id) => id.toString() !== jobId);
    await user.save();

    res
      .status(200)
      .json({ message: "Job removed from wishlist", wishlist: user.wishlist });
  } catch (error) {
    console.error("Error removing from wishlist:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

const getUserWishlist = async (req, res) => {
  try {
    const { firebaseUid } = req.params;

    // Find user by firebaseUid and populate wishlist with job details
    const user = await User.findOne({ firebaseUid }).populate("wishlist");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ wishlist: user.wishlist });
  } catch (error) {
    console.error("Error fetching wishlist:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

// POST a job
const postJob = async (req, res) => {
  try {
    const job = new Job(req.body);
    const savedJob = await job.save();
    res.status(201).json({ message: "Job posted successfully", job: savedJob });
  } catch (error) {
    console.error("Error saving job:", error);
    res.status(500).json({ message: "Failed to post job", error });
  }
};

// GET all jobs
const getAllJobs = async (req, res) => {
  try {
    const jobs = await Job.find();
    res.status(200).json({ jobs });
  } catch (error) {
    console.error("Error fetching jobs:", error);
    res.status(500).json({ message: "Failed to fetch jobs", error });
  }
};

// GET job by ID
const getJobById = async (req, res) => {
  try {
    const jobId = req.params.id;
    const job = await Job.findById(jobId);

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    res.status(200).json({ job });
  } catch (error) {
    console.error("Error fetching job by ID:", error);
    res.status(500).json({ message: "Failed to fetch job", error });
  }
};

module.exports = {
  postJob,
  getAllJobs,
  getJobById,
  addToWishlist,
  removeFromWishlist,
  getUserWishlist,
};
