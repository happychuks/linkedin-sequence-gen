/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Groq from 'groq-sdk';
import {
  AiAdapter,
  AiChatOptions,
  AiChatResponse,
  AiUsage,
} from './ai-adapter.interface';

@Injectable()
export class GroqAdapter implements AiAdapter {
  private groq: Groq;
  private defaultModel: string;
  private defaultTemperature: number;

  constructor(private configService: ConfigService) {
    this.groq = new Groq({
      apiKey: this.configService.get<string>('GROQ_API_KEY'),
    });

    this.defaultModel = this.configService.get<string>(
      'GROQ_MODEL',
      'llama-3.3-70b-versatile',
    );
    this.defaultTemperature = Number(
      this.configService.get<string>('GROQ_TEMPERATURE', '0.7'),
    );
  }

  async chat(prompt: string, options?: AiChatOptions): Promise<AiChatResponse> {
    const model = options?.model || this.defaultModel;
    const temperature = options?.temperature ?? this.defaultTemperature;
    const maxTokens =
      options?.maxTokens ||
      Number(this.configService.get<string>('GROQ_MAX_TOKENS', '2000'));

    const response = await this.groq.chat.completions.create({
      model,
      temperature,
      max_tokens: maxTokens,
      messages: [
        {
          role: 'system',
          content: this.configService.get<string>(
            'GROQ_SYSTEM_PROMPT',
            'You are an experienced sales development representative with very high attention to detail. Generate personalized, natural messages without using ANY placeholders like [Company Name] or [Your Company]. Use specific details from the context provided. Your goal is to generate high-quality LinkedIn outreach sequences based on prospect data and tone of voice guidelines.',
          ),
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const choice = response.choices[0];
    if (!choice.message.content) {
      throw new Error('No content received from Groq API');
    }

    return {
      content: choice.message.content,
      usage: {
        promptTokens: response.usage?.prompt_tokens || 0,
        completionTokens: response.usage?.completion_tokens || 0,
        totalTokens: response.usage?.total_tokens || 0,
      },
      model: response.model,
    };
  }

  getAvailableModels(): string[] {
    return [
      'llama-3.3-70b-versatile',
      'llama-3.3-70b-specdec',
      'llama-3.1-8b-instant',
      'gemma2-9b-it',
      'qwen3-32b',
      'deepseek-r1-distill-llama-70b',
      'moonshotai/kimi-k2-instruct',
    ];
  }

  getDefaultModel(): string {
    return this.defaultModel;
  }

  calculateCost(usage: AiUsage, model: string): number {
    // todo: check updated Groq pricing on their website
    // Groq pricing (current models only) - prices per 1M tokens
    const pricingMap: Record<string, { input: number; output: number }> = {
      // Llama 3.3 models (latest)
      'llama-3.3-70b-versatile': { input: 0.59, output: 0.79 },
      'llama-3.3-70b-specdec': { input: 0.59, output: 0.79 },
      // Llama 3.1 models
      'llama-3.1-8b-instant': { input: 0.05, output: 0.08 },
      // Gemma models
      'gemma2-9b-it': { input: 0.2, output: 0.2 },
      // Qwen models
      'qwen3-32b': { input: 0.3, output: 0.4 },
      // DeepSeek models
      'deepseek-r1-distill-llama-70b': { input: 0.59, output: 0.79 },
      // Moonshot AI models
      'moonshotai/kimi-k2-instruct': { input: 0.4, output: 0.6 },
    };

    const pricing = pricingMap[model] || { input: 0.05, output: 0.08 }; // fallback to llama3-8b pricing

    const inputCost = (usage.promptTokens / 1_000_000) * pricing.input;
    const outputCost = (usage.completionTokens / 1_000_000) * pricing.output;

    return Math.round((inputCost + outputCost) * 1000000) / 1000000;
  }

  getProviderName(): string {
    return 'groq';
  }
}
