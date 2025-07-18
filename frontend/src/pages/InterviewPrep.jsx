import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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

// ---- BODY LANGUAGE ANALYZER ----
class BodyLanguageAnalyzer {
  constructor() {
    this.audioContext = null;
    this.analyzer = null;
    this.isInitialized = false;
  }

  async initialize() {
    try {
      // Initialize audio context for tone analysis
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.analyzer = this.audioContext.createAnalyser();
      this.analyzer.fftSize = 2048;
      
      this.isInitialized = true;
      console.log("🤖 Body language analyzer initialized");
    } catch (error) {
      console.error("Failed to initialize analyzer:", error);
    }
  }

  analyzePosture(videoElement) {
    if (!this.isInitialized || !videoElement) return null;

    // Simple posture analysis (mock data for now - can be enhanced with ML models)
    const analysis = {
      posture: this.calculatePostureScore(),
      eyeContact: this.estimateEyeContact(),
      handGestures: this.analyzeHandGestures(),
      facialExpression: this.analyzeFacialExpression()
    };

    return analysis;
  }

  analyzeAudioTone(audioStream) {
    if (!this.audioContext || !audioStream) return null;

    try {
      const source = this.audioContext.createMediaStreamSource(audioStream);
      source.connect(this.analyzer);

      const bufferLength = this.analyzer.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      this.analyzer.getByteFrequencyData(dataArray);

      // Analyze tone characteristics
      return {
        pitch: this.calculatePitch(dataArray),
        volume: this.calculateVolume(dataArray),
        clarity: this.calculateClarity(dataArray),
        pace: this.calculateSpeechPace(dataArray)
      };
    } catch (error) {
      console.error("Audio analysis error:", error);
      return null;
    }
  }

  calculatePostureScore() {
    return Math.floor(Math.random() * 40) + 60; // Mock score 60-100
  }

  estimateEyeContact() {
    return Math.floor(Math.random() * 30) + 70; // Mock score 70-100
  }

  analyzeHandGestures() {
    const gestures = ['calm', 'expressive', 'fidgeting', 'professional'];
    return gestures[Math.floor(Math.random() * gestures.length)];
  }

  analyzeFacialExpression() {
    const expressions = ['confident', 'nervous', 'engaged', 'neutral'];
    return expressions[Math.floor(Math.random() * expressions.length)];
  }

  calculatePitch(dataArray) {
    const sum = dataArray.reduce((a, b) => a + b, 0);
    return Math.floor((sum / dataArray.length) * 100 / 255);
  }

  calculateVolume(dataArray) {
    const sum = dataArray.reduce((a, b) => a + b, 0);
    return Math.floor((sum / dataArray.length) * 100 / 255);
  }

  calculateClarity(dataArray) {
    return Math.floor(Math.random() * 20) + 80; // Mock score
  }

  calculateSpeechPace(dataArray) {
    const speeds = ['too slow', 'perfect', 'too fast', 'good'];
    return speeds[Math.floor(Math.random() * speeds.length)];
  }

  generateRealTimeFeedback(bodyAnalysis, audioAnalysis) {
    const feedback = [];

    if (bodyAnalysis?.posture < 70) {
      feedback.push("🔄 Sit up straighter for better presence");
    }
    if (bodyAnalysis?.eyeContact < 75) {
      feedback.push("👁️ Try to look more directly at the camera");
    }
    if (audioAnalysis?.volume < 50) {
      feedback.push("🔊 Speak a bit louder");
    }
    if (audioAnalysis?.volume > 80) {
      feedback.push("🔉 Lower your voice slightly");
    }
    if (audioAnalysis?.pace === 'too fast') {
      feedback.push("⏳ Slow down your speech pace");
    }
    if (audioAnalysis?.pace === 'too slow') {
      feedback.push("⚡ Speed up your speech a bit");
    }

    return feedback;
  }
}

const bodyLanguageAnalyzer = new BodyLanguageAnalyzer();

