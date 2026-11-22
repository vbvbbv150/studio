import assert from 'node:assert/strict';

const unsafePath = (name) => {
  if (typeof name !== 'string' || !name || name.includes('\\') || name.startsWith('/') || /^[A-Za-z]:/.test(name)) return true;
  return name.split('/').some((part) => part === '..' || part === '.');
};

const SECRET_FILE = /(^|\/)(\.env(\..*)?|id_rsa|.*\.pem|.*\.key|credentials\.json)$/i;
const TEMP_SEGMENTS = new Set(['node_modules', '.git', 'dist', 'build', '.cache', '.vite', 'coverage']);

function excluded(path, { clean = false } = {}) {
  const parts = path.split('/');
  if (parts.some((part) => TEMP_SEGMENTS.has(part))) return true;
  if (SECRET_FILE.test(path) && !/(^|\/)\.env\.example$/i.test(path)) return true;
  if (clean && /(^|\/)(\.DS_Store|npm-debug\.log|yarn-debug\.log|\.studio-tmp)$/i.test(path)) return true;
  return false;
}

function normalizeFiles(files, options) {
  const entries = files instanceof Map ? [...files] : Object.entries(files || {});
  const result = [];
  for (const [path, value] of entries) {
    if (unsafePath(path)) throw new Error(`Unsafe project path: ${path}`);
    if (!excluded(path, options)) result.push([path, String(value)]);
  }
  return result.sort(([a], [b]) => a.localeCompare(b));
}

function crc32(bytes) {
  let crc = -1;
  for (const byte of bytes) {
    crc ^= byte;
    for (let k = 0; k < 8; k++) crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
  }
  return (crc ^ -1) >>> 0;
}

function u16(view, offset, value) { view.setUint16(offset, value, true); }
function u32(view, offset, value) { view.setUint32(offset, value >>> 0, true); }
function get16(view, offset) { return view.getUint16(offset, true); }
function get32(view, offset) { return view.getUint32(offset, true); }

export function createZip(files, options = {}) {
  const encoder = new TextEncoder();
  const entries = normalizeFiles(files, options);
  const local = [];
  const central = [];
  let cursor = 0;
  for (const [path, content] of entries) {
    const name = encoder.encode(path);
    const data = encoder.encode(content);
    if (data.length > 0xffffffff) throw new Error(`File too large for ZIP: ${path}`);
    const crc = crc32(data);
    const header = new Uint8Array(30 + name.length);
    const view = new DataView(header.buffer);
    u32(view, 0, 0x04034b50); u16(view, 4, 20); u16(view, 6, 0x0800);
    u16(view, 8, 0); u32(view, 14, crc); u32(view, 18, data.length); u32(view, 22, data.length); u16(view, 26, name.length);
    header.set(name, 30); local.push(header, data);
    const c = new Uint8Array(46 + name.length); const cv = new DataView(c.buffer);
    u32(cv, 0, 0x02014b50); u16(cv, 4, 0x0314); u16(cv, 6, 20); u16(cv, 8, 0x0800);
    u16(cv, 10, 0); u32(cv, 16, crc); u32(cv, 20, data.length); u32(cv, 24, data.length);
    u16(cv, 28, name.length); u32(cv, 38, 0); u32(cv, 42, cursor); c.set(name, 46); central.push(c);
    cursor += header.length + data.length;
  }
  const centralSize = central.reduce((n, item) => n + item.length, 0);
  const end = new Uint8Array(22); const ev = new DataView(end.buffer);
  u32(ev, 0, 0x06054b50); u16(ev, 8, entries.length); u16(ev, 10, entries.length);
  u32(ev, 12, centralSize); u32(ev, 16, cursor);
  return new Blob([...local, ...central, end], { type: 'application/zip' });
}

