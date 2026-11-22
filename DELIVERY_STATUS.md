# Studio Complete Platform — Delivery Branch

This branch begins from `foundation/initial-studio-shell` at baseline `5114683353877b845546ba4e4a994740a1f3bab4`. Repository audit found a browser-based local MVP, not the advertised complete platform. Existing verified features include IndexedDB project storage, a real sandboxed HTML/CSS/JS iframe preview, template starters, basic source-backed visual editing, and Studio JSON backup/import. Existing documentation explicitly identifies limitations: no ZIP, GitHub OAuth/repository operations, true code editor, server-side AI, framework runtime, Android app, or APK workflow.

## Delivery status

The requested complete product cannot responsibly be reported as implemented based on this branch's verified evidence. This branch records the audit and sets measurable implementation/acceptance expectations. Do not treat a UI control, mocked service, workflow file, or successful web bundle as evidence of a working integration.

## Local-first ownership

Local project source remains the user's authoritative copy. GitHub integration is optional. Failed remote operations must never discard local changes. Export must include the actual saved source tree, exclude secrets, and preserve directory hierarchy. Existing browser storage needs versioned migration, not reset.

## Acceptance evidence convention

For each feature, record status as PASS, PARTIAL, BLOCKED, or NOT IMPLEMENTED; list relevant files, test performed, result, and limitation. Only actual behavior validated by tests or a real environment may be PASS.

## Known blockers in this audited baseline

- No GitHub OAuth/API workflow or repository/branch operations.
- Studio JSON import/export only; no ZIP import/export.
- Textarea-based editor rather than CodeMirror/Monaco.
- Preview supports static HTML/CSS/JS only, not npm/Vite/React/server runtimes.
- Browser-origin AI API calls; no protected server-side secrets architecture or verified free model routing.
- No four-role work orchestrator, review/approval workflow, or robust project task checkpoints.
- No native Android/Capacitor application or tested Android build pipeline.
- No verified APK artifact, Android installation test, or external provider verification.

## Zero-cost and secrets policy

The repository's existing app does not receive GitHub Actions secrets at runtime. Provider keys must not be exposed in client files or APK assets. Never assume an advertised free tier/model route without verifying the provider's current terms. Block unknown-cost routes under a zero-cost policy.

See `docs/ACCEPTANCE_STATUS.md` for the complete gate register and `docs/IMPLEMENTATION_PLAN.md` for sequenced work and verification requirements.