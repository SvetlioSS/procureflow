import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import type { AssessmentTrace } from '@/types';

export function TraceViewer({ trace }: { trace: AssessmentTrace[] }) {
  if (!trace?.length) return null;
  return (
    <Card className="border-white/5 bg-slate-900/60 shadow-xl shadow-indigo-500/10">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold text-slate-200">Tool Trace</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {trace.map((t, i) => (
          <div
            key={i}
            className="rounded-xl border border-white/5 bg-slate-950/60 p-4 text-sm shadow-inner shadow-black/30"
          >
            <div className="flex items-center justify-between text-slate-200">
              <span className="font-medium tracking-tight">
                {i + 1}. {t.tool}
              </span>
              <span className="text-xs uppercase text-slate-400">Invocation</span>
            </div>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <TraceBlock title="Args" payload={t.args} />
              <TraceBlock title="Result" payload={t.result} />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function TraceBlock({ title, payload }: { title: string; payload: Record<string, any> }) {
  return (
    <div className="rounded-lg border border-white/5 bg-slate-900/60 p-3">
      <div className="text-xs font-medium uppercase tracking-wider text-slate-400">{title}</div>
      <pre className="mt-2 max-h-48 overflow-auto rounded bg-black/40 p-3 text-[0.7rem] leading-relaxed text-slate-300">
        {JSON.stringify(payload, null, 2)}
      </pre>
    </div>
  );
}
