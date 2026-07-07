import os
import json
import logging
from typing import Dict, Any, Optional
import httpx

logger = logging.getLogger(__name__)

class AIService:
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("GEMINI_API_KEY")
        if not self.api_key:
            logger.warning("No GEMINI_API_KEY configured. AI resume generation will fail unless set in environment.")

    async def generate_resume_from_github(self, github_data: Dict[str, Any]) -> Dict[str, Any]:
        """Use Gemini 2.5 Flash to analyze GitHub data and generate structured resume JSON."""
        if not self.api_key:
            raise ValueError("GEMINI_API_KEY is not configured in the backend environment.")

        # Construct the URL for Gemini API
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={self.api_key}"

        # Clean up data slightly to make it compact for the prompt
        profile = github_data.get("profile", {})
        top_repos = github_data.get("top_repositories", [])
        other_repos = github_data.get("other_repositories", [])
        forked_repos = github_data.get("forked_repositories", [])
        profile_readme = github_data.get("profile_readme", "")

        # Structure the payload
        prompt = f"""
You are an expert technical resume writer. Your task is to transform a developer's GitHub profile data into a highly professional, ATS-friendly, clean software engineering resume JSON.

Follow these strict rules:
1. TRUTHFULNESS & ACCURACY:
   - Only use information that exists publicly in the provided data.
   - NEVER fabricate work experience (companies, positions, dates), education (degrees, universities), or certifications.
   - If no work experience is mentioned or can be verified in the profile or READMEs, leave the "experience" array empty. Do NOT invent a job.
   - If no education is mentioned, leave the "education" array empty. Do NOT invent a degree.
   - If contact details (email, phone, blog) are missing, leave them as empty strings. Do not invent fake emails.
   - The developer's name should be taken from their profile name. If the profile name is empty or is a username, use the username (login) formatted cleanly.

2. RESUME SECTIONS:
   - name: Full name of the developer.
   - headline: A short professional summary line (e.g., "Full-Stack Software Engineer specializing in React and Python").
   - summary: A cohesive, 2-3 sentence summary of their technical background, key strengths, and project focus areas based on their repositories and profile bio.
   - email: Public email (leave empty string if not found).
   - phone: Public phone number (leave empty string if not found).
   - website: Public portfolio or blog URL (from profile.blog or profile.website).
   - githubUrl: The user's GitHub profile URL.
   - skills: An array of core technical skills, frameworks, and programming languages that are clearly used in their repositories (e.g. ["JavaScript", "TypeScript", "React", "Node.js", "Python", "FastAPI", "PostgreSQL", "Docker"]). Sort them logically.
   - projects: Top 3-5 featured projects based on the owned repositories. For each project:
     - name: Name of the repository.
     - description: A clear, professional summary bullet point of the project's purpose and key features. Format it as a cohesive, impact-focused description.
     - technologies: The programming languages, frameworks, or databases used in this project (e.g. ["React", "TailwindCSS", "Vite"]).
     - url: The GitHub URL of the repository.
     - stars: Stargazers count.
     - forks: Forks count.
   - contributions: Open source contributions or noteworthy forks they have in their list.
     - repoName: Name of the repository.
     - repoUrl: URL of the repository.
     - description: Describe the context of the fork/contribution if possible, or explain its significance (e.g. "Forked and explored configuration files/examples").
     - stars: Stargazers count of the repository.
   - experience: Array of work experience objects (leave empty if not found in data):
     - company: Name of the company.
     - position: Job title.
     - startDate: Start date (e.g., "June 2023").
     - endDate: End date or "Present".
     - description: Array of action-verb bullet points summarizing contributions.
   - education: Array of education objects (leave empty if not found in data):
     - institution: School or University name.
     - degree: Degree obtained (e.g., "B.S. in Computer Science").
     - fieldOfStudy: Field of study (optional).
     - startDate: Start date.
     - endDate: Graduation date.
   - certifications: Array of certification objects (leave empty if not found in data):
     - name: Name of the certification.
     - issuer: Issuer of the certification.
     - date: Date obtained.
     - url: URL to verification.

Here is the GitHub profile data:
---
USER PROFILE:
- Login/Username: {profile.get("login")}
- Name: {profile.get("name")}
- Company: {profile.get("company")}
- Bio: {profile.get("bio")}
- Location: {profile.get("location")}
- Email: {profile.get("email")}
- Blog/Website: {profile.get("blog")}
- Followers: {profile.get("followers")}
- GitHub URL: {profile.get("html_url")}

PROFILE README (often contains bio, contact details, experiences, and social links):
\"\"\"
{profile_readme or 'No profile README available.'}
\"\"\"

TOP REPOSITORIES (with README contents):
{json.dumps(top_repos, indent=2)}

OTHER REPOSITORIES (list of secondary repositories):
{json.dumps(other_repos, indent=2)}

FORKED REPOSITORIES (potential open source contributions):
{json.dumps(forked_repos, indent=2)}
---
"""

        schema = {
            "type": "OBJECT",
            "properties": {
                "name": {"type": "STRING"},
                "headline": {"type": "STRING"},
                "summary": {"type": "STRING"},
                "email": {"type": "STRING"},
                "phone": {"type": "STRING"},
                "website": {"type": "STRING"},
                "githubUrl": {"type": "STRING"},
                "skills": {
                    "type": "ARRAY",
                    "items": {"type": "STRING"}
                },
                "projects": {
                    "type": "ARRAY",
                    "items": {
                        "type": "OBJECT",
                        "properties": {
                            "name": {"type": "STRING"},
                            "description": {"type": "STRING"},
                            "technologies": {
                                "type": "ARRAY",
                                "items": {"type": "STRING"}
                            },
                            "url": {"type": "STRING"},
                            "stars": {"type": "INTEGER"},
                            "forks": {"type": "INTEGER"}
                        },
                        "required": ["name", "description", "technologies", "url"]
                    }
                },
                "contributions": {
                    "type": "ARRAY",
                    "items": {
                        "type": "OBJECT",
                        "properties": {
                            "repoName": {"type": "STRING"},
                            "repoUrl": {"type": "STRING"},
                            "description": {"type": "STRING"},
                            "stars": {"type": "INTEGER"}
                        },
                        "required": ["repoName", "repoUrl", "description"]
                    }
                },
                "experience": {
                    "type": "ARRAY",
                    "items": {
                        "type": "OBJECT",
                        "properties": {
                            "company": {"type": "STRING"},
                            "position": {"type": "STRING"},
                            "startDate": {"type": "STRING"},
                            "endDate": {"type": "STRING"},
                            "description": {
                                "type": "ARRAY",
                                "items": {"type": "STRING"}
                            }
                        },
                        "required": ["company", "position", "startDate", "endDate", "description"]
                    }
                },
                "education": {
                    "type": "ARRAY",
                    "items": {
                        "type": "OBJECT",
                        "properties": {
                            "institution": {"type": "STRING"},
                            "degree": {"type": "STRING"},
                            "fieldOfStudy": {"type": "STRING"},
                            "startDate": {"type": "STRING"},
                            "endDate": {"type": "STRING"}
                        },
                        "required": ["institution", "degree"]
                    }
                },
                "certifications": {
                    "type": "ARRAY",
                    "items": {
                        "type": "OBJECT",
                        "properties": {
                            "name": {"type": "STRING"},
                            "issuer": {"type": "STRING"},
                            "date": {"type": "STRING"},
                            "url": {"type": "STRING"}
                        },
                        "required": ["name", "issuer"]
                    }
                }
            },
            "required": ["name", "headline", "summary", "githubUrl", "skills", "projects", "contributions", "experience", "education", "certifications"]
        }

        payload = {
            "contents": [
                {
                    "parts": [
                        {
                            "text": prompt
                        }
                    ]
                }
            ],
            "generationConfig": {
                "responseMimeType": "application/json",
                "responseSchema": schema
            }
        }

        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(url, json=payload, headers={"Content-Type": "application/json"})
            if response.status_code != 200:
                logger.error(f"Gemini API returned error {response.status_code}: {response.text}")
                raise ValueError(f"Gemini API error: {response.text}")
            
            data = response.json()
            try:
                candidate = data["candidates"][0]
                text_content = candidate["content"]["parts"][0]["text"]
                return json.loads(text_content)
            except (KeyError, IndexError, json.JSONDecodeError) as e:
                logger.error(f"Failed to parse Gemini response: {e}. Raw response: {data}")
                raise ValueError(f"Failed to parse AI response: {e}")
