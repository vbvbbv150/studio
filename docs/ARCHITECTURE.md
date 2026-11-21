# Architecture
Status: proposed; runtime, database/auth, and AI provider choices remain open.

## System boundary
Studio has its own repository. Each generated app has a separate repository, branch history, dependencies, and isolated runtime.

## Components
- Studio web app: dashboard, templates, editor, Preview, inspector, Agent, history, and builds.
- Control plane: users, projects, templates, repo links, workspace lifecycle, provider configuration, budgets, and audit.
- Runtime plane: isolated workspace; clone repo, install dependencies, run dev server, expose protected Preview URL, stream logs, enforce resource quotas.
- GitHub adapter: repo linking, source reads, branch/commit operations, diffs, least privilege.
- Template contract: framework/runtime, routes, navigation, design tokens, component registry, capabilities, environment names, Android compatibility.
- Visual editing contract: stable component IDs and editable-property schemas.
- Agent runtime: planning, tools, project context, provider adapters, approval gates, secret redaction, audit.
- Build workers: isolated jobs, separate from Preview.

## Security
Never execute untrusted project code in the control-plane process. Use scoped credentials, redact secrets, prevent path traversal, restrict network where feasible, enforce quotas, terminate idle workspaces, and audit tool calls.

## Technology direction
Initial shell uses Vite and browser-native JavaScript. Runtime embedding, backend, database/auth, and AI provider stack remain open until constraints are validated.
