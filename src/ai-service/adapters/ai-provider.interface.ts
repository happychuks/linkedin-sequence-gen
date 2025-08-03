export interface AiProvider {
  generateSequence(params: { prompt: string; model: string }): Promise<{
    output: string;
    usage?: {
      prompt_tokens: number;
      completion_tokens: number;
      total_tokens: number;
    };
    rawResponse?: any;
  }>;
}
