# main.py
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List
from sentence_transformers import SentenceTransformer, util
from bs4 import BeautifulSoup
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer
import nltk
import re

app = FastAPI()

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
