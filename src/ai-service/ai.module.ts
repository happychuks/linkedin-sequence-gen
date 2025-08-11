import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { PrismaService } from '../prisma/prisma.service';
import { PromptModule } from '../prompt-service/prompt.module';
import { SequenceRepository } from '../sequence-service/sequence.repository';
import { TovConfigService } from '../sequence-service/tov-config.service';
import { AiAdapterFactory } from './adapters/ai-adapter.factory';
import { OpenAiAdapter } from './adapters/openai.adapter';
import { AnthropicAdapter } from './adapters/anthropic.adapter';
import { GroqAdapter } from './adapters/groq.adapter';

// helper services
import { PromptBuilderService } from './helpers/prompt-builder.service';
import { AiResponseProcessorService } from './helpers/ai-response-processor.service';
import { ConfidenceScoreOptimizerService } from './helpers/confidence-score-optimizer.service';
import { ModelSelectionStrategyService } from './helpers/model-selection-strategy.service';
import { LinkedInNameExtractorService } from './helpers/linkedin-name-extractor.service';

@Module({
  imports: [PromptModule],
  providers: [
    AiService,
    AiAdapterFactory,
    OpenAiAdapter,
    AnthropicAdapter,
    GroqAdapter,
    PrismaService,
    SequenceRepository,
    TovConfigService,

    // Register helper services
    PromptBuilderService,
    AiResponseProcessorService,
    ConfidenceScoreOptimizerService,
    ModelSelectionStrategyService,
    LinkedInNameExtractorService,
  ],
  exports: [AiService, AiAdapterFactory],
})
export class AiModule {}
