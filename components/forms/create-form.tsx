"use client";
import { useRef, useState } from "react";
import { inputSchema, topics, needs } from "@/lib/validation/schemas";
import type { GenerationResult, TeacherInput, Stage } from "@/types/generation";
import type { TranslationKey } from "@/lib/i18n";
import { errorKey } from "@/lib/i18n";
import { useLanguage } from "@/components/i18n/language-provider";
import ReviewPanel from "@/components/review/review-panel";
function Select({
  name,
  label,
  values,
  defaultValue,
}: {
  name: string;
  label: TranslationKey;
  values: readonly string[];
  defaultValue?: string;
}) {
  const { t, option } = useLanguage();
  return (
    <label>
      {t(label)}
      <select name={name} defaultValue={defaultValue ?? values[0]}>
        {values.map((v) => (
          <option key={v} value={v}>
            {option(v)}
          </option>
        ))}
      </select>
    </label>
  );
}
export default function CreateForm() {
  const { t } = useLanguage();
  const [busy, setBusy] = useState(false);
  const lock = useRef(false);
  const [stage, setStage] = useState<Stage>("Understanding teaching needs…");
  const [error, setError] = useState<TranslationKey | null>(null);
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [revision, setRevision] = useState(0);
  const [showSettings, setShowSettings] = useState(true);
  const formRef = useRef<HTMLFormElement>(null);
  const reviewRef = useRef<HTMLDivElement>(null);
  async function generate(input: TeacherInput) {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setError(null);
    setStage("Understanding teaching needs…");
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
        signal: AbortSignal.timeout(280000),
      });
      if (!response.ok) {
        const data: unknown = await response.json();
        throw new Error(
          typeof data === "object" && data !== null && "error" in data
            ? String(data.error)
            : "Generation failed",
        );
      }
      if (!response.body) throw new Error("No response");
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "",
        finished = false;
      const handle = (line: string) => {
        if (!line.trim()) return;
        const data = JSON.parse(line) as {
          event: string;
          stage: Stage;
          error: string;
          result: GenerationResult;
        };
        if (data.event === "stage") setStage(data.stage);
        if (data.event === "error") throw new Error(data.error);
        if (data.event === "result") {
          setResult(data.result);
          setRevision((value) => value + 1);
          setShowSettings(false);
          finished = true;
          requestAnimationFrame(() =>
            reviewRef.current?.scrollIntoView({
              behavior: "smooth",
              block: "start",
            }),
          );
        }
      };
      try {
        while (true) {
          const chunk = await reader.read();
          buffer += decoder.decode(chunk.value, { stream: !chunk.done });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";
          lines.forEach(handle);
          if (chunk.done) break;
        }
        handle(buffer);
        if (!finished) throw new Error("Generation incomplete");
      } finally {
        reader.releaseLock();
      }
    } catch (e) {
      setError(
        e instanceof Error && e.name !== "TimeoutError"
          ? errorKey(e.message)
          : "timeout",
      );
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (lock.current) return;
    const fd = new FormData(event.currentTarget);
    const val = (name: string) => String(fd.get(name) ?? "");
    const parsed = inputSchema.safeParse({
      grade: val("grade"),
      topic: val("topic"),
      learningObjective: val("objective"),
      originalMaterial: val("original"),
      outputType: val("output"),
      outputLanguage: val("outputLanguage"),
      mode: val("mode"),
      profile: {
        readingSupport: val("reading"),
        instructionLength: val("instructions"),
        visualSupport: val("visual"),
        audioSupport: val("audio"),
        scaffolding: val("scaffolding"),
        needs: fd.getAll("needs"),
      },
    });
    if (!parsed.success) {
      setError("invalid");
      return;
    }
    void generate(parsed.data);
  }
  function edit() {
    setShowSettings(true);
    requestAnimationFrame(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth" });
      formRef.current
        ?.querySelector<HTMLTextAreaElement>("textarea")
        ?.focus({ preventScroll: true });
    });
  }
  return (
    <>
      <form
        ref={formRef}
        onSubmit={submit}
        className="form-layout"
        hidden={!!result && !showSettings}
      >
        <div>
          <section className="panel">
            <div className="form-section-heading">
              <span>01</span>
              <div>
                <h2>{t("lesson")}</h2>
                <p>{t("anchor")}</p>
              </div>
            </div>
            <div className="two-columns">
              <Select
                name="grade"
                label="grade"
                values={["P1", "P2", "P3"]}
                defaultValue="P2"
              />
              <Select
                name="topic"
                label="topic"
                values={topics}
                defaultValue="Subtraction"
              />
            </div>
            <label>
              {t("objective")} <span className="required">{t("required")}</span>
              <textarea
                name="objective"
                required
                minLength={10}
                maxLength={600}
                rows={3}
                placeholder={t("objectivePlaceholder")}
              />
            </label>
            <label>
              {t("original")} <span className="muted">{t("optional")}</span>
              <textarea
                name="original"
                maxLength={3000}
                rows={4}
                placeholder={t("exampleQuestion")}
              />
            </label>
            <p className="field-note">{t("originalHelp")}</p>
          </section>
          <section className="panel">
            <div className="form-section-heading">
              <span>02</span>
              <div>
                <h2>{t("profile")}</h2>
                <p>{t("profileHelp")}</p>
              </div>
            </div>
            <div className="privacy">{t("privacy")}</div>
            <div className="two-columns">
              <Select
                name="reading"
                label="reading"
                values={["Low", "Medium", "High"]}
                defaultValue="Medium"
              />
              <Select
                name="instructions"
                label="instructions"
                values={["Standard", "Short", "One Step at a Time"]}
                defaultValue="Short"
              />
              <Select
                name="visual"
                label="visual"
                values={["Low", "Medium", "High"]}
                defaultValue="Medium"
              />
              <Select
                name="audio"
                label="audio"
                values={["Not Needed", "Helpful", "Preferred"]}
              />
              <Select
                name="scaffolding"
                label="scaffolding"
                values={["Low", "Medium", "High"]}
                defaultValue="Medium"
              />
            </div>
            <fieldset>
              <legend>{t("additional")}</legend>
              <div className="checkboxes">
                {needs.map((n) => (
                  <label key={n}>
                    <input type="checkbox" name="needs" value={n} />
                    <span>{t(n)}</span>
                  </label>
                ))}
              </div>
            </fieldset>
            <p className="field-note">{t("audioHelp")}</p>
          </section>
        </div>
        <aside className="request-sidebar">
          <section className="panel">
            <div className="form-section-heading">
              <span>03</span>
              <div>
                <h2>{t("choose")}</h2>
                <p>{t("chooseHelp")}</p>
              </div>
            </div>
            <fieldset>
              <legend>{t("output")}</legend>
              {(["worksheet", "lesson_plan", "game_activity"] as const).map(
                (v) => (
                  <label className="radio-option" key={v}>
                    <input
                      type="radio"
                      name="output"
                      value={v}
                      defaultChecked={v === "worksheet"}
                    />
                    <span>
                      <strong>{t(v)}</strong>
                      <small>{t(`${v}Help`)}</small>
                    </span>
                  </label>
                ),
              )}
            </fieldset>
            <Select
              name="outputLanguage"
              label="outputLanguage"
              values={["en", "zh-HK", "bilingual"]}
            />
            <p className="field-note">{t("languageHelp")}</p>
            <Select
              name="mode"
              label="mode"
              values={["Standard", "Enhanced Pedagogical Support"]}
              defaultValue="Enhanced Pedagogical Support"
            />
            <p className="field-note">{t("modeHelp")}</p>
            <button className="button full" type="submit" disabled={busy}>
              {t(busy ? "creating" : "generate")} ↗
            </button>
            <p className="loading" role="status">
              {t(busy ? stage : "reviewReminder")}
            </p>
          </section>
          <div className="sidebar-note">
            <h3>{t("principle")}</h3>
            <p>{t("dataNotice")}</p>
          </div>
        </aside>
      </form>
      {error ? (
        <div role="alert" className="error">
          {t(error)}
        </div>
      ) : null}
      <div ref={reviewRef} tabIndex={-1}>
        {result ? (
          <ReviewPanel
            key={revision}
            result={result}
            busy={busy}
            stage={stage}
            onRegenerate={() => formRef.current?.requestSubmit()}
            onEdit={edit}
          />
        ) : null}
      </div>
    </>
  );
}
