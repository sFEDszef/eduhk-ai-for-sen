"use client";
import Link from "next/link";
import { LanguageSwitch, useLanguage } from "./language-provider";
export default function SiteShell({ children }: { children: React.ReactNode }) {
  const { t } = useLanguage();
  return (
    <>
      <a className="skip" href="#main">
        {t("skip")}
      </a>
      <header className="header">
        <Link href="/" className="brand">
          <span className="brand-mark" aria-hidden="true">
            ＋
          </span>
          <span>
            {t("brand")}
            <small>EdUHK · AI for SEN</small>
          </span>
        </Link>
        <nav aria-label={t("nav")}>
          <Link href="/about">{t("about")}</Link>
          <Link href="/create" className="button small">
            {t("create")} ↗
          </Link>
          <LanguageSwitch />
        </nav>
      </header>
      {children}
      <footer>
        <span>Group 8 – AI for SEN · EDS6019</span>
        <span>{t("motto")}</span>
      </footer>
    </>
  );
}
