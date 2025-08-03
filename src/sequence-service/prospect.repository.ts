import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProspectRepository {
  constructor(private readonly prisma: PrismaService) {}

  async upsert(url: string) {
    return this.prisma.prospect.upsert({
      where: { url },
      update: {},
      create: { url },
    });
  }

  async findByUrl(url: string) {
    return this.prisma.prospect.findUnique({
      where: { url },
      include: { sequences: true },
    });
  }

  async findById(id: number) {
    return this.prisma.prospect.findUnique({
      where: { id },
      include: { sequences: true },
    });
  }

  async create(url: string) {
    return this.prisma.prospect.create({
      data: { url },
    });
  }

  async deleteById(id: number) {
    return this.prisma.prospect.delete({
      where: { id },
    });
  }

  async findAll() {
    return this.prisma.prospect.findMany({
      include: { sequences: true },
      orderBy: { id: 'desc' },
    });
  }
}
