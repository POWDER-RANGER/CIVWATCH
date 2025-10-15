import React from 'react';
import { Button } from '../ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../ui/select';
import { Input } from '../ui/input';
import { Separator } from '../ui/separator';
import { ThemeToggle } from './ThemeToggle';
import { Github, RefreshCw } from 'lucide-react';

export const HeaderBar = ({ repos = [], selectedRepo, onRepoChange, onRefresh, refreshing = false }) => {
  return (
    <header className="sticky top-0 z-40 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 h-14 flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Github className="w-5 h-5 text-primary" />
          <span className="font-heading font-semibold tracking-tight text-lg">CIVWATCH</span>
          <Separator orientation="vertical" className="h-5" />
        </div>
        
        <Select value={selectedRepo} onValueChange={onRepoChange}>
          <SelectTrigger data-testid="repo-select" className="w-[220px]">
            <SelectValue placeholder="Select repository" />
          </SelectTrigger>
          <SelectContent>
            {repos.map(r => (
              <SelectItem key={r} value={r} data-testid={`repo-option-${r}`}>{r}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <div className="ml-auto flex items-center gap-2">
          <Input 
            data-testid="global-search-input" 
            placeholder="Search workflows, PRs..." 
            className="w-[180px] md:w-[280px]" 
          />
          <Button 
            data-testid="refresh-runs-button" 
            variant="ghost" 
            size="sm"
            onClick={onRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};