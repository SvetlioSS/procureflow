/*
  Warnings:

  - You are about to drop the column `restrictedSuppliers` on the `PolicyConfig` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_PolicyConfig" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "costCenter" TEXT NOT NULL,
    "budget" INTEGER NOT NULL,
    "perItemCap" INTEGER NOT NULL
);
INSERT INTO "new_PolicyConfig" ("budget", "costCenter", "id", "perItemCap") SELECT "budget", "costCenter", "id", "perItemCap" FROM "PolicyConfig";
DROP TABLE "PolicyConfig";
ALTER TABLE "new_PolicyConfig" RENAME TO "PolicyConfig";
CREATE UNIQUE INDEX "PolicyConfig_costCenter_key" ON "PolicyConfig"("costCenter");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
