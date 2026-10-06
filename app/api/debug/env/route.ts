import "server-only";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export function GET() {
  return Response.json({
    aiApiKeyPresent: Boolean(process.env.AI_API_KEY),
    aiProviderPresent: Boolean(process.env.AI_PROVIDER),
    aiModelPresent: Boolean(process.env.AI_MODEL),
    aiBaseUrlPresent: Boolean(process.env.AI_BASE_URL),
  }, { headers: { "Cache-Control": "no-store" } });
}
