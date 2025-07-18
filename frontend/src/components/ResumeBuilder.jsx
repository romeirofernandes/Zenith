import React, { useRef, useState } from "react";
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
  const [loadingAI, setLoadingAI] = useState(false);
  const resumeRef = useRef();

  // --- Handlers for dynamic sections ---
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

  // --- PDF Download ---
  const downloadPDF = () => {
    const element = resumeRef.current;
    const opt = {
      margin: 0.2,
      filename: `${profile.name.replace(/\s/g, "_")}_Resume.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
      pagebreak: { mode: ["avoid-all", "css", "legacy"] },
    };
    html2pdf().set(opt).from(element).save();
  };

  // --- AI Resume Enhancement ---
  const enhanceWithAI = async () => {
    setLoadingAI(true);
    try {
      const prompt = `
You are a world-class resume writer. Given the following JSON resume, improve the summary, skills, experience bullet points, and project descriptions to make them more professional, concise, and impactful. Return the improved JSON in the same structure.

${JSON.stringify(profile, null, 2)}
      `;
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: "llama3-70b-8192",
          messages: [
            { role: "system", content: "You are a resume improvement assistant." },
            { role: "user", content: prompt },
          ],
          max_tokens: 2048,
        }),
      });
      const data = await res.json();
      console.log(data);
      // Try to parse improved JSON from AI response
      let improved = null;
      try {
        // Try to extract JSON from ```json ... ```
        const match = data.choices[0].message.content.match(/```json\s*([\s\S]*?)\s*```/);
        if (match) {
          improved = JSON.parse(match[1]);
        } else {
          // Try to extract JSON from ``` ... ```
          const match2 = data.choices[0].message.content.match(/```([\s\S]*?)```/);
          if (match2) {
            improved = JSON.parse(match2[1]);
          } else {
            // Try to parse as plain JSON
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

  // --- Resume Section ---
  return (
    <div className="min-h-screen bg-background py-8 px-2 md:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Top Buttons */}
        <div className="flex flex-wrap gap-4 justify-end mb-6">
          <button
            className="bg-primary text-white font-bold px-6 py-2 rounded hover:bg-primary/90 transition"
            onClick={downloadPDF}
            type="button"
          >
            Download as PDF
          </button>
          <button
            className="bg-black text-white font-bold px-6 py-2 rounded hover:bg-gray-900 transition flex items-center gap-2"
            onClick={enhanceWithAI}
            disabled={loadingAI}
            type="button"
          >
            {loadingAI ? (
              <span className="animate-spin mr-2 w-4 h-4 border-b-2 border-white rounded-full"></span>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M12 4v16m8-8H4" /></svg>
            )}
            Enhance with AI
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
                type="text"
              />
              <input
                className="w-full border rounded px-3 py-2"
                name="email"
                value={profile.email}
                onChange={handleChange}
                placeholder="Email"
                type="email"
              />
              <input
                className="w-full border rounded px-3 py-2"
                name="phone"
                value={profile.phone}
                onChange={handleChange}
                placeholder="Phone"
                type="text"
              />
              <textarea
                className="w-full border rounded px-3 py-2"
                name="summary"
                value={profile.summary}
                onChange={handleChange}
                placeholder="Professional Summary"
                rows={3}
              />
              <div>
                <label className="font-semibold">Skills</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {profile.skills.map((skill, idx) => (
                    <div key={idx} className="flex items-center gap-1">
                      <input
                        className="border rounded px-3 py-1"
                        value={skill}
                        onChange={(e) => handleSkillChange(idx, e.target.value)}
                        placeholder={`Skill #${idx + 1}`}
                        type="text"
                      />
                      <button
                        type="button"
                        className="text-red-500 px-2"
                        onClick={() => removeSkill(idx)}
                        disabled={profile.skills.length === 1}
                        title="Remove skill"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    className="bg-primary text-white px-2 rounded text-lg"
                    onClick={addSkill}
                    title="Add skill"
                  >
                    +
                  </button>
                </div>
              </div>
              <div>
                <label className="font-semibold">Education</label>
                {profile.education.map((edu, idx) => (
                  <div key={idx} className="mb-2 border-b pb-2">
                    <input
                      className="w-full border rounded px-3 py-1 mb-1"
                      value={edu.degree}
                      onChange={(e) =>
                        handleArrayChange("education", idx, "degree", e.target.value)
                      }
                      placeholder="Degree"
                      type="text"
                    />
                    <input
                      className="w-full border rounded px-3 py-1 mb-1"
                      value={edu.college}
                      onChange={(e) =>
                        handleArrayChange("education", idx, "college", e.target.value)
                      }
                      placeholder="College"
                      type="text"
                    />
                    <input
                      className="w-full border rounded px-3 py-1"
                      value={edu.year}
                      onChange={(e) =>
                        handleArrayChange("education", idx, "year", e.target.value)
                      }
                      placeholder="Year"
                      type="text"
                    />
                    <button
                      type="button"
                      className="text-red-500 mt-1"
                      onClick={() => removeSection("education", idx)}
                      disabled={profile.education.length === 1}
                      title="Remove education"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  className="bg-primary text-white px-3 py-1 rounded mt-1"
                  onClick={() =>
                    addSection("education", { degree: "", college: "", year: "" })
                  }
                >
                  + Add Education
                </button>
              </div>
              <div>
                <label className="font-semibold">Experience</label>
                {profile.experience.map((exp, idx) => (
                  <div key={idx} className="mb-2 border-b pb-2">
                    <input
                      className="w-full border rounded px-3 py-1 mb-1"
                      value={exp.title}
                      onChange={(e) =>
                        handleArrayChange("experience", idx, "title", e.target.value)
                      }
                      placeholder="Title"
                      type="text"
                    />
                    <input
                      className="w-full border rounded px-3 py-1 mb-1"
                      value={exp.company}
                      onChange={(e) =>
                        handleArrayChange("experience", idx, "company", e.target.value)
                      }
                      placeholder="Company"
                      type="text"
                    />
                    <input
                      className="w-full border rounded px-3 py-1 mb-1"
                      value={exp.duration}
                      onChange={(e) =>
                        handleArrayChange("experience", idx, "duration", e.target.value)
                      }
                      placeholder="Duration"
                      type="text"
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
                      rows={2}
                    />
                    <button
                      type="button"
                      className="text-red-500 mt-1"
                      onClick={() => removeSection("experience", idx)}
                      disabled={profile.experience.length === 1}
                      title="Remove experience"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  className="bg-primary text-white px-3 py-1 rounded mt-1"
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
              <div>
                <label className="font-semibold">Projects</label>
                {profile.projects.map((proj, idx) => (
                  <div key={idx} className="mb-2 border-b pb-2">
                    <input
                      className="w-full border rounded px-3 py-1 mb-1"
                      value={proj.name}
                      onChange={(e) =>
                        handleArrayChange("projects", idx, "name", e.target.value)
                      }
                      placeholder="Project Name"
                      type="text"
                    />
                    <textarea
                      className="w-full border rounded px-3 py-1"
                      value={proj.desc}
                      onChange={(e) =>
                        handleArrayChange("projects", idx, "desc", e.target.value)
                      }
                      placeholder="Description"
                      rows={2}
                    />
                    <button
                      type="button"
                      className="text-red-500 mt-1"
                      onClick={() => removeSection("projects", idx)}
                      disabled={profile.projects.length === 1}
                      title="Remove project"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  className="bg-primary text-white px-3 py-1 rounded mt-1"
                  onClick={() =>
                    addSection("projects", { name: "", desc: "" })
                  }
                >
                  + Add Project
                </button>
              </div>
            </div>
          </div>

          {/* Resume Preview */}
          <div
            className="bg-white text-black rounded-xl shadow p-10 border border-gray-200 min-h-[900px] print:bg-white print:text-black"
            ref={resumeRef}
            id="resume-content"
            style={{
              fontFamily: "Inter, Arial, sans-serif",
              maxWidth: 700,
              margin: "auto",
              color: "#111",
              background: "#fff",
            }}
          >
            <h1 className="text-3xl font-bold text-black mb-1 tracking-tight">{profile.name}</h1>
            <div className="flex flex-wrap gap-6 text-sm mb-6 text-gray-700">
              <span>{profile.email}</span>
              <span>{profile.phone}</span>
            </div>
            <div className="mb-6">
              <h2 className="text-lg font-bold text-black mb-1 tracking-wide uppercase border-b border-gray-300 pb-1">Professional Summary</h2>
              <p className="text-gray-900">{profile.summary}</p>
            </div>
            <div className="mb-6">
              <h2 className="text-lg font-bold text-black mb-1 tracking-wide uppercase border-b border-gray-300 pb-1">Skills</h2>
              <ul className="flex flex-wrap gap-2">
                {profile.skills.filter(Boolean).map((skill, idx) => (
                  <li
                    key={idx}
                    className="bg-gray-100 text-black px-4 py-1 rounded-full text-xs font-semibold border border-gray-300 tracking-wide"
                  >
                    {skill}
                  </li>
                ))}
              </ul>
            </div>
            <div className="mb-6">
              <h2 className="text-lg font-bold text-black mb-1 tracking-wide uppercase border-b border-gray-300 pb-1">Education</h2>
              {profile.education.map((edu, idx) => (
                <div key={idx} className="mb-2">
                  <div className="font-semibold text-black">{edu.degree}</div>
                  <div className="text-sm text-gray-700">{edu.college} | {edu.year}</div>
                </div>
              ))}
            </div>
            <div className="mb-6">
              <h2 className="text-lg font-bold text-black mb-1 tracking-wide uppercase border-b border-gray-300 pb-1">Experience</h2>
              {profile.experience.map((exp, idx) => (
                <div key={idx} className="mb-4">
                  <div className="font-semibold text-black">{exp.title} <span className="text-gray-700">@ {exp.company}</span></div>
                  <div className="text-sm text-gray-600 mb-1">{exp.duration}</div>
                  <ul className="list-disc ml-6 text-sm text-gray-800">
                    {exp.details.filter(Boolean).map((d, i) => (
                      <li key={i}>{d}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div>
              <h2 className="text-lg font-bold text-black mb-1 tracking-wide uppercase border-b border-gray-300 pb-1">Projects</h2>
              {profile.projects.map((proj, idx) => (
                <div key={idx} className="mb-3">
                  <div className="font-semibold text-black">{proj.name}</div>
                  <div className="text-sm text-gray-800">{proj.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeBuilder;