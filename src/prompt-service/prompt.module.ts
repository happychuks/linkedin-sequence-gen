import { Module } from '@nestjs/common';
import { PromptService } from './prompt.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  providers: [PromptService, PrismaService],
  exports: [PromptService],
})
export class PromptModule {}
