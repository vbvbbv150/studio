import test from 'node:test';
import assert from 'node:assert/strict';
import { createZip, inspectZip } from '../src/zip.js';

test('roundtrip preserves nested project files and strips secrets/build artifacts', async () => {
  const zip = createZip({ 'src/main.js': 'console.log("hi")', 'assets/logo.svg': '<svg/>', '.env': 'SECRET=do-not-export', '.env.example': 'API_URL=', 'node_modules/pkg/index.js': 'x', 'README.md': 'hello' });
  const result = await inspectZip(await zip.arrayBuffer());
  assert.equal(result.files.get('src/main.js'), 'console.log("hi")');
  assert.equal(result.files.get('assets/logo.svg'), '<svg/>');
  assert.equal(result.files.has('.env'), false);
  assert.equal(result.files.get('.env.example'), 'API_URL=');
  assert.equal(result.files.has('node_modules/pkg/index.js'), false);
});

test('import detects one root directory, React manifest, and scripts', async () => {
  const zip = createZip({ 'demo/package.json': JSON.stringify({ scripts: { dev: 'vite' }, dependencies: { react: '18.0.0' } }), 'demo/src/App.jsx': 'export default function App() {}' });
  const result = await inspectZip(await zip.arrayBuffer());
  assert.equal(result.projectRoot, 'demo/');
  assert.equal(result.files.has('package.json'), true);
  assert.equal(result.framework, 'React');
  assert.equal(result.scripts.dev, 'vite');
});

test('export rejects traversal paths and import rejects malformed bytes', async () => {
  assert.throws(() => createZip({ '../escape.txt': 'bad' }), /Unsafe project path/);
  await assert.rejects(() => inspectZip(new Uint8Array([1, 2, 3])), /Invalid ZIP/);
});
