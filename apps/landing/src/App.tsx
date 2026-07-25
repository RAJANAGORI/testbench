import { site } from './content/site';
import { ScrollProgress } from './components/motion-primitives/scroll-progress';
import { FinalCta } from './sections/FinalCta';
import { Hero } from './sections/Hero';
import { KillChain } from './sections/KillChain';
import { LabsPulse } from './sections/LabsPulse';
import { Nav } from './sections/Nav';
import { Safety } from './sections/Safety';
import { ScenarioTicker } from './sections/ScenarioTicker';
import { Tracks } from './sections/Tracks';

function resolveUrl(envUrl: string | undefined, port: string): string {
  if (typeof window !== 'undefined') {
    return `http://${window.location.hostname}:${port}`;
  }
  return envUrl ?? `http://0.0.0.0:${port}`;
}

export default function App() {
  const goDashboard = () => {
    window.location.href = resolveUrl(import.meta.env.VITE_DASHBOARD_URL, site.dashboardPort);
  };

  return (
    <div className="min-h-screen bg-[var(--scas-bg)] text-[var(--scas-text)]">
      <ScrollProgress />
      <Nav onDashboard={goDashboard} />
      <main>
        <Hero onDashboard={goDashboard} />
        <ScenarioTicker />
        <KillChain />
        <Safety />
        <LabsPulse />
        <Tracks />
        <FinalCta onDashboard={goDashboard} />
      </main>
    </div>
  );
}
