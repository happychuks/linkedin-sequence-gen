import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PromptService {
  constructor(private readonly prisma: PrismaService) {}

  async getActivePrompt() {
    return await this.prisma.prompt.findFirst({
      orderBy: { version: 'desc' },
    });
  }

  async savePrompt(content: string) {
    const last = await this.getActivePrompt();
    const version = last ? last.version + 1 : 1;
    return await this.prisma.prompt.create({ data: { version, content } });
  }
}
