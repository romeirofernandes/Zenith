# 🚨 Team SOS

## 👤 Team Members

- **Team Leader:** Liza Glanisha Castelino  
- **Team Members:**
  - Romeiro Fernandes  
  - Aliqyaan Mahimwala  
  - Gavin Soares

---

# Zenith: AI-Powered Career Platform

Zenith is a next-generation platform designed to help students and job seekers land their dream roles through AI-driven upskilling, personalized job matching, and real-world project-based learning.

## Features

- **Smart Resume Parsing:** Upload your resume and let our LLM-powered parser extract your skills, experience, and strengths.
- **Personalized Job Recommendations:** Get job listings tailored to your profile, with instant apply and wishlist features.
- **AI Interview Practice:** Practice interviews with real-time feedback on your answers, body language, and voice.
- **Skill Map & Roadmap:** Visualize your strengths and weaknesses, and get a personalized upskilling roadmap.
- **Project Recommendations:** Receive project ideas and resources based on your target job role, with GitHub and YouTube integration.
- **Proctored Tests:** Take AI-proctored quizzes to assess and improve your knowledge in key areas.
- **Cold Email Generator:** Generate effective cold emails and outreach strategies for networking and job hunting.
- **Achievements & Analytics:** Track your progress, unlock achievements, and analyze your job readiness.

## Tech Stack

- **Frontend:** React, Vite, Tailwind CSS, shadcn/ui, Framer Motion
- **Backend:** Node.js, Express, MongoDB, Firebase
- **AI/ML:** FastAPI, Python, LLMs (Groq, Gemini, OpenAI)
- **Dev Tools:** Vercel, Render, GitHub, Gitdiagram

## Getting Started

1. **Clone the repository**
   ```sh
   git clone https://github.com/your-org/zenith.git
   cd zenith
   ```

2. **Install dependencies**
   - For frontend:
     ```sh
     cd frontend
     npm install
     ```
   - For backend:
     ```sh
     cd ../backend
     npm install
     ```
   - For model (AI API):
     ```sh
     cd ../model
     pip install -r requirements.txt
     ```

3. **Set up environment variables**
   - Copy `.env.example` to `.env` in each folder and fill in the required keys.

4. **Run the app**
   - Start backend: `npm start`
   - Start frontend: `npm run dev`
   - Start model API: `uvicorn app:app --reload`

## Folder Structure

```
SOS/
├── backend/    # Node.js API, MongoDB, Firebase
├── frontend/   # React app, shadcn/ui, Tailwind
├── model/      # FastAPI, Python, LLM integrations
```

## Demo

- [Live Demo](https://zenith-sos.vercel.app)
