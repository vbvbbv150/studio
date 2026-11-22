const badPath = (path) => typeof path !== 'string' || !path || path.startsWith('/') || path.includes('\\') || /^[A-Za-z]:/.test(path) || path.split('/').some((part) => part === '..' || part === '.');
const skipPath = (path) => /(^|\/)(node_modules|\.git|dist|build|\.cache|coverage)(\/|$)/.test(path) || /(^|\/)(\.env(\.(?!example$).*)?|id_rsa|.*\.(pem|key)|credentials\.json)$/i.test(path);
const enc = new TextEncoder();
const dec = new TextDecoder();
const u16 = (view, at, n) => view.setUint16(at, n, true);
const u32 = (view, at, n) => view.setUint32(at, n >>> 0, true);
const r16 = (view, at) => view.getUint16(at, true);
const r32 = (view, at) => view.getUint32(at, true);
function crc32(bytes) { let crc = -1; for (const byte of bytes) { crc ^= byte; for (let i = 0; i < 8; i++) crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1)); } return (crc ^ -1) >>> 0; }

export function createZip(files, { clean = false } = {}) {
  const entries = files instanceof Map ? [...files] : Object.entries(files || {});
  const local = [], central = []; let pos = 0;
  for (const [path, value] of entries.sort(([a], [b]) => a.localeCompare(b))) {
    if (badPath(path)) throw new Error(`Unsafe project path: ${path}`);
    if (skipPath(path) || clean && /(^|\/)(\.DS_Store|npm-debug\.log|yarn-debug\.log)$/i.test(path)) continue;
    const name = enc.encode(path); const data = value instanceof Uint8Array ? value : enc.encode(String(value));
    if (name.length > 65535 || data.length > 0xffffffff) throw new Error(`ZIP entry is too large: ${path}`);
    const crc = crc32(data); const h = new Uint8Array(30 + name.length); const v = new DataView(h.buffer);
    u32(v, 0, 0x04034b50); u16(v, 4, 20); u16(v, 6, 0x0800); u16(v, 8, 0); u32(v, 14, crc); u32(v, 18, data.length); u32(v, 22, data.length); u16(v, 26, name.length); h.set(name, 30);
    local.push(h, data);
    const c = new Uint8Array(46 + name.length); const cv = new DataView(c.buffer);
    u32(cv, 0, 0x02014b50); u16(cv, 4, 0x0314); u16(cv, 6, 20); u16(cv, 8, 0x0800); u16(cv, 10, 0); u32(cv, 16, crc); u32(cv, 20, data.length); u32(cv, 24, data.length); u16(cv, 28, name.length); u32(cv, 42, pos); c.set(name, 46); central.push(c); pos += h.length + data.length;
  }
  if (central.length > 65535) throw new Error('ZIP contains too many files.');
  const size = central.reduce((n, part) => n + part.length, 0); const end = new Uint8Array(22); const ev = new DataView(end.buffer);
  u32(ev, 0, 0x06054b50); u16(ev, 8, central.length); u16(ev, 10, central.length); u32(ev, 12, size); u32(ev, 16, pos);
  return new Blob([...local, ...central, end], { type: 'application/zip' });
}

