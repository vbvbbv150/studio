import test from 'node:test';
import assert from 'node:assert/strict';
import { createProjectFileStore } from '../src/project-file-store.js';

function fakeIndexedDB() {
  const rows = new Map();
  const store = { put(row) { rows.set(row.key, row); const request = { result: row }; return request; }, getAll() { const request = { result: [...rows.values()] }; queueMicrotask(() => request.onsuccess?.()); return request; }, delete(key) { rows.delete(key); }, get(key) { const request = { result: rows.get(key) }; return request; }, get indexNames() { return { contains: () => false }; } };
  const db = { objectStoreNames: { contains: () => true }, transaction() { const tx = { objectStore: () => store }; queueMicrotask(() => tx.oncomplete?.()); return tx; } };
  return { open(_name, _version) { const request = { result: db }; queueMicrotask(() => { request.onupgradeneeded?.(); request.onsuccess?.(); }); return request; } };
}

test('project store validates safe file paths before persistence', async () => {
  const old = globalThis.indexedDB; globalThis.indexedDB = fakeIndexedDB();
  try {
    const store = createProjectFileStore();
    await assert.rejects(() => store.putProject('p', { '../secret': 'x' }), /Unsafe project file path/);
  } finally { globalThis.indexedDB = old; }
});
