import type { AIProvider } from "@/lib/ai/types";
import { GenerationError } from "@/lib/ai/types";
import type { TeacherInput, Stage, GenerationResult } from "@/types/generation";
import { checkOriginalSubtraction } from "@/lib/validation/math";
import { inputSchema } from "@/lib/validation/schemas";
import { retrieveKnowledge } from "@/lib/knowledge/retrieval";
import { pedagogyAgent } from "./pedagogy-agent";
import { contentAgent } from "./content-agent";
import { reviewAgent } from "./review-agent";
export async function orchestrate(
  raw: TeacherInput,
  ai: AIProvider,
  onStage: (stage: Stage) => void = () => {},
): Promise<GenerationResult> {
  onStage("Understanding teaching needs…");
  const input = inputSchema.parse(raw);
  onStage("Retrieving relevant support strategies…");
  const knowledge = retrieveKnowledge(input);
  onStage("Applying pedagogical principles…");
  const pedagogy = await pedagogyAgent(ai, input, knowledge);
  onStage("Generating teaching material…");
  const material = await contentAgent(ai, input, knowledge, pedagogy);
  if (
    material.type !== input.outputType ||
    material.grade !== input.grade ||
    material.topic !== input.topic ||
    material.learningObjective !== input.learningObjective
  )
    throw new GenerationError(
      "objective_mismatch",
      "The draft changed the requested objective or lesson details. Please try again.",
    );
  if (
    material.type === "worksheet" &&
    new Set(material.questions.map((q) => q.id)).size !== 5
  )
    throw new GenerationError(
      "malformed_output",
      "The draft contained duplicate question identifiers. Please try again.",
    );
  checkOriginalSubtraction(input, material);
  onStage("Reviewing the draft…");
  const review = await reviewAgent(ai, input, knowledge, material);
  const notices =
    input.outputLanguage === "zh-HK"
      ? [
          "自動檢查已完成，課堂使用前仍須由教師審閱。",
          "本原型未就數值答案及課程對應作出認證。",
        ]
      : input.outputLanguage === "bilingual"
        ? [
            "Automated review completed. Teacher review is still required. / 自動檢查已完成，仍須由教師審閱。",
            "Answers and curriculum alignment are not certified. / 數值答案及課程對應未經認證。",
          ]
        : [
            "Automated review completed. Teacher review is still required.",
            "Numerical answers and curriculum alignment have not been certified by this prototype.",
          ];
  review.warnings.push(...notices);
  return { input, knowledge, pedagogy, material, review };
}
