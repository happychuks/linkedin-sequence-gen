/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import {
  AiAdapter,
  AiChatOptions,
  AiChatResponse,
  AiUsage,
} from './ai-adapter.interface';

@Injectable()
export class OpenAiAdapter implements AiAdapter {
  private openai: OpenAI;
  private defaultModel: string;
  private defaultTemperature: number;

  constructor(private configService: ConfigService) {
    this.openai = new OpenAI({
      apiKey: this.configService.get<string>('OPENAI_API_KEY'),
    });

    this.defaultModel = this.configService.get<string>(
      'OPENAI_MODEL',
      'gpt-3.5-turbo',
    );
    this.defaultTemperature = Number(
      this.configService.get<string>('OPENAI_TEMPERATURE', '0.7'),
    );
  }

  async chat(prompt: string, options?: AiChatOptions): Promise<AiChatResponse> {
    const model = options?.model || this.defaultModel;
    const temperature = options?.temperature ?? this.defaultTemperature;
    const maxTokens =
      options?.maxTokens ||
      Number(this.configService.get<string>('OPENAI_MAX_TOKENS', '2000'));

    const response = await this.openai.chat.completions.create({
      model,
      temperature,
      max_tokens: maxTokens,
      messages: [
        {
          role: 'system',
          content: this.configService.get<string>(
            'OPENAI_SYSTEM_PROMPT',
            'You are an experienced sales development representative with very high attention to detail. Generate personalized, natural messages without using ANY placeholders like [Company Name] or [Your Company]. Use specific details from the context provided. Your goal is to generate high-quality LinkedIn outreach sequences based on prospect data and tone of voice guidelines.',
          ),
        },
        { role: 'user', content: prompt },
      ],
    });

    const content = response.choices?.[0]?.message?.content || '';
    const usage: AiUsage = {
      promptTokens: response.usage?.prompt_tokens || 0,
      completionTokens: response.usage?.completion_tokens || 0,
      totalTokens: response.usage?.total_tokens || 0,
    };

    return {
      content,
      usage,
      model,
    };
  }

  getAvailableModels(): string[] {
    return ['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo', 'gpt-3.5-turbo-16k'];
  }

  getDefaultModel(): string {
    return this.defaultModel;
  }

  calculateCost(usage: AiUsage, model: string): number {
    const pricing: Record<string, { input: number; output: number }> = {
      'gpt-4': { input: 0.03, output: 0.06 },
      'gpt-4-turbo': { input: 0.01, output: 0.03 },
      'gpt-3.5-turbo': { input: 0.0015, output: 0.002 },
      'gpt-3.5-turbo-16k': { input: 0.003, output: 0.004 },
    };

    const modelPricing = pricing[model] || pricing['gpt-3.5-turbo'];
    const inputCost = (usage.promptTokens / 1000) * modelPricing.input;
    const outputCost = (usage.completionTokens / 1000) * modelPricing.output;

    return Math.round((inputCost + outputCost) * 1000000) / 1000000;
  }

  getProviderName(): string {
    return 'OpenAI';
  }
}
