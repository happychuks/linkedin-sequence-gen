import { Injectable } from '@nestjs/common';
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
}
