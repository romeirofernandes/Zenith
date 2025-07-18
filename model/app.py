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

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from fastapi import FastAPI, UploadFile, File, HTTPException
import pdfplumber
import requests
import os
import json

app = FastAPI()

# Replace these with your actual keys or load from .env
GROQ_API_KEY = "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"
GROQ_MODEL = 'llama3-8b-8192'  # Example model


@app.post("/extract_resume")
async def extract_and_parse_resume(file: UploadFile = File(...)):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")

    try:
        text = ""
        with pdfplumber.open(file.file) as pdf:
            for page in pdf.pages:
                text += page.extract_text() or ""
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to extract PDF: {str(e)}")

    if not text.strip():
        raise HTTPException(status_code=400, detail="No extractable text found in the PDF.")

    # Clean the text to avoid JSON parsing issues
    cleaned_text = text.replace('"', '\\"').replace('\n', '\\n').replace('\r', '\\r')

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
                "temperature": 0.1  # Lower temperature for more consistent output
            }
        )

        if response.status_code != 200:
            raise HTTPException(status_code=500, detail=f"Groq API error: {response.text}")

        result = response.json()
        if "choices" not in result or not result["choices"]:
            raise HTTPException(status_code=500, detail=f"Groq returned no choices: {result}")

        raw_content = result["choices"][0]["message"]["content"].strip()

        # Find the JSON part (in case there's any preamble)
        json_start = raw_content.find("{")
        json_end = raw_content.rfind("}") + 1
        
        if json_start == -1 or json_end == 0:
            raise HTTPException(status_code=500, detail="No valid JSON found in response")
        
        json_str = raw_content[json_start:json_end]

        # Additional cleaning for common JSON issues
        json_str = re.sub(r'"""([^"]*?)"""', r'"\1"', json_str)  # Replace triple quotes with single quotes
        json_str = re.sub(r'(?<!\\)"([^"]*?)"(?=\s*[,}])', r'"\1"', json_str)  # Fix unescaped quotes
        
        # Parse the JSON
        try:
            parsed_resume = json.loads(json_str)
        except json.JSONDecodeError as e:
            # If JSON parsing fails, try to fix common issues
            try:
                # Remove any trailing commas
                json_str = re.sub(r',\s*}', '}', json_str)
                json_str = re.sub(r',\s*]', ']', json_str)
                parsed_resume = json.loads(json_str)
            except json.JSONDecodeError:
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
                parsed_resume[field] = default_value

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to parse resume using Groq: {str(e)}")

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