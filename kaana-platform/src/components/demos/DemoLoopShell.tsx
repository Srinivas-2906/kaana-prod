import type { ReactNode } from 'react';
import { useDemoLoop } from '../../lib/useDemoLoop';

interface Props {
  industryId: string;
  /** Delay (seconds) of the last animated element in this demo */
  maxDelaySec: number;
  className?: string;
  children: ReactNode;
}

export function DemoLoopShell({ industryId, maxDelaySec, className = 'demo-shell', children }: Props) {
  const cycle = useDemoLoop(industryId, maxDelaySec);
  return (
    <div className={className} key={cycle}>
      {children}
    </div>
  );
}
