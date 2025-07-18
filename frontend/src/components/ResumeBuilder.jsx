import React, { useRef, useState } from "react";
// Install html2pdf.js: npm install html2pdf.js
import html2pdf from "html2pdf.js";

const defaultProfile = {
  name: "Aman Sharma",
  email: "aman@example.com",
  phone: "+91-9876543210",
  summary: "Aspiring software engineer with a passion for building impactful solutions.",
  skills: ["JavaScript", "React", "Node.js", "MongoDB"],
  education: [
    {
      degree: "B.Tech in Computer Engineering",
      college: "RAIT, Navi Mumbai",
      year: "2025",
    },
  ],
  experience: [
    {
      title: "Web Developer Intern",
      company: "StartupX",
      duration: "May 2024 - July 2024",
      details: [
        "Built a full-stack MERN application for internal tools.",
        "Improved page load speed by 30%.",
      ],
    },
  ],
  projects: [
    {
      name: "Job Portal",
      desc: "A smart job portal with AI-based recommendations and resume builder.",
    },
  ],
};

const ResumeBuilder = () => {
  const [profile, setProfile] = useState(defaultProfile);
  const resumeRef = useRef();

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

  const downloadPDF = () => {
    const element = resumeRef.current;
    const opt = {
      margin: 0.5,
      filename: `${profile.name.replace(/\s/g, "_")}_Resume.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
      pagebreak: { mode: ["avoid-all", "css", "legacy"] },
    };
    html2pdf().set(opt).from(element).save();
  };

  return (
    <div className="min-h-screen bg-background py-8 px-2 md:px-8">
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Input Form */}
        <div className="bg-card p-6 rounded-xl shadow border border-border">
          <h2 className="text-2xl font-bold mb-4 text-primary">Resume Details</h2>
          <div className="space-y-3">
            <input
              className="w-full border rounded px-3 py-2"
              name="name"
              value={profile.name}
              onChange={handleChange}
              placeholder="Full Name"
            />
            <input
              className="w-full border rounded px-3 py-2"
              name="email"
              value={profile.email}
              onChange={handleChange}
              placeholder="Email"
            />
            <input
              className="w-full border rounded px-3 py-2"
              name="phone"
              value={profile.phone}
              onChange={handleChange}
              placeholder="Phone"
            />
            <textarea
              className="w-full border rounded px-3 py-2"
              name="summary"
              value={profile.summary}
              onChange={handleChange}
              placeholder="Summary"
            />
            <div>
              <label className="font-semibold">Skills</label>
              {profile.skills.map((skill, idx) => (
                <input
                  key={idx}
                  className="w-full border rounded px-3 py-1 mt-1 mb-1"
                  value={skill}
                  onChange={(e) => handleSkillChange(idx, e.target.value)}
                  placeholder={`Skill #${idx + 1}`}
                />
              ))}
            </div>
            <div>
              <label className="font-semibold">Education</label>
              {profile.education.map((edu, idx) => (
                <div key={idx} className="mb-2">
                  <input
                    className="w-full border rounded px-3 py-1 mb-1"
                    value={edu.degree}
                    onChange={(e) =>
                      handleArrayChange("education", idx, "degree", e.target.value)
                    }
                    placeholder="Degree"
                  />
                  <input
                    className="w-full border rounded px-3 py-1 mb-1"
                    value={edu.college}
                    onChange={(e) =>
                      handleArrayChange("education", idx, "college", e.target.value)
                    }
                    placeholder="College"
                  />
                  <input
                    className="w-full border rounded px-3 py-1"
                    value={edu.year}
                    onChange={(e) =>
                      handleArrayChange("education", idx, "year", e.target.value)
                    }
                    placeholder="Year"
                  />
                </div>
              ))}
            </div>
            <div>
              <label className="font-semibold">Experience</label>
              {profile.experience.map((exp, idx) => (
                <div key={idx} className="mb-2">
                  <input
                    className="w-full border rounded px-3 py-1 mb-1"
                    value={exp.title}
                    onChange={(e) =>
                      handleArrayChange("experience", idx, "title", e.target.value)
                    }
                    placeholder="Title"
                  />
                  <input
                    className="w-full border rounded px-3 py-1 mb-1"
                    value={exp.company}
                    onChange={(e) =>
                      handleArrayChange("experience", idx, "company", e.target.value)
                    }
                    placeholder="Company"
                  />
                  <input
                    className="w-full border rounded px-3 py-1 mb-1"
                    value={exp.duration}
                    onChange={(e) =>
                      handleArrayChange("experience", idx, "duration", e.target.value)
                    }
                    placeholder="Duration"
                  />
                  <textarea
                    className="w-full border rounded px-3 py-1"
                    value={exp.details.join("\n")}
                    onChange={(e) =>
                      handleArrayChange(
                        "experience",
                        idx,
                        "details",
                        e.target.value.split("\n")
                      )
                    }
                    placeholder="Details (one per line)"
                  />
                </div>
              ))}
            </div>
            <div>
              <label className="font-semibold">Projects</label>
              {profile.projects.map((proj, idx) => (
                <div key={idx} className="mb-2">
                  <input
                    className="w-full border rounded px-3 py-1 mb-1"
                    value={proj.name}
                    onChange={(e) =>
                      handleArrayChange("projects", idx, "name", e.target.value)
                    }
                    placeholder="Project Name"
                  />
                  <textarea
                    className="w-full border rounded px-3 py-1"
                    value={proj.desc}
                    onChange={(e) =>
                      handleArrayChange("projects", idx, "desc", e.target.value)
                    }
                    placeholder="Description"
                  />
                </div>
              ))}
            </div>
          </div>
          <button
            className="mt-6 w-full bg-primary text-white font-bold py-2 rounded hover:bg-primary/90 transition"
            onClick={downloadPDF}
          >
            Download as PDF
          </button>
        </div>

        {/* Resume Preview */}
        <div
          className="bg-white text-black rounded-xl shadow p-8 border border-gray-200 min-h-[900px]"
          ref={resumeRef}
          id="resume-content"
          style={{ fontFamily: "Inter, Arial, sans-serif", maxWidth: 700, margin: "auto" }}
        >
          <h1 className="text-3xl font-bold text-primary mb-1">{profile.name}</h1>
          <div className="flex flex-wrap gap-4 text-sm mb-4 text-gray-700">
            <span>{profile.email}</span>
            <span>{profile.phone}</span>
          </div>
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-primary">Summary</h2>
            <p>{profile.summary}</p>
          </div>
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-primary">Skills</h2>
            <ul className="flex flex-wrap gap-2">
              {profile.skills.map((skill, idx) => (
                <li
                  key={idx}
                  className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs"
                >
                  {skill}
                </li>
              ))}
            </ul>
          </div>
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-primary">Education</h2>
            {profile.education.map((edu, idx) => (
              <div key={idx} className="mb-1">
                <div className="font-semibold">{edu.degree}</div>
                <div className="text-sm">{edu.college} | {edu.year}</div>
              </div>
            ))}
          </div>
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-primary">Experience</h2>
            {profile.experience.map((exp, idx) => (
              <div key={idx} className="mb-2">
                <div className="font-semibold">{exp.title} @ {exp.company}</div>
                <div className="text-sm text-gray-600">{exp.duration}</div>
                <ul className="list-disc ml-6 text-sm">
                  {exp.details.map((d, i) => (
                    <li key={i}>{d}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-primary">Projects</h2>
            {profile.projects.map((proj, idx) => (
              <div key={idx} className="mb-2">
                <div className="font-semibold">{proj.name}</div>
                <div className="text-sm">{proj.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeBuilder;