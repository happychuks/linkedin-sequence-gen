/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable } from '@nestjs/common';

@Injectable()
export class ModelSelectionStrategyService {
  selectOptimalModel(
    sequenceLength: number,
    complexity: 'simple' | 'medium' | 'complex' = 'medium',
    adapter: any,
  ): string {
    const availableModels = adapter.getAvailableModels();
    const defaultModel = adapter.getDefaultModel();

    // For OpenAI
    if (adapter.getProviderName() === 'openai') {
      return this.selectOpenAIModel(
        complexity,
        sequenceLength,
        availableModels,
        defaultModel,
      );
    }

    // For Anthropic
    if (adapter.getProviderName() === 'anthropic') {
      return this.selectAnthropicModel(
        complexity,
        sequenceLength,
        availableModels,
        defaultModel,
      );
    }

    // For Groq
    if (adapter.getProviderName() === 'groq') {
      return this.selectGroqModel(
        complexity,
        sequenceLength,
        availableModels,
        defaultModel,
      );
    }

    return defaultModel;
  }

  getFallbackModel(providerName: string): string {
    switch (providerName) {
      case 'groq':
        return 'llama-3.1-8b-instant';
      case 'openai':
        return 'gpt-3.5-turbo';
      default:
        return 'default';
    }
  }

  private selectOpenAIModel(
    complexity: string,
    sequenceLength: number,
    availableModels: string[],
    defaultModel: string,
  ): string {
    if (complexity === 'complex' || sequenceLength === 4) {
      return availableModels.includes('gpt-4') ? 'gpt-4' : defaultModel;
    } else if (complexity === 'medium' || sequenceLength === 3) {
      return availableModels.includes('gpt-3.5-turbo')
        ? 'gpt-3.5-turbo'
        : defaultModel;
    } else {
      return defaultModel;
    }
  }

  private selectAnthropicModel(
    complexity: string,
    sequenceLength: number,
    availableModels: string[],
    defaultModel: string,
  ): string {
    if (complexity === 'complex' || sequenceLength === 4) {
      return availableModels.includes('claude-3-opus-20240229')
        ? 'claude-3-opus-20240229'
        : defaultModel;
    } else if (complexity === 'medium' || sequenceLength === 3) {
      return availableModels.includes('claude-3-sonnet-20240229')
        ? 'claude-3-sonnet-20240229'
        : defaultModel;
    } else {
      return availableModels.includes('claude-3-haiku-20240307')
        ? 'claude-3-haiku-20240307'
        : defaultModel;
    }
  }

  private selectGroqModel(
    complexity: string,
    sequenceLength: number,
    availableModels: string[],
    defaultModel: string,
  ): string {
    if (complexity === 'complex' || sequenceLength === 4) {
      return availableModels.includes('deepseek-r1-distill-llama-70b')
        ? 'deepseek-r1-distill-llama-70b'
        : availableModels.includes('llama-3.3-70b-versatile')
          ? 'llama-3.3-70b-versatile'
          : defaultModel;
    } else if (complexity === 'medium' || sequenceLength === 3) {
      return availableModels.includes('llama-3.3-70b-versatile')
        ? 'llama-3.3-70b-versatile'
        : availableModels.includes('llama-3.3-70b-specdec')
          ? 'llama-3.3-70b-specdec'
          : defaultModel;
    } else {
      // For simple tasks, use faster models
      return availableModels.includes('llama-3.1-8b-instant')
        ? 'llama-3.1-8b-instant'
        : availableModels.includes('gemma2-9b-it')
          ? 'gemma2-9b-it'
          : defaultModel;
    }
  }
}
