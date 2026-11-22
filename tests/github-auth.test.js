import test from 'node:test';
import assert from 'node:assert/strict';
import { parseGitHubUrl, buildGitHubAuthorizeUrl, verifyGitHubOAuthCallback } from '../src/github-auth.js';

test('GitHub URL parsing restricts host and extracts repository identity', () => {
  assert.deepEqual(parseGitHubUrl('https://github.com/acme/project.git'), { owner: 'acme', repo: 'project' });
  assert.throws(() => parseGitHubUrl('https://example.com/acme/project'), /Only github.com/);
});

test('OAuth authorize URL requests explicit scopes and validates state on callback', () => {
  const url = new URL(buildGitHubAuthorizeUrl({ clientId: 'client-id', redirectUri: 'https://studio.example/callback', state: 'nonce' }));
  assert.equal(url.searchParams.get('state'), 'nonce');
  assert.equal(url.searchParams.get('scope'), 'repo read:user');
  const storage = { getItem: () => 'good', removeItem: () => {} };
  assert.deepEqual(verifyGitHubOAuthCallback({ code: 'code', receivedState: 'good', sessionStorage: storage }), { code: 'code' });
  assert.throws(() => verifyGitHubOAuthCallback({ code: 'code', receivedState: 'bad', sessionStorage: storage }), /state mismatch/);
});
