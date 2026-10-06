import type { GenerationResult } from "@/types/generation";
export type ExportResult = Pick<
  GenerationResult,
  "input" | "material" | "review"
>;