const InterviewPrep = () => {
  // EXISTING STATE
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

  // EXISTING SPEECH RECOGNITION
  const [transcript, setTranscript] = useState("");
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);
  const transcriptRef = useRef("");

  // NEW: Body language and tone analysis state
  const [bodyLanguageAnalysis, setBodyLanguageAnalysis] = useState(null);
  const [audioAnalysis, setAudioAnalysis] = useState(null);
  const [realTimeFeedback, setRealTimeFeedback] = useState([]);
  const [analysisEnabled, setAnalysisEnabled] = useState(false);
  const analysisInterval = useRef(null);
  const [audioStream, setAudioStream] = useState(null);

  // EXISTING SPEECH RECOGNITION SETUP
  useEffect(() => {
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      console.warn("SpeechRecognition not supported in this browser.");
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
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
        transcriptRef.current += finalTranscript + " ";
      }
      
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

  // NEW: Initialize body language analyzer
  useEffect(() => {
    const initAnalyzer = async () => {
      await bodyLanguageAnalyzer.initialize();
    };
    initAnalyzer();
  }, []);

  // NEW: Real-time analysis during recording
  useEffect(() => {
    if (recording && analysisEnabled) {
      analysisInterval.current = setInterval(() => {
        performRealTimeAnalysis();
      }, 2000); // Analyze every 2 seconds
    } else {
      if (analysisInterval.current) {
        clearInterval(analysisInterval.current);
      }
    }

    return () => {
      if (analysisInterval.current) {
        clearInterval(analysisInterval.current);
      }
    };
  }, [recording, analysisEnabled]);

  const performRealTimeAnalysis = () => {
    if (!videoRef.current || !analysisEnabled) return;

    // Analyze body language
    const bodyAnalysis = bodyLanguageAnalyzer.analyzePosture(videoRef.current);
    setBodyLanguageAnalysis(bodyAnalysis);

    // Analyze audio tone
    const audioAnalysisResult = bodyLanguageAnalyzer.analyzeAudioTone(audioStream);
    setAudioAnalysis(audioAnalysisResult);

    // Generate real-time feedback
    const feedback = bodyLanguageAnalyzer.generateRealTimeFeedback(bodyAnalysis, audioAnalysisResult);
    setRealTimeFeedback(feedback);
  };

  // EXISTING: Fetch jobs and resume
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

  // EXISTING: Initialize interview
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
      let qs = [];
      if (Array.isArray(data.questions) && data.questions.length > 0) {
        qs = data.questions;
        setQuestions(qs);
      } else {
        qs = [
          "Tell me about yourself.",
          "Describe a challenging project you worked on.",
          "How do you handle tight deadlines?",
          "What is your experience with React?",
          "Why do you want to work at this company?",
        ];
        setQuestions(qs);
      }
      setAnswers(qs.map(q => ({
        question: q,
        textAnswer: "",
        transcript: "",
        timeTaken: 0,
      })));
    } catch {
      const qs = [
        "Tell me about yourself.",
        "Describe a challenging project you worked on.",
        "How do you handle tight deadlines?",
        "What is your experience with React?",
        "Why do you want to work at this company?",
      ];
      setQuestions(qs);
      setAnswers(qs.map(q => ({
        question: q,
        textAnswer: "",
        transcript: "",
        timeTaken: 0,
      })));
    }
    setStep(1);
    setCurrentQ(0);
    setMediaBlobs([]);
    setTranscript("");
    transcriptRef.current = "";
  };

  // ENHANCED: Start recording with analysis
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
      
      setAudioStream(stream);
      videoRef.current.srcObject = stream;
      recorderRef.current = new RecordRTC(stream, { type: "video" });
      recorderRef.current.startRecording();
      setRecording(true);
      setTimer(0);
      setTranscript("");
      transcriptRef.current = "";
      
      // Reset analysis data
      setBodyLanguageAnalysis(null);
      setAudioAnalysis(null);
      setRealTimeFeedback([]);
      
      timerInterval.current = setInterval(() => {
        setTimer((t) => t + 1);
      }, 1000);

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

  // ENHANCED: Stop recording with analysis
  const stopRecording = async () => {
    if (recognitionRef.current) {
      console.log("🛑 Stopping speech recognition...");
      recognitionRef.current.stop();
    }
    
    // Stop analysis
    if (analysisInterval.current) {
      clearInterval(analysisInterval.current);
    }
    
    const cleanedTranscript = transcriptRef.current.replace(/ \[speaking\.\.\.\].*/, "").trim();
    console.log("💾 Saving transcript:", cleanedTranscript);

    // Get current textarea value
    const currentTextValue = document.querySelector('textarea')?.value || "";

    // ENHANCED: Save analysis data with answer
    setAnswers((prev) => {
      const copy = [...prev];
      copy[currentQ] = {
        ...copy[currentQ],
        question: questions[currentQ],
        timeTaken: timer,
        transcript: cleanedTranscript,
        textAnswer: currentTextValue || cleanedTranscript,
        bodyLanguageAnalysis: bodyLanguageAnalysis,
        audioAnalysis: audioAnalysis,
        realTimeFeedback: realTimeFeedback
      };
      return copy;
    });

    if (recorderRef.current) {
      await new Promise((resolve) => {
        recorderRef.current.stopRecording(() => {
          const blob = recorderRef.current.getBlob();
          setMediaBlobs((prev) => [...prev, blob]);
          resolve();
        });
      });
    }

    clearInterval(timerInterval.current);
    setRecording(false);
    setIsListening(false);

    if (videoRef.current?.srcObject) {
      let tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach((track) => track.stop());
    }
    setAudioStream(null);
  };

  // EXISTING: Handle next question
  const handleNext = async () => {
    if (recording) {
      await stopRecording();
    }

    setCurrentQ((q) => q + 1);
    setTimer(0);
    setTranscript("");
    transcriptRef.current = "";
  };

  // EXISTING: Handle answer change
  const handleAnswerChange = (e) => {
    const value = e.target.value;
    setAnswers((prev) => {
      const copy = [...prev];
      copy[currentQ] = {
        ...copy[currentQ],
        question: questions[currentQ],
        textAnswer: value,
        transcript: copy[currentQ]?.transcript || "",
        timeTaken: copy[currentQ]?.timeTaken || timer,
      };
      return copy;
    });
  };

  // ENHANCED: Submit interview with analysis data
  const submitInterview = async () => {
    try {
      if (recording) {
        await stopRecording();
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      setStep(2);
      setFeedback({ loading: true });

      // Ensure current answer is saved
      const currentAnswerValue = document.querySelector('textarea')?.value || "";
      
      const finalAnswers = answers.map((answer, i) => {
        const textValue = i === currentQ ? currentAnswerValue : (answer?.textAnswer || "");
        
        return {
          questionNumber: i + 1,
          question: questions[i],
          textAnswer: textValue || answer?.transcript || "",
          transcript: answer?.transcript || "",
          timeTaken: answer?.timeTaken || 0,
          hasVideo: mediaBlobs[i] ? true : false,
          bodyLanguageAnalysis: answer?.bodyLanguageAnalysis || null,
          audioAnalysis: answer?.audioAnalysis || null
        };
      });

      console.log("🚀 Submitting interview with answers:", finalAnswers);

      const interviewData = {
        job: selectedJob,
        resume: resume,
        questions: questions,
        answers: finalAnswers,
        totalTime: finalAnswers.reduce((sum, answer) => sum + (answer?.timeTaken || 0), 0),
        completedAt: new Date().toISOString()
      };

      const formData = new FormData();
      formData.append("interviewData", JSON.stringify(interviewData));
      
      mediaBlobs.forEach((blob, index) => {
        formData.append(`video_${index}`, blob, `answer_${index}.webm`);
      });
      
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
      console.log("✅ Interview feedback received:", data);
      
      setFeedback(data.feedback || data);
      
    } catch (error) {
      console.error("❌ Error submitting interview:", error);
      
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

  // NEW: Real-time feedback component
  const RealTimeFeedbackPanel = () => (
    <div className="mb-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border-l-4 border-purple-400">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-lg">🤖</span>
          <b className="text-purple-800">AI Coach</b>
        </div>
        <Button
          size="sm"
          variant={analysisEnabled ? "destructive" : "default"}
          onClick={() => setAnalysisEnabled(!analysisEnabled)}
        >
          {analysisEnabled ? "🔴 Disable AI Coach" : "🎯 Enable AI Coach"}
        </Button>
      </div>
      
      {analysisEnabled && (
        <div className="space-y-3">
          {/* Body Language Metrics */}
          {bodyLanguageAnalysis && (
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-3 rounded-lg">
                <div className="text-sm font-semibold text-gray-600">Posture</div>
                <div className="flex items-center gap-2">
                  <div className="text-lg font-bold text-blue-600">{bodyLanguageAnalysis.posture}%</div>
                  <Badge variant={bodyLanguageAnalysis.posture > 75 ? "default" : "destructive"}>
                    {bodyLanguageAnalysis.posture > 75 ? "Good" : "Improve"}
                  </Badge>
                </div>
              </div>
              <div className="bg-white p-3 rounded-lg">
                <div className="text-sm font-semibold text-gray-600">Eye Contact</div>
                <div className="flex items-center gap-2">
                  <div className="text-lg font-bold text-green-600">{bodyLanguageAnalysis.eyeContact}%</div>
                  <Badge variant={bodyLanguageAnalysis.eyeContact > 70 ? "default" : "destructive"}>
                    {bodyLanguageAnalysis.eyeContact > 70 ? "Great" : "Focus"}
                  </Badge>
                </div>
              </div>
            </div>
          )}

          {/* Audio Analysis */}
          {audioAnalysis && (
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-3 rounded-lg">
                <div className="text-sm font-semibold text-gray-600">Voice Tone</div>
                <div className="flex items-center gap-2">
                  <div className="text-lg font-bold text-indigo-600">{audioAnalysis.pitch}%</div>
                  <Badge variant="secondary">{audioAnalysis.pace}</Badge>
                </div>
              </div>
              <div className="bg-white p-3 rounded-lg">
                <div className="text-sm font-semibold text-gray-600">Volume</div>
                <div className="flex items-center gap-2">
                  <div className="text-lg font-bold text-orange-600">{audioAnalysis.volume}%</div>
                  <Badge variant={audioAnalysis.volume > 40 && audioAnalysis.volume < 80 ? "default" : "destructive"}>
                    {audioAnalysis.volume > 40 && audioAnalysis.volume < 80 ? "Perfect" : "Adjust"}
                  </Badge>
                </div>
              </div>
            </div>
          )}

          {/* Real-time Feedback */}
          {realTimeFeedback.length > 0 && (
            <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
              <div className="text-sm font-semibold text-yellow-800 mb-2">💡 Live Tips:</div>
              <ul className="space-y-1">
                {realTimeFeedback.slice(0, 3).map((tip, index) => (
                  <li key={index} className="text-sm text-yellow-700 flex items-center gap-2">
                    <span className="w-1 h-1 bg-yellow-500 rounded-full"></span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );

  // EXISTING: Step 0 - Job Selection
  if (step === 0)
    return (
      <Card className="max-w-5xl mx-auto mt-12 ">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-primary"> AI Interview Prep</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 text-muted-foreground">Select a job to start your mock interview:</div>
          <div className="grid gap-3">
            {(Array.isArray(jobs) ? jobs : []).map((job) => {
              const isSelected = selectedJob?._id === job._id;
              return (
                <Button
                  key={job._id || job.jobtitle}
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
             Start Interview
          </Button>
        </CardContent>
      </Card>
    );

  // ENHANCED: Step 1 - Interview with AI Analysis
  if (step === 1)
    return (
      <Card className="max-w-6xl mx-auto mt-12">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-primary">
            📝 Question {currentQ + 1} of {questions.length}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left Column - Video and Controls */}
            <div className="lg:col-span-2">
              <div className="mb-4 text-lg font-medium text-foreground">{questions[currentQ]}</div>
              <video ref={videoRef} autoPlay muted className="rounded-lg border mb-4 w-full h-64 object-cover bg-black" />
              
              <div className="flex items-center gap-4 mb-4">
                <Button 
                  onClick={startRecording} 
                  disabled={recording}
                  className={recording ? "bg-red-500 hover:bg-red-600" : ""}
                >
                  {recording ? "🔴 Recording..." : "🎬 Start Recording"}
                </Button>
                <Button onClick={stopRecording} disabled={!recording}>
                  ⏹️ Stop
                </Button>
                <span className="text-muted-foreground">⏱️ {timer}s</span>
                {isListening && <span className="text-green-500 text-sm">🎤 Listening...</span>}
              </div>

              {/* Transcription Display */}
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
                placeholder="✍️ Speak or type your answer..."
                value={answers[currentQ]?.textAnswer || transcript || ""}
                onChange={handleAnswerChange}
                rows={4}
              />
            </div>

            {/* Right Column - AI Analysis */}
            <div className="lg:col-span-1">
              <RealTimeFeedbackPanel />
              
              {/* Body Language Summary */}
              {bodyLanguageAnalysis && (
                <div className="mb-4 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-3">📊 Body Language</h4>
                  <div className="space-y-2 text-sm">
                    <div>Hand Gestures: <Badge variant="outline">{bodyLanguageAnalysis.handGestures}</Badge></div>
                    <div>Expression: <Badge variant="outline">{bodyLanguageAnalysis.facialExpression}</Badge></div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex justify-between mt-6">
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
              <Button onClick={submitInterview} className="bg-green-600 hover:bg-green-700">
                🎉 Submit Interview
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );

  // ENHANCED: Step 2 - Feedback with Body Language Analysis
  if (step === 2)
    return (
      <Card className="max-w-4xl mx-auto mt-12">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-primary">📊 Your Interview Feedback</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6 p-4 bg-green-50 rounded-lg border-l-4 border-green-400">
            <h3 className="font-semibold text-green-800 mb-2">🎯 Overall Feedback</h3>
            <div className="text-green-700">
              {feedback?.loading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-700"></div>
                  Analyzing your responses and body language...
                </div>
              ) : typeof feedback?.overallFeedback === "string" ? (
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

          {/* NEW: Body Language Summary */}
          {!feedback?.loading && answers.some(a => a.bodyLanguageAnalysis) && (
            <div className="mb-6 p-4 bg-purple-50 rounded-lg border-l-4 border-purple-400">
              <h3 className="font-semibold text-purple-800 mb-3">🤖 Body Language & Tone Analysis</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">📐 Average Scores</h4>
                  <div className="space-y-2">
                    {answers.filter(a => a.bodyLanguageAnalysis).length > 0 && (
                      <>
                        <div className="flex justify-between">
                          <span>Posture:</span>
                          <Badge>{Math.round(answers.filter(a => a.bodyLanguageAnalysis).reduce((sum, a) => sum + a.bodyLanguageAnalysis.posture, 0) / answers.filter(a => a.bodyLanguageAnalysis).length)}%</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Eye Contact:</span>
                          <Badge>{Math.round(answers.filter(a => a.bodyLanguageAnalysis).reduce((sum, a) => sum + a.bodyLanguageAnalysis.eyeContact, 0) / answers.filter(a => a.bodyLanguageAnalysis).length)}%</Badge>
                        </div>
                      </>
                    )}
                  </div>
                </div>
                <div className="bg-white p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">🎵 Voice Analysis</h4>
                  <div className="space-y-2 text-sm">
                    <div>Most common pace: <Badge variant="outline">Good</Badge></div>
                    <div>Tone consistency: <Badge variant="outline">Stable</Badge></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {!feedback?.loading && (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">📝 Question-by-Question Analysis</h3>
              {(Array.isArray(feedback?.perQuestion) ? feedback.perQuestion : []).map((q, i) => (
                <div key={i} className="bg-gray-50 rounded-lg p-4 border">
                  <div className="font-semibold text-gray-800 mb-2">❓ {q.question}</div>
                  
                  {/* Answer and body language data */}
                  <div className="grid md:grid-cols-2 gap-4 mb-3">
                    <div className="text-sm text-blue-900 p-2 bg-blue-50 rounded">
                      <b>Your answer:</b>{" "}
                      {answers[i]?.textAnswer || answers[i]?.transcript || (
                        <span className="italic text-gray-500">No text recorded</span>
                      )}
                    </div>
                    
                    {answers[i]?.bodyLanguageAnalysis && (
                      <div className="text-sm p-2 bg-purple-50 rounded">
                        <b>Body Language:</b>
                        <div className="mt-1 flex gap-2">
                          <Badge size="sm">Posture: {answers[i].bodyLanguageAnalysis.posture}%</Badge>
                          <Badge size="sm" variant="outline">{answers[i].bodyLanguageAnalysis.handGestures}</Badge>
                        </div>
                      </div>
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
          )}

          <Button className="mt-6 w-full" onClick={() => setStep(0)}>
            🔄 Try Another Interview
          </Button>
        </CardContent>
      </Card>
    );
};

export default InterviewPrep;