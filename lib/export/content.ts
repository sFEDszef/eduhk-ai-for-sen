import type { ExportResult } from "./types";
import { translate, label, type TranslationKey } from "@/lib/i18n";
export type ExportBlock = {
  text: string;
  kind: "title" | "heading" | "subheading" | "body" | "break";
};
export const lessonFields = [
  "duration",
  "successCriteria",
  "materials",
  "warmUp",
  "explicitTeacherModelling",
  "guidedPractice",
  "mainActivity",
  "independentPractice",
  "formativeAssessment",
  "dyslexiaSupport",
  "differentiation",
  "teacherPrompts",
  "teacherReviewNotes",
] as const;
export const gameFields = [
  "materials",
  "preparation",
  "rules",
  "procedure",
  "difficultyLevels",
  "visualSupport",
  "dyslexiaAdaptation",
  "teacherPrompts",
  "immediateFeedbackExamples",
  "extension",
] as const;
export function exportBlocks(result: ExportResult): ExportBlock[] {
  const { input, material: m, review } = result;
  const blocks: ExportBlock[] = [];
  const name = (key: TranslationKey) =>
    input.outputLanguage === "bilingual"
      ? `${translate("en", key)} / ${translate("zh-HK", key)}`
      : translate(input.outputLanguage === "zh-HK" ? "zh-HK" : "en", key);
  const add = (text: string, kind: ExportBlock["kind"] = "body") =>
    blocks.push({ text, kind });
  const section = (key: TranslationKey, value: string | readonly string[]) => {
    add(name(key), "subheading");
    if (Array.isArray(value)) value.forEach((v) => add(`• ${v}`));
    else add(value as string);
  };
  add(m.title, "title");
  add("EdUHK · AI for SEN");
  add(`${name("draft")}\n${name("teacherReview")}`);
  add(
    `${name("grade")}: ${label(input.outputLanguage === "zh-HK" ? "zh-HK" : "en", m.grade)}`,
  );
  add(
    `${name("topic")}: ${label(input.outputLanguage === "zh-HK" ? "zh-HK" : "en", m.topic)}`,
  );
  section("objective", m.displayLearningObjective);
  if (m.type === "worksheet") {
    add(name("studentSection"), "heading");
    section("studentInstructions", m.studentInstructions);
    if (m.vocabularySupport.length)
      section(
        "vocabulary",
        m.vocabularySupport.map((v) => `${v.term}: ${v.explanation}`),
      );
    for (const q of m.questions) {
      add(`${name("question")} ${q.id}`, "heading");
      add(q.question);
      if (q.keyInformation.length) section("keyInformation", q.keyInformation);
      if (q.steps.length)
        section(
          "steps",
          q.steps.map((s, i) => `${i + 1}. ${s}`),
        );
      if (q.hint) section("hint", q.hint);
      if (q.visualSuggestion) section("visualSuggestion", q.visualSuggestion);
      add("____________________________");
    }
    add("", "break");
    add(name("teacherSection"), "heading");
    add(name("answers"), "subheading");
    m.questions.forEach((q) => add(`${q.id}. ${q.answer}`));
    section("differentiationNotes", m.differentiationNotes);
    section("rationale", m.pedagogicalRationale);
    section("teacherNote", m.teacherNote);
    for (const q of m.questions) add(`${q.id}. ${q.teacherNote}`);
  } else {
    const fields = m.type === "lesson_plan" ? lessonFields : gameFields;
    for (const field of fields) {
      const value = m[field as keyof typeof m];
      if (typeof value === "string" || Array.isArray(value))
        section(field, value as string | string[]);
    }
    section("differentiationNotes", m.differentiationNotes);
    section("teacherNote", m.teacherNote);
    section("rationale", m.pedagogicalRationale);
  }
  add(name("quality"), "heading");
  add(name("qualityHelp"));
  review.checks.forEach((c) => {
    add(`${c.name} — ${name(c.result)}`, "subheading");
    add(c.detail);
  });
  section("warnings", review.warnings);
  section("suggestions", review.suggestions);
  add(`${name("draft")}\n${name("teacherReview")}`);
  return blocks;
}
export function plainText(result: ExportResult): string {
  return exportBlocks(result)
    .map((b) => (b.kind === "break" ? "\n" : b.text))
    .join("\n\n");
}
