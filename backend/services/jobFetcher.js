// services/jobFetcher.js
const mongoose = require('mongoose');
const cron = require('node-cron');

// Your Job model
const Job = require('../models/Jobs');

class JobFetcher {
  constructor() {
    this.apiKey = 'cd58c29ac8msh224d4655e667d43p116d1djsn3f86cf9a7784';
    this.apiHost = 'jsearch.p.rapidapi.com';
    this.baseURL = 'https://jsearch.p.rapidapi.com/search';
    
    // Search queries to diversify job listings
    this.searchQueries = [
      'software developer jobs',
      'web developer jobs',
      'full stack developer jobs',
      'frontend developer jobs',
      'backend developer jobs',
      'mobile developer jobs',
      'data scientist jobs',
      'devops engineer jobs',
      'ui ux designer jobs',
      'product manager jobs'
    ];
  }

  async fetchJobsFromAPI(query = 'developer jobs', page = 1) {
    try {
      const encodedQuery = encodeURIComponent(query);
      const url = `${this.baseURL}?query=${encodedQuery}&page=${page}&num_pages=1&country=us&date_posted=all`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'x-rapidapi-key': this.apiKey,
          'x-rapidapi-host': this.apiHost
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error fetching jobs from API:', error);
      return [];
    }
  }

  mapAPIJobToSchema(apiJob) {
    // Helper function to extract skills from job description
    const extractSkills = (description) => {
      const skillKeywords = [
        'JavaScript', 'Python', 'Java', 'React', 'Node.js', 'Angular', 'Vue.js',
        'TypeScript', 'PHP', 'Ruby', 'Go', 'Swift', 'Kotlin', 'C++', 'C#',
        'HTML', 'CSS', 'SQL', 'MongoDB', 'PostgreSQL', 'MySQL', 'Redis',
        'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Jenkins', 'Git',
        'Agile', 'Scrum', 'REST', 'GraphQL', 'API', 'Microservices'
      ];
      
      const foundSkills = [];
      const descriptionLower = description.toLowerCase();
      
      skillKeywords.forEach(skill => {
        if (descriptionLower.includes(skill.toLowerCase())) {
          foundSkills.push(skill);
        }
      });
      
      return foundSkills.length > 0 ? foundSkills : ['General Development'];
    };

    // Helper function to determine experience level
    const getExperienceLevel = (description, title) => {
      const text = (description + ' ' + title).toLowerCase();
      
      if (text.includes('senior') || text.includes('lead') || text.includes('principal') || 
          text.includes('architect') || text.includes('5+ years') || text.includes('7+ years')) {
        return 'Senior';
      } else if (text.includes('junior') || text.includes('entry') || text.includes('graduate') || 
                 text.includes('0-2 years') || text.includes('new grad')) {
        return 'Junior';
      } else if (text.includes('mid') || text.includes('intermediate') || text.includes('3-5 years')) {
        return 'Mid-level';
      }
      return 'Mid-level'; // Default
    };

    // Helper function to determine education requirements
    const getEducationRequirements = (description) => {
      const text = description.toLowerCase();
      
      if (text.includes('phd') || text.includes('doctorate')) {
        return 'PhD required';
      } else if (text.includes('master') || text.includes('mba')) {
        return 'Master\'s degree preferred';
      } else if (text.includes('bachelor') || text.includes('degree')) {
        return 'Bachelor\'s degree required';
      }
      return 'Bachelor\'s degree preferred';
    };

    // Helper function to extract salary info
    const getSalaryInfo = (apiJob) => {
      if (apiJob.job_salary_currency && apiJob.job_min_salary && apiJob.job_max_salary) {
        return `$${apiJob.job_min_salary} - $${apiJob.job_max_salary} ${apiJob.job_salary_currency}`;
      } else if (apiJob.job_salary_period && apiJob.job_salary_currency) {
        return `Competitive salary (${apiJob.job_salary_period})`;
      }
      return 'Competitive salary';
    };

    // Helper function to extract benefits
    const extractBenefits = (description) => {
      const benefitKeywords = [
        'health insurance', 'dental', 'vision', '401k', 'retirement',
        'paid time off', 'pto', 'vacation', 'remote work', 'flexible hours',
        'professional development', 'training', 'stock options', 'bonus',
        'gym membership', 'free lunch', 'parental leave'
      ];
      
      const foundBenefits = [];
      const descriptionLower = description.toLowerCase();
      
      benefitKeywords.forEach(benefit => {
        if (descriptionLower.includes(benefit)) {
          foundBenefits.push(benefit.charAt(0).toUpperCase() + benefit.slice(1));
        }
      });
      
      return foundBenefits.length > 0 ? foundBenefits : ['Competitive benefits package'];
    };

    // Helper function to get application deadline (30 days from now)
    const getApplicationDeadline = () => {
      const deadline = new Date();
      deadline.setDate(deadline.getDate() + 30);
      return deadline;
    };

    // Strip HTML from description
    const stripHtml = (html) => {
      if (!html) return '';
      return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
    };

    const cleanDescription = stripHtml(apiJob.job_description || '');
    
    return {
      company_name: apiJob.employer_name || 'Company Name Not Available',
      job_title: apiJob.job_title || 'Job Title Not Available',
      job_description: cleanDescription || 'Job description not available',
      required_skills: extractSkills(cleanDescription),
      experience_level: getExperienceLevel(cleanDescription, apiJob.job_title || ''),
      education_requirements: getEducationRequirements(cleanDescription),
      stipend: apiJob.job_employment_type === 'INTERN' ? 'Available' : null,
      salary: getSalaryInfo(apiJob),
      location: `${apiJob.job_city || 'City'}, ${apiJob.job_state || 'State'}`,
      job_type: apiJob.job_employment_type || 'FULLTIME',
      benefits: extractBenefits(cleanDescription),
      application_deadline: getApplicationDeadline()
    };
  }

