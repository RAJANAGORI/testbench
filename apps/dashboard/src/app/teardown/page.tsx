'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Alert, Btn, Card, PageHeader } from '@/components/ui';
import { cp } from '@/lib/api';

export default function TeardownPage() {
  const [result, setResult] = useState('');
  const [busy, setBusy] = useState(false);

  const runTeardown = async () => {
    if (!confirm('Reset the lab environment? This stops mock servers and clears captured data.')) return;
    setBusy(true);
    setResult('');
    try {
      const res = await cp.teardown();
      setResult(JSON.stringify(res, null, 2));
    } catch (e) {
      setResult(e instanceof Error ? e.message : 'Failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="animate-fade-in max-w-2xl">
      <PageHeader
        eyebrow="System"
        title="Reset lab environment"
        description="Frees scenario ports and removes captured artefacts. Use this when you're done or before starting a fresh lab."
      />

      <Alert variant="warn">
        Destructive action — running labs will be stopped and capture files cleared.
      </Alert>

      <Card className="mt-6" title="Full teardown" subtitle="Runs scripts/teardown.sh on the control plane">
        <div className="flex flex-wrap gap-3">
          <Btn variant="danger" size="lg" disabled={busy} onClick={runTeardown}>
            {busy ? 'Resetting…' : 'Reset environment'}
          </Btn>
          <Link href="/scenarios">
            <Btn variant="ghost">Back to labs</Btn>
          </Link>
        </div>
      </Card>

      {result && (
        <Card className="mt-4" title="Result">
          <pre className="overflow-x-auto font-mono text-[11px] text-ink-muted">{result}</pre>
        </Card>
      )}
    </div>
  );
}
