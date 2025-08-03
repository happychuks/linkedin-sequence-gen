import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  imports: [],
  providers: [AiService, PrismaService],
  exports: [AiService],
})
export class AiModule {}