async function inflate(bytes) {
  if (!globalThis.DecompressionStream) throw new Error('This browser cannot extract deflated ZIP entries.');
  return new Uint8Array(await new Response(new Blob([bytes]).stream().pipeThrough(new DecompressionStream('deflate-raw'))).arrayBuffer());
}
export async function inspectZip(input, { maxFiles = 10000, maxUncompressedBytes = 250 * 1024 * 1024, maxRatio = 200 } = {}) {
  const bytes = input instanceof Uint8Array ? input : new Uint8Array(input); const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength); let end = -1;
  for (let i = bytes.length - 22; i >= Math.max(0, bytes.length - 65557); i--) if (r32(view, i) === 0x06054b50) { end = i; break; }
  if (end < 0) throw new Error('Invalid ZIP: end-of-directory record not found.');
  const count = r16(view, end + 10); const directorySize = r32(view, end + 12); let offset = r32(view, end + 16);
  if (count > maxFiles || offset + directorySize > bytes.length) throw new Error('ZIP exceeds file-count limits or has a corrupt directory.');
  const raw = new Map(); let total = 0;
  for (let i = 0; i < count; i++) {
    if (r32(view, offset) !== 0x02014b50) throw new Error('Invalid ZIP directory entry.');
    const start = offset; const method = r16(view, start + 10); const crc = r32(view, start + 16); const packedSize = r32(view, start + 20); const size = r32(view, start + 24);
    const nl = r16(view, start + 28); const el = r16(view, start + 30); const cl = r16(view, start + 32); const localAt = r32(view, start + 42);
    const path = dec.decode(bytes.subarray(start + 46, start + 46 + nl)); offset += 46 + nl + el + cl;
    if (path.endsWith('/')) continue;
    if (badPath(path)) throw new Error(`Unsafe ZIP entry rejected: ${path}`);
    if (raw.has(path)) throw new Error(`Duplicate ZIP entry rejected: ${path}`);
    if (size > maxUncompressedBytes || (packedSize === 0 ? size > 0 : size / packedSize > maxRatio)) throw new Error(`ZIP entry exceeds safe expansion limits: ${path}`);
    total += size; if (total > maxUncompressedBytes) throw new Error('ZIP exceeds maximum uncompressed size.');
    if (r32(view, localAt) !== 0x04034b50) throw new Error(`Corrupt ZIP entry: ${path}`);
    const dataAt = localAt + 30 + r16(view, localAt + 26) + r16(view, localAt + 28); const data = bytes.subarray(dataAt, dataAt + packedSize);
    const result = method === 0 ? data.slice() : method === 8 ? await inflate(data) : null;
    if (!result || result.length !== size || crc32(result) !== crc) throw new Error(`ZIP integrity or compression check failed: ${path}`);
    raw.set(path, result);
  }
  const names = [...raw.keys()]; const roots = new Set(names.map((path) => path.split('/')[0]));
  const root = names.every((path) => path.includes('/')) && roots.size === 1 ? `${names[0].split('/')[0]}/` : '';
  const files = new Map([...raw].filter(([path]) => !root || path.startsWith(root)).map(([path, data]) => [root ? path.slice(root.length) : path, dec.decode(data)]));
  const paths = [...files.keys()]; const manifestPath = paths.find((path) => path === 'package.json' || path.endsWith('/package.json')); let manifest;
  if (manifestPath) { try { manifest = JSON.parse(files.get(manifestPath)); } catch { manifest = null; } }
  const config = paths.find((path) => /(^|\/)(vite\.config\.|next\.config\.|capacitor\.config\.|astro\.config\.)/.test(path));
  const framework = config?.includes('vite') ? (manifest?.dependencies?.react ? 'React + Vite' : 'Vite') : config?.includes('next') ? 'Next.js' : config?.includes('capacitor') ? 'Capacitor' : manifest?.dependencies?.react ? 'React' : manifest ? 'Node.js project' : paths.some((path) => /(^|\/)index\.html$/.test(path)) ? 'Static HTML/CSS/JavaScript' : 'Unknown';
  const packageManager = paths.some((path) => path.endsWith('pnpm-lock.yaml')) ? 'pnpm' : paths.some((path) => path.endsWith('yarn.lock')) ? 'yarn' : paths.some((path) => path.endsWith('package-lock.json')) ? 'npm' : manifest ? 'Not identified' : 'Not applicable';
  return { files, projectRoot: root || '/', framework, packageManager, manifestPath: manifestPath || null, scripts: manifest?.scripts || {}, dependencies: Object.keys(manifest?.dependencies || {}), devDependencies: Object.keys(manifest?.devDependencies || {}), previewCompatibility: framework === 'Static HTML/CSS/JavaScript' ? 'Supported in sandboxed static preview' : 'Source import only; runtime support not verified', warnings: manifestPath && !manifest ? ['Malformed package.json'] : [] };
}
export function downloadBlob(blob, filename) { const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = filename; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1500); }
