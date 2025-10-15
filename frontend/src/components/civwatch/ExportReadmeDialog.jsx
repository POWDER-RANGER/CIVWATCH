import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Copy, Download, FileText } from 'lucide-react';
import { toast } from 'sonner';

export const ExportReadmeDialog = ({ owner, repo }) => {
  const [copied, setCopied] = React.useState(false);

  const readmeMarkdown = `# ${repo}

## CI/CD Status

[![CI](https://img.shields.io/github/actions/workflow/status/${owner}/${repo}/ci.yml?label=CI)](https://github.com/${owner}/${repo}/actions)
[![Coverage](https://codecov.io/github/${owner}/${repo}/coverage.svg?branch=main)](https://codecov.io/github/${owner}/${repo})
[![Coveralls](https://coveralls.io/repos/github/${owner}/${repo}/badge.svg?branch=main)](https://coveralls.io/github/${owner}/${repo})
[![Last Commit](https://img.shields.io/github/last-commit/${owner}/${repo})](https://github.com/${owner}/${repo}/commits/main)

## Quick Stats

- **Last Build**: ![Build Status](https://img.shields.io/github/actions/workflow/status/${owner}/${repo}/ci.yml)
- **Issues**: ![Issues](https://img.shields.io/github/issues/${owner}/${repo})
- **Stars**: ![Stars](https://img.shields.io/github/stars/${owner}/${repo})
`;

  const ghPagesYaml = `name: Deploy GitHub Pages

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci && npm run build
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: \${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./build
`;

  const copy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button data-testid="export-readme-button" variant="default" className="gap-2">
          <FileText className="w-4 h-4" />
          Export Options
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Export Dashboard Data</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="readme" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="readme">README Snippet</TabsTrigger>
            <TabsTrigger value="ghpages">GitHub Pages</TabsTrigger>
          </TabsList>
          
          <TabsContent value="readme" className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                Copy this markdown to your README.md file to display CI status badges:
              </p>
              <Textarea 
                readOnly 
                value={readmeMarkdown} 
                className="font-code text-xs h-64" 
                data-testid="export-readme-textarea" 
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button 
                onClick={() => copy(readmeMarkdown)} 
                data-testid="copy-readme-button" 
                variant="secondary"
                className="gap-2"
              >
                <Copy className="w-4 h-4" />
                {copied ? 'Copied!' : 'Copy Markdown'}
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="ghpages" className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                Create a <code className="bg-muted px-1 py-0.5 rounded">.github/workflows/deploy.yml</code> file with this content:
              </p>
              <Textarea 
                readOnly 
                value={ghPagesYaml} 
                className="font-code text-xs h-64" 
                data-testid="export-ghpages-textarea" 
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button 
                onClick={() => copy(ghPagesYaml)} 
                data-testid="copy-ghpages-button" 
                variant="secondary"
                className="gap-2"
              >
                <Copy className="w-4 h-4" />
                {copied ? 'Copied!' : 'Copy Workflow'}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};