import type { z } from "zod";
import type { inputSchema, materialSchema, pedagogySchema, reviewSchema } from "@/lib/validation/schemas";
import type { RetrievedChunk } from "@/lib/knowledge/types";
export type TeacherInput = z.infer<typeof inputSchema>;
export type Material = z.infer<typeof materialSchema>;
export type Pedagogy = z.infer<typeof pedagogySchema>;
export type Review = z.infer<typeof reviewSchema>;
export type GenerationResult = {input: TeacherInput; knowledge: RetrievedChunk[]; pedagogy: Pedagogy; material: Material; review: Review};
export type Stage = "Understanding teaching needs…" | "Retrieving relevant support strategies…" | "Applying pedagogical principles…" | "Generating teaching material…" | "Reviewing the draft…";
