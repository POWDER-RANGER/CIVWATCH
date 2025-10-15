import React from 'react';
import { Card, CardHeader, CardContent } from '../ui/card';
import { Separator } from '../ui/separator';
import { ScrollArea } from '../ui/scroll-area';
import { Skeleton } from '../ui/skeleton';
import { GitCommit, ExternalLink } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export const CommitsTimeline = ({ commits = [], loading = false }) => {
  if (loading) {
    return (
      <Card data-testid="commits-timeline-card" className="hover:shadow-md transition-shadow">
        <CardHeader>
          <h3 className="text-lg font-semibold font-heading">Recent Commits</h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-16 w-full" />)}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-testid="commits-timeline-card" className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GitCommit className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold font-heading">Recent Commits</h3>
          </div>
          <span className="text-xs text-muted-foreground">{commits.length} commits</span>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[280px]">
          <div className="space-y-4">
            {commits.slice(0, 10).map((commit, idx) => (
              <div key={commit.sha} data-testid={`commit-item-${commit.sha}`}>
                <div className="flex gap-3">
                  <div className="w-1 bg-[hsl(var(--accent-foreground))]/20 rounded flex-shrink-0"></div>
                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="font-code text-xs bg-muted px-2 py-0.5 rounded">
                        {commit.sha.slice(0, 7)}
                      </div>
                      <button
                        onClick={() => window.open(commit.html_url, '_blank', 'noopener,noreferrer')}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="text-sm line-clamp-2">{commit.message}</div>
                    <div className="text-xs text-muted-foreground">
                      {commit.author} • {formatDistanceToNow(new Date(commit.date), { addSuffix: true })}
                    </div>
                  </div>
                </div>
                {idx < commits.length - 1 && <Separator className="mt-3" />}
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};