import React, { useState, useEffect } from 'react';
import { Search, MapPin, Building, Calendar, ExternalLink } from 'lucide-react';

const JobSearchComponent = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('developer jobs in chicago');

  const fetchJobs = async (query = searchQuery) => {
    setLoading(true);
    setError(null);

    try {
      const encodedQuery = encodeURIComponent(query);
      const response = await fetch(`https://jsearch.p.rapidapi.com/search?query=${encodedQuery}&page=1&num_pages=1&country=us&date_posted=all`, {
        method: 'GET',
        headers: {
          'x-rapidapi-key': 'cd58c29ac8msh224d4655e667d43p116d1djsn3f86cf9a7784',
          'x-rapidapi-host': 'jsearch.p.rapidapi.com'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setJobs(data.data || []);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    fetchJobs(searchQuery);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Date not available';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return 'Date not available';
    }
  };

  const stripHtml = (html) => {
    if (!html) return '';
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading jobs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded mb-4">
            <p className="font-bold">Error loading jobs:</p>
            <p>{error}</p>
          </div>
          <button 
            onClick={() => fetchJobs()}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Job Search</h1>
          
          <div className="mb-6">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for jobs..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch(e)}
                />
              </div>
              <button
                onClick={handleSearch}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Search
              </button>
            </div>
          </div>
        </div>

        {jobs.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No jobs found for your search query.</p>
          </div>
        ) : (
          <div className="space-y-6">
            <p className="text-gray-600 mb-4">Found {jobs.length} jobs</p>
            
            {jobs.map((job, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                      {job.job_title || 'Job Title Not Available'}
                    </h2>
                    
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                      {job.employer_name && (
                        <div className="flex items-center gap-1">
                          <Building className="h-4 w-4" />
                          <span>{job.employer_name}</span>
                        </div>
                      )}
                      
                      {job.job_city && job.job_state && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          <span>{job.job_city}, {job.job_state}</span>
                        </div>
                      )}
                      
                      {job.job_posted_at_datetime_utc && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>Posted: {formatDate(job.job_posted_at_datetime_utc)}</span>
                        </div>
                      )}
                    </div>

                    {job.job_employment_type && (
                      <div className="mb-3">
                        <span className="inline-block bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                          {job.job_employment_type}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {job.job_apply_link && (
                    <a
                      href={job.job_apply_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Apply
                    </a>
                  )}
                </div>

                {job.job_description && (
                  <div className="border-t pt-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Job Description</h3>
                    <div className="text-gray-700 leading-relaxed">
                      {stripHtml(job.job_description).split('\n').map((paragraph, pIndex) => (
                        paragraph.trim() && (
                          <p key={pIndex} className="mb-2">
                            {paragraph.trim()}
                          </p>
                        )
                      ))}
                    </div>
                  </div>
                )}

                {job.job_highlights && (
                  <div className="border-t pt-4 mt-4">
                    {job.job_highlights.Qualifications && job.job_highlights.Qualifications.length > 0 && (
                      <div className="mb-4">
                        <h4 className="font-medium text-gray-900 mb-2">Qualifications:</h4>
                        <ul className="list-disc list-inside text-gray-700 space-y-1">
                          {job.job_highlights.Qualifications.map((qual, qIndex) => (
                            <li key={qIndex} className="text-sm">{qual}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {job.job_highlights.Responsibilities && job.job_highlights.Responsibilities.length > 0 && (
                      <div className="mb-4">
                        <h4 className="font-medium text-gray-900 mb-2">Responsibilities:</h4>
                        <ul className="list-disc list-inside text-gray-700 space-y-1">
                          {job.job_highlights.Responsibilities.map((resp, rIndex) => (
                            <li key={rIndex} className="text-sm">{resp}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default JobSearchComponent;