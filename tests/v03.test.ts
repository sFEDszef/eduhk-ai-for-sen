import { test } from "node:test";
import assert from "node:assert/strict";
import { inputSchema, materialSchema } from "../lib/validation/schemas";
import { en } from "../lib/i18n/en";
import { zhHK } from "../lib/i18n/zh-HK";
import { zhCN } from "../lib/i18n/zh-CN";
import { translate } from "../lib/i18n";
import { orchestrate } from "../lib/agents/orchestrator";
import { checkMaterialLanguage } from "../lib/validation/language";
import { checkOriginalSubtraction } from "../lib/validation/math";
import { docxBuffer } from "../lib/export/docx";
import { plainText } from "../lib/export/content";
import { materialFilename, sanitizeFilename } from "../lib/export/filename";
import { input, plan, worksheet, lesson, game, review } from "./fixtures";
import type { GenerationResult } from "../types/generation";
import JSZip from "jszip";
test("English, Traditional Chinese and Simplified Chinese dictionaries cover every interface key", () => {
  assert.deepEqual(Object.keys(en).sort(), Object.keys(zhHK).sort());
  assert.deepEqual(Object.keys(en).sort(), Object.keys(zhCN).sort());
  for (const key of Object.keys(en) as (keyof typeof en)[]) {
    assert.ok(en[key].trim());
    assert.ok(zhHK[key].trim());
    assert.ok(zhCN[key].trim());
  }
  assert.equal(translate("en", "generate"), "Generate teaching draft");
  assert.equal(translate("zh-HK", "generate"), "生成教學草稿");
  assert.equal(translate("zh-HK", "worksheet"), "工作紙");
  assert.match(translate("en", "more", { count: 3 }), /3 more/);
  assert.equal(translate("zh-CN", "generate"), "生成教学草稿");
  assert.equal(translate("zh-CN", "privacyHeading"), "隐私");
  assert.equal(translate("zh-CN", "more", { count: 3 }), "完整文件另有 3 道题目");
});
test("outputLanguage validates three values, rejects unsupported languages and defaults legacy requests to English", () => {
  for (const outputLanguage of ["en", "zh-HK", "bilingual"])
    assert.equal(
      inputSchema.parse({ ...input, outputLanguage }).outputLanguage,
      outputLanguage,
    );
  assert.equal(
    inputSchema.safeParse({ ...input, outputLanguage: "zh-CN" }).success,
    false,
  );
  const { outputLanguage: ignored, ...legacy } = input;
  void ignored;
  assert.equal(inputSchema.parse(legacy).outputLanguage, "en");
});
for (const outputLanguage of ["en", "zh-HK", "bilingual"] as const) {
  test(`${outputLanguage} request reaches all agents and preserves mathematics`, async () => {
    let calls = 0;
    const result = await orchestrate(
      { ...input, outputLanguage },
      {
        async generate(system, context, schema) {
          const data = context as { teacherInput: typeof input };
          assert.equal(data.teacherInput.outputLanguage, outputLanguage);
          assert.match(system, /Traditional Chinese/);
          const translated =
            outputLanguage === "en"
              ? worksheet
              : {
                  ...worksheet,
                  title:
                    outputLanguage === "zh-HK"
                      ? "減法工作紙"
                      : "Subtraction 減法工作紙",
                  displayLearningObjective:
                    outputLanguage === "zh-HK"
                      ? "學生能解答兩位數減法應用題。"
                      : "Two-digit subtraction 兩位數減法應用題",
                  studentInstructions:
                    outputLanguage === "zh-HK"
                      ? "閱讀題目。"
                      : "Read the question.\n閱讀題目。",
                  questions: worksheet.questions.map((q) => ({
                    ...q,
                    question:
                      outputLanguage === "zh-HK"
                        ? "有 23 張貼紙，送出 8 張，剩下多少張？"
                        : q.question +
                          "\n有 23 張貼紙，送出 8 張，剩下多少張？",
                  })),
                };
          return schema.parse([plan, translated, review][calls++]);
        },
      },
    );
    assert.equal(calls, 3);
    assert.equal(result.material.learningObjective, input.learningObjective);
    assert.equal(result.material.type, "worksheet");
    if (result.material.type === "worksheet") {
      assert.equal(result.material.questions[0].answer, "15");
      assert.match(result.material.questions[0].question, /23.*8/);
    }
    assert.equal(result.review.status, "review_required");
  });
  for (const sample of [worksheet, lesson, game])
    test(`${outputLanguage} ${sample.type} DOCX is a valid archive with complete content and review notice`, async () => {
      const result: GenerationResult = {
        input: { ...input, outputLanguage },
        knowledge: [],
        pedagogy: plan,
        material: materialSchema.parse(sample),
        review: {
          status: "review_required",
          checks: [
            {
              name: "Arithmetic",
              result: "appears_consistent",
              detail: "23 − 8 = 15",
            },
          ],
          warnings: [],
          suggestions: [],
        },
      };
      const before = JSON.stringify(result);
      const buffer = await docxBuffer(result);
      assert.ok(buffer.length > 1000);
      assert.equal(buffer.subarray(0, 2).toString(), "PK");
      const zip = await JSZip.loadAsync(buffer);
      const xml = await zip.file("word/document.xml")!.async("string");
      assert.ok(xml.includes(sample.title));
      assert.ok(xml.includes("15"));
      assert.ok(
        xml.includes(
          outputLanguage === "zh-HK"
            ? "課堂使用前須由教師審閱"
            : "Teacher Review Required Before Classroom Use",
        ),
      );
      if (sample.type === "worksheet") {
        assert.match(xml, /w:type="page"/);
        assert.ok(
          xml.includes(outputLanguage === "zh-HK" ? "答案" : "Answers"),
        );
      }
      assert.ok(plainText(result).includes(sample.title));
      assert.equal(JSON.stringify(result), before);
      assert.match(materialFilename(result.input), /\.docx$/);
    });
}
test("filename sanitization removes path traversal, forbidden characters and long titles", () => {
  assert.equal(materialFilename(input), "P2_Subtraction_Worksheet_EN.docx");
  assert.equal(
    materialFilename({ ...input, outputLanguage: "zh-HK" }),
    "P2_減法_工作紙_ZH.docx",
  );
  assert.equal(
    materialFilename({ ...input, outputLanguage: "bilingual" }),
    "P2_Subtraction_Worksheet_Bilingual.docx",
  );
  assert.doesNotMatch(sanitizeFilename("../../bad:file?*.docx"), /[/:?*\\]/);
  assert.ok(sanitizeFilename("a".repeat(500)).length <= 100);
});
test("cross-language guard rejects changed original quantities and incorrect answer", () => {
  const fixed = {
    ...input,
    originalMaterial:
      "Amy has 43 stickers. She gives 18 stickers to Ben. How many are left?",
  };
  const m = materialSchema.parse({
    ...worksheet,
    questions: worksheet.questions.map((q) => ({
      ...q,
      question: "Amy 有 43 張貼紙。送出 18 張，還剩下多少張？",
      answer: "25",
    })),
  });
  checkOriginalSubtraction(fixed, m);
  if (m.type !== "worksheet") throw new Error("fixture");
  assert.throws(
    () =>
      checkOriginalSubtraction(fixed, {
        ...m,
        questions: m.questions.map((q) => ({ ...q, answer: "24" })),
      }),
    /changed/,
  );
  assert.throws(
    () =>
      checkOriginalSubtraction(fixed, {
        ...m,
        questions: m.questions.map((q) => ({
          ...q,
          question: "Amy 有 4 張貼紙，送出 1 張。",
        })),
      }),
    /changed/,
  );
});

test("Chinese and bilingual outputs reject English-only student questions", () => {
  const material = materialSchema.parse(worksheet);
  assert.throws(
    () =>
      checkMaterialLanguage({ ...input, outputLanguage: "zh-HK" }, material),
    /output language/,
  );
  assert.throws(
    () =>
      checkMaterialLanguage(
        { ...input, outputLanguage: "bilingual" },
        material,
      ),
    /output language/,
  );
  checkMaterialLanguage(input, material);
});

test("Chinese-only mode rejects an English problem followed by a Chinese line", () => {
  const material = materialSchema.parse({
    ...worksheet,
    title: "減法工作紙",
    displayLearningObjective: "解答兩位數減法應用題。",
    studentInstructions: "閱讀題目。",
    questions: worksheet.questions.map((q) => ({
      ...q,
      question:
        "Amy has 23 stickers. She gives 8 stickers to Ben. How many are left?\nAmy 有 23 張貼紙，送出 8 張，剩下多少張？",
    })),
  });
  assert.throws(
    () =>
      checkMaterialLanguage({ ...input, outputLanguage: "zh-HK" }, material),
    /output language/,
  );
});
