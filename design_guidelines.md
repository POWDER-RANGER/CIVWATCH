{
  "project": {
    "name": "CIVWATCH — CI Watchdog Dashboard",
    "purpose": "Visualize GitHub repository CI pipeline status, PR/commit activity, and live badges for key integrations.",
    "audience": ["Developers", "DevOps", "Eng Managers"],
    "brand_attributes": ["professional", "high-signal", "calm", "trustworthy", "modular"],
    "visual_style": "Swiss/International Typographic Style meets Bento Grid Layout. Data-dense without clutter, strong typographic rhythm, subtle textures, and disciplined color for status semantics."
  },
  "references_inspiration": [
    "https://dribbble.com/tags/continuous-integration",
    "https://dribbble.com/search/github%20dashboard",
    "https://www.behance.net/search/projects/dashboard",
    "https://cicube.io/blog/github-actions-dashboard/",
    "https://graphite.dev/guides/github-analytics-dashboard"
  ],
  "typography": {
    "heading_font": "Space Grotesk",
    "body_font": "IBM Plex Sans",
    "code_font": "Roboto Mono",
    "load_fonts_in_index_html": [
      "<link href=\"https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap\" rel=\"stylesheet\">",
      "<link href=\"https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&display=swap\" rel=\"stylesheet\">",
      "<link href=\"https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@400;500;700&display=swap\" rel=\"stylesheet\">"
    ],
    "scale": {
      "h1": "text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight",
      "h2": "text-base md:text-lg font-medium text-muted-foreground",
      "h3": "text-lg font-semibold",
      "body": "text-sm md:text-base",
      "small": "text-xs md:text-sm text-muted-foreground"
    },
    "utility_classes": {
      "heading": "font-[Space_Grotesk]",
      "body": "font-[IBM_Plex_Sans]",
      "code": "font-[Roboto_Mono]"
    },
    "rules": [
      "Use body font for all UI text and labels; headings use heading font; code/inline metrics use code font.",
      "Maintain consistent letter-spacing; avoid uppercase for long headings.",
      "Never center the entire app container; left-align reading areas." 
    ]
  },
  "color_system": {
    "personality": "Neutral slate base with ocean/cyan accents. Strict semantic colors for statuses to reduce cognitive load.",
    "light_theme_tokens_hsl": {
      "--background": "210 20% 99%",
      "--foreground": "220 15% 10%",
      "--card": "0 0% 100%",
      "--card-foreground": "220 15% 12%",
      "--muted": "220 14% 96%",
      "--muted-foreground": "220 8% 45%",
      "--accent": "200 60% 96%",
      "--accent-foreground": "210 40% 20%",
      "--border": "220 14% 90%",
      "--ring": "200 80% 40%",
      "--primary": "198 80% 38%",
      "--primary-foreground": "0 0% 100%",
      "--success": "159 64% 40%",
      "--success-foreground": "0 0% 100%",
      "--warning": "38 92% 50%",
      "--warning-foreground": "25 80% 12%",
      "--destructive": "0 72% 45%",
      "--destructive-foreground": "0 0% 100%",
      "--info": "200 80% 38%",
      "--info-foreground": "0 0% 100%",
      "--coverage": "271 68% 49%"
    },
    "dark_theme_tokens_hsl": {
      "--background": "220 18% 6%",
      "--foreground": "210 20% 96%",
      "--card": "220 14% 8%",
      "--card-foreground": "210 20% 96%",
      "--muted": "220 12% 14%",
      "--muted-foreground": "220 8% 65%",
      "--accent": "200 40% 14%",
      "--accent-foreground": "200 24% 90%",
      "--border": "220 12% 18%",
      "--ring": "199 90% 55%",
      "--primary": "198 80% 48%",
      "--primary-foreground": "0 0% 10%",
      "--success": "159 64% 46%",
      "--success-foreground": "0 0% 8%",
      "--warning": "38 92% 56%",
      "--warning-foreground": "25 80% 10%",
      "--destructive": "0 62% 54%",
      "--destructive-foreground": "0 0% 98%",
      "--info": "200 80% 60%",
      "--info-foreground": "0 0% 8%",
      "--coverage": "271 68% 60%"
    },
    "status_semantics": {
      "success": "Use --success for passed runs, merged PRs.",
      "failed": "Use --destructive for failed runs and error logs.",
      "queued": "Use --muted with dashed borders.",
      "in_progress": "Use --info for running, paired with an animated progress bar.",
      "skipped": "Use --muted-foreground for subdued indicators.",
      "coverage": "Use --coverage for coverage visualizations (donut/label)."
    },
    "charts_palette": ["--primary", "--success", "--warning", "--coverage", "--destructive"],
    "implementation_note": "Map these tokens into :root and .dark in src/index.css using HSL values (match Tailwind’s hsl(var(--token)) scheme)."
  },
  "gradients_and_texture": {
    "usage": "Decorative only: header strip or section backgrounds. Max 20% viewport.",
    "hero_strip": "linear-gradient(135deg, hsl(198 90% 96%), hsl(198 70% 92%), hsl(200 60% 96%))",
    "card_accent_bar": "linear-gradient(90deg, hsl(198 80% 48%), hsl(159 64% 46%))",
    "texture": "Use CSS noise via radial-gradient overlays at 4–6% opacity. Avoid image textures for performance.",
    "prohibited": "No purple/pink saturated gradients. No gradients on text blocks or small UI elements."
  },
  "layout_structure": {
    "app_shell": {
      "header": "Top bar with product name, repository selector, search, theme toggle.",
      "sidebar": "Optional filters on md+ (branch, workflow, status). Collapsible on mobile.",
      "content": "Bento grid of modular panels/cards."
    },
    "grid": {
      "mobile": "grid-cols-1 gap-4",
      "tablet": "md:grid-cols-6 md:gap-5",
      "desktop": "lg:grid-cols-12 lg:gap-6",
      "card_sizes": {
        "wide": "col-span-1 md:col-span-6 lg:col-span-8",
        "tall": "row-span-2",
        "square": "col-span-1 md:col-span-3 lg:col-span-4",
        "full": "col-span-1 md:col-span-6 lg:col-span-12"
      }
    },
    "panels": [
      "Pipeline Overview (sparkline of success rate, current run status)",
      "Workflow Runs History (table + filters)",
      "Live Status & Logs (accordion/log viewer)",
      "PR Activity (open/merged with status chips)",
      "Recent Commits Timeline",
      "Badges (GitHub Actions, Codecov, Coveralls, Shields.io)",
      "Exports (README snippet, GitHub Pages instructions)"
    ]
  },
  "components": {
    "use_shadcn": true,
    "paths": {
      "base": "/app/frontend/src/components/ui/",
      "toast": "/app/frontend/src/components/ui/sonner.jsx"
    },
    "mapping": [
      {"feature": "Header", "components": ["navigation-menu.jsx", "menubar.jsx", "command.jsx", "switch.jsx", "dropdown-menu.jsx", "button.jsx", "badge.jsx"]},
      {"feature": "Panels", "components": ["card.jsx", "tabs.jsx", "separator.jsx", "scroll-area.jsx", "tooltip.jsx", "accordion.jsx", "resizable.jsx", "table.jsx", "progress.jsx", "skeleton.jsx"]},
      {"feature": "Forms/Filters", "components": ["select.jsx", "checkbox.jsx", "radio-group.jsx", "input.jsx"]},
      {"feature": "Dialogs & Export", "components": ["dialog.jsx", "popover.jsx", "hover-card.jsx"]}
    ],
    "new_components_to_create": [
      
      "/app/frontend/src/components/civwatch/HeaderBar.jsx",
      "/app/frontend/src/components/civwatch/PipelineOverviewCard.jsx",
      "/app/frontend/src/components/civwatch/WorkflowRunsTable.jsx",
      "/app/frontend/src/components/civwatch/LiveLogsPanel.jsx",
      "/app/frontend/src/components/civwatch/PRActivityCard.jsx",
      "/app/frontend/src/components/civwatch/CommitsTimeline.jsx",
      "/app/frontend/src/components/civwatch/BadgesPanel.jsx",
      "/app/frontend/src/components/civwatch/ExportReadmeDialog.jsx",
      "/app/frontend/src/components/civwatch/ThemeToggle.jsx"
    ],
    "button_style": {
      "tone": "Professional / Corporate",
      "shape": "medium radius (6–8px)",
      "motion": "subtle hover via transition-colors and shadow only (avoid transform transitions)",
      "variants": {
        "primary": "bg-primary text-primary-foreground hover:bg-[hsl(var(--primary))]/90 focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]",
        "secondary": "bg-accent text-accent-foreground hover:bg-accent/80",
        "ghost": "bg-transparent hover:bg-muted"
      },
      "sizes": {
        "sm": "h-8 px-3",
        "md": "h-10 px-4",
        "lg": "h-12 px-5"
      }
    }
  },
  "charts": {
    "library": "recharts",
    "install": "npm i recharts",
    "components": ["LineChart", "AreaChart", "ResponsiveContainer", "Tooltip", "CartesianGrid", "XAxis", "YAxis", "BarChart", "Bar", "PieChart", "Pie", "Cell"],
    "usage": {
      "status_trend": "Line/Area chart showing success rate over time",
      "duration_bars": "Bar chart of build durations by run",
      "coverage_donut": "Donut chart for test coverage"
    },
    "color_binding": "Use CSS variables by passing computed colors: getComputedStyle(document.documentElement).getPropertyValue('--success') etc."
  },
  "badge_integrations": {
    "sources": ["Shields.io", "GitHub Actions", "Codecov", "Coveralls"],
    "display": "Show as inline images or generated <img> with alt text and tooltips. Provide copy-ready Markdown in Export dialog.",
    "example_markdown": "[![CI](https://img.shields.io/github/actions/workflow/status/<org>/<repo>/ci.yml?label=CI)](https://github.com/<org>/<repo>/actions) [![Coverage](https://codecov.io/github/<org>/<repo>/coverage.svg?branch=main)](https://codecov.io/github/<org>/<repo>) [![Coveralls](https://coveralls.io/repos/github/<org>/<repo>/badge.svg?branch=main)](https://coveralls.io/github/<org>/<repo>)"
  },
  "micro_interactions_and_motion": {
    "principles": [
      "No universal transition: all. Only use transition-colors, transition-opacity, transition-shadow.",
      "Prefer opacity/blur reveals for logs and menus. Avoid CSS transform transitions.",
      "Entrance animations via Framer Motion for panels (reduced-motion respected)."
    ],
    "install": "npm i framer-motion",
    "examples": {
      "card_hover": "hover:shadow-md shadow-sm transition-shadow duration-200",
      "tab_switch": "underline motion-safe:transition-colors",
      "log_stream_pulse": "use CSS keyframes for subtle glow on new error lines (background-color 0.2s)."
    }
  },
  "theme_and_tokens": {
    "toggle": "Use shadcn switch.jsx bound to 'dark' class on <html>. Persist in localStorage.",
    "js_scaffold": "function applyTheme(next){const r=document.documentElement; if(next==='dark'){r.classList.add('dark')}else{r.classList.remove('dark')} localStorage.setItem('theme',next);} (function(){const saved=localStorage.getItem('theme'); if(saved){applyTheme(saved);} else if(window.matchMedia('(prefers-color-scheme: dark)').matches){applyTheme('dark')} })();",
    "data_tokens_css_snippet": ":root{--success:159 64% 40%;--warning:38 92% 50%;--info:200 80% 38%;--coverage:271 68% 49%;} .dark{--success:159 64% 46%;--warning:38 92% 56%;--info:200 80% 60%;--coverage:271 68% 60%;}"
  },
  "accessibility": {
    "contrast": "Ensure WCAG AA. Use success/destructive with sufficient contrast on both themes.",
    "focus": "Use visible focus rings via ring-[hsl(var(--ring))] and offset.",
    "reduced_motion": "Wrap motion with prefers-reduced-motion and motion-safe utilities.",
    "status_text": "Always pair status color with text/icon + aria-label."
  },
  "qa_testing": {
    "rule": "All interactive and key informational elements MUST include data-testid attributes.",
    "naming": "kebab-case describing role, e.g., data-testid=\"theme-toggle-switch\", data-testid=\"export-readme-button\", data-testid=\"workflow-runs-table\".",
    "coverage": ["buttons", "links", "selects", "inputs", "menus", "tabs", "toasts", "chart-widgets", "status-badges", "error-messages"],
    "example": "<button data-testid=\"refresh-runs-button\">Refresh</button>"
  },
  "grid_and_spacing": {
    "container": "mx-auto px-4 sm:px-6 lg:px-8 max-w-[1400px]",
    "vertical_rhythm": "section py-6 md:py-8 lg:py-10",
    "card_padding": "p-4 md:p-5 lg:p-6",
    "density": "Prefer 2x the default whitespace; avoid cramped tables."
  },
  "layout_wireframe": {
    "header": ["Left: CIVWATCH logo/text", "Repo selector (Command palette or Select)", "Search input", "Theme toggle", "User/Help menu"],
    "content_bento": [
      "Row1: PipelineOverviewCard (wide) + BadgesPanel (square)",
      "Row2: WorkflowRunsTable (full)",
      "Row3: PRActivityCard (square) + CommitsTimeline (square) + LiveLogsPanel (wide)",
      "Row4: ExportReadmeDialog trigger and deployment helpers"
    ]
  },
  "example_component_scaffolds_jsx": {
    "HeaderBar.jsx": "import React from 'react'; import { Button } from '../ui/button'; import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../ui/select'; import { Input } from '../ui/input'; import { Switch } from '../ui/switch'; import { Separator } from '../ui/separator'; export const HeaderBar = ({ repos=[], onRepoChange, onThemeToggle }) => ( <header className=\"sticky top-0 z-40 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b\"> <div className=\"mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 h-14 flex items-center gap-3\"> <div className=\"flex items-center gap-2\"><span className=\"font-semibold tracking-tight\">CIVWATCH</span><Separator orientation=\"vertical\" className=\"h-5\" /></div> <Select onValueChange={onRepoChange}> <SelectTrigger data-testid=\"repo-select\" className=\"w-[220px]\"><SelectValue placeholder=\"Select repo\" /></SelectTrigger> <SelectContent>{repos.map(r=> <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent> </Select> <div className=\"ml-auto flex items-center gap-2\"> <Input data-testid=\"global-search-input\" placeholder=\"Search workflows, PRs...\" className=\"w-[220px] md:w-[320px]\" /> <Switch data-testid=\"theme-toggle-switch\" onCheckedChange={onThemeToggle} /> <Button data-testid=\"refresh-runs-button\" variant=\"ghost\">Refresh</Button> </div> </div> </header> );",
    "PipelineOverviewCard.jsx": "import React from 'react'; import { Card, CardHeader, CardContent } from '../ui/card'; import { Progress } from '../ui/progress'; export const PipelineOverviewCard = ({ stats }) => { const pass = stats?.passRate ?? 0; const running = stats?.running ?? 0; return (<Card data-testid=\"pipeline-overview-card\" className=\"hover:shadow-md transition-shadow\"><CardHeader><h3 className=\"text-lg font-semibold\">Pipeline Overview</h3></CardHeader><CardContent className=\"space-y-4\"> <div className=\"flex gap-6\"> <div><div className=\"text-sm text-muted-foreground\">Pass rate</div><div className=\"text-2xl font-semibold\">{pass}%</div><Progress value={pass} className=\"h-2\" /></div> <div><div className=\"text-sm text-muted-foreground\">Running</div><div className=\"text-2xl font-semibold\">{running}</div></div> </div> <div id=\"trend\" className=\"h-24\"></div> </CardContent></Card> ); };",
    "WorkflowRunsTable.jsx": "import React from 'react'; import { Card, CardHeader, CardContent } from '../ui/card'; import { Table, TableHead, TableHeader, TableBody, TableRow, TableCell } from '../ui/table'; import { Badge } from '../ui/badge'; export const WorkflowRunsTable = ({ runs=[] }) => (<Card data-testid=\"workflow-runs-card\" className=\"hover:shadow-md transition-shadow\"><CardHeader><h3 className=\"text-lg font-semibold\">Workflow Runs</h3></CardHeader><CardContent> <div className=\"overflow-x-auto\"> <Table data-testid=\"workflow-runs-table\"> <TableHeader><TableRow><TableHead>Run</TableHead><TableHead>Status</TableHead><TableHead>Duration</TableHead><TableHead>Branch</TableHead><TableHead>Commit</TableHead></TableRow></TableHeader> <TableBody>{runs.map(r=> (<TableRow key={r.id} data-testid=\"workflow-row\"> <TableCell>#{r.run_number}</TableCell> <TableCell>{r.status==='success'? <Badge className=\"bg-[hsl(var(--success))] text-[hsl(var(--success-foreground))]\">Passed</Badge> : r.status==='failed'? <Badge className=\"bg-[hsl(var(--destructive))] text-[hsl(var(--destructive-foreground))]\">Failed</Badge> : <Badge className=\"bg-muted text-foreground\">{r.status}</Badge>}</TableCell> <TableCell>{r.duration}</TableCell> <TableCell>{r.branch}</TableCell> <TableCell className=\"font-mono\">{r.sha?.slice(0,7)}</TableCell> </TableRow>))}</TableBody> </Table> </div> </CardContent></Card>);",
    "LiveLogsPanel.jsx": "import React from 'react'; import { Card, CardHeader, CardContent } from '../ui/card'; import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '../ui/accordion'; export const LiveLogsPanel = ({ logs=[] }) => (<Card data-testid=\"live-logs-panel\" className=\"hover:shadow-md transition-shadow\"><CardHeader><h3 className=\"text-lg font-semibold\">Live Status & Logs</h3></CardHeader><CardContent> <div className=\"max-h-80 overflow-auto\"> <Accordion type=\"single\" collapsible> {logs.map((g,idx)=> (<AccordionItem key={idx} value={String(idx)}><AccordionTrigger>{g.step}</AccordionTrigger><AccordionContent> <pre className=\"text-xs bg-muted p-3 rounded-md overflow-auto\">{g.output}</pre> </AccordionContent></AccordionItem>))} </Accordion> </div> </CardContent></Card>);",
    "PRActivityCard.jsx": "import React from 'react'; import { Card, CardHeader, CardContent } from '../ui/card'; import { Badge } from '../ui/badge'; export const PRActivityCard = ({ prs=[] }) => (<Card data-testid=\"pr-activity-card\" className=\"hover:shadow-md transition-shadow\"><CardHeader><h3 className=\"text-lg font-semibold\">PR Activity</h3></CardHeader><CardContent className=\"space-y-3\"> {prs.slice(0,6).map(pr=> (<div key={pr.id} className=\"flex items-start justify-between gap-3\"> <div className=\"min-w-0\"><div className=\"truncate\">#{pr.number} {pr.title}</div><div className=\"text-xs text-muted-foreground\">{pr.user} • {pr.updated_at}</div></div> <Badge className={pr.merged? 'bg-[hsl(var(--success))] text-[hsl(var(--success-foreground))]' : pr.state==='open'? 'bg-[hsl(var(--info))] text-[hsl(var(--info-foreground))]' : 'bg-muted'}>{pr.merged? 'Merged': pr.state}</Badge> </div>))} </CardContent></Card>);",
    "CommitsTimeline.jsx": "import React from 'react'; import { Card, CardHeader, CardContent } from '../ui/card'; import { Separator } from '../ui/separator'; export const CommitsTimeline = ({ commits=[] }) => (<Card data-testid=\"commits-timeline-card\" className=\"hover:shadow-md transition-shadow\"><CardHeader><h3 className=\"text-lg font-semibold\">Recent Commits</h3></CardHeader><CardContent className=\"space-y-4\"> {commits.slice(0,8).map(c=> (<div key={c.sha} className=\"flex gap-3\"> <div className=\"w-1 bg-[hsl(var(--accent-foreground))]/20 rounded\"></div> <div className=\"space-y-1\"> <div className=\"font-mono text-xs\">{c.sha.slice(0,7)}</div> <div className=\"text-sm\">{c.message}</div> <div className=\"text-xs text-muted-foreground\">{c.author} • {c.date}</div> </div> </div>))} <Separator /> </CardContent></Card>);",
    "BadgesPanel.jsx": "import React from 'react'; import { Card, CardHeader, CardContent } from '../ui/card'; export const BadgesPanel = ({ markdown }) => (<Card data-testid=\"badges-panel\" className=\"hover:shadow-md transition-shadow\"><CardHeader><h3 className=\"text-lg font-semibold\">Badges</h3></CardHeader><CardContent className=\"space-y-3\"> <div className=\"flex flex-wrap items-center gap-3\" data-testid=\"badges-strip\"> <img alt=\"CI status\" src=\"https://img.shields.io/github/actions/workflow/status/org/repo/ci.yml?label=CI\" className=\"h-6\" /> <img alt=\"Codecov\" src=\"https://codecov.io/github/org/repo/coverage.svg?branch=main\" className=\"h-6\" /> <img alt=\"Coveralls\" src=\"https://coveralls.io/repos/github/org/repo/badge.svg?branch=main\" className=\"h-6\" /> </div> </CardContent></Card>);",
    "ExportReadmeDialog.jsx": "import React from 'react'; import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog'; import { Button } from '../ui/button'; import { Textarea } from '../ui/textarea'; export const ExportReadmeDialog = ({ markdown }) => { const [copied,setCopied]=React.useState(false); const copy=()=>{ navigator.clipboard.writeText(markdown||''); setCopied(true); setTimeout(()=>setCopied(false),1500); }; return (<Dialog> <DialogTrigger asChild><Button data-testid=\"export-readme-button\" variant=\"default\">Export README Snippet</Button></DialogTrigger> <DialogContent className=\"sm:max-w-[700px]\"> <DialogHeader><DialogTitle>Copy Markdown</DialogTitle></DialogHeader> <Textarea readOnly value={markdown} className=\"font-mono text-xs h-64\" data-testid=\"export-readme-textarea\" /> <div className=\"flex justify-end gap-2\"> <Button onClick={copy} data-testid=\"copy-readme-button\" variant=\"secondary\">{copied?'Copied':'Copy'}</Button> </div> </DialogContent> </Dialog> ); };",
    "ThemeToggle.jsx": "import React from 'react'; import { Switch } from '../ui/switch'; export const ThemeToggle = () => { const [dark,setDark]=React.useState(() => document.documentElement.classList.contains('dark')); const toggle=(checked)=>{ setDark(checked); const next=checked?'dark':'light'; const r=document.documentElement; if(checked){r.classList.add('dark')} else {r.classList.remove('dark')} localStorage.setItem('theme', next); }; return <Switch checked={dark} onCheckedChange={toggle} data-testid=\"theme-toggle-switch\" />; };"
  },
  "images_and_media": {
    "use_images": false,
    "note": "Prefer CSS noise and vector badges. No raster hero images needed for a developer dashboard.",
    "image_urls": []
  },
  "empty_states": {
    "runs_table": "Show Card with an illustration-less state: title 'No workflow runs yet' and a secondary button 'Trigger workflow' (if applicable).",
    "logs_panel": "Show muted code block with 'Select a run to stream logs'."
  },
  "notifications_toasts": {
    "library": "sonner",
    "path": "/app/frontend/src/components/ui/sonner.jsx",
    "usage": "import { Toaster, toast } from '../ui/sonner'; <Toaster position=\"top-right\" />; toast.success('Exported snippet');"
  },
  "exports_and_deploy": {
    "readme_snippet": "Generate Markdown with Shields badges and links to Actions, Codecov, Coveralls.",
    "gh_pages_help": "Provide a dialog with one-click copy of gh-pages workflow YAML and instructions to publish the /build directory.",
    "gh_pages_yaml": "name: deploy-gh-pages\non: { push: { branches: [main] } }\njobs:\n  deploy:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - uses: actions/setup-node@v4\n        with: { node-version: '20' }\n      - run: npm ci && npm run build\n      - uses: peaceiris/actions-gh-pages@v3\n        with:\n          github_token: ${{ secrets.GITHUB_TOKEN }}\n          publish_dir: ./build"
  },
  "responsiveness": {
    "mobile_first": true,
    "patterns": ["Single column stacking on < md", "Hide sidebar/filters into a Drawer on mobile", "Pin header with backdrop blur"]
  },
  "accessories_and_icons": {
    "icon_library": "lucide-react (already included typically with shadcn)",
    "note": "Do not use emoji for icons."
  },
  "data_states_and_loaders": {
    "skeletons": "Use ui/skeleton.jsx for cards and table rows; shimmer widths should vary.",
    "errors": "Show Alert component with destructive colors and 'Retry' button with data-testid=\"retry-button\".",
    "empty": "Provide clear calls to action where applicable."
  },
  "security_and_permissions": {
    "secrets": "Never render tokens in the UI. Logs should mask secrets with •••.",
    "links": "Open external links in new tab with rel=\"noopener noreferrer\"."
  },
  "implementation_notes": {
    "css_updates": "Extend src/index.css :root/.dark with status tokens listed above for consistent Tailwind hsl(var(--token)) usage.",
    "imports": "Always import from ./components/ui/*.jsx for shadcn components. Use named exports (export const ComponentName = ...).",
    "pages": "Page-level modules should default export functions (export default function PageName(){...}).",
    "testing": "Add data-testid to all interactive and key informational elements as per the QA testing rules.",
    "gradients_enforcement": "If gradient area exceeds 20% viewport or affects readability, fallback to solid backgrounds."
  },
  "instructions_to_main_agent": [
    "Implement HeaderBar, ThemeToggle, and all panel components under /app/frontend/src/components/civwatch as named exports.",
    "Wire data sources (GitHub APIs) later; start with mocked props and skeleton loaders.",
    "Install recharts and framer-motion as specified.",
    "Add status tokens to src/index.css and verify both themes for contrast.",
    "Ensure every interactive element has a data-testid attribute.",
    "Adhere strictly to gradient restrictions and avoid transition: all."
  ],
  "component_path": {
    "shadcn": "/app/frontend/src/components/ui/",
    "civwatch": "/app/frontend/src/components/civwatch/"
  },
  "libraries": {
    "install_commands": [
      "npm i recharts framer-motion",
      "npm i lucide-react"
    ],
    "usage_notes": [
      "Use Recharts for trend, duration, and coverage widgets.",
      "Use Framer Motion only for entrance/exit transitions; do not animate transforms with CSS transitions.",
      "Use Sonner for toasts from /app/frontend/src/components/ui/sonner.jsx"
    ]
  },
  "accessibility_and_testing_checklist": [
    "All buttons, inputs, tabs, menus include data-testid attributes.",
    "Keyboard navigable header and panels (Tab order logical).",
    "Focus outline visible, not removed.",
    "Chart colors are distinguishable in both themes; provide numeric labels or tooltips."
  ],
  "image_urls": [],
  "notes": "Design defaults lean minimal, highly scannable, with clear status color semantics and restrained motion."
}


