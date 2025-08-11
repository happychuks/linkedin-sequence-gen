import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit() {
    await this.$connect();

    // Auto-seed TOV configurations in production if they don't exist
    if (
      process.env.NODE_ENV === 'production' ||
      process.env.AUTO_SEED === 'true'
    ) {
      await this.ensureTovConfigsExist();
    }
  }

  async ensureTovConfigsExist() {
    try {
      const existingPresets = await this.tovConfig.count({
        where: { isPreset: true },
      });

      if (existingPresets === 0) {
        this.logger.log('No TOV presets found, seeding database...');
        await this.seedTovConfigs();
        this.logger.log('TOV configurations seeded successfully');
      } else {
        this.logger.log(`Found ${existingPresets} TOV presets, skipping seed`);
      }
    } catch (error) {
      this.logger.error('Failed to check/seed TOV configurations:', error);
    }
  }

  private async seedTovConfigs() {
    const tovPresets = [
      {
        name: 'Default',
        formality: 0.5,
        warmth: 0.5,
        directness: 0.5,
        description: 'Default balanced tone of voice configuration',
        isPreset: true,
      },
      {
        name: 'Executive',
        formality: 0.9,
        warmth: 0.3,
        directness: 0.7,
        description:
          'High formality, low warmth, direct - for C-level outreach',
        isPreset: true,
      },
      {
        name: 'Professional',
        formality: 0.8,
        warmth: 0.5,
        directness: 0.6,
        description:
          'Professional tone with moderate warmth - for business contacts',
        isPreset: true,
      },
      {
        name: 'Casual',
        formality: 0.3,
        warmth: 0.8,
        directness: 0.4,
        description:
          'Low formality, high warmth, gentle approach - for peer-level contacts',
        isPreset: true,
      },
      {
        name: 'Sales',
        formality: 0.6,
        warmth: 0.4,
        directness: 0.9,
        description:
          'Balanced formality, low warmth, very direct - for sales outreach',
        isPreset: true,
      },
    ];

    for (const preset of tovPresets) {
      await this.tovConfig.upsert({
        where: {
          formality_warmth_directness_name: {
            formality: preset.formality,
            warmth: preset.warmth,
            directness: preset.directness,
            name: preset.name,
          },
        },
        update: {
          description: preset.description,
          isPreset: preset.isPreset,
        },
        create: preset,
      });
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
