import curriculum from "./data/hk-maths-curriculum.json";
import dyslexia from "./data/dyslexia-support.json";
import pedagogy from "./data/pedagogical-principles.json";
import words from "./data/word-problem-support.json";
import type { KnowledgeItem, RetrievedChunk } from "./types";
import type { TeacherInput } from "@/types/generation";
const items = [
  ...curriculum,
  ...dyslexia,
  ...pedagogy,
  ...words,
] as KnowledgeItem[];
// Local RAG: rank separate curated documents, then inject only selected chunks.
// This is metadata/keyword retrieval, not semantic embeddings or a static mega-prompt.
export function retrieveKnowledge(input: TeacherInput): RetrievedChunk[] {
  const support = new Set<string>();
  if (
    input.profile.readingSupport !== "Low" ||
    input.profile.needs.some((n) => /reading|words/.test(n))
  )
    support.add("reading");
  if (
    input.profile.visualSupport !== "Low" ||
    input.profile.needs.some((n) => /visual/.test(n))
  )
    support.add("visual");
  if (
    input.profile.scaffolding !== "Low" ||
    input.profile.needs.some((n) => /step-by-step/.test(n))
  )
    support.add("scaffolding");
  if (
    input.profile.instructionLength !== "Standard" ||
    input.profile.needs.some((n) => /instructions/.test(n))
  )
    support.add("instructions");
  if (input.profile.audioSupport !== "Not Needed") support.add("audio");
  if (input.profile.needs.some((n) => /manipulatives/.test(n)))
    support.add("manipulatives");
  const keywords = new Set(
    (input.learningObjective + " " + input.originalMaterial)
      .toLowerCase()
      .match(/[a-z]{4,}/g) ?? [],
  );
  return items
    .filter((k) => k.grade.includes(input.grade))
    .map((k) => ({
      ...k,
      score:
        2 +
        (k.topic.includes(input.topic) ? 8 : k.topic.includes("all") ? 1 : 0) +
        k.supportType.reduce((s, t) => s + (support.has(t) ? 3 : 0), 0) +
        (k.outputType.includes(input.outputType) ? 2 : 0) +
        (k.scaffolding.includes(input.profile.scaffolding) ? 2 : 0) +
        [...keywords].filter((v) => k.content.toLowerCase().includes(v))
          .length +
        (k.id === "objective-preservation" ? 20 : 0) +
        (k.id === "adapt-original" && input.originalMaterial ? 12 : 0),
    }))
    .sort((a, b) => b.score - a.score || a.id.localeCompare(b.id))
    .slice(0, 7);
}
