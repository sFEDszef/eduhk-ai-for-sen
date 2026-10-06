# AI for Inclusive Mathematics

**MVP v0.3 — Bilingual Interface & DOCX Export**

A GenAI tool to tailor early primary mathematics materials for students with dyslexia.
EdUHK · EDS6019 – AI for Teaching and Learning · Group 8 – AI for SEN.

Production: https://ai-sen.vercel.app/

Existing private repository: https://github.com/sFEDszef/eduhk-ai-for-sen

## Purpose

Support Hong Kong P1–P3 mathematics teachers in adapting reading demands, presentation and scaffolding while retaining the learning objective and mathematical challenge. Use anonymous instructional needs only. **AI assists. Teachers decide.** All materials are AI-generated drafts requiring teacher review before classroom use.

## Local development

Next.js 16.3.8, React 19, TypeScript, Tailwind CSS 4, Zod, npm and the `docx` library. Node.js >=20.9; Node 24 recommended.

```sh
npm ci
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000. Pages: `/`, `/create`, `/about`. Server endpoint: `POST /api/generate`.

```sh
npm run lint
npm test
npm run build
npm start
```

Production builds use Next.js's Webpack option; the local sandbox previously prevented Turbopack workers from opening a port.

## Server environment

| Variable | Purpose | DeepSeek setting |
| --- | --- | --- |
| AI_PROVIDER | Provider selector | `deepseek` |
| AI_MODEL | Model identifier | `deepseek-chat` |
| AI_BASE_URL | HTTPS root; `/chat/completions` is appended | `https://api.deepseek.com` |
| AI_API_KEY | Secret credential | Configure privately |

These are read at server request time. Never use a `NEXT_PUBLIC_` key, hard-code credentials or enter keys into teaching forms. OpenAI-compatible providers remain supported by the existing adapter. Missing configuration fails visibly; no fabricated response is substituted.

The linked Vercel project is **ai-sen**. Push to `main` to deploy through its existing GitHub integration; do not create another project or repository. Verify that the latest deployment is Ready and assigned to `ai-sen.vercel.app`. Environment changes require a new deployment. At the last metadata inspection the key was scoped to Production only; other environments require their own configuration.

## Generation architecture

Teacher input → Zod validation → learner support profile → local RAG → pedagogy agent → content agent → review agent → structured draft → teacher review.

- `lib/knowledge/retrieval.ts` ranks and selects seven relevant chunks by objective, topic, grade and support profile. Only selected chunks enter agent contexts. This is local retrieval without embeddings or an external vector database.
- Knowledge files distinguish official source summaries from project design principles. They are not curriculum certification.
- All three agents execute sequentially in both Standard and Enhanced Pedagogical Support modes.
- `lib/validation/schemas.ts` validates requests and outputs. Objective, grade, topic and material type must echo the request. Worksheet identifiers must be unique.
- `lib/validation/math.ts` additionally checks original quantities and the first answer for simple two-quantity subtraction worksheets, including the acceptance case `43 − 18 = 25`. More complex mathematics remains subject to the review agent and teacher checking.
- `lib/validation/language.ts` rejects Chinese or bilingual drafts missing Chinese support in the main student-facing fields. Bilingual student problems must contain both English and Chinese.
- The provider is server-only, uses HTTPS, caps output at 6,500 tokens per agent, times out each request after 80 seconds and performs JSON extraction/schema validation. No unlimited retries.
- The API bounds request bodies at 16,000 characters, objectives at 600 and original material at 3,000, and streams actual execution stages through NDJSON.
- The review status remains `review_required`. Automated checks never constitute classroom approval.

## Independent interface and material languages

Interface: **English / 繁體中文**. Generated materials: **English / 繁體中文 / Bilingual**.

`lib/i18n/en.ts` and `zh-HK.ts` provide matching typed dictionaries. A lightweight React context translates navigation, pages, labels, helper text, privacy notices, loading stages, errors and review controls. The header language choice is persisted under the versioned localStorage key `ai-sen.ui-language.v1`; blocked storage does not prevent switching. No teaching input or generated draft is persisted.

The separate form field `outputLanguage` accepts `en`, `zh-HK` or `bilingual`; legacy requests default to `en`. It passes through the request schema and each agent's `teacherInput`. Prompts require British English, Hong Kong Traditional Chinese, or concise English instructions with Traditional Chinese support lines and paired vocabulary. Numbers, operations, quantities, relationships and answers must remain unchanged.

`learningObjective` retains the teacher's exact input for validation. `displayLearningObjective` presents the same objective in the selected material language. Changing the interface language does not translate either user input or generated content. Retrieved source excerpts remain in their original source language; their category labels are translated.

## Compact review and export

The review shows input summary, retrieved knowledge, strategy, material preview, automated quality review, rationale and export actions. Worksheet previews contain title, objective, student instructions, vocabulary and the first two questions. Lesson previews show warm-up and the beginning of guided practice; game previews show materials and rules. Full drafts and detailed checks are collapsed by default. The configuration form folds away after successful generation.

