export const DEFAULT_ROLES = Object.freeze({
  planner: { role: 'planner', writes: false },
  primaryCoder: { role: 'primaryCoder', writes: true },
  reviewer: { role: 'reviewer', writes: false },
  specialist: { role: 'specialist', writes: false }
});

export class CostPolicyError extends Error { constructor(message) { super(message); this.name = 'CostPolicyError'; } }

export function validateModelRoute(route, { zeroCostOnly = true } = {}) {
  if (!route || !route.provider || !route.model) throw new Error('Select a provider and model.');
  if (zeroCostOnly && route.costStatus !== 'verified-free') throw new CostPolicyError('Blocked: route is not independently verified as zero-cost.');
  if (route.enabled === false) throw new Error('This model route is disabled.');
  return true;
}

export function routeTask(task) {
  const text = String(task || '').toLowerCase();
  if (/explain|what does|describe|why does/.test(text)) return ['chat'];
  if (/security|credential|secret|oauth|permission/.test(text)) return ['planner', 'specialist', 'primaryCoder', 'reviewer'];
  if (/complex|multiple files|feature|redesign|build a|implement/.test(text)) return ['planner', 'primaryCoder', 'reviewer'];
  if (/bug|crash|error|broken/.test(text)) return ['specialist', 'primaryCoder', 'reviewer'];
  return ['primaryCoder'];
}

export class WorkCoordinator {
  constructor({ roles, invoke, getProjectSnapshot, saveCheckpoint }) {
    this.roles = roles; this.invoke = invoke; this.getProjectSnapshot = getProjectSnapshot; this.saveCheckpoint = saveCheckpoint; this.cancelled = false;
  }
  cancel() { this.cancelled = true; }
  async run({ task, providerRoutes, zeroCostOnly = true }) {
    this.cancelled = false;
    const roleSequence = routeTask(task);
    const snapshot = await this.getProjectSnapshot();
    const log = [];
    let proposal = null;
    for (const roleName of roleSequence) {
      if (this.cancelled) throw new Error('Work cancelled.');
      if (roleName === 'chat') return { mode: 'chat', answer: await this.invoke({ role: 'chat', task, snapshot }) };
      const role = this.roles[roleName]; const route = providerRoutes[roleName] || providerRoutes.default;
      validateModelRoute(route, { zeroCostOnly });
      if (role.writes && proposal) throw new Error('Only one primary writer may propose changes for a task.');
      const result = await this.invoke({ role: roleName, task, snapshot, proposal, route });
      log.push({ role: roleName, result });
      if (roleName === 'primaryCoder') {
        proposal = result;
        if (!result || !Array.isArray(result.files) || result.files.some((f) => !f.path || typeof f.content !== 'string')) throw new Error('Coder returned an invalid file patch proposal.');
        await this.saveCheckpoint({ task, snapshot, proposal, status: 'awaiting-review' });
      }
    }
    return { mode: 'work', task, snapshot, proposal, log, status: 'awaiting-user-approval' };
  }
}

export function applyApprovedPatch(files, patch) {
  const next = { ...files };
  for (const item of patch.files || []) {
    if (item.path.startsWith('/') || item.path.split('/').includes('..')) throw new Error(`Unsafe patch path: ${item.path}`);
    next[item.path] = item.content;
  }
  return next;
}
