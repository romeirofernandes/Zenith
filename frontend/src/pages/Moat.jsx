"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  TbTarget,
  TbBrain,
  TbCode,
  TbBook,
  TbCheck,
  TbClock,
  TbArrowRight,
  TbExternalLink,
  TbBulb,
  TbRoadSign,
  TbCircleCheck,
  TbCircleDot,
  TbCircle,
} from "react-icons/tb"
import { auth } from "../config/firebase" // adjust path if needed
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const Moat = () => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [selectedRoadmapItem, setSelectedRoadmapItem] = useState(null)
  const [jobId, setJobId] = useState("")
  const [userId, setUserId] = useState("") // will be set automatically
  const [error, setError] = useState("")

  // Get current user ID on mount
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUserId(user.uid)
        user.getIdToken().then((token) => {
          localStorage.setItem("authToken", token)
        })
      } else {
        setUserId("")
        localStorage.removeItem("authToken")
      }
    })
    return () => unsubscribe()
  }, [])

  const fetchJobReadinessData = async (e) => {
    if (e) e.preventDefault()
    setLoading(true)
    setError("")
    setData(null)
    try {
      const token = localStorage.getItem("authToken") // Or get from your auth context
      const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/moat/analyze`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          jobId,
          userId,
        }),
      })
      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.message || `HTTP error! status: ${response.status}`)
      }
      const result = await response.json()
      if (result.success) {
        console.log("Received data from backend:", result.data)
        console.log("Skill comparison:", result.data.skillComparison)
        setData(result.data)
      } else {
        setError(result.message || "API Error")
      }
    } catch (error) {
      setError(error.message || "Error fetching job readiness data")
    } finally {
      setLoading(false)
    }
  }

  const getScoreColor = (score) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const getScoreBackground = (score) => {
    if (score >= 80) return "from-green-100 to-green-50"
    if (score >= 60) return "from-yellow-100 to-yellow-50"
    return "from-red-100 to-red-50"
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-700 border-red-200"
      case "medium":
        return "bg-yellow-100 text-yellow-700 border-yellow-200"
      case "low":
        return "bg-green-100 text-green-700 border-green-200"
      default:
        return "bg-gray-100 text-gray-700 border-gray-200"
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return <TbCircleCheck className="w-5 h-5 text-green-600" />
      case "in-progress":
        return <TbCircleDot className="w-5 h-5 text-yellow-600" />
      case "pending":
        return <TbCircle className="w-5 h-5 text-gray-400" />
      default:
        return <TbCircle className="w-5 h-5 text-gray-400" />
    }
  }

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case "beginner":
        return "bg-green-100 text-green-700 border-green-200"
      case "intermediate":
        return "bg-yellow-100 text-yellow-700 border-yellow-200"
      case "advanced":
        return "bg-red-100 text-red-700 border-red-200"
      default:
        return "bg-gray-100 text-gray-700 border-gray-200"
    }
  }

  const getTimelineColors = (index) => {
    const colors = [
      { bg: "bg-blue-500", border: "border-blue-200", text: "text-blue-600" },
      { bg: "bg-purple-500", border: "border-purple-200", text: "text-purple-600" },
      { bg: "bg-green-500", border: "border-green-200", text: "text-green-600" },
      { bg: "bg-orange-500", border: "border-orange-200", text: "text-orange-600" },
      { bg: "bg-pink-500", border: "border-pink-200", text: "text-pink-600" },
      { bg: "bg-indigo-500", border: "border-indigo-200", text: "text-indigo-600" },
    ]
    return colors[index % colors.length]
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
          className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full"
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Form to input jobId and userId */}
        <form onSubmit={fetchJobReadinessData} className="mb-8 flex flex-col md:flex-row gap-4 items-center">
          <input
            type="text"
            placeholder="Job ID"
            value={jobId}
            onChange={(e) => setJobId(e.target.value)}
            className="border rounded px-3 py-2"
            required
          />
          {/* User ID is auto-filled and read-only */}
          <input
            type="text"
            placeholder="User ID"
            value={userId}
            readOnly
            className="border rounded px-3 py-2 bg-gray-100"
          />
          <Button type="submit" disabled={!userId}>
            Analyze
          </Button>
        </form>

        {error && <div className="mb-4 text-red-600 font-semibold">{error}</div>}

        {/* If no data yet, show nothing else */}
        {!data && !loading && (
          <div className="text-center text-muted-foreground">Enter Job ID and User ID to analyze job readiness.</div>
        )}

        {/* ...rest of your UI, unchanged, only render if data exists... */}
        {data && (
          <>
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
              <h1 className="text-4xl font-bold text-foreground mb-2">Job Readiness Assessment</h1>
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
              <Card className={`bg-gradient-to-r ${getScoreBackground(data.readinessScore)} border-2`}>
                <CardContent className="p-8">
                  <div className="flex items-center justify-center space-x-4">
                    <div className="text-center">
                      <div className={`text-6xl font-bold ${getScoreColor(data.readinessScore)} mb-2`}>
                        {data.readinessScore}%
                      </div>
                      <div className="text-lg font-semibold text-foreground">Job Readiness Score</div>
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
                  <CardDescription>Compare your skills with job requirements</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold text-green-600 mb-3 flex items-center">
                        <TbCheck className="w-5 h-5 mr-2" />
                        Matching Skills ({data.skillComparison?.matching?.length || 0})
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {data.skillComparison?.matching?.map((skill, index) => (
                          <motion.div
                            key={`${skill}-${index}`}
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
                        Skills to Develop ({data.skillComparison?.missing?.length || 0})
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {data.skillComparison?.missing?.map((skill, index) => (
                          <motion.div
                            key={`${skill}-${index}`}
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

            {/* Timeline Roadmap */}
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
                    <span>Learning Timeline</span>
                  </CardTitle>
                  <CardDescription>Your personalized roadmap to job readiness</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="relative">
                    {/* Timeline Container */}
                    <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start space-y-8 lg:space-y-0 lg:space-x-4">
                      {/* Curved Line for Desktop */}
                      <div className="hidden lg:block absolute top-16 left-0 right-0 h-1">
                        <svg
                          className="w-full h-20"
                          viewBox="0 0 800 80"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M0 40 Q200 10 400 40 T800 40"
                            stroke="#e5e7eb"
                            strokeWidth="3"
                            fill="none"
                            strokeDasharray="5,5"
                          />
                        </svg>
                      </div>

                      {/* Timeline Items */}
                      {data.roadmap.map((item, index) => {
                        const colors = getTimelineColors(index)
                        return (
                          <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.2 }}
                            className="relative flex-1 max-w-xs mx-auto lg:mx-0"
                          >
                            {/* Timeline Number Circle */}
                            <div className="flex justify-center mb-4">
                              <motion.div
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                className={`relative w-16 h-16 ${colors.bg} rounded-full flex items-center justify-center shadow-lg cursor-pointer z-10`}
                                onClick={() => setSelectedRoadmapItem(selectedRoadmapItem === item.id ? null : item.id)}
                              >
                                <span className="text-white font-bold text-xl">{index + 1}</span>
                                {/* Status indicator */}
                                <div className="absolute -top-1 -right-1">{getStatusIcon(item.status)}</div>
                              </motion.div>
                            </div>

                            {/* Timeline Card */}
                            <motion.div
                              whileHover={{ y: -5 }}
                              className={`bg-white rounded-xl shadow-lg border-2 ${colors.border} p-6 cursor-pointer transition-all duration-300 hover:shadow-xl`}
                              onClick={() => setSelectedRoadmapItem(selectedRoadmapItem === item.id ? null : item.id)}
                            >
                              {/* Card Header */}
                              <div className="text-center mb-4">
                                <h3 className={`font-bold text-lg ${colors.text} mb-2`}>{item.title}</h3>
                                <div className="flex justify-center items-center space-x-2 mb-3">
                                  <Badge className={getPriorityColor(item.priority)}>{item.priority}</Badge>
                                  <span className="text-sm text-gray-500">{item.duration}</span>
                                </div>
                              </div>

                              {/* Card Content */}
                              <div className="text-center">
                                <p className="text-gray-600 text-sm leading-relaxed">
                                  {item.description?.substring(0, 100)}
                                  {item.description?.length > 100 ? "..." : ""}
                                </p>
                              </div>

                              {/* Expandable Details */}
                              <AnimatePresence>
                                {selectedRoadmapItem === item.id && (
                                  <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="mt-4 pt-4 border-t border-gray-200"
                                  >
                                    <div className="space-y-3">
                                      <div>
                                        <h4 className="font-semibold text-sm text-gray-700 mb-1">Full Description:</h4>
                                        <p className="text-sm text-gray-600">{item.description}</p>
                                      </div>

                                      {item.skills && (
                                        <div>
                                          <h4 className="font-semibold text-sm text-gray-700 mb-2">Skills Covered:</h4>
                                          <div className="flex flex-wrap gap-1">
                                            {item.skills.map((skill, skillIndex) => (
                                              <Badge key={skillIndex} variant="outline" className="text-xs">
                                                {skill}
                                              </Badge>
                                            ))}
                                          </div>
                                        </div>
                                      )}

                                      {item.resources && (
                                        <div>
                                          <h4 className="font-semibold text-sm text-gray-700 mb-2">Resources:</h4>
                                          <ul className="text-xs text-gray-600 space-y-1">
                                            {item.resources.slice(0, 3).map((resource, resIndex) => (
                                              <li key={resIndex} className="flex items-start">
                                                <span className="w-1 h-1 bg-gray-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                                                {resource}
                                              </li>
                                            ))}
                                          </ul>
                                        </div>
                                      )}
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>

                              {/* Click indicator */}
                              <div className="flex justify-center mt-4">
                                <motion.div
                                  animate={{
                                    rotate: selectedRoadmapItem === item.id ? 90 : 0,
                                  }}
                                  transition={{ duration: 0.3 }}
                                >
                                  <TbArrowRight className={`w-5 h-5 ${colors.text}`} />
                                </motion.div>
                              </div>
                            </motion.div>

                            {/* Vertical line for mobile */}
                            {index < data.roadmap.length - 1 && (
                              <div className="lg:hidden flex justify-center mt-6">
                                <div className="w-0.5 h-8 bg-gray-300 rounded-full"></div>
                              </div>
                            )}
                          </motion.div>
                        )
                      })}
                    </div>
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
                  <CardDescription>Build real-world projects to enhance your skills</CardDescription>
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
                              <Badge className={getDifficultyColor(project.difficulty)}>{project.difficulty}</Badge>
                            </div>
                            <CardTitle className="text-lg group-hover:text-primary transition-colors">
                              {project.title}
                            </CardTitle>
                            <CardDescription>{project.description}</CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div>
                              <h4 className="font-semibold text-sm mb-2">Technologies:</h4>
                              <div className="flex flex-wrap gap-1">
                                {project.technologies?.map((tech, techIndex) => (
                                  <Badge key={techIndex} variant="outline" className="text-xs">
                                    {tech}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            <div>
                              <h4 className="font-semibold text-sm mb-2">Key Features:</h4>
                              <ul className="text-sm text-muted-foreground space-y-1">
                                {project.features?.slice(0, 3).map((feature, featureIndex) => (
                                  <li key={featureIndex} className="flex items-start">
                                    <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 mr-2 flex-shrink-0"></span>
                                    {feature}
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div className="pt-2">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Duration: {project.duration}</span>
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
                  <CardDescription>Stay updated with industry trends and best practices</CardDescription>
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
                                <span className="text-sm text-muted-foreground">{blog.readTime}</span>
                              </div>
                              <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors mb-2">
                                {blog.title}
                              </h3>
                              <p className="text-sm text-muted-foreground mb-3">{blog.description}</p>
                            </div>
                            <a href={blog.url} target="_blank" rel="noopener noreferrer">
                              <TbExternalLink className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors ml-4" />
                            </a>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </>
        )}
      </div>
    </div>
  )
}

export default Moat
