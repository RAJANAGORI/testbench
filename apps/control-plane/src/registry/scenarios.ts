import type { ScenarioDefinition } from './types.js';
import { LEARN } from './learn.js';
import { getRepoRoot } from '../env.js';

function scenarioPath(slug: string): string {
  return `${getRepoRoot()}/scenarios/${slug}`;
}

function mockService(id: string, port: number, file = 'mock-server.js'): ScenarioDefinition['services'][0] {
  return {
    id,
    label: `Mock server :${port}`,
    command: 'node',
    args: [`infrastructure/${file}`],
    cwd: '.',
    port,
  };
}

function capture(port: number, path = '/captured-data', label = 'Captured data'): ScenarioDefinition['captures'][0] {
  return {
    id: `capture-${port}`,
    label,
    url: `http://127.0.0.1:${port}${path}`,
    clearUrl: `http://127.0.0.1:${port}${path}`,
  };
}

function victimStep(id: string, label: string, command: string, args: string[] = [], cwd = 'victim-app'): ScenarioDefinition['steps'][0] {
  return { id, label, command, args, cwd };
}

function baseScenario(
  id: string,
  slug: string,
  title: string,
  level: ScenarioDefinition['level'],
  port: number,
  steps: ScenarioDefinition['steps'],
  extra: Partial<ScenarioDefinition> = {},
): ScenarioDefinition {
  const capturePath = extra.captures?.[0]?.url?.includes('/beacon')
    ? '/beacon'
    : extra.captures?.[0]?.url?.includes('/capture')
      ? '/capture'
      : '/captured-data';

  return {
    id,
    slug,
    title,
    level,
    ports: extra.ports ?? [port],
    setup: { command: './setup.sh', cwd: scenarioPath(slug) },
    services: extra.services ?? [mockService('mock', port)],
    steps,
    captures: extra.captures ?? [capture(port, capturePath)],
    floci: extra.floci,
    docs: {
      readme: `scenarios/${slug}/README.md`,
      detect: `scenarios/${slug}/DETECT.md`,
    },
    learn: extra.learn ?? LEARN[id],
  };
}

