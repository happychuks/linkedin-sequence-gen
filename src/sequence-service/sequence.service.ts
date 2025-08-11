/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import { Injectable } from '@nestjs/common';
import { GenerateSequenceDto } from '../ai-service/dto/generate-sequence.dto';
import { RefineSequenceDto } from '../ai-service/dto/refine-sequence.dto';
import { AiService } from '../ai-service/ai.service';
import { PromptService } from '../prompt-service/prompt.service';
import { SequenceRepository } from './sequence.repository';
import { ProspectRepository } from './prospect.repository';
import { TovConfigService } from './tov-config.service';

@Injectable()
export class SequenceService {
  constructor(
    private readonly sequenceRepository: SequenceRepository,
    private readonly prospectRepository: ProspectRepository,
    private readonly ai: AiService,
    private readonly promptService: PromptService,
    private readonly tovConfigService: TovConfigService,
  ) {}

  async generate(dto: GenerateSequenceDto) {
    const startTime = Date.now();

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

    // Find or create TOV configuration
    const tovConfig = await this.tovConfigService.findOrCreate(
      dto.tov_config.formality,
      dto.tov_config.warmth,
      dto.tov_config.directness,
    );

    const createdSequence = await this.sequenceRepository.create({
      prospectId: prospect.id,
      promptId: promptRecord.id,
      tovConfigId: tovConfig.id,
      messages: result.sequence,
      thinkingProcess: result.thinking_process,
      prospectAnalysis: result.prospect_analysis,
      metadata: result.metadata,
      companyContext: dto.company_context,
      sequenceLength: dto.sequence_length,
    });

    const endTime = Date.now();
    const totalGenerationTime = endTime - startTime;

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
        sequence_id: createdSequence.id,
        prospect_id: prospect.id,
        prompt_version: promptRecord.version,
        generation_time_ms: totalGenerationTime,
      },
    };
  }

  async history(prospectId: number) {
    const seqs = await this.sequenceRepository.findManyByProspectId(prospectId);
    return seqs.map((s) => ({
      sequence: s.messages,
      thinking_process: s.thinkingProcess,
      prospect_analysis: s.prospectAnalysis,
      metadata: {
        ...(typeof s.metadata === 'object' && s.metadata ? s.metadata : {}),
        sequence_id: s.id,
        generated_at: s.createdAt,
        prompt_version: s.prompt.version,
      },
    }));
  }

  async refine(dto: RefineSequenceDto): Promise<any> {
    return this.ai.refineSequence(dto);
  }

  async getRefinements(sequenceId: number): Promise<any> {
    return this.ai.getSequenceRefinements(sequenceId);
  }

  async compareVersions(sequenceIds: number[]): Promise<any> {
    return this.ai.compareSequenceVersions(sequenceIds);
  }
}
