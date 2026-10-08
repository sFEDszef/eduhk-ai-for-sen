import { en, type TranslationKey } from "./en";
import { zhHK } from "./zh-HK";
import { zhCN } from "./zh-CN";
export type UILanguage = "en" | "zh-HK" | "zh-CN";
const dictionaries = { en, "zh-HK": zhHK, "zh-CN": zhCN };
export type { TranslationKey } from "./en";
export function translate(
  language: UILanguage,
  key: TranslationKey,
  params: Record<string, string | number> = {},
): string {
  let value: string = dictionaries[language][key];
  for (const [name, replacement] of Object.entries(params))
    value = value.replaceAll(`{${name}}`, String(replacement));
  return value;
}
export function label(language: UILanguage, value: string): string {
  return value in en ? translate(language, value as TranslationKey) : value;
}
export function errorKey(message: string): TranslationKey {
  if (/output language/.test(message)) return "languageMismatch";
  if (/key|configuration|administrator/i.test(message)) return "configError";
  if (/objective|lesson details|mathematical quantities/.test(message))
    return "objectiveMismatch";
  if (/brief|large/.test(message)) return "inputLimit";
  if (/long|timeout/i.test(message)) return "timeout";
  return "generationError";
}
