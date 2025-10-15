import React from 'react';
import { Card, CardHeader, CardContent } from '../ui/card';
import { Table, TableHead, TableHeader, TableBody, TableRow, TableCell } from '../ui/table';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { Skeleton } from '../ui/skeleton';
import { ExternalLink, Clock, GitBranch, GitCommit } from 'lucide-react';

export const WorkflowRunsTable = ({ runs = [], loading = false, onViewLogs }) => {
  const getStatusBadge = (status, conclusion) => {
    if (status === 'in_progress') {
      return <Badge className="bg-[hsl(var(--info))] text-[hsl(var(--info-foreground))]">Running</Badge>;
    }
    if (conclusion === 'success') {
      return <Badge className="bg-[hsl(var(--success))] text-[hsl(var(--success-foreground))]">Passed</Badge>;
    }
    if (conclusion === 'failure') {
      return <Badge className="bg-[hsl(var(--destructive))] text-[hsl(var(--destructive-foreground))]">Failed</Badge>;
    }
    return <Badge variant="outline">{conclusion || status}</Badge>;
  };

  if (loading) {
    return (
      <Card data-testid="workflow-runs-card" className="hover:shadow-md transition-shadow">
        <CardHeader>
          <h3 className="text-lg font-semibold font-heading">Workflow Runs</h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-12 w-full" />)}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-testid="workflow-runs-card" className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold font-heading">Workflow Runs</h3>
          <Badge variant="outline">{runs.length} runs</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px]">
          <Table data-testid="workflow-runs-table">
            <TableHeader>
              <TableRow>
                <TableHead>Run</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Duration
                  </div>
                </TableHead>
                <TableHead>
                  <div className="flex items-center gap-1">
                    <GitBranch className="w-3 h-3" />
                    Branch
                  </div>
                </TableHead>
                <TableHead>
                  <div className="flex items-center gap-1">
                    <GitCommit className="w-3 h-3" />
                    Commit
                  </div>
                </TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {runs.map(run => (
                <TableRow key={run.id} data-testid="workflow-row">
                  <TableCell className="font-medium">#{run.run_number}</TableCell>
                  <TableCell>{getStatusBadge(run.status, run.conclusion)}</TableCell>
                  <TableCell className="font-code text-xs">{run.duration || '-'}</TableCell>
                  <TableCell>{run.branch}</TableCell>
                  <TableCell className="font-code text-xs">{run.sha}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => onViewLogs(run.id)}
                        data-testid={`view-logs-${run.id}`}
                      >
                        Logs
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => window.open(run.html_url, '_blank', 'noopener,noreferrer')}
                      >
                        <ExternalLink className="w-3 h-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};