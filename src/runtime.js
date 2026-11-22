export function detectProject(files) {
  const entries = files instanceof Map ? [...files] : Object.entries(files || {});
  const map = new Map(entries);
  const paths = [...map.keys()];
  const manifests = paths.filter((path) => path.split('/').at(-1) === 'package.json');
  const rootManifest = manifests.includes('package.json') ? 'package.json' : manifests[0];
  let manifest = null;
  if (rootManifest) { try { manifest = JSON.parse(map.get(rootManifest)); } catch { /* expose invalid manifest */ } }
  const config = paths.find((path) => /(^|\/)(vite\.config\.|next\.config\.|angular\.json|astro\.config\.|capacitor\.config\.)/.test(path));
  let framework = 'Unknown';
  if (config?.includes('vite')) framework = manifest?.dependencies?.react || manifest?.devDependencies?.react ? 'React + Vite' : 'Vite';
  else if (config?.includes('next')) framework = 'Next.js';
  else if (config?.includes('capacitor')) framework = 'Capacitor project';
  else if (manifest?.dependencies?.react || manifest?.devDependencies?.react) framework = 'React';
  else if (manifest) framework = 'Node.js';
  else if (paths.some((path) => /(^|\/)index\.html$/.test(path))) framework = 'Static HTML/CSS/JavaScript';
  const packageManager = paths.some((path) => /pnpm-lock\.yaml$/.test(path)) ? 'pnpm' : paths.some((path) => /yarn\.lock$/.test(path)) ? 'yarn' : paths.some((path) => /package-lock\.json$/.test(path)) ? 'npm' : 'Not identified';
  return {
    framework,
    packageManager,
    projectRoot: rootManifest?.slice(0, -'package.json'.length) || '/',
    scripts: manifest?.scripts || {},
    dependencyCount: Object.keys(manifest?.dependencies || {}).length + Object.keys(manifest?.devDependencies || {}).length,
    requiredDependencies: Object.keys(manifest?.dependencies || {}),
    buildScript: manifest?.scripts?.build || null,
    previewSupported: framework === 'Static HTML/CSS/JavaScript',
    reason: framework === 'Static HTML/CSS/JavaScript' ? 'Sandboxed static preview supported' : 'Import/source editing available; this runtime is not verified in the current preview adapter',
    errors: rootManifest && !manifest ? [`${rootManifest} is not valid JSON`] : []
  };
}

export function createStaticPreviewDocument(files) {
  const entries = files instanceof Map ? Object.fromEntries(files) : files || {};
  const html = entries['index.html'];
  if (typeof html !== 'string') throw new Error('Static preview requires an index.html at the project root.');
  const css = typeof entries['style.css'] === 'string' ? `<style>${entries['style.css'].replace(/<\/style/gi, '<\\/style')}</style>` : '';
  const js = typeof entries['app.js'] === 'string' ? `<script>${entries['app.js'].replace(/<\/script/gi, '<\\/script')}<\/script>` : '';
  return html.includes('</head>') ? html.replace('</head>', `${css}</head>`).replace('</body>', `${js}</body>`) : `${css}${html}${js}`;
}

export class StaticIframeRuntime {
  constructor(frame) { this.frame = frame; this.revision = 0; this.status = 'stopped'; }
  start(files) { this.status = 'running'; return this.update(files); }
  update(files) { const revision = ++this.revision; const documentText = createStaticPreviewDocument(files); this.frame.srcdoc = documentText; return { revision, status: this.status, runtime: 'static-iframe', message: 'Updated from saved project source.' }; }
  stop() { this.status = 'stopped'; this.frame.srcdoc = ''; }
  restart(files) { this.stop(); return this.start(files); }
}
