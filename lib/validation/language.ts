import type { TeacherInput, Material } from "@/types/generation";
import { GenerationError } from "@/lib/ai/types";
export function checkMaterialLanguage(
  input: TeacherInput,
  material: Material,
): void {
  if (input.outputLanguage === "en") return;
  const fields = [material.title, material.displayLearningObjective];
  if (material.type === "worksheet")
    fields.push(
      material.studentInstructions,
      ...material.questions.map((q) => q.question),
    );
  else if (material.type === "lesson_plan")
    fields.push(
      material.warmUp,
      material.guidedPractice,
      material.mainActivity,
    );
  else fields.push(...material.rules, ...material.procedure);
  if (
    fields.some(
      (value) =>
        !/[\u3400-\u9fff]/u.test(value) ||
        (input.outputLanguage === "zh-HK" &&
          /[a-z]{2,}(?:[ ]+[a-z]{2,}){2,}/i.test(value)) ||
        (input.outputLanguage === "bilingual" && !/[a-z]/i.test(value)),
    )
  )
    throw new GenerationError(
      "language_mismatch",
      "The draft did not use the selected output language consistently. Please try again.",
    );
}
