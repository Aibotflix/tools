# Rules

- Take your time. Read the full context before acting.
- No shortcuts. Fix the root cause, not the symptom.
- No AI-sounding text. Write like a person, not a marketing bot.
- Verify every change. Run lint/typecheck if available.
- When fixing encoding: check the live site first via webfetch, fix
  the local file, verify with grep, commit and push.
- When something breaks: check browser console errors first.
- Never delete without understanding. Trace the code path.
- Keep it simple. Fewest files changed wins.
- Descriptions read like a person, not a marketing bot. No **, no fluff, just what it does.

# Session Log

## 2026-07-23 — Built 5 new developer tools

- **env-diff/**: Compare .env, .env.local, .env.production. Missing keys, changed values, duplicates, unused vars.
- **url-debugger/**: Paste a URL, see it broken down. Decoded, params parsed, duplicates flagged, encoding checked.
- **request-converter/**: Pick method+URL+headers, get same request in Fetch, Axios, cURL.
- **flex-grid-playground/**: Tweak Flexbox/Grid properties, see layout update live.
- **js-object-explorer/**: Paste a JS object, browse it like a file tree. Collapse, expand, see types.

All registered in tools.json, app.js, sitemap.xml, llms.txt, llms-full.txt. Count bumped to 34.

Next up from list: TypeScript Type Generator, API Mock Generator, Dependency Tree Viewer, Clipboard Transformer, JS Performance Playground, SQL Formatter, JWT Visual Debugger, OpenAPI Viewer, Docker Compose Visualizer, .env Inspector, Git Diff Beautifier, CSS Specificity Inspector, NPM Dependency Analyzer, REST Response Comparator, Regex Explain.
