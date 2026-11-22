import test from 'node:test';
import assert from 'node:assert/strict';
import { createZip, inspectZip } from '../src/zip.js';

test('source ZIP roundtrips nested source and retains env example while excluding secrets and build folders', async () => {
  const zip = createZip({ 'src/main.js': 'console.log("hi")', 'assets/logo.svg': '<svg/>', '.env': 'SECRET=do-not-export', '.env.example': 'API_URL=', 'node_modules/pkg/index.js': 'x', 'README.md': 'hello' });
  const result = await inspectZip(await zip.arrayBuffer());
  assert.equal(result.files.get('src/main.js'), 'console.log("hi")');
  assert.equal(result.files.get('assets/logo.svg'), '<svg/>');
  assert.equal(result.files.get('.env'), undefined);
  assert.equal(result.files.get('.env.example'), 'API_URL=');
  assert.equal(result.files.get('node_modules/pkg/index.js'), undefined);
});

test('ZIP import strips one enclosing project folder and inspects manifests', async () => {
  const zip = createZip({ 'demo/package.json': JSON.stringify({ scripts: { dev: 'vite' }, dependencies: { react: '18.0.0' } }), 'demo/src/App.jsx': 'export default function App() {}' });
  const result = await inspectZip(await zip.arrayBuffer());
  assert.equal(result.projectRoot, 'demo/');
  assert.equal(result.files.has('package.json'), true);
  assert.equal(result.framework, 'React');
  assert.equal(result.scripts.dev, 'vite');
  assert.equal(result.packageManager, 'Not identified');
});

test('ZIP rejects path traversal and duplicate output paths', async () => {
  assert.throws(() => createZip({ '../escape.txt': 'bad' }), /Unsafe project path/);
  const zip = createZip({ 'safe.txt': 'ok' });
  const result = await inspectZip(await zip.arrayBuffer());
  assert.equal(result.files.get('safe.txt'), 'ok');
});
