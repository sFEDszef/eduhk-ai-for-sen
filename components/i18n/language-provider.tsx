"use client";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useSyncExternalStore,
} from "react";
import {
  label,
  translate,
  type UILanguage,
  type TranslationKey,
} from "@/lib/i18n";
const LanguageContext = createContext<UILanguage>("en");
const storageKey = "ai-sen.ui-language.v1";
const subscribe = (callback: () => void) => {
  window.addEventListener("ai-sen-language", callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener("ai-sen-language", callback);
    window.removeEventListener("storage", callback);
  };
};
function snapshot(): UILanguage {
  try {
    const stored = localStorage.getItem(storageKey);
    return stored === "zh-HK" || stored === "zh-CN" ? stored : "en";
  } catch {
    return "en";
  }
}
export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const saved = useSyncExternalStore(
    subscribe,
    snapshot,
    () => "en" as UILanguage,
  );
  const [override, setOverride] = useState<UILanguage | null>(null);
  const language = override ?? saved;
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);
  return (
    <LanguageContext.Provider value={language}>
      <LanguageSetter.Provider
        value={(value) => {
          setOverride(value);
          try {
            localStorage.setItem(storageKey, value);
            window.dispatchEvent(new Event("ai-sen-language"));
          } catch {
            /* UI still works when storage is blocked. */
          }
        }}
      >
        {children}
      </LanguageSetter.Provider>
    </LanguageContext.Provider>
  );
}
const LanguageSetter = createContext<(language: UILanguage) => void>(() => {});
export function useLanguage() {
  const language = useContext(LanguageContext);
  return {
    language,
    t: (key: TranslationKey, params?: Record<string, string | number>) =>
      translate(language, key, params),
    option: (value: string) => label(language, value),
  };
}
export function LanguageSwitch() {
  const { language, t } = useLanguage();
  const setLanguage = useContext(LanguageSetter);
  return (
    <div className="language-switch" aria-label={t("interfaceLanguage")}>
      <button
        type="button"
        lang="en"
        aria-pressed={language === "en"}
        onClick={() => setLanguage("en")}
      >
        EN
      </button>
      <span aria-hidden="true">|</span>
      <button
        type="button"
        lang="zh-HK"
        aria-pressed={language === "zh-HK"}
        onClick={() => setLanguage("zh-HK")}
      >
        繁中
      </button>
      <span aria-hidden="true">|</span>
      <button
        type="button"
        lang="zh-CN"
        aria-pressed={language === "zh-CN"}
        onClick={() => setLanguage("zh-CN")}
      >
        简中
      </button>
    </div>
  );
}
