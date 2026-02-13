/*
  Warnings:

  - Added the required column `threshold` to the `InventoryAlert` table without a default value. This is not possible if the table is not empty.
  - Added the required column `unit` to the `InventoryItem` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "InventoryAlert" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "notifiedAt" TIMESTAMP(3),
ADD COLUMN     "threshold" INTEGER NOT NULL,
ALTER COLUMN "message" SET DEFAULT '';

-- AlterTable
ALTER TABLE "InventoryItem" ADD COLUMN     "category" TEXT,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "reorderLevel" INTEGER,
ADD COLUMN     "unit" TEXT NOT NULL,
ALTER COLUMN "quantity" SET DEFAULT 0,
ALTER COLUMN "lowStockThreshold" SET DEFAULT 0;
