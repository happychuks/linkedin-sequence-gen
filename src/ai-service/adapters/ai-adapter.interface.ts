export interface AiUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export interface AiChatResponse {
  content: string;
  usage: AiUsage;
  model: string;
}

export interface AiChatOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface AiAdapter {
  /**
   * Send a chat completion request to the AI provider
   */
  chat(prompt: string, options?: AiChatOptions): Promise<AiChatResponse>;

  /**
   * Get available models for this provider
   */
  getAvailableModels(): string[];

  /**
   * Get the default model for this provider
   */
  getDefaultModel(): string;

  /**
   * Calculate cost based on usage and model
   */
  calculateCost(usage: AiUsage, model: string): number;

  /**
   * Get provider name
   */
  getProviderName(): string;

  /**
   * Test connection to the AI provider
   */
  testConnection?(): Promise<boolean>;
}
