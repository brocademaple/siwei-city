# Siwei City

[English](README.md) | [简体中文](README.zh-CN.md)

Siwei City is a front-end MVP for turning fuzzy topics into structured thinking maps. It represents ideas as buildings, reasoning links as roads, role-based suggestions as residents, and structural gaps as city inspection notes.

![Siwei City hero panorama](src/assets/art/hero-city-panorama.png)

## Live Demo

- 2.0 default entry: <https://brocademaple.github.io/siwei-city/>
- 2.0 explicit path: <https://brocademaple.github.io/siwei-city/v2/>
- 1.0 iteration log: <https://brocademaple.github.io/siwei-city/v1/>

The 1.0 page is kept on GitHub Pages as an archive of early visual assets and map-layout decisions.

## Why It Exists

AI makes it cheap to generate answers and collect references. The harder work is keeping a personal judgment system alive:

- How did the question evolve?
- Which evidence supports the judgment?
- Which objections are still unresolved?
- What smallest action can bring back new evidence?
- Can one discussion become a reusable report?

Siwei City makes those structures visible. The goal is not to collect more AI output. The goal is to help a user maintain a map of questions, assumptions, evidence, counterarguments, actions, and reusable notes.

Default test topic:

> In the AI era, how should an individual rebuild their knowledge management system?

## Fast Demo Path

1. Open the 2.0 demo.
2. Keep the default topic, or write a fuzzy topic of your own.
3. Enter the conflict council.
4. Run the full council discussion.
5. Review how four residents turn the topic into questions, evidence, objections, and actions.
6. Open the inspector to see structural gaps.
7. Open the archive hall to copy or download the generated report.
8. Refresh the page and confirm the city restores the last local session.
9. Start a new round and confirm archived cities remain available.

## Current Capabilities

### Thinking Workspace

- Vite + React + TypeScript single-page app.
- Topic input with three discussion modes: explore, decide, and act.
- Opening draft generation for questions, assumptions, evidence gaps, objections, and actions.
- Guided first-run experience and a persistent MVP task path.

### Council And Residents

- A conflict council scene for the main discussion workflow.
- Role-based residents: practitioner, researcher, skeptic, and executor.
- Resident suggestions are previewed first, then added to the city only after user acceptance.
- Resident codex with role profile, prompt summary, and output contract.

### City Map And Routes

- Panorama city map with idea buildings, semantic districts, roads, and in-map popovers.
- Manual workshop for adding five kinds of idea nodes.
- Road creation between buildings with support, conflict, dependency, extension, and feedback relations.
- Service buildings embedded in the map: resident seats, inspection tower, and archive hall.

### Review And Archive

- City inspection rules for unsupported assumptions, unresolved objections, isolated ideas, and unclosed actions.
- Markdown export for reports, action plans, council records, and inspection notes.
- Built-in sample archive with four high-quality demo topics.
- Public trace docs for two complete thinking-chain runs.

### Persistence And Deployment

- Current session restore through browser localStorage.
- New round action that resets the active city without deleting historical archives.
- Historical cities saved as local project snapshots.
- First-party art assets for the city, buildings, districts, textures, scenes, and characters.
- GitHub Actions deployment to GitHub Pages.

## Product Loop

```text
Input material
  -> Opening draft
  -> Idea buildings
  -> Resident suggestions
  -> Accepted contributions
  -> Reasoning roads
  -> City inspection
  -> Next action / report material
```

Core principle: the system can suggest, inspect, and summarize, but the user keeps final judgment. Resident letters only preview changes. Inspection notes only point out issues. The map changes when the user accepts the next move.

## Run Locally

```bash
npm install
npm run dev
```

Then open:

```text
http://127.0.0.1:5173/
```

If PowerShell blocks `npm.ps1`, use:

```bash
npm.cmd install
npm.cmd run dev
```

Production build:

```bash
npm run build
```

GitHub Pages build:

```bash
npm run build:pages
```

Generate two complete thinking-chain traces:

```bash
npm run trace:thinking
```

## Validation

Run the release-oriented smoke test:

```bash
npm run test:smoke
```

Build the GitHub Pages gallery and version paths:

```bash
npm run build:pages
```

Check generated art assets for visible green-screen remnants:

```bash
npm run check:assets
```

## Mimo API Proxy

The front end does not store a Mimo API key. Real AI reasoning goes through a Vercel Serverless Function proxy:

```text
api/mimo/chat.ts
```

Vercel environment variables:

```text
MIMO_API_KEY=your Mimo key
MIMO_BASE_URL=https://token-plan-cn.xiaomimimo.com/v1
MIMO_MODEL=mimo-v2.5-pro
MIMO_INPUT_PRICE_CNY_PER_1K=0
MIMO_OUTPUT_PRICE_CNY_PER_1K=0
```

