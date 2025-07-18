import React, { useState, useEffect } from "react";
import { useWishlistContext } from "@/contexts/WishlistContext";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/config/firebase";
import {
  Heart,
  MapPin,
  Calendar,
  DollarSign,
  Briefcase,
  Clock,
  GraduationCap,
  X,
  Building,
  Eye,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

const WishList = () => {
  const [wishlistJobs, setWishlistJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const { removeFromWishlist, refreshWishlist } = useWishlistContext();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      console.log("Firebase user in WishList:", firebaseUser);
      setUser(firebaseUser);
      if (firebaseUser?.uid) {
        fetchWishlistJobs(firebaseUser.uid);
      } else {
        setError("Please log in to view your wishlist");
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const fetchWishlistJobs = async (uid) => {
    try {
      setLoading(true);
      setError(null);

      console.log("Fetching wishlist for UID:", uid);
      const response = await fetch(
        `http://localhost:5000/api/jobs/wishlist/user/${uid}`
      );
      const data = await response.json();

      console.log("Wishlist response:", data);

      if (response.ok) {
        setWishlistJobs(data.wishlist || []);
      } else {
        setError(data.message || "Failed to fetch wishlist");
      }
    } catch (error) {
      console.error("Error fetching wishlist:", error);
      setError("Failed to fetch wishlist. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromWishlist = async (jobId, jobTitle) => {
    try {
      const result = await removeFromWishlist(jobId);
      if (result.success) {
        setWishlistJobs((prev) => prev.filter((job) => job._id !== jobId));
        toast.success(`${jobTitle} removed from wishlist`);
        refreshWishlist();
      } else {
        toast.error(result.message || "Failed to remove from wishlist");
      }
    } catch (error) {
      console.error("Error removing from wishlist:", error);
      toast.error("Something went wrong");
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getJobTypeColor = (jobType) => {
    switch (jobType?.toLowerCase()) {
      case "full-time":
        return "bg-green-100 text-green-800";
      case "internship":
        return "bg-blue-100 text-blue-800";
      case "part-time":
        return "bg-yellow-100 text-yellow-800";
      case "contract":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const isExpired = (deadline) => {
    return new Date(deadline) < new Date();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 mb-4">
          <Heart className="h-16 w-16 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-semibold">{error}</p>
        </div>
        <Button
          onClick={() => user?.uid && fetchWishlistJobs(user.uid)}
          variant="outline"
        >
          Try Again
        </Button>
      </div>
    );
  }

  if (wishlistJobs.length === 0) {
    return (
      <div className="text-center py-16">
        <Heart className="h-20 w-20 text-gray-300 mx-auto mb-6" />
        <h3 className="text-2xl font-semibold text-gray-900 mb-3">
          Your wishlist is empty
        </h3>
        <p className="text-gray-600 text-lg mb-6">
          Start adding jobs to your wishlist to keep track of opportunities
          you're interested in!
        </p>
        <Button
          onClick={() => (window.location.href = "/dashboard")}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Browse Jobs
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Wishlist</h1>
          <p className="text-gray-600">
            {wishlistJobs.length} {wishlistJobs.length === 1 ? "job" : "jobs"}{" "}
            saved for later
          </p>
        </div>
        <Button
          onClick={() => user?.uid && fetchWishlistJobs(user.uid)}
          variant="outline"
          size="sm"
        >
          Refresh
        </Button>
      </div>

      {/* Jobs Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {wishlistJobs.map((job) => (
          <Card
            key={job._id}
            className="group hover:shadow-lg transition-all duration-300 relative"
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-lg font-semibold text-gray-900 mb-1 line-clamp-1">
                    {job.job_title}
                  </CardTitle>
                  <div className="flex items-center gap-1 text-gray-600">
                    <Building className="h-4 w-4" />
                    <span className="text-sm font-medium truncate">
                      {job.company_name}
                    </span>
                  </div>
                </div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        handleRemoveFromWishlist(job._id, job.job_title)
                      }
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Remove from wishlist</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Job Info */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Badge className={getJobTypeColor(job.job_type)}>
                    {job.job_type}
                  </Badge>
                  {isExpired(job.application_deadline) && (
                    <Badge variant="destructive" className="text-xs">
                      Expired
                    </Badge>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    <span className="truncate">{job.location}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span className="truncate">{job.experience_level}</span>
                  </div>
                  {job.salary && (
                    <div className="flex items-center gap-1 col-span-2">
                      <DollarSign className="h-3 w-3" />
                      <span className="font-medium text-green-600">
                        {job.salary}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Skills Preview */}
              {job.required_skills && job.required_skills.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {job.required_skills.slice(0, 3).map((skill, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
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

              {/* Application Deadline */}
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Calendar className="h-3 w-3" />
                <span>Apply by {formatDate(job.application_deadline)}</span>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Eye className="h-4 w-4 mr-1" />
                      View Details
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh]">
                    <DialogHeader>
                      <DialogTitle className="text-xl">
                        {job.job_title}
                      </DialogTitle>
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
                              <Briefcase className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">Job Type</span>
                            </div>
                            <Badge className={getJobTypeColor(job.job_type)}>
                              {job.job_type}
                            </Badge>
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">
                                Experience Level
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {job.experience_level}
                            </p>
                          </div>

                          {job.salary && (
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-sm">
                                <DollarSign className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">Salary</span>
                              </div>
                              <p className="text-sm font-medium text-green-600">
                                {job.salary}
                              </p>
                            </div>
                          )}
                        </div>

                        <Separator />

                        {/* Description */}
                        <div className="space-y-3">
                          <h3 className="text-lg font-semibold">
                            Job Description
                          </h3>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {job.job_description}
                          </p>
                        </div>

                        {/* Skills */}
                        {job.required_skills &&
                          job.required_skills.length > 0 && (
                            <div className="space-y-3">
                              <h3 className="text-lg font-semibold">
                                Required Skills
                              </h3>
                              <div className="flex flex-wrap gap-2">
                                {job.required_skills.map((skill, index) => (
                                  <Badge key={index} variant="secondary">
                                    {skill}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                        {/* Education */}
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
                            <h3 className="text-lg font-semibold">Benefits</h3>
                            <ul className="space-y-1">
                              {job.benefits.map((benefit, index) => (
                                <li
                                  key={index}
                                  className="flex items-start gap-2 text-sm text-muted-foreground"
                                >
                                  <span className="text-primary mt-1">•</span>
                                  {benefit}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Deadline */}
                        <div className="space-y-3">
                          <h3 className="text-lg font-semibold">
                            Application Deadline
                          </h3>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span
                              className={`text-sm ${
                                isExpired(job.application_deadline)
                                  ? "text-red-600 font-medium"
                                  : "text-muted-foreground"
                              }`}
                            >
                              {formatDate(job.application_deadline)}
                              {isExpired(job.application_deadline) &&
                                " (Expired)"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </ScrollArea>

                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() =>
                          handleRemoveFromWishlist(job._id, job.job_title)
                        }
                      >
                        <X className="h-4 w-4 mr-2" />
                        Remove from Wishlist
                      </Button>
                      <Button
                        className="bg-blue-600 hover:bg-blue-700"
                        disabled={isExpired(job.application_deadline)}
                      >
                        {isExpired(job.application_deadline)
                          ? "Expired"
                          : "Apply Now"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <Button
                  size="sm"
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  disabled={isExpired(job.application_deadline)}
                >
                  {isExpired(job.application_deadline)
                    ? "Expired"
                    : "Apply Now"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default WishList;
