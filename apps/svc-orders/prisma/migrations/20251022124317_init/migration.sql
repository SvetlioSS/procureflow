-- CreateTable
CREATE TABLE "PurchaseRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "requester" TEXT NOT NULL,
    "costCenter" TEXT NOT NULL,
    "total" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "items" JSONB NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Assessment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "prId" TEXT NOT NULL,
    "decision" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "traceJson" JSONB NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Assessment_prId_fkey" FOREIGN KEY ("prId") REFERENCES "PurchaseRequest" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PolicyConfig" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "costCenter" TEXT NOT NULL,
    "budget" INTEGER NOT NULL,
    "restrictedSuppliers" JSONB NOT NULL,
    "perItemCap" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "PolicyConfig_costCenter_key" ON "PolicyConfig"("costCenter");
