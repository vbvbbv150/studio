# Implementation and verification plan

This plan is constrained by the audited source: a dependency-free local browser MVP, plain static preview, browser IndexedDB, and no deployed backend. It is a sequenced engineering plan rather than evidence that features exist.

## 0. Baseline safety and architecture

- Preserve `foundation/initial-studio-shell` and its commit history; develop only on `delivery/studio-complete-platform`.
- Run current `npm test`, build script, inspect all storage keys/shapes, UI event flows, server routing, docs, and deployment configuration before editing.
- Add characterization and migration tests before changing storage.
- Define project interfaces around persistent file storage, project metadata, runtime adapters, Git providers, AI providers, and Android bridges. Keep the current static iframe adapter as a narrowly supported fallback.

## 1. Local-first source lifecycle

- Version and migrate metadata without resetting stored projects.
- Make source file CRUD atomic and recoverable; preserve autosave and local state.
- Implement ZIP archive inspection/extraction/export with traversal defenses, symlink/duplicate handling, size limits, cancellation, progress, safe exclusions and `.env.example` retention. Use actual Android document picker integration and browser file picker fallback.
- Add export manifest and test extracted tree independently; preserve user-configurable exclusions.
- Implement snapshot history honestly if a Git engine is unavailable; distinguish it from native Git.

## 2. Editor, projects, and runtime

- Introduce a maintained editor such as CodeMirror 6 after dependency and Android WebView compatibility review; test keyboard/touch interactions.
- Keep real source as preview input. Static adapter uses sandboxed iframe, explicit lifecycle/status/error messages, and stale-output prevention.
- Evaluate browser container/runtime support on target Android WebView before claiming React/Vite. Do not execute arbitrary imported scripts outside isolated project-run action. Unsupported frameworks remain importable and report incompatibility.
- Use source mapping only where robust parser/framework instrumentation exists; otherwise mark selection unmappable and avoid unsafe substitutions.

## 3. GitHub remote integration

- Implement OAuth with least scopes and secure token storage; a client-only static deployment cannot safely hold confidential client secrets. Choose architecture only after hosting/API constraints are known.
- Paginate repos and branches, require explicit branch choice, preserve private repo structure, rate-limit safely, and surface API errors.
- Implement safe fetch/status/diff/commit/branch/pull/push/conflict flows over actual project files. Do not overwrite remote work silently. Local changes and ZIP export survive auth/network failures.
- Create repositories only with explicit user-selected owner, name, visibility, branch, and consent.

## 4. AI and visual workflows

- Keep chat read-only; Work stages edits as reviewable patches with checkpoints, diff, tests, reject, rollback, accept.
- Add provider adapters and configurable role registry. One task writer only. Planner/specialist/reviewer get bounded relevant context; reviewer independently checks the actual diff.
- Server-side keys require an actual authorized backend or per-user secret vault; GitHub Actions secrets are build-time only. Never inject into browser or APK.
- Apply strict cost allow-list based on directly verified provider terms; block unknown/nonzero routes and do not fallback to paid routes.
- Visual editing must map selected DOM to source safely; otherwise offer code navigation without pretending source mapping exists.

## 5. Android and delivery

- Decide Capacitor/native storage/file picker integration only after runtime and persistence architecture is proven on Android.
- Pin dependencies, add CI tests/typecheck/lint where applicable, sync Capacitor Android project, build debug APK, publish artifact, and verify Actions run.
- Do not claim APK/device acceptance until artifact download and installation/use are tested on a compatible device.

## Review gates

At each stage record implementation status and evidence; run tests/build, inspect source diff, perform focused security and regression review, then re-run affected tests. Final independent acceptance includes local/offline ownership, malicious ZIP test, GitHub non-default branch and failure fallback, real runtime updates, AI review and rollback, zero-cost route block, and actual APK pipeline/device validation.

## Present status

Only the baseline branch audit and evidence register are committed so far. Each engineering stage remains unverified and must not be described as complete.