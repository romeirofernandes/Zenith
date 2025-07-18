import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import RecordRTC from "recordrtc";
// import { c } from "framer-motion/dist/types.d-Bq-Qm38R";

// ---- SAMPLE DATA ----
const sampleJobs = [
  {
    id: 1,
    company_name: "TechNova Solutions",
    job_title: "Software Engineer",
    job_description: "Develop and maintain scalable software solutions for our clients.",
    required_skills: ["JavaScript", "React", "Node.js", "MongoDB", "REST APIs"],
    location: "San Francisco, CA (Hybrid)",
  },
  {
    id: 2,
    company_name: "GreenEarth Innovations",
    job_title: "Sustainability Analyst",
    job_description: "Analyze company operations to identify areas for sustainability improvements.",
    required_skills: ["Data analysis", "Sustainability reporting"],
    location: "Remote",
  },
];

const sampleResume = {
  softskills: ["Communication", "Teamwork", "Problem-Solving"],
  resumeText: "An experienced software engineer with a passion for building scalable applications.",
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
  summary: "Driven software engineer with a proven track record of delivering robust solutions.",
  linkedin: "https://linkedin.com/in/johndoe",
  profileLinks: [
    { platform: "GitHub", url: "https://github.com/johndoe" },
    { platform: "Twitter", url: "https://twitter.com/johndoe" },
  ],
};
// ---- END SAMPLE DATA ----

