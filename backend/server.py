from fastapi import FastAPI, APIRouter, HTTPException, Query
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone
import httpx
from github import Github
import hashlib
import json

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Models
class GitHubConfig(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    access_token: Optional[str] = None
    pat_token: Optional[str] = None
    repos: List[str] = []
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class GitHubConfigCreate(BaseModel):
    user_id: str
    access_token: Optional[str] = None
    pat_token: Optional[str] = None

class WorkflowRun(BaseModel):
    id: int
    name: str
    status: str
    conclusion: Optional[str]
    run_number: int
    created_at: str
    updated_at: str
    duration: Optional[str]
    branch: str
    sha: str
    html_url: str

class PullRequest(BaseModel):
    id: int
    number: int
    title: str
    state: str
    merged: bool
    user: str
    created_at: str
    updated_at: str
    html_url: str

class Commit(BaseModel):
    sha: str
    message: str
    author: str
    date: str
    html_url: str

class BadgeInfo(BaseModel):
    ci_badge: str
    codecov_badge: str
    coveralls_badge: str
    shields_badges: List[str]

# Helper Functions
def get_github_client(token: str) -> Github:
    return Github(token)

async def fetch_workflow_runs(owner: str, repo: str, token: str) -> List[WorkflowRun]:
    """Fetch recent workflow runs from GitHub"""
    try:
        g = get_github_client(token)
        repository = g.get_repo(f"{owner}/{repo}")
        runs = repository.get_workflow_runs()[:20]
        
        result = []
        for run in runs:
            duration = None
            if run.updated_at and run.created_at:
                delta = run.updated_at - run.created_at
                minutes = int(delta.total_seconds() / 60)
                seconds = int(delta.total_seconds() % 60)
                duration = f"{minutes}m {seconds}s" if minutes > 0 else f"{seconds}s"
            
            result.append(WorkflowRun(
                id=run.id,
                name=run.name,
                status=run.status,
                conclusion=run.conclusion or "in_progress",
                run_number=run.run_number,
                created_at=run.created_at.isoformat() if run.created_at else "",
                updated_at=run.updated_at.isoformat() if run.updated_at else "",
                duration=duration,
                branch=run.head_branch or "main",
                sha=run.head_sha[:7] if run.head_sha else "",
                html_url=run.html_url
            ))
        return result
    except Exception as e:
        logging.error(f"Error fetching workflow runs: {str(e)}")
        return []

async def fetch_pull_requests(owner: str, repo: str, token: str, state: str = "all") -> List[PullRequest]:
    """Fetch pull requests from GitHub"""
    try:
        g = get_github_client(token)
        repository = g.get_repo(f"{owner}/{repo}")
        prs = repository.get_pulls(state=state)[:20]
        
        result = []
        for pr in prs:
            result.append(PullRequest(
                id=pr.id,
                number=pr.number,
                title=pr.title,
                state=pr.state,
                merged=pr.merged,
                user=pr.user.login if pr.user else "Unknown",
                created_at=pr.created_at.isoformat() if pr.created_at else "",
                updated_at=pr.updated_at.isoformat() if pr.updated_at else "",
                html_url=pr.html_url
            ))
        return result
    except Exception as e:
        logging.error(f"Error fetching pull requests: {str(e)}")
        return []

async def fetch_commits(owner: str, repo: str, token: str) -> List[Commit]:
    """Fetch recent commits from GitHub"""
    try:
        g = get_github_client(token)
        repository = g.get_repo(f"{owner}/{repo}")
        commits = repository.get_commits()[:15]
        
        result = []
        for commit in commits:
            result.append(Commit(
                sha=commit.sha,
                message=commit.commit.message.split('\n')[0][:100],
                author=commit.commit.author.name if commit.commit.author else "Unknown",
                date=commit.commit.author.date.isoformat() if commit.commit.author and commit.commit.author.date else "",
                html_url=commit.html_url
            ))
        return result
    except Exception as e:
        logging.error(f"Error fetching commits: {str(e)}")
        return []

# API Routes
@api_router.get("/")
async def root():
    return {"message": "CIVWATCH API - CI Watchdog Dashboard"}

@api_router.post("/github/config")
async def save_github_config(config: GitHubConfigCreate):
    """Save GitHub configuration"""
    doc = config.model_dump()
    config_obj = GitHubConfig(**doc)
    doc = config_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    
    # Hash tokens before storing
    if doc.get('access_token'):
        doc['access_token'] = hashlib.sha256(doc['access_token'].encode()).hexdigest()
    if doc.get('pat_token'):
        doc['pat_token'] = hashlib.sha256(doc['pat_token'].encode()).hexdigest()
    
    await db.github_configs.insert_one(doc)
    return {"status": "success", "id": config_obj.id}

@api_router.get("/repos/{owner}/{repo}/workflows")
async def get_workflow_runs(owner: str, repo: str, token: str = Query(...)):
    """Get workflow runs for a repository"""
    runs = await fetch_workflow_runs(owner, repo, token)
    return {"runs": [run.model_dump() for run in runs]}

@api_router.get("/repos/{owner}/{repo}/pulls")
async def get_pull_requests(owner: str, repo: str, token: str = Query(...), state: str = "all"):
    """Get pull requests for a repository"""
    prs = await fetch_pull_requests(owner, repo, token, state)
    return {"pulls": [pr.model_dump() for pr in prs]}

@api_router.get("/repos/{owner}/{repo}/commits")
async def get_commits(owner: str, repo: str, token: str = Query(...)):
    """Get recent commits for a repository"""
    commits = await fetch_commits(owner, repo, token)
    return {"commits": [commit.model_dump() for commit in commits]}

@api_router.get("/repos/{owner}/{repo}/badges")
async def get_badges(owner: str, repo: str):
    """Generate badge URLs for a repository"""
    badges = BadgeInfo(
        ci_badge=f"https://img.shields.io/github/actions/workflow/status/{owner}/{repo}/ci.yml?label=CI",
        codecov_badge=f"https://codecov.io/github/{owner}/{repo}/coverage.svg?branch=main",
        coveralls_badge=f"https://coveralls.io/repos/github/{owner}/{repo}/badge.svg?branch=main",
        shields_badges=[
            f"https://img.shields.io/github/last-commit/{owner}/{repo}",
            f"https://img.shields.io/github/issues/{owner}/{repo}",
            f"https://img.shields.io/github/stars/{owner}/{repo}"
        ]
    )
    return badges.model_dump()

@api_router.get("/repos/{owner}/{repo}/stats")
async def get_repo_stats(owner: str, repo: str, token: str = Query(...)):
    """Get repository statistics"""
    try:
        runs = await fetch_workflow_runs(owner, repo, token)
        
        total_runs = len(runs)
        passed = sum(1 for r in runs if r.conclusion == "success")
        failed = sum(1 for r in runs if r.conclusion == "failure")
        running = sum(1 for r in runs if r.status == "in_progress")
        
        pass_rate = int((passed / total_runs * 100)) if total_runs > 0 else 0
        
        return {
            "total_runs": total_runs,
            "passed": passed,
            "failed": failed,
            "running": running,
            "pass_rate": pass_rate
        }
    except Exception as e:
        logging.error(f"Error fetching stats: {str(e)}")
        return {
            "total_runs": 0,
            "passed": 0,
            "failed": 0,
            "running": 0,
            "pass_rate": 0
        }

@api_router.get("/repos/{owner}/{repo}/logs/{run_id}")
async def get_workflow_logs(owner: str, repo: str, run_id: int, token: str = Query(...)):
    """Get workflow run logs"""
    try:
        g = get_github_client(token)
        repository = g.get_repo(f"{owner}/{repo}")
        run = repository.get_workflow_run(run_id)
        jobs = run.jobs()
        
        logs = []
        for job in jobs:
            logs.append({
                "step": job.name,
                "status": job.conclusion or job.status,
                "output": f"Job: {job.name}\nStatus: {job.conclusion or job.status}\nStarted: {job.started_at}\nCompleted: {job.completed_at or 'Running'}"
            })
        
        return {"logs": logs}
    except Exception as e:
        logging.error(f"Error fetching logs: {str(e)}")
        return {"logs": []}

@api_router.post("/webhook/github")
async def github_webhook(payload: Dict[Any, Any]):
    """Receive GitHub webhooks for real-time updates"""
    event_type = payload.get("action")
    logging.info(f"Received GitHub webhook: {event_type}")
    
    # Store webhook event
    doc = {
        "id": str(uuid.uuid4()),
        "event_type": event_type,
        "payload": json.dumps(payload),
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
    await db.webhook_events.insert_one(doc)
    
    return {"status": "received"}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()