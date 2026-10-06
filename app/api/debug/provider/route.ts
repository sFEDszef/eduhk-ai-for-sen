import "server-only";
export const runtime = "nodejs";
export const maxDuration = 30;
export async function POST() {
  if (!process.env.AI_API_KEY) return Response.json({ configured: false }, { status: 503 });
  // Temporary, fixed, low-token diagnostic. No caller-supplied prompt or secrets returned.
  const url = new URL((process.env.AI_BASE_URL || "https://api.deepseek.com").replace(/\/$/, "") + "/chat/completions");
  if (url.origin !== "https://api.deepseek.com") return Response.json({ error: "unexpected_test_provider" }, { status: 400 });
  try {
    const response = await fetch(url, {
      method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.AI_API_KEY}` },
      body: JSON.stringify({ model: process.env.AI_MODEL || "deepseek-chat", max_tokens: 16, temperature: 0, messages: [ { role: "system", content: "You are a test assistant." }, { role: "user", content: "Return exactly: API_OK" } ] }),
      signal: AbortSignal.timeout(25000), cache: "no-store",
    });
    if (!response.ok) {
      const data = await response.json().catch(() => null);
      const code = String(data?.error?.code || "provider_error");
      return Response.json({ providerHttpStatus: response.status, errorCode: /^[a-zA-Z0-9_-]{1,60}$/.test(code) ? code : "provider_error" }, { status: 502 });
    }
    const data = await response.json();
    const ok = String(data?.choices?.[0]?.message?.content || "").trim() === "API_OK";
    return Response.json({ providerHttpStatus: response.status, apiOk: ok }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ error: "provider_connection_failed" }, { status: 502 });
  }
}