const InterviewPrep = () => {
  const [jobs, setJobs] = useState([]);
  const [resume, setResume] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
   console.log("Current selectedJob state:", selectedJob);
  const [questions, setQuestions] = useState([]);
  const [step, setStep] = useState(0); // 0: select, 1: interview, 2: review
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [recording, setRecording] = useState(false);
  const [mediaBlobs, setMediaBlobs] = useState([]);
  const [timer, setTimer] = useState(0);
  const recorderRef = useRef(null);
  const videoRef = useRef(null);
  const [feedback, setFeedback] = useState(null);
  const timerInterval = useRef(null);

  // Fetch jobs and resume from backend, fallback to sample data
  useEffect(() => {
    const fetchData = async () => {
      let jobsData = sampleJobs;
      let resumeData = sampleResume;
      try {
        const jobsRes = await fetch(`${import.meta.env.VITE_API_URL}/jobs/all`);
        const jobsJson = await jobsRes.json();
        if (Array.isArray(jobsJson.jobs) && jobsJson.jobs.length > 0) jobsData = jobsJson.jobs;
        console.log("Fetched jobs:", jobsData);
      } catch {}
      try {
        const resumeRes = await fetch(`${import.meta.env.VITE_API_URL}/profile/resume`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
        );
        const resumeJson = await resumeRes.json();
        if (resumeJson.resume) resumeData = resumeJson.resume;
      } catch {}
      setJobs(jobsData);
      setResume(resumeData);
    };
    fetchData();
  }, []);

  // Fetch questions from backend (no axios)
  const startInterview = async () => {
console.log("Submitting interview to", `${import.meta.env.VITE_API_URL}/interview/submit`);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/interview/questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          job: selectedJob,
          resume,
        }),
      });
      const data = await res.json();
      if (Array.isArray(data.questions) && data.questions.length > 0) {
        setQuestions(data.questions);
      } else {
        setQuestions([
          "Tell me about yourself.",
          "Describe a challenging project you worked on.",
          "How do you handle tight deadlines?",
          "What is your experience with React?",
          "Why do you want to work at this company?",
        ]);
      }
    } catch {
      setQuestions([
        "Tell me about yourself.",
        "Describe a challenging project you worked on.",
        "How do you handle tight deadlines?",
        "What is your experience with React?",
        "Why do you want to work at this company?",
      ]);
    }
    setStep(1);
    setCurrentQ(0);
    setAnswers([]);
    setMediaBlobs([]);
  };

  // Start recording (audio+video)
  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    videoRef.current.srcObject = stream;
    recorderRef.current = new RecordRTC(stream, { type: "video" });
    recorderRef.current.startRecording();
    setRecording(true);
    setTimer(0);
    timerInterval.current = setInterval(() => {
      setTimer((t) => t + 1);
    }, 1000);
  };

  // Stop recording and save blob
  const stopRecording = async () => {
    await recorderRef.current.stopRecording(() => {
      const blob = recorderRef.current.getBlob();
      setMediaBlobs((prev) => [...prev, blob]);
      setRecording(false);
      clearInterval(timerInterval.current);
      // Save timer for this answer
      setAnswers((prev) => {
        const copy = [...prev];
        copy[currentQ] = {
          ...copy[currentQ],
          timeTaken: timer,
        };
        return copy;
      });
    });
    let tracks = videoRef.current.srcObject.getTracks();
    tracks.forEach((track) => track.stop());
  };

  // Next question
  const handleNext = () => {
    setCurrentQ((q) => q + 1);
    setTimer(0);
  };

  // Save answer as user types
  const handleAnswerChange = (e) => {
    const value = e.target.value;
    setAnswers((prev) => {
      const copy = [...prev];
      copy[currentQ] = {
        ...copy[currentQ],
        question: questions[currentQ],
        textAnswer: value,
        timeTaken: timer,
      };
      return copy;
    });
  };

  // Submit all answers (no axios)
  const submitInterview = async () => {
    try {
      const formData = new FormData();
      formData.append("data", JSON.stringify({ answers }));
      mediaBlobs.forEach((blob, i) => {
        formData.append("media", blob, `answer${i + 1}.webm`);
      });
      const res = await fetch(`${import.meta.env.VITE_API_URL}/interview/submit`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      setFeedback(data.feedback);
    } catch {
      setFeedback({
        overallFeedback: "Great job! You communicated clearly and showed strong technical skills.",
        perQuestion: [
          { question: questions[0], feedback: "Good introduction, confident tone." },
          { question: questions[1], feedback: "Explained the challenge well, could add more about your role." },
          { question: questions[2], feedback: "Nice strategies for deadlines." },
          { question: questions[3], feedback: "Solid React experience, mention specific projects next time." },
          { question: questions[4], feedback: "Motivation is clear, try to connect more with company values." },
        ],
      });
    }
    setStep(2);
  };

  // UI
  if (step === 0)
    return (
      <Card className="max-w-xl mx-auto mt-12">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-primary">AI Interview Prep</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 text-muted-foreground">Select a job to start your mock interview:</div>
          <div className="grid gap-3">
            {(Array.isArray(jobs) ? jobs : []).map((job) => {
              const isSelected = selectedJob?._id === job._id;
              console.log("Job:", job.company_name, "| Job ID:", job._id, "| Selected Job ID:", selectedJob?._id, "| Is Selected:", isSelected);
              return (
                <Button
                  key={job._id || job.job_title}
                  variant={isSelected ? "default" : "outline"}
                  className={`w-full justify-start ${
                    isSelected
                      ? "bg-blue-100 text-primary border-primary"
                      : "bg-white text-black border-gray-200"
                  } hover:bg-blue-100 transition-colors`}
                  onClick={() => {
                    console.log("Clicked job:", job);
                    console.log("Setting selectedJob to:", job);
                    setSelectedJob(job);
                  }}
                >
                  <span className="font-semibold">{job.company_name}</span>
                  <span className="ml-2 text-xs text-muted-foreground">{job.job_title}</span>
                </Button>
              );
            })}
          </div>
          <Button
            className="mt-6 w-full"
            disabled={!selectedJob}
            onClick={startInterview}
          >
            Start Interview
          </Button>
        </CardContent>
      </Card>
    );

  if (step === 1)
    return (
      <Card className="max-w-xl mx-auto mt-12">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-primary">
            Question {currentQ + 1} of {questions.length}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 text-lg font-medium text-foreground">{questions[currentQ]}</div>
          <video ref={videoRef} autoPlay muted className="rounded-lg border mb-4 w-full h-64 object-cover bg-black" />
          <div className="flex items-center gap-4 mb-4">
            <Button onClick={startRecording} disabled={recording}>
              {recording ? "Recording..." : "Start Recording"}
            </Button>
            <Button onClick={stopRecording} disabled={!recording}>
              Stop
            </Button>
            <span className="text-muted-foreground">{timer}s</span>
          </div>
          <textarea
            className="w-full border rounded p-2 mb-4"
            placeholder="Type your answer (optional, for text analysis)"
            value={answers[currentQ]?.textAnswer || ""}
            onChange={handleAnswerChange}
          />
          <div className="flex justify-between">
            <Button
              variant="outline"
              disabled={currentQ === 0}
              onClick={() => setCurrentQ((q) => q - 1)}
            >
              Previous
            </Button>
            {currentQ < questions.length - 1 ? (
              <Button onClick={handleNext}>Next</Button>
            ) : (
              <Button onClick={submitInterview}>Submit</Button>
            )}
          </div>
        </CardContent>
      </Card>
    );

  if (step === 2)
  return (
    <Card className="max-w-xl mx-auto mt-12">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-primary">Your Interview Feedback</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Handle object or string for overallFeedback */}
        <div className="mb-4 text-foreground">
          {typeof feedback?.overallFeedback === "string" ? (
            feedback.overallFeedback
          ) : feedback?.overallFeedback && typeof feedback.overallFeedback === "object" ? (
            <ul className="list-disc ml-4">
              {feedback.overallFeedback.strengths && (
                <li>
                  <b>Strengths:</b> {feedback.overallFeedback.strengths}
                </li>
              )}
              {feedback.overallFeedback.weaknesses && (
                <li>
                  <b>Weaknesses:</b> {feedback.overallFeedback.weaknesses}
                </li>
              )}
              {feedback.overallFeedback.tipsForImprovement && (
                <li>
                  <b>Tips for Improvement:</b> {feedback.overallFeedback.tipsForImprovement}
                </li>
              )}
            </ul>
          ) : null}
        </div>
        <div className="space-y-4">
          {(Array.isArray(feedback?.perQuestion) ? feedback.perQuestion : []).map((q, i) => (
            <div key={i} className="bg-muted/40 rounded p-3">
              <div className="font-semibold text-foreground">{q.question}</div>
              <div className="text-sm text-blue-900 mb-1">
                <span className="font-semibold">Your answer:</span>{" "}
                {answers[i]?.textAnswer || <span className="italic text-gray-400">No answer recorded</span>}
              </div>
              <div className="text-muted-foreground">
                {typeof q.feedback === "string" ? (
                  q.feedback
                ) : q.feedback && typeof q.feedback === "object" ? (
                  <ul className="list-disc ml-4">
                    {q.feedback.strengths && (
                      <li>
                        <b>Strengths:</b> {q.feedback.strengths}
                      </li>
                    )}
                    {q.feedback.weaknesses && (
                      <li>
                        <b>Weaknesses:</b> {q.feedback.weaknesses}
                      </li>
                    )}
                    {q.feedback.tipsForImprovement && (
                      <li>
                        <b>Tips for Improvement:</b> {q.feedback.tipsForImprovement}
                      </li>
                    )}
                  </ul>
                ) : null}
              </div>
            </div>
          ))}
        </div>
        <Button className="mt-6 w-full" onClick={() => setStep(0)}>
          Try Another Interview
        </Button>
      </CardContent>
    </Card>
  );
};

export default InterviewPrep;