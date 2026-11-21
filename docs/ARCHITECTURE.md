# Architecture

## Current structure
- `index.html`: application shell and semantic view containers.
- `src/main.js`: client state, IndexedDB persistence, project lifecycle, editor, iframe preview, inspector, import/export, and optional AI provider adapter.
- `src/templates.js`: starter project source definitions.
- `src/style.css`: responsive workspace UI and theme tokens.
- `tests/`: Node test suite.

## Data flow
Project source is stored as a path-to-text map in an IndexedDB object store. The editor writes changes to that map. The preview builder reads `index.html`, injects the project's CSS and JS, and assigns the result to a sandboxed iframe's `srcdoc`. The iframe can report selected element metadata to the parent through a narrow `postMessage` protocol. The inspector then writes a selector-based CSS rule and simple text changes back into the project's source map.

## Trust boundaries
- The preview iframe is sandboxed and does not have `allow-same-origin`.
- The Studio shell never evaluates imported source in its own origin.
- AI-generated changes are parsed as structured JSON and require user confirmation before application.
- Path traversal (`..`) and absolute paths are rejected for AI patch paths.
- Browser-side API keys are memory-only in this MVP, but browser-origin API requests are not suitable for a shared production deployment.

## Planned evolution
Separate project domain, persistence, runtime, Git provider, AI provider, and orchestration modules behind typed contracts. Move AI secrets and provider requests to a protected server. Add a runtime adapter for a separately verified WebContainer or remote workspace provider. Add a secure GitHub OAuth application and server-side Git operations.
