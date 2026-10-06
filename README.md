# AI for Inclusive Mathematics

**A GenAI Tool to Tailor Early Primary Mathematics Materials for Students with Dyslexia**

EdUHK · EDS6019 – AI for Teaching and Learning · Group 8 – AI for SEN.

## Educational problem and target users

Hong Kong mainstream P1–P3 mathematics teachers need to prepare differentiated materials within limited time, often without specialist SEN design expertise. This educational prototype supports the Whole School Approach to integrated education through anonymous instructional needs. It preserves the mathematics learning objective while adjusting reading load, representation and scaffolding. **AI assists. Teachers decide.**

## Stack and local development

Next.js 16.3.8 stable, App Router, React 19, TypeScript, Tailwind CSS 4, Zod, native server-side fetch, npm and Git. No database, authentication, analytics or autonomous agent framework.

Node.js >=20.9 (Node 24 recommended):

```sh
npm install
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000. Routes: `/`, `/create`, `/about`, and server-only `POST /api/generate`.

```sh
npm run lint
npm test
npm run build
npm start
```

## Environment variables

Set these only on the server or in Vercel settings. Never use a `NEXT_PUBLIC_` key.

| Variable    | Meaning                                         | DeepSeek example           |
| ----------- | ----------------------------------------------- | -------------------------- |
| AI_PROVIDER | `deepseek`, `openai`, or `compatible`           | `deepseek`                 |
| AI_MODEL    | Provider model identifier                       | `deepseek-chat`            |
| AI_API_KEY  | Secret provider API key                         | Set privately              |
| AI_BASE_URL | HTTPS API root; `/chat/completions` is appended | `https://api.deepseek.com` |

For OpenAI use `AI_PROVIDER=openai`, a supported Chat Completions model and `AI_BASE_URL=https://api.openai.com/v1`. Compatible providers must support JSON object responses. No API key is bundled. Missing configuration produces a clear setup message; the app never silently substitutes fabricated AI output.

## Generation workflow

Teacher input → validation → anonymous Learner Support Profile → knowledge retrieval → pedagogy agent → content agent → review agent → structured material → teacher review.

- `lib/ai/provider.ts`: one server-only OpenAI-compatible adapter, with provider-specific defaults, HTTPS configuration checks, timeouts and safe errors. No browser access to keys.
- `lib/knowledge/retrieval.ts`: **lightweight local RAG**. It filters documents by grade, scores topic matches, support types, output type, scaffolding and query keywords, then selects seven chunks. Objective preservation is always prioritised. Only selected chunks are injected into all three agents’ contexts. This is actual retrieval/augmentation, not one large static prompt, and does not use embeddings.
- `lib/knowledge/data/*.json`: separate curriculum context, dyslexia, pedagogy and word-problem documents. Each includes metadata, content, source and provenance. Official summaries are paraphrases; project principles are explicitly labelled. No invented curriculum quotations or grade-level official attainment claims.
- `lib/agents/`: three sequential TypeScript functions and an orchestrator. Standard and enhanced modes affect pedagogical detail. All three agents run in both modes. Content is rejected if objective, grade, topic or material type changes.
- `lib/prompts/`: shared safeguards and task-specific instructions. Original questions are data, not trusted instructions; quantities and mathematical relationships must be preserved.
- `lib/validation/schemas.ts`: input and all output schemas. The provider sends a JSON schema, extracts JSON with a fenced/prose fallback, and validates before rendering. Invalid drafts fail cleanly.
- `app/api/generate/route.ts`: bounded input, same-origin check, server-side generation and NDJSON stages. Stage labels represent actual execution; no fake percentage. Maximum duration 300 seconds (hosting plan limits may differ).
- `components/review/review-panel.tsx`: input summary, retrieved sources, strategies, rationale, material, teacher-only answer disclosures and automated checks. Review always remains required.

## Knowledge sources

