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
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import WishlistButton from "@/components/ui/WishlistButton";
import {
  Search,
  MapPin,
  Clock,
  DollarSign,
  Heart,
  Filter,
  X,
  Building,
  GraduationCap,
  Calendar,
  Gift,
} from "lucide-react";

const apiUrl = import.meta.env.VITE_API_URL;

export default function Jobs({ currentUser }) {
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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
        setLoading(true);
        const response = await fetch(`${apiUrl}/jobs/all`);
        if (!response.ok) throw new Error("Failed to fetch jobs");
        const data = await response.json();
        const jobData = data.jobs || data;
        setJobs(jobData);
        setFilteredJobs(jobData);
      } catch (error) {
        console.error("Error loading jobs from API:", error);
        setError("Failed to load jobs. Please try again later.");
      } finally {
        setLoading(false);
      }
    }
    loadJobs();
  }, []);

  // Apply filters
  useEffect(() => {
    let results = jobs;

    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      results = results.filter(
        (job) =>
          job.company_name?.toLowerCase().includes(searchTerm) ||
          job.job_title?.toLowerCase().includes(searchTerm) ||
          job.job_description?.toLowerCase().includes(searchTerm) ||
          job.required_skills?.some((skill) =>
            skill.toLowerCase().includes(searchTerm)
          )
      );
    }

    if (filters.jobType) {
      results = results.filter((job) => job.job_type === filters.jobType);
    }

    if (filters.experienceLevel) {
      results = results.filter((job) =>
        job.experience_level?.includes(filters.experienceLevel)
      );
    }

    if (filters.location) {
      results = results.filter((job) =>
        job.location?.toLowerCase().includes(filters.location.toLowerCase())
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

  const hasActiveFilters = Object.values(filters).some(
    (filter) => filter !== ""
  );

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-10" />
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="p-4">
                <div className="space-y-3">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-16 w-full" />
                  <div className="flex gap-2">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-16" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert className="max-w-md mx-auto">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 lg:py-8">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 lg:mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold mb-4 lg:mb-0">
          Job Listings
        </h1>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>
            Showing {filteredJobs.length}{" "}
            {filteredJobs.length === 1 ? "job" : "jobs"}
          </span>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6 lg:mb-8">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <CardTitle className="text-lg">Filters</CardTitle>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={resetFilters}
                className="ml-auto"
              >
                <X className="h-4 w-4 mr-1" />
                Clear All
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search jobs, companies, or skills..."
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                className="pl-10"
              />
            </div>

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

            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Location"
                value={filters.location}
                onChange={(e) => handleFilterChange("location", e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Job Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
        {filteredJobs.map((job) => (
          <Dialog key={job._id}>
            <DialogTrigger asChild>
              <Card className="cursor-pointer hover:shadow-md transition-all duration-200 group">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg group-hover:text-primary transition-colors line-clamp-1">
                        {job.job_title}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-1 mt-1">
                        <Building className="h-3 w-3" />
                        <span className="truncate">{job.company_name}</span>
                      </CardDescription>
                    </div>
                    <div onClick={(e) => e.stopPropagation()}>
                      <WishlistButton jobId={job._id} />
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pb-3">
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {job.job_description}
                  </p>

                  {job.required_skills && job.required_skills.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {job.required_skills.slice(0, 3).map((skill, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                      {job.required_skills.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{job.required_skills.length - 3} more
                        </Badge>
                      )}
                    </div>
                  )}
                </CardContent>

                <CardFooter className="pt-0">
                  <div className="flex items-center justify-between w-full text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      <span className="truncate">{job.location}</span>
                    </div>
                    {(job.salary || job.stipend) && (
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        <span className="font-medium text-foreground">
                          {job.salary || job.stipend}
                        </span>
                      </div>
                    )}
                  </div>
                </CardFooter>
              </Card>
            </DialogTrigger>

            <DialogContent className="max-w-2xl max-h-[90vh]">
              <DialogHeader>
                <DialogTitle className="text-xl">{job.job_title}</DialogTitle>
                <DialogDescription className="flex items-center gap-2">
                  <Building className="h-4 w-4" />
                  {job.company_name}
                </DialogDescription>
              </DialogHeader>

              <ScrollArea className="max-h-[60vh]">
                <div className="space-y-6 pr-4">
                  {/* Key Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Location</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {job.location}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Job Type</span>
                      </div>
                      <Badge variant="outline">{job.job_type}</Badge>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <GraduationCap className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Experience Level</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {job.experience_level}
                      </p>
                    </div>

                    {(job.salary || job.stipend) && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">Compensation</span>
                        </div>
                        <p className="text-sm font-medium text-green-600">
                          {job.salary || job.stipend}
                        </p>
                      </div>
                    )}
                  </div>

                  <Separator />

                  {/* Job Description */}
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold">Job Description</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {job.job_description}
                    </p>
                  </div>

                  {/* Required Skills */}
                  {job.required_skills && job.required_skills.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-lg font-semibold">Required Skills</h3>
                      <div className="flex flex-wrap gap-2">
                        {job.required_skills.map((skill, i) => (
                          <Badge key={i} variant="secondary">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Education Requirements */}
                  {job.education_requirements && (
                    <div className="space-y-3">
                      <h3 className="text-lg font-semibold">
                        Education Requirements
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {job.education_requirements}
                      </p>
                    </div>
                  )}

                  {/* Benefits */}
                  {job.benefits && job.benefits.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Gift className="h-4 w-4 text-muted-foreground" />
                        <h3 className="text-lg font-semibold">Benefits</h3>
                      </div>
                      <ul className="space-y-2">
                        {job.benefits.map((benefit, i) => (
                          <li
                            key={i}
                            className="flex items-start gap-2 text-sm text-muted-foreground"
                          >
                            <span className="text-primary mt-1">•</span>
                            {benefit}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Application Deadline */}
                  {job.application_deadline && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <h3 className="text-lg font-semibold">
                          Application Deadline
                        </h3>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {new Date(
                          job.application_deadline
                        ).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>
              </ScrollArea>

              <DialogFooter>
                <WishlistButton jobId={job._id} className="w-full sm:w-auto" />
              </DialogFooter>
            </DialogContent>
          </Dialog>
        ))}
      </div>

      {/* No Results */}
      {filteredJobs.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="mx-auto max-w-md">
            <h3 className="text-lg font-medium mb-2">No jobs found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search filters or check back later for new
              opportunities.
            </p>
            {hasActiveFilters && (
              <Button variant="outline" onClick={resetFilters}>
                Clear all filters
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
