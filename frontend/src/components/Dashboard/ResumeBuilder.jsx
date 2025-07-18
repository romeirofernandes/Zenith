import React, { useRef, useState, useEffect } from "react";
import {
  PDFDownloadLink,
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import { auth } from "../../config/firebase";
import { ScrollArea } from "@/components/ui/scroll-area";

// Empty profile template
const emptyProfile = {
  name: "",
  email: "",
  phone: "",
  summary: "",
  skills: [""],
  education: [{ degree: "", college: "", year: "" }],
  experience: [{ title: "", company: "", duration: "", details: [""] }],
  projects: [{ name: "", desc: "" }],
};

// PDF styles
const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#FFFFFF",
    padding: 30,
    fontFamily: "Helvetica",
    fontSize: 10,
    lineHeight: 1.4,
  },
  header: {
    marginBottom: 20,
  },
  name: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#000000",
  },
  contact: {
    fontSize: 10,
    color: "#666666",
    marginBottom: 16,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    textTransform: "uppercase",
    marginBottom: 8,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#CCCCCC",
    color: "#000000",
  },
  text: {
    fontSize: 10,
    lineHeight: 1.4,
    color: "#333333",
    marginBottom: 4,
  },
  skillsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  skillChip: {
    backgroundColor: "#F3F4F6",
    color: "#000000",
    padding: 4,
    borderRadius: 12,
    fontSize: 9,
    fontWeight: "bold",
    borderWidth: 1,
    borderColor: "#D1D5DB",
  },
  experienceItem: {
    marginBottom: 16,
  },
  jobTitle: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#000000",
    marginBottom: 2,
  },
  jobDetails: {
    fontSize: 10,
    color: "#666666",
    marginBottom: 6,
  },
  bulletPoint: {
    fontSize: 10,
    color: "#333333",
    marginLeft: 12,
    marginBottom: 2,
  },
  educationItem: {
    marginBottom: 12,
  },
  degree: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#000000",
    marginBottom: 2,
  },
  school: {
    fontSize: 10,
    color: "#666666",
  },
  projectItem: {
    marginBottom: 12,
  },
  projectName: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#000000",
    marginBottom: 2,
  },
  projectDesc: {
    fontSize: 10,
    color: "#333333",
  },
});

// PDF Document Component
const ResumePDF = ({ profile }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.name}>{profile.firstName} {profile.lastName}</Text>
        <Text style={styles.contact}>
          {profile.email}
          {profile.phone ? ` | ${profile.phone}` : ""}
        </Text>
      </View>

      {/* Professional Summary */}
      {profile.summary && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Professional Summary</Text>
          <Text style={styles.text}>{profile.summary}</Text>
        </View>
      )}

      {/* Skills */}
      {profile.skills.filter(Boolean).length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Skills</Text>
          <View style={styles.skillsContainer}>
            {profile.skills.filter(Boolean).map((skill, idx) => (
              <Text key={idx} style={styles.skillChip}>
                {skill}
              </Text>
            ))}
          </View>
        </View>
      )}

      {/* Education */}
      {profile.education.some(
        (edu) => edu.degree || edu.college || edu.year
      ) && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Education</Text>
          {profile.education.map((edu, idx) => (
            <View key={idx} style={styles.educationItem}>
              <Text style={styles.degree}>{edu.degree}</Text>
              <Text style={styles.school}>
                {edu.college}
                {edu.year ? ` | ${edu.year}` : ""}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Experience */}
      {profile.experience.some(
        (exp) => exp.title || exp.company || exp.duration
      ) && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Experience</Text>
          {profile.experience.map((exp, idx) => (
            <View key={idx} style={styles.experienceItem}>
              <Text style={styles.jobTitle}>
                {exp.title}
                {exp.company ? ` @ ${exp.company}` : ""}
              </Text>
              <Text style={styles.jobDetails}>{exp.duration}</Text>
              {exp.details.filter(Boolean).map((detail, detailIdx) => (
                <Text key={detailIdx} style={styles.bulletPoint}>
                  • {detail}
                </Text>
              ))}
            </View>
          ))}
        </View>
      )}

      {/* Projects */}
      {profile.projects.some((proj) => proj.name || proj.desc) && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Projects</Text>
          {profile.projects.map((proj, idx) => (
            <View key={idx} style={styles.projectItem}>
              <Text style={styles.projectName}>{proj.name}</Text>
              <Text style={styles.projectDesc}>{proj.desc}</Text>
            </View>
          ))}
        </View>
      )}
    </Page>
  </Document>
);

