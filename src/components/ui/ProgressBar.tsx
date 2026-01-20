import { cn } from '@/lib/utils';

interface ProgressBarProps {
  value: number;
  max?: number;
  className?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  color?: 'amber' | 'green' | 'yellow' | 'red' | 'neutral';
}

export function ProgressBar({
  value,
  max = 100,
  className,
  showLabel = false,
  size = 'md',
  color = 'amber',
}: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  const sizes = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  const colors = {
    amber: 'bg-amber-600',
    green: 'bg-emerald-600',
    yellow: 'bg-yellow-600',
    red: 'bg-red-600',
    neutral: 'bg-neutral-500',
  };

  return (
    <div className={cn('w-full', className)}>
      <div className={cn('w-full bg-neutral-800 rounded-full overflow-hidden', sizes[size])}>
        <div
          className={cn('h-full rounded-full transition-all duration-500 ease-out', colors[color])}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <p className="text-sm text-neutral-400 mt-1 text-right">{Math.round(percentage)}%</p>
      )}
    </div>
  );
}
