import React from 'react';
import { Card, CardHeader, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { Skeleton } from '../ui/skeleton';
import { GitPullRequest, ExternalLink } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export const PRActivityCard = ({ prs = [], loading = false }) => {
  if (loading) {
    return (
      <Card data-testid="pr-activity-card" className="hover:shadow-md transition-shadow">
        <CardHeader>
          <h3 className="text-lg font-semibold font-heading">PR Activity</h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full" />)}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-testid="pr-activity-card" className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GitPullRequest className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold font-heading">PR Activity</h3>
          </div>
          <Badge variant="outline">{prs.length}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[280px]">
          <div className="space-y-3">
            {prs.slice(0, 8).map(pr => (
              <div 
                key={pr.id} 
                className="flex items-start justify-between gap-3 p-2 rounded-md hover:bg-accent/50 transition-colors"
                data-testid={`pr-item-${pr.number}`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-code text-xs text-muted-foreground">#{pr.number}</span>
                    <span className="truncate text-sm font-medium">{pr.title}</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {pr.user} • {formatDistanceToNow(new Date(pr.updated_at), { addSuffix: true })}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge 
                    className={
                      pr.merged 
                        ? 'bg-[hsl(var(--success))] text-[hsl(var(--success-foreground))]' 
                        : pr.state === 'open'
                        ? 'bg-[hsl(var(--info))] text-[hsl(var(--info-foreground))]'
                        : 'bg-muted'
                    }
                  >
                    {pr.merged ? 'Merged' : pr.state}
                  </Badge>
                  <button
                    onClick={() => window.open(pr.html_url, '_blank', 'noopener,noreferrer')}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};