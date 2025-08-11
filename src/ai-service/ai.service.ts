/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable, Logger } from '@nestjs/common';
import { GenerateSequenceDto } from './dto/generate-sequence.dto';
import { RefineSequenceDto } from './dto/refine-sequence.dto';
import { PromptService } from '../prompt-service/prompt.service';
import { DefaultSequenceFallback } from './fallbacks/default-sequence';
import { SequenceRepository } from '../sequence-service/sequence.repository';
import { TovConfigService } from '../sequence-service/tov-config.service';
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
    private sequenceRepository: SequenceRepository,
    private tovConfigService: TovConfigService,
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

  // Method to refine existing sequence with new TOV parameters
  async refineSequence(refineDto: RefineSequenceDto): Promise<any> {
    const startTime = Date.now();

    try {
      // Validate input
      if (!refineDto.originalSequenceId || refineDto.originalSequenceId <= 0) {
        throw new Error('Original sequence ID must be a positive integer');
      }

      // Get the original sequence
      const originalSequence =
        await this.sequenceRepository.findByIdWithProspect(
          refineDto.originalSequenceId,
        );

      if (!originalSequence) {
        throw new Error(
          `Sequence with ID ${refineDto.originalSequenceId} not found`,
        );
      }

      // Build new prompt with refined TOV
      const newSequenceLength =
        refineDto.newSequenceLength || originalSequence.sequenceLength;
      const { prompt, extractedName } = this.promptBuilder.buildPrompt(
        originalSequence.prospect.url,
        refineDto.newTovConfig,
        originalSequence.companyContext,
        newSequenceLength,
      );

      // Generate refined sequence
      const refinedResult = await this.generateWithRetries(
        prompt,
        newSequenceLength,
        extractedName,
      );

      // Find or create new TOV configuration
      const newTovConfig = await this.tovConfigService.findOrCreate(
        refineDto.newTovConfig.formality,
        refineDto.newTovConfig.warmth,
        refineDto.newTovConfig.directness,
      );

      // Create new sequence record as a refinement
      const newSequence = await this.sequenceRepository.create({
        prospectId: originalSequence.prospectId,
        promptId: originalSequence.promptId,
        tovConfigId: newTovConfig.id,
        messages: refinedResult.sequence,
        thinkingProcess: refinedResult.thinkingProcess || {},
        prospectAnalysis: refinedResult.prospectAnalysis,
        metadata: {
          ...refinedResult.metadata,
          refinement_time_ms: Date.now() - startTime,
          refinementInfo: {
            originalSequenceId: refineDto.originalSequenceId,
            tovChanges: {
              old: {
                formality: originalSequence.tovConfig.formality,
                warmth: originalSequence.tovConfig.warmth,
                directness: originalSequence.tovConfig.directness,
              },
              new: refineDto.newTovConfig,
            },
            lengthChange: {
              old: originalSequence.sequenceLength,
              new: newSequenceLength,
            },
          },
        },
        version: originalSequence.version + 1,
        parentSequenceId: refineDto.originalSequenceId,
        companyContext: originalSequence.companyContext,
        sequenceLength: newSequenceLength,
      });

      const endTime = Date.now();
      const totalRefinementTime = endTime - startTime;

      return {
        refinedSequence: newSequence,
        originalSequence,
        changes: {
          tov: {
            formality: {
              old: originalSequence.tovConfig.formality,
              new: refineDto.newTovConfig.formality,
              change:
                refineDto.newTovConfig.formality -
                originalSequence.tovConfig.formality,
            },
            warmth: {
              old: originalSequence.tovConfig.warmth,
              new: refineDto.newTovConfig.warmth,
              change:
                refineDto.newTovConfig.warmth -
                originalSequence.tovConfig.warmth,
            },
            directness: {
              old: originalSequence.tovConfig.directness,
              new: refineDto.newTovConfig.directness,
              change:
                refineDto.newTovConfig.directness -
                originalSequence.tovConfig.directness,
            },
          },
          sequenceLength: {
            old: originalSequence.sequenceLength,
            new: newSequenceLength,
            changed: originalSequence.sequenceLength !== newSequenceLength,
          },
        },
        metadata: {
          refinement_time_ms: totalRefinementTime,
        },
      };
    } catch (error) {
      this.logger.error(
        `Failed to refine sequence ${refineDto.originalSequenceId}:`,
        error,
      );
      throw new Error(
        `Failed to refine sequence: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  // Method to get refinement history for a sequence
  async getSequenceRefinements(sequenceId: number): Promise<any[]> {
    try {
      // Validate input
      if (!Number.isInteger(sequenceId) || sequenceId <= 0) {
        throw new Error('Sequence ID must be a positive integer');
      }

      const refinements =
        await this.sequenceRepository.findRefinementsByParentId(sequenceId);

      return refinements;
    } catch (error) {
      this.logger.error('Error getting sequence refinements:', {
        sequenceId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  // Method to compare different versions of a sequence
  async compareSequenceVersions(sequenceIds: number[]): Promise<any> {
    try {
      // Validate input
      if (!sequenceIds || sequenceIds.length === 0) {
        throw new Error('No sequence IDs provided for comparison');
      }

      if (sequenceIds.some((id) => !Number.isInteger(id) || id <= 0)) {
        throw new Error('All sequence IDs must be positive integers');
      }

      const sequences =
        await this.sequenceRepository.findManyByIds(sequenceIds);

      // Check if all requested sequences were found
      if (sequences.length === 0) {
        throw new Error('No sequences found with the provided IDs');
      }

      if (sequences.length !== sequenceIds.length) {
        const foundIds = sequences.map((seq) => seq.id);
        const missingIds = sequenceIds.filter((id) => !foundIds.includes(id));
        throw new Error(
          `Sequences not found with IDs: ${missingIds.join(', ')}`,
        );
      }

      return {
        sequences,
        comparison: {
          tovEvolution: sequences.map((seq) => ({
            version: seq.version,
            tov: {
              formality: seq.tovConfig.formality,
              warmth: seq.tovConfig.warmth,
              directness: seq.tovConfig.directness,
            },
            createdAt: seq.createdAt,
          })),
          messageQualityTrends: sequences.map((seq) => {
            const messages = Array.isArray(seq.messages) ? seq.messages : [];

            // Calculate actual average confidence from messages
            let totalConfidence = 0;
            let messageCount = 0;

            messages.forEach((message: any) => {
              if (message && typeof message.confidence === 'number') {
                totalConfidence += message.confidence;
                messageCount++;
              }
            });

            const averageConfidence =
              messageCount > 0 ? totalConfidence / messageCount : 0;

            return {
              version: seq.version,
              averageConfidence: Math.round(averageConfidence * 100) / 100, // Round to 2 decimal places
              messageCount: messages.length,
            };
          }),
        },
      };
    } catch (error) {
      this.logger.error('Error comparing sequence versions:', {
        sequenceIds,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error; // Re-throw to be handled by the controller/global filter
    }
  }
}
