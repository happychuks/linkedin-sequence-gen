-- Insert useful TOV presets for LinkedIn outreach

-- Professional & Formal
INSERT INTO "public"."TovConfig" ("formality", "warmth", "directness", "name", "description", "isPreset", "updatedAt")
VALUES 
  (0.9, 0.3, 0.7, 'Executive', 'High formality, low warmth, direct - for C-level outreach', true, CURRENT_TIMESTAMP),
  (0.8, 0.5, 0.6, 'Professional', 'Professional tone with moderate warmth - for business contacts', true, CURRENT_TIMESTAMP),
  (0.7, 0.7, 0.5, 'Consultative', 'Moderate formality with high warmth - for advisory roles', true, CURRENT_TIMESTAMP),

-- Casual & Friendly
(
    0.3,
    0.8,
    0.4,
    'Casual',
    'Low formality, high warmth, gentle approach - for peer-level contacts',
    true,
    CURRENT_TIMESTAMP
),
(
    0.4,
    0.9,
    0.3,
    'Friendly',
    'Very warm and approachable - for relationship building',
    true,
    CURRENT_TIMESTAMP
),
(
    0.2,
    0.7,
    0.6,
    'Startup',
    'Casual but direct - for startup environments',
    true,
    CURRENT_TIMESTAMP
),

-- Direct & Results-focused
(
    0.6,
    0.4,
    0.9,
    'Sales',
    'Balanced formality, low warmth, very direct - for sales outreach',
    true,
    CURRENT_TIMESTAMP
),
(
    0.5,
    0.6,
    0.8,
    'Direct',
    'Balanced approach with clear directness - general purpose',
    true,
    CURRENT_TIMESTAMP
),
(
    0.7,
    0.3,
    0.9,
    'Corporate',
    'Formal and direct with minimal warmth - for large corporations',
    true,
    CURRENT_TIMESTAMP
),

-- Specialized
(
    0.8,
    0.8,
    0.4,
    'Networking',
    'Formal but warm with gentle approach - for networking events',
    true,
    CURRENT_TIMESTAMP
),
(
    0.4,
    0.5,
    0.7,
    'Tech',
    'Moderate formality and warmth with directness - for technical roles',
    true,
    CURRENT_TIMESTAMP
),
(
    0.6,
    0.6,
    0.6,
    'Balanced',
    'Perfect balance across all dimensions - versatile option',
    true,
    CURRENT_TIMESTAMP
);