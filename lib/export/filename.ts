import type { TeacherInput } from "@/types/generation";
import { label } from "@/lib/i18n";
export function sanitizeFilename(value: string): string {
  return (
    value
      .replace(/[<>:"/\\|?*\u0000-\u001f]/g, "_")
      .replace(/[. ]+$/g, "")
      .trim()
      .slice(0, 100) || "Teaching_Material"
  );
}
export function materialFilename(input: TeacherInput): string {
  const zh = input.outputLanguage === "zh-HK";
  const suffix = input.outputLanguage === "en" ? "EN" : zh ? "ZH" : "Bilingual";
  return (
    sanitizeFilename(
      `${input.grade}_${zh ? label("zh-HK", input.topic) : input.topic}_${zh ? label("zh-HK", input.outputType) : label("en", input.outputType).replaceAll(" ", "")}_${suffix}`,
    ) + ".docx"
  );
}
