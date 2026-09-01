-- CreateTable
CREATE TABLE "MjAnalysis" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL DEFAULT 'Analyse',
    "clientId" TEXT,
    "projectId" TEXT,
    "quoteId" TEXT,
    "brief" TEXT NOT NULL DEFAULT '',
    "answers" JSONB NOT NULL DEFAULT '{}',
    "engine" TEXT NOT NULL DEFAULT 'rules',
    "status" TEXT NOT NULL DEFAULT 'brief',
    "outputs" JSONB NOT NULL DEFAULT '{}',
    "conflicts" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MjAnalysis_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MjAnalysis_clientId_idx" ON "MjAnalysis"("clientId");

-- AddForeignKey
ALTER TABLE "MjAnalysis" ADD CONSTRAINT "MjAnalysis_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;
