import test from 'node:test';
import assert from 'node:assert/strict';
import { createZip, inspectZip } from '../src/zip.js';

test('source ZIP roundtrip retains arbitrary binary assets', async () => {
  const bytes = new Uint8Array([0, 255, 128, 65]);
  const result = await inspectZip(await createZip({ 'assets/logo.bin': bytes }).arrayBuffer());
  assert.deepEqual([...result.files.get('assets/logo.bin')], [...bytes]);
});

test('source ZIP filters credentials and build dependencies, preserving env example', async () => {
  const result = await inspectZip(await createZip({ '.env': 'secret', '.env.example': 'PUBLIC_URL=', 'node_modules/a.js': 'x', 'src/a.js': 'ok' }).arrayBuffer());
  assert.equal(result.files.has('.env'), false);
  assert.equal(result.files.get('.env.example'), 'PUBLIC_URL=');
  assert.equal(result.files.has('node_modules/a.js'), false);
  assert.equal(result.files.get('src/a.js'), 'ok');
});

test('ZIP detects root manifest and rejects traversal/corruption', async () => {
  const result = await inspectZip(await createZip({ 'demo/package.json': JSON.stringify({ dependencies: { react: '18' }, scripts: { dev: 'vite' } }), 'demo/src/App.jsx': 'export default 1' }).arrayBuffer());
  assert.equal(result.projectRoot, 'demo/');
  assert.equal(result.framework, 'React');
  assert.throws(() => createZip({ '../bad': 'x' }), /Unsafe project path/);
  await assert.rejects(() => inspectZip(new Uint8Array([0])), /Invalid ZIP/);
});
