import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TbTarget,
  TbBrain,
  TbCode,
  TbBook,
  TbCheck,
  TbClock,
  TbStar,
  TbArrowRight,
  TbExternalLink,
  TbBulb,
  TbRoadSign,
  TbTrendingUp,
  TbCircleCheck,
  TbCircleDot,
  TbCircle,
} from "react-icons/tb";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const Moat = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedRoadmapItem, setSelectedRoadmapItem] = useState(null);

  useEffect(() => {
    fetchJobReadinessData();
  }, []);

  const fetchJobReadinessData = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/moat/analyze`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            // Empty body - backend will use hardcoded data
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      if (result.success) {
        setData(result.data);
      } else {
        console.error("API Error:", result.message);
        // Fallback to hardcoded data if API fails
        setData({
          readinessScore: 80,
          skillComparison: {
            matching: ["javascript", "node.js", "mongodb", "react"],
            missing: ["rest apis"],
            total: 5,
          },
          roadmap: [
            {
              id: 1,
              title: "Master REST APIs",
              description:
                "Build comprehensive knowledge of REST API design and implementation",
              duration: "2-3 weeks",
              priority: "high",
              status: "pending",
            },
            {
              id: 2,
              title: "Advanced React Patterns",
              description: "Learn advanced React patterns and state management",
              duration: "3-4 weeks",
              priority: "medium",
              status: "in-progress",
            },
          ],
          projects: [
            {
              id: 1,
              title: "Full-Stack Task Manager",
              description: "Build a comprehensive task management application",
              technologies: ["React", "Node.js", "MongoDB"],
              features: [
                "User authentication",
                "Task CRUD operations",
                "Real-time updates",
              ],
              approach:
                "Start with backend API, then build React frontend with state management",
              difficulty: "Intermediate",
              duration: "3-4 weeks",
            },
          ],
          blogs: [
            {
              id: 1,
              title: "Building Scalable REST APIs with Node.js",
              description:
                "Learn best practices for API design and implementation",
              category: "Technical",
              readTime: "8-12 minutes",
              url: "https://medium.com/nodejs-rest-api-best-practices",
            },
          ],
          jobInfo: {
            id: 1,
            company_name: "TechNova Solutions",
            job_title: "Software Engineer",
            job_description:
              "Develop and maintain scalable software solutions for our clients. Collaborate with cross-functional teams to define, design, and ship new features.",
            required_skills: [
              "JavaScript",
              "React",
              "Node.js",
              "MongoDB",
              "REST APIs",
            ],
            experience_level: "Entry Level",
            education_requirements:
              "Bachelor's in Computer Science or related field",
            stipend: "$5,000/month during probation",
            salary: "$85,000 - $100,000 per year",
            location: "San Francisco, CA (Hybrid)",
            job_type: "Full-time",
            benefits: [
              "Health insurance",
              "401(k) matching",
              "Flexible work hours",
              "Stock options",
            ],
            application_deadline: "2023-12-15",
          },
        });
      }
    } catch (error) {
      console.error("Error fetching job readiness data:", error);
      // Fallback to hardcoded data
      setData({
        readinessScore: 80,
        skillComparison: {
          matching: ["javascript", "node.js", "mongodb", "react"],
          missing: ["rest apis"],
          total: 5,
        },
        roadmap: [
          {
            id: 1,
            title: "Master REST APIs",
            description:
              "Build comprehensive knowledge of REST API design and implementation",
            duration: "2-3 weeks",
            priority: "high",
            status: "pending",
          },
          {
            id: 2,
            title: "Advanced React Patterns",
            description: "Learn advanced React patterns and state management",
            duration: "3-4 weeks",
            priority: "medium",
            status: "in-progress",
          },
        ],
        projects: [
          {
            id: 1,
            title: "Full-Stack Task Manager",
            description: "Build a comprehensive task management application",
            technologies: ["React", "Node.js", "MongoDB"],
            features: [
              "User authentication",
              "Task CRUD operations",
              "Real-time updates",
            ],
            approach:
              "Start with backend API, then build React frontend with state management",
            difficulty: "Intermediate",
            duration: "3-4 weeks",
          },
        ],
        blogs: [
          {
            id: 1,
            title: "Building Scalable REST APIs with Node.js",
            description:
              "Learn best practices for API design and implementation",
            category: "Technical",
            readTime: "8-12 minutes",
            url: "https://medium.com/nodejs-rest-api-best-practices",
          },
        ],
        jobInfo: {
          id: 1,
          company_name: "TechNova Solutions",
          job_title: "Software Engineer",
          job_description:
            "Develop and maintain scalable software solutions for our clients. Collaborate with cross-functional teams to define, design, and ship new features.",
          required_skills: [
            "JavaScript",
            "React",
            "Node.js",
            "MongoDB",
            "REST APIs",
          ],
          experience_level: "Entry Level",
          education_requirements:
            "Bachelor's in Computer Science or related field",
          stipend: "$5,000/month during probation",
          salary: "$85,000 - $100,000 per year",
          location: "San Francisco, CA (Hybrid)",
          job_type: "Full-time",
          benefits: [
            "Health insurance",
            "401(k) matching",
            "Flexible work hours",
            "Stock options",
          ],
          application_deadline: "2023-12-15",
        },
      });
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBackground = (score) => {
    if (score >= 80) return "from-green-100 to-green-50";
    if (score >= 60) return "from-yellow-100 to-yellow-50";
    return "from-red-100 to-red-50";
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-700 border-red-200";
      case "medium":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "low":
        return "bg-green-100 text-green-700 border-green-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return <TbCircleCheck className="w-5 h-5 text-green-600" />;
      case "in-progress":
        return <TbCircleDot className="w-5 h-5 text-yellow-600" />;
      case "pending":
        return <TbCircle className="w-5 h-5 text-gray-400" />;
      default:
        return <TbCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case "beginner":
        return "bg-green-100 text-green-700 border-green-200";
      case "intermediate":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "advanced":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Failed to load data
          </h2>
          <Button onClick={fetchJobReadinessData}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Job Readiness Assessment
          </h1>
          <p className="text-muted-foreground">
            {data.jobInfo.job_title} at {data.jobInfo.company_name}
          </p>
        </motion.div>

        {/* Readiness Score */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <Card
            className={`bg-gradient-to-r ${getScoreBackground(
              data.readinessScore
            )} border-2`}
          >
            <CardContent className="p-8">
              <div className="flex items-center justify-center space-x-4">
                <div className="text-center">
                  <div
                    className={`text-6xl font-bold ${getScoreColor(
                      data.readinessScore
                    )} mb-2`}
                  >
                    {data.readinessScore}%
                  </div>
                  <div className="text-lg font-semibold text-foreground">
                    Job Readiness Score
                  </div>
                </div>
                <TbTarget className="w-16 h-16 text-primary" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Skill Comparison */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TbBrain className="w-6 h-6" />
                <span>Skill Analysis</span>
              </CardTitle>
              <CardDescription>
                Compare your skills with job requirements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-green-600 mb-3 flex items-center">
                    <TbCheck className="w-5 h-5 mr-2" />
                    Matching Skills ({data.skillComparison.matching.length})
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {data.skillComparison.matching.map((skill, index) => (
                      <motion.div
                        key={skill}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Badge
                          variant="secondary"
                          className="bg-green-100 text-green-700 border-green-200 shadow-sm hover:shadow-md transition-shadow animate-pulse"
                        >
                          {skill}
                        </Badge>
                      </motion.div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-yellow-600 mb-3 flex items-center">
                    <TbClock className="w-5 h-5 mr-2" />
                    Skills to Develop ({data.skillComparison.missing.length})
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {data.skillComparison.missing.map((skill, index) => (
                      <motion.div
                        key={skill}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Badge
                          variant="outline"
                          className="bg-yellow-50 text-yellow-700 border-yellow-200 shadow-sm hover:shadow-md transition-shadow"
                        >
                          {skill}
                        </Badge>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Roadmap */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TbRoadSign className="w-6 h-6" />
                <span>Learning Roadmap</span>
              </CardTitle>
              <CardDescription>
                Your personalized path to job readiness
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.roadmap.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="group"
                  >
                    <div
                      className="p-4 border rounded-lg cursor-pointer hover:shadow-md transition-all duration-300 hover:border-primary/50"
                      onClick={() =>
                        setSelectedRoadmapItem(
                          selectedRoadmapItem === item.id ? null : item.id
                        )
                      }
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {getStatusIcon(item.status)}
                          <div>
                            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                              {item.title}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {item.duration}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={getPriorityColor(item.priority)}>
                            {item.priority}
                          </Badge>
                          <TbArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                      </div>
                      <AnimatePresence>
                        {selectedRoadmapItem === item.id && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-3 pt-3 border-t"
                          >
                            <p className="text-muted-foreground">
                              {item.description}
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Project-Based Learning */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TbCode className="w-6 h-6" />
                <span>Project-Based Learning</span>
              </CardTitle>
              <CardDescription>
                Build real-world projects to enhance your skills
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {data.projects.map((project, index) => (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="group"
                  >
                    <Card className="h-full hover:shadow-lg transition-shadow duration-300 cursor-pointer">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <TbBulb className="w-8 h-8 text-primary" />
                          <Badge
                            className={getDifficultyColor(project.difficulty)}
                          >
                            {project.difficulty}
                          </Badge>
                        </div>
                        <CardTitle className="text-lg group-hover:text-primary transition-colors">
                          {project.title}
                        </CardTitle>
                        <CardDescription>{project.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <h4 className="font-semibold text-sm mb-2">
                            Technologies:
                          </h4>
                          <div className="flex flex-wrap gap-1">
                            {project.technologies?.map((tech, techIndex) => (
                              <Badge
                                key={techIndex}
                                variant="outline"
                                className="text-xs"
                              >
                                {tech}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm mb-2">
                            Key Features:
                          </h4>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            {project.features
                              ?.slice(0, 3)
                              .map((feature, featureIndex) => (
                                <li
                                  key={featureIndex}
                                  className="flex items-start"
                                >
                                  <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 mr-2 flex-shrink-0"></span>
                                  {feature}
                                </li>
                              ))}
                          </ul>
                        </div>
                        <div className="pt-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">
                              Duration: {project.duration}
                            </span>
                            <TbArrowRight className="w-4 h-4 text-primary" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recommended Blogs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-8"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TbBook className="w-6 h-6" />
                <span>Recommended Reading</span>
              </CardTitle>
              <CardDescription>
                Stay updated with industry trends and best practices
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.blogs.map((blog, index) => (
                  <motion.div
                    key={blog.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="group"
                  >
                    <div className="p-4 border rounded-lg hover:shadow-md transition-all duration-300 cursor-pointer hover:border-primary/50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <Badge variant="outline" className="text-xs">
                              {blog.category}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {blog.readTime}
                            </span>
                          </div>
                          <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors mb-2">
                            {blog.title}
                          </h3>
                          <p className="text-sm text-muted-foreground mb-3">
                            {blog.description}
                          </p>
                        </div>
                        <TbExternalLink className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors ml-4" />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Moat;