  async saveJobsToDB(jobs) {
    const savedJobs = [];
    
    for (const jobData of jobs) {
      try {
        // Check if job already exists (by company name and job title)
        const existingJob = await Job.findOne({
          company_name: jobData.company_name,
          job_title: jobData.job_title
        });

        if (existingJob) {
          // Update existing job
          const updatedJob = await Job.findByIdAndUpdate(
            existingJob._id,
            jobData,
            { new: true }
          );
          savedJobs.push(updatedJob);
          console.log(`Updated job: ${jobData.job_title} at ${jobData.company_name}`);
        } else {
          // Create new job
          const newJob = new Job(jobData);
          const savedJob = await newJob.save();
          savedJobs.push(savedJob);
          console.log(`Saved new job: ${jobData.job_title} at ${jobData.company_name}`);
        }
      } catch (error) {
        console.error('Error saving job:', error);
      }
    }
    
    return savedJobs;
  }

  async fetchAndStore30Jobs() {
    console.log('Starting job fetch process...');
    let allJobs = [];
    
    // Fetch jobs from multiple search queries to get variety
    for (const query of this.searchQueries) {
      if (allJobs.length >= 30) break;
      
      console.log(`Fetching jobs for query: ${query}`);
      const jobs = await this.fetchJobsFromAPI(query);
      
      // Map API jobs to our schema
      const mappedJobs = jobs.map(job => this.mapAPIJobToSchema(job));
      allJobs = allJobs.concat(mappedJobs);
      
      // Add delay between requests to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Limit to 30 jobs
    const jobsToSave = allJobs.slice(0, 30);
    
    console.log(`Mapped ${jobsToSave.length} jobs, saving to database...`);
    
    // Save to database
    const savedJobs = await this.saveJobsToDB(jobsToSave);
    
    console.log(`Successfully processed ${savedJobs.length} jobs`);
    return savedJobs;
  }

  async removeOldJobs() {
    try {
      // Remove jobs older than 7 days
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const result = await Job.deleteMany({
        createdAt: { $lt: sevenDaysAgo }
      });
      
      console.log(`Removed ${result.deletedCount} old jobs`);
      return result.deletedCount;
    } catch (error) {
      console.error('Error removing old jobs:', error);
      return 0;
    }
  }

  startCronJob() {
    // Run every 6 hours (at 00:00, 06:00, 12:00, 18:00)
    cron.schedule('0 */6 * * *', async () => {
      console.log('Running scheduled job fetch...');
      try {
        await this.removeOldJobs();
        await this.fetchAndStore30Jobs();
      } catch (error) {
        console.error('Error in scheduled job fetch:', error);
      }
    });
    
    console.log('Job fetcher cron job started - runs every 6 hours');
  }

  // Method to run manually
  async runManually() {
    try {
      console.log('Running job fetch manually...');
      await this.removeOldJobs();
      const jobs = await this.fetchAndStore30Jobs();
      return jobs;
    } catch (error) {
      console.error('Error in manual job fetch:', error);
      throw error;
    }
  }
}

module.exports = JobFetcher;