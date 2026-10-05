# Siwei City — Open-Source Landscape, Project Review & Next Release

Reviewed on 5 October 2026 (Asia/Shanghai). Prepared for the personal project owner. Evidence: current code, local runtime probes, authenticated GitHub deployment records, public repository documentation, research papers, and the live site in Comet. Recommendations are proposed next steps; no user study has been completed in this review.

## Conclusions and immediate priorities

**The largest problem is that the reasoning and evidence loop remains underdeveloped relative to the visual experience.** The city, council, residents, inspection, and archive already form a working prototype. Its distinguishing promise still needs proof: can one discussion improve a real decision, preserve its evidence and disagreements, and produce an action whose result changes the next discussion?

| Question | Assessment |
| --- | --- |
| Largest problem | Protocol names and role prompts are implemented, but executable method steps, source provenance, and full exchanges between generated resident turns remain incomplete. There is no measured advantage over a single well-prompted assistant. |
| How to continue | Ship one small, evidence-backed decision workflow. First make resident turns use actual earlier outputs, enforce one protocol recipe, and link claims to source material. Then complete action feedback and durable saving. Run a small comparison against a single assistant before expanding buildings or autonomous residents. |
| Current progress | A substantial React/TypeScript MVP with local AI gateway support, schema validation/repair, structured idea import, protocol metadata, discussion records, local caches, archive exports, and a successful Pages release. Production AI, a durable database, authentication, cross-device sync, and outcome validation remain open. |
| Release status | Latest audited code published as [dd949be](https://github.com/brocademaple/siwei-city/commit/dd949be0c626f35e4b137afa14e5e8fa053efadd). [Pages deployment succeeded](https://github.com/brocademaple/siwei-city/actions/runs/37259853525). The homepage and v2 map render in Comet. One live council round completed through local-template fallback. |

**Recommended starting use case:** an independent creator or builder deciding whether to pursue an idea. The output should contain a provisional judgment, its supporting evidence, the strongest unresolved objection, and one small experiment with a review date. This is a scope assumption for the next release, not a validated target-market finding.

## Related open-source projects and what to borrow

The landscape overlaps across argument mapping, model deliberation, source-based research, durable agent workflows, and simulated residents. No reviewed project establishes demand for Siwei City’s full combination. The comparisons below describe documented capabilities; external applications were not installed or benchmarked.

| Project / relationship | Useful pattern | Fit and boundary |
| --- | --- | --- |
| [Argdown](https://github.com/argdown/argdown) — direct argument-structure reference | Text-based argumentation, explicit relations, premise/conclusion structures, and map export. | Borrow stable claim IDs, typed argument relations, and a portable text representation. Retain Siwei City’s own UI. README states MIT; GitHub’s metadata did not identify a license. |
| [Argüman](https://github.com/arguman/arguman.org) — direct debate-map reference | Claims supported or challenged by premises; a visual hierarchy for collaborative argument analysis. | Borrow the clarity of support, objection, and qualification. API last push: 5 March 2022. Treat as a historical design reference. README states GPL-3.0-or-later. |
| [LLM Council](https://github.com/karpathy/llm-council) — direct council-flow reference | Independent model answers, anonymized peer ranking, then chair synthesis. | Borrow a distinct critique stage and expose original answers beside the synthesis. The author says it is an unsupported experiment. API did not identify a license; do not assume code is reusable. |
| [Multiagent Debate](https://github.com/composable-models/llm_multiagent_debate) — research baseline | Implementation accompanying research on factuality and reasoning through model debate. | Borrow experimental design and true exchange of previous responses. Research tasks do not establish usefulness for personal decisions. API did not identify a license. |
| [Open Notebook](https://github.com/lfnovo/open-notebook) — adjacent research workspace | Source organization, content ingestion, search, contextual chat, and provider choice. | Borrow source objects and links from generated claims to source passages. Its own comparison describes citations as basic; inspect that path before reuse. MIT. |
| [LangGraph](https://github.com/langchain-ai/langgraph) — infrastructure reference | Durable execution, persisted checkpoints, and [interrupt/resume for human review](https://docs.langchain.com/oss/python/langgraph/interrupts). | Borrow explicit run states, checkpoints, retries, and review boundaries. A framework migration is optional; first implement these contracts in the existing TypeScript runtime. MIT. |
| [Polis](https://github.com/compdemocracy/polis) — adjacent human deliberation | Collects human opinion and maps agreement patterns; [official project overview](https://compdemocracy.org/polis/). | Useful if the project later includes real participants. Simulated residents cannot substitute for actual stakeholder views. Defer large-group features. AGPL-3.0. |
| [Generative Agents / Smallville](https://github.com/joonspk-research/generative_agents) — adjacent city/resident simulation | A research simulation of believable agents in a game environment, with stored history and replay. | Useful for a later resident-memory experiment. It optimizes simulated behavior; Siwei City currently needs better deliberation and action feedback. Defer town simulation. Apache-2.0. |

Repository metadata snapshot on 5 October 2026: Argdown last push 10 September 2026; Open Notebook and Polis 5 October 2026; LangGraph 4 October 2026; LLM Council 22 November 2025; Multiagent Debate 24 April 2025. A recent push is an activity signal, not proof of support, correctness, adoption, or product fit. License labels above are inventory observations; inspect the actual license files before copying code.

**Community channels worth following:** [Argdown Discussions](https://github.com/argdown/argdown/discussions) for argument notation and mapping; [Open Notebook Discussions](https://github.com/lfnovo/open-notebook/discussions) for research-source workflows; and the [Computational Democracy project](https://compdemocracy.org/polis/) for human deliberation. They are places to investigate concrete integration questions. Community activity was not used as market validation.

## Why more agents alone will not solve the problem

[Improving Factuality and Reasoning through Multiagent Debate](https://github.com/composable-models/llm_multiagent_debate) supplies a useful research baseline. More recent [ACL 2026 research on confidence and diversity](https://aclanthology.org/2026.findings-acl.1694/) identifies weaknesses in vanilla debate and investigates diverse initial viewpoints and calibrated confidence. These results concern studied benchmark settings; they do not prove that a council improves open-ended personal decisions.

The implication for Siwei City is an inference: give roles different evidence and explicit reasoning tasks, preserve the strongest disagreement, and compare results with a simpler baseline. Do not use unanimous AI agreement as evidence that a claim is true. Separate a historical source that inspires a protocol from evidence that supports the user’s current claim.

## Verified progress and outstanding gaps

| Area | Implemented / verified | Remaining acceptance gate |
| --- | --- | --- |
| City and council UI | Eight building entrances, council seats, scene navigation, topic entry, map controls. Homepage video and v2 map inspected in Comet. | Desktop inspection covers the visible main path. Mobile, accessibility, every building, and all error states have not passed full UAT. |
| Agent gateway | [Gateway and runtime](https://github.com/brocademaple/siwei-city/blob/dd949be0c626f35e4b137afa14e5e8fa053efadd/src/lib/agents/agentRuntime.ts) support JSON output, schema checks, repair, and fallback. Local live probe returned valid structured content and provider usage: 294 input + 198 output = 492 tokens. | Probe verifies one gateway request, not a complete real-AI council. Public Pages uses local fallback; no external proxy is configured in repository variables. Zero configured token prices are estimates, not verified free service. |
| Resident exchanges | Role-specific requests, target idea references, and previous-turn summaries exist. | In [runOpeningAgents / buildResidentTurnMessages](https://github.com/brocademaple/siwei-city/blob/dd949be0c626f35e4b137afa14e5e8fa053efadd/src/lib/agents/agentRuntime.ts), requests still read opening.turns rather than the accumulating generated turns; the summaries omit prior response bodies. Later residents therefore lack the actual earlier generated argument text. |
| Discussion protocols | [Five protocols](https://github.com/brocademaple/siwei-city/blob/dd949be0c626f35e4b137afa14e5e8fa053efadd/src/lib/protocols.ts) and argument moves appear in turn schemas, inspector findings, reports, and traces. | Recipes lack enforced steps and source/step provenance. Keyword selection can overselect naming for broad words. The [July integration plan](https://github.com/brocademaple/siwei-city/blob/dd949be0c626f35e4b137afa14e5e8fa053efadd/docs/planning/thinking-content-integration-plan-2026-07-16.md) remains materially relevant. |
| Records and reports | Pending/confirmed/rejected records, report/action/process outputs, follow-up links, local caching, archive/copy/download paths. Live Pages round produced a pending record and action summary. | Confirmation, rejection, export/download, and browser refresh recovery still need dedicated UI regression checks. A suggested action lacks a fully verified result-to-evidence return loop. |
| Storage | [API-shaped storage](https://github.com/brocademaple/siwei-city/blob/dd949be0c626f35e4b137afa14e5e8fa053efadd/api/_cityStore.ts) and [PostgreSQL schema](https://github.com/brocademaple/siwei-city/blob/dd949be0c626f35e4b137afa14e5e8fa053efadd/db/siwei-city-schema.sql) exist. Isolated local HTTP checks passed save/read/archive/restore, record creation/status update, invalid-input rejection, and client separation. | Actual responses identify sql-api-memory. Process restart loses server state; serverless instances do not provide shared durable state. Browser client IDs provide namespacing, not authentication or authorization. |
| Checks | TypeScript/Pages build, current unit command, smoke command, and green-screen asset checks passed. | The unit command checks source-file existence/keywords. Smoke checks code strings and build structure. These checks do not replace behavioral schema tests or end-to-end acceptance. |
| Public traces | [Two latest sample traces](https://github.com/brocademaple/siwei-city/blob/dd949be0c626f35e4b137afa14e5e8fa053efadd/docs/trace-runs/latest-two-chain-runs.json) include protocol metadata and before/after inspection. | They explicitly use local templates and are dated 16 July 2026. They are demonstrative product traces, not live AI quality evidence. |
| Documentation | A broad PRD, mechanism, source index, storage design, handoff notes, and screenshots exist. | Older project-status text still says real-agent wiring and structured import are absent. It conflicts with newer code; use this audit and agent-runtime-and-storage.md for current implementation status. |

## Release and GitHub Pages audit

Before this task, local main and remote main were both at f933990, while substantial local edits and new runtime/storage/docs files were uncommitted. The last published workflow was successful on 20 June 2026. This task published the scoped project snapshot as 5496a62 (86 files), then dd949be to fix empty AI proxy settings and add a reproducible Pages check. Local secrets, imported packages, duplicate extracted assets, and skill drafts were excluded.

| Layer | Result / evidence |
| --- | --- |
| GitHub source | [Repository](https://github.com/brocademaple/siwei-city); [audited application commit dd949be](https://github.com/brocademaple/siwei-city/commit/dd949be0c626f35e4b137afa14e5e8fa053efadd). Push succeeded. |
| Actions build and deploy | [Latest code workflow 37259853525](https://github.com/brocademaple/siwei-city/actions/runs/37259853525) completed successfully. Earlier snapshot workflow 37259580309 also passed both build and deployment jobs. |
| Public routes | [Homepage](https://brocademaple.github.io/siwei-city/), [v1 archive](https://brocademaple.github.io/siwei-city/v1/), [v2 application](https://brocademaple.github.io/siwei-city/v2/) return HTTP 200. The release script compares deployed JS/CSS bytes with the local Pages build and checks the homepage hero. |
| Rendered application | Comet displayed the homepage/video, v2 city map and council. A complete discussion reached a pending record, summary and action output. It reported AI 0 seats / local 4 seats. This is a functioning fallback demo. |
| Production services | No repository Actions variables are configured. Default storage GET /api/cities/current returned 404; default AI POST /api/mimo/chat returned 405 on the Pages origin. [GitHub Pages is static hosting](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages); api/ files in the repository are not running services there. |
| Configuration fix | The workflow supplies an empty proxy variable when unset. Gateway now trims the value and falls back to /api/mimo/chat for empty input. This prevents the malformed empty destination; it does not create an AI backend. |

## Recommended next release: one decision with an evidence return

Use this workflow as the acceptance object: define the decision → choose one protocol → attach real source material → collect viewpoints → challenge specific claims → let the user select a provisional conclusion → define a small experiment → record the observed result → revise the next round. The city map can visualize the resulting structure.

| Priority / slice | Concrete work | Pass condition |
| --- | --- | --- |
| P0 — correct the reasoning exchange | Pass accumulated generated turns, their bodies, target claim IDs and evidence IDs into later requests. Bound context size. Keep unresolved disagreements in the report. | A deterministic two-turn test proves the second request contains the first generated response, and the response points to a valid claim. Invalid IDs fail validation. |
| P0 — one executable protocol | Start with elenchus: claim → admitted premises → counterexample/contradiction → revised claim. Add protocolStepId, evidenceStatus and source references. | A run visibly completes required steps, or identifies a missing step. Generated prose cannot be labeled sourced evidence without a resolvable source. |
| P0 — minimal source provenance | Allow a user to paste a source URL and excerpt or observation. Link claims to source records; distinguish method inspiration, observation, inference and unverified claim. | Every sourced factual statement in the pilot report opens its supporting passage. Unsupported statements remain clearly marked. |
| P0 — useful action feedback | Save an experiment with owner, due date, expected observation, actual result, and linked claim; create a follow-up record from that result. | A user can return days later, enter an outcome, and see which claim changes and why. The original record remains available. |
| P1 — durable single-user pilot | Choose one backend deployment; attach a real database to the existing API contract. Keep local export and migration. Add authentication, owner enforcement and request limits before broader exposure. | Save, restart/redeploy, reload, restore, and export preserve records. Cross-user access is rejected. A browser client ID alone cannot access another account. |
| P1 — public real-AI path | Deploy the server proxy and configure VITE_MIMO_PROXY_URL. If Pages is retained, also expose VITE_CITY_STORAGE_API_BASE in the workflow for external storage. Add timeouts, cancellation and bounded retries. | From the deployed app, one full round returns AI-backed valid turns, real usage, and provenance; gateway failure visibly falls back. No secret is bundled into the frontend. |
| P1 — behavioral verification | Replace keyword-only confidence with schema/runtime tests and one UI path for discussion → review → record → export → refresh → follow-up. | Tests execute the behavior, verify saved/exported content and rejection of invalid output, and run in CI. |
| P2 — broaden only after useful sessions | Expand protocols, residents, mobile layout or other buildings based on observed friction. | Users voluntarily return with a real result and can explain how the previous record helped their decision. |

**Suggested pilot:** 5 users, 2 real decision sessions each, plus 3 fixed regression topics. Compare Siwei City with one well-prompted assistant using the same evidence and model budget. Collect completion time, traceable claims, useful objections, actionable experiments, return with results, latency and token use. Proposed initial gates: at least 4/5 users finish an exportable first decision within 10 minutes; every displayed sourced claim resolves; at least 2/5 return with an experiment result. These are proposed learning gates, not measured outcomes or statistical proof.

## Scope choices and tradeoffs

| Option | Value / cost | Recommendation and reversal signal |
| --- | --- | --- |
| Keep the current demo | Lowest additional engineering cost; preserves a useful presentation artifact. It does not test decision improvement or repeat use. | Valid if the goal is a portfolio piece. Otherwise use only as the baseline. |
| Build the narrow decision loop | Moderate engineering effort for source contracts, actual exchanges, outcome records and a minimal durable backend. Best match to the current council/archive structure. | Recommended. If users prefer the baseline and do not return with results, reduce the council complexity or keep a simpler guided worksheet. |
| Expand city simulation and autonomous residents | Higher state, orchestration, content and operating costs. Could improve atmosphere, but decision value remains uncertain. | Defer. Reconsider only if research shows that resident continuity itself drives repeat, useful sessions. |
| Rebuild on a full agent framework | Adds migration and integration work alongside benefits in checkpointing and orchestration. | Borrow the contracts first. Adopt a framework when resumable long runs and tool use become concrete requirements. |

## Run and reproduce

The Desktop launcher is /Users/eee/Desktop/思维城邦.command. It starts the local app on port 5189 and opens Comet. The repository copy is [scripts/launch-siwei-city.command](https://github.com/brocademaple/siwei-city/blob/dd949be0c626f35e4b137afa14e5e8fa053efadd/scripts/launch-siwei-city.command). Use --pages to open the public application.

```bash
cd /Users/eee/Desktop/code/siwei-city
npm ci
VITE_MIMO_PROXY_URL='' npm run build:pages
npm run test:unit
npm run test:smoke
npm run check:assets
node scripts/verify-pages.mjs
# In one terminal:
npm run dev -- --host 127.0.0.1 --port 5173
# In another terminal, with the existing private .env.local configured:
npm run verify:ai-gateway -- --url=http://127.0.0.1:5173/api/mimo/chat
```

The empty proxy value above reproduces the current CI setting. The Pages verifier tests network/build delivery; browser checks cover rendered behavior. The gateway probe and storage checks in this review ran against Vite development middleware. Deployed serverless functions and durable database behavior have not been accepted.

## Sources and evidence limits

Project evidence: [agent runtime](https://github.com/brocademaple/siwei-city/blob/dd949be0c626f35e4b137afa14e5e8fa053efadd/src/lib/agents/agentRuntime.ts), [protocol model](https://github.com/brocademaple/siwei-city/blob/dd949be0c626f35e4b137afa14e5e8fa053efadd/src/lib/protocols.ts), [city store](https://github.com/brocademaple/siwei-city/blob/dd949be0c626f35e4b137afa14e5e8fa053efadd/api/_cityStore.ts), [current implementation notes](https://github.com/brocademaple/siwei-city/blob/dd949be0c626f35e4b137afa14e5e8fa053efadd/docs/current/agent-runtime-and-storage.md), [thinking-content integration plan](https://github.com/brocademaple/siwei-city/blob/dd949be0c626f35e4b137afa14e5e8fa053efadd/docs/planning/thinking-content-integration-plan-2026-07-16.md), [public template traces](https://github.com/brocademaple/siwei-city/blob/dd949be0c626f35e4b137afa14e5e8fa053efadd/docs/trace-runs/latest-two-chain-runs.json), and the Actions/live links above. [Existing personal PRD](https://my.feishu.cn/docx/ZJibdjskaojKC3x2gMcc9uZJnGz) is retained for continuity; this report audits current implementation rather than declaring that PRD fully accepted.

Method: inspect the current project, query GitHub metadata and workflow status, run the project’s build/check commands, probe local services with isolated synthetic data, inspect primary external sources, and exercise the live desktop demo. Findings about gaps are code-backed assessments. Product positioning and next-release gates are recommendations. No exhaustive ecosystem survey, external deployment benchmark, mobile UAT, user-retention measurement, or market-demand study is claimed.

Published personal Feishu document: [English review](https://my.feishu.cn/docx/H5kmdCrCVoHtjcxwWYoct6EZnQg)
