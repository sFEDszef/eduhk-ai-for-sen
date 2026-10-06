import type { AIProvider } from "@/lib/ai/types";
import type { TeacherInput, Pedagogy } from "@/types/generation";
import type { RetrievedChunk } from "@/lib/knowledge/types";
import {
  worksheetSchema,
  lessonSchema,
  gameSchema,
} from "@/lib/validation/schemas";
import { contentPrompt } from "@/lib/prompts/content";
export async function contentAgent(
  ai: AIProvider,
  input: TeacherInput,
  knowledge: RetrievedChunk[],
  pedagogy: Pedagogy,
) {
  const context = {
    teacherInput: input,
    retrievedKnowledge: knowledge,
    pedagogyPlan: pedagogy,
  };
  if (input.outputType === "worksheet")
    return ai.generate(contentPrompt, context, worksheetSchema);
  if (input.outputType === "lesson_plan")
    return ai.generate(contentPrompt, context, lessonSchema);
  return ai.generate(contentPrompt, context, gameSchema);
}
