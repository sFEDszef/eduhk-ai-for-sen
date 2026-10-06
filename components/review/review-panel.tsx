"use client";
import { useRef, useState } from "react";
import type { GenerationResult, Material, Stage } from "@/types/generation";
import { useLanguage } from "@/components/i18n/language-provider";
import { gameFields, lessonFields, plainText } from "@/lib/export/content";
import type { TranslationKey } from "@/lib/i18n";
function List({ items }: { items: readonly string[] }) {
  return (
    <ul>
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  );
}
function MaterialView({
  material: m,
  full = false,
}: {
  material: Material;
  full?: boolean;
}) {
  const { t } = useLanguage();
  if (m.type !== "worksheet") {
    const fields =
      m.type === "lesson_plan"
        ? full
          ? lessonFields
          : (["warmUp", "guidedPractice"] as const)
        : full
          ? gameFields
          : (["materials", "rules"] as const);
    return (
      <>
        {fields.map((key) => {
          const value = m[key as keyof typeof m];
          return (
            <section className="material-section" key={key}>
              <h4>{t(key)}</h4>
              {Array.isArray(value) ? (
                <List items={value as string[]} />
              ) : (
                <p>
                  {!full && key === "guidedPractice"
                    ? String(value).slice(0, 350) +
                      (String(value).length > 350 ? "…" : "")
                    : String(value)}
                </p>
              )}
            </section>
          );
        })}
        {m.type === "lesson_plan" && !full ? (
          <p className="muted">{t("lessonDownload")}</p>
        ) : null}
      </>
    );
  }
  return (
    <>
      <p className="student-directions">{m.studentInstructions}</p>
      {m.vocabularySupport.length ? (
        <section>
          <h4>{t("vocabulary")}</h4>
          <dl>
            {m.vocabularySupport.map((v, i) => (
              <div key={i}>
                <dt>{v.term}</dt>
                <dd>{v.explanation}</dd>
              </div>
            ))}
          </dl>
        </section>
      ) : null}
      {(full ? m.questions : m.questions.slice(0, 2)).map((q) => (
        <article className="question" key={q.id}>
          <div className="question-number">{q.id}</div>
          <div>
            <h4>{q.question}</h4>
            {full ? (
              <>
                <div className="key-info">
                  {q.keyInformation.map((k, i) => (
                    <strong key={i}>{k}</strong>
                  ))}
                </div>
                <ol>
                  {q.steps.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ol>
                <p>
                  <b>{t("hint")}:</b> {q.hint}
                </p>
                <p className="visual-note">
                  <b>{t("visualSuggestion")}:</b> {q.visualSuggestion}
                </p>
              </>
            ) : null}
            <details>
              <summary>{t("answerNotes")}</summary>
              <p>
                <b>{t("answer")}:</b> {q.answer}
              </p>
              <p>{q.teacherNote}</p>
            </details>
          </div>
        </article>
      ))}
      {!full ? (
        <p className="muted">{t("more", { count: m.questions.length - 2 })}</p>
      ) : null}
    </>
  );
}
export default function ReviewPanel({
  result,
  busy,
  stage,
  onRegenerate,
  onEdit,
}: {
  result: GenerationResult;
  busy: boolean;
  stage: Stage;
  onRegenerate: () => void;
  onEdit: () => void;
}) {
  const { t, option } = useLanguage();
  const { input, knowledge, pedagogy, material: m, review } = result;
  const [exporting, setExporting] = useState(false);
  const exportLock = useRef(false);
  const [feedback, setFeedback] = useState<TranslationKey | null>(null);
  async function download() {
    if (exportLock.current) return;
    exportLock.current = true;
    setExporting(true);
    setFeedback(null);
    try {
      const form = document.createElement("form");
      form.method = "POST";
      form.action = "/api/export/docx";
      form.hidden = true;
      const field = document.createElement("input");
      field.type = "hidden";
      field.name = "draft";
      field.value = JSON.stringify({
        input: result.input,
        material: result.material,
        review: result.review,
      });
      form.append(field);
      document.body.append(form);
      form.submit();
      form.remove();
      await new Promise<void>((resolve) => setTimeout(resolve, 1000));
    } catch {
      setFeedback("exportError");
    } finally {
      exportLock.current = false;
      setExporting(false);
    }
  }
  async function copy() {
    try {
      await navigator.clipboard.writeText(plainText(result));
      setFeedback("copied");
    } catch {
      setFeedback("copyError");
    }
  }
  const attention = review.checks.filter((c) => c.result === "needs_attention");
  return (
    <section className="review">
      <div className="review-warning">
        <span>{t("draft")}</span>
        <h2>{t("teacherReview")}</h2>
        <p>{t("reviewComplete")}</p>
      </div>
      <section className="panel">
        <h3>1. {t("inputSummary")}</h3>
        <p>
          {option(input.grade)} · {option(input.topic)} · {t(m.type)} ·{" "}
          {option(input.outputLanguage)}
        </p>
        <p>
          <b>{t("objective")}:</b> {input.learningObjective}
        </p>
        <details>
          <summary>{t("profile")}</summary>
          <div className="summary-grid">
            {(
              [
                ["reading", input.profile.readingSupport],
                ["instructions", input.profile.instructionLength],
                ["visual", input.profile.visualSupport],
                ["audio", input.profile.audioSupport],
                ["scaffolding", input.profile.scaffolding],
                ["mode", input.mode],
              ] as const
            ).map(([key, value]) => (
              <p key={key}>
                <b>{t(key)}:</b> {option(value)}
              </p>
            ))}
          </div>
          <p>{input.profile.needs.map(option).join("; ") || t("none")}</p>
        </details>
        {input.originalMaterial ? (
          <details>
            <summary>{t("originalDetails")}</summary>
            <p>{input.originalMaterial}</p>
          </details>
        ) : null}
      </section>
      <div className="review-columns">
        <section className="panel">
          <h3>2. {t("knowledge")}</h3>
          <p className="muted">{t("knowledgeHelp")}</p>
          {knowledge.map((k) => (
            <details key={k.id}>
              <summary>{option(k.category)}</summary>
              <p>{k.content}</p>
              <small>
                {k.id} · {k.score}
              </small>
              <p>
                {k.sourceUrl ? (
                  <a href={k.sourceUrl} target="_blank" rel="noreferrer">
                    {k.source}
                  </a>
                ) : (
                  k.source
                )}
              </p>
            </details>
          ))}
        </section>
        <section className="panel">
          <h3>3. {t("strategy")}</h3>
          <List items={pedagogy.strategies.slice(0, 3)} />
          <details>
            <summary>{t("planDetails")}</summary>
            <List items={pedagogy.strategies.slice(3)} />
            <h4>{t("scaffolding")}</h4>
            <p>{pedagogy.scaffoldingPlan}</p>
            <h4>{t("reading")}</h4>
            <p>{pedagogy.readingAdaptation}</p>
            <h4>{t("visual")}</h4>
            <p>{pedagogy.visualSupport}</p>
            <List items={pedagogy.rationale} />
          </details>
        </section>
      </div>
      <section className="panel generated">
        <h3>4. {t("preview")}</h3>
        <h2>{m.title}</h2>
        <p>{m.displayLearningObjective}</p>
        <MaterialView material={m} />
        <details>
          <summary>{t("full")}</summary>
          <MaterialView material={m} full />
          <h4>{t("teacherNote")}</h4>
          <p>{m.teacherNote}</p>
          <h4>{t("differentiationNotes")}</h4>
          <List items={m.differentiationNotes} />
        </details>
      </section>
      <section className="panel">
        <h3>5. {t("quality")}</h3>
        <p>{t("qualityHelp")}</p>
        <p>
          {review.checks.length} · {t("review_required")}
        </p>
        {attention.slice(0, 2).map((c, i) => (
          <p key={i}>
            <b>{c.name}:</b> {c.detail}
          </p>
        ))}
        <details>
          <summary>{t("reviewDetails")}</summary>
          {review.checks.map((c, i) => (
            <div className="check" key={i}>
              <h4>
                {c.name}
                <span
                  className={c.result === "needs_attention" ? "attention" : ""}
                >
                  {t(c.result)}
                </span>
              </h4>
              <p>{c.detail}</p>
            </div>
          ))}
          <h4>{t("warnings")}</h4>
          <List items={review.warnings} />
          <h4>{t("suggestions")}</h4>
          <List items={review.suggestions} />
        </details>
      </section>
      <section className="panel">
        <h3>6. {t("rationale")}</h3>
        <List items={m.pedagogicalRationale.slice(0, 2)} />
        {m.pedagogicalRationale.length > 2 ? (
          <details>
            <summary>{t("planDetails")}</summary>
            <List items={m.pedagogicalRationale.slice(2)} />
          </details>
        ) : null}
      </section>
      <section className="panel export-actions">
        <h3>7. {t("exports")}</h3>
        <p>{t("exportHelp")}</p>
        <div className="actions">
          <button
            className="button"
            disabled={exporting || busy}
            onClick={() => void download()}
          >
            {t(exporting ? "downloading" : "download")}
          </button>
          <button
            className="button secondary"
            disabled={busy}
            onClick={() => void copy()}
          >
            {t("copy")}
          </button>
          <button
            className="button secondary"
            disabled={busy}
            onClick={onRegenerate}
          >
            {t(busy ? "creating" : "regenerate")}
          </button>
          <button className="button secondary" disabled={busy} onClick={onEdit}>
            {t("edit")}
          </button>
        </div>
        <p role="status" aria-live="polite">
          {busy ? t(stage) : feedback ? t(feedback) : ""}
        </p>
      </section>
    </section>
  );
}
