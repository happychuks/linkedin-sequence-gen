-- AlterTable
ALTER TABLE "public"."Sequence" ADD COLUMN     "companyContext" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "parentSequenceId" INTEGER,
ADD COLUMN     "sequenceLength" INTEGER NOT NULL DEFAULT 3,
ADD COLUMN     "tovDirectness" DOUBLE PRECISION NOT NULL DEFAULT 0.5,
ADD COLUMN     "tovFormality" DOUBLE PRECISION NOT NULL DEFAULT 0.5,
ADD COLUMN     "tovWarmth" DOUBLE PRECISION NOT NULL DEFAULT 0.5,
ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 1;

-- CreateIndex
CREATE INDEX "Sequence_prospectId_idx" ON "public"."Sequence"("prospectId");

-- CreateIndex
CREATE INDEX "Sequence_promptId_idx" ON "public"."Sequence"("promptId");

-- CreateIndex
CREATE INDEX "Sequence_createdAt_idx" ON "public"."Sequence"("createdAt");

-- CreateIndex
CREATE INDEX "Sequence_prospectId_createdAt_idx" ON "public"."Sequence"("prospectId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "Sequence_promptId_createdAt_idx" ON "public"."Sequence"("promptId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "Sequence_prospectId_version_idx" ON "public"."Sequence"("prospectId", "version");

-- CreateIndex
CREATE INDEX "Sequence_parentSequenceId_idx" ON "public"."Sequence"("parentSequenceId");

-- AddForeignKey
ALTER TABLE "public"."Sequence" ADD CONSTRAINT "Sequence_parentSequenceId_fkey" FOREIGN KEY ("parentSequenceId") REFERENCES "public"."Sequence"("id") ON DELETE SET NULL ON UPDATE CASCADE;