const ResumeBuilder = () => {
  const [profile, setProfile] = useState(emptyProfile);
  const [loadingAI, setLoadingAI] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);
  const resumeRef = useRef();

  // Steps configuration
  const steps = [
    { id: 1, title: "Personal Details" },
    { id: 2, title: "Professional Summary" },
    { id: 3, title: "Skills" },
    { id: 4, title: "Education" },
    { id: 5, title: "Experience" },
    { id: 6, title: "Projects" },
    { id: 7, title: "Review & Download" },
  ];

  // Fetch user data when component mounts
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = auth.currentUser;
        console.log("Firebase current user:", user);

        if (!user) {
          console.log("No user logged in");
          setLoading(false);
          return;
        }

        const token = await user.getIdToken();
        console.log("Got auth token");

        const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
        console.log("API URL:", apiUrl);

        const response = await fetch(`${apiUrl}/auth/current`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        console.log("Response status:", response.status);

        if (!response.ok) {
          const errorData = await response.json();
          console.error("API Error:", errorData);
          throw new Error(
            `Failed to fetch profile: ${errorData.message || response.status}`
          );
        }

        const data = await response.json();
        console.log("Received user data:", data);

        if (data.success && data.user) {
          setProfile({
            name: data.user.displayName || "",
            email: data.user.email || "",
            phone: data.user.phoneNumber || "",
            summary: data.user.resume?.summary || "",
            skills: Array.isArray(data.user.resume?.skills)
              ? data.user.resume.skills
              : [""],
            education: Array.isArray(data.user.resume?.education)
              ? data.user.resume.education.map((edu) => ({
                  degree: edu.degree || "",
                  college: edu.institution || "",
                  year: edu.graduationYear || "",
                }))
              : [{ degree: "", college: "", year: "" }],
            experience: Array.isArray(data.user.resume?.experience)
              ? data.user.resume.experience.map((exp) => ({
                  title: exp.title || "",
                  company: exp.company || "",
                  duration: exp.duration || "",
                  details: Array.isArray(exp.details)
                    ? exp.details
                    : [exp.details || ""],
                }))
              : [{ title: "", company: "", duration: "", details: [""] }],
            projects: Array.isArray(data.user.resume?.projects)
              ? data.user.resume.projects.map((proj) => ({
                  name: proj.title || "",
                  desc: proj.description || "",
                }))
              : [{ name: "", desc: "" }],
          });
        } else {
          console.error("Invalid user data format:", data);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // Handlers for form inputs
  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleArrayChange = (section, idx, field, value) => {
    const updated = [...profile[section]];
    updated[idx][field] = value;
    setProfile({ ...profile, [section]: updated });
  };

  const handleSkillChange = (idx, value) => {
    const updated = [...profile.skills];
    updated[idx] = value;
    setProfile({ ...profile, skills: updated });
  };

  const addSection = (section, emptyObj) => {
    setProfile({ ...profile, [section]: [...profile[section], emptyObj] });
  };

  const removeSection = (section, idx) => {
    const updated = [...profile[section]];
    updated.splice(idx, 1);
    setProfile({ ...profile, [section]: updated });
  };

  const addSkill = () => {
    setProfile({ ...profile, skills: [...profile.skills, ""] });
  };

  const removeSkill = (idx) => {
    const updated = [...profile.skills];
    updated.splice(idx, 1);
    setProfile({ ...profile, skills: updated });
  };

  // Navigation functions
  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // AI Resume Enhancement
  const enhanceWithAI = async () => {
    setLoadingAI(true);
    try {
      const prompt = `
You are a world-class resume writer. Given the following JSON resume, improve the summary, skills, experience bullet points, and project descriptions to make them more professional, concise, and impactful. Return the improved JSON in the same structure.

${JSON.stringify(profile, null, 2)}
      `;
      const res = await fetch(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`,
          },
          body: JSON.stringify({
            model: "llama3-70b-8192",
            messages: [
              {
                role: "system",
                content: "You are a resume improvement assistant.",
              },
              { role: "user", content: prompt },
            ],
            max_tokens: 2048,
          }),
        }
      );
      const data = await res.json();
      console.log(data);
      let improved = null;
      try {
        const match = data.choices[0].message.content.match(
          /```json\s*([\s\S]*?)\s*```/
        );
        if (match) {
          improved = JSON.parse(match[1]);
        } else {
          const match2 =
            data.choices[0].message.content.match(/```([\s\S]*?)```/);
          if (match2) {
            improved = JSON.parse(match2[1]);
          } else {
            improved = JSON.parse(data.choices[0].message.content);
          }
        }
      } catch (error) {
        console.log("AI JSON parse error:", error);
      }
      if (improved) setProfile(improved);
      else alert("AI could not improve the resume. Try again.");
    } catch (err) {
      alert("AI enhancement failed. Try again.");
    }
    setLoadingAI(false);
  };

  // Show loading state
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header with Action Buttons */}
      <div className="flex-shrink-0 bg-card border-b p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-primary">Resume Builder</h1>
          <div className="flex gap-3">
            <PDFDownloadLink
              document={<ResumePDF profile={profile} />}
              fileName={`${profile.name.replace(/\s/g, "_") || "resume"}.pdf`}
              className="bg-primary text-white font-bold px-4 py-2 rounded hover:bg-primary/90 transition inline-block text-center text-sm"
            >
              {({ blob, url, loading, error }) =>
                loading ? "Generating PDF..." : "Download PDF"
              }
            </PDFDownloadLink>
            <button
              className="bg-black text-white font-bold px-4 py-2 rounded hover:bg-gray-900 transition flex items-center gap-2 text-sm"
              onClick={enhanceWithAI}
              disabled={loadingAI}
              type="button"
            >
              {loadingAI ? (
                <span className="animate-spin mr-2 w-4 h-4 border-b-2 border-white rounded-full"></span>
              ) : (
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path d="M12 4v16m8-8H4" />
                </svg>
              )}
              Enhance with AI
            </button>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-white border-b">
        <div className="flex overflow-x-auto py-2 px-4">
          {steps.map((step) => (
            <div
              key={step.id}
              className={`flex-shrink-0 px-4 py-2 border-b-2 ${
                currentStep === step.id
                  ? "border-primary text-primary font-medium"
                  : "border-transparent text-gray-500"
              }`}
            >
              {step.title}
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Input Form */}
        <div className="w-1/3 border-r bg-card">
          <ScrollArea className="h-full">
            <div className="p-6">
              {/* Step 1: Personal Details */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <h2 className="text-xl font-bold mb-4 text-primary">
                    Personal Details
                  </h2>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name
                      </label>
                      <input
                        className="w-full border rounded px-3 py-2 text-sm"
                        name="name"
                        value={profile.name}
                        onChange={handleChange}
                        placeholder="John Doe"
                        type="text"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <input
                        className="w-full border rounded px-3 py-2 text-sm"
                        name="email"
                        value={profile.email}
                        onChange={handleChange}
                        placeholder="john@example.com"
                        type="email"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone
                      </label>
                      <input
                        className="w-full border rounded px-3 py-2 text-sm"
                        name="phone"
                        value={profile.phone}
                        onChange={handleChange}
                        placeholder="(123) 456-7890"
                        type="text"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Professional Summary */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <h2 className="text-xl font-bold mb-4 text-primary">
                    Professional Summary
                  </h2>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Write a brief summary of your professional background and
                      key skills
                    </label>
                    <textarea
                      className="w-full border rounded px-3 py-2 text-sm"
                      name="summary"
                      value={profile.summary}
                      onChange={handleChange}
                      placeholder="Experienced software engineer with 5+ years in web development..."
                      rows={6}
                    />
                  </div>
                </div>
              )}

              {/* Step 3: Skills */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  <h2 className="text-xl font-bold mb-4 text-primary">Skills</h2>
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      List your key skills and technologies
                    </label>
                    <div className="space-y-2">
                      {profile.skills.map((skill, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <input
                            className="flex-1 border rounded px-3 py-1 text-sm"
                            value={skill}
                            onChange={(e) =>
                              handleSkillChange(idx, e.target.value)
                            }
                            placeholder={`Skill #${idx + 1}`}
                            type="text"
                          />
                          <button
                            type="button"
                            className="text-red-500 px-2 py-1 hover:bg-red-50 rounded"
                            onClick={() => removeSkill(idx)}
                            disabled={profile.skills.length === 1}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        className="bg-primary text-white px-3 py-1 rounded text-sm hover:bg-primary/90"
                        onClick={addSkill}
                      >
                        + Add Skill
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Education */}
              {currentStep === 4 && (
                <div className="space-y-4">
                  <h2 className="text-xl font-bold mb-4 text-primary">
                    Education
                  </h2>
                  <div className="space-y-3">
                    {profile.education.map((edu, idx) => (
                      <div
                        key={idx}
                        className="border rounded p-3 bg-gray-50 space-y-2"
                      >
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Degree
                          </label>
                          <input
                            className="w-full border rounded px-3 py-1 text-sm"
                            value={edu.degree}
                            onChange={(e) =>
                              handleArrayChange(
                                "education",
                                idx,
                                "degree",
                                e.target.value
                              )
                            }
                            placeholder="Bachelor of Science in Computer Science"
                            type="text"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Institution
                          </label>
                          <input
                            className="w-full border rounded px-3 py-1 text-sm"
                            value={edu.college}
                            onChange={(e) =>
                              handleArrayChange(
                                "education",
                                idx,
                                "college",
                                e.target.value
                              )
                            }
                            placeholder="University of California"
                            type="text"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Graduation Year
                          </label>
                          <input
                            className="w-full border rounded px-3 py-1 text-sm"
                            value={edu.year}
                            onChange={(e) =>
                              handleArrayChange(
                                "education",
                                idx,
                                "year",
                                e.target.value
                              )
                            }
                            placeholder="2020"
                            type="text"
                          />
                        </div>
                        <button
                          type="button"
                          className="text-red-500 text-sm hover:bg-red-50 px-2 py-1 rounded"
                          onClick={() => removeSection("education", idx)}
                          disabled={profile.education.length === 1}
                        >
                          Remove Education
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      className="bg-primary text-white px-3 py-1 rounded text-sm hover:bg-primary/90"
                      onClick={() =>
                        addSection("education", {
                          degree: "",
                          college: "",
                          year: "",
                        })
                      }
                    >
                      + Add Education
                    </button>
                  </div>
                </div>
              )}

              {/* Step 5: Experience */}
              {currentStep === 5 && (
                <div className="space-y-4">
                  <h2 className="text-xl font-bold mb-4 text-primary">
                    Work Experience
                  </h2>
                  <div className="space-y-3">
                    {profile.experience.map((exp, idx) => (
                      <div
                        key={idx}
                        className="border rounded p-3 bg-gray-50 space-y-2"
                      >
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Job Title
                          </label>
                          <input
                            className="w-full border rounded px-3 py-1 text-sm"
                            value={exp.title}
                            onChange={(e) =>
                              handleArrayChange(
                                "experience",
                                idx,
                                "title",
                                e.target.value
                              )
                            }
                            placeholder="Software Engineer"
                            type="text"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Company
                          </label>
                          <input
                            className="w-full border rounded px-3 py-1 text-sm"
                            value={exp.company}
                            onChange={(e) =>
                              handleArrayChange(
                                "experience",
                                idx,
                                "company",
                                e.target.value
                              )
                            }
                            placeholder="Tech Corp Inc."
                            type="text"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Duration
                          </label>
                          <input
                            className="w-full border rounded px-3 py-1 text-sm"
                            value={exp.duration}
                            onChange={(e) =>
                              handleArrayChange(
                                "experience",
                                idx,
                                "duration",
                                e.target.value
                              )
                            }
                            placeholder="Jan 2020 - Present"
                            type="text"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Responsibilities & Achievements
                          </label>
                          <textarea
                            className="w-full border rounded px-3 py-1 text-sm"
                            value={exp.details.join("\n")}
                            onChange={(e) =>
                              handleArrayChange(
                                "experience",
                                idx,
                                "details",
                                e.target.value.split("\n")
                              )
                            }
                            placeholder="• Developed new features for web application\n• Optimized performance by 30%\n• Led team of 5 developers"
                            rows={4}
                          />
                        </div>
                        <button
                          type="button"
                          className="text-red-500 text-sm hover:bg-red-50 px-2 py-1 rounded"
                          onClick={() => removeSection("experience", idx)}
                          disabled={profile.experience.length === 1}
                        >
                          Remove Experience
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      className="bg-primary text-white px-3 py-1 rounded text-sm hover:bg-primary/90"
                      onClick={() =>
                        addSection("experience", {
                          title: "",
                          company: "",
                          duration: "",
                          details: [""],
                        })
                      }
                    >
                      + Add Experience
                    </button>
                  </div>
                </div>
              )}

              {/* Step 6: Projects */}
              {currentStep === 6 && (
                <div className="space-y-4">
                  <h2 className="text-xl font-bold mb-4 text-primary">
                    Projects
                  </h2>
                  <div className="space-y-3">
                    {profile.projects.map((proj, idx) => (
                      <div
                        key={idx}
                        className="border rounded p-3 bg-gray-50 space-y-2"
                      >
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Project Name
                          </label>
                          <input
                            className="w-full border rounded px-3 py-1 text-sm"
                            value={proj.name}
                            onChange={(e) =>
                              handleArrayChange(
                                "projects",
                                idx,
                                "name",
                                e.target.value
                              )
                            }
                            placeholder="E-commerce Website"
                            type="text"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Description
                          </label>
                          <textarea
                            className="w-full border rounded px-3 py-1 text-sm"
                            value={proj.desc}
                            onChange={(e) =>
                              handleArrayChange(
                                "projects",
                                idx,
                                "desc",
                                e.target.value
                              )
                            }
                            placeholder="Built a full-stack e-commerce platform with React and Node.js..."
                            rows={4}
                          />
                        </div>
                        <button
                          type="button"
                          className="text-red-500 text-sm hover:bg-red-50 px-2 py-1 rounded"
                          onClick={() => removeSection("projects", idx)}
                          disabled={profile.projects.length === 1}
                        >
                          Remove Project
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      className="bg-primary text-white px-3 py-1 rounded text-sm hover:bg-primary/90"
                      onClick={() =>
                        addSection("projects", { name: "", desc: "" })
                      }
                    >
                      + Add Project
                    </button>
                  </div>
                </div>
              )}

              {/* Step 7: Review */}
              {currentStep === 7 && (
                <div className="space-y-4">
                  <h2 className="text-xl font-bold mb-4 text-primary">
                    Review Your Resume
                  </h2>
                  <div className="bg-blue-50 border border-blue-200 rounded p-4">
                    <h3 className="font-medium text-blue-800 mb-2">
                      Ready to Download
                    </h3>
                    <p className="text-sm text-blue-700">
                      Review your resume on the right panel. If everything looks
                      good, click "Download PDF" above. You can also go back to
                      edit any section.
                    </p>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8">
                <button
                  type="button"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className={`px-4 py-2 rounded ${
                    currentStep === 1
                      ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  Previous
                </button>
                {currentStep < steps.length ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/90"
                  >
                    Next
                  </button>
                ) : null}
              </div>
            </div>
          </ScrollArea>
        </div>

        {/* Right Panel - Resume Preview */}
        <div className="w-2/3 bg-gray-50">
          <ScrollArea className="h-full">
            <div className="p-8 flex justify-center">
              <div
                ref={resumeRef}
                className="bg-white rounded-lg shadow-lg p-10"
                style={{
                  width: "8.5in",
                  minHeight: "11in",
                  fontFamily: "Arial, sans-serif",
                  fontSize: "14px",
                  lineHeight: "1.5",
                  color: "#000",
                }}
              >
                {/* Header */}
                <div className="mb-8">
                  <h1 className="text-3xl font-bold text-black mb-2">
                    {profile.name || "Your Name"}
                  </h1>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                    {profile.email && <span>{profile.email}</span>}
                    {profile.phone && <span>{profile.phone}</span>}
                  </div>
                </div>

                {/* Professional Summary */}
                {profile.summary && (
                  <div className="mb-8">
                    <h2 className="text-lg font-bold text-black mb-3 uppercase border-b border-gray-300 pb-1">
                      Professional Summary
                    </h2>
                    <p className="text-gray-800 text-sm leading-relaxed">
                      {profile.summary}
                    </p>
                  </div>
                )}

                {/* Skills */}
                {profile.skills.filter(Boolean).length > 0 && (
                  <div className="mb-8">
                    <h2 className="text-lg font-bold text-black mb-3 uppercase border-b border-gray-300 pb-1">
                      Skills
                    </h2>
                    <div className="flex flex-wrap gap-2">
                      {profile.skills.filter(Boolean).map((skill, idx) => (
                        <span
                          key={idx}
                          className="bg-gray-100 text-black px-3 py-1 rounded-full text-sm font-medium border border-gray-300"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Education */}
                {profile.education.some(
                  (edu) => edu.degree || edu.college || edu.year
                ) && (
                  <div className="mb-8">
                    <h2 className="text-lg font-bold text-black mb-3 uppercase border-b border-gray-300 pb-1">
                      Education
                    </h2>
                    {profile.education.map((edu, idx) => (
                      <div key={idx} className="mb-4">
                        <div className="font-semibold text-black">
                          {edu.degree}
                        </div>
                        <div className="text-sm text-gray-600">
                          {edu.college} {edu.year && `| ${edu.year}`}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Experience */}
                {profile.experience.some(
                  (exp) => exp.title || exp.company || exp.duration
                ) && (
                  <div className="mb-8">
                    <h2 className="text-lg font-bold text-black mb-3 uppercase border-b border-gray-300 pb-1">
                      Experience
                    </h2>
                    {profile.experience.map((exp, idx) => (
                      <div key={idx} className="mb-5">
                        <div className="font-semibold text-black">
                          {exp.title}
                          {exp.company && (
                            <span className="text-gray-700">
                              {" "}
                              @ {exp.company}
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-600 mb-2">
                          {exp.duration}
                        </div>
                        <ul className="list-disc ml-5 text-sm text-gray-800 space-y-1">
                          {exp.details.filter(Boolean).map((detail, i) => (
                            <li key={i}>{detail}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}

                {/* Projects */}
                {profile.projects.some((proj) => proj.name || proj.desc) && (
                  <div className="mb-8">
                    <h2 className="text-lg font-bold text-black mb-3 uppercase border-b border-gray-300 pb-1">
                      Projects
                    </h2>
                    {profile.projects.map((proj, idx) => (
                      <div key={idx} className="mb-4">
                        <div className="font-semibold text-black">
                          {proj.name}
                        </div>
                        <div className="text-sm text-gray-800">
                          {proj.desc}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
};

export default ResumeBuilder;