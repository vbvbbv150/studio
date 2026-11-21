# Implementation plan
Each milestone must be independently runnable and verifiable.

## M0 — Foundation
- [x] Dedicated Studio repository and main branch.
- [x] Initial product/architecture/decision docs.
- [x] Android Vite smoke test: dev server and source-to-preview hot reload.
- [ ] Confirm WebContainers API terms, browser isolation, and memory behavior.

## M1 — Runtime and GitHub
- [ ] Integrate a real project runtime in Studio.
- [ ] Create workspace from a repository or template.
- [ ] Run actual source and display interactive Preview.
- [ ] Edit source and verify hot reload.
- [ ] Read GitHub repository tree/files.
- [ ] Create branch/commit and verify revision.
- [ ] Test private repository authorization safely.
- [ ] Enforce quotas and no-paid-fallback behavior.

## M2 — Studio shell/control plane
- [x] Responsive dashboard shell and local draft interaction.
- [ ] Persistent project metadata, workspace lifecycle, logs, GitHub integration.

## M3 — Templates
- [ ] Versioned manifests, web and Android starters, routes, design tokens, component registry.
- [ ] Template instantiation creates independent GitHub repository.

## M4 — Visual editor
- [ ] Stable component IDs and Preview selection.
- [ ] Source-backed inspector, section editing, pages/navigation, undo/redo, diffs.

## M5 — AI Agent
- [ ] Provider-independent task lifecycle and project context.
- [ ] Safe read/write/test/build/log/diff/Git tools.
- [ ] Plan → execute → validate → review → approve.
- [ ] Branch isolation, audit, quota enforcement.

## M6–M8
Full-stack workflows, Android build/release, security hardening, RTL/LTR, recovery, rollback, accessibility, and beta.
