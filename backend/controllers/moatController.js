require("dotenv").config();
const User = require("../models/User");
const Job = require("../models/Jobs");

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_MODEL = "llama3-8b-8192";

const moatController = {
  // Generate job readiness analysis
  generateJobReadinessAnalysis: async (req, res) => {
    try {
      const { jobId, userId } = req.body;

      if (!jobId || !userId) {
        return res.status(400).json({
          success: false,
          message: "Job ID and User ID are required",
        });
      }

      // Fetch job from database
      const job = await Job.findById(jobId);
      if (!job) {
        return res.status(404).json({
          success: false,
          message: "Job not found",
        });
      }

      // Fetch user resume data from database
      const user = await User.findOne({ firebaseUid: userId });
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      // Convert job document to plain object for API processing
      const jobDescription = {
        id: job._id,
        company_name: job.company_name,
        job_title: job.job_title,
        job_description: job.job_description,
        required_skills: job.required_skills,
        experience_level: job.experience_level,
        education_requirements: job.education_requirements,
        stipend: job.stipend,
        salary: job.salary,
        location: job.location,
        job_type: job.job_type,
        benefits: job.benefits,
        application_deadline: job.application_deadline,
      };

      // Extract resume data from user document
      const resumeData = {
        softskills: user.resume?.softskills || [],
        resumeText: user.resume?.resumeText || "",
        skills: user.resume?.skills || [],
        experience: user.resume?.experience || [],
        education: user.resume?.education || [],
        coCurricular: user.resume?.coCurricular || [],
        certifications: user.resume?.certifications || [],
        projects: user.resume?.projects || [],
        summary: user.resume?.summary || "",
        linkedin: user.resume?.linkedin || "",
        profileLinks: user.resume?.profileLinks || [],
      };

      console.log("Generating job readiness analysis...");

      // Helper function to clean and parse JSON from AI response
      const parseAIResponse = (responseText) => {
        try {
          // Remove any markdown code blocks or extra formatting
          let cleanedText = responseText.trim();
          
          // Remove markdown code blocks if present
          cleanedText = cleanedText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
          
          // Find JSON content between first { and last }
          const firstBrace = cleanedText.indexOf('{');
          const lastBrace = cleanedText.lastIndexOf('}');
          
          if (firstBrace !== -1 && lastBrace !== -1 && firstBrace < lastBrace) {
            cleanedText = cleanedText.substring(firstBrace, lastBrace + 1);
          }
          
          // Try to parse as JSON
          return JSON.parse(cleanedText);
        } catch (e) {
          console.error("Error parsing AI response:", e);
          return null;
        }
      };

      // Helper function to clean and parse JSON array from AI response
      const parseAIArrayResponse = (responseText) => {
        try {
          // Remove any markdown code blocks or extra formatting
          let cleanedText = responseText.trim();
          
          // Remove markdown code blocks if present
          cleanedText = cleanedText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
          
          // Find JSON array content between first [ and last ]
          const firstBracket = cleanedText.indexOf('[');
          const lastBracket = cleanedText.lastIndexOf(']');
          
          if (firstBracket !== -1 && lastBracket !== -1 && firstBracket < lastBracket) {
            cleanedText = cleanedText.substring(firstBracket, lastBracket + 1);
          }
          
          // Try to parse as JSON array
          return JSON.parse(cleanedText);
        } catch (e) {
          console.error("Error parsing AI array response:", e);
          return null;
        }
      };

      // Generate AI-powered job fit score
      const jobFitPrompt = `
Analyze the following job description and candidate resume to calculate a comprehensive job fit score.

Job Description:
${JSON.stringify(jobDescription)}

Candidate Resume:
${JSON.stringify(resumeData)}

Please evaluate the candidate's fit for this role based on:
1. Technical skills alignment (40% weight)
2. Experience level and relevance (25% weight)
3. Education requirements match (15% weight)
4. Soft skills compatibility (10% weight)
5. Industry/domain experience (10% weight)

Return ONLY a valid JSON object with this exact structure:
{
  "jobFitScore": 85,
  "breakdown": {
    "technicalSkills": {
      "score": 90,
      "reasoning": "Strong match in JavaScript, React, Node.js, and MongoDB. Missing REST APIs experience."
    },
    "experience": {
      "score": 80,
      "reasoning": "3+ years of software engineering experience aligns well with entry-level requirements."
    },
    "education": {
      "score": 100,
      "reasoning": "Bachelor's in Computer Science perfectly matches requirements."
    },
    "softSkills": {
      "score": 85,
      "reasoning": "Communication, teamwork, and problem-solving skills are well-suited for collaborative environment."
    },
    "industryExperience": {
      "score": 75,
      "reasoning": "Previous experience in tech solutions provides relevant industry background."
    }
  },
  "strengths": ["Strong technical foundation", "Relevant education", "Good soft skills"],
  "improvements": ["Gain REST API experience", "Build more scalable applications"],
  "overallRecommendation": "Strong candidate with minor skill gaps that can be addressed"
}

Return only the JSON object, no additional text.
`;

      let jobFitData = {
        jobFitScore: 75,
        breakdown: {
          technicalSkills: {
            score: 80,
            reasoning: "Good technical skills match but some gaps exist."
          },
          experience: {
            score: 75,
            reasoning: "Relevant experience but could be stronger."
          },
          education: {
            score: 85,
            reasoning: "Education requirements are well met."
          },
          softSkills: {
            score: 80,
            reasoning: "Strong soft skills for collaborative work."
          },
          industryExperience: {
            score: 70,
            reasoning: "Some industry experience but could be more relevant."
          }
        },
        strengths: ["Technical skills", "Education background"],
        improvements: ["Gain more experience", "Develop specific skills"],
        overallRecommendation: "Good candidate with room for improvement"
      };

      try {
        const jobFitResponse = await fetch(
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
                  content: "You are an expert HR analyst and career counselor. Always return valid JSON objects only, no additional text or explanations. Be thorough and accurate in your analysis.",
                },
                { role: "user", content: jobFitPrompt },
              ],
              temperature: 0.3,
              max_tokens: 1500,
            }),
          }
        );

        if (jobFitResponse.ok) {
          const jobFitResponseData = await jobFitResponse.json();
          const jobFitText = jobFitResponseData.choices?.[0]?.message?.content?.trim() || "{}";
          
          const parsedJobFit = parseAIResponse(jobFitText);
          if (parsedJobFit) {
            jobFitData = parsedJobFit;
            console.log("Job fit analysis generated successfully");
          }
        }
      } catch (error) {
        console.error("Error generating job fit score:", error);
      }

      // Generate roadmap
      const roadmapPrompt = `
Based on this job description and candidate resume, create a personalized roadmap for the candidate to become job-ready.

Job Description:
- Title: ${jobDescription.job_title}
- Company: ${jobDescription.company_name}
- Required Skills: ${JSON.stringify(jobDescription.required_skills)}
- Experience Level: ${jobDescription.experience_level}

Candidate Resume:
- Skills: ${JSON.stringify(resumeData.skills)}
- Experience: ${JSON.stringify(resumeData.experience)}
- Education: ${JSON.stringify(resumeData.education)}

Create a roadmap with 4-6 steps focusing on skill gaps and experience enhancement.

Return ONLY a valid JSON array with this exact structure:
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
    "status": "pending"
  }
]

Return only the JSON array, no additional text.
`;

      let roadmap = [
        {
          id: 1,
          title: "Skill Gap Analysis",
          description: "Identify and prioritize missing technical skills",
          duration: "1 week",
          priority: "high",
          status: "pending"
        },
        {
          id: 2,
          title: "Technical Skill Development",
          description: "Focus on acquiring the most critical missing skills",
          duration: "4-6 weeks",
          priority: "high",
          status: "pending"
        }
      ];

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
                  content: "You are a career counselor expert. Always return valid JSON arrays only, no additional text or explanations. Focus on practical, actionable steps.",
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
          const roadmapText = roadmapData.choices?.[0]?.message?.content?.trim() || "[]";
          
          const parsedRoadmap = parseAIArrayResponse(roadmapText);
          if (parsedRoadmap && Array.isArray(parsedRoadmap)) {
            roadmap = parsedRoadmap;
            console.log("Roadmap generated successfully");
          }
        }
      } catch (error) {
        console.error("Error generating roadmap:", error);
      }

      // Generate project suggestions - FIXED VERSION
      const projectPrompt = `
Based on this job description and candidate resume, suggest 3-5 project ideas that would help the candidate become job-ready.

Job Details:
- Title: ${jobDescription.job_title}
- Company: ${jobDescription.company_name}
- Required Skills: ${JSON.stringify(jobDescription.required_skills)}
- Experience Level: ${jobDescription.experience_level}

Candidate Profile:
- Current Skills: ${JSON.stringify(resumeData.skills)}
- Experience: ${JSON.stringify(resumeData.experience)}
- Projects: ${JSON.stringify(resumeData.projects)}

Create projects that bridge skill gaps and demonstrate relevant abilities.

Return ONLY a valid JSON array with this exact structure:
[
  {
    "id": 1,
    "title": "Full-Stack E-commerce Platform",
    "description": "Build a complete e-commerce application with user authentication, product catalog, shopping cart, and payment integration",
    "technologies": ["React", "Node.js", "MongoDB", "Express", "Stripe API"],
    "features": ["User authentication", "Product CRUD operations", "Shopping cart", "Payment processing", "Order management"],
    "approach": "Start with backend API development, then create React frontend with Redux for state management",
    "difficulty": "Advanced",
    "duration": "4-6 weeks"
  },
  {
    "id": 2,
    "title": "Real-time Chat Application",
    "description": "Develop a real-time messaging app with WebSocket integration and user presence tracking",
    "technologies": ["React", "Node.js", "Socket.io", "MongoDB"],
    "features": ["Real-time messaging", "User presence", "Chat rooms", "Message history"],
    "approach": "Implement WebSocket server, then build responsive React UI with real-time updates",
    "difficulty": "Intermediate",
    "duration": "3-4 weeks"
  }
]

Return only the JSON array, no additional text.
`;

      let projects = [
        {
          id: 1,
          title: "Task Management Application",
          description: "Build a comprehensive task management system with user authentication and real-time updates",
          technologies: ["React", "Node.js", "MongoDB"],
          features: ["User authentication", "Task CRUD operations", "Real-time updates", "Team collaboration"],
          approach: "Start with backend API development, then create React frontend with modern state management",
          difficulty: "Intermediate",
          duration: "3-4 weeks"
        },
        {
          id: 2,
          title: "Portfolio Website",
          description: "Create a professional portfolio website showcasing your skills and projects",
          technologies: ["React", "CSS3", "JavaScript"],
          features: ["Responsive design", "Project showcase", "Contact form", "SEO optimization"],
          approach: "Design-first approach with modern UI/UX principles and responsive layouts",
          difficulty: "Beginner",
          duration: "2-3 weeks"
        },
        {
          id: 3,
          title: "API Integration Project",
          description: "Build an application that integrates with multiple third-party APIs",
          technologies: ["JavaScript", "REST APIs", "JSON"],
          features: ["API integration", "Data visualization", "Error handling", "Rate limiting"],
          approach: "Focus on clean API architecture and robust error handling",
          difficulty: "Intermediate",
          duration: "2-3 weeks"
        }
      ];

      try {
        console.log("Generating project suggestions...");
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
                  content: "You are a technical project advisor and mentor. Always return valid JSON arrays only, no additional text or explanations. Create practical, skill-building projects.",
                },
                { role: "user", content: projectPrompt },
              ],
              temperature: 0.7,
              max_tokens: 1200,
            }),
          }
        );

        if (projectResponse.ok) {
          const projectData = await projectResponse.json();
          const projectText = projectData.choices?.[0]?.message?.content?.trim() || "[]";
          
          console.log("Raw project response:", projectText);
          
          const parsedProjects = parseAIArrayResponse(projectText);
          if (parsedProjects && Array.isArray(parsedProjects) && parsedProjects.length > 0) {
            projects = parsedProjects;
            console.log("Project suggestions generated successfully:", projects.length, "projects");
          } else {
            console.log("Using fallback project suggestions");
          }
        } else {
          console.error("Project API response not ok:", projectResponse.status);
        }
      } catch (error) {
        console.error("Error generating project suggestions:", error);
      }

      // Generate blog recommendations
      const blogPrompt = `
Based on this job description and resume, recommend 5 blog topics/articles that would help the candidate prepare for this role.

Job Details:
- Title: ${jobDescription.job_title}
- Required Skills: ${JSON.stringify(jobDescription.required_skills)}
- Experience Level: ${jobDescription.experience_level}

Candidate Skills: ${JSON.stringify(resumeData.skills)}

Return ONLY a valid JSON array with this structure:
[
  {
    "id": 1,
    "title": "Building Scalable REST APIs with Node.js",
    "description": "Learn best practices for API design and implementation",
    "category": "Technical",
    "readTime": "8-12 minutes",
    "url": "https://example.com/rest-api-guide"
  }
]

Return only the JSON array, no additional text.
`;

      let blogs = [
        {
          id: 1,
          title: "Modern JavaScript Best Practices",
          description: "Learn contemporary JavaScript patterns and techniques",
          category: "Technical",
          readTime: "10-15 minutes",
          url: "https://example.com/javascript-best-practices"
        }
      ];

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
                  content: "You are a technical content curator. Always return valid JSON arrays only, no additional text or explanations.",
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
          const blogText = blogData.choices?.[0]?.message?.content?.trim() || "[]";

          const parsedBlogs = parseAIArrayResponse(blogText);
          if (parsedBlogs && Array.isArray(parsedBlogs)) {
            blogs = parsedBlogs;
            console.log("Blog recommendations generated successfully");
          }
        }
      } catch (error) {
        console.error("Error generating blog recommendations:", error);
      }

      // Generate recommended reading
      const readingPrompt = `
Based on this job description and candidate resume, recommend 5 books, articles, or resources that would help the candidate prepare for this role.

Job Details:
- Title: ${jobDescription.job_title}
- Required Skills: ${JSON.stringify(jobDescription.required_skills)}
- Experience Level: ${jobDescription.experience_level}

Candidate Profile:
- Skills: ${JSON.stringify(resumeData.skills)}
- Experience: ${JSON.stringify(resumeData.experience)}

Return ONLY a valid JSON array with this structure:
[
  {
    "id": 1,
    "title": "Clean Code: A Handbook of Agile Software Craftsmanship",
    "author": "Robert C. Martin",
    "type": "book",
    "description": "Essential reading for writing maintainable and professional code",
    "category": "Software Development",
    "priority": "high",
    "estimatedTime": "2-3 weeks"
  }
]

Return only the JSON array, no additional text.
`;

      let recommendedReading = [
        {
          id: 1,
          title: "Clean Code: A Handbook of Agile Software Craftsmanship",
          author: "Robert C. Martin",
          type: "book",
          description: "Essential reading for writing maintainable and professional code",
          category: "Software Development",
          priority: "high",
          estimatedTime: "2-3 weeks"
        }
      ];

      try {
        const readingResponse = await fetch(
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
                  content: "You are a learning specialist and technical mentor. Always return valid JSON arrays only, no additional text or explanations.",
                },
                { role: "user", content: readingPrompt },
              ],
              temperature: 0.7,
              max_tokens: 1200,
            }),
          }
        );

        if (readingResponse.ok) {
          const readingData = await readingResponse.json();
          const readingText = readingData.choices?.[0]?.message?.content?.trim() || "[]";

          const parsedReading = parseAIArrayResponse(readingText);
          if (parsedReading && Array.isArray(parsedReading)) {
            recommendedReading = parsedReading;
            console.log("Recommended reading generated successfully");
          }
        }
      } catch (error) {
        console.error("Error generating recommended reading:", error);
      }

      // Calculate skill comparison
      const jobSkills = Array.isArray(jobDescription.required_skills) 
        ? jobDescription.required_skills.map((skill) => skill.toLowerCase().trim())
        : [];
      
      const resumeSkills = Array.isArray(resumeData.skills)
        ? resumeData.skills.map((skill) => skill.toLowerCase().trim())
        : [];

      // Improved skill matching with variations
      const skillVariations = {
        'javascript': ['js', 'node.js', 'nodejs', 'react', 'vue', 'angular'],
        'python': ['django', 'flask', 'fastapi'],
        'java': ['spring', 'hibernate'],
        'react': ['reactjs', 'react.js'],
        'node.js': ['nodejs', 'node'],
        'html': ['html5'],
        'css': ['css3', 'sass', 'scss', 'less'],
        'sql': ['mysql', 'postgresql', 'sqlite', 'mongodb'],
        'aws': ['amazon web services', 'ec2', 's3', 'lambda']
      };

      const matchingSkills = jobSkills.filter((jobSkill) => {
        return resumeSkills.some((resumeSkill) => {
          if (resumeSkill === jobSkill) return true;
          if (resumeSkill.includes(jobSkill) || jobSkill.includes(resumeSkill)) return true;
          
          if (skillVariations[jobSkill] && skillVariations[jobSkill].includes(resumeSkill)) return true;
          if (skillVariations[resumeSkill] && skillVariations[resumeSkill].includes(jobSkill)) return true;
          
          return false;
        });
      });

      const missingSkills = jobSkills.filter((jobSkill) => {
        return !resumeSkills.some((resumeSkill) => {
          if (resumeSkill === jobSkill) return true;
          if (resumeSkill.includes(jobSkill) || jobSkill.includes(resumeSkill)) return true;
          
          if (skillVariations[jobSkill] && skillVariations[jobSkill].includes(resumeSkill)) return true;
          if (skillVariations[resumeSkill] && skillVariations[resumeSkill].includes(jobSkill)) return true;
          
          return false;
        });
      });

      const skillMatchPercentage = jobSkills.length > 0 
        ? Math.round((matchingSkills.length / jobSkills.length) * 100)
        : 0;

      console.log("Analysis complete, sending response...");
      console.log(`Generated ${projects.length} project suggestions`);

      res.json({
        success: true,
        data: {
          readinessScore: jobFitData.jobFitScore,
          jobFitAnalysis: jobFitData,
          skillComparison: {
            matching: matchingSkills,
            missing: missingSkills,
            total: jobSkills.length,
            matchPercentage: skillMatchPercentage
          },
          roadmap,
          projects,
          blogs,
          recommendedReading,
          jobInfo: jobDescription,
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