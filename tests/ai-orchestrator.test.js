import test from 'node:test';
import assert from 'node:assert/strict';
import { applyApprovedPatch, CostPolicyError, routeTask, validateModelRoute, WorkCoordinator } from '../src/ai-orchestrator.js';

test('smart router selects a single role for simple explanation and reviewer for complex work', () => {
  assert.deepEqual(routeTask('Explain this function'), ['chat']);
  assert.deepEqual(routeTask('Implement a feature across multiple files'), ['planner', 'primaryCoder', 'reviewer']);
});

test('unknown cost model route is blocked under zero cost policy', () => {
  assert.throws(() => validateModelRoute({ provider: 'candidate', model: 'model-x', costStatus: 'unknown' }), CostPolicyError);
});

test('work requires independent review after one writer and does not apply until approval', async () => {
  const calls = []; let checkpoint;
  const coordinator = new WorkCoordinator({
    roles: { planner: { writes: false }, primaryCoder: { writes: true }, reviewer: { writes: false }, specialist: { writes: false } },
    invoke: async ({ role }) => { calls.push(role); return role === 'primaryCoder' ? { files: [{ path: 'src/app.js', content: 'new' }] } : { ok: true }; },
    getProjectSnapshot: async () => ({ files: { 'src/app.js': 'old' }, branch: 'local' }),
    saveCheckpoint: async (value) => { checkpoint = value; }
  });
  const routes = Object.fromEntries(['planner', 'primaryCoder', 'reviewer'].map((role) => [role, { provider: 'local-test', model: role, costStatus: 'verified-free' }]));
  const result = await coordinator.run({ task: 'Implement a feature across multiple files', providerRoutes: routes });
  assert.deepEqual(calls, ['planner', 'primaryCoder', 'reviewer']);
  assert.equal(checkpoint.status, 'awaiting-review');
  assert.equal(result.status, 'awaiting-user-approval');
  assert.throws(() => applyApprovedPatch({}, { files: [{ path: '../escape', content: 'x' }] }), /Unsafe patch path/);
  assert.equal(applyApprovedPatch({ 'src/app.js': 'old' }, result.proposal)['src/app.js'], 'new');
});
