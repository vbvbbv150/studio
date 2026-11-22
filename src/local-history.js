export function computeChanges(base, working) {
  const paths = new Set([...Object.keys(base || {}), ...Object.keys(working || {})]);
  return [...paths].sort().flatMap((path) => {
    const before = Object.hasOwn(base || {}, path) ? base[path] : null;
    const after = Object.hasOwn(working || {}, path) ? working[path] : null;
    if (before === after) return [];
    return [{ path, kind: before === null ? 'added' : after === null ? 'deleted' : 'modified', before, after }];
  });
}

export class StudioHistory {
  constructor({ limit = 40 } = {}) { this.limit = limit; this.snapshots = []; }
  checkpoint(label, files, meta = {}) {
    const snapshot = { id: `snapshot-${Date.now()}-${this.snapshots.length}`, label, createdAt: new Date().toISOString(), files: structuredClone(files), meta: structuredClone(meta) };
    this.snapshots.push(snapshot);
    if (this.snapshots.length > this.limit) this.snapshots.shift();
    return snapshot;
  }
  list() { return this.snapshots.map(({ id, label, createdAt, meta }) => ({ id, label, createdAt, meta })); }
  restore(id) { const snapshot = this.snapshots.find((entry) => entry.id === id); if (!snapshot) throw new Error('Studio snapshot was not found.'); return structuredClone(snapshot.files); }
}

export function createStudioDiff(changes) {
  return changes.map(({ path, kind, before, after }) => ({ path, kind, before: before ?? '', after: after ?? '' }));
}
