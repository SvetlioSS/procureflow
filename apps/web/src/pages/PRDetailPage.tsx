import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import {
  usePR,
  useLatestAssessment,
  useAssessMutation,
  useApproveMutation,
  useRejectMutation,
} from "@/hooks/usePR";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { StatusBadge } from "@/components/StatusBadge";
import { TraceViewer } from "@/components/TraceViewer";
import { toast } from "sonner";
import {
  CalendarDays,
  Clock3,
  DollarSign,
  UserRound,
  BriefcaseBusiness,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

export function PRDetailPage() {
  const { id = "" } = useParams();
  const { data: pr, isLoading } = usePR(id);
  const { data: lastAssessment } = useLatestAssessment(id);
  const assess = useAssessMutation(id);
  const approve = useApproveMutation(id);
  const reject = useRejectMutation(id);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [reason, setReason] = useState("");

  const currencyFormatter = useMemo(
    () =>
      new Intl.NumberFormat(undefined, {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
      }),
    []
  );

  if (isLoading || !pr) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        {Array.from({ length: 3 }).map((_, idx) => (
          <div
            key={idx}
            className="h-48 rounded-2xl border border-white/5 bg-slate-900/50 shadow-inner shadow-black/40"
          />
        ))}
      </div>
    );
  }

  const items = Array.isArray(pr.items) ? pr.items : [];

  const meta = [
    {
      label: "Requester",
      value: pr.requester,
      icon: UserRound,
    },
    {
      label: "Cost Center",
      value: pr.costCenter,
      icon: BriefcaseBusiness,
    },
    {
      label: "Created",
      value: pr.createdAt ? new Date(pr.createdAt).toLocaleString() : "—",
      icon: CalendarDays,
    },
    {
      label: "Last Updated",
      value: pr.updatedAt ? new Date(pr.updatedAt).toLocaleString() : "—",
      icon: Clock3,
    },
  ];

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-slate-200/80">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          PR {pr.id}
        </div>
        <h1 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">
          Approver cockpit
        </h1>
        <p className="max-w-3xl text-sm text-slate-300">
          Inspect spend, assess AI recommendations, and move decisively with a
          staged action center.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.8fr,1fr]">
        <Card className="overflow-hidden border-white/5 bg-slate-900/60 shadow-2xl shadow-primary/15">
          <CardHeader className="relative overflow-hidden border-b border-white/5 pb-8">
            <div className="absolute inset-0 bg-linear-to-br from-primary/15 via-transparent to-transparent" />
            <div className="relative flex flex-wrap items-center gap-3">
              <StatusBadge status={pr.status} />
              <Badge className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-slate-200">
                {pr.costCenter}
              </Badge>
              <div className="flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                <DollarSign className="h-3.5 w-3.5" />
                {currencyFormatter.format(pr.total ?? 0)}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-8 py-8">
            <section className="grid gap-4 md:grid-cols-2">
              {meta.map(({ label, value, icon: Icon }) => (
                <div
                  key={label}
                  className="rounded-2xl border border-white/5 bg-slate-950/60 p-4 shadow-inner shadow-black/30"
                >
                  <div className="flex items-center gap-3 text-sm text-slate-300">
                    <span className="rounded-full border border-white/10 bg-white/5 p-2">
                      <Icon className="h-4 w-4 text-primary" />
                    </span>
                    <div className="flex flex-col">
                      <span className="text-xs uppercase tracking-[0.35em] text-slate-500">
                        {label}
                      </span>
                      <span className="font-medium text-slate-100">
                        {value}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </section>

            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">
                  Line items
                </h2>
                <Badge
                  variant="outline"
                  className="rounded-full border-white/10 bg-white/5 px-3 py-1 text-[0.65rem] font-medium uppercase tracking-[0.25em] text-slate-200"
                >
                  {items.length} entries
                </Badge>
              </div>
              <div className="overflow-hidden rounded-2xl border border-white/5 bg-slate-950/60">
                <div className="grid grid-cols-[1.5fr,1fr,1fr] gap-4 bg-white/5 px-5 py-3 text-xs uppercase tracking-[0.3em] text-slate-400">
                  <span>SKU</span>
                  <span>Quantity</span>
                  <span className="text-right">Price</span>
                </div>
                <div className="divide-y divide-white/5">
                  {items.length === 0 ? (
                    <div className="px-5 py-6 text-sm text-slate-400">
                      No items recorded.
                    </div>
                  ) : (
                    items.map((item: any, idx: number) => (
                      <div
                        key={`${item?.sku ?? idx}-${idx}`}
                        className="grid grid-cols-[1.5fr,1fr,1fr] items-center gap-4 px-5 py-4 text-sm text-slate-200"
                      >
                        <span className="font-mono text-xs text-slate-300">
                          {item?.sku ?? "—"}
                        </span>
                        <span>{item?.qty ?? "—"}</span>
                        <span className="text-right">
                          {currencyFormatter.format(Number(item?.price ?? 0))}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </section>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-primary/25 bg-linear-to-br from-primary/15 via-slate-950/60 to-slate-900/40 shadow-lg shadow-primary/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-white">
                Action center
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <p className="text-sm text-slate-300">
                Use the AI assessor for a narrative baseline, then finalize your
                decision with a single click.
              </p>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button
                  className="h-11 flex-1 bg-linear-to-r from-primary via-indigo-500 to-primary font-semibold text-white shadow-lg shadow-primary/40 transition hover:-translate-y-px hover:shadow-primary/60"
                  onClick={() =>
                    assess.mutate(undefined, {
                      onSuccess: () =>
                        toast("Assessment complete", {
                          description:
                            "Latest AI reasoning has been recorded for this request.",
                        }),
                    })
                  }
                  disabled={assess.isPending}
                >
                  {assess.isPending ? "Assessing…" : "AI Assess"}
                </Button>
                <Button
                  variant="outline"
                  className="h-11 flex-1 border-emerald-400/40 bg-emerald-500/10 font-semibold text-emerald-100 transition hover:-translate-y-px hover:bg-emerald-500/20"
                  onClick={() =>
                    approve.mutate(undefined, {
                      onSuccess: () =>
                        toast("Approved", {
                          description:
                            "The purchase request has been marked as approved.",
                        }),
                    })
                  }
                  disabled={pr.status !== "OPEN" || approve.isPending}
                >
                  {approve.isPending ? "Approving…" : "Approve"}
                </Button>
              </div>
              <Button
                variant="destructive"
                className="h-11 w-full border-rose-400/40 bg-rose-500/20 font-semibold text-rose-100 transition hover:-translate-y-px hover:bg-rose-500/30"
                onClick={() => setRejectOpen(true)}
                disabled={pr.status !== "OPEN" || reject.isPending}
              >
                Reject
              </Button>
            </CardContent>
          </Card>

          <Card className="border-white/5 bg-slate-900/60 shadow-xl shadow-primary/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-white">
                Latest assessment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {lastAssessment && "error" in (lastAssessment as any) ? (
                <div className="rounded-xl border border-dashed border-white/10 bg-slate-950/60 p-6 text-sm text-slate-400">
                  No assessment yet—run the AI assessor to generate guidance.
                </div>
              ) : lastAssessment ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Badge
                      variant="outline"
                      className="rounded-full border-white/10 bg-white/5 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.25em] text-slate-200"
                    >
                      Decision: {(lastAssessment as any).decision}
                    </Badge>
                    <CheckCircle2 className="h-5 w-5 text-emerald-300" />
                  </div>
                  <p className="rounded-2xl border border-white/5 bg-slate-950/60 p-4 text-sm text-slate-300">
                    {(lastAssessment as any).reason}
                  </p>
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-white/10 bg-slate-950/60 p-6 text-sm text-slate-400">
                  No assessment yet—run the AI assessor to generate guidance.
                </div>
              )}
            </CardContent>
          </Card>

          {lastAssessment && !("error" in (lastAssessment as any)) ? (
            <TraceViewer
              trace={safeParseTrace((lastAssessment as any).traceJson)}
            />
          ) : null}
        </div>
      </div>

      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent className="border border-white/10 bg-slate-950/70 text-slate-100">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-white">
              Reject purchase request
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-slate-300">
              Capture why this PR is blocked so the requester can address the
              gaps.
            </p>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Add a short rejection note…"
              className="min-h-[120px] resize-none border-white/10 bg-slate-900/60 text-slate-100"
            />
          </div>
          <DialogFooter className="gap-2 sm:gap-3">
            <Button
              variant="ghost"
              className="text-slate-300 hover:text-white"
              onClick={() => setRejectOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="border-rose-400/40 bg-rose-500/20 text-rose-100 hover:bg-rose-500/30"
              onClick={() =>
                reject.mutate(reason, {
                  onSuccess: () => {
                    setRejectOpen(false);
                    setReason("");
                    toast("Rejected", {
                      description:
                        "The purchase request has been marked as rejected.",
                    });
                  },
                })
              }
              disabled={!reason || reject.isPending}
            >
              {reject.isPending ? "Rejecting…" : "Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function safeParseTrace(traceJson?: string) {
  if (!traceJson) return [];
  try {
    return JSON.parse(traceJson);
  } catch {
    return [];
  }
}
