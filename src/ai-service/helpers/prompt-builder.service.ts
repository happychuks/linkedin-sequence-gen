import { Injectable, Logger } from '@nestjs/common';
import { GenerateSequenceDto } from '../dto/generate-sequence.dto';
import { convertTOVtoDescriptors } from '../../common/utils/tov-utils';
import { LinkedInNameExtractorService } from './linkedin-name-extractor.service';

@Injectable()
export class PromptBuilderService {
  private readonly logger = new Logger(PromptBuilderService.name);

  constructor(private nameExtractor: LinkedInNameExtractorService) {}

  buildPrompt(
    prospectUrl: string,
    tov: GenerateSequenceDto['tov_config'],
    context: string,
    len: number,
  ): { prompt: string; extractedName: string } {
    const tone = convertTOVtoDescriptors(tov);
    const extractedName = this.nameExtractor.extractFromUrl(prospectUrl);

    const prompt = this.constructPromptText(
      extractedName,
      prospectUrl,
      context,
      tone,
      len,
    );

    return { prompt, extractedName };
  }

  private constructPromptText(
    extractedName: string,
    prospectUrl: string,
    context: string,
    tone: string,
    len: number,
  ): string {
    return `
CRITICAL INSTRUCTION: The prospect's name is "${extractedName}". You MUST use this exact name.

You are writing a ${len}-step LinkedIn outreach sequence for:

PROSPECT: ${extractedName}
URL: ${prospectUrl}
CONTEXT: ${context}
TONE: ${tone}

ABSOLUTE REQUIREMENTS:
- Start every message with "Hi ${extractedName}" or "Hello ${extractedName}"
- Provide realistic confidence scores based on message quality and personalization level
- Confidence should reflect: personalization depth, context relevance, tone appropriateness, and call-to-action clarity

CONFIDENCE SCORING GUIDELINES:
- 0.9-1.0: Highly personalized with specific context, perfect tone match, clear value proposition
- 0.7-0.89: Well personalized with good context, appropriate tone, solid messaging
- 0.5-0.69: Moderately personalized, decent context, acceptable tone
- 0.3-0.49: Generic messaging with minimal personalization
- 0.1-0.29: Poor quality, weak personalization, unclear messaging

NOTE: Start with 0.5 as baseline for decent messages, then adjust up/down based on quality factors.

JSON FORMAT REQUIRED:
{
  "sequence": [
    {
      "message": "Hi ${extractedName}, [your personalized message here]",
      "type": "opening",
      "confidence": 0.65,
      "aiReasoning": "explanation"
    },
    {
      "message": "Follow-up message using ${extractedName}",
      "type": "follow-up", 
      "confidence": 0.58,
      "aiReasoning": "explanation"
    },
    {
      "message": "Final message with ${extractedName}",
      "type": "call-to-action",
      "confidence": 0.62,
      "aiReasoning": "explanation"
    }
  ],
  "thinking_process": {
    "analysis": "analysis",
    "tone_of_voice": "tone description", 
    "sequence_logic": "logic"
  },
  "prospect_analysis": "detailed analysis of the prospect based on their LinkedIn profile and context",
  "metadata": {
    "model_used": "auto",
    "cost": "auto"
  }
}

VALID MESSAGE TYPES: "opening", "follow-up", "call-to-action", "closing"`;
  }
}
