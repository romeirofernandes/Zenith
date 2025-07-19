// controllers/jobFetcherController.js
const Job = require('../models/Jobs');
const cron = require('node-cron');

class JobFetcherController {
  constructor() {
    this.isRunning = false;
    this.apiKey = 'cd58c29ac8msh224d4655e667d43p116d1djsn3f86cf9a7784';
    this.apiHost = 'jsearch.p.rapidapi.com';
    this.searchQueries = [
      'developer jobs',
      'software engineer jobs',
      'data scientist jobs',
      'product manager jobs',
      'designer jobs'
    ];
  }

  // Map API response to our MongoDB schema
  mapJobData(apiJob) {
    return {
      company_name: apiJob.employer_name || 'Unknown Company',
      job_title: apiJob.job_title || 'Unknown Title',
      job_description: this.stripHtml(apiJob.job_description) || 'No description available',
      required_skills: this.extractSkills(apiJob.job_description, apiJob.job_title),
      experience_level: this.determineExperienceLevel(apiJob.job_title, apiJob.job_description),
      education_requirements: this.extractEducationRequirements(apiJob.job_description),
      stipend: apiJob.job_min_salary ? `$${apiJob.job_min_salary}` : null,
      salary: this.formatSalary(apiJob.job_min_salary, apiJob.job_max_salary),
      location: this.formatLocation(apiJob.job_city, apiJob.job_state, apiJob.job_country),
      job_type: apiJob.job_employment_type || 'Full-time',
      benefits: this.extractBenefits(apiJob.job_description),
      application_deadline: this.calculateDeadline()
    };
  }

  // Helper function to strip HTML tags
  stripHtml(html) {
    if (!html) return '';
    return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  }

  // Extract skills from job description and title
  extractSkills(description = '', title = '') {
    const commonSkills = [
      'JavaScript', 'Python', 'Java', 'React', 'Node.js', 'SQL', 'MongoDB',
      'AWS', 'Docker', 'Kubernetes', 'Git', 'HTML', 'CSS', 'TypeScript',
      'Angular', 'Vue.js', 'Express.js', 'PostgreSQL', 'Redis', 'GraphQL',
      'REST API', 'Microservices', 'Agile', 'Scrum', 'CI/CD', 'Jenkins',
      'Linux', 'Azure', 'GCP', 'Machine Learning', 'Data Analysis', 'Tableau'
    ];

    const text = `${title} ${description}`.toLowerCase();
    const foundSkills = commonSkills.filter(skill => 
      text.includes(skill.toLowerCase())
    );

    return foundSkills.length > 0 ? foundSkills : ['General'];
  }

  // Determine experience level from title and description
  determineExperienceLevel(title = '', description = '') {
    const text = `${title} ${description}`.toLowerCase();
    
    if (text.includes('senior') || text.includes('lead') || text.includes('principal')) {
      return 'Senior';
    } else if (text.includes('junior') || text.includes('entry') || text.includes('graduate')) {
      return 'Junior';
    } else if (text.includes('intern') || text.includes('trainee')) {
      return 'Intern';
    }
    
    return 'Mid-level';
  }

  // Extract education requirements
  extractEducationRequirements(description = '') {
    const text = description.toLowerCase();
    
    if (text.includes('phd') || text.includes('doctorate')) {
      return 'PhD required';
    } else if (text.includes('master') || text.includes('mba')) {
      return 'Master\'s degree preferred';
    } else if (text.includes('bachelor') || text.includes('degree')) {
      return 'Bachelor\'s degree required';
    }
    
    return 'High school diploma';
  }

  // Format salary information
  formatSalary(minSalary, maxSalary) {
    if (minSalary && maxSalary) {
      return `$${minSalary} - $${maxSalary}`;
    } else if (minSalary) {
      return `$${minSalary}+`;
    } else if (maxSalary) {
      return `Up to $${maxSalary}`;
    }
    return 'Salary not disclosed';
  }

  // Format location
  formatLocation(city, state, country) {
    const parts = [city, state, country].filter(Boolean);
    return parts.join(', ') || 'Remote';
  }

