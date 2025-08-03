/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable, Logger } from '@nestjs/common';
import { aiResponseSchema } from '../schemas/ai-response.schema';

export interface AiResponse {
  content: string;
  model: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

@Injectable()
export class AiResponseProcessorService {
  private readonly logger = new Logger(AiResponseProcessorService.name);

  processResponse(
    response: AiResponse,
    calculateCost: (usage: any, model: string) => number,
  ): any {
    // Calculate cost using the adapter
    const actualCost = calculateCost(response.usage, response.model);

    let parsed: unknown;
    try {
      // Try to extract JSON from the response
      const jsonContent = this.extractJSON(response.content);
      parsed = JSON.parse(jsonContent);
    } catch (error) {
      this.logger.error('Failed to parse JSON from AI response:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        rawContent: response.content.substring(0, 500), // Log first 500 chars for debugging
      });
      throw new Error('Invalid JSON from AI');
    }

    // Pre-process the parsed data to fix cost type issues
    if (parsed && typeof parsed === 'object' && 'metadata' in parsed) {
      const parsedObj = parsed as any;
      if (parsedObj.metadata && 'cost' in parsedObj.metadata) {
        // Convert cost to number if it's a string
        if (typeof parsedObj.metadata.cost === 'string') {
          parsedObj.metadata.cost = parseFloat(parsedObj.metadata.cost) || 0;
        }
      }
    }

    const validated = aiResponseSchema.safeParse(parsed);
    if (!validated.success) {
      this.logger.error(
        'AI response validation error',
        validated.error.format(),
      );
      this.logger.error('Raw parsed data:', JSON.stringify(parsed, null, 2));
      throw new Error('AI response schema mismatch');
    }

    // Update the metadata with actual cost, model used, and token usage
    const result = validated.data;
    if (result.metadata) {
      result.metadata.cost = actualCost;
      result.metadata.model_used = response.model;
      result.metadata.promptTokens = response.usage.promptTokens;
      result.metadata.completionTokens = response.usage.completionTokens;
      result.metadata.totalTokens = response.usage.totalTokens;
    }

    return result;
  }

  extractJSON(content: string): string {
    // Try to find JSON object in the response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return jsonMatch[0];
    }

    // If no JSON object found, try to find JSON starting with array
    const arrayMatch = content.match(/\[[\s\S]*\]/);
    if (arrayMatch) {
      return arrayMatch[0];
    }

    // If still no match, return the original content and let JSON.parse handle the error
    return content.trim();
  }
}
