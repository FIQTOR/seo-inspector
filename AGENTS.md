# AGENTS.md — SEO Inspector

Guidelines for AI agents working in this repository.

## Overview
Chrome Extension (Manifest V3) for technical SEO auditing without external API dependencies. Built with React 19, TypeScript, Vite, and Vitest.

## Tech Stack & Architecture
- **Manifest V3**: Background service worker (`src/background/`), Content scripts (`src/content/`), and Popup UI (`src/popup/`).
- **Audit Engine**: Deterministic scoring algorithms located in `src/engine/` or `src/audit/` evaluating DOM, headings, meta tags, schema, and links.
- **Testing**: Vitest (`tests/dom-scenarios.test.ts`).

## Key Commands
```bash
npm install
npm run dev        # Watch build
npm run build      # Production extension bundle in dist/
npm test           # Run Vitest test scenarios
```

## Guidelines
- Avoid bloat: Keep extension lightweight and responsive.
- Strictly adhere to Chrome Manifest V3 sandbox and security constraints (no unsafe eval, no inline scripts without nonce/hash).

