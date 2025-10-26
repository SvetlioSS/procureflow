import { Badge } from '@/components/ui/badge';

type Props = { status: 'OPEN' | 'APPROVED' | 'REJECTED' };

const palette: Record<Props['status'], { label: string; badge: string; dot: string }> = {
  OPEN: {
    label: 'Awaiting Review',
    badge: 'border-amber-400/30 bg-amber-500/10 text-amber-100',
    dot: 'bg-amber-300 animate-pulse',
  },
  APPROVED: {
    label: 'Approved',
    badge: 'border-emerald-400/25 bg-emerald-500/10 text-emerald-100',
    dot: 'bg-emerald-300',
  },
  REJECTED: {
    label: 'Rejected',
    badge: 'border-rose-400/30 bg-rose-500/15 text-rose-100',
    dot: 'bg-rose-300',
  },
};

export function StatusBadge({ status }: Props) {
  const { label, badge, dot } = palette[status] ?? palette.OPEN;
  return (
    <Badge
      variant="outline"
      className={`flex items-center gap-2 rounded-full px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.18em] shadow-sm shadow-black/20 backdrop-blur ${badge}`}
    >
      <span className={`h-2 w-2 rounded-full ${dot}`} />
      {label}
    </Badge>
  );
}
