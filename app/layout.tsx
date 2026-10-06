import type { Metadata } from "next";
import { LanguageProvider } from "@/components/i18n/language-provider";
import SiteShell from "@/components/i18n/site-shell";
import "./globals.css";
export const metadata: Metadata = {
  title: "AI for Inclusive Mathematics | EdUHK",
  description:
    "A GenAI Tool to Tailor Early Primary Mathematics Materials for Students with Dyslexia",
};
export default function Layout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <LanguageProvider>
          <SiteShell>{children}</SiteShell>
        </LanguageProvider>
      </body>
    </html>
  );
}
