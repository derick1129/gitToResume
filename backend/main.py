import os
import logging
from io import BytesIO
from fastapi import FastAPI, HTTPException, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, HttpUrl
from typing import List, Optional, Dict, Any
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

from services.github import GitHubService
from services.ai import AIService
from services.pdf import PDFService

app = FastAPI(title="GitToResume API", version="1.0.0")

# Enable CORS for React dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify front-end domains
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
github_service = GitHubService()
ai_service = AIService()
pdf_service = PDFService()

# Request Models
class GenerateRequest(BaseModel):
    username: str

# Resume Schema Models for validation
class ProjectModel(BaseModel):
    name: str
    description: str
    technologies: List[str]
    url: Optional[str] = None
    stars: Optional[int] = 0
    forks: Optional[int] = 0

class ContributionModel(BaseModel):
    repoName: str
    repoUrl: str
    description: str
    stars: Optional[int] = 0

class ExperienceModel(BaseModel):
    company: str
    position: str
    startDate: str
    endDate: str
    description: List[str]

class EducationModel(BaseModel):
    institution: str
    degree: str
    fieldOfStudy: Optional[str] = None
    startDate: Optional[str] = None
    endDate: Optional[str] = None

class CertificationModel(BaseModel):
    name: str
    issuer: str
    date: Optional[str] = None
    url: Optional[str] = None

class ResumeModel(BaseModel):
    name: str
    headline: str
    summary: str
    email: Optional[str] = ""
    phone: Optional[str] = ""
    website: Optional[str] = ""
    githubUrl: str
    skills: List[str]
    projects: List[ProjectModel]
    contributions: List[ContributionModel]
    experience: List[ExperienceModel]
    education: List[EducationModel]
    certifications: List[CertificationModel]

@app.get("/")
async def health_check():
    return {
        "status": "healthy",
        "message": "GitToResume Backend API is running.",
        "gemini_configured": bool(os.getenv("GEMINI_API_KEY")),
        "github_token_configured": bool(os.getenv("GITHUB_TOKEN"))
    }

@app.post("/api/resume/generate", response_model=ResumeModel)
async def generate_resume(request: GenerateRequest):
    username = request.username.strip()
    if not username:
        raise HTTPException(status_code=400, detail="Username cannot be empty.")
    
    logger.info(f"Generating resume for GitHub user: {username}")
    try:
        # 1. Fetch public profile and repository data from GitHub
        github_data = await github_service.get_full_profile_data(username)
        
        # 2. Use Gemini 2.5 Flash to generate the structured resume JSON
        resume_data = await ai_service.generate_resume_from_github(github_data)
        
        return resume_data
        
    except ValueError as ve:
        logger.error(f"Value error generating resume: {ve}")
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        logger.exception("Unexpected error generating resume")
        raise HTTPException(status_code=500, detail=f"Failed to generate resume: {str(e)}")

@app.post("/api/resume/export")
async def export_resume_pdf(resume: ResumeModel):
    logger.info(f"Exporting PDF for {resume.name}")
    try:
        # Convert resume model to dictionary for WeasyPrint
        resume_dict = resume.model_dump()
        
        # Generate the PDF bytes using WeasyPrint
        pdf_bytes = pdf_service.generate_pdf(resume_dict)
        
        # Return StreamingResponse with PDF headers
        headers = {
            "Content-Disposition": f'attachment; filename="resume_{resume.name.lower().replace(" ", "_")}.pdf"'
        }
        return StreamingResponse(
            BytesIO(pdf_bytes),
            media_type="application/pdf",
            headers=headers
        )
        
    except Exception as e:
        logger.exception("Error exporting PDF")
        raise HTTPException(status_code=500, detail=f"Failed to generate PDF: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    # Run server locally
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
