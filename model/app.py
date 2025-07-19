from pydantic import BaseModel
from typing import List
from sentence_transformers import SentenceTransformer, util
from bs4 import BeautifulSoup
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer
import nltk
import re

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import pdfplumber
import requests
import os
import json
import dotenv
dotenv.load_dotenv()
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://zenith-sos.vercel.app",
        "https://6pdzh3cp-8000.inc1.devtunnels.ms",
        "https://sos-cnw9.onrender.com"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Replace these with your actual keys or load from .env
GROQ_API_KEY = os.environ.get("GROQ_API_KEY")
GROQ_MODEL = 'llama3-8b-8192'  # Example model


@app.post("/extract_resume")
async def extract_and_parse_resume(file: UploadFile = File(...)):
    print("Received file:", file.filename)
    if not file.filename.endswith(".pdf"):
        print("File is not a PDF")
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")

    try:
        text = ""
        with pdfplumber.open(file.file) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text() or ""
                print(f"Extracted text from page: {page_text[:100]}...")  # Print first 100 chars
                text += page_text
    except Exception as e:
        print("PDF extraction error:", str(e))
        raise HTTPException(status_code=500, detail=f"Failed to extract PDF: {str(e)}")

    if not text.strip():
        print("No extractable text found in the PDF.")
        raise HTTPException(status_code=400, detail="No extractable text found in the PDF.")

    # Clean the text to avoid JSON parsing issues
    cleaned_text = text.replace('"', '\\"').replace('\n', '\\n').replace('\r', '\\r')
    print("Cleaned text for prompt:", cleaned_text[:300], "...")  # Print first 300 chars

    prompt = f"""
You are a resume parser. Given the plain text of a resume, extract the following fields in JSON format.

IMPORTANT: 
- Return ONLY valid JSON, no commentary or explanations
- Do not use triple quotes anywhere in the JSON
- Escape all quotes and newlines properly
- Make sure all strings are properly quoted

Extract these fields:
- resumeText: full resume text (string)
- softskills: array of soft skills (strings)
- skills: array of technical skills (strings)
- experience: array of objects with company, position, startDate, endDate, description
- education: array of objects with institution, degree, fieldOfStudy, startYear, endYear, grade
- coCurricular: array of co-curricular activities (strings)
- certifications: array of objects with name, issuer, date, credentials
- projects: array of objects with title, description, link
- summary: professional summary (string)
- linkedin: LinkedIn URL (string)
- profileLinks: array of objects with platform, url

Resume text: {cleaned_text}

Return only the JSON object:"""

    try:
        print("Sending request to Groq API...")
        response = requests.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {GROQ_API_KEY}",
                "Content-Type": "application/json"
            },
            json={
                "model": GROQ_MODEL,
                "messages": [
                    {"role": "system", "content": "You are a professional resume parser. Return only valid JSON without any commentary."},
                    {"role": "user", "content": prompt}
                ],
                "temperature": 0.1
            }
        )
        print("Groq API status code:", response.status_code)
        print("Groq API response text:", response.text[:500], "...")  # Print first 500 chars

        if response.status_code != 200:
            print("Groq API error:", response.text)
            raise HTTPException(status_code=500, detail=f"Groq API error: {response.text}")

        result = response.json()
        print("Groq API parsed JSON:", result)
        if "choices" not in result or not result["choices"]:
            print("Groq returned no choices:", result)
            raise HTTPException(status_code=500, detail=f"Groq returned no choices: {result}")

        raw_content = result["choices"][0]["message"]["content"].strip()
        print("Groq raw content:", raw_content[:500], "...")  # Print first 500 chars

        # Find the JSON part (in case there's any preamble)
        json_start = raw_content.find("{")
        json_end = raw_content.rfind("}") + 1
        
        if json_start == -1 or json_end == 0:
            print("No valid JSON found in response")
            raise HTTPException(status_code=500, detail="No valid JSON found in response")
        
        json_str = raw_content[json_start:json_end]
        print("Extracted JSON string:", json_str[:500], "...")  # Print first 500 chars

        # Additional cleaning for common JSON issues
        import re
        json_str = re.sub(r'"""([^"]*?)"""', r'"\1"', json_str)
        json_str = re.sub(r'(?<!\\)"([^"]*?)"(?=\s*[,}])', r'"\1"', json_str)
        
        # Parse the JSON
        try:
            parsed_resume = json.loads(json_str)
        except json.JSONDecodeError as e:
            print("JSONDecodeError:", str(e))
            try:
                json_str = re.sub(r',\s*}', '}', json_str)
                json_str = re.sub(r',\s*]', ']', json_str)
                parsed_resume = json.loads(json_str)
            except json.JSONDecodeError as e2:
                print("Final JSONDecodeError:", str(e2))
                raise HTTPException(
                    status_code=500, 
                    detail=f"Failed to parse JSON: {str(e)}\nRaw JSON:\n{json_str[:500]}..."
                )

        # Validate required fields and set defaults
        required_fields = {
            'resumeText': text,
            'softskills': [],
            'skills': [],
            'experience': [],
            'education': [],
            'coCurricular': [],
            'certifications': [],
            'projects': [],
            'summary': '',
            'linkedin': '',
            'profileLinks': []
        }
        
        for field, default_value in required_fields.items():
            if field not in parsed_resume:
                print(f"Field '{field}' missing, setting default.")
                parsed_resume[field] = default_value

    except HTTPException:
        raise
    except Exception as e:
        print("General exception in resume parsing:", str(e))
        raise HTTPException(status_code=500, detail=f"Failed to parse resume using Groq: {str(e)}")

    print("Returning parsed resume:", parsed_resume)
    return {
        "success": True,
        "parsed_resume": parsed_resume
    }
    
