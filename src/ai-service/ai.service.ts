/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable, Logger } from '@nestjs/common';
import { GenerateSequenceDto } from './dto/generate-sequence.dto';
import { PromptService } from '../prompt-service/prompt.service';
import { PrismaService } from '../prisma/prisma.service';
import { AiAdapterFactory } from './adapters/ai-adapter.factory';

// Import helper services
import { PromptBuilderService } from './helpers/prompt-builder.service';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor(
    private aiAdapterFactory: AiAdapterFactory,
    private promptService: PromptService,
    private prisma: PrismaService,
    private promptBuilder: PromptBuilderService,
  ) {}

  buildPrompt(
    prospectUrl: string,
    tov: GenerateSequenceDto['tov_config'],
    context: string,
    len: number,
  ): string {
    const { prompt } = this.promptBuilder.buildPrompt(
      prospectUrl,
      tov,
      context,
      len,
    );
    return prompt;
  }
}
