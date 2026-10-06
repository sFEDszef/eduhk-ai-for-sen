import "server-only";
import { z } from "zod";
import {
  inputSchema,
  materialSchema,
  reviewSchema,
} from "@/lib/validation/schemas";
import { docxBuffer } from "@/lib/export/docx";
import { materialFilename } from "@/lib/export/filename";
export const runtime = "nodejs";
export const maxDuration = 30;
const schema = z.object({
  input: inputSchema,
  material: materialSchema,
  review: reviewSchema,
});
export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  try {
    if (
      origin &&
      new URL(origin).host !==
        (request.headers.get("host") || new URL(request.url).host)
    )
      return Response.json(
        { error: "Cross-origin export requests are not allowed." },
        { status: 403 },
      );
  } catch {
    return Response.json({ error: "Invalid origin." }, { status: 403 });
  }
  if (Number(request.headers.get("content-length") ?? 0) > 1_000_000)
    return Response.json({ error: "Draft too large." }, { status: 413 });
  let raw: unknown;
  try {
    const text = await request.text();
    if (text.length > 1_000_000)
      return Response.json({ error: "Draft too large." }, { status: 413 });
    raw = JSON.parse(
      request.headers.get("content-type")?.includes("application/json")
        ? text
        : (new URLSearchParams(text).get("draft") ?? ""),
    );
  } catch {
    return Response.json({ error: "Invalid draft." }, { status: 400 });
  }
  const parsed = schema.safeParse(raw);
  if (!parsed.success)
    return Response.json({ error: "Invalid draft." }, { status: 400 });
  try {
    const buffer = await docxBuffer(parsed.data);
    const filename = materialFilename(parsed.data.input);
    return new Response(new Uint8Array(buffer), {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="Teaching_Material.docx"; filename*=UTF-8''${encodeURIComponent(filename)}`,
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return Response.json(
      { error: "Could not export the draft." },
      { status: 500 },
    );
  }
}
