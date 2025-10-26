import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Sparkles,
  Clock3,
  CheckCircle2,
  CircleX,
  ArrowRight,
} from "lucide-react";
import { usePRs } from "@/hooks/usePR";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/StatusBadge";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

export function PRListPage() {
  const { data, isLoading } = usePRs();
  const nav = useNavigate();

  const currencyFormatter = useMemo(
    () =>
      new Intl.NumberFormat(undefined, {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
      }),
    []
  );

  const dateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(undefined, {
        month: "short",
        day: "numeric",
      }),
    []
  );

  const statCards = useMemo(() => {
    if (!data?.length) return [];

    const totals = data.reduce(
      (acc, pr) => {
        acc.total += 1;
        acc.value += Number(pr.total ?? 0);
        if (pr.status === "OPEN") acc.open += 1;
        if (pr.status === "APPROVED") acc.approved += 1;
        if (pr.status === "REJECTED") acc.rejected += 1;
        return acc;
      },
      { total: 0, value: 0, open: 0, approved: 0, rejected: 0 }
    );

    return [
      {
        label: "Pipeline",
        value: totals.total,
        caption: `${totals.open} open`,
        icon: Sparkles,
        accent: "text-sky-300",
        chip: "bg-sky-500/15 text-sky-100 border-sky-400/20",
      },
      {
        label: "Open Reviews",
        value: totals.open,
        caption: "Awaiting decision",
        icon: Clock3,
        accent: "text-amber-300",
        chip: "bg-amber-500/15 text-amber-100 border-amber-400/20",
      },
      {
        label: "Approved",
        value: totals.approved,
        caption: "Greenlit spend",
        icon: CheckCircle2,
        accent: "text-emerald-300",
        chip: "bg-emerald-500/15 text-emerald-100 border-emerald-400/20",
      },
      {
        label: "Rejected",
        value: totals.rejected,
        caption: "Needs refinement",
        icon: CircleX,
        accent: "text-rose-300",
        chip: "bg-rose-500/15 text-rose-100 border-rose-400/20",
      },
    ];
  }, [data]);

  const showEmptyState = !isLoading && (!data || data.length === 0);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium uppercase tracking-[0.3em] text-slate-200/80">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          Purchase Intelligence
        </div>
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">
              Purchase Requests
            </h1>
            <p className="max-w-2xl text-sm text-slate-300">
              Monitor spend velocity, triage open approvals, and dive deep into
              every request with a single click.
            </p>
          </div>
        </div>
      </div>

      {isLoading ? (
        <Card className="border-white/5 bg-slate-900/50 shadow-xl shadow-primary/10">
          <CardContent className="space-y-3 py-8">
            <Skeleton className="h-10 w-3/5 rounded-xl bg-slate-800/60" />
            <Skeleton className="h-24 w-full rounded-2xl bg-slate-800/60" />
            <Skeleton className="h-10 w-full rounded-lg bg-slate-800/60" />
            <Skeleton className="h-10 w-2/3 rounded-lg bg-slate-800/60" />
            <Skeleton className="h-10 w-1/2 rounded-lg bg-slate-800/60" />
          </CardContent>
        </Card>
      ) : (
        <>
          {statCards.length > 0 && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {statCards.map(
                ({ label, value, caption, icon: Icon, accent, chip }) => (
                  <Card
                    key={label}
                    className="border-white/5 bg-slate-900/60 shadow-lg shadow-primary/10 transition hover:-translate-y-1 hover:border-primary/40 hover:shadow-2xl hover:shadow-primary/20"
                  >
                    <CardContent className="flex flex-col gap-4 py-5">
                      <div className="flex items-center justify-between text-xs uppercase tracking-[0.35em] text-slate-400">
                        <span>{label}</span>
                        <Icon className={`h-4 w-4 ${accent}`} />
                      </div>
                      <div className="space-y-2">
                        <div className="text-3xl font-semibold text-white">
                          {value}
                        </div>
                        <Badge
                          variant="outline"
                          className={`w-fit rounded-full px-2.5 py-1 text-[0.65rem] font-medium uppercase tracking-[0.2em] ${chip}`}
                        >
                          {caption}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                )
              )}
            </div>
          )}

          <Card className="border-white/5 bg-slate-900/60 shadow-2xl shadow-primary/15">
            <CardHeader className="flex flex-col gap-2 border-b border-white/5 pb-5">
              <CardTitle className="text-lg font-semibold text-white">
                Latest activity
              </CardTitle>
              <p className="text-sm text-slate-300">
                Stay ahead with a chronological view of every purchase request.
                Hover for context, tap to dive deeper.
              </p>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              {showEmptyState ? (
                <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-white/10 bg-slate-900/60 py-16 text-center">
                  <Sparkles className="h-10 w-10 text-primary" />
                  <div className="space-y-1">
                    <p className="text-lg font-semibold text-white">
                      No purchase requests yet
                    </p>
                    <p className="text-sm text-slate-300">
                      When requests arrive from the gateway they will light up
                      this dashboard.
                    </p>
                  </div>
                </div>
              ) : (
                <Table className="min-w-[720px] mt-8">
                  <TableHeader className="bg-white/5 text-xs uppercase tracking-[0.25em] text-slate-400">
                    <TableRow className="border-white/5">
                      <TableHead className="py-3 text-slate-400">
                        PR ID
                      </TableHead>
                      <TableHead className="py-3 text-slate-400">
                        Requester
                      </TableHead>
                      <TableHead className="py-3 text-slate-400">
                        Cost Center
                      </TableHead>
                      <TableHead className="py-3 text-slate-400">
                        Total
                      </TableHead>
                      <TableHead className="py-3 text-slate-400">
                        Status
                      </TableHead>
                      <TableHead className="py-3 text-right text-slate-400">
                        {" "}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data?.map((pr) => {
                      const updatedLabel = pr.updatedAt
                        ? dateFormatter.format(new Date(pr.updatedAt))
                        : "—";
                      return (
                        <TableRow
                          key={pr.id}
                          className="group cursor-pointer border-white/5 transition-colors hover:bg-white/5"
                          onClick={() => nav(`/pr/${pr.id}`)}
                        >
                          <TableCell className="font-mono text-xs text-slate-300">
                            {pr.id}
                          </TableCell>
                          <TableCell className="max-w-[200px]">
                            <div className="flex flex-col">
                              <span className="font-medium text-slate-100">
                                {pr.requester}
                              </span>
                              <span className="text-xs text-slate-400">
                                Updated {updatedLabel}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-medium uppercase tracking-[0.25em] text-slate-200">
                              {pr.costCenter}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-semibold text-slate-100">
                            {currencyFormatter.format(pr.total ?? 0)}
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={pr.status} />
                          </TableCell>
                          <TableCell className="text-right text-slate-500">
                            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
