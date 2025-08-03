/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable, Logger } from '@nestjs/common';
import { GenerateSequenceDto } from './dto/generate-sequence.dto';
import { PromptService } from '../prompt-service/prompt.service';
import { DefaultSequenceFallback } from './fallbacks/default-sequence';
import { PrismaService } from '../prisma/prisma.service';
import { AiAdapterFactory } from './adapters/ai-adapter.factory';

// Import helper services
import { PromptBuilderService } from './helpers/prompt-builder.service';
import { AiResponseProcessorService } from './helpers/ai-response-processor.service';
import { ConfidenceScoreOptimizerService } from './helpers/confidence-score-optimizer.service';
import { ModelSelectionStrategyService } from './helpers/model-selection-strategy.service';
import { LinkedInNameExtractorService } from './helpers/linkedin-name-extractor.service';
import { aiResponseSchema } from './schemas/ai-response.schema';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor(
    private aiAdapterFactory: AiAdapterFactory,
    private promptService: PromptService,
    private prisma: PrismaService,
    private promptBuilder: PromptBuilderService,
    private responseProcessor: AiResponseProcessorService,
    private confidenceOptimizer: ConfidenceScoreOptimizerService,
    private modelSelector: ModelSelectionStrategyService,
    private nameExtractor: LinkedInNameExtractorService,
  ) {}

  buildPrompt(
    prospectUrl: string,
    tov: GenerateSequenceDto['tov_config'],
    context: string,
    len: number,
  ): string {
    const { prompt } = this.promptBuilder.buildPrompt(
      prospectUrl,
      tov,
      context,
      len,
    );
    return prompt;
  }

  async generateWithRetries(
    prompt: string,
    sequenceLength: number = 3,
    extractedName?: string,
  ): Promise<any> {
    const optimalModel = this.selectOptimalModel(sequenceLength);
    const adapter = this.aiAdapterFactory.getAdapter();

    for (let i = 0; i < 2; i++) {
      try {
        // Use optimal model for first attempt, fallback to a simpler model for retry
        let modelToUse = optimalModel;
        if (i === 1) {
          // Fallback strategy based on provider
          if (adapter.getProviderName() === 'groq') {
            modelToUse = 'llama-3.1-8b-instant'; // Fast, reliable Groq model
          } else if (adapter.getProviderName() === 'openai') {
            modelToUse = 'gpt-3.5-turbo'; // OpenAI fallback
          } else {
            modelToUse = adapter.getDefaultModel(); // Provider default
          }
        }
        const result = await this.generate(prompt, { model: modelToUse });

        // Optimize confidence scores if we have the extracted name
        if (extractedName && result.sequence) {
          result.sequence = this.optimizeConfidenceScores(
            result.sequence,
            extractedName,
          );
        }

        return result;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Unknown error';
        this.logger.warn(
          `AI generation attempt ${i + 1} failed: ${errorMessage}`,
        );
      }
    }
    this.logger.error('All AI retries failed, using fallback.');
    return DefaultSequenceFallback;
  }

  private async generate(
    prompt: string,
    options?: {
      model?: string;
      temperature?: number;
    },
  ): Promise<any> {
    const adapter = this.aiAdapterFactory.getAdapter();
    const response = await adapter.chat(prompt, options);

    // this.logger.debug('Raw AI response:', response.content);

    // Calculate cost using the adapter
    const actualCost = adapter.calculateCost(response.usage, response.model);

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
      result.metadata.cost = actualCost; // Ensure we use the properly calculated cost
      result.metadata.model_used = response.model;
      result.metadata.promptTokens = response.usage.promptTokens;
      result.metadata.completionTokens = response.usage.completionTokens;
      result.metadata.totalTokens = response.usage.totalTokens;
    }

    return result;
  }

  // Method to optimize confidence scores based on objective criteria
  private optimizeConfidenceScores(
    sequence: any[],
    extractedName: string,
  ): any[] {
    return this.confidenceOptimizer.optimizeScores(sequence, extractedName);
  }

  // Method to extract JSON from AI response that might contain extra text
  private extractJSON(content: string): string {
    return this.responseProcessor.extractJSON(content);
  }

  // Method to extract name from LinkedIn URL
  extractNameFromLinkedInUrl(url: string): string {
    return this.nameExtractor.extractFromUrl(url);
  }

  // Method to select optimal model based on sequence complexity
  private selectOptimalModel(
    sequenceLength: number,
    complexity: 'simple' | 'medium' | 'complex' = 'medium',
  ): string {
    const adapter = this.aiAdapterFactory.getAdapter();
    return this.modelSelector.selectOptimalModel(
      sequenceLength,
      complexity,
      adapter,
    );
  }

  // Method to get current AI provider information
  getProviderInfo() {
    return this.aiAdapterFactory.getProviderInfo();
  }

  // Method to switch AI provider at runtime
  switchProvider(provider: 'openai' | 'anthropic' | 'groq') {
    this.aiAdapterFactory.switchProvider(provider);
    this.logger.log(`Switched to ${provider} provider`);
  }
}
