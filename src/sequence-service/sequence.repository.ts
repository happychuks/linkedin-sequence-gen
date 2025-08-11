/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Sequence } from '@prisma/client';

export interface CreateSequenceData {
  prospectId: number;
  promptId: number;
  messages: any;
  thinkingProcess: any;
  prospectAnalysis?: string;
  metadata: any;
  tovFormality?: number;
  tovWarmth?: number;
  tovDirectness?: number;
  companyContext?: string;
  sequenceLength?: number;
  version?: number;
  parentSequenceId?: number;
}

export interface SequenceWithProspect extends Sequence {
  prospect: {
    url: string;
  };
}

@Injectable()
export class SequenceRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateSequenceData) {
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

  async findByIdWithProspect(id: number): Promise<SequenceWithProspect | null> {
    return this.prisma.sequence.findUnique({
      where: { id },
      include: { prospect: true },
    });
  }

  async findManyByIds(ids: number[]): Promise<SequenceWithProspect[]> {
    return this.prisma.sequence.findMany({
      where: { id: { in: ids } },
      include: { prospect: { select: { url: true } } },
      orderBy: { version: 'asc' },
    });
  }

  async findRefinementsByParentId(parentSequenceId: number): Promise<any[]> {
    return this.prisma.sequence.findMany({
      where: { parentSequenceId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        prospectId: true,
        promptId: true,
        messages: true,
        thinkingProcess: true,
        prospectAnalysis: true,
        metadata: true,
        createdAt: true,
        tovFormality: true,
        tovWarmth: true,
        tovDirectness: true,
        version: true,
        parentSequenceId: true,
        companyContext: true,
        sequenceLength: true,
        prospect: {
          select: { url: true },
        },
      },
    });
  }

  async deleteById(id: number) {
    return this.prisma.sequence.delete({
      where: { id },
    });
  }

  async updateById(id: number, data: Partial<CreateSequenceData>) {
    return this.prisma.sequence.update({
      where: { id },
      data,
    });
  }

  async getSequenceStats(sequenceId: number): Promise<{
    totalRefinements: number;
    latestVersion: number;
    createdAt: Date;
  } | null> {
    const sequence = await this.prisma.sequence.findUnique({
      where: { id: sequenceId },
      select: {
        createdAt: true,
        version: true,
      },
    });

    if (!sequence) return null;

    const refinementsCount = await this.prisma.sequence.count({
      where: { parentSequenceId: sequenceId },
    });

    // Find the highest version number for this sequence family
    const latestRefinement = await this.prisma.sequence.findFirst({
      where: {
        OR: [{ id: sequenceId }, { parentSequenceId: sequenceId }],
      },
      orderBy: { version: 'desc' },
      select: { version: true },
    });

    const latestVersion = latestRefinement
      ? latestRefinement.version
      : sequence.version;

    return {
      totalRefinements: refinementsCount,

      latestVersion: latestVersion,
      createdAt: sequence.createdAt,
    };
  }
}
