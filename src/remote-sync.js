export function buildGitData(files, { message = 'Studio source snapshot', branch = 'main' } = {}) {
  if (!files || typeof files !== 'object') throw new Error('Project files are required.');
  const entries = Object.entries(files).filter(([path]) => !/(^|\/)(\.env(\.(?!example$).*)?|.*\.(pem|key)|credentials\.json)$/i.test(path)).sort(([a], [b]) => a.localeCompare(b));
  const encoder = new TextEncoder();
  const blobs = entries.map(([path, content]) => ({ path, mode: '100644', type: 'blob', content: String(content) }));
  const tree = { branch, message, files: blobs, fileCount: blobs.length, disclaimer: 'This is a Studio source snapshot specification, not a native Git commit. Use a real Git provider to commit/push.' };
  return tree;
}

export function mergeText(base, local, remote) {
  if (local === remote) return { status: 'clean', content: local };
  if (local === base) return { status: 'clean', content: remote };
  if (remote === base) return { status: 'clean', content: local };
  return { status: 'conflict', base, local, remote, message: 'Both local and remote versions changed. Resolve manually; no data was overwritten.' };
}

export function preserveLocalOnRemoteFailure({ localFiles, remoteOperation }) {
  return Promise.resolve().then(remoteOperation).then((remoteResult) => ({ ok: true, remoteResult, files: localFiles })).catch((error) => ({ ok: false, error: error.message || String(error), files: localFiles, localChangesPreserved: true }));
}
