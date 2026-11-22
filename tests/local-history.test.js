import test from 'node:test';
import assert from 'node:assert/strict';
import { computeChanges, StudioHistory } from '../src/local-history.js';

test('change tracker distinguishes local add, modify, and delete', () => {
  assert.deepEqual(computeChanges({ a: '1', b: '2' }, { a: '3', c: '4' }).map(({ path, kind }) => [path, kind]), [['a', 'modified'], ['b', 'deleted'], ['c', 'added']]);
});

test('snapshot restore returns project file copy and preserves history', () => {
  const history = new StudioHistory(); const files = { 'index.html': '<h1>one</h1>' }; const saved = history.checkpoint('Before edit', files);
  files['index.html'] = '<h1>two</h1>';
  assert.deepEqual(history.restore(saved.id), { 'index.html': '<h1>one</h1>' });
});
