export type KnowledgeItem = {id: string; category: string; grade: string[]; topic: string[]; supportType: string[]; outputType: string[]; scaffolding: string[]; content: string; source: string; sourceUrl?: string; provenance: "project_design_principle" | "official_source_summary"};
export type RetrievedChunk = KnowledgeItem & { score: number };
