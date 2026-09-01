-- CreateTable
CREATE TABLE "MjNote" (
    "id" TEXT NOT NULL,
    "theme" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL DEFAULT '',
    "pinned" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MjNote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MjNote_theme_idx" ON "MjNote"("theme");
