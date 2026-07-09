'use client';

import { LogConsole } from '@/components/LogConsole';
import { PageHeader } from '@/components/ui';

export default function ConsolePage() {
  return (
    <div className="animate-fade-in">
      <PageHeader
        eyebrow="Output"
        title="Live terminal"
        description="Stream stdout and stderr from every active lab session in real time."
      />
      <LogConsole tall className="shadow-panel" />
    </div>
  );
}
