import { createZip, inspectZip } from './zip.js';

const isSecret = (path) => /(^|\/)(\.env(\.(?!example$).*)?|id_rsa|.*\.(pem|key)|credentials\.json)$/i.test(path);
export function createProjectArchive(project, { clean = false } = {}) {
  const files = project.files instanceof Map ? [...project.files] : Object.entries(project.files || {});
  const excluded = files.map(([path]) => path).filter((path) => /(^|\/)(node_modules|\.git|dist|build|\.cache|coverage)(\/|$)/.test(path) || isSecret(path));
  const blob = createZip(new Map(files), { clean });
  return { blob, filename: `${String(project.name || 'studio-project').replace(/[^a-z0-9-_]+/gi, '-').replace(/^-|-$/g, '') || 'studio-project'}.zip`, excluded, fileCount: files.length - excluded.length };
}
export async function importProjectArchive(file) {
  if (!file || !/\.zip$/i.test(file.name || '')) throw new Error('Choose a ZIP archive.');
  const result = await inspectZip(await file.arrayBuffer());
  if (!result.files.size) throw new Error('ZIP archive contains no usable project source files.');
  return result;
}
export function makeProjectFromArchive(report, name) {
  const files = Object.fromEntries(report.files);
  const activeFile = Object.hasOwn(files, 'index.html') ? 'index.html' : Object.keys(files)[0];
  return { id: `project-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, name: String(name || 'Imported project'), description: `Imported from ZIP · ${report.framework}`, framework: report.framework, origin: 'zip', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), files, activeFile, branch: null, github: null, history: [] };
}
