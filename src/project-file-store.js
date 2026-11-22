export function createProjectFileStore({ database = 'studio-workspace', store = 'project-files' } = {}) {
  let dbPromise;
  function open() {
    if (!globalThis.indexedDB) return Promise.reject(new Error('IndexedDB is unavailable in this environment.'));
    if (!dbPromise) dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(database, 1);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(store)) db.createObjectStore(store, { keyPath: 'key' });
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error || new Error('Could not open Studio project storage.'));
      request.onblocked = () => reject(new Error('Project storage migration is blocked by another open Studio tab.'));
    });
    return dbPromise;
  }
  async function transaction(mode, callback) {
    const db = await open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(store, mode); const objectStore = tx.objectStore(store); let value;
      try { value = callback(objectStore); } catch (error) { reject(error); return; }
      tx.oncomplete = () => resolve(value?.result);
      tx.onerror = () => reject(tx.error || new Error('Project file transaction failed.'));
      tx.onabort = () => reject(tx.error || new Error('Project file transaction was aborted.'));
    });
  }
  return {
    async putProject(projectId, files) {
      if (!projectId || !files || typeof files !== 'object') throw new TypeError('A project ID and file map are required.');
      const rows = Object.entries(files).map(([path, content]) => {
        if (!path || path.startsWith('/') || path.split('/').some((part) => !part || part === '.' || part === '..') || path.includes('\\')) throw new Error(`Unsafe project file path: ${path}`);
        return { key: `${projectId}:${path}`, projectId, path, content: String(content), updatedAt: Date.now() };
      });
      await transaction('readwrite', (objectStore) => {
        const existing = objectStore.indexNames.contains('projectId') ? null : null;
        void existing;
        for (const row of rows) objectStore.put(row);
        const request = objectStore.getAll();
        request.onsuccess = () => { for (const row of request.result) if (row.projectId === projectId && !Object.hasOwn(files, row.path)) objectStore.delete(row.key); };
      });
      return rows.length;
    },
    async getProject(projectId) {
      const db = await open();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(store, 'readonly'); const req = tx.objectStore(store).getAll();
        req.onsuccess = () => resolve(Object.fromEntries(req.result.filter((row) => row.projectId === projectId).map((row) => [row.path, row.content])));
        req.onerror = () => reject(req.error || new Error('Unable to load project files.'));
      });
    },
    async deleteProject(projectId) {
      const db = await open();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(store, 'readwrite'); const objectStore = tx.objectStore(store); const req = objectStore.getAll();
        req.onsuccess = () => { for (const row of req.result) if (row.projectId === projectId) objectStore.delete(row.key); };
        tx.oncomplete = () => resolve(); tx.onerror = () => reject(tx.error || new Error('Unable to delete project files.'));
      });
    }
  };
}
