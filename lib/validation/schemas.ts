import { z } from "zod";
export const topics = [
  "Number Sense",
  "Addition",
  "Subtraction",
  "Multiplication",
  "Division",
  "Money",
  "Time",
  "Measurement",
  "Shapes",
  "Word Problems",
  "Other",
] as const;
export const needs = [
  "Difficulty with long instructions",
  "Needs key words highlighted",
  "Benefits from visual representation",
  "Benefits from step-by-step guidance",
  "Needs reduced reading load",
  "Benefits from manipulatives",
] as const;
const level = z.enum(["Low", "Medium", "High"]);
const text = z.string().trim().min(1).max(5000);
const list = z.array(text).max(30);
export const inputSchema = z.object({
  grade: z.enum(["P1", "P2", "P3"]),
  topic: z.enum(topics),
  learningObjective: z.string().trim().min(10).max(600),
  originalMaterial: z.string().trim().max(3000).default(""),
  outputType: z.enum(["worksheet", "lesson_plan", "game_activity"]),
  mode: z.enum(["Standard", "Enhanced Pedagogical Support"]),
  profile: z.object({
    readingSupport: level,
    instructionLength: z.enum(["Standard", "Short", "One Step at a Time"]),
    visualSupport: level,
    audioSupport: z.enum(["Not Needed", "Helpful", "Preferred"]),
    scaffolding: level,
    needs: z.array(z.enum(needs)).max(6),
  }),
});
export const pedagogySchema = z.object({
  strategies: list.min(1),
  scaffoldingPlan: text,
  readingAdaptation: text,
  visualSupport: text,
  rationale: list.min(1),
});
const base = {
  title: text,
  grade: z.enum(["P1", "P2", "P3"]),
  topic: z.enum(topics),
  learningObjective: text,
  teacherNote: text,
  differentiationNotes: list.min(1),
  pedagogicalRationale: list.min(1),
  reviewRequired: z.literal(true),
};
export const worksheetSchema = z.object({
  ...base,
  type: z.literal("worksheet"),
  studentInstructions: text,
  vocabularySupport: z
    .array(z.object({ term: text, explanation: text }))
    .max(20),
  questions: z
    .array(
      z.object({
        id: z.number().int().positive(),
        question: text,
        keyInformation: list,
        steps: list,
        hint: z.string().max(5000),
        visualSuggestion: z.string().max(5000),
        answer: text,
        teacherNote: text,
      }),
    )
    .length(5),
});
export const lessonSchema = z.object({
  ...base,
  type: z.literal("lesson_plan"),
  duration: text,
  successCriteria: list.min(1),
  materials: list.min(1),
  warmUp: text,
  explicitTeacherModelling: text,
  guidedPractice: text,
  mainActivity: text,
  independentPractice: text,
  formativeAssessment: text,
  dyslexiaSupport: list.min(1),
  differentiation: list.min(1),
  teacherPrompts: list.min(1),
  teacherReviewNotes: list.min(1),
});
export const gameSchema = z.object({
  ...base,
  type: z.literal("game_activity"),
  materials: list.min(1),
  preparation: text,
  rules: list.min(1),
  procedure: list.min(1),
  difficultyLevels: list.min(1),
  visualSupport: text,
  dyslexiaAdaptation: list.min(1),
  teacherPrompts: list.min(1),
  immediateFeedbackExamples: list.min(1),
  extension: text,
});
export const materialSchema = z.discriminatedUnion("type", [
  worksheetSchema,
  lessonSchema,
  gameSchema,
]);
export const reviewSchema = z.object({
  status: z.literal("review_required"),
  checks: z
    .array(
      z.object({
        name: text,
        result: z.enum([
          "appears_consistent",
          "needs_attention",
          "not_verified",
        ]),
        detail: text,
      }),
    )
    .min(1)
    .max(20),
  warnings: list,
  suggestions: list,
});