- [EDB primary mathematics resources](https://www.edb.gov.hk/en/curriculum-development/kla/ma/res/pri/index.html)
- [EDB SENSE dyslexia support measures](https://sense.edb.gov.hk/en/types-of-special-educational-needs/specific-learning-difficulties/support-measures.html)

Entries were curated for this prototype on 6 October 2026. Teachers must confirm current curriculum sequencing and local applicability. The knowledge base is not an official curriculum database or a certified evidence synthesis.

## Privacy and security

Do not enter student names, IDs, full IEPs, medical information, diagnostic reports or other identifying information. Translate relevant IEP recommendations into anonymous instructional needs. Inputs are transmitted to the configured external provider; that provider’s retention and processing policies apply. This app has no database and no saved student profiles. Application code does not log prompts or secrets. React safely renders text, with no raw HTML injection. `.env.local` and `.vercel` are ignored by Git.

There is no account system or durable distributed rate limit in V1. Before broadly sharing an API-enabled deployment, set provider spending limits and hosting-level abuse controls. Same-origin validation is a browser safeguard, not authentication. Do not put API keys into submitted form fields.

## Deployment to Vercel

1. Push this repository to a **private** GitHub repository named `eduhk-ai-for-sen`.
2. In Vercel, choose **Add New → Project**, import that repository and accept the Next.js preset. If using this standalone repo, the root is `.`.
3. Add `AI_PROVIDER`, `AI_MODEL`, `AI_API_KEY`, `AI_BASE_URL` to Production (and Preview if required). Keep the key secret.
4. Deploy. After changing variables, open Deployments → the latest deployment → **Redeploy**. Existing deployments do not inherit new values automatically.

Alternatively, authenticated CLI: `vercel link`, configure variables privately, then `vercel --prod`. No credentials are committed. Without a key, pages work but real generation awaits configuration.

## Testing and limitations

`npm test` exercises invalid inputs, metadata retrieval, JSON fallback/schema failures, all three orchestration branches with an injected test provider, and objective-drift rejection. These tests do not prove live LLM correctness. Browser QA should cover home, create, validation, missing-key errors, desktop/mobile, and all structured review renderers using clearly labelled test fixtures. A live provider run must be separately verified after an API key is configured.

This is a prototype with a small curated knowledge base, English output and no formal classroom evaluation. AI can produce wrong answers and hallucinations; automated AI review can miss them. Neither diagnosis nor SEN assessment nor IEP generation is supported. Suggestions for visuals and verbal prompts require teacher implementation. The tool does not replace teacher judgement.

Future development: expand verified official curriculum mappings, larger knowledge corpus, semantic retrieval, optional document ingestion, other subjects, teacher feedback, material export and classroom evaluation. The best next step is a teacher-supervised evaluation of real generated drafts after configuring a provider key.

## Verified local status (6 October 2026)

- `npm install`, `npm run lint`, `npm test` (10 tests) and `npm run build` passed.
- Build uses Next.js's supported Webpack option because Turbopack's CSS worker could not bind a local port in this execution environment.
- Playwright checked the production app at 1440×1000 and 390×844: home, navigation, required input, missing-key error, invalid API input, all three review renderers with test fixtures, no mobile horizontal overflow and no relevant console errors. Screenshots were inspected for layout, typography, spacing, colours and form/review readability. No AI image generation was used, as excluded from V1.
- Client build assets contain no `AI_API_KEY`, `AI_BASE_URL` or test credential string.
- `npm audit --omit=dev`: zero production vulnerabilities. Full audit reported five high-severity entries stemming from the ESLint tooling's `braces <=3.0.3` dependency; registry latest was still 3.0.3. No forced downgrade of Next.js tooling was applied.
- GitHub CLI and Vercel CLI were checked: both were logged out. Repository creation/push and production deployment remain pending authentication.
- Provider protocol and error handling were tested with intercepted fetch responses. **No live LLM request has been verified**, because no API key was supplied.

### Authentication in this execution environment

GitHub CLI was obtained from its official release into temporary storage:
```sh
/tmp/eduhk-tools/gh_2.102.0_macOS_arm64/bin/gh auth login
```
After authentication, run from this project directory:
```sh
/tmp/eduhk-tools/gh_2.102.0_macOS_arm64/bin/gh repo create eduhk-ai-for-sen --private --source=. --remote=origin --push
```
If this temporary CLI has been removed, install GitHub CLI and use `gh` in place of the absolute path.

The desktop bundle provides Node.js, and npm was downloaded to temporary storage. To run here while that tooling is present:
```sh
export PATH="/Users/lsn666/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH"
node /tmp/eduhk-tools/package/bin/npm-cli.js run dev
```
Vercel CLI was checked using:
```sh
node /tmp/eduhk-tools/package/bin/npm-cli.js exec --yes --package=vercel -- vercel whoami
```
Use the same command with `login` in place of `whoami` to authenticate, then import the private GitHub repository and configure the four environment variables as described above.
