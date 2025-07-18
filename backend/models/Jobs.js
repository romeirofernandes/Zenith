// models/Job.js
const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
  company_name: { type: String, required: true },
  job_title: { type: String, required: true },
  job_description: { type: String, required: true },
  required_skills: { type: [String], required: true },
  experience_level: { type: String, required: true },
  education_requirements: { type: String, required: true },
  stipend: { type: String },
  salary: { type: String, required: true },
  location: { type: String, required: true },
  job_type: { type: String, required: true },
  benefits: { type: [String] },
  application_deadline: { type: Date, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Job', JobSchema);
