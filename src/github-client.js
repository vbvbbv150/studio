export function validateRepositoryName(name) {
  const value = String(name || '').trim();
  if (!/^[A-Za-z0-9._-]{1,100}$/.test(value) || value === '.' || value === '..') throw new Error('Repository name must be 1–100 letters, digits, dots, dashes, or underscores.');
  return value;
}

export class GitHubClient {
  constructor({ token, fetchImpl = fetch } = {}) {
    if (!token) throw new Error('A GitHub access token is required for this session.');
    this.token = token; this.fetch = fetchImpl; this.base = 'https://api.github.com';
  }
  async request(path, options = {}) {
    const response = await this.fetch(`${this.base}${path}`, { ...options, headers: { Accept: 'application/vnd.github+json', Authorization: `Bearer ${this.token}`, 'X-GitHub-Api-Version': '2022-11-28', ...(options.body ? { 'Content-Type': 'application/json' } : {}), ...options.headers } });
    const body = response.status === 204 ? null : await response.json().catch(() => null);
    if (!response.ok) {
      const reason = body?.message || `GitHub request failed with HTTP ${response.status}`;
      const error = new Error(reason); error.status = response.status; error.remaining = response.headers.get('x-ratelimit-remaining'); error.reset = response.headers.get('x-ratelimit-reset'); throw error;
    }
    return body;
  }
  async listRepositories() {
    const result = [];
    for (let page = 1; page <= 100; page++) {
      const batch = await this.request(`/user/repos?per_page=100&sort=updated&page=${page}`);
      result.push(...batch);
      if (batch.length < 100) break;
    }
    return result;
  }
  async listBranches(owner, repo) {
    const result = [];
    for (let page = 1; page <= 100; page++) {
      const batch = await this.request(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/branches?per_page=100&page=${page}`);
      result.push(...batch);
      if (batch.length < 100) break;
    }
    return result;
  }
  async importTree(owner, repo, branch) {
    if (!branch) throw new Error('Select a branch explicitly before importing.');
    const ref = encodeURIComponent(branch);
    const meta = await this.request(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/branches/${ref}`);
    const tree = await this.request(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/git/trees/${meta.commit.sha}?recursive=1`);
    if (tree.truncated) throw new Error('Repository tree exceeds the GitHub recursive tree limit; import requires paginated contents traversal.');
    const entries = tree.tree.filter((entry) => entry.type === 'blob'); const files = {};
    for (const entry of entries) {
      if (entry.size > 2 * 1024 * 1024) throw new Error(`File ${entry.path} exceeds the supported 2 MiB GitHub API content limit.`);
      const encoded = await this.request(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents/${entry.path.split('/').map(encodeURIComponent).join('/')}?ref=${ref}`);
      if (encoded.encoding !== 'base64') throw new Error(`Unsupported GitHub content encoding for ${entry.path}.`);
      const binary = Uint8Array.from(atob(encoded.content.replace(/\s/g, '')), (char) => char.charCodeAt(0));
      files[entry.path] = new TextDecoder().decode(binary);
    }
    return { files, repository: { owner, name: repo, branch, sha: meta.commit.sha }, treeCount: entries.length };
  }
  async createRepository({ owner, name, description = '', visibility = 'private', defaultBranch = 'main', files = {} }) {
    const safeName = validateRepositoryName(name);
    const repo = await this.request(owner === (await this.request('/user')).login ? '/user/repos' : `/orgs/${encodeURIComponent(owner)}/repos`, { method: 'POST', body: JSON.stringify({ name: safeName, description, private: visibility !== 'public', auto_init: true }) });
    const encodedRef = await this.request(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(safeName)}/git/ref/heads/${encodeURIComponent(repo.default_branch)}`);
    if (defaultBranch && defaultBranch !== repo.default_branch) {
      const base = await this.request(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(safeName)}/git/refs/heads/${encodeURIComponent(repo.default_branch)}`);
      await this.request(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(safeName)}/git/refs`, { method: 'POST', body: JSON.stringify({ ref: `refs/heads/${defaultBranch}`, sha: base.object.sha }) });
    }
    const targetBranch = defaultBranch || repo.default_branch;
    for (const [path, content] of Object.entries(files)) {
      if (path.startsWith('/') || path.split('/').includes('..')) throw new Error(`Unsafe source path: ${path}`);
      await this.request(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(safeName)}/contents/${path.split('/').map(encodeURIComponent).join('/')}`, { method: 'PUT', body: JSON.stringify({ message: `Add ${path}`, content: btoa(unescape(encodeURIComponent(String(content)))), branch: targetBranch }) });
    }
    return { ...repo, default_branch: targetBranch };
  }
  async pushFile({ owner, repo, branch, path, content, message, sha }) {
    if (!branch) throw new Error('Select a target branch before pushing.');
    const body = { message, content: btoa(unescape(encodeURIComponent(String(content)))), branch };
    if (sha) body.sha = sha;
    return this.request(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents/${path.split('/').map(encodeURIComponent).join('/')}`, { method: 'PUT', body: JSON.stringify(body) });
  }
}
