import React, { useEffect, useState } from 'react';
import './App.css';
import axios from 'axios';
import { Toaster, toast } from 'sonner';
import { HeaderBar } from './components/civwatch/HeaderBar';
import { PipelineOverviewCard } from './components/civwatch/PipelineOverviewCard';
import { WorkflowRunsTable } from './components/civwatch/WorkflowRunsTable';
import { LiveLogsPanel } from './components/civwatch/LiveLogsPanel';
import { PRActivityCard } from './components/civwatch/PRActivityCard';
import { CommitsTimeline } from './components/civwatch/CommitsTimeline';
import { BadgesPanel } from './components/civwatch/BadgesPanel';
import { ExportReadmeDialog } from './components/civwatch/ExportReadmeDialog';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Label } from './components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Github } from 'lucide-react';
import { motion } from 'framer-motion';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Initialize theme on load
if (typeof window !== 'undefined') {
  const saved = localStorage.getItem('theme');
  if (saved === 'dark') {
    document.documentElement.classList.add('dark');
  } else if (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.documentElement.classList.add('dark');
    localStorage.setItem('theme', 'dark');
  }
}

function App() {
  const [authenticated, setAuthenticated] = useState(false);
  const [token, setToken] = useState('');
  const [repos, setRepos] = useState([]);
  const [selectedRepo, setSelectedRepo] = useState('');
  const [owner, setOwner] = useState('');
  const [repoName, setRepoName] = useState('');
  
  // Data states
  const [stats, setStats] = useState(null);
  const [workflowRuns, setWorkflowRuns] = useState([]);
  const [pullRequests, setPullRequests] = useState([]);
  const [commits, setCommits] = useState([]);
  const [logs, setLogs] = useState([]);
  const [badges, setBadges] = useState(null);
  
  // Loading states
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Parse repo format: "owner/repo"
  const parseRepo = (repoStr) => {
    const parts = repoStr.split('/');
    if (parts.length === 2) {
      return { owner: parts[0], repo: parts[1] };
    }
    return null;
  };

  const handleAuth = () => {
    if (!token) {
      toast.error('Please enter a GitHub Personal Access Token');
      return;
    }
    
    // Add default repo if user wants to try with the CIVWATCH repo
    setRepos(['POWDER-RANGER/CIVWATCH']);
    setAuthenticated(true);
    toast.success('Connected! Select a repository to view CI data.');
  };

  const addRepository = () => {
    if (!owner || !repoName) {
      toast.error('Please enter both owner and repository name');
      return;
    }
    
    const repoStr = `${owner}/${repoName}`;
    if (!repos.includes(repoStr)) {
      setRepos([...repos, repoStr]);
      toast.success(`Added repository: ${repoStr}`);
    } else {
      toast.info('Repository already in list');
    }
    
    setOwner('');
    setRepoName('');
  };

  const fetchRepoData = async (repoStr) => {
    const parsed = parseRepo(repoStr);
    if (!parsed) return;
    
    setLoading(true);
    
    try {
      // Fetch all data in parallel
      const [statsRes, runsRes, prsRes, commitsRes, badgesRes] = await Promise.all([
        axios.get(`${API}/repos/${parsed.owner}/${parsed.repo}/stats?token=${token}`),
        axios.get(`${API}/repos/${parsed.owner}/${parsed.repo}/workflows?token=${token}`),
        axios.get(`${API}/repos/${parsed.owner}/${parsed.repo}/pulls?token=${token}&state=all`),
        axios.get(`${API}/repos/${parsed.owner}/${parsed.repo}/commits?token=${token}`),
        axios.get(`${API}/repos/${parsed.owner}/${parsed.repo}/badges`)
      ]);
      
      setStats(statsRes.data);
      setWorkflowRuns(runsRes.data.runs || []);
      setPullRequests(prsRes.data.pulls || []);
      setCommits(commitsRes.data.commits || []);
      setBadges(badgesRes.data);
      
      toast.success('Dashboard updated!');
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to fetch repository data. Check your token and permissions.');
    } finally {
      setLoading(false);
    }
  };

  const handleRepoChange = (repoStr) => {
    setSelectedRepo(repoStr);
    setLogs([]);
    fetchRepoData(repoStr);
  };

  const handleRefresh = () => {
    if (selectedRepo) {
      setRefreshing(true);
      fetchRepoData(selectedRepo).finally(() => setRefreshing(false));
    }
  };

  const handleViewLogs = async (runId) => {
    const parsed = parseRepo(selectedRepo);
    if (!parsed) return;
    
    try {
      const response = await axios.get(
        `${API}/repos/${parsed.owner}/${parsed.repo}/logs/${runId}?token=${token}`
      );
      setLogs(response.data.logs || []);
      toast.success('Logs loaded');
    } catch (error) {
      console.error('Error fetching logs:', error);
      toast.error('Failed to fetch logs');
    }
  };

  const parsed = selectedRepo ? parseRepo(selectedRepo) : null;

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Toaster position="top-right" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="p-3 rounded-full bg-primary/10">
                  <Github className="w-8 h-8 text-primary" />
                </div>
              </div>
              <CardTitle className="text-2xl font-heading">CIVWATCH</CardTitle>
              <CardDescription>CI Watchdog Dashboard - Monitor your GitHub CI/CD pipelines</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="token">GitHub Personal Access Token</Label>
                <Input
                  id="token"
                  type="password"
                  placeholder="ghp_xxxxxxxxxxxx"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAuth()}
                  data-testid="github-token-input"
                />
                <p className="text-xs text-muted-foreground">
                  Need a token? Create one at{' '}
                  <a 
                    href="https://github.com/settings/tokens" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    GitHub Settings
                  </a>
                  {' '}with <code className="bg-muted px-1 rounded">repo</code> scope.
                </p>
              </div>
              <Button 
                onClick={handleAuth} 
                className="w-full" 
                data-testid="connect-button"
              >
                Connect to GitHub
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Toaster position="top-right" />
      
      <HeaderBar 
        repos={repos}
        selectedRepo={selectedRepo}
        onRepoChange={handleRepoChange}
        onRefresh={handleRefresh}
        refreshing={refreshing}
      />
      
      <main className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        {!selectedRepo ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            <Card className="max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle className="font-heading">Add Repository</CardTitle>
                <CardDescription>Add GitHub repositories to monitor their CI/CD status</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="add" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="add">Add Repository</TabsTrigger>
                    <TabsTrigger value="list">My Repositories ({repos.length})</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="add" className="space-y-4 mt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="owner">Owner</Label>
                        <Input
                          id="owner"
                          placeholder="octocat"
                          value={owner}
                          onChange={(e) => setOwner(e.target.value)}
                          data-testid="repo-owner-input"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="repo">Repository</Label>
                        <Input
                          id="repo"
                          placeholder="hello-world"
                          value={repoName}
                          onChange={(e) => setRepoName(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && addRepository()}
                          data-testid="repo-name-input"
                        />
                      </div>
                    </div>
                    <Button onClick={addRepository} className="w-full" data-testid="add-repo-button">
                      Add Repository
                    </Button>
                  </TabsContent>
                  
                  <TabsContent value="list" className="mt-4">
                    <div className="space-y-2">
                      {repos.map((repo) => (
                        <div 
                          key={repo} 
                          className="flex items-center justify-between p-3 border rounded-md hover:bg-accent/50 transition-colors"
                        >
                          <span className="font-code text-sm">{repo}</span>
                          <Button 
                            variant="secondary" 
                            size="sm"
                            onClick={() => handleRepoChange(repo)}
                            data-testid={`select-repo-${repo}`}
                          >
                            View Dashboard
                          </Button>
                        </div>
                      ))}
                      {repos.length === 0 && (
                        <p className="text-center text-muted-foreground py-8">
                          No repositories added yet. Add one to get started!
                        </p>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="space-y-6"
          >
            {/* Bento Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-4 md:gap-5 lg:gap-6">
              {/* Row 1: Pipeline Overview + Badges */}
              <div className="col-span-1 md:col-span-4 lg:col-span-8">
                <PipelineOverviewCard stats={stats} trendData={[]} />
              </div>
              <div className="col-span-1 md:col-span-2 lg:col-span-4">
                <BadgesPanel owner={parsed?.owner} repo={parsed?.repo} badges={badges} />
              </div>
              
              {/* Row 2: Workflow Runs Table (Full Width) */}
              <div className="col-span-1 md:col-span-6 lg:col-span-12">
                <WorkflowRunsTable 
                  runs={workflowRuns} 
                  loading={loading}
                  onViewLogs={handleViewLogs}
                />
              </div>
              
              {/* Row 3: PR Activity + Commits + Logs */}
              <div className="col-span-1 md:col-span-3 lg:col-span-4">
                <PRActivityCard prs={pullRequests} loading={loading} />
              </div>
              <div className="col-span-1 md:col-span-3 lg:col-span-4">
                <CommitsTimeline commits={commits} loading={loading} />
              </div>
              <div className="col-span-1 md:col-span-6 lg:col-span-4">
                <LiveLogsPanel logs={logs} />
              </div>
            </div>
            
            {/* Export Options */}
            <div className="flex justify-center">
              <ExportReadmeDialog owner={parsed?.owner} repo={parsed?.repo} />
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}

export default App;