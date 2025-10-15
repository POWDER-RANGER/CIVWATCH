import React from 'react';
import { Card, CardHeader, CardContent } from '../ui/card';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Activity, CheckCircle2, XCircle, Clock } from 'lucide-react';

export const PipelineOverviewCard = ({ stats, trendData = [] }) => {
  const passRate = stats?.pass_rate ?? 0;
  const running = stats?.running ?? 0;
  const passed = stats?.passed ?? 0;
  const failed = stats?.failed ?? 0;

  return (
    <Card data-testid="pipeline-overview-card" className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold font-heading">Pipeline Overview</h3>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <CheckCircle2 className="w-3 h-3" />
              Pass rate
            </div>
            <div className="text-2xl font-semibold">{passRate}%</div>
            <Progress value={passRate} className="h-2" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Clock className="w-3 h-3" />
              Running
            </div>
            <div className="text-2xl font-semibold">{running}</div>
            <Badge variant="outline" className="mt-1 bg-[hsl(var(--info))]/10 text-[hsl(var(--info))]">
              Active
            </Badge>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-sm text-success">
              <CheckCircle2 className="w-3 h-3" />
              Passed
            </div>
            <div className="text-2xl font-semibold">{passed}</div>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-sm text-destructive">
              <XCircle className="w-3 h-3" />
              Failed
            </div>
            <div className="text-2xl font-semibold">{failed}</div>
          </div>
        </div>
        
        {trendData.length > 0 && (
          <div className="h-24" data-testid="pipeline-trend-chart">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorSuccess" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--success))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--success))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="date" hide />
                <YAxis hide />
                <Tooltip />
                <Area 
                  type="monotone" 
                  dataKey="success" 
                  stroke="hsl(var(--success))" 
                  fillOpacity={1} 
                  fill="url(#colorSuccess)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
};