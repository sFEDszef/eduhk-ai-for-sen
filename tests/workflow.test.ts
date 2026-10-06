import { test } from "node:test";
import assert from "node:assert/strict";
import {
  inputSchema,
  materialSchema,
  reviewSchema,
} from "../lib/validation/schemas";
import { retrieveKnowledge } from "../lib/knowledge/retrieval";
import { parseModelJSON } from "../lib/ai/json";
import { orchestrate } from "../lib/agents/orchestrator";
import type { AIProvider } from "../lib/ai/types";
import { input, plan, worksheet, lesson, game, review } from "./fixtures";
test("input validation rejects missing objectives and out-of-scope grades", () => {
  assert.equal(inputSchema.safeParse({ ...input, grade: "P4" }).success, false);
  assert.equal(
    inputSchema.safeParse({ ...input, learningObjective: "" }).success,
    false,
  );
  assert.equal(
    inputSchema.safeParse({ ...input, originalMaterial: "x".repeat(3001) })
      .success,
    false,
  );
});
test("RAG ranks objective preservation, original adaptation and relevant supports", () => {
  const chunks = retrieveKnowledge(input);
  assert.equal(chunks.length, 7);
  assert.equal(chunks[0].id, "objective-preservation");
  assert.ok(chunks.some((k) => k.id === "adapt-original"));
  assert.ok(chunks.some((k) => k.id === "place-value"));
  const shapes = retrieveKnowledge({
    ...input,
    topic: "Shapes",
    originalMaterial: "",
    learningObjective: "Identify and compare basic shapes.",
  });
  assert.notDeepEqual(
    chunks.map((k) => k.id),
    shapes.map((k) => k.id),
  );
});
test("robust JSON parsing accepts fenced and surrounded objects; rejects malformed schemas", () => {
  assert.equal(
    parseModelJSON(
      "```json\n" + JSON.stringify(worksheet) + "\n```",
      materialSchema,
    ).type,
    "worksheet",
  );
  assert.equal(
    parseModelJSON(
      "Here is the draft: " + JSON.stringify(worksheet),
      materialSchema,
    ).type,
    "worksheet",
  );
  assert.throws(() => parseModelJSON('{"type":"worksheet"}', materialSchema));
  assert.equal(
    reviewSchema.safeParse({ ...review, status: "safe for classroom use" })
      .success,
    false,
  );
});
for (const [type, material] of [
  ["worksheet", worksheet],
  ["lesson_plan", lesson],
  ["game_activity", game],
] as const) {
  test(`three agents execute in sequence for ${type}, receiving retrieved context`, async () => {
    let calls = 0;
    const contexts: unknown[] = [];
    const ai: AIProvider = {
      async generate(_system, context, schema) {
        contexts.push(context);
        return schema.parse([plan, material, review][calls++]);
      },
    };
    const stages: string[] = [];
    const result = await orchestrate({ ...input, outputType: type }, ai, (s) =>
      stages.push(s),
    );
    assert.equal(calls, 3);
    assert.equal(stages.length, 5);
    assert.equal(result.material.type, type);
    assert.equal(result.review.status, "review_required");
    for (const c of contexts)
      assert.ok(
        (c as { retrievedKnowledge: unknown[] }).retrievedKnowledge.length > 0,
      );
  });
}
test("objective drift stops generation before review", async () => {
  let calls = 0;
  const ai: AIProvider = {
    async generate(_s, _c, schema) {
      return schema.parse(
        [plan, { ...worksheet, learningObjective: "Single-digit subtraction" }][
          calls++
        ],
      );
    },
  };
  await assert.rejects(() => orchestrate(input, ai), /changed/);
  assert.equal(calls, 2);
});
