import { createZip, inspectZip, downloadBlob } from './zip.js';

export const studioZip = { createZip, inspectZip, downloadBlob };

export function classifyProjectFiles(files) {
  const paths = files instanceof Map ? [...files.keys()] : Object.keys(files || {});
  const manifestPath = paths.find((path) => path === 'package.json');
  let manifest;
  if (manifestPath) { try { manifest = JSON.parse(files instanceof Map ? files.get(manifestPath) : files[manifestPath]); } catch { manifest = null; } }
  const framework = manifest?.dependencies?.react ? 'React' : paths.some((path) => path.startsWith('index.html')) ? 'Static HTML/CSS/JavaScript' : manifest ? 'Node.js project' : 'Unknown';
  return { framework, fileCount: paths.length, hasPackageManifest: Boolean(manifestPath), scripts: manifest?.scripts || {}, dependencies: Object.keys(manifest?.dependencies || {}) };
}

export async function createProjectArchive(project, { clean = false } = {}) {
  const files = project.files || {};
  const blob = createZip(files, { clean });
  const excluded = Object.keys(files).filter((path) => !Object.hasOwn(Object.fromEntries(awaitableEntries(files)), path));
  return { blob, filename: `${safeName(project.name || 'studio-project')}.zip`, excluded, fileCount: Object.keys(files).length - excluded.length };
}

function* awaitableEntries(files) { yield* Object.entries(files); }
function safeName(value) { return String(value).replace(/[^a-z0-9-_]+/gi, '-').replace(/^-|-$/g, '') || 'studio-project'; }

export async function importProjectArchive(file) {
  if (!file || !/\.zip$/i.test(file.name || '')) throw new Error('Choose a ZIP archive.');
  const report = await inspectZip(await file.arrayBuffer());
  if (report.files.size === 0) throw new Error('The ZIP archive contains no usable project files.');
  return report;
}

export function makeProjectFromArchive(report, name) {
  return { id: `project-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`, name: safeName(name || 'Imported project'), description: `Imported from ZIP · ${report.framework}`, framework: report.framework, origin: 'zip', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), files: Object.fromEntries(report.files), activeFile: report.files.has('index.html') ? 'index.html' : report.files.keys().next().value, branch: null, github: null, history: [] };
}
