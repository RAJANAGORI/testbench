import { useEffect, useRef, useState } from 'react';

const DASHBOARD_URL = import.meta.env.VITE_DASHBOARD_URL ?? 'http://127.0.0.1:3100';
const CONTROL_PLANE_URL = import.meta.env.VITE_CONTROL_PLANE_URL ?? 'http://127.0.0.1:3101';

function useBeamAnimation(
  pipelineRef: React.RefObject<HTMLDivElement | null>,
  nodeStackRef: React.RefObject<HTMLDivElement | null>,
  nodeXRef: React.RefObject<HTMLDivElement | null>,
  nodeShieldRef: React.RefObject<HTMLDivElement | null>,
  beamGlowRef: React.RefObject<SVGPathElement | null>,
  beamCoreRef: React.RefObject<SVGPathElement | null>,
  gradientRef: React.RefObject<SVGLinearGradientElement | null>,
  splashRef: React.RefObject<HTMLDivElement | null>,
) {
  useEffect(() => {
    const pipeline = pipelineRef.current;
    const nodeStack = nodeStackRef.current;
    const nodeX = nodeXRef.current;
    const nodeShield = nodeShieldRef.current;
    const beamGlow = beamGlowRef.current;
    const beamCore = beamCoreRef.current;
    const gradient = gradientRef.current;
    const splash = splashRef.current;
    if (!pipeline || !nodeStack || !nodeX || !nodeShield || !beamGlow || !beamCore || !gradient || !splash) return;

    let raf = 0;
    let state: 'p1' | 'splash' | 'p2' | 'idle' = 'p1';
    let lastStateChange = performance.now();
    let percentage = 0;

    const updatePath = () => {
      const pRect = pipeline.getBoundingClientRect();
      const sRect = nodeStack.getBoundingClientRect();
      const xRect = nodeX.getBoundingClientRect();
      const shRect = nodeShield.getBoundingClientRect();
      const startX = sRect.left + sRect.width / 2 - pRect.left;
      const startY = sRect.top + sRect.height / 2 - pRect.top;
      const midX = xRect.left + xRect.width / 2 - pRect.left;
      const midY = xRect.top + xRect.height / 2 - pRect.top;
      const endX = shRect.left + shRect.width / 2 - pRect.left;
      const endY = shRect.top + shRect.height / 2 - pRect.top;
      const d = `M ${startX},${startY} L ${midX},${midY} L ${endX},${endY}`;
      beamGlow.setAttribute('d', d);
      beamCore.setAttribute('d', d);
    };

    const updateGradient = (p: number) => {
      const center = p * 100;
      gradient.setAttribute('x1', `${center - 5}%`);
      gradient.setAttribute('x2', `${center + 5}%`);
      gradient.setAttribute('y1', '0%');
      gradient.setAttribute('y2', '0%');
    };

    const loop = (now: number) => {
      const elapsed = now - lastStateChange;

      if (state === 'p1') {
        percentage = Math.min(1, elapsed / 800) * 0.5;
        updateGradient(percentage);
        if (percentage < 0.4) nodeStack.classList.add('active');
        else nodeStack.classList.remove('active');
        if (elapsed >= 800) {
          state = 'splash';
          lastStateChange = now;
          beamGlow.style.opacity = '0';
          beamCore.style.opacity = '0';
          splash.classList.add('animate');
        }
      } else if (state === 'splash') {
        if (elapsed >= 800) {
          state = 'p2';
          lastStateChange = now;
          splash.classList.remove('animate');
          beamGlow.style.opacity = '0.6';
          beamCore.style.opacity = '1';
          percentage = 0.5;
        }
      } else if (state === 'p2') {
        percentage = 0.5 + Math.min(1, elapsed / 800) * 0.5;
        updateGradient(percentage);
        if (percentage > 0.6) nodeShield.classList.add('active');
        if (elapsed >= 800) {
          nodeShield.classList.remove('active');
          state = 'idle';
          lastStateChange = now;
        }
      } else if (state === 'idle') {
        if (elapsed >= 1000) {
          state = 'p1';
          lastStateChange = now;
          percentage = 0;
        }
      }

      raf = requestAnimationFrame(loop);
    };

    const onResize = () => updatePath();
    updatePath();
    window.addEventListener('resize', onResize);
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
    };
  }, [pipelineRef, nodeStackRef, nodeXRef, nodeShieldRef, beamGlowRef, beamCoreRef, gradientRef, splashRef]);
}

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [cpOnline, setCpOnline] = useState<boolean | null>(null);
  const pipelineRef = useRef<HTMLDivElement>(null);
  const nodeStackRef = useRef<HTMLDivElement>(null);
  const nodeXRef = useRef<HTMLDivElement>(null);
  const nodeShieldRef = useRef<HTMLDivElement>(null);
  const beamGlowRef = useRef<SVGPathElement>(null);
  const beamCoreRef = useRef<SVGPathElement>(null);
  const gradientRef = useRef<SVGLinearGradientElement>(null);
  const splashRef = useRef<HTMLDivElement>(null);

  useBeamAnimation(
    pipelineRef, nodeStackRef, nodeXRef, nodeShieldRef,
    beamGlowRef, beamCoreRef, gradientRef, splashRef,
  );

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  useEffect(() => {
    const check = () => {
      fetch(`${CONTROL_PLANE_URL}/api/health`)
        .then((r) => setCpOnline(r.ok))
        .catch(() => setCpOnline(false));
    };
    check();
    const t = setInterval(check, 5000);
    return () => clearInterval(t);
  }, []);

  const openDashboard = () => {
    window.location.href = DASHBOARD_URL;
  };

  return (
    <>
      <nav>
        <span className="nav-logo">SCAS</span>
        <button
          type="button"
          className={`menu-toggle${menuOpen ? ' active' : ''}`}
          aria-label="Toggle menu"
          onClick={() => setMenuOpen((v) => !v)}
        >
          <span />
          <span />
        </button>
        <div className={`nav-menu${menuOpen ? ' active' : ''}`}>
          <ul className="nav-links">
            <li><a href={DASHBOARD_URL}>Scenarios</a></li>
            <li><a href={`${DASHBOARD_URL}/console`}>Console</a></li>
            <li><a href="https://github.com/RAJANAGORI/supply-chain-attack-simulator" target="_blank" rel="noreferrer">Docs</a></li>
          </ul>
          <div className="nav-actions">
            <button type="button" className="btn-login" onClick={openDashboard}>Dashboard</button>
            <button type="button" className="btn-signup" onClick={openDashboard}>Start lab</button>
          </div>
        </div>
      </nav>

      <section className="hero-card">
        <div className="hero-grid" aria-hidden="true" />
        <div className="icon-pipeline" ref={pipelineRef}>
          <svg className="beam-svg" aria-hidden="true">
            <defs>
              <filter id="glow">
                <feGaussianBlur stdDeviation="2" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
              <linearGradient id="beam-gradient" ref={gradientRef} gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#b04090" stopOpacity="0" />
                <stop offset="20%" stopColor="#b04090" stopOpacity="0.8" />
                <stop offset="50%" stopColor="#fff" stopOpacity="1" />
                <stop offset="80%" stopColor="#c8a0e0" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#c8a0e0" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path ref={beamGlowRef} stroke="url(#beam-gradient)" strokeWidth="2" fill="none" filter="url(#glow)" opacity="0.6" />
            <path ref={beamCoreRef} stroke="url(#beam-gradient)" strokeWidth="0.8" fill="none" />
          </svg>

          <div className="icon-node node-light-right" id="node-stack" ref={nodeStackRef} title="Package registry">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <polygon points="12 2 2 7 12 12 22 7 12 2" />
              <polyline points="2 17 12 22 22 17" />
              <polyline points="2 12 12 17 22 12" />
            </svg>
          </div>

          <div className="pipeline-line" />

          <div style={{ position: 'relative' }}>
            <div className="splash" ref={splashRef} />
            <div className="icon-node-center" id="node-x" ref={nodeXRef} title="SCAS lab bench">
              <svg viewBox="0 0 40 40" aria-hidden="true">
                <path fill="white" d="M12 8h16v4H12V8zm0 10h10v4H12v-4zm0 10h16v4H12v-4z" opacity="0.9" />
                <path fill="white" d="M8 8h4v24H8V8z" />
              </svg>
            </div>
          </div>

          <div className="pipeline-line right" />

          <div className="icon-node node-light-left" id="node-shield" ref={nodeShieldRef} title="Detection & defense">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <polyline points="9 12 11 14 15 10" />
            </svg>
          </div>
        </div>

        <div className="hero-content">
          <p className="hero-eyebrow">Supply Chain Attack Simulator</p>
          <h1 className="hero-heading">
            The hands-on way
            <strong>to practice supply chain attacks</strong>
          </h1>
          <p className="hero-sub">
            23 localhost-only labs — run mocks, victim apps, Floci, and
            <br />
            Elasticsearch/Kibana from one dashboard. Attack, detect, defend.
          </p>

          {cpOnline === false && (
            <p className="hero-warning">
              Control plane offline — run <code>npm run dev:control-plane</code> or <code>./scripts/start-dashboard.sh</code>
            </p>
          )}

          <button type="button" className="btn-cta" onClick={openDashboard}>
            Start Dashboard
          </button>

          {cpOnline === true && (
            <p className="hero-status">
              <span className="status-dot online" /> Control plane connected
            </p>
          )}
        </div>
      </section>

      <div className="brands">
        <div className="brand-item">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <rect x="4" y="4" width="16" height="16" rx="2" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <path d="M8 12h8M12 8v8" stroke="currentColor" strokeWidth="1.5" />
          </svg>
          npm
        </div>
        <div className="brand-item">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 6h16v12H4V6z" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <path d="M8 10h8M8 14h5" stroke="currentColor" strokeWidth="1.5" />
          </svg>
          PyPI
        </div>
        <div className="brand-item">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 4L4 8v8l8 4 8-4V8l-8-4z" fill="none" stroke="currentColor" strokeWidth="1.5" />
          </svg>
          Docker
        </div>
        <div className="brand-item">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <path d="M8 12h8M12 8v8" stroke="currentColor" strokeWidth="1.5" />
          </svg>
          Elasticsearch
        </div>
        <div className="brand-item">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M6 18L12 6l6 12H6z" fill="none" stroke="currentColor" strokeWidth="1.5" />
          </svg>
          Floci
        </div>
      </div>
    </>
  );
}
