/// <reference types="node" />

import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

type PRItem = { sku: string; qty: number; price: number };

// helpers
const totalOf = (items: PRItem[]) =>
  items.reduce((s, i) => s + i.qty * i.price, 0);

async function main() {
  console.log("🌱 Seeding svc-orders…");

  // Clean slate (dev only)
  await prisma.assessment.deleteMany();
  await prisma.purchaseRequest.deleteMany();
  await prisma.policyConfig.deleteMany();

  // ── Policy per cost center
  const policies = await prisma.policyConfig.createMany({
    data: [
      { costCenter: "CC-ENG", budget: 25000, perItemCap: 6000 },
      { costCenter: "CC-MKT", budget: 12000, perItemCap: 4000 },
      { costCenter: "CC-FIN", budget: 8000, perItemCap: 3000 },
    ],
  });
  console.log(`  • policy configs: ${policies.count}`);

  // Common items (SKUs align with svc-inventory dataset below)
  const prA_items: PRItem[] = [
    { sku: "LPT-13", qty: 2, price: 1100 }, // OOS in inventory → will trigger substitution
    { sku: "MON-27", qty: 2, price: 260 },
  ];
  const prB_items: PRItem[] = [
    { sku: "LPT-14", qty: 3, price: 1250 }, // in stock
  ];
  const prC_items: PRItem[] = [
    { sku: "KB-ENG", qty: 5, price: 45 },
    { sku: "MS-PRM", qty: 5, price: 75 },
  ];
  const prD_items: PRItem[] = [
    { sku: "CAM-4K", qty: 4, price: 1800 }, // per-item cap violation for CC-MKT
  ];
  const prE_items: PRItem[] = [
    { sku: "CHAIR-ERG", qty: 20, price: 420 }, // budget-heavy
  ];

  // ── Create PRs (mix of states)
  const prA = await prisma.purchaseRequest.create({
    data: {
      requester: "alice@acme.io",
      costCenter: "CC-ENG",
      items: prA_items as unknown as Prisma.InputJsonValue,
      total: totalOf(prA_items),
      status: "OPEN",
    },
  });
  const prB = await prisma.purchaseRequest.create({
    data: {
      requester: "bob@acme.io",
      costCenter: "CC-ENG",
      items: prB_items as unknown as Prisma.InputJsonValue,
      total: totalOf(prB_items),
      status: "OPEN",
    },
  });
  const prC = await prisma.purchaseRequest.create({
    data: {
      requester: "carol@acme.io",
      costCenter: "CC-FIN",
      items: prC_items as unknown as Prisma.InputJsonValue,
      total: totalOf(prC_items),
      status: "APPROVED",
    },
  });
  const prD = await prisma.purchaseRequest.create({
    data: {
      requester: "dave@acme.io",
      costCenter: "CC-MKT",
      items: prD_items as unknown as Prisma.InputJsonValue,
      total: totalOf(prD_items),
      status: "OPEN", // agent should flag per-item cap >4000
    },
  });
  const prE = await prisma.purchaseRequest.create({
    data: {
      requester: "eve@acme.io",
      costCenter: "CC-MKT",
      items: prE_items as unknown as Prisma.InputJsonValue,
      total: totalOf(prE_items),
      status: "REJECTED",
    },
  });

  // Seed one assessment on the rejected PR for the UI “history”
  await prisma.assessment.create({
    data: {
      prId: prE.id,
      decision: "REJECT",
      reason: "Over department budget; defer to next quarter.",
      traceJson: JSON.stringify([
        { tool: "getPR", args: { id: prE.id }, result: { ok: true } },
        {
          tool: "checkPolicy",
          args: { costCenter: "CC-MKT" },
          result: { budget: 12000, overBy: totalOf(prE_items) - 12000 },
        },
      ]),
    },
  });

  console.log("  • PRs:", prA.id, prB.id, prC.id, prD.id, prE.id);
  console.log("✅ svc-orders seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