async function inflateRaw(bytes) {
  if (!globalThis.DecompressionStream) throw new Error('This device browser cannot extract compressed ZIP entries. Use stored ZIP entries or update the browser.');
  const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

export async function inspectZip(buffer, { maxFiles = 10000, maxUncompressedBytes = 250 * 1024 * 1024, maxRatio = 200 } = {}) {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const decoder = new TextDecoder('utf-8', { fatal: true });
  let eocd = -1;
  for (let i = bytes.length - 22; i >= Math.max(0, bytes.length - 65557); i--) if (get32(view, i) === 0x06054b50) { eocd = i; break; }
  if (eocd < 0) throw new Error('Invalid ZIP: end-of-directory record not found.');
  const count = get16(view, eocd + 10); const centralSize = get32(view, eocd + 12); let offset = get32(view, eocd + 16);
  if (count > maxFiles || offset + centralSize > bytes.length) throw new Error('ZIP exceeds file-count limits or has a corrupt directory.');
  const files = new Map(); let total = 0; let rootCandidates = new Set(); const duplicates = [];
  for (let i = 0; i < count; i++) {
    if (get32(view, offset) !== 0x02014b50) throw new Error('Invalid ZIP directory entry.');
    const method = get16(view, offset + 10); const compressed = get32(view, offset + 20); const size = get32(view, offset + 24);
    const nameLength = get16(view, offset + 28); const extraLength = get16(view, offset + 30); const commentLength = get16(view, offset + 32);
    const localOffset = get32(view, offset + 42); const name = decoder.decode(bytes.subarray(offset + 46, offset + 46 + nameLength));
    offset += 46 + nameLength + extraLength + commentLength;
    if (name.endsWith('/')) continue;
    if (unsafePath(name)) throw new Error(`Unsafe ZIP entry rejected: ${name}`);
    if (files.has(name)) { duplicates.push(name); throw new Error(`Duplicate ZIP entry rejected: ${name}`); }
    if (size > maxUncompressedBytes || (compressed === 0 ? size > 0 : size / compressed > maxRatio)) throw new Error(`ZIP entry exceeds safe expansion limits: ${name}`);
    total += size; if (total > maxUncompressedBytes) throw new Error('ZIP exceeds the maximum uncompressed project size.');
    if (get32(view, localOffset) !== 0x04034b50) throw new Error(`Corrupt ZIP local header: ${name}`);
    const nameLen = get16(view, localOffset + 26); const extraLen = get16(view, localOffset + 28); const start = localOffset + 30 + nameLen + extraLen;
    const packed = bytes.subarray(start, start + compressed);
    const content = method === 0 ? packed : method === 8 ? await inflateRaw(packed) : null;
    if (!content) throw new Error(`Unsupported ZIP compression method ${method} for ${name}.`);
    if (content.length !== size || crc32(content) !== get32(view, offset - (46 + nameLength + extraLength + commentLength) + 16)) throw new Error(`ZIP integrity check failed: ${name}`);
    const text = new TextDecoder().decode(content); files.set(name, text);
  }
  const names = [...files.keys()];
  const rootFiles = names.filter((name) => !name.includes('/'));
  const detectedRoot = rootFiles.length ? '' : (names.length && new Set(names.map((name) => name.split('/')[0])).size === 1 ? `${names[0].split('/')[0]}/` : '');
  const rel = (name) => detectedRoot && name.startsWith(detectedRoot) ? name.slice(detectedRoot.length) : name;
  const projectFiles = new Map([...files].filter(([name]) => !detectedRoot || name.startsWith(detectedRoot)).map(([name, value]) => [rel(name), value]));
  const paths = [...projectFiles.keys()];
  const manifestPath = paths.find((p) => p === 'package.json' || p.endsWith('/package.json'));
  let manifest = null; if (manifestPath) { try { manifest = JSON.parse(projectFiles.get(manifestPath)); } catch { /* report malformed */ } }
  const frameworkConfig = paths.find((p) => /(^|\/)(vite\.config\.|next\.config\.|angular\.json|capacitor\.config\.|astro\.config\.)/.test(p));
  const framework = frameworkConfig?.includes('vite') ? 'Vite (React/TypeScript requires manifest review)' : frameworkConfig?.includes('next') ? 'Next.js' : frameworkConfig?.includes('capacitor') ? 'Capacitor' : manifest?.dependencies?.react ? 'React' : manifest ? 'Node.js project' : paths.some((p) => /\.html?$/.test(p)) ? 'Static HTML/CSS/JavaScript' : 'Unknown';
  const packageManager = paths.some((p) => /pnpm-lock\.yaml$/.test(p)) ? 'pnpm' : paths.some((p) => /yarn\.lock$/.test(p)) ? 'yarn' : paths.some((p) => /package-lock\.json$/.test(p)) ? 'npm' : manifest ? 'Not identified' : 'Not applicable';
  const scripts = manifest?.scripts || {};
  return { files: projectFiles, allFiles: files, projectRoot: detectedRoot || '/', framework, packageManager, manifestPath: manifestPath || null, scripts, dependencies: Object.keys(manifest?.dependencies || {}), devDependencies: Object.keys(manifest?.devDependencies || {}), previewCompatibility: framework === 'Static HTML/CSS/JavaScript' ? 'Supported in sandboxed static preview' : 'Imported; runtime support must be checked before execution', androidCompatibility: paths.some((p) => p.startsWith('android/')) || paths.some((p) => p.startsWith('capacitor.config')) ? 'Android/Capacitor source detected; build still requires validation' : 'Not established', warnings: manifestPath && !manifest ? ['Malformed package.json'] : [], duplicates };
}

export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = filename; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1500);
}
