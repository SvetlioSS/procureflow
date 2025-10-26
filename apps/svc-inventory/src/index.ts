import Fastify from "fastify";
import { Type as T, Static } from "@sinclair/typebox";
import { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";

import { INVENTORY, SUBS_PRIORITY } from "./data";

// ────────────────────────────────────────────────────────────────────
const app = Fastify({
  logger: {
    level: "info",
    redact: {
      paths: ["req.headers.authorization", "req.headers.cookie"],
      censor: "[REDACTED]",
    },
  },
}).withTypeProvider<TypeBoxTypeProvider>();

// ────────────────────────────────────────────────────────────────────
// Schemas
// ────────────────────────────────────────────────────────────────────
const SkuParamsSchema = T.Object({ sku: T.String() });
type SkuParams = Static<typeof SkuParamsSchema>;

const InventoryItemSchema = T.Object({
  sku: T.String(),
  stock: T.Integer({ minimum: 0 }),
  preferredSupplier: T.String(),
  altSuppliers: T.Array(T.String()),
});
type InventoryItem = Static<typeof InventoryItemSchema>;

const SubstitutionRequestSchema = T.Object({
  items: T.Array(
    T.Object({
      sku: T.String(),
      qty: T.Integer({ minimum: 1 }),
    })
  ),
});
type SubstitutionRequest = Static<typeof SubstitutionRequestSchema>;

const SubstitutionReplySchema = T.Object({
  suggestions: T.Array(
    T.Object({
      originalSku: T.String(),
      suggestedSku: T.String(),
      supplier: T.String(),
      reason: T.String(),
    })
  ),
});
type SubstitutionReply = Static<typeof SubstitutionReplySchema>;

const ErrorReplySchema = T.Object({ error: T.String() });
type ErrorReply = Static<typeof ErrorReplySchema>;

// ────────────────────────────────────────────────────────────────────
// Health
// ────────────────────────────────────────────────────────────────────
app.get("/health", async () => ({ ok: true, service: "svc-inventory" }));

// ────────────────────────────────────────────────────────────────────
// GET /inventory/:sku  → single item snapshot
// ────────────────────────────────────────────────────────────────────
app.get<{ Params: SkuParams; Reply: InventoryItem | ErrorReply }>(
  "/inventory/:sku",
  {
    schema: {
      params: SkuParamsSchema,
      response: { 200: InventoryItemSchema, 404: ErrorReplySchema },
    },
  },
  async (req, reply) => {
    const sku = req.params.sku;
    const rec = INVENTORY[sku];
    if (!rec) return reply.code(404).send({ error: "NOT_FOUND" });
    return {
      sku,
      stock: rec.stock,
      preferredSupplier: rec.preferredSupplier,
      altSuppliers: rec.alts,
    };
  }
);

// ────────────────────────────────────────────────────────────────────
// POST /substitution  → propose alternatives for OOS items
// Body: { items: [{ sku, qty }] }
// ────────────────────────────────────────────────────────────────────
app.post<{ Body: SubstitutionRequest; Reply: SubstitutionReply }>(
  "/substitution",
  {
    schema: {
      body: SubstitutionRequestSchema,
      response: { 200: SubstitutionReplySchema },
    },
  },
  async (req) => {
    const out: SubstitutionReply = { suggestions: [] };

    for (const item of req.body.items) {
      const rec = INVENTORY[item.sku];

      // Suggest only if missing or insufficient stock
      if (!rec || rec.stock < item.qty) {
        // Prefer explicit priority list, fallback to SKU's own alternatives
        const priolist = SUBS_PRIORITY[item.sku] ?? rec?.alts ?? [];

        const viable = priolist.find((altSku) => {
          const alt = INVENTORY[altSku];
          return alt && alt.stock >= item.qty;
        });

        if (viable) {
          const alt = INVENTORY[viable]!;
          out.suggestions.push({
            originalSku: item.sku,
            suggestedSku: viable,
            supplier: alt.preferredSupplier,
            reason: `Substitute available with sufficient stock (${alt.stock})`,
          });
        } else {
          out.suggestions.push({
            originalSku: item.sku,
            suggestedSku: item.sku,
            supplier: rec?.preferredSupplier ?? "UNKNOWN",
            reason: "No stocked substitutes; original not available",
          });
        }
      }
    }

    return out;
  }
);

// ────────────────────────────────────────────────────────────────────
// Start
// ────────────────────────────────────────────────────────────────────
const port = Number(process.env.PORT) || 4002;
app.listen({ port, host: "0.0.0.0" }).catch((err) => {
  app.log.error(err);
  process.exit(1);
});

// Graceful shutdown (optional)
process.on("SIGTERM", () => void app.close());
process.on("SIGINT", () => void app.close());
