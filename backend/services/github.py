import os
import base64
import logging
from typing import Dict, List, Any, Optional
import httpx

logger = logging.getLogger(__name__)

GITHUB_API_URL = "https://api.github.com"

class GitHubService:
    def __init__(self, token: Optional[str] = None):
        self.token = token or os.getenv("GITHUB_TOKEN")
        self.headers = {
            "Accept": "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28",
        }
        if self.token:
            self.headers["Authorization"] = f"Bearer {self.token}"
        else:
            logger.warning("No GITHUB_TOKEN configured. API rate limit will be limited to 60 requests/hour.")

    async def get_user_profile(self, client: httpx.AsyncClient, username: str) -> Dict[str, Any]:
        """Fetch general public information about a GitHub user."""
        url = f"{GITHUB_API_URL}/users/{username}"
        response = await client.get(url, headers=self.headers)
        if response.status_code == 404:
            raise ValueError(f"GitHub user '{username}' not found.")
        response.raise_for_status()
        return response.json()

    async def get_user_repos(self, client: httpx.AsyncClient, username: str) -> List[Dict[str, Any]]:
        """Fetch public repositories for a user."""
        url = f"{GITHUB_API_URL}/users/{username}/repos"
        # Fetch up to 100 repositories, sorted by stars to prioritize high-quality projects
        params = {
            "per_page": 100,
            "sort": "stars",
            "direction": "desc"
        }
        response = await client.get(url, headers=self.headers, params=params)
        if response.status_code == 404:
            return []
        response.raise_for_status()
        return response.json()

    async def get_readme(self, client: httpx.AsyncClient, owner: str, repo: str) -> Optional[str]:
        """Fetch the contents of the README file of a repository."""
        url = f"{GITHUB_API_URL}/repos/{owner}/{repo}/readme"
        try:
            response = await client.get(url, headers=self.headers)
            if response.status_code == 404:
                return None
            response.raise_for_status()
            data = response.json()
            content_encoded = data.get("content", "")
            if content_encoded and data.get("encoding") == "base64":
                # Remove newlines and decode
                content_bytes = base64.b64decode(content_encoded.replace("\n", ""))
                return content_bytes.decode("utf-8", errors="ignore")
            return None
        except Exception as e:
            logger.error(f"Error fetching README for {owner}/{repo}: {e}")
            return None

    async def get_full_profile_data(self, username: str) -> Dict[str, Any]:
        """
        Aggregate all relevant GitHub data for the user.
        Includes profile details, profile README, repository list,
        and READMEs of the top repositories.
        """
        async with httpx.AsyncClient(timeout=15.0) as client:
            # 1. Fetch user profile
            profile = await self.get_user_profile(client, username)
            
            # 2. Fetch all public repos
            repos = await self.get_user_repos(client, username)
            
            # 3. Try to fetch profile README (repo named username/username)
            profile_readme = await self.get_readme(client, username, username)
            
            # Filter repos: prioritize own non-fork repos first, then forks
            own_repos = [r for r in repos if not r.get("fork")]
            fork_repos = [r for r in repos if r.get("fork")]
            
            # Sort own repos by stars and size to identify top projects
            own_repos_sorted = sorted(
                own_repos, 
                key=lambda x: (x.get("stargazers_count", 0), x.get("forks_count", 0)), 
                reverse=True
            )
            
            # 4. Fetch READMEs for top 5 owned repositories to get project details
            top_repos_with_readme = []
            for i, repo in enumerate(own_repos_sorted[:5]):
                repo_name = repo.get("name")
                readme = await self.get_readme(client, username, repo_name)
                
                # Strip extremely long readmes to avoid bloating the prompt
                if readme and len(readme) > 10000:
                    readme = readme[:10000] + "\n... [truncated]"
                
                repo_data = {
                    "name": repo_name,
                    "description": repo.get("description"),
                    "language": repo.get("language"),
                    "languages_url": repo.get("languages_url"), # can fetch languages if needed
                    "stargazers_count": repo.get("stargazers_count", 0),
                    "forks_count": repo.get("forks_count", 0),
                    "html_url": repo.get("html_url"),
                    "topics": repo.get("topics", []),
                    "readme": readme
                }
                top_repos_with_readme.append(repo_data)
                
            # Prepare smaller summary for the rest of own repos
            other_repos = []
            for repo in own_repos_sorted[5:15]:
                other_repos.append({
                    "name": repo.get("name"),
                    "description": repo.get("description"),
                    "language": repo.get("language"),
                    "stargazers_count": repo.get("stargazers_count", 0),
                    "forks_count": repo.get("forks_count", 0),
                    "html_url": repo.get("html_url"),
                    "topics": repo.get("topics", [])
                })

            # Fetch top fork repos (contributions)
            contributions = []
            fork_repos_sorted = sorted(
                fork_repos, 
                key=lambda x: (x.get("stargazers_count", 0), x.get("forks_count", 0)), 
                reverse=True
            )
            for repo in fork_repos_sorted[:5]:
                contributions.append({
                    "name": repo.get("name"),
                    "description": repo.get("description"),
                    "language": repo.get("language"),
                    "stargazers_count": repo.get("stargazers_count", 0),
                    "html_url": repo.get("html_url")
                })
            
            return {
                "profile": {
                    "login": profile.get("login"),
                    "name": profile.get("name"),
                    "company": profile.get("company"),
                    "blog": profile.get("blog"),
                    "location": profile.get("location"),
                    "email": profile.get("email"),
                    "bio": profile.get("bio"),
                    "public_repos": profile.get("public_repos"),
                    "followers": profile.get("followers"),
                    "html_url": profile.get("html_url"),
                },
                "profile_readme": profile_readme,
                "top_repositories": top_repos_with_readme,
                "other_repositories": other_repos,
                "forked_repositories": contributions
            }
