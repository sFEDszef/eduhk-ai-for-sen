import type { AIProvider } from "@/lib/ai/types";
import type { TeacherInput } from "@/types/generation";
import type { RetrievedChunk } from "@/lib/knowledge/types";
import { pedagogySchema } from "@/lib/validation/schemas";
import { pedagogyPrompt } from "@/lib/prompts/pedagogy";
export function pedagogyAgent(ai: AIProvider,input:TeacherInput,knowledge:RetrievedChunk[]){return ai.generate(pedagogyPrompt,{teacherInput:input,retrievedKnowledge:knowledge},pedagogySchema);}
