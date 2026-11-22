export function parseGitHubUrl(value) {
  let url; try { url = new URL(value); } catch { throw new Error('Enter a valid GitHub repository URL.'); }
  if (url.hostname.toLowerCase() !== 'github.com') throw new Error('Only github.com repositories are supported.');
  const parts = url.pathname.split('/').filter(Boolean);
  if (parts.length < 2) throw new Error('Repository URL must include owner and repository.');
  return { owner: decodeURIComponent(parts[0]), repo: decodeURIComponent(parts[1].replace(/\.git$/, '')) };
}

export function newGitHubOAuthState() {
  const bytes = crypto.getRandomValues(new Uint8Array(24));
  return [...bytes].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

export function buildGitHubAuthorizeUrl({ clientId, redirectUri, state, scopes = ['repo', 'read:user'] }) {
  if (!clientId || !redirectUri || !state) throw new Error('GitHub OAuth client ID, redirect URI, and state are required.');
  const url = new URL('https://github.com/login/oauth/authorize');
  url.searchParams.set('client_id', clientId); url.searchParams.set('redirect_uri', redirectUri); url.searchParams.set('state', state); url.searchParams.set('scope', scopes.join(' '));
  return url.toString();
}

export function beginGitHubOAuth({ clientId, redirectUri, sessionStorage = globalThis.sessionStorage }) {
  const state = newGitHubOAuthState(); sessionStorage.setItem('studio.github.oauth.state', state);
  const url = buildGitHubAuthorizeUrl({ clientId, redirectUri, state });
  globalThis.location.assign(url);
}

export function verifyGitHubOAuthCallback({ receivedState, sessionStorage = globalThis.sessionStorage, code }) {
  const expected = sessionStorage.getItem('studio.github.oauth.state'); sessionStorage.removeItem('studio.github.oauth.state');
  if (!expected || !receivedState || expected !== receivedState) throw new Error('GitHub OAuth state mismatch; refusing callback.');
  if (!code) throw new Error('GitHub authorization code is missing.');
  return { code };
}

export function saveSessionToken(token, storage = globalThis.sessionStorage) {
  if (typeof token !== 'string' || token.length < 20) throw new Error('Invalid GitHub access token.');
  storage.setItem('studio.github.session-token', token);
}
export function clearSessionToken(storage = globalThis.sessionStorage) { storage.removeItem('studio.github.session-token'); }