Front-end environment variables:

```text
VITE_MIMO_PROXY_URL=/api/mimo/chat
VITE_MIMO_INPUT_PRICE_CNY_PER_1K=0
VITE_MIMO_OUTPUT_PRICE_CNY_PER_1K=0
```

For local development, place the full config in `.env.local`:

```text
MIMO_API_KEY=your full private API key
MIMO_BASE_URL=https://token-plan-cn.xiaomimimo.com/v1
MIMO_MODEL=mimo-v2.5-pro
MIMO_INPUT_PRICE_CNY_PER_1K=0
MIMO_OUTPUT_PRICE_CNY_PER_1K=0
VITE_MIMO_PROXY_URL=/api/mimo/chat
VITE_MIMO_INPUT_PRICE_CNY_PER_1K=0
VITE_MIMO_OUTPUT_PRICE_CNY_PER_1K=0
```

Minimal local verification:

```bash
npm run dev
```

In another terminal:

```bash
npm run verify:mimo
```

If Vite switches to another port, pass the actual local URL:

```bash
npm run verify:mimo -- --url=http://127.0.0.1:5174/api/mimo/chat
```

The verification script checks:

- The real Mimo response contains parseable `choices[0].message.content` JSON.
- `usage.prompt_tokens`, `usage.completion_tokens`, and `usage.total_tokens` are present.
- Local validation errors return a stable `error.type/message/status/retryable` shape.

To verify a deployed Vercel function:

```bash
npm run verify:mimo -- --url=https://your-domain/api/mimo/chat
```

If the proxy is not configured or the upstream service is unavailable, the product falls back to local templates and shows the reason in the city ledger. If Mimo does not return complete usage data, the product still shows AI content and marks ledger costs as estimated.

## Project Structure

```text
src/
  App.tsx                  # Application state and main workflow orchestration
  components/              # Map, popovers, panels, service drawer, archive, guide
  data/seed.ts             # Default topic, districts, initial ideas, early role suggestions
  lib/                     # Opening draft, modes, AI proxy call, archive, samples, review
  assets/art/              # Production art assets referenced by the front end
  assets/generated/        # Generated source images and slicing records
docs/
  current/                 # 2.0 manual, PRD, worldbuilding, mechanism docs
  archive-v1/              # 1.0 product, art, and test archive
  planning/                # Future buildings, resident daily talk, long-term roadmap
  trace-runs/              # Two complete thinking-chain traces
scripts/
  slice-assets.mjs
  check-green-artifacts.mjs
  optimize-art-assets.mjs
  build-pages-versions.mjs
  smoke-test.mjs
.github/workflows/
  deploy-pages.yml         # GitHub Pages deployment
```

## Documentation

- Illustrated MVP manual: [docs/current/siwei-city-mvp-manual.md](docs/current/siwei-city-mvp-manual.md)
- Current progress and PRD: [docs/current/project-status-prd.md](docs/current/project-status-prd.md)
- Worldbuilding: [docs/current/siwei-city-worldbuilding.md](docs/current/siwei-city-worldbuilding.md)
- Resident roundtable mechanism: [docs/current/roundtable-mechanism.md](docs/current/roundtable-mechanism.md)
- Version history: [docs/current/version-history.md](docs/current/version-history.md)
- Art direction: [docs/current/art-direction.md](docs/current/art-direction.md)
- Project orientation: [docs/current/project-orientation.md](docs/current/project-orientation.md)
- 1.0 archive: [docs/archive-v1/](docs/archive-v1/)
- Planning notes: [docs/planning/](docs/planning/)
- Thinking-chain traces: [docs/trace-runs/README.md](docs/trace-runs/README.md)

## Roadmap

### P0: Real Mimo Integration

The repeatable verification path is already in place through `npm run verify:mimo`. It checks OpenAI-compatible content, usage data, error shape, and cost estimation.

### P1: Multi-round Resident References

Each resident should reference a previous turn or a city building before producing the next response and suggested road.

### P2: Road Explanations

Each road should explain why the relation holds, improving reasoning transparency and report quality.

### P3: Dedicated Service Building Assets

Generate more specific art for resident seats, the inspection tower, the archive hall, and task cards.

## Key Assumptions

- The first version focuses on desktop web interaction, without mobile optimization or multi-user collaboration.
- If Mimo or Vercel is not configured, the product clearly falls back to local templates.
- The user keeps final judgment. The system helps find structure and propose next moves.
- Current sessions and historical cities live in browser localStorage until account sync is added.
