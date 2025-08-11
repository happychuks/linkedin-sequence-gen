/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface CreateTovConfigData {
  name?: string;
  formality: number;
  warmth: number;
  directness: number;
  description?: string;
  isPreset?: boolean;
}

@Injectable()
export class TovConfigService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateTovConfigData) {
    return this.prisma.tovConfig.create({
      data,
    });
  }

  async findOrCreate(
    formality: number,
    warmth: number,
    directness: number,
    name?: string,
  ) {
    // Try to find existing configuration
    const existing = await this.prisma.tovConfig.findFirst({
      where: {
        formality,
        warmth,
        directness,
        ...(name ? { name } : {}),
      },
    });

    if (existing) {
      return existing;
    }

    // Create new configuration if not found
    return this.create({
      formality,
      warmth,
      directness,
      name,
      isPreset: false,
    });
  }

  async findById(id: number) {
    return this.prisma.tovConfig.findUnique({
      where: { id },
    });
  }

  async findPresets() {
    return this.prisma.tovConfig.findMany({
      where: { isPreset: true },
      orderBy: { name: 'asc' },
    });
  }

  async findAll() {
    return this.prisma.tovConfig.findMany({
      orderBy: [{ isPreset: 'desc' }, { name: 'asc' }],
    });
  }

  async updateById(id: number, data: Partial<CreateTovConfigData>) {
    return this.prisma.tovConfig.update({
      where: { id },
      data,
    });
  }

  async deleteById(id: number) {
    return this.prisma.tovConfig.delete({
      where: { id },
    });
  }
}