export const SCENARIOS: ScenarioDefinition[] = [
  baseScenario('01', '01-typosquatting', 'Typosquatting', 'Beginner', 3000, [
    victimStep('install', 'Install typosquatted package', 'npm', ['install', '../malicious-packages/request-lib']),
    victimStep('run', 'Run victim app', 'npm', ['start']),
  ]),
  baseScenario('02', '02-dependency-confusion', 'Dependency confusion', 'Beginner', 3000, [
    victimStep('install', 'Install from attacker registry', 'npm', ['install'], 'corporate-app'),
    victimStep('run', 'Run corporate app', 'npm', ['start'], 'corporate-app'),
  ], {
    ports: [3000, 4874],
    services: [
      mockService('mock', 3000),
      { id: 'registry', label: 'Attacker registry :4874', command: 'node', args: ['infrastructure/registry-server.js'], cwd: '.', port: 4874 },
    ],
  }),
  baseScenario('03', '03-compromised-package', 'Compromised package', 'Beginner', 3000, [
    victimStep('run-legit', 'Run with legitimate package', 'npm', ['start']),
    victimStep('install-bad', 'Install compromised package', 'npm', ['install', '../compromised-package/secure-validator']),
    victimStep('run-bad', 'Run with compromised package', 'npm', ['start']),
  ]),
  baseScenario('04', '04-malicious-update', 'Malicious update', 'Intermediate', 3000, [
    victimStep('install', 'Install malicious update', 'npm', ['install', '../malicious-update/utils-helper'], 'victim-app'),
    victimStep('run', 'Run victim app', 'npm', ['start'], 'victim-app'),
  ]),
  baseScenario('05', '05-build-compromise', 'Build system compromise', 'Advanced', 3000, [
    victimStep('install', 'Install compromised build artifact', 'npm', ['install', '../compromised-build/dist/'], 'victim-app'),
    victimStep('run', 'Run victim app', 'npm', ['start'], 'victim-app'),
  ], { floci: { seed: 'infrastructure/floci/seed.sh', verify: 'infrastructure/floci/verify.sh' } }),
  {
    id: '06',
    slug: '06-sha-hulud',
    title: 'Shai-Hulud (self-replicating)',
    level: 'Advanced',
    ports: [3000, 3001, 3002, 3003],
    setup: { command: './setup.sh', cwd: scenarioPath('06-sha-hulud') },
    services: [
      { id: 'cdn', label: 'Mock CDN :3000', command: 'node', args: ['mock-cdn.js'], cwd: 'infrastructure', port: 3000 },
      { id: 'harvester', label: 'Credential harvester :3001', command: 'node', args: ['credential-harvester.js'], cwd: 'infrastructure', port: 3001 },
      { id: 'gha', label: 'GitHub Actions sim :3002', command: 'node', args: ['github-actions-simulator.js'], cwd: 'infrastructure', port: 3002 },
      { id: 'replication', label: 'Replication sim :3003', command: 'node', args: ['replication-simulator.js'], cwd: 'infrastructure', port: 3003 },
    ],
    steps: [
      victimStep('install', 'Install compromised data-processor', 'npm', ['install', '../compromised-package/data-processor'], 'victim-app'),
      victimStep('run', 'Run victim app', 'npm', ['start'], 'victim-app'),
    ],
    captures: [
      { id: 'credentials', label: 'Harvested credentials', url: 'http://127.0.0.1:3001/captured-credentials', clearUrl: 'http://127.0.0.1:3001/captured-credentials' },
    ],
    floci: { seed: 'infrastructure/floci/seed.sh', verify: 'infrastructure/floci/verify.sh' },
    docs: { readme: 'scenarios/06-sha-hulud/README.md', detect: 'scenarios/06-sha-hulud/DETECT.md' },
    learn: LEARN['06'],
  },
  baseScenario('07', '07-transitive-dependency', 'Transitive dependency', 'Intermediate', 3000, [
    victimStep('install', 'Install dependencies', 'npm', ['install']),
    { id: 'swap', label: 'Swap compromised transitive dep', command: 'bash', args: ['-c', 'rm -rf node_modules/data-processor && cp -r ../compromised-packages/data-processor node_modules/data-processor && node node_modules/data-processor/postinstall.js || true'], cwd: 'victim-app', shell: true },
    victimStep('run', 'Run victim app', 'npm', ['start']),
  ]),
  baseScenario('08', '08-package-lock-file-manipulation', 'Package lock manipulation', 'Intermediate', 3000, [
    victimStep('install', 'Install from manipulated lockfile', 'npm', ['install']),
    victimStep('run', 'Run victim app', 'npm', ['start']),
  ]),
  baseScenario('09', '09-package-signing-bypass', 'Package signing bypass', 'Advanced', 3000, [
    victimStep('install', 'Install unsigned compromised package', 'npm', ['install', '../compromised-package/secure-utils']),
    victimStep('run', 'Run victim app', 'npm', ['start']),
  ]),
  baseScenario('10', '10-git-submodule-attack', 'Git submodule attack', 'Intermediate', 3000, [
    victimStep('install', 'Install victim dependencies', 'npm', ['install']),
    victimStep('run', 'Run victim app', 'npm', ['start']),
  ]),
  baseScenario('11', '11-registry-mirror-poisoning', 'Registry mirror poisoning', 'Advanced', 3000, [
    victimStep('install', 'Install from poisoned mirror', 'npm', ['install'], 'corporate-app'),
    victimStep('run', 'Run corporate app', 'npm', ['start'], 'corporate-app'),
  ], {
    ports: [3000, 4873],
    services: [
      mockService('mock', 3000),
      { id: 'mirror', label: 'Poisoned registry :4873', command: 'node', args: ['infrastructure/registry-server.js'], cwd: '.', port: 4873 },
    ],
    floci: { seed: 'infrastructure/floci/seed.sh', verify: 'infrastructure/floci/verify.sh' },
  }),
  baseScenario('12', '12-workspace-monorepo-attack', 'Workspace / monorepo', 'Intermediate', 3000, [
    victimStep('install-root', 'Install workspace root', 'npm', ['install'], '.'),
    victimStep('install-api', 'Install api package', 'npm', ['install'], 'packages/api'),
    victimStep('install-utils', 'Install utils package', 'npm', ['install'], 'packages/utils'),
    victimStep('run', 'Run victim app', 'npm', ['start'], 'victim-app'),
  ], { setup: { command: './setup.sh', cwd: scenarioPath('12-workspace-monorepo-attack') } }),
  baseScenario('13', '13-package-metadata-manipulation', 'Metadata manipulation', 'Intermediate', 3001, [
    victimStep('install', 'Install metadata-tampered package', 'npm', ['install', '../compromised-packages/clean-utils']),
    victimStep('run', 'Run victim app', 'npm', ['start']),
  ], { captures: [capture(3001, '/capture', 'Captured metadata exfil')] }),
  baseScenario('14', '14-container-image-supply-chain-attack', 'Container image supply chain', 'Advanced', 3002, [
    victimStep('run', 'Run malicious container start', 'node', ['malicious-start.js'], 'victim-app'),
  ], {
    ports: [3002],
    captures: [capture(3002, '/capture', 'Container exfil capture')],
    floci: { seed: 'infrastructure/floci/seed.sh', verify: 'infrastructure/floci/verify.sh' },
  }),
  baseScenario('15', '15-developer-tool-compromise', 'Developer tool compromise', 'Advanced', 3015, [
    victimStep('run', 'Run victim with malicious dev tool', 'npm', ['start']),
  ], { ports: [3015] }),
  baseScenario('16', '16-package-cache-poisoning', 'Package cache poisoning', 'Intermediate', 3016, [
    victimStep('install1', 'First install (poisons cache)', 'npm', ['install']),
    victimStep('install2', 'Second install (reuses poisoned cache)', 'npm', ['install']),
    victimStep('run', 'Run victim app', 'npm', ['start']),
  ], { ports: [3016] }),
  baseScenario('17', '17-multi-stage-attack-chain', 'Multi-stage attack chain', 'Advanced', 3017, [
    victimStep('install', 'Install staged packages', 'npm', ['install', '../packages/stage1-access-lib', '../packages/stage2-compromised-lib']),
    victimStep('run', 'Run victim app', 'npm', ['start']),
  ], { ports: [3017], floci: { seed: 'infrastructure/floci/seed.sh', verify: 'infrastructure/floci/verify.sh' } }),
  baseScenario('18', '18-package-manager-plugin-attack', 'Package manager plugin', 'Advanced', 3018, [
    victimStep('run', 'Run victim (plugin hooks fire)', 'npm', ['start']),
  ], { ports: [3018] }),
  baseScenario('19', '19-sbom-manipulation-attack', 'SBOM manipulation', 'Advanced', 3019, [
    victimStep('install', 'Install dependencies', 'npm', ['install']),
    victimStep('run', 'Run victim app', 'npm', ['start']),
  ], { ports: [3019], floci: { seed: 'infrastructure/floci/seed.sh', verify: 'infrastructure/floci/verify.sh' } }),
  baseScenario('20', '20-package-version-confusion', 'Package version confusion', 'Advanced', 3020, [
    victimStep('install', 'Install dependencies', 'npm', ['install']),
    victimStep('run', 'Run victim (highest version wins)', 'npm', ['start']),
  ], { ports: [3020] }),
  baseScenario('21', '21-axios-compromised-release-attack', 'Axios-style npm release', 'Advanced', 3021, [
    victimStep('install', 'Install compromised release tarball', 'npm', ['install', 'axios-like@file:../packages/axios-like-1.14.1.tgz']),
    victimStep('run', 'Run victim app', 'npm', ['start']),
  ], {
    ports: [3021],
    captures: [{ id: 'beacon', label: 'Beacon captures', url: 'http://127.0.0.1:3021/beacon', clearUrl: 'http://127.0.0.1:3021/beacon' }],
  }),
  {
    id: '22',
    slug: '22-litellm-pypi-compromise',
    title: 'LiteLLM-style PyPI compromise',
    level: 'Advanced',
    ports: [3022],
    setup: { command: './setup.sh', cwd: scenarioPath('22-litellm-pypi-compromise') },
    services: [
      {
        id: 'mock-py',
        label: 'Python mock server :3022',
        command: 'bash',
        args: ['-c', 'source victim-app/venv/bin/activate && python infrastructure/mock_server.py'],
        cwd: '.',
        port: 3022,
      },
    ],
    steps: [
      { id: 'install', label: 'Install compromised PyPI package', command: 'bash', args: ['-c', 'source venv/bin/activate && pip install ../malicious-packages/litellm-like'], cwd: 'victim-app' },
      { id: 'run', label: 'Run victim app', command: 'bash', args: ['-c', 'source venv/bin/activate && python app.py'], cwd: 'victim-app' },
    ],
    captures: [capture(3022)],
    docs: { readme: 'scenarios/22-litellm-pypi-compromise/README.md', detect: 'scenarios/22-litellm-pypi-compromise/DETECT.md' },
    learn: LEARN['22'],
  },
  baseScenario('23', '23-trivy-supply-chain-attack', 'Trivy supply chain attack', 'Advanced', 3023, [
    victimStep('install', 'Install compromised trivy module', 'npm', ['install'], 'victim-ci'),
    victimStep('run', 'Run CI victim', 'npm', ['start'], 'victim-ci'),
  ], {
    ports: [3023],
    services: [{ id: 'mock-c2', label: 'Mock C2 server :3023', command: 'node', args: ['infrastructure/mock-c2-server.js'], cwd: '.', port: 3023 }],
    floci: { seed: 'infrastructure/floci/seed.sh', verify: 'infrastructure/floci/verify.sh' },
  }),
  baseScenario('24', '24-slopsquatting', 'Slopsquatting', 'Intermediate', 3024, [
    victimStep('install', 'Install hallucinated package', 'npm', ['install', '../malicious-packages/python-asyncio-utils']),
    victimStep('run', 'Run victim app', 'npm', ['start']),
  ], { ports: [3024], floci: { seed: 'infrastructure/floci/seed.sh', verify: 'infrastructure/floci/verify.sh' } }),
  baseScenario('25', '25-gha-reusable-workflow', 'Compromised reusable GitHub Action', 'Advanced', 3025, [
    victimStep('run', 'Simulate unsafe workflow', 'node', ['infrastructure/gha-runner.js', 'workflows/unsafe.yml'], '.'),
  ], { ports: [3025], floci: { seed: 'infrastructure/floci/seed.sh', verify: 'infrastructure/floci/verify.sh' } }),
  baseScenario('26', '26-malicious-mcp-server', 'Malicious MCP server', 'Advanced', 3026, [
    victimStep('run', 'Run victim agent', 'node', ['agent.js'], 'victim-agent'),
  ], {
    ports: [3026, 3926],
    services: [
      mockService('mock', 3026),
      { id: 'mcp', label: 'MCP-shaped server :3926', command: 'node', args: ['infrastructure/mcp-server.js'], cwd: '.', port: 3926 },
    ],
    floci: { seed: 'infrastructure/floci/seed.sh', verify: 'infrastructure/floci/verify.sh' },
  }),
  baseScenario('27', '27-npm-provenance-bypass', 'npm provenance bypass', 'Advanced', 3027, [
    victimStep('install', 'Install dirty widget-lib 1.0.1', 'npm', ['install']),
    victimStep('run', 'Run victim app', 'npm', ['start']),
  ], { ports: [3027], floci: { seed: 'infrastructure/floci/seed.sh', verify: 'infrastructure/floci/verify.sh' } }),
  baseScenario('28', '28-go-module-confusion', 'Go module confusion', 'Advanced', 3028, [
    {
      id: 'run',
      label: 'go run against mock GOPROXY',
      command: 'bash',
      args: ['-c', "GOPROXY=http://127.0.0.1:3028,off GOSUMDB=off GONOSUMDB='*' go run -mod=mod ."],
      cwd: 'victim-module',
    },
  ], { ports: [3028], floci: { seed: 'infrastructure/floci/seed.sh', verify: 'infrastructure/floci/verify.sh' } }),
  {
    id: '29',
    slug: '29-hf-model-artifact',
    title: 'Hugging Face-style model artifact',
    level: 'Advanced',
    ports: [3029],
    setup: { command: './setup.sh', cwd: scenarioPath('29-hf-model-artifact') },
    services: [
      {
        id: 'mock-hub',
        label: 'Fake hub + collector :3029',
        command: 'python3',
        args: ['infrastructure/mock_hub.py'],
        cwd: '.',
        port: 3029,
      },
    ],
    steps: [
      {
        id: 'run',
        label: 'Load model with trust_remote_code',
        command: 'python3',
        args: ['load_model.py', '--trust-remote-code'],
        cwd: 'victim-app',
      },
    ],
    captures: [capture(3029)],
    floci: { seed: 'infrastructure/floci/seed.sh', verify: 'infrastructure/floci/verify.sh' },
    docs: { readme: 'scenarios/29-hf-model-artifact/README.md', detect: 'scenarios/29-hf-model-artifact/DETECT.md' },
    learn: LEARN['29'],
  },
];

export function getScenario(id: string): ScenarioDefinition | undefined {
  return SCENARIOS.find((s) => s.id === id || s.slug === id);
}
