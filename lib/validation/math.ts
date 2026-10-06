import type { TeacherInput, Material } from "@/types/generation";
import { GenerationError } from "@/lib/ai/types";
// Conservative guard for the supplied two-quantity subtraction case. Other
// topics and more complex originals remain subject to the review agent.
export function checkOriginalSubtraction(
  input: TeacherInput,
  material: Material,
): void {
  if (
    input.topic !== "Subtraction" ||
    material.type !== "worksheet" ||
    !input.originalMaterial
  )
    return;
  const original: string[] =
    input.originalMaterial.match(/\d+(?:\.\d+)?/g) ?? [];
  if (original.length !== 2) return;
  const [start, change] = original.map(Number);
  if (start < change) return;
  const first = material.questions[0];
  const quantities: string[] = first.question.match(/\d+(?:\.\d+)?/g) ?? [];
  const answers: string[] = first.answer.match(/\d+(?:\.\d+)?/g) ?? [];
  if (
    !original.every((n) => quantities.includes(n)) ||
    !answers.map(Number).includes(start - change)
  )
    throw new GenerationError(
      "mathematical_mismatch",
      "The draft changed the original mathematical quantities or answer. Please try again.",
    );
}
