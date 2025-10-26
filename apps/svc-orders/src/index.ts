import Fastify from "fastify";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import { Static, Type as T } from "@sinclair/typebox";
import { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import cors from "@fastify/cors";

dotenv.config();

const prisma = new PrismaClient();

const app = Fastify({
  logger: {
    level: "info",
    redact: {
      paths: ["req.headers.authorization", "req.headers.cookie"],
      censor: "[REDACTED]",
    },
  },
}).withTypeProvider<TypeBoxTypeProvider>();

if (!process.env.WEB_ORIGIN) {
  throw new Error("Missing Web Origin!");
}

await app.register(cors, {
  origin: [process.env.WEB_ORIGIN],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type"],
  exposedHeaders: ["X-Request-ID"],
});

// ====================================================================
// =  Health
// ====================================================================
app.get("/health", async () => ({ ok: true, service: "svc-orders" }));

// ====================================================================
// =  List PRs
// ====================================================================
app.get("/pr", () =>
  prisma.purchaseRequest.findMany({ orderBy: { createdAt: "desc" } })
);

// ====================================================================
// =  Get PR by ID
// ====================================================================

const PRGetParamsSchema = T.Object({ id: T.String() });

type PRGetParams = Static<typeof PRGetParamsSchema>;

app.get<{ Params: PRGetParams }>(
  "/pr/:id",
  { schema: { params: PRGetParamsSchema } },
  async (req, reply) => {
    const { id } = req.params;
    const pr = await prisma.purchaseRequest.findUnique({ where: { id } });
    if (!pr) return reply.code(404).send({ error: "NOT_FOUND" });
    return pr;
  }
);

// ====================================================================
// =  Create assessment
// ====================================================================

const AssessmentCreateBodySchema = T.Object({
  decision: T.Union([
    T.Literal("APPROVE"),
    T.Literal("REJECT"),
    T.Literal("NEEDS_INFO"),
  ]),
  reason: T.String(),
  trace: T.Array(
    T.Object({
      tool: T.String(),
      args: T.Record(T.String(), T.Any()),
      result: T.Record(T.String(), T.Any()),
    })
  ),
});
const AssessmentCreateParamsSchema = T.Object({ id: T.String() });

type AssessmentCreateBody = Static<typeof AssessmentCreateBodySchema>;
type AssessmentCreateParams = Static<typeof AssessmentCreateParamsSchema>;

app.post<{ Params: AssessmentCreateParams; Body: AssessmentCreateBody }>(
  "/pr/:id/assessment",
  {
    schema: {
      params: AssessmentCreateParamsSchema,
      body: AssessmentCreateBodySchema,
    },
  },
  async (req, reply) => {
    const { id } = req.params;
    const { decision, reason, trace } = req.body;

    const pr = await prisma.purchaseRequest.findUnique({ where: { id } });
    if (!pr) return reply.code(404).send({ error: "NOT_FOUND" });

    const created = await prisma.assessment.create({
      data: {
        prId: id,
        decision,
        reason,
        // If prisma field is Json:
        // traceJson: trace as unknown as Prisma.InputJsonValue,
        // If prisma field is String (current schema):
        traceJson: JSON.stringify(trace),
      },
    });

    return { ok: true, assessmentId: created.id };
  }
);

// ====================================================================
// =  Get last assessment
// ====================================================================

const AssessmentGetLastParamsSchema = T.Object({ id: T.String() });

type AssessmentGetLastParams = Static<typeof AssessmentGetLastParamsSchema>;

app.get<{ Params: AssessmentGetLastParams }>(
  "/pr/:id/assessment/last",
  { schema: { params: AssessmentGetLastParamsSchema } },
  async (req, reply) => {
    const last = await prisma.assessment.findFirst({
      where: { prId: req.params.id },
      orderBy: { createdAt: "desc" },
    });
    if (!last) return reply.code(204).send();
    return last;
  }
);

// ====================================================================
// =  Approve PR
// ====================================================================

const PRApproveParamsSchema = T.Object({ id: T.String() });

type PRApproveParams = Static<typeof PRApproveParamsSchema>;

app.post<{ Params: PRApproveParams }>(
  "/pr/:id/approve",
  { schema: { params: PRApproveParamsSchema } },
  async (req, reply) => {
    const { id } = req.params;
    const pr = await prisma.purchaseRequest.findUnique({ where: { id } });
    if (!pr) return reply.code(404).send({ error: "NOT_FOUND" });
    if (pr.status !== "OPEN")
      return reply
        .code(409)
        .send({ error: "INVALID_STATE", status: pr.status });

    const updated = await prisma.purchaseRequest.update({
      where: { id },
      data: { status: "APPROVED" },
    });

    return { ok: true, pr: updated };
  }
);

// ====================================================================
// =  Reject PR
// ====================================================================

const PRRejectParamsSchema = T.Object({ id: T.String() });
const PRRejectBodySchema = T.Object({ reason: T.String() });

type PRRejectParams = Static<typeof PRRejectParamsSchema>;
type PRRejectBody = Static<typeof PRRejectBodySchema>;

app.post<{ Params: PRRejectParams; Body: PRRejectBody }>(
  "/pr/:id/reject",
  { schema: { params: PRRejectParamsSchema, body: PRRejectBodySchema } },
  async (req, reply) => {
    const { id } = req.params;

    const pr = await prisma.purchaseRequest.findUnique({ where: { id } });

    if (!pr) return reply.code(404).send({ error: "NOT_FOUND" });

    if (pr.status !== "OPEN")
      return reply
        .code(409)
        .send({ error: "INVALID_STATE", status: pr.status });

    const updated = await prisma.purchaseRequest.update({
      where: { id },
      data: { status: "REJECTED" },
    });

    await prisma.assessment.create({
      data: {
        prId: id,
        decision: "REJECT",
        reason: req.body.reason,
        // Json field? -> use traceJson: [] as unknown as Prisma.InputJsonValue
        traceJson: JSON.stringify([]),
      },
    });

    return { ok: true, pr: updated };
  }
);

// ────────────────────────────────────────────────────────────────────
// Start
// ────────────────────────────────────────────────────────────────────
const port = Number(process.env.PORT) || 4001;
app.listen({ port, host: "0.0.0.0" }).catch((err) => {
  app.log.error(err);
  process.exit(1);
});

// Graceful shutdown (optional)
process.on("SIGTERM", () => void app.close());
process.on("SIGINT", () => void app.close());
