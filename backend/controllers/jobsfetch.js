const axios = require("axios");
const Job = require("../models/Jobs");

const fetchAndSaveJobs = async () => {
  try {
    console.log("🔄 Fetching jobs from RapidAPI...");

    // Fetch jobs from the RapidAPI endpoint
    const response = await axios.get(
      "https://jsearch.p.rapidapi.com/search?query=developer%20jobs%20in%20chicago&page=1&num_pages=1&country=us&date_posted=all",
      {
        headers: {
          "x-rapidapi-key": "1ab5902c69msh69f434454c4d783p177689jsn75ef72224aff",
          "x-rapidapi-host": "jsearch.p.rapidapi.com",
        },
      }
    );

    const jobs = response.data.data; // Assuming the jobs are in `data.data`
    console.log(`✅ Fetched ${jobs.length} jobs from RapidAPI.`);

    // Map the fetched jobs to the Job model schema
    const formattedJobs = jobs.map((job) => ({
      company_name: job.employer_name || "Unknown Company",
      job_title: job.job_title || "Unknown Title",
      job_description: job.job_description || "No description provided.",
      required_skills: job.job_required_skills || [],
      experience_level: job.job_experience_level || "Not specified",
      education_requirements: job.job_required_education || "Not specified",
      stipend: job.job_salary_currency === "USD" ? job.job_salary : null,
      salary: job.job_salary || "Not specified",
      location: job.job_city || "Remote",
      job_type: job.job_employment_type || "Full-time",
      benefits: job.job_benefits || [],
      application_deadline: job.job_posted_at_datetime_utc || new Date(),
    }));

    // Save the jobs to MongoDB
    await Job.insertMany(formattedJobs, { ordered: false });
    console.log("✅ Jobs saved to MongoDB successfully.");
  } catch (error) {
    if (error.code === 11000) {
      console.log("⚠️ Duplicate job entries detected. Skipping duplicates.");
    } else {
      console.error("❌ Error fetching or saving jobs:", error.message);
    }
  }
};

module.exports = fetchAndSaveJobs;