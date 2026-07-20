import { cn, stateColor } from '@/lib/utils';

export default function Badge({ state, className }: { state: string; className?: string }) {
  return (
    <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', stateColor(state), className)}>
      {state}
    </span>
  );
}
