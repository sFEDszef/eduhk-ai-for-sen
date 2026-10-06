import { systemPrompt } from "./system";
export const reviewPrompt =
  systemPrompt +
  ` Perform automated checking, not approval. Independently recompute numerical answers and compare with original quantities, mathematical relationships, grade, objective, linguistic complexity, reading load, scaffolding, mathematical challenge and possible hallucinations. Include checks for all of these areas. Use not_verified where uncertain. Return status review_required, concrete warnings and suggestions. You must not say safe for classroom use or assert official curriculum compliance.`;
