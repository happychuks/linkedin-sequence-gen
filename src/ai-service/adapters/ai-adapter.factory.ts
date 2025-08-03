import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AiAdapter } from './ai-adapter.interface';
import { OpenAiAdapter } from './openai.adapter';
import { AnthropicAdapter } from './anthropic.adapter';
import { GroqAdapter } from './groq.adapter';

export type SupportedAiProvider = 'openai' | 'anthropic' | 'groq';

@Injectable()
export class AiAdapterFactory {
  private readonly logger = new Logger(AiAdapterFactory.name);
  private adapter: AiAdapter;

  constructor(
    private configService: ConfigService,
    private openAiAdapter: OpenAiAdapter,
    private anthropicAdapter: AnthropicAdapter,
    private groqAdapter: GroqAdapter,
  ) {
    const provider = this.getProviderFromConfig();
    this.adapter = this.createAdapter(provider);
    this.logger.log(
      `Initialized AI adapter: ${this.adapter.getProviderName()}`,
    );
  }

  /**
   * Get the current AI adapter instance
   */
  getAdapter(): AiAdapter {
    return this.adapter;
  }

  /**
   * Switch to a different AI provider at runtime
   */
  switchProvider(provider: SupportedAiProvider): void {
    this.adapter = this.createAdapter(provider);
    this.logger.log(
      `Switched AI adapter to: ${this.adapter.getProviderName()}`,
    );
  }

  /**
   * Get information about the current provider
   */
  getProviderInfo() {
    return {
      provider: this.adapter.getProviderName(),
      defaultModel: this.adapter.getDefaultModel(),
      availableModels: this.adapter.getAvailableModels(),
    };
  }

  /**
   * Get all supported providers
   */
  getSupportedProviders(): SupportedAiProvider[] {
    return ['openai', 'anthropic', 'groq'];
  }

  private getProviderFromConfig(): SupportedAiProvider {
    const providerConfig = this.configService.get<string>(
      'AI_PROVIDER',
      'groq',
    );
    const provider = (providerConfig || 'groq').toLowerCase();

    if (
      !this.getSupportedProviders().includes(provider as SupportedAiProvider)
    ) {
      this.logger.warn(
        `Invalid AI provider '${providerConfig}' in config. Falling back to 'openai'`,
      );
      return 'openai';
    }

    return provider as SupportedAiProvider;
  }

  private createAdapter(provider: SupportedAiProvider): AiAdapter {
    switch (provider) {
      case 'groq':
        return this.groqAdapter;
      case 'openai':
        return this.openAiAdapter;
      case 'anthropic':
        return this.anthropicAdapter;
      default: {
        // This should never happen due to TypeScript typing, but just in case
        const errorMsg = `Unsupported AI provider: ${String(provider)}`;
        this.logger.error(errorMsg);
        throw new Error(errorMsg);
      }
    }
  }
}
