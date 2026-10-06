import type { AIProvider } from "@/lib/ai/types";
import type { TeacherInput, Material } from "@/types/generation";
import type { RetrievedChunk } from "@/lib/knowledge/types";
import { reviewSchema } from "@/lib/validation/schemas";
import { reviewPrompt } from "@/lib/prompts/review";
export function reviewAgent(
  ai: AIProvider,
  input: TeacherInput,
  knowledge: RetrievedChunk[],
  material: Material,
) {
  return ai.generate(
    reviewPrompt,
    { teacherInput: input, retrievedKnowledge: knowledge, material },
    reviewSchema,
  );
}
