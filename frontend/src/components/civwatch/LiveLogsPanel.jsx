import React from 'react';
import { Card, CardHeader, CardContent } from '../ui/card';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '../ui/accordion';
import { ScrollArea } from '../ui/scroll-area';
import { Skeleton } from '../ui/skeleton';
import { Terminal, Info } from 'lucide-react';

export const LiveLogsPanel = ({ logs = [], loading = false }) => {
  if (loading) {
    return (
      <Card data-testid="live-logs-panel" className="hover:shadow-md transition-shadow">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5" />
            <h3 className="text-lg font-semibold font-heading">Live Status & Logs</h3>
          </div>
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
    <Card data-testid="live-logs-panel" className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Terminal className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold font-heading">Live Status & Logs</h3>
        </div>
      </CardHeader>
      <CardContent>
        {logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
            <Info className="w-8 h-8 mb-2" />
            <p>Select a workflow run to view logs</p>
          </div>
        ) : (
          <ScrollArea className="h-[320px]">
            <Accordion type="single" collapsible>
              {logs.map((log, idx) => (
                <AccordionItem key={idx} value={String(idx)}>
                  <AccordionTrigger>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{log.step}</span>
                      <span className="text-xs text-muted-foreground">({log.status})</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <pre className="text-xs bg-muted p-3 rounded-md overflow-auto font-code max-h-48">
                      {log.output}
                    </pre>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};