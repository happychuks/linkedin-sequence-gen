import { z } from 'zod';

export const aiMessageSchema = z.object({
  message: z.string(),
  type: z.enum(['opening', 'follow-up', 'call-to-action', 'closing']),
  confidence: z.number().optional(),
  aiReasoning: z.string().optional(),
});

export const thinkingProcessSchema = z.object({
  analysis: z.string(),
  tone_of_voice: z.string(),
  sequence_logic: z.string(),
});

export const metadataSchema = z.object({
  model_used: z.string(),
  cost: z.number(),
  promptTokens: z.number().optional(),
  completionTokens: z.number().optional(),
  totalTokens: z.number().optional(),
});

export const aiResponseSchema = z.object({
  sequence: z.array(aiMessageSchema),
  thinking_process: thinkingProcessSchema,
  prospect_analysis: z.string(),
  metadata: metadataSchema,
});

// Type exports for TypeScript
export type AiMessage = z.infer<typeof aiMessageSchema>;
export type ThinkingProcess = z.infer<typeof thinkingProcessSchema>;
export type Metadata = z.infer<typeof metadataSchema>;
export type AiResponse = z.infer<typeof aiResponseSchema>;