<General UI UX Design Guidelines>  
    - You must **not** apply universal transition. Eg: `transition: all`. This results in breaking transforms. Always add transitions for specific interactive elements like button, input excluding transforms
    - You must **not** center align the app container, ie do not add `.App { text-align: center; }` in the css file. This disrupts the human natural reading flow of text
   - NEVER: use AI assistant Emoji characters like`🤖🧠💭💡🔮🎯📚🎭🎬🎪🎉🎊🎁🎀🎂🍰🎈🎨🎰💰💵💳🏦💎🪙💸🤑📊📈📉💹🔢🏆🥇 etc for icons. Always use **FontAwesome cdn** or **lucid-react** library already installed in the package.json

 **GRADIENT RESTRICTION RULE**
NEVER use dark/saturated gradient combos (e.g., purple/pink) on any UI element.  Prohibited gradients: blue-500 to purple 600, purple 500 to pink-500, green-500 to blue-500, red to pink etc
NEVER use dark gradients for logo, testimonial, footer etc
NEVER let gradients cover more than 20% of the viewport.
NEVER apply gradients to text-heavy content or reading areas.
NEVER use gradients on small UI elements (<100px width).
NEVER stack multiple gradient layers in the same viewport.

**ENFORCEMENT RULE:**
    • Id gradient area exceeds 20% of viewport OR affects readability, **THEN** use solid colors

**How and where to use:**
   • Section backgrounds (not content backgrounds)
   • Hero section header content. Eg: dark to light to dark color
   • Decorative overlays and accent elements only
   • Hero section with 2-3 mild color
   • Gradients creation can be done for any angle say horizontal, vertical or diagonal

- For AI chat, voice application, **do not use purple color. Use color like light green, ocean blue, peach orange etc**

</Font Guidelines>

- Every interaction needs micro-animations - hover states, transitions, parallax effects, and entrance animations. Static = dead. 
   
- Use 2-3x more spacing than feels comfortable. Cramped designs look cheap.

- Subtle grain textures, noise overlays, custom cursors, selection states, and loading animations: separates good from extraordinary.
   
- Before generating UI, infer the visual style from the problem statement (palette, contrast, mood, motion) and immediately instantiate it by setting global design tokens (primary, secondary/accent, background, foreground, ring, state colors), rather than relying on any library defaults. Don't make the background dark as a default step, always understand problem first and define colors accordingly
    Eg: - if it implies playful/energetic, choose a colorful scheme
           - if it implies monochrome/minimal, choose a black–white/neutral scheme

**Component Reuse:**
	- Prioritize using pre-existing components from src/components/ui when applicable
	- Create new components that match the style and conventions of existing components when needed
	- Examine existing components to understand the project's component patterns before creating new ones

**IMPORTANT**: Do not use HTML based component like dropdown, calendar, toast etc. You **MUST** always use `/app/frontend/src/components/ui/ ` only as a primary components as these are modern and stylish component

**Best Practices:**
	- Use Shadcn/UI as the primary component library for consistency and accessibility
	- Import path: ./components/[component-name]

**Export Conventions:**
	- Components MUST use named exports (export const ComponentName = ...)
	- Pages MUST use default exports (export default function PageName() {...})

**Toasts:**
  - Use `sonner` for toasts"
  - Sonner component are located in `/app/src/components/ui/sonner.tsx`

Use 2–4 color gradients, subtle textures/noise overlays, or CSS-based noise to avoid flat visuals.
</General UI UX Design Guidelines>
