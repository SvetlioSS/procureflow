import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  await prisma.assessment.deleteMany({});
  await prisma.purchaseRequest.deleteMany({});
  await prisma.policyConfig.deleteMany({});

  await prisma.policyConfig.createMany({
    data: [
      {
        costCenter: "CC-ENG",
        budget: 20000,
        perItemCap: 5000,
      },
      {
        costCenter: "CC-MKT",
        budget: 10000,
        perItemCap: 3000,
      },
    ],
  });

  const prs = await prisma.purchaseRequest.createMany({
    data: [
      {
        requester: "alice",
        costCenter: "CC-ENG",
        total: 4800,
        status: "OPEN",
        items: JSON.stringify([
          { sku: "LPT-13", qty: 8, price: 500 },
          { sku: "MSE-01", qty: 8, price: 100 },
        ]),
      },
      {
        requester: "bob",
        costCenter: "CC-MKT",
        total: 12500,
        status: "OPEN",
        items: JSON.stringify([{ sku: "CAM-4K", qty: 5, price: 2500 }]),
      },
      {
        requester: "sara",
        costCenter: "CC-ENG",
        total: 900,
        status: "OPEN",
        items: JSON.stringify([{ sku: "KBD-02", qty: 10, price: 90 }]),
      },
    ],
  });

  console.log(`Seeded: ${prs.count} PRs`);
}

main().finally(() => prisma.$disconnect());