- **Download DOCX** submits the existing input, material and review JSON to same-origin `POST /api/export/docx`. The server validates the bounded payload and uses `lib/export/docx.ts` to return a real Word OOXML attachment. This is a formatting request only: no provider call, agent execution, saved history or database. Native HTTP attachments support browsers that do not expose completed blob downloads.
- **Copy Content** uses the same reusable export blocks to copy the complete readable document, with feedback.
- **Regenerate** uses the current form settings, locks concurrent submissions, disables result actions while busy and makes no automatic retry.
- **Edit Settings** reveals the existing form without resetting fields. Arbitrary document editing is not supported.

DOCX includes all questions or all lesson/game phases, differentiation, rationale, teacher notes, automated review and the teacher-review notice. Worksheets insert a page break before the teacher-only answers and notes. Export headings follow `outputLanguage`; bilingual headings pair English and Traditional Chinese. Arial and an East Asian Word font setting are referenced without bundled font files or downloads. Filenames are sanitised and capped, for example `P2_Subtraction_Worksheet_EN.docx`, `P2_減法_工作紙_ZH.docx`, and `P2_Subtraction_Worksheet_Bilingual.docx`.

## Privacy and limits

Do not enter student names, IDs, full IEPs, medical information or diagnostic reports. Convert relevant support recommendations into anonymous instructional needs. Inputs go to the configured external AI provider; its processing policies apply. No database, accounts, saved profiles, analytics, uploads, PDF, generated images or speech are included. `.env.local` and `.vercel/` remain ignored. Application code does not log prompts or secrets; browser rendering uses escaped text.

The curated knowledge base is limited and no formal classroom evaluation has been conducted. AI can make linguistic and mathematical errors. The language guard checks for Chinese support in the main student-facing fields and rejects English sentence runs in Chinese-only mode; it does not certify translation quality or every Traditional Chinese character. The deterministic subtraction guard is deliberately narrow and cannot certify all questions or visual suggestions. Teachers must verify answers, representations and curriculum suitability. The public prototype has no durable distributed rate limit; same-origin checks are not authentication.

The existing development-only ESLint dependency audit reports five entries stemming from `braces <=3.0.3`, with no patched registry version at inspection time. No forced tooling downgrade was applied.

## Tests and development history

The 30-test suite covers provider boundaries and protocol, route validation, retrieval, JSON/schema handling, all three material workflows, objective drift, dictionary coverage, language request propagation, original subtraction integrity, filename sanitisation, export-route validation and its no-AI-call guarantee, and real DOCX archive/content generation for three material types in three language modes. Fixture tests do not establish live model correctness; production acceptance runs are separately performed.

### v0.3 production acceptance (2026-10-06)

- `npm run lint`, `npm test` (30/30), and `npm run build`: passed after the final DOCX pagination correction.
- Live DeepSeek P2 worksheet generation passed separately in English, Hong Kong Traditional Chinese and bilingual mode. Every original problem retained `43 − 18 = 25`, the exact requested objective, seven retrieved chunks, the three-agent workflow and `review_required`. All five worksheet answers in each final run were independently recomputed.
- The live bilingual result was downloaded through the production browser's **Download DOCX** button. The final 15,975-byte file is a valid OOXML ZIP, contains all five questions and teacher answers, a teacher-section page break, and the review-required notices. Its 13 rendered pages were visually checked with installed system fonts; notices remain together. This is not a Microsoft Word application test.
- English and Chinese live drafts were also exported through the production route and their archives/content verified. Lesson/game exports in all three languages are fixture-tested; this phase's live language acceptance used worksheets.
- Production Home, Create and About language switching, compact two-question preview, collapsed full draft, preserved Edit Settings, regeneration busy state and completion, and Copy Content feedback were checked. Browser clipboard contents could not be independently read through the test tool's virtual clipboard; complete plain-text export is covered by automated tests.
- Desktop (1280 × 900) and mobile (390 × 844) rendering had no horizontal overflow or browser console errors. Production request metadata showed successful generation/export requests and no runtime error records during the acceptance window.

- **v0.1:** Initial application, local RAG and agent architecture.
- **v0.2:** Live DeepSeek integration and production validation; original P2 subtraction preserved `43 − 18 = 25`. Temporary diagnostic routes removed.
- **v0.3:** English / Traditional Chinese UI, multilingual material generation, compact review and DOCX export.

Earlier production diagnosis and deployment timing evidence: [production-ai-diagnosis.md](docs/production-ai-diagnosis.md). The older [live-validation.md](docs/live-validation.md) describes the historical pre-key state.

## Knowledge sources

- [EDB primary mathematics resources](https://www.edb.gov.hk/en/curriculum-development/kla/ma/res/pri/index.html)
- [EDB SENSE dyslexia support measures](https://sense.edb.gov.hk/en/types-of-special-educational-needs/specific-learning-difficulties/support-measures.html)
