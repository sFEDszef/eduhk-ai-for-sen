> Historical pre-key record. Live production validation subsequently passed; see [production-ai-diagnosis.md](production-ai-diagnosis.md).

# Production validation record — 6 October 2026

## Deployment and configuration
- Existing Vercel project renamed from `eduhk-ai-for-sen` to `ai-sen`.
- Project ID before and after: `prj_b2hWlEELHqVZsOOaAjO4M0EgVVGq`.
- Primary demonstration URL: https://ai-sen.vercel.app/.
- Original production alias retained; GitHub repository and integration unchanged.
- CLI inspection and browser domain configuration verified; no duplicate project created.
- `AI_PROVIDER`, `AI_MODEL`, `AI_BASE_URL`: configured in Production and Preview.
- `AI_API_KEY`: missing. Provider defaults/configuration: DeepSeek / deepseek-chat.
- AI_API_KEY is required before live API validation.

## Fixed acceptance request
- Grade: P2; topic: Subtraction.
- Objective: Students can solve two-digit subtraction word problems within 100.
- Reading support: High; instruction length: One Step at a Time.
- Visual support: High; audio support: Helpful; scaffolding: High.
- All six additional instructional needs selected.
- Output: Worksheet; mode: Enhanced Pedagogical Support.
- Original: Amy has 43 stickers. She gives 18 stickers to Ben. How many stickers does Amy have left?
- Independent reference calculation: 43 − 18 = 25. This is the expected answer, **not a generated result**.

## Actual production observation
Home → Create → fixed input → Generate returned:
“Generation is awaiting an API key. Configure the server’s AI environment variables, then try again.”

Generation stopped before RAG/agents because provider creation checks configuration first. No production pedagogy output, worksheet or quality review was produced. Thus numerical correctness, mathematical challenge preservation and output-level rationale are not yet verified.

## Local retrieval diagnostic for the identical request
These are metadata-only local diagnostics; they are not evidence that a production model consumed the context.

| Retrieved ID | Category | Score |
| --- | --- | ---: |
| objective-preservation | Objective preservation | 32 |
| word-structure | Word-problem representation | 24 |
| adapt-original | Existing material adaptation | 22 |
| place-value | Mathematical representation | 21 |
| language | Reduced linguistic load | 14 |
| multi | Multisensory learning | 14 |
| edb-support | Dyslexia support | 13 |

Code inspection confirms retrieved chunks are passed to pedagogy, content and review agent contexts; existing injected-provider tests verify this. Each chunk is applicable to P2 by metadata. The curriculum corpus is a prototype and does not certify official grade-specific attainment.

## Remaining live acceptance checks
After the teacher/project owner adds the key and a new production deployment is ready:
1. Resubmit this exact production request once; do not automatically retry.
2. Record selected pedagogy strategies and profile-specific rationale.
3. Verify five validated worksheet questions, objective echo, concise directions, vocabulary, intermediate steps, hints and visual suggestions.
4. Verify question 1 retains 43 and 18 and answers 25. Independently recalculate every other answer; confirm two-digit subtraction within 100 is retained.
5. Confirm the separate review agent checks arithmetic, objective/grade, reading complexity, challenge, scaffolding and possible errors, with status `review_required`.
6. Confirm the teacher-review warning, input summary, retrieved support, strategies, material, rationale and review all appear on the live site.
7. Check production logs for provider, timeout and parsing failures using safe metadata only.
8. Only after all checks pass, mark MVP v0.2 — Live AI Integration.

V1 has no dedicated Regenerate, Edit material, Copy or Back to Settings buttons. Input fields remain on the same page; the existing Generate button supports manual resubmission. No new UI features were added in this phase.

## Production log check
For the fixed request on `ai-sen.vercel.app`, Vercel request metadata recorded `POST /api/generate` with HTTP **503**, level `info`, and no nested runtime log entries. This matches the missing-key configuration response. No parsing or provider request occurred. Static page requests in the sampled interval succeeded. This observation does not establish model timeout/error behaviour under a live provider.

## Verification and phase changes
`npm run lint`, `npm test` (10 tests) and `npm run build` passed again in this phase. Provider and route safeguards required no code change. Only README and this validation record were updated; MVP v0.2 remains pending.
