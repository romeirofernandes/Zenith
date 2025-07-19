import React, { useState, useEffect } from 'react';
import { Search, RefreshCw, Calendar, MapPin, Building2, DollarSign, Clock, Filter, ChevronLeft, ChevronRight } from 'lucide-react';

const JobManager = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingJobs, setFetchingJobs] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalJobs, setTotalJobs] = useState(0);
  const [searchFilters, setSearchFilters] = useState({
    experience_level: '',
    job_type: '',
    location: '',
    skills: '',
    company_name: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  // Replace with your actual API base URL
  const API_BASE = 'http://localhost:5000/api/job-fetcher';

  // Fetch jobs from database
  const fetchJobsFromDB = async (page = 1, filters = {}) => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...Object.fromEntries(Object.entries(filters).filter(([_, v]) => v !== ''))
      });

      const endpoint = Object.values(filters).some(v => v !== '') ? 'search' : 'all';
      const response = await fetch(`${API_BASE}/${endpoint}?${queryParams}`);
      const data = await response.json();

      if (data.success) {
        setJobs(data.jobs);
        setTotalPages(data.totalPages);
        setTotalJobs(data.totalJobs);
        setCurrentPage(data.currentPage);
      } else {
        console.error('Failed to fetch jobs:', data.message);
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  // Trigger job fetching from external API and save to MongoDB
  const triggerJobFetch = async () => {
    setFetchingJobs(true);
    try {
      const response = await fetch(`${API_BASE}/fetch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();

      if (data.success) {
        alert(`Successfully fetched ${data.count} jobs!`);
        // Refresh the job list
        fetchJobsFromDB(1, searchFilters);
      } else {
        alert('Failed to fetch jobs: ' + data.message);
      }
    } catch (error) {
      console.error('Error triggering job fetch:', error);
      alert('Error triggering job fetch');
    } finally {
      setFetchingJobs(false);
    }
  };

  // Handle search/filter
  const handleSearch = () => {
    setCurrentPage(1);
    fetchJobsFromDB(1, searchFilters);
  };

  // Handle filter change
  const handleFilterChange = (field, value) => {
    setSearchFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Clear filters
  const clearFilters = () => {
    setSearchFilters({
      experience_level: '',
      job_type: '',
      location: '',
      skills: '',
      company_name: ''
    });
    setCurrentPage(1);
    fetchJobsFromDB(1, {});
  };

  // Pagination
  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchJobsFromDB(page, searchFilters);
  };

  // Load jobs on component mount
  useEffect(() => {
    fetchJobsFromDB();
  }, []);

  const formatSalary = (salary) => {
    return salary || 'Competitive salary';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getExperienceBadgeColor = (level) => {
    const colors = {
      'Junior': 'bg-green-100 text-green-800',
      'Mid-level': 'bg-blue-100 text-blue-800',
      'Senior': 'bg-purple-100 text-purple-800'
    };
    return colors[level] || 'bg-gray-100 text-gray-800';
  };

  const getJobTypeBadgeColor = (type) => {
    const colors = {
      'FULLTIME': 'bg-emerald-100 text-emerald-800',
      'PARTTIME': 'bg-yellow-100 text-yellow-800',
      'CONTRACT': 'bg-orange-100 text-orange-800',
      'INTERN': 'bg-pink-100 text-pink-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Job Manager</h1>
              <p className="text-gray-600 mt-1">Manage and browse available job opportunities</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </button>
              <button
                onClick={triggerJobFetch}
                disabled={fetchingJobs}
                className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${fetchingJobs ? 'animate-spin' : ''}`} />
                {fetchingJobs ? 'Fetching...' : 'Fetch New Jobs'}
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{totalJobs}</div>
              <div className="text-sm text-gray-600">Total Jobs</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{jobs.length}</div>
              <div className="text-sm text-gray-600">Current Page</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{totalPages}</div>
              <div className="text-sm text-gray-600">Total Pages</div>
            </div>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Experience Level</label>
                  <select
                    value={searchFilters.experience_level}
                    onChange={(e) => handleFilterChange('experience_level', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All Levels</option>
                    <option value="Junior">Junior</option>
                    <option value="Mid-level">Mid-level</option>
                    <option value="Senior">Senior</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Job Type</label>
                  <select
                    value={searchFilters.job_type}
                    onChange={(e) => handleFilterChange('job_type', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All Types</option>
                    <option value="FULLTIME">Full Time</option>
                    <option value="PARTTIME">Part Time</option>
                    <option value="CONTRACT">Contract</option>
                    <option value="INTERN">Internship</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input
                    type="text"
                    value={searchFilters.location}
                    onChange={(e) => handleFilterChange('location', e.target.value)}
                    placeholder="e.g., San Francisco, CA"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Skills</label>
                  <input
                    type="text"
                    value={searchFilters.skills}
                    onChange={(e) => handleFilterChange('skills', e.target.value)}
                    placeholder="e.g., React, Node.js, Python"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                  <input
                    type="text"
                    value={searchFilters.company_name}
                    onChange={(e) => handleFilterChange('company_name', e.target.value)}
                    placeholder="e.g., Google, Microsoft"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleSearch}
                  className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Search className="w-4 h-4 mr-2" />
                  Search Jobs
                </button>
                <button
                  onClick={clearFilters}
                  className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Job List */}
        <div className="space-y-4">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
              <span className="ml-2 text-gray-600">Loading jobs...</span>
            </div>
          ) : jobs.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <div className="text-gray-400 mb-2">
                <Search className="w-12 h-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
              <p className="text-gray-600">Try adjusting your filters or fetch new jobs from the API.</p>
            </div>
          ) : (
            jobs.map((job) => (
              <div key={job._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-1">{job.job_title}</h3>
                        <div className="flex items-center text-gray-600 mb-2">
                          <Building2 className="w-4 h-4 mr-1" />
                          <span className="font-medium">{job.company_name}</span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getExperienceBadgeColor(job.experience_level)}`}>
                          {job.experience_level}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getJobTypeBadgeColor(job.job_type)}`}>
                          {job.job_type}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        <span>{job.location}</span>
                      </div>
                      <div className="flex items-center">
                        <DollarSign className="w-4 h-4 mr-1" />
                        <span>{formatSalary(job.salary)}</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        <span>Posted {formatDate(job.createdAt)}</span>
                      </div>
                    </div>

                    <p className="text-gray-700 mb-4 line-clamp-3">
                      {job.job_description.length > 200 
                        ? job.job_description.substring(0, 200) + '...' 
                        : job.job_description}
                    </p>

                    <div className="space-y-2">
                      <div>
                        <span className="text-sm font-medium text-gray-700">Required Skills:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {job.required_skills.map((skill, index) => (
                            <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      {job.benefits && job.benefits.length > 0 && (
                        <div>
                          <span className="text-sm font-medium text-gray-700">Benefits:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {job.benefits.slice(0, 3).map((benefit, index) => (
                              <span key={index} className="px-2 py-1 bg-green-50 text-green-700 text-xs rounded">
                                {benefit}
                              </span>
                            ))}
                            {job.benefits.length > 3 && (
                              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                                +{job.benefits.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {job.application_deadline && (
                      <div className="flex items-center text-sm text-orange-600 mt-3">
                        <Clock className="w-4 h-4 mr-1" />
                        <span>Apply by {formatDate(job.application_deadline)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center space-x-4 mt-8">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="flex items-center px-3 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </button>
            
            <div className="flex space-x-1">
              {[...Array(Math.min(5, totalPages))].map((_, index) => {
                const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + index;
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`px-3 py-2 rounded-lg ${
                      currentPage === pageNum
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-600 bg-white border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="flex items-center px-3 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobManager;