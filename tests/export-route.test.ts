import { test } from "node:test";
import assert from "node:assert/strict";
import JSZip from "jszip";
import { POST } from "../app/api/export/docx/route";
import { input, worksheet, review } from "./fixtures";
function request(
  body: string,
  origin = "https://example.org",
  contentType = "application/json",
) {
  return new Request("https://example.org/api/export/docx", {
    method: "POST",
    headers: { host: "example.org", origin, "Content-Type": contentType },
    body,
  });
}
test("export route accepts live draft shapes as JSON or native download form without an AI call", async () => {
  const old = globalThis.fetch;
  globalThis.fetch = async () => {
    throw new Error("Export must not call external APIs");
  };
  try {
    for (const contentType of [
      "application/json",
      "application/x-www-form-urlencoded",
    ]) {
      const payload = JSON.stringify({ input, material: worksheet, review });
      const response = await POST(
        request(
          contentType === "application/json"
            ? payload
            : new URLSearchParams({ draft: payload }).toString(),
          "https://example.org",
          contentType,
        ),
      );
      assert.equal(response.status, 200);
      assert.match(
        response.headers.get("Content-Disposition") ?? "",
        /P2_Subtraction_Worksheet_EN.docx/,
      );
      const zip = await JSZip.loadAsync(await response.arrayBuffer());
      assert.ok(
        (await zip.file("word/document.xml")!.async("string")).includes(
          "Teacher Review Required Before Classroom Use",
        ),
      );
    }
  } finally {
    globalThis.fetch = old;
  }
});
test("export route rejects cross-origin, malformed and oversized drafts", async () => {
  assert.equal((await POST(request("{}", "https://attacker.org"))).status, 403);
  assert.equal((await POST(request("not JSON"))).status, 400);
  assert.equal((await POST(request("{}"))).status, 400);
  assert.equal((await POST(request("x".repeat(1_000_001)))).status, 413);
});
