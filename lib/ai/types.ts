import type { z } from "zod";
export type AIProvider = {
  generate<T>(
    system: string,
    context: unknown,
    schema: z.ZodType<T>,
  ): Promise<T>;
};
export class GenerationError extends Error {
  constructor(
    public code: string,
    message: string,
  ) {
    super(message);
  }
}
