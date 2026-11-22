import test from 'node:test';
import assert from 'node:assert/strict';
import { detectProject, createStaticPreviewDocument } from '../src/runtime.js';

test('runtime identifies static and React projects without overstating support', () => {
  assert.equal(detectProject({ 'index.html': '<html></html>' }).previewSupported, true);
  const react = detectProject({ 'package.json': JSON.stringify({ dependencies: { react: '18' }, scripts: { dev: 'vite' } }), 'vite.config.js': 'export default {}' });
  assert.equal(react.framework, 'React + Vite');
  assert.equal(react.previewSupported, false);
  assert.equal(react.scripts.dev, 'vite');
});

test('static runtime assembles actual source files and rejects projects without index.html', () => {
  const page = createStaticPreviewDocument({ 'index.html': '<html><head></head><body><h1>Hello</h1></body></html>', 'style.css': 'h1{color:red}', 'app.js': 'console.log("ready")' });
  assert.match(page, /h1\{color:red\}/);
  assert.match(page, /console\.log\("ready"\)/);
  assert.throws(() => createStaticPreviewDocument({ 'app.js': '' }), /index.html/);
});
