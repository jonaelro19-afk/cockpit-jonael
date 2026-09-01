-- CreateTable
CREATE TABLE "Fiche" (
    "id" TEXT NOT NULL,
    "subjectId" TEXT,
    "title" TEXT NOT NULL,
    "kind" TEXT NOT NULL DEFAULT 'Synthèse',
    "sourceText" TEXT NOT NULL DEFAULT '',
    "contentHtml" TEXT NOT NULL DEFAULT '',
    "bookmarked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Fiche_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Fiche_subjectId_idx" ON "Fiche"("subjectId");

-- AddForeignKey
ALTER TABLE "Fiche" ADD CONSTRAINT "Fiche_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE SET NULL ON UPDATE CASCADE;
