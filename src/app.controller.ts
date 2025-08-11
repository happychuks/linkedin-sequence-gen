/* eslint-disable @typescript-eslint/no-unused-vars */
import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  getHealth(): {
    status: string;
    timestamp: string;
    uptime: number;
    environment: string;
    version: string;
    port: number;
  } {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0',
      port: parseInt(process.env.PORT || '3000'),
    };
  }

  @Get('health/tov-configs')
  async getTovConfigHealth(): Promise<{
    status: string;
    timestamp: string;
    tovConfigs: {
      total: number;
      presets: number;
      userCreated: number;
    };
  }> {
    try {
      const [total, presets] = await Promise.all([
        this.prisma.tovConfig.count(),
        this.prisma.tovConfig.count({ where: { isPreset: true } }),
      ]);

      return {
        status: presets > 0 ? 'ok' : 'warning',
        timestamp: new Date().toISOString(),
        tovConfigs: {
          total,
          presets,
          userCreated: total - presets,
        },
      };
    } catch (error) {
      return {
        status: 'error',
        timestamp: new Date().toISOString(),
        tovConfigs: {
          total: 0,
          presets: 0,
          userCreated: 0,
        },
      };
    }
  }
}
