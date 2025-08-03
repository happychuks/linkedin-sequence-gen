/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Anthropic from '@anthropic-ai/sdk';
import {
  AiAdapter,
  AiChatOptions,
  AiChatResponse,
  AiUsage,
} from './ai-adapter.interface';

@Injectable()
export class AnthropicAdapter implements AiAdapter {
  private readonly logger = new Logger(AnthropicAdapter.name);
  private readonly anthropic: Anthropic;
  private defaultModel: string;
  private defaultTemperature: number;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('ANTHROPIC_API_KEY');

    if (!apiKey) {
      this.logger.warn('ANTHROPIC_API_KEY not found in environment variables');
      throw new Error('ANTHROPIC_API_KEY is required for Anthropic adapter');
    }

    this.anthropic = new Anthropic({
      apiKey: apiKey,
    });

    this.defaultModel = this.configService.get<string>(
      'ANTHROPIC_MODEL',
      'claude-3-sonnet-20240229',
    );
    this.defaultTemperature = Number(
      this.configService.get<string>('ANTHROPIC_TEMPERATURE', '0.7'),
    );

    this.logger.log(
      `Anthropic adapter initialized with model: ${this.defaultModel}`,
    );
  }

  async chat(prompt: string, options?: AiChatOptions): Promise<AiChatResponse> {
    const model = options?.model || this.defaultModel;
    const temperature = options?.temperature ?? this.defaultTemperature;
    const maxTokens =
      options?.maxTokens ||
      Number(this.configService.get<string>('ANTHROPIC_MAX_TOKENS', '2000'));

    //this.logger.debug(`Sending request to Anthropic API with model: ${model}`);

    try {
      const systemPrompt = this.configService.get<string>(
        'ANTHROPIC_SYSTEM_PROMPT',
        'You are an experienced sales development representative with very high attention to detail. Generate personalized, natural messages without using ANY placeholders like [Company Name] or [Your Company]. Use specific details from the context provided. Your goal is to generate high-quality LinkedIn outreach sequences based on prospect data and tone of voice guidelines.',
      );

      const response = await this.anthropic.messages.create({
        model: model,
        max_tokens: maxTokens,
        temperature: temperature,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      // Extract content from the response
      let content = '';
      if (response.content && response.content.length > 0) {
        // Handle different content types
        const firstContent = response.content[0];
        if (firstContent.type === 'text') {
          content = firstContent.text;
        }
      }

      const usage: AiUsage = {
        promptTokens: response.usage.input_tokens,
        completionTokens: response.usage.output_tokens,
        totalTokens: response.usage.input_tokens + response.usage.output_tokens,
      };

      /* this.logger.debug(
        `Anthropic API response received. Tokens: ${usage.totalTokens}`,
      );*/

      return {
        content,
        usage,
        model,
      };
    } catch (error) {
      this.logger.error('Error calling Anthropic API:', error);

      // Handle specific Anthropic API errors
      if (error instanceof Anthropic.APIError) {
        this.logger.error(
          `Anthropic API Error: ${error.status} - ${error.message}`,
        );
        throw new Error(`Anthropic API Error: ${error.message}`);
      }

      if (error instanceof Anthropic.AuthenticationError) {
        this.logger.error('Anthropic Authentication Error - check API key');
        throw new Error('Anthropic Authentication Error: Invalid API key');
      }

      if (error instanceof Anthropic.RateLimitError) {
        this.logger.error('Anthropic Rate Limit Error');
        throw new Error('Anthropic Rate Limit Error: Too many requests');
      }

      if (error instanceof Anthropic.BadRequestError) {
        this.logger.error(`Anthropic Bad Request: ${error.message}`);
        throw new Error(`Anthropic Bad Request: ${error.message}`);
      }

      // Generic error fallback
      throw new Error(
        `Anthropic API call failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  getAvailableModels(): string[] {
    return [
      'claude-3-5-sonnet-20241022',
      'claude-3-5-sonnet-20240620',
      'claude-3-opus-20240229',
      'claude-3-sonnet-20240229',
      'claude-3-haiku-20240307',
    ];
  }

  getDefaultModel(): string {
    return this.defaultModel;
  }

  calculateCost(usage: AiUsage, model: string): number {
    // todo: pricing to be reviewed later based on the current models
    const pricing: Record<string, { input: number; output: number }> = {
      'claude-3-5-sonnet-20241022': { input: 0.003, output: 0.015 },
      'claude-3-5-sonnet-20240620': { input: 0.003, output: 0.015 },
      'claude-3-opus-20240229': { input: 0.015, output: 0.075 },
      'claude-3-sonnet-20240229': { input: 0.003, output: 0.015 },
      'claude-3-haiku-20240307': { input: 0.00025, output: 0.00125 },
    };

    const modelPricing = pricing[model] || pricing['claude-3-sonnet-20240229'];
    const inputCost = (usage.promptTokens / 1000) * modelPricing.input;
    const outputCost = (usage.completionTokens / 1000) * modelPricing.output;

    return Math.round((inputCost + outputCost) * 1000000) / 1000000;
  }

  getProviderName(): string {
    return 'anthropic';
  }

  async testConnection(): Promise<boolean> {
    try {
      this.logger.debug('Testing Anthropic API connection...');

      const systemPrompt = this.configService.get<string>(
        'ANTHROPIC_SYSTEM_PROMPT',
        'You are an experienced sales development representative with very high attention to detail. Generate personalized, natural messages without using ANY placeholders like [Company Name] or [Your Company]. Use specific details from the context provided. Your goal is to generate high-quality LinkedIn outreach sequences based on prospect data and tone of voice guidelines.',
      );

      // Simple test message to verify API connectivity
      const response = await this.anthropic.messages.create({
        model: this.defaultModel,
        max_tokens: 10,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: 'Test',
          },
        ],
      });

      this.logger.debug('Anthropic API connection test successful');
      return response !== null;
    } catch (error) {
      this.logger.error('Anthropic API connection test failed:', error);
      return false;
    }
  }
}
