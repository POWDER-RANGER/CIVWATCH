# CIVWATCH - CI Watchdog Dashboard

A comprehensive dashboard to visualize GitHub repository CI/CD pipeline status, PR/commit activity, and real-time badge integration.

## Features

### 🔍 CI Pipeline Visualization
- **Live badge/status updates** - Real-time display of build status, code coverage, and deploy status
- **Workflow runs history** - Complete timeline of recent workflow executions with pass/fail timestamps
- **Detailed logs viewer** - Expandable accordion view for detailed error logs and job outputs
- **Success rate tracking** - Visual progress indicators showing pipeline health metrics

### 📊 Pull Request & Commit Activity
- **PR dashboard** - List of open and merged PRs with status indicators
- **Commits timeline** - Chronological feed of recent commits with author and message
- **Activity tracking** - Monitor code review and merge activity across your repository
- **Quick links** - Direct links to GitHub for detailed PR reviews and diffs

### 🎯 Badge Integrations
- **Shields.io** - Custom status badges for various metrics
- **GitHub Actions** - Native workflow status badges
- **Codecov** - Test coverage visualization
- **Coveralls** - Alternative coverage tracking integration
- **One-click copy** - Copy badge markdown directly to clipboard

### 🎨 User Experience
- **Dark/Light theme toggle** - Seamless theme switching with persistence
- **Responsive design** - Optimized for desktop, tablet, and mobile devices
- **Bento grid layout** - Modern, modular card-based interface
- **Real-time updates** - Automatic refresh with manual trigger option
- **Smooth animations** - Professional entrance animations with framer-motion

### 🚀 Export & Deployment
- **README snippet export** - Auto-generated markdown with badges for README.md
- **GitHub Pages workflow** - One-click copy of deployment YAML
- **Customizable exports** - Select specific badges and metrics to include

## Tech Stack

### Frontend
- **React 19** - Latest React with modern hooks
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - High-quality component library
- **Recharts** - Data visualization and charts
- **Framer Motion** - Smooth animations
- **Lucide React** - Modern icon library
- **Sonner** - Toast notifications

### Backend
- **FastAPI** - High-performance Python web framework
- **PyGithub** - GitHub API integration
- **Motor** - Async MongoDB driver
- **MongoDB** - Database for caching and webhooks

## Getting Started

### Prerequisites
- Node.js 18+ and Yarn
- Python 3.11+
- MongoDB
- GitHub Personal Access Token

### Usage

1. **Authentication**
   - Enter your GitHub Personal Access Token (PAT)
   - Token requires `repo` scope for full functionality
   - Create token at: https://github.com/settings/tokens

2. **Add Repositories**
   - Click "Add Repository"
   - Enter owner and repository name (e.g., `POWDER-RANGER/CIVWATCH`)
   - Repository will be added to your dashboard list

3. **View Dashboard**
   - Select a repository from the dropdown
   - Dashboard automatically fetches workflow runs, PRs, commits, and stats

4. **View Logs**
   - Click "Logs" button on any workflow run
   - View detailed job-by-job execution logs

5. **Export Options**
   - Click "Export Options" button
   - Copy README markdown or GitHub Pages workflow

## API Endpoints

- `GET /api/repos/{owner}/{repo}/workflows` - Get workflow runs
- `GET /api/repos/{owner}/{repo}/pulls` - Get pull requests
- `GET /api/repos/{owner}/{repo}/commits` - Get recent commits
- `GET /api/repos/{owner}/{repo}/stats` - Get repository statistics
- `GET /api/repos/{owner}/{repo}/badges` - Get badge URLs
- `GET /api/repos/{owner}/{repo}/logs/{run_id}` - Get workflow logs
- `POST /api/webhook/github` - Receive GitHub webhook events

## Design System

### Typography
- **Headings**: Space Grotesk
- **Body**: IBM Plex Sans
- **Code**: Roboto Mono

### Color Palette
- **Primary**: Ocean blue
- **Success**: Green
- **Warning**: Orange
- **Destructive**: Red
- **Info**: Cyan

---

Built with ❤️ for developers who love CI/CD
