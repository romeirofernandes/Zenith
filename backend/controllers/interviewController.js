const fetch = require('node-fetch');
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
    console.log("Received interview submission:", req.body);
  try {
    const { answers } = JSON.parse(req.body.data);
    const files = req.files;

    // --- MOCKED ANALYSIS ---
    const analysis = { mock: true, message: "Python microservice not running" };
    // -----------------------

    // Compose feedback prompt for Groq
    const feedbackPrompt = `
      You are an expert interviewer. Here are the candidate's answers and analytics (stutter, tone, expression, etc). Give a detailed but concise review, mentioning strengths, weaknesses, and tips for improvement.
      Answers: ${JSON.stringify(answers)}
      Analytics: ${JSON.stringify(analysis)}
      Return as a JSON object: { overallFeedback, perQuestion: [{question, feedback}] }
    `;
    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [
          { role: "system", content: "You are an expert HR interviewer." },
          { role: "user", content: feedbackPrompt }
        ]
      })
    });
    const groqData = await groqRes.json();
    console.log("Groq response:", groqData);

    let feedback;
    try {
      feedback = JSON.parse(groqData.choices[0].message.content);
    } catch (e) {
      // Try to extract JSON object from the response string
      const match = groqData.choices[0].message.content.match(/\{[\s\S]*\}/);
      if (match) {
        try {
          feedback = JSON.parse(match[0]);
        } catch (err) {
          feedback = null;
        }
      }
    }
    console.log("Parsed feedback:", feedback);

    // Clean up uploaded files
    if (files && Array.isArray(files)) {
      files.forEach(file => fs.unlinkSync(file.path));
    }

    if (!feedback) {
      return res.status(500).json({ error: "Failed to parse feedback from model response." });
    }

    res.json({ feedback, analysis });
  } catch (err) {
    console.error("Error analyzing interview:", err);
    res.status(500).json({ error: "Failed to analyze interview" });
  }
};