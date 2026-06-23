import { z } from "zod";

export const compileRequestSchema = z.object({
  prompt: z
    .string()
    .min(10, "Prompt must be at least 10 characters long.")
    .max(5000, "Prompt cannot exceed 5000 characters."),
  complexity: z.enum(["low", "medium", "high", "critical"]).default("medium"),
  userId: z.string().optional(),
});

export type CompileRequest = z.infer<typeof compileRequestSchema>;
