import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const tovPresets = [
  // Default configuration
  {
    name: 'Default',
    formality: 0.5,
    warmth: 0.5,
    directness: 0.5,
    description: 'Default balanced tone of voice configuration',
    isPreset: true,
  },

  // Professional & Formal
  {
    name: 'Executive',
    formality: 0.9,
    warmth: 0.3,
    directness: 0.7,
    description: 'High formality, low warmth, direct - for C-level outreach',
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
    name: 'Consultative',
    formality: 0.7,
    warmth: 0.7,
    directness: 0.5,
    description: 'Moderate formality with high warmth - for advisory roles',
    isPreset: true,
  },

  // Casual & Friendly
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
    name: 'Friendly',
    formality: 0.4,
    warmth: 0.9,
    directness: 0.3,
    description: 'Very warm and approachable - for relationship building',
    isPreset: true,
  },
  {
    name: 'Startup',
    formality: 0.2,
    warmth: 0.7,
    directness: 0.6,
    description: 'Casual but direct - for startup environments',
    isPreset: true,
  },

  // Direct & Results-focused
  {
    name: 'Sales',
    formality: 0.6,
    warmth: 0.4,
    directness: 0.9,
    description:
      'Balanced formality, low warmth, very direct - for sales outreach',
    isPreset: true,
  },
  {
    name: 'Direct',
    formality: 0.5,
    warmth: 0.6,
    directness: 0.8,
    description: 'Balanced approach with clear directness - general purpose',
    isPreset: true,
  },
  {
    name: 'Corporate',
    formality: 0.7,
    warmth: 0.3,
    directness: 0.9,
    description:
      'Formal and direct with minimal warmth - for large corporations',
    isPreset: true,
  },

  // Specialized
  {
    name: 'Networking',
    formality: 0.8,
    warmth: 0.8,
    directness: 0.4,
    description: 'Formal but warm with gentle approach - for networking events',
    isPreset: true,
  },
  {
    name: 'Tech',
    formality: 0.4,
    warmth: 0.5,
    directness: 0.7,
    description:
      'Moderate formality and warmth with directness - for technical roles',
    isPreset: true,
  },
  {
    name: 'Balanced',
    formality: 0.6,
    warmth: 0.6,
    directness: 0.6,
    description: 'Perfect balance across all dimensions - versatile option',
    isPreset: true,
  },
];

async function main() {
  console.log('Starting TOV configuration seeding...');

  for (const preset of tovPresets) {
    try {
      const result = await prisma.tovConfig.upsert({
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

      console.log(`${preset.name}: ${result.id}`);
    } catch (error) {
      console.error(`Failed to seed ${preset.name}:`, error);
    }
  }

  console.log('TOV configuration seeding completed!');
}

main()
  .catch((e) => {
    console.error('Seeding failed:', e);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect().catch(console.error);
  });
