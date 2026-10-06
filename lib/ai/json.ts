import { z } from "zod";
import { GenerationError } from "./types";
export function parseModelJSON<T>(raw: string, schema: z.ZodType<T>): T {
 const cleaned = raw.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
 const start=cleaned.indexOf("{"); const end=cleaned.lastIndexOf("}");
 for(const candidate of [cleaned, cleaned.slice(start,end+1)]){
  try { const result=schema.safeParse(JSON.parse(candidate)); if(result.success) return result.data; } catch { /* Try extracting the JSON object before reporting failure. */ }
 }
 throw new GenerationError("malformed_output", "The AI returned an incomplete or invalid draft. Please try again.");
}
