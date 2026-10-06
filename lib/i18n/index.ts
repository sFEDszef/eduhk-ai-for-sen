import { en, type TranslationKey } from "./en";
import { zhHK } from "./zh-HK";
export type UILanguage = "en" | "zh-HK";
export type { TranslationKey } from "./en";
export function translate(
  language: UILanguage,
  key: TranslationKey,
  params: Record<string, string | number> = {},
): string {
  let value: string = (language === "zh-HK" ? zhHK : en)[key];
  for (const [name, replacement] of Object.entries(params))
    value = value.replaceAll(`{${name}}`, String(replacement));
  return value;
}
export function label(language: UILanguage, value: string): string {
  return value in en ? translate(language, value as TranslationKey) : value;
}
export function errorKey(message: string): TranslationKey {
  if (/key|configuration|administrator/i.test(message)) return "configError";
  if (/objective|lesson details|mathematical quantities/.test(message))
    return "objectiveMismatch";
  if (/brief|large/.test(message)) return "inputLimit";
  if (/long|timeout/i.test(message)) return "timeout";
  return "generationError";
}