model = SentenceTransformer('all-MiniLM-L6-v2')

nltk.download('punkt')
nltk.download('stopwords')
nltk.download('wordnet')

stop_words = set(stopwords.words('english'))
lemmatizer = WordNetLemmatizer()

class MatchRequest(BaseModel):
    resume: str
    job_descriptions: List[str]

def preprocess(text: str) -> str:
    if not isinstance(text, str):
        return ""
    text = BeautifulSoup(text, "lxml").get_text()
    text = re.sub(r'(http|https|ftp|ssh)://\S+', '', text)
    text = re.sub(r'\S+@\S+', '', text)
    text = re.sub(r'[^a-zA-Z0-9\s\-]', '', text)
    tokens = nltk.word_tokenize(text.lower())
    tokens = [t for t in tokens if t not in stop_words]
    tokens = [lemmatizer.lemmatize(t) for t in tokens]
    return ' '.join(tokens)

def compute_match_score(resume_text: str, jd_text: str) -> float:
    clean_resume = preprocess(resume_text)
    clean_jd = preprocess(jd_text)
    resume_embedding = model.encode(clean_resume, convert_to_tensor=True)
    jd_embedding = model.encode(clean_jd, convert_to_tensor=True)
    similarity_score = util.cos_sim(resume_embedding, jd_embedding).item()
    return round(similarity_score * 100, 2)

@app.post("/match")
async def match_resume_to_jds(request: MatchRequest):
    if not request.resume or not request.job_descriptions:
        raise HTTPException(status_code=400, detail="Missing resume or job_descriptions")
    results = []
    for idx, jd in enumerate(request.job_descriptions):
        score = compute_match_score(request.resume, jd)
        results.append({"job_id": idx + 1, "score": score})
    return {"results": results}

import numpy as np
import tempfile
import os
from typing import Dict, Any

@app.post("/analyze_body_language")
async def analyze_body_language(video: UploadFile = File(...)):
    try:
        # Save uploaded video temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix='.mp4') as tmp_file:
            content = await video.read()
            tmp_file.write(content)
            video_path = tmp_file.name

        # Analyze video (simplified without cv2)
        analysis_results = process_video_simple(video_path)
        
        # Clean up
        os.unlink(video_path)
        
        return {"success": True, "analysis": analysis_results}
    
    except Exception as e:
        return {"success": False, "error": str(e)}

def process_video_simple(video_path: str) -> Dict[str, Any]:
    """
    Simplified video analysis without cv2 dependency.
    Returns mock analysis data for now - can be enhanced with other libraries.
    """
    # Mock analysis results (replace with actual analysis when you add proper libraries)
    import random
    
    # Generate realistic mock scores
    posture_score = random.randint(60, 95)
    eye_contact_score = random.randint(65, 90)
    
    gesture_options = ["calm", "expressive", "fidgeting", "professional"]
    dominant_gesture = random.choice(gesture_options)
    
    gesture_counts = {
        "pointing": random.randint(0, 5),
        "open_palm": random.randint(2, 8),
        "fidgeting": random.randint(0, 3),
        "calm": random.randint(5, 15)
    }
    
    confidence = calculate_confidence(posture_score, eye_contact_score, gesture_counts)
    recommendations = generate_recommendations(posture_score, eye_contact_score, dominant_gesture)
    
    return {
        "posture_score": round(posture_score, 2),
        "eye_contact_score": round(eye_contact_score, 2),
        "dominant_gesture": dominant_gesture,
        "gesture_analysis": gesture_counts,
        "confidence": confidence,
        "recommendations": recommendations
    }

def calculate_confidence(posture: float, eye_contact: float, gestures: Dict[str, int]) -> float:
    base_confidence = (posture + eye_contact) / 2
    
    # Adjust based on gestures
    if gestures.get("fidgeting", 0) > gestures.get("calm", 0):
        base_confidence -= 10
    
    return max(0, min(100, base_confidence))

def generate_recommendations(posture: float, eye_contact: float, gesture: str) -> List[str]:
    recommendations = []
    
    if posture < 70:
        recommendations.append("Improve your posture by sitting up straight")
    if eye_contact < 60:
        recommendations.append("Try to look more directly at the camera")
    if gesture == "fidgeting":
        recommendations.append("Keep your hands calmer and more controlled")
    
    # Add some general recommendations
    if len(recommendations) == 0:
        recommendations.append("Great job! Keep maintaining your professional presence")
    
    return recommendations

# Health check endpoint
@app.get("/")
async def root():
    return {"message": "RAIT AI Interview Prep API is running!", "status": "healthy"}

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "services": {
            "resume_parser": "active",
            "job_matcher": "active", 
            "body_language_analyzer": "active (simplified)"
        }
    }
    
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)