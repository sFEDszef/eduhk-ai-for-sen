# Production AI diagnosis and v0.2 validation

Date: 6 October 2026 (Asia/Hong_Kong).
Production: https://ai-sen.vercel.app/.
Existing project: `ai-sen`, ID `prj_b2hWlEELHqVZsOOaAjO4M0EgVVGq`.
Repository: https://github.com/sFEDszef/eduhk-ai-for-sen.

## Root cause supported by production evidence
The missing-key message comes from `lib/ai/provider.ts`, inside `createProvider()`:
`const key = process.env.AI_API_KEY; if (!key)` throws a `missing_key` error; `app/api/generate/route.ts` returns it as HTTP 503.

There was no key-name mismatch, no module-scope key capture and no client-side key check. The provider reads all four environment variables at server request time. Requests go to `https://api.deepseek.com/chat/completions` with the configured `deepseek-chat` model and server-only Bearer authentication.

Recorded 503 requests at 11:04:30, 11:05:21, 11:07:39 and 11:09:00 were served by the old deployment `dpl_6aMvSN9krzn8RBY65hyepzHsD224`, created before the key was configured. The new deployment `dpl_476zvbhtzLuArgBZeEWVyPkTiSTi` started at 11:08:46 and took 42 seconds to build plus 16 seconds post-build. The 11:09:00 request therefore still reached the old production deployment. The later CLI inspection showed the new deployment Ready and assigned to `ai-sen.vercel.app`.

This explains the recorded missing-key responses. No subsequent missing-key response was reproduced against the current runtime. The prior error displayed in an already-open page was not evidence of the new deployment failing. No new key, renamed variable or hard-coded credential was needed.

## Production environment and connectivity
CLI environment metadata confirmed all four names PRESENT in Production. The key was scoped to Production only at inspection time; the other three variables were in Production and Preview. No values or key fragments/lengths were printed.

Temporary, dynamic, server-only `/api/debug/env` returned only:
```json
{"aiApiKeyPresent":true,"aiProviderPresent":true,"aiModelPresent":true,"aiBaseUrlPresent":true}
```
The route returned HTTP 200 on production. A separate temporary fixed provider test sent `Return exactly: API_OK` with `max_tokens: 16`. DeepSeek returned HTTP 200, with the response exactly `API_OK`. No authorisation header or secret was logged or returned. Both temporary diagnostic endpoints were deleted after testing; they are absent from the final production build.

## Real browser end-to-end test
A fresh production page was used: Home → Create → complete the fixed request → Generate → actual server/provider calls → rendered teacher review. No fixture response or mocked provider was used.

Input: P2 / Subtraction; objective `Students can solve two-digit subtraction word problems within 100.`; reading High; instructions One Step at a Time; visual High; audio Helpful; scaffolding High; all six needs selected; Worksheet; Enhanced Pedagogical Support. Original question: Amy has 43 stickers. She gives 18 stickers to Ben. How many stickers does Amy have left?

RAG selected the following chunks, passed through the existing agent workflow:

| ID | Category | Score |
| --- | --- | ---: |
| objective-preservation | Objective preservation | 32 |
| word-structure | Word-problem representation | 24 |
| adapt-original | Existing material adaptation | 22 |
| place-value | Mathematical representation | 21 |
| language | Reduced linguistic load | 14 |
| multi | Multisensory learning | 14 |
| edb-support | Dyslexia support | 13 |

The live pedagogy plan selected short separated sentences, highlighted 43/18 and the action word, tens/ones counters with explicit regrouping, number-line jumps, known–change–unknown representation, vocabulary support, teacher-read prompts and hands-on practice. Its rationale explicitly connected those adaptations to the selected support profile. The retrieved guidance contributed to the generated plan and worksheet.

The content agent produced five structured questions, vocabulary, intermediate steps, hints, visual suggestions, teacher notes, differentiation notes and rationale. Teacher answers were expanded in the actual UI and independently recomputed:

| Question | Arithmetic | Generated answer | Independent check |
| --- | --- | --- | --- |
| 1 (original) | 43 − 18 | 25 stickers | Correct |
| 2 | 52 − 27 | 25 marbles | Correct |
| 3 | 61 − 34 | 27 apples | Correct |
| 4 | 75 − 28 | 47 children | Correct |
| 5 | 90 − 46 | 44 cakes | Correct |

All five retain two-digit subtraction within 100, with regrouping. Original quantities, units and mathematical relationships were preserved. High scaffolding provides worked intermediate results; teachers may remove those when independent practice is intended.

The separate review agent returned arithmetic, original-quantity, objective, challenge, reading-load, grade, scaffolding, hallucination/curriculum, visual/audio and other checks. Its status is constrained and validated as `review_required`. It flagged repeated answers and teacher context considerations. Those AI suggestions are not a verified curriculum assessment or approval. The UI showed `AI-Generated Draft`, `Teacher Review Required Before Classroom Use`, input summary, retrieved support, strategy, material, rationale and automated review.

## Security and usage controls
Server-only provider; no `NEXT_PUBLIC_AI_API_KEY`, browser DeepSeek call, secret-bearing props or logging. `.env.local` and `.vercel/` remain ignored. Input schema limits, 16,000-character request limit, 6,500-token per-agent output cap, 80-second request timeout, schema validation/JSON extraction and no automatic retry loop remain in place. No database or account system was added.

## Verification limits
This is one real worksheet acceptance test, not a classroom evaluation or evidence that every future model output will be correct. Teachers must review content and answers. The complete local test suite and production build are run after removal of diagnostics. Production logs are checked using request/status metadata and error counts only.