  // Extract benefits from description
  extractBenefits(description = '') {
    const commonBenefits = [
      'Health Insurance', 'Dental Insurance', '401k', 'Remote Work',
      'Flexible Hours', 'Paid Time Off', 'Stock Options', 'Life Insurance',
      'Disability Insurance', 'Professional Development', 'Gym Membership',
      'Free Food', 'Transportation', 'Tuition Reimbursement'
    ];

    const text = description.toLowerCase();
    return commonBenefits.filter(benefit => 
      text.includes(benefit.toLowerCase().replace(' ', ''))
    );
  }

  // Calculate application deadline (30 days from now)
  calculateDeadline() {
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + 30);
    return deadline;
  }

  // Fetch jobs from API
  async fetchJobsFromAPI(query = 'developer jobs', numJobs = 30) {
    try {
      const encodedQuery = encodeURIComponent(query);
      const response = await fetch(
        `https://jsearch.p.rapidapi.com/search?query=${encodedQuery}&page=1&num_pages=3&country=us&date_posted=all`,
        {
          method: 'GET',
          headers: {
            'x-rapidapi-key': this.apiKey,
            'x-rapidapi-host': this.apiHost
          }
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return (data.data || []).slice(0, numJobs);
    } catch (error) {
      console.error('Error fetching jobs from API:', error);
      return [];
    }
  }

  // Save jobs to MongoDB
  async saveJobsToMongoDB(jobs) {
    let savedCount = 0;
    let duplicateCount = 0;

    for (const jobData of jobs) {
      try {
        // Check if job already exists (by company name, job title, and location)
        const existingJob = await Job.findOne({
          company_name: jobData.company_name,
          job_title: jobData.job_title,
          location: jobData.location
        });

        if (!existingJob) {
          const job = new Job(jobData);
          await job.save();
          savedCount++;
        } else {
          duplicateCount++;
        }
      } catch (error) {
        console.error('Error saving job to MongoDB:', error);
      }
    }

    return { savedCount, duplicateCount };
  }

  // Main function to fetch and save jobs
  async fetchAndSaveJobs() {
    if (this.isRunning) {
      console.log('Job fetcher is already running, skipping...');
      return;
    }

    this.isRunning = true;
    console.log(`[${new Date().toISOString()}] Starting job fetch cycle...`);

    try {
      let totalSaved = 0;
      let totalDuplicates = 0;

      // Fetch jobs from different search queries to get variety
      for (const query of this.searchQueries) {
        const jobs = await this.fetchJobsFromAPI(query, 6); // 6 jobs per query = 30 total
        
        if (jobs.length > 0) {
          const mappedJobs = jobs.map(job => this.mapJobData(job));
          const { savedCount, duplicateCount } = await this.saveJobsToMongoDB(mappedJobs);
          
          totalSaved += savedCount;
          totalDuplicates += duplicateCount;
          
          console.log(`Query "${query}": ${savedCount} new jobs saved, ${duplicateCount} duplicates skipped`);
        }

        // Add delay between API calls to be respectful
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      console.log(`[${new Date().toISOString()}] Job fetch cycle completed: ${totalSaved} new jobs saved, ${totalDuplicates} duplicates skipped`);
    } catch (error) {
      console.error('Error in fetchAndSaveJobs:', error);
    } finally {
      this.isRunning = false;
    }
  }

  // Start the cron job to run every 30 minutes
  startCronJob() {
    // Run every 30 minutes
    cron.schedule('*/30 * * * *', () => {
      this.fetchAndSaveJobs();
    });

    // Also run immediately when starting
    this.fetchAndSaveJobs();
    
    console.log('Job fetcher cron job started - will run every 30 minutes');
  }

  // Manual trigger for testing
  async manualFetch() {
    console.log('Manual job fetch triggered...');
    await this.fetchAndSaveJobs();
  }
}

// Export singleton instance
const jobFetcherController = new JobFetcherController();

module.exports = jobFetcherController;