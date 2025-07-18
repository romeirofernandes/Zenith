import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import RecordRTC from "recordrtc";

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

  // --- Speech Recognition (IMPROVED VERSION) ---
  const [transcript, setTranscript] = useState("");
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      console.warn("SpeechRecognition not supported in this browser.");
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    // OPTIMIZED SETTINGS FOR BETTER RESULTS
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      console.log("🎤 Speech recognition started");
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      console.log("📝 Speech result received");
      let finalTranscript = "";
      let interimTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcriptPart = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcriptPart + " ";
          console.log("✅ Final:", transcriptPart);
        } else {
          interimTranscript += transcriptPart;
          console.log("⏳ Interim:", transcriptPart);
        }
      }

      if (finalTranscript) {
        setTranscript(prev => prev + finalTranscript);
      }
      
      // Show interim results too
      if (interimTranscript) {
        setTranscript(prev => {
          const baseTxt = prev.replace(/ \[speaking\.\.\.\].*/, "");
          return baseTxt + " [speaking...] " + interimTranscript;
        });
      }
    };

    recognition.onerror = (event) => {
      console.error("❌ Speech error:", event.error);
      if (event.error === "no-speech") {
        console.log("🔄 Restarting due to no-speech...");
        setTimeout(() => {
          if (recording && recognitionRef.current) {
            recognitionRef.current.start();
          }
        }, 1000);
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      console.log("🛑 Speech recognition ended");
      setIsListening(false);
      // Auto-restart if still recording
      if (recording) {
        console.log("🔄 Auto-restarting recognition...");
        setTimeout(() => {
          if (recording && recognitionRef.current) {
            recognitionRef.current.start();
          }
        }, 500);
      }
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognition) {
        recognition.stop();
      }
    };
  }, [recording]);

  // Fetch jobs and resume from backend, fallback to sample data
  useEffect(() => {
    const fetchData = async () => {
      let jobsData = sampleJobs;
      let resumeData = sampleResume;
      try {
        const user = JSON.parse(localStorage.getItem("firebaseUser"));
        const firebaseUid = user?.uid || localStorage.getItem("firebaseUid");
        if (firebaseUid) {
          const jobsRes = await fetch(`${import.meta.env.VITE_API_URL}/jobs/wishlist/user/${firebaseUid}`);
          const jobsJson = await jobsRes.json();
          if (Array.isArray(jobsJson.wishlist) && jobsJson.wishlist.length > 0) jobsData = jobsJson.wishlist;
        }
      } catch {}
      try {
        const resumeRes = await fetch(`${import.meta.env.VITE_API_URL}/profile/resume`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        });
        const resumeJson = await resumeRes.json();
        if (resumeJson.resume) resumeData = resumeJson.resume;
      } catch {}
      setJobs(jobsData);
      setResume(resumeData);
    };
    fetchData();
  }, []);

  const startInterview = async () => {
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
    setTranscript("");
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      
      videoRef.current.srcObject = stream;
      recorderRef.current = new RecordRTC(stream, { type: "video" });
      recorderRef.current.startRecording();
      setRecording(true);
      setTimer(0);
      setTranscript(""); // Clear previous transcript
      
      timerInterval.current = setInterval(() => {
        setTimer((t) => t + 1);
      }, 1000);

      // Start speech recognition after a small delay
      setTimeout(() => {
        if (recognitionRef.current) {
          console.log("🚀 Starting speech recognition...");
          recognitionRef.current.start();
        }
      }, 500);

    } catch (error) {
      console.error("Error starting recording:", error);
    }
  };

  const stopRecording = async () => {
    // Stop speech recognition first
    if (recognitionRef.current) {
      console.log("🛑 Stopping speech recognition...");
      recognitionRef.current.stop();
    }
    setRecording(false);
    setIsListening(false);

    await recorderRef.current.stopRecording(() => {
      const blob = recorderRef.current.getBlob();
      setMediaBlobs((prev) => [...prev, blob]);
      clearInterval(timerInterval.current);
      
      setAnswers((prev) => {
        const copy = [...prev];
        copy[currentQ] = {
          ...copy[currentQ],
          timeTaken: timer,
          transcript: transcript.replace(/ \[speaking\.\.\.\].*/, "").trim()
        };
        return copy;
      });
    });

    let tracks = videoRef.current.srcObject.getTracks();
    tracks.forEach((track) => track.stop());
  };

  const handleNext = () => {
    setCurrentQ((q) => q + 1);
    setTimer(0);
    setTranscript("");
  };

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

