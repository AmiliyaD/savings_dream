import { useEffect, useState } from 'react';

interface ProgressBarProps {
  percent: number;
  colorClass?: string;
  trackClass?: string;
  heightClass?: string;
}

export function ProgressBar({
  percent,
  colorClass = 'bg-primary-500',
  trackClass = 'bg-neutral-100',
  heightClass = 'h-3',
}: ProgressBarProps) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const clamped = Math.min(100, Math.max(0, percent));
    const frame = requestAnimationFrame(() => setWidth(clamped));
    return () => cancelAnimationFrame(frame);
  }, [percent]);

  return (
    <div className={`w-full ${heightClass} ${trackClass} rounded-full overflow-hidden`}>
      <div
        className={`h-full ${colorClass} rounded-full transition-all duration-700 ease-out`}
        style={{ width: `${width}%` }}
      />
    </div>
  );
}
