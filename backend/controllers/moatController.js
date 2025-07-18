require("dotenv").config();
const User = require("../models/User");

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_MODEL = "llama3-8b-8192";

const moatController = {
  // Generate job readiness analysis
  generateJobReadinessAnalysis: async (req, res) => {
    try {
      // Hardcoded sample data in backend
      const sampleJobDescription = {
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
      };

      const sampleResume = {
        softskills: ["Communication", "Teamwork", "Problem-Solving"],
        resumeText:
          "An experienced software engineer with a passion for building scalable applications.",
        skills: ["JavaScript", "Node.js", "MongoDB", "React"],
        experience: [
          {
            company: "Tech Solutions Inc.",
            position: "Software Engineer",
            startDate: "2020-01-01T00:00:00.000Z",
            endDate: "2023-06-01T00:00:00.000Z",
            description: "Worked on various backend services and APIs.",
          },
        ],
        education: [
          {
            institution: "University of Technology",
            degree: "Bachelor of Science",
            fieldOfStudy: "Computer Science",
            startYear: 2012,
            endYear: 2016,
            grade: "3.7 GPA",
          },
        ],
        coCurricular: ["Hackathons", "Open Source Contributions"],
        certifications: [
          {
            name: "AWS Certified Developer",
            issuer: "Amazon Web Services",
            date: "2022-05-15T00:00:00.000Z",
            credentials: "aws-cert-12345",
          },
        ],
        projects: [
          {
            title: "Portfolio Website",
            description: "A personal website showcasing projects and blogs.",
            link: "https://johndoe.dev",
          },
        ],
        summary:
          "Driven software engineer with a proven track record of delivering robust solutions.",
        linkedin: "https://linkedin.com/in/johndoe",
        profileLinks: [
          {
            platform: "GitHub",
            url: "https://github.com/johndoe",
          },
        ],
      };

      console.log("Generating job readiness analysis...");

      // Generate roadmap
      const roadmapPrompt = `
Based on this job description and candidate resume, create a personalized roadmap for the candidate to become job-ready.

Job: ${JSON.stringify(sampleJobDescription)}
Resume: ${JSON.stringify(sampleResume)}

Return ONLY a valid JSON array of roadmap steps with the following structure:
[
  {
    "id": 1,
    "title": "Master REST APIs",
    "description": "Build comprehensive knowledge of REST API design and implementation",
    "duration": "2-3 weeks",
    "priority": "high",
    "status": "pending"
  },
  {
    "id": 2,
    "title": "Advanced React Patterns",
    "description": "Learn advanced React patterns and state management",
    "duration": "3-4 weeks",
    "priority": "medium",
    "status": "in-progress"
  }
]

Make it practical and actionable. Focus on skill gaps and experience enhancement. Return only the JSON array, no additional text.
`;

      let roadmap = [];
      try {
        const roadmapResponse = await fetch(
          "https://api.groq.com/openai/v1/chat/completions",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${GROQ_API_KEY}`,
            },
            body: JSON.stringify({
              model: GROQ_MODEL,
              messages: [
                {
                  role: "system",
                  content:
                    "You are a career counselor expert. Always return valid JSON arrays only, no additional text or explanations.",
                },
                { role: "user", content: roadmapPrompt },
              ],
              temperature: 0.7,
              max_tokens: 1000,
            }),
          }
        );

        if (roadmapResponse.ok) {
          const roadmapData = await roadmapResponse.json();
          const roadmapText =
            roadmapData.choices?.[0]?.message?.content?.trim() || "[]";

          // Try to parse the JSON directly
          try {
            roadmap = JSON.parse(roadmapText);
          } catch (e) {
            console.error("Error parsing roadmap JSON:", e);
            // Fallback roadmap
            roadmap = [
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
                description:
                  "Learn advanced React patterns and state management",
                duration: "3-4 weeks",
                priority: "medium",
                status: "in-progress",
              },
            ];
          }
        }
      } catch (error) {
        console.error("Error generating roadmap:", error);
        roadmap = [
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
        ];
      }

      // Generate project suggestions
      const projectPrompt = `
Based on this job description and resume, suggest 3 project ideas that would help the candidate become job-ready.

Job: ${JSON.stringify(sampleJobDescription)}
Resume: ${JSON.stringify(sampleResume)}

Return ONLY a valid JSON array with this structure:
[
  {
    "id": 1,
    "title": "Full-Stack Task Manager",
    "description": "Build a comprehensive task management application",
    "technologies": ["React", "Node.js", "MongoDB"],
    "features": ["User authentication", "Task CRUD operations", "Real-time updates"],
    "approach": "Start with backend API, then build React frontend with state management",
    "difficulty": "Intermediate",
    "duration": "3-4 weeks"
  }
]

Return only the JSON array, no additional text.
`;

      let projects = [];
      try {
        const projectResponse = await fetch(
          "https://api.groq.com/openai/v1/chat/completions",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${GROQ_API_KEY}`,
            },
            body: JSON.stringify({
              model: GROQ_MODEL,
              messages: [
                {
                  role: "system",
                  content:
                    "You are a technical project advisor. Always return valid JSON arrays only, no additional text or explanations.",
                },
                { role: "user", content: projectPrompt },
              ],
              temperature: 0.7,
              max_tokens: 1000,
            }),
          }
        );

        if (projectResponse.ok) {
          const projectData = await projectResponse.json();
          const projectText =
            projectData.choices?.[0]?.message?.content?.trim() || "[]";

          try {
            projects = JSON.parse(projectText);
          } catch (e) {
            console.error("Error parsing projects JSON:", e);
            projects = [
              {
                id: 1,
                title: "Full-Stack Task Manager",
                description:
                  "Build a comprehensive task management application",
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
            ];
          }
        }
      } catch (error) {
        console.error("Error generating projects:", error);
        projects = [
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
        ];
      }

      // Generate blog recommendations
      const blogPrompt = `
Based on this job description and resume, recommend 5 blog topics/articles that would help the candidate prepare for this role.

Job: ${JSON.stringify(sampleJobDescription)}
Resume: ${JSON.stringify(sampleResume)}

Return ONLY a valid JSON array with this structure:
[
  {
    "id": 1,
    "title": "Building Scalable REST APIs with Node.js",
    "description": "Learn best practices for API design and implementation",
    "category": "Technical",
    "readTime": "8-12 minutes",
    "url": "https://medium.com/nodejs-rest-api-best-practices"
  }
]

Return only the JSON array, no additional text.
`;

      let blogs = [];
      try {
        const blogResponse = await fetch(
          "https://api.groq.com/openai/v1/chat/completions",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${GROQ_API_KEY}`,
            },
            body: JSON.stringify({
              model: GROQ_MODEL,
              messages: [
                {
                  role: "system",
                  content:
                    "You are a technical content curator. Always return valid JSON arrays only, no additional text or explanations.",
                },
                { role: "user", content: blogPrompt },
              ],
              temperature: 0.7,
              max_tokens: 1000,
            }),
          }
        );

        if (blogResponse.ok) {
          const blogData = await blogResponse.json();
          const blogText =
            blogData.choices?.[0]?.message?.content?.trim() || "[]";

          try {
            blogs = JSON.parse(blogText);
          } catch (e) {
            console.error("Error parsing blogs JSON:", e);
            blogs = [
              {
                id: 1,
                title: "Building Scalable REST APIs with Node.js",
                description:
                  "Learn best practices for API design and implementation",
                category: "Technical",
                readTime: "8-12 minutes",
                url: "https://medium.com/nodejs-rest-api-best-practices",
              },
            ];
          }
        }
      } catch (error) {
        console.error("Error generating blogs:", error);
        blogs = [
          {
            id: 1,
            title: "Building Scalable REST APIs with Node.js",
            description:
              "Learn best practices for API design and implementation",
            category: "Technical",
            readTime: "8-12 minutes",
            url: "https://medium.com/nodejs-rest-api-best-practices",
          },
        ];
      }

      // Calculate skill comparison
      const jobSkills =
        sampleJobDescription.required_skills?.map((skill) =>
          skill.toLowerCase()
        ) || [];
      const resumeSkills =
        sampleResume.skills?.map((skill) => skill.toLowerCase()) || [];

      const matchingSkills = jobSkills.filter((skill) =>
        resumeSkills.includes(skill)
      );
      const missingSkills = jobSkills.filter(
        (skill) => !resumeSkills.includes(skill)
      );

      const readinessScore =
        jobSkills.length > 0
          ? Math.round((matchingSkills.length / jobSkills.length) * 100)
          : 0;

      console.log("Analysis complete, sending response...");

      res.json({
        success: true,
        data: {
          readinessScore,
          skillComparison: {
            matching: matchingSkills,
            missing: missingSkills,
            total: jobSkills.length,
          },
          roadmap,
          projects,
          blogs,
          jobInfo: sampleJobDescription,
        },
      });
    } catch (error) {
      console.error("Error generating job readiness analysis:", error.message);
      res.status(500).json({
        success: false,
        message: "Failed to generate job readiness analysis",
        error: error.message,
      });
    }
  },
};

module.exports = moatController;