const submitInterview = async () => {
  try {
    setStep(2); // Show loading state first
    setFeedback({ loading: true });

    // Prepare comprehensive interview data for AI analysis
    const interviewData = {
      job: selectedJob,
      resume: resume,
      questions: questions,
      answers: answers.map((answer, i) => ({
        questionNumber: i + 1,
        question: questions[i],
        textAnswer: answer?.textAnswer || "",
        transcript: answer?.transcript || "",
        timeTaken: answer?.timeTaken || 0,
        hasVideo: mediaBlobs[i] ? true : false
      })),
      totalTime: answers.reduce((sum, answer) => sum + (answer?.timeTaken || 0), 0),
      completedAt: new Date().toISOString()
    };

    const formData = new FormData();
    formData.append("interviewData", JSON.stringify(interviewData));
    
    // Add video recordings (commented out for now to avoid large uploads)
    // mediaBlobs.forEach((blob, i) => {
    //   formData.append("video", blob, `question_${i + 1}_answer.webm`);
    // });

    // Get fresh auth token
    let authToken = localStorage.getItem("authToken");
    
    const res = await fetch(`${import.meta.env.VITE_API_URL}/interview/submit`, {
      method: "POST",
      headers: {
        ...(authToken && { 'Authorization': `Bearer ${authToken}` }),
      },
      body: formData,
    });

    if (!res.ok) {
      if (res.status === 401) {
        // Token expired, try without auth for now
        console.warn("Auth token expired, submitting without authentication");
        const retryRes = await fetch(`${import.meta.env.VITE_API_URL}/interview/submit`, {
          method: "POST",
          body: formData,
        });
        
        if (!retryRes.ok) {
          throw new Error(`HTTP error! status: ${retryRes.status}`);
        }
        
        const data = await retryRes.json();
        setFeedback(data.feedback || data);
        return;
      }
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const data = await res.json();
    console.log("Interview feedback received:", data);
    
    // Set the AI-generated feedback
    setFeedback(data.feedback || data);
    
  } catch (error) {
    console.error("Error submitting interview for AI review:", error);
    
    // Enhanced fallback feedback
    setFeedback({
      overallFeedback: {
        strengths: "You completed the interview successfully and provided thoughtful responses to all questions.",
        weaknesses: "Consider providing more specific examples and quantifiable achievements in your answers.",
        tipsForImprovement: "Practice speaking more slowly and clearly, and use the STAR method (Situation, Task, Action, Result) for behavioral questions."
      },
      perQuestion: questions.map((question, i) => ({
        question: question,
        feedback: {
          strengths: answers[i]?.textAnswer || answers[i]?.transcript ? "You provided a clear response to this question." : "You attempted to answer this question.",
          weaknesses: "Could be more detailed and include specific examples.",
          tipsForImprovement: "Consider structuring your answer with clear beginning, middle, and end."
        }
      })),
      score: {
        overall: 75,
        communication: 80,
        technical: 70,
        confidence: 75
      },
      recommendations: [
        "Practice common interview questions",
        "Prepare specific examples from your experience",
        "Work on speaking clearly and at an appropriate pace"
      ]
    });
  }
};
  // UI
  if (step === 0)
    return (
      <Card className="max-w-xl mx-auto mt-12">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-primary">🎯 AI Interview Prep</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 text-muted-foreground">Select a job to start your mock interview:</div>
          <div className="grid gap-3">
            {(Array.isArray(jobs) ? jobs : []).map((job) => {
              const isSelected = selectedJob?.id === job.id;
              return (
                <Button
                  key={job.id || job.jobtitle}
                  variant={isSelected ? "default" : "outline"}
                  className={`w-full justify-start ${
                    isSelected
                      ? "bg-blue-100 text-primary border-primary"
                      : "bg-white text-black border-gray-200"
                  } hover:bg-blue-100 transition-colors`}
                  onClick={() => setSelectedJob(job)}
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
            🚀 Start Interview
          </Button>
        </CardContent>
      </Card>
    );

  if (step === 1)
    return (
      <Card className="max-w-xl mx-auto mt-12">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-primary">
            📝 Question {currentQ + 1} of {questions.length}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 text-lg font-medium text-foreground">{questions[currentQ]}</div>
          <video ref={videoRef} autoPlay muted className="rounded-lg border mb-4 w-full h-64 object-cover bg-black" />
          
          <div className="flex items-center gap-4 mb-4">
            <Button 
              onClick={startRecording} 
              disabled={recording}
              className={recording ? "bg-red-500" : ""}
            >
              {recording ? "🔴 Recording..." : "🎬 Start Recording"}
            </Button>
            <Button onClick={stopRecording} disabled={!recording}>
              ⏹️ Stop
            </Button>
            <span className="text-muted-foreground">⏱️ {timer}s</span>
            {isListening && <span className="text-green-500 text-sm">🎤 Listening...</span>}
          </div>

          {/* IMPROVED TRANSCRIPTION DISPLAY */}
          <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border-l-4 border-blue-400">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">🎤</span>
              <b className="text-blue-800">Live Transcription:</b>
              {isListening && <span className="animate-pulse text-green-600">●</span>}
            </div>
            <div className="min-h-[60px] text-gray-800 leading-relaxed">
              {transcript ? (
                <span className="whitespace-pre-wrap">{transcript}</span>
              ) : (
                <span className="text-gray-400 italic">
                  {recording ? "🎯 Start speaking..." : "Click 'Start Recording' and speak clearly"}
                </span>
              )}
            </div>
          </div>

          <textarea
            className="w-full border rounded p-3 mb-4"
            placeholder="✍️ Type your answer or edit the transcription above..."
            value={answers[currentQ]?.textAnswer || ""}
            onChange={handleAnswerChange}
            rows={4}
          />
          
          <div className="flex justify-between">
            <Button
              variant="outline"
              disabled={currentQ === 0}
              onClick={() => setCurrentQ((q) => q - 1)}
            >
              ⬅️ Previous
            </Button>
            {currentQ < questions.length - 1 ? (
              <Button onClick={handleNext}>Next ➡️</Button>
            ) : (
              <Button onClick={submitInterview} className="bg-green-600">
                🎉 Submit Interview
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );

  if (step === 2)
    return (
      <Card className="max-w-2xl mx-auto mt-12">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-primary">📊 Your Interview Feedback</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6 p-4 bg-green-50 rounded-lg border-l-4 border-green-400">
            <h3 className="font-semibold text-green-800 mb-2">🎯 Overall Feedback</h3>
            <div className="text-green-700">
              {typeof feedback?.overallFeedback === "string" ? (
                feedback.overallFeedback
              ) : feedback?.overallFeedback && typeof feedback.overallFeedback === "object" ? (
                <ul className="list-disc ml-4 space-y-1">
                  {feedback.overallFeedback.strengths && (
                    <li><b>Strengths:</b> {feedback.overallFeedback.strengths}</li>
                  )}
                  {feedback.overallFeedback.weaknesses && (
                    <li><b>Areas to Improve:</b> {feedback.overallFeedback.weaknesses}</li>
                  )}
                  {feedback.overallFeedback.tipsForImprovement && (
                    <li><b>Tips:</b> {feedback.overallFeedback.tipsForImprovement}</li>
                  )}
                </ul>
              ) : "Great job completing the interview!"}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-lg">📝 Question-by-Question Feedback</h3>
            {(Array.isArray(feedback?.perQuestion) ? feedback.perQuestion : []).map((q, i) => (
              <div key={i} className="bg-gray-50 rounded-lg p-4 border">
                <div className="font-semibold text-gray-800 mb-2">❓ {q.question}</div>
                <div className="text-sm text-blue-900 mb-2 p-2 bg-blue-50 rounded">
                  <b>Your answer:</b>{" "}
                  {answers[i]?.textAnswer || answers[i]?.transcript || (
                    <span className="italic text-gray-500">No text recorded</span>
                  )}
                </div>
                <div className="text-gray-700">
                  <b>💡 Feedback:</b>{" "}
                  {typeof q.feedback === "string" ? (
                    q.feedback
                  ) : q.feedback && typeof q.feedback === "object" ? (
                    <ul className="list-disc ml-4 mt-1">
                      {q.feedback.strengths && <li><b>Strengths:</b> {q.feedback.strengths}</li>}
                      {q.feedback.weaknesses && <li><b>Improve:</b> {q.feedback.weaknesses}</li>}
                      {q.feedback.tipsForImprovement && <li><b>Tips:</b> {q.feedback.tipsForImprovement}</li>}
                    </ul>
                  ) : "Good response!"}
                </div>
              </div>
            ))}
          </div>

          <Button className="mt-6 w-full" onClick={() => setStep(0)}>
            🔄 Try Another Interview
          </Button>
        </CardContent>
      </Card>
    );
};

export default InterviewPrep;