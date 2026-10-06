"use client";
import CreateForm from "@/components/forms/create-form";
import { useLanguage } from "@/components/i18n/language-provider";
export default function Create() {
  const { t } = useLanguage();
  return (
    <main id="main" className="workspace">
      <div className="page-heading">
        <div>
          <h1>{t("createHeading")}</h1>
          <p>{t("createIntro")}</p>
        </div>
        <p className="teacher-principle">{t("motto")}</p>
      </div>
      <CreateForm />
    </main>
  );
}
