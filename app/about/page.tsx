"use client";
import Link from "next/link";
import { useLanguage } from "@/components/i18n/language-provider";
export default function About() {
  const { t } = useLanguage();
  return (
    <main id="main" className="narrow">
      <h1>{t("aboutHeading")}</h1>
      <p className="lead">{t("aboutIntro")}</p>
      <section className="panel">
        {(
          [
            ["problem", "problemBody"],
            ["approach", "approachBody"],
            ["languageSupport", "languageSupportBody"],
            ["scope", "scopeBody"],
            ["privacyHeading", "privacy"],
            ["sources", "sourcesBody"],
          ] as const
        ).map(([heading, body]) => (
          <section key={heading}>
            <h2>{t(heading)}</h2>
            <p>{t(body)}</p>
            {heading === "privacyHeading" ? <p>{t("dataNotice")}</p> : null}
          </section>
        ))}
        <ul>
          <li>
            <a href="https://www.edb.gov.hk/en/curriculum-development/kla/ma/res/pri/index.html">
              {t("mathSource")}
            </a>
          </li>
          <li>
            <a href="https://sense.edb.gov.hk/en/types-of-special-educational-needs/specific-learning-difficulties/support-measures.html">
              {t("dyslexiaSource")}
            </a>
          </li>
        </ul>
        <p>
          EdUHK · EDS6019 – AI for Teaching and Learning · Group 8 – AI for SEN
        </p>
      </section>
      <Link className="button" href="/create">
        {t("createMaterial")} ↗
      </Link>
    </main>
  );
}
