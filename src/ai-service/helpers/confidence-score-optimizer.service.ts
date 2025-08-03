/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Injectable, Logger } from '@nestjs/common';

export interface MessageWithConfidence {
  message: string;
  type: string;
  confidence: number;
  aiReasoning?: string;
}

@Injectable()
export class ConfidenceScoreOptimizerService {
  private readonly logger = new Logger(ConfidenceScoreOptimizerService.name);

  optimizeScores(
    sequence: any[],
    extractedName: string,
  ): MessageWithConfidence[] {
    return sequence.map((message) => {
      const baseScore = 0.5; // default starting point
      let bonus = 0;

      const messageText =
        typeof message.message === 'string' ? message.message.trim() : '';
      const msgLower = messageText.toLowerCase();
      const nameLower = extractedName.toLowerCase();
      const messageLen = messageText.length;

      // Personalization (Name usage)
      if (msgLower.includes(nameLower)) bonus += 0.1;

      // Contextual richness
      if (messageLen >= 120 && messageLen <= 300) bonus += 0.1;
      else if (messageLen > 400) bonus -= 0.05;
      else if (messageLen < 50) bonus -= 0.1;

      // CTA detection
      const ctaWords = [
        'connect',
        'chat',
        'schedule',
        'meeting',
        'call',
        'discuss',
        'calendar',
      ];
      if (message.type === 'call-to-action') {
        const hasCTA = ctaWords.some((word) => msgLower.includes(word));
        bonus += hasCTA ? 0.1 : -0.1;
      }

      // Message type fine-tuning
      if (message.type === 'opening' && msgLower.startsWith('hi '))
        bonus += 0.05;
      if (message.type === 'closing' && msgLower.includes('looking forward'))
        bonus += 0.03;

      // AI Reasoning presence
      if (message.aiReasoning && message.aiReasoning.length > 20) bonus += 0.05;

      // Clamp & round
      const finalScore = Math.max(0.1, Math.min(1.0, baseScore + bonus));
      const roundedScore = Math.round(finalScore * 100) / 100;

      return {
        ...message,
        confidence: roundedScore,
      };
    });
  }
}
