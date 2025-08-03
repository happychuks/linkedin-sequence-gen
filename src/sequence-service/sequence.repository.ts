import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SequenceRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: {
    prospectId: number;
    promptId: number;
    messages: any;
    thinkingProcess: any;
    prospectAnalysis: string;
    metadata: any;
  }) {
    return this.prisma.sequence.create({
      data,
    });
  }

  async findManyByProspectId(prospectId: number) {
    return this.prisma.sequence.findMany({
      where: { prospectId },
      include: { prompt: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: number) {
    return this.prisma.sequence.findUnique({
      where: { id },
      include: { prompt: true, prospect: true },
    });
  }

  async deleteById(id: number) {
    return this.prisma.sequence.delete({
      where: { id },
    });
  }

  async updateById(
    id: number,
    data: Partial<{
      messages: any;
      thinkingProcess: any;
      prospectAnalysis: string;
      metadata: any;
    }>,
  ) {
    return this.prisma.sequence.update({
      where: { id },
      data,
    });
  }
}
