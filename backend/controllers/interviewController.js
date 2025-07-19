// const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_MODEL = "llama3-70b-8192"; 

function extractJSONArray(str) {
  const match = str.match(/\[([\s\S]*?)\]/);
  if (match) {
    try {
      return JSON.parse(match[0]);
    } catch (e) {
      return null;
    }
  }
  return null;
}

function extractJSONObject(str) {
  const match = str.match(/\{[\s\S]*\}/);
  if (match) {
    try {
      return JSON.parse(match[0]);
    } catch (e) {
      return null;
    }
  }
  return null;
}

exports.generateQuestions = async (req, res) => {
  try {
    const { job, resume } = req.body;
    const prompt = `
      You are an expert interviewer. Given the following job description and candidate resume, generate 5 interview questions (no follow-ups, just 5 main questions) that test both technical and soft skills.
      Respond ONLY with a JSON array of questions, no explanation, no intro, no markdown, no text before or after.
      Job: ${JSON.stringify(job)}
      Resume: ${JSON.stringify(resume)}
    `;
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [
          { role: "system", content: "You are an expert HR interviewer." },
          { role: "user", content: prompt }
        ]
      })
    });
    const data = await response.json();
    if (!data.choices || !data.choices[0]?.message?.content) {
      console.error("Groq API error:", data);
      return res.status(500).json({ error: data.error?.message || "Failed to generate questions" });
    }
    let questions;
    try {
      questions = JSON.parse(data.choices[0].message.content);
    } catch (e) {
      questions = extractJSONArray(data.choices[0].message.content);
    }
    if (!questions) {
      throw new Error("Could not extract questions JSON array from model response.");
    }
    res.json({ questions });
  } catch (err) {
    res.status(500).json({ error: "Failed to generate questions" });
  }
};

exports.submitInterview = async (req, res) => {
  try {
    console.log("Raw request body:", req.body);
    console.log("Files:", req.files);

    // Parse interview data from FormData
    let interviewData;
    if (req.body.interviewData) {
      try {
        interviewData = JSON.parse(req.body.interviewData);
        console.log("Parsed interview data successfully");
      } catch (e) {
        console.error("Failed to parse interviewData:", e);
        return res.status(400).json({ error: "Invalid interview data format" });
      }
    } else {
      console.error("No interviewData found in request");
      return res.status(400).json({ error: "Missing interview data" });
    }

    const { job, resume, questions, answers, totalTime } = interviewData;
    const files = req.files;

    console.log("Processing interview for job:", job?.job_title);
    console.log("Number of answers:", answers?.length);
    console.log("Total time:", totalTime);

    // --- MOCKED ANALYSIS (placeholder for future video/audio analysis) ---
    const analysis = { 
      mock: true, 
      message: "Video analysis not implemented yet",
      videosProcessed: files ? files.length : 0
    };

    // Prepare detailed feedback prompt for Groq
    const answersText = answers.map((answer, i) => {
      return `
Question ${i + 1}: ${answer.question}
Written Answer: ${answer.textAnswer || "No written answer"}
Spoken Response: ${answer.transcript || "No speech transcript"}
Time Taken: ${answer.timeTaken} seconds
      `.trim();
    }).join('\n\n');

    const feedbackPrompt = `
You are an expert HR interviewer reviewing a candidate's interview performance. Analyze the following interview data and provide comprehensive feedback.

JOB POSITION: ${job?.job_title} at ${job?.company_name}
JOB REQUIREMENTS: ${job?.required_skills?.join(', ')}

CANDIDATE BACKGROUND:
- Skills: ${resume?.skills?.join(', ')}
- Experience: ${resume?.experience?.map(exp => `${exp.position} at ${exp.company}`).join(', ')}

INTERVIEW RESPONSES:
${answersText}

TOTAL INTERVIEW TIME: ${totalTime} seconds

Please provide a detailed review in the following JSON format (respond ONLY with valid JSON, no markdown, no explanations outside the JSON):

{
  "overallFeedback": {
    "strengths": "List the candidate's main strengths based on their responses",
    "weaknesses": "Areas where the candidate could improve",
    "tipsForImprovement": "Specific actionable advice for better interview performance"
  },
  "perQuestion": [
    {
      "question": "The interview question",
      "feedback": {
        "strengths": "What the candidate did well for this specific question",
        "weaknesses": "What could be improved for this question",
        "tipsForImprovement": "Specific advice for this type of question"
      }
    }
  ],
  "score": {
    "overall": 85,
    "communication": 80,
    "technical": 90,
    "confidence": 75
  },
  "recommendations": [
    "Specific recommendation 1",
    "Specific recommendation 2",
    "Specific recommendation 3"
  ]
}
    `;

    console.log("Sending request to Groq API...");
    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [
          { role: "system", content: "You are an expert HR interviewer providing detailed feedback. Always respond with valid JSON only." },
          { role: "user", content: feedbackPrompt }
        ],
        temperature: 0.7
      })
    });

    const groqData = await groqRes.json();
    console.log("Groq API response received");

    if (!groqData.choices || !groqData.choices[0]?.message?.content) {
      console.error("Invalid Groq response:", groqData);
      throw new Error("Invalid response from AI service");
    }

    let feedback;
    try {
      feedback = JSON.parse(groqData.choices[0].message.content);
      console.log("Feedback parsed successfully");
    } catch (e) {
      console.log("Attempting to extract JSON from response...");
      feedback = extractJSONObject(groqData.choices[0].message.content);
      if (!feedback) {
        console.error("Failed to parse feedback, using fallback");
        // Fallback feedback structure
        feedback = {
          overallFeedback: {
            strengths: "You completed the interview and provided responses to the questions.",
            weaknesses: "Some responses could be more detailed and specific.",
            tipsForImprovement: "Practice providing concrete examples and speaking more confidently."
          },
          perQuestion: questions.map((question, i) => ({
            question: question,
            feedback: {
              strengths: answers[i]?.textAnswer || answers[i]?.transcript ? "You provided a response to this question." : "You attempted this question.",
              weaknesses: "Could benefit from more specific examples and details.",
              tipsForImprovement: "Consider using the STAR method (Situation, Task, Action, Result) for better structure."
            }
          })),
          score: {
            overall: 70,
            communication: 65,
            technical: 75,
            confidence: 70
          },
          recommendations: [
            "Practice common interview questions",
            "Prepare specific examples from your experience",
            "Work on clear and confident communication"
          ]
        };
      }
    }

    // Clean up uploaded files
    if (files && Array.isArray(files)) {
      files.forEach(file => {
        try {
          fs.unlinkSync(file.path);
        } catch (err) {
          console.error("Error deleting file:", err);
        }
      });
    }

    console.log("Sending response with feedback");
    res.json({ 
      feedback, 
      analysis,
      interviewSummary: {
        jobTitle: job?.job_title,
        company: job?.company_name,
        questionsAnswered: answers?.length || 0,
        totalTimeMinutes: Math.round(totalTime / 60),
        completedAt: interviewData.completedAt
      }
    });

  } catch (err) {
    console.error("Error analyzing interview:", err);
    res.status(500).json({ 
      error: "Failed to analyze interview",
      details: err.message 
    });
  }
};