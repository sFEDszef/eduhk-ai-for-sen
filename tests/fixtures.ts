import type { TeacherInput } from "../types/generation";
export const input: TeacherInput = {
  grade: "P2",
  topic: "Subtraction",
  learningObjective: "Students can solve two-digit subtraction word problems.",
  originalMaterial:
    "There are 23 stickers. 8 are given away. How many are left?",
  outputType: "worksheet",
  outputLanguage: "en",
  mode: "Enhanced Pedagogical Support",
  profile: {
    readingSupport: "High",
    instructionLength: "One Step at a Time",
    visualSupport: "High",
    audioSupport: "Helpful",
    scaffolding: "High",
    needs: ["Needs reduced reading load"],
  },
};
export const plan = {
  strategies: ["Explicit modelling"],
  scaffoldingPlan: "Show one step at a time.",
  readingAdaptation: "Short sentences.",
  visualSupport: "Tens and ones counters.",
  rationale: ["High reading support needs concise language."],
};
const base = {
  title: "Subtraction with stickers",
  grade: "P2",
  topic: "Subtraction",
  learningObjective: input.learningObjective,
  displayLearningObjective: input.learningObjective,
  teacherNote: "Check the answers.",
  differentiationNotes: ["Fade hints."],
  pedagogicalRationale: [
    "Counters support representation while preserving subtraction.",
  ],
  reviewRequired: true,
};
export const worksheet = {
  ...base,
  type: "worksheet",
  studentInstructions: "Read one question at a time.",
  vocabularySupport: [{ term: "left", explanation: "The amount remaining." }],
  questions: Array.from({ length: 5 }, (_, i) => ({
    id: i + 1,
    question: "23 stickers. Give away 8. How many are left?",
    keyInformation: ["23", "8"],
    steps: ["Represent 23.", "Take away 8."],
    hint: "Use counters.",
    visualSuggestion: "Tens and ones counters.",
    answer: "15",
    teacherNote: "Check regrouping.",
  })),
};
export const lesson = {
  ...base,
  type: "lesson_plan",
  duration: "35 minutes",
  successCriteria: ["Represent subtraction."],
  materials: ["Counters"],
  warmUp: "Count tens and ones.",
  explicitTeacherModelling: "Represent 23 minus 8.",
  guidedPractice: "Subtract with counters.",
  mainActivity: "Adapt the supplied problem.",
  independentPractice: "Solve a similar problem.",
  formativeAssessment: "Explain the remaining amount.",
  dyslexiaSupport: ["Short prompts"],
  differentiation: ["Fade scaffolding"],
  teacherPrompts: ["What changes?"],
  teacherReviewNotes: ["Verify number range"],
};
export const game = {
  ...base,
  type: "game_activity",
  materials: ["Counters"],
  preparation: "Arrange pairs.",
  rules: ["Take turns."],
  procedure: ["Represent a problem.", "Give feedback."],
  difficultyLevels: ["Same objective with fewer hints"],
  visualSupport: "Labelled counters.",
  dyslexiaAdaptation: ["Teacher reads a short prompt."],
  teacherPrompts: ["What remains?"],
  immediateFeedbackExamples: ["23 minus 8 is 15; check with counters."],
  extension: "Explain another strategy.",
};
export const review = {
  status: "review_required",
  checks: [
    {
      name: "Arithmetic",
      result: "appears_consistent",
      detail: "23 minus 8 is 15.",
    },
  ],
  warnings: [],
  suggestions: ["Check each answer."],
};
