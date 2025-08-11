/*
  Warnings:

  - You are about to drop the column `tovDirectness` on the `Sequence` table. All the data in the column will be lost.
  - You are about to drop the column `tovFormality` on the `Sequence` table. All the data in the column will be lost.
  - You are about to drop the column `tovWarmth` on the `Sequence` table. All the data in the column will be lost.
  - Added the required column `tovConfigId` to the `Sequence` table without a default value. This is not possible if the table is not empty.

*/

-- Step 1: Create the TovConfig table
CREATE TABLE "public"."TovConfig" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "formality" DOUBLE PRECISION NOT NULL,
    "warmth" DOUBLE PRECISION NOT NULL,
    "directness" DOUBLE PRECISION NOT NULL,
    "description" TEXT,
    "isPreset" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TovConfig_pkey" PRIMARY KEY ("id")
);

-- Step 2: Create indexes for TovConfig
CREATE INDEX "TovConfig_isPreset_idx" ON "public"."TovConfig"("isPreset");
CREATE INDEX "TovConfig_name_idx" ON "public"."TovConfig"("name");
CREATE UNIQUE INDEX "TovConfig_formality_warmth_directness_name_key" ON "public"."TovConfig"("formality", "warmth", "directness", "name");

-- Step 3: Insert default TOV configuration and existing unique combinations
INSERT INTO "public"."TovConfig" ("formality", "warmth", "directness", "name", "description", "isPreset")
VALUES (0.5, 0.5, 0.5, 'Default', 'Default balanced tone of voice configuration', true);

-- Insert existing unique TOV combinations from Sequence table
INSERT INTO "public"."TovConfig" ("formality", "warmth", "directness", "isPreset")
SELECT DISTINCT "tovFormality", "tovWarmth", "tovDirectness", false
FROM "public"."Sequence"
WHERE NOT EXISTS (
    SELECT 1 FROM "public"."TovConfig" tc 
    WHERE tc."formality" = "Sequence"."tovFormality" 
    AND tc."warmth" = "Sequence"."tovWarmth" 
    AND tc."directness" = "Sequence"."tovDirectness"
);

-- Step 4: Add tovConfigId column with a default value temporarily
ALTER TABLE "public"."Sequence" ADD COLUMN "tovConfigId" INTEGER;

-- Step 5: Update sequences to reference the appropriate TOV config
UPDATE "public"."Sequence" 
SET "tovConfigId" = (
    SELECT tc."id" 
    FROM "public"."TovConfig" tc 
    WHERE tc."formality" = "Sequence"."tovFormality" 
    AND tc."warmth" = "Sequence"."tovWarmth" 
    AND tc."directness" = "Sequence"."tovDirectness"
    LIMIT 1
);

-- Step 6: Make tovConfigId NOT NULL after data migration
ALTER TABLE "public"."Sequence" ALTER COLUMN "tovConfigId" SET NOT NULL;

-- Step 7: Drop the old TOV columns
ALTER TABLE "public"."Sequence" DROP COLUMN "tovDirectness",
DROP COLUMN "tovFormality",
DROP COLUMN "tovWarmth";

-- Step 8: Create remaining indexes
CREATE INDEX "Sequence_tovConfigId_idx" ON "public"."Sequence"("tovConfigId");
CREATE INDEX "Sequence_metadata_idx" ON "public"."Sequence" USING GIN ("metadata");
CREATE INDEX "Sequence_messages_idx" ON "public"."Sequence" USING GIN ("messages");

-- Step 9: Add foreign key constraint
ALTER TABLE "public"."Sequence" ADD CONSTRAINT "Sequence_tovConfigId_fkey" FOREIGN KEY ("tovConfigId") REFERENCES "public"."TovConfig"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
