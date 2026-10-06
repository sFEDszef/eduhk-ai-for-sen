import "server-only";
import { z } from "zod";
import { parseModelJSON } from "./json";
import { GenerationError, type AIProvider } from "./types";
export function createProvider(): AIProvider {
 const provider = process.env.AI_PROVIDER || "deepseek";
 if(!["deepseek", "openai", "compatible"].includes(provider)) throw new GenerationError("configuration", "The AI provider configuration needs administrator attention.");
 const key = process.env.AI_API_KEY;
 if(!key) throw new GenerationError("missing_key", "Generation is awaiting an API key. Configure the server’s AI environment variables, then try again.");
 const base = process.env.AI_BASE_URL || (provider === "deepseek" ? "https://api.deepseek.com" : "https://api.openai.com/v1");
 let url: URL;
 try { url=new URL(base.replace(/\/$/, "") + "/chat/completions"); if(url.protocol!=="https:" || url.username || url.password) throw new Error(); } catch { throw new GenerationError("configuration", "The AI provider configuration needs administrator attention."); }
 const model=process.env.AI_MODEL || (provider === "deepseek" ? "deepseek-chat" : "gpt-4.1-mini");
 return {async generate<T>(system: string, context: unknown, schema: z.ZodType<T>): Promise<T> {
  try {
   const response=await fetch(url,{method:"POST",headers:{"Content-Type":"application/json", Authorization:`Bearer ${key}`},body:JSON.stringify({model,temperature:0.2,max_tokens:6500,response_format:{type:"json_object"},messages:[{role:"system",content:system + "\nReturn one JSON object matching this JSON schema exactly:\n" + JSON.stringify(z.toJSONSchema(schema))},{role:"user",content:JSON.stringify(context)}]}),signal:AbortSignal.timeout(80000),cache:"no-store"});
   if(!response.ok) throw new GenerationError("provider_error", "The AI provider could not complete the request. Check provider access and quota, then try again.");
   const body=await response.json(); const raw=body?.choices?.[0]?.message?.content;
   if(typeof raw!=="string") throw new GenerationError("malformed_output","The AI returned an incomplete draft. Please try again.");
   return parseModelJSON(raw,schema);
  } catch(error) {
   if(error instanceof GenerationError) throw error;
   if(error instanceof Error && ["TimeoutError", "AbortError"].includes(error.name)) throw new GenerationError("timeout", "The AI request took too long. Please try again.");
   throw new GenerationError("network", "We couldn’t reach the AI provider. Please try again.");
  }
 }};
}
