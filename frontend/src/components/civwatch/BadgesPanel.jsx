import React from 'react';
import { Card, CardHeader, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { Copy, Shield } from 'lucide-react';
import { toast } from 'sonner';

export const BadgesPanel = ({ owner, repo, badges }) => {
  const copyBadge = (markdown) => {
    navigator.clipboard.writeText(markdown);
    toast.success('Badge markdown copied to clipboard!');
  };

  const badgeItems = [
    {
      label: 'CI Status',
      url: badges?.ci_badge || `https://img.shields.io/github/actions/workflow/status/${owner}/${repo}/ci.yml?label=CI`,
      markdown: `[![CI](https://img.shields.io/github/actions/workflow/status/${owner}/${repo}/ci.yml?label=CI)](https://github.com/${owner}/${repo}/actions)`
    },
    {
      label: 'Codecov',
      url: badges?.codecov_badge || `https://codecov.io/github/${owner}/${repo}/coverage.svg?branch=main`,
      markdown: `[![Coverage](https://codecov.io/github/${owner}/${repo}/coverage.svg?branch=main)](https://codecov.io/github/${owner}/${repo})`
    },
    {
      label: 'Coveralls',
      url: badges?.coveralls_badge || `https://coveralls.io/repos/github/${owner}/${repo}/badge.svg?branch=main`,
      markdown: `[![Coveralls](https://coveralls.io/repos/github/${owner}/${repo}/badge.svg?branch=main)](https://coveralls.io/github/${owner}/${repo})`
    }
  ];

  return (
    <Card data-testid="badges-panel" className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold font-heading">Status Badges</h3>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-center gap-3" data-testid="badges-strip">
          {badgeItems.map((item, idx) => (
            <TooltipProvider key={idx}>
              <Tooltip>
                <TooltipTrigger>
                  <img 
                    alt={item.label}
                    src={item.url}
                    className="h-6 rounded"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </TooltipTrigger>
                <TooltipContent>
                  <p>{item.label}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </div>
        
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">Click to copy markdown:</p>
          {badgeItems.map((item, idx) => (
            <div key={idx} className="flex items-center gap-2 text-xs">
              <Badge variant="outline" className="font-code">{item.label}</Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyBadge(item.markdown)}
                data-testid={`copy-badge-${idx}`}
              >
                <Copy className="w-3 h-3" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};