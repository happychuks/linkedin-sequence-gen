import { Module } from '@nestjs/common';
import { SequenceController } from './sequence.controller';
import { SequenceService } from './sequence.service';
import { SequenceRepository } from './sequence.repository';
import { ProspectRepository } from './prospect.repository';
import { AiModule } from '../ai-service/ai.module';
import { PromptModule } from '../prompt-service/prompt.module';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  imports: [AiModule, PromptModule],
  controllers: [SequenceController],
  providers: [
    SequenceService,
    SequenceRepository,
    ProspectRepository,
    PrismaService,
  ],
  exports: [SequenceService, SequenceRepository, ProspectRepository],
})
export class SequenceModule {}
