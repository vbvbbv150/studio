function toBytes(value) {
  if (value instanceof Uint8Array) return value;
  if (value instanceof ArrayBuffer) return new Uint8Array(value);
  return new TextEncoder().encode(String(value));
}
export class ProjectFileStore {
  constructor({ database = 'studio-workspace-files', store = 'files' } = {}) { this.database = database; this.store = store; this.dbPromise = null; }
  open() {
    if (!globalThis.indexedDB) return Promise.reject(new Error('Persistent browser storage is unavailable.'));
    if (!this.dbPromise) this.dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(this.database, 1);
      request.onupgradeneeded = () => { const db = request.result; if (!db.objectStoreNames.contains(this.store)) { const items = db.createObjectStore(this.store, { keyPath: 'key' }); items.createIndex('projectId', 'projectId', { unique: false }); } };
      request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error || new Error('Could not open project files database.')); request.onblocked = () => reject(new Error('Project storage migration blocked by another tab.'));
    });
    return this.dbPromise;
  }
  validate(projectId, files) {
    if (!projectId || !files || typeof files !== 'object') throw new TypeError('Project ID and file map are required.');
    return Object.entries(files).map(([path, content]) => {
      if (!path || path.startsWith('/') || path.includes('\\') || /^[A-Za-z]:/.test(path) || path.split('/').some((part) => !part || part === '.' || part === '..')) throw new Error(`Unsafe project path: ${path}`);
      return { key: `${projectId}:${path}`, projectId, path, content: toBytes(content), updatedAt: Date.now() };
    });
  }
  async putProject(projectId, files) {
    const rows = this.validate(projectId, files); const db = await this.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(this.store, 'readwrite'); const objectStore = tx.objectStore(this.store); const cursor = objectStore.index('projectId').openCursor(IDBKeyRange.only(projectId));
      cursor.onsuccess = () => { const cur = cursor.result; if (cur) { if (!Object.hasOwn(files, cur.value.path)) cur.delete(); cur.continue(); } };
      for (const row of rows) objectStore.put(row);
      tx.oncomplete = () => resolve(rows.length); tx.onerror = () => reject(tx.error || new Error('Project file save failed.')); tx.onabort = () => reject(tx.error || new Error('Project file save was aborted.'));
    });
  }
  async getProject(projectId) {
    const db = await this.open(); return new Promise((resolve, reject) => {
      const tx = db.transaction(this.store, 'readonly'); const req = tx.objectStore(this.store).index('projectId').getAll(IDBKeyRange.only(projectId));
      req.onsuccess = () => resolve(Object.fromEntries(req.result.map(({ path, content }) => [path, content]))); req.onerror = () => reject(req.error || new Error('Project file load failed.'));
    });
  }
  async deleteProject(projectId) {
    const db = await this.open(); return new Promise((resolve, reject) => {
      const tx = db.transaction(this.store, 'readwrite'); const cursor = tx.objectStore(this.store).index('projectId').openCursor(IDBKeyRange.only(projectId));
      cursor.onsuccess = () => { const cur = cursor.result; if (cur) { cur.delete(); cur.continue(); } }; tx.oncomplete = () => resolve(); tx.onerror = () => reject(tx.error || new Error('Project files deletion failed.'));
    });
  }
}
