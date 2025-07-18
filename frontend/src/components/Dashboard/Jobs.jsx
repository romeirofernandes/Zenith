import axios from "axios";

import { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const apiUrl = import.meta.env.VITE_API_URL;

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [filters, setFilters] = useState({
    search: "",
    jobType: "",
    experienceLevel: "",
    location: "",
  });

  // Load jobs from backend
  useEffect(() => {
    async function loadJobs() {
      try {
        const response = await fetch(`${apiUrl}/jobs/all`);
        const data = await response.json();
        const jobData = data.jobs || data; // adjust based on your API shape
        setJobs(jobData);
        setFilteredJobs(jobData);
      } catch (error) {
        console.error("Error loading jobs from API:", error);
      }
    }
    loadJobs();
  }, []);

  const handleAddToWishlist = async (jobId) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/jobs/wishlist/${jobId}`,
        {
          userId: currentUser._id, // wherever you store logged-in user
        }
      );
      console.log("Added to wishlist:", response.data);
    } catch (err) {
      console.error("Error adding to wishlist:", err);
    }
  };

  // Apply filters
  useEffect(() => {
    let results = jobs;

    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      results = results.filter(
        (job) =>
          job.company_name.toLowerCase().includes(searchTerm) ||
          job.job_title.toLowerCase().includes(searchTerm) ||
          job.job_description.toLowerCase().includes(searchTerm) ||
          job.required_skills.some((skill) =>
            skill.toLowerCase().includes(searchTerm)
          )
      );
    }

    if (filters.jobType) {
      results = results.filter((job) => job.job_type === filters.jobType);
    }

    if (filters.experienceLevel) {
      results = results.filter((job) =>
        job.experience_level.includes(filters.experienceLevel)
      );
    }

    if (filters.location) {
      results = results.filter((job) =>
        job.location.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    setFilteredJobs(results);
  }, [filters, jobs]);

  const handleFilterChange = (name, value) => {
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetFilters = () => {
    setFilters({
      search: "",
      jobType: "",
      experienceLevel: "",
      location: "",
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Job Listings</h1>

      {/* Filters */}
      <div className="mb-8 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Input
            placeholder="Search jobs, companies, or skills..."
            value={filters.search}
            onChange={(e) => handleFilterChange("search", e.target.value)}
          />

          <Select
            value={filters.jobType}
            onValueChange={(value) => handleFilterChange("jobType", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Job Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Full-time">Full-time</SelectItem>
              <SelectItem value="Internship">Internship</SelectItem>
              <SelectItem value="Part-time">Part-time</SelectItem>
              <SelectItem value="Contract">Contract</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.experienceLevel}
            onValueChange={(value) =>
              handleFilterChange("experienceLevel", value)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Experience Level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Entry Level">Entry Level</SelectItem>
              <SelectItem value="Mid Level">Mid Level</SelectItem>
              <SelectItem value="Senior Level">Senior Level</SelectItem>
              <SelectItem value="Internship">Internship</SelectItem>
            </SelectContent>
          </Select>

          <Input
            placeholder="Location"
            value={filters.location}
            onChange={(e) => handleFilterChange("location", e.target.value)}
          />
        </div>

        <Button variant="outline" onClick={resetFilters}>
          Reset Filters
        </Button>

        <p className="text-sm text-gray-500">
          Showing {filteredJobs.length}{" "}
          {filteredJobs.length === 1 ? "job" : "jobs"}
        </p>
      </div>

      {/* Job Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredJobs.map((job) => (
          <Dialog key={job._id}>
            <DialogTrigger asChild>
              <Card
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => setSelectedJob(job)}
              >
                <CardHeader>
                  <CardTitle>{job.job_title}</CardTitle>
                  <CardDescription>{job.company_name}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="line-clamp-2 text-sm">
                      {job.job_description}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {job.required_skills?.slice(0, 3).map((skill, i) => (
                        <span
                          key={i}
                          className="text-xs bg-gray-100 px-2 py-1 rounded"
                        >
                          {skill}
                        </span>
                      ))}
                      {job.required_skills?.length > 3 && (
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                          +{job.required_skills.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>

                <button
                  className="bg-blue-500 text-white px-3 py-1 rounded"
                  onClick={() => handleAddToWishlist(job._id)}
                >
                  Add to Wishlist
                </button>
                <CardFooter className="flex justify-between">
                  <span className="text-sm">{job.location}</span>
                  <span className="text-sm font-medium">
                    {job.salary || job.stipend}
                  </span>
                </CardFooter>
              </Card>
            </DialogTrigger>

            {selectedJob && selectedJob._id === job._id && (
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{selectedJob.job_title}</DialogTitle>
                  <DialogDescription>
                    {selectedJob.company_name}
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-semibold">Location</h3>
                      <p>{selectedJob.location}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold">Job Type</h3>
                      <p>{selectedJob.job_type}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold">Experience Level</h3>
                      <p>{selectedJob.experience_level}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold">Compensation</h3>
                      <p>{selectedJob.salary || selectedJob.stipend}</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold">Job Description</h3>
                    <p>{selectedJob.job_description}</p>
                  </div>

                  <div>
                    <h3 className="font-semibold">Required Skills</h3>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedJob.required_skills.map((skill, i) => (
                        <span
                          key={i}
                          className="text-sm bg-gray-100 px-2 py-1 rounded"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold">Education Requirements</h3>
                    <p>{selectedJob.education_requirements}</p>
                  </div>

                  {selectedJob.benefits && selectedJob.benefits.length > 0 && (
                    <div>
                      <h3 className="font-semibold">Benefits</h3>
                      <ul className="list-disc pl-5">
                        {selectedJob.benefits.map((benefit, i) => (
                          <li key={i}>{benefit}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {selectedJob.application_deadline && (
                    <div>
                      <h3 className="font-semibold">Application Deadline</h3>
                      <p>
                        {new Date(
                          selectedJob.application_deadline
                        ).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>
              </DialogContent>
            )}
          </Dialog>
        ))}
      </div>

      {filteredJobs.length === 0 && (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium">No jobs found</h3>
          <p className="text-gray-500">Try adjusting your search filters</p>
        </div>
      )}
    </div>
  );
}
