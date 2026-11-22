import test from 'node:test';
import assert from 'node:assert/strict';
import { mergeText, preserveLocalOnRemoteFailure } from '../src/remote-sync.js';

test('three-way merge reports safe clean cases and explicit conflict', () => {
  assert.deepEqual(mergeText('a', 'b', 'a'), { status: 'clean', content: 'b' });
  assert.equal(mergeText('a', 'b', 'c').status, 'conflict');
});

test('remote write failure preserves local source', async () => {
  const files = { 'src/app.js': 'local' };
  const result = await preserveLocalOnRemoteFailure({ localFiles: files, remoteOperation: async () => { throw new Error('permission denied'); } });
  assert.equal(result.ok, false);
  assert.equal(result.files['src/app.js'], 'local');
});
