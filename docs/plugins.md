# Plugin Development Guide

## Overview
Extend CIVWATCH with custom plugins for data sources, analyzers, alerts, and UI components.

## Plugin Architecture
- Plugins extend `@civwatch/sdk.Plugin` base class
- Hook into ingestion, processing, or rendering lifecycle
- Sandboxed execution with limited permissions

## Types of Plugins
1. **Source Plugins**: Custom data connectors
2. **Analyzer Plugins**: Custom NLP/ML transformations
3. **Alert Plugins**: Custom notification channels
4. **UI Plugins**: Dashboard widgets and views

## Quick Start
```bash
npx create-civwatch-plugin my-plugin --type=source
cd civwatch-plugin-my-plugin
npm run dev
```

## Plugin Manifest
```json
{
  "name": "my-plugin",
  "version": "1.0.0",
  "type": "source",
  "entry": "dist/index.js",
  "permissions": ["network:https"],
  "config": {
    "apiKey": { "type": "string", "required": true }
  }
}
```

## Base Plugin
```typescript
import { Plugin, PluginContext } from '@civwatch/sdk';

export default class MyPlugin extends Plugin {
  async onInit(ctx: PluginContext) {
    this.config = ctx.config;
  }
  async execute(input: any) {
    // Transform input
    return { ...input, pluginProcessed: true };
  }
}
```

## Publishing
- npm publish to @civwatch-plugins scope
- Register in marketplace via PR to civwatch/marketplace

## Best Practices
- Handle errors gracefully
- Use structured logging
- Follow semantic versioning
- Document configuration schema

## Security
- Plugins run in sandboxed environments
- Request minimum permissions needed
- Never store secrets in code

## See Also
- Example plugins: github.com/civwatch/examples
- API Reference: ./api.md
