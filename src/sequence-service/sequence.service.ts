/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import { Injectable } from '@nestjs/common';
import { GenerateSequenceDto } from '../ai-service/dto/generate-sequence.dto';
import { AiService } from '../ai-service/ai.service';
import { PromptService } from '../prompt-service/prompt.service';
import { SequenceRepository } from './sequence.repository';
import { ProspectRepository } from './prospect.repository';

@Injectable()
export class SequenceService {
  constructor(
    private readonly sequenceRepository: SequenceRepository,
    private readonly prospectRepository: ProspectRepository,
    private readonly ai: AiService,
    private readonly promptService: PromptService,
  ) {}

  async generate(dto: GenerateSequenceDto) {
    const prospect = await this.prospectRepository.upsert(dto.prospect_url);

    const activePrompt = await this.promptService.getActivePrompt();

    // Always build a fresh prompt based on current request data
    const freshPrompt = this.ai.buildPrompt(
      dto.prospect_url,
      dto.tov_config,
      dto.company_context,
      dto.sequence_length,
    );

    let promptText = freshPrompt;
    let shouldSaveNewPrompt = true;

    // If we have an active prompt, check if it's identical to the fresh one
    if (activePrompt) {
      if (activePrompt.content === freshPrompt) {
        // console.log(
        //   'Prompt is identical to cached version - reusing cached prompt',
        // );
        promptText = activePrompt.content;
        shouldSaveNewPrompt = false;
      } else {
        // console.log(
        //   'Prompt differs from cached version - using fresh prompt',
        // );
      }
    } else {
      // console.log('No cached prompt found - using fresh prompt');
    }

    // Only save prompt if we built a fresh one that's different from cached
    let promptRecord;
    if (shouldSaveNewPrompt && promptText === freshPrompt) {
      promptRecord = await this.promptService.savePrompt(promptText);
    } else if (activePrompt) {
      promptRecord = activePrompt;
    } else {
      promptRecord = await this.promptService.savePrompt(promptText);
    }
    const result = await this.ai.generateWithRetries(
      promptText,
      dto.sequence_length,
      this.ai.extractNameFromLinkedInUrl(dto.prospect_url),
    );

    await this.sequenceRepository.create({
      prospectId: prospect.id,
      promptId: promptRecord.id,
      messages: result.sequence,
      thinkingProcess: result.thinking_process,
      prospectAnalysis: result.prospect_analysis,
      metadata: result.metadata,
    });

    return {
      sequence: result.sequence.map((m: any) => ({
        message: m.message,
        type: m.type,
        confidence: m.confidence,
        aiReasoning: m.aiReasoning,
      })),
      thinking_process: result.thinking_process,
      prospect_analysis: result.prospect_analysis,
      metadata: {
        ...(typeof result.metadata === 'object' && result.metadata
          ? result.metadata
          : {}),
        prospect_id: prospect.id,
        prompt_version: promptRecord.version,
      },
    };
  }
}
