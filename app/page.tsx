"use client";
import Link from "next/link";
import { useLanguage } from "@/components/i18n/language-provider";
export default function Home() {
  const { t } = useLanguage();
  return (
    <main id="main">
      <section className="hero">
        <div>
          <h1>{t("hero")}</h1>
          <p className="subtitle">{t("subtitle")}</p>
          <p className="lead">{t("lead")}</p>
          <p className="muted">{t("heroBody")}</p>
          <div className="actions">
            <Link className="button" href="/create">
              {t("createMaterial")} ↗
            </Link>
            <a className="text-link" href="#how-it-works">
              {t("how")} ↓
            </a>
          </div>
        </div>
        <aside className="hero-example">
          <div className="example-head">
            {t("sameMath")}
            <span>{t("example")}</span>
          </div>
          <div className="original">
            <small>{t("objective")}</small>
            <p>{t("objectivePlaceholder")}</p>
          </div>
          <div className="example-question">
            <h3>{t("exampleQuestion")}</h3>
            <div className="equation">
              43 − 18 = <span>25</span>
            </div>
          </div>
          <p className="example-note">{t("principle")}</p>
        </aside>
      </section>
      <section className="principle">
        <h2>{t("principle")}</h2>
        <p>{t("heroBody")}</p>
      </section>
      <section id="how-it-works" className="workflow">
        <div className="section-heading">
          <h2>{t("workflow")}</h2>
          <p>{t("workflowBody")}</p>
        </div>
        <ol>
          {(["step1", "step2", "step3", "step4", "step5"] as const).map(
            (key, i) => (
              <li key={key}>
                <span>0{i + 1}</span>
                <h3>{t(key)}</h3>
              </li>
            ),
          )}
        </ol>
      </section>
      <section className="closing">
        <div>
          <h2>{t("motto")}</h2>
          <p>{t("reviewReminder")}</p>
        </div>
        <Link href="/create" className="button">
          {t("create")} ↗
        </Link>
      </section>
    </main>
  );
}
