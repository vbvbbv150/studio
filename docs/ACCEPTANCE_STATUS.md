# Studio acceptance register

Audit source: `foundation/initial-studio-shell`, commit `5114683353877b845546ba4e4a994740a1f3bab4`. This register distinguishes verified baseline capabilities from unimplemented requirements. No feature listed below is promoted to PASS without end-to-end evidence.

| Requirement | Status | Evidence / test | Limitation |
|---|---|---|---|
| Project dashboard and local project create/reopen | PARTIAL | Existing `src/main.js`; inspect IndexedDB-backed project flows; baseline docs | Current local MVP only; verify migration/recovery in device use |
| Source tree and manual code editing | PARTIAL | Existing workspace code and editor; README describes textarea | Not a full IDE/editor component |
| Actual live preview | PARTIAL | Sandboxed iframe built from local HTML/CSS/JS source | Only static HTML/CSS/JS; no npm server/frameworks |
| Visual selection and source-backed edits | PARTIAL | Existing preview message/inspector paths described in README | Simple selectors only; no robust framework source mapping |
| GitHub accounts/repo/branch import, creation, sync | NOT IMPLEMENTED | No integration in audited baseline | Requires OAuth/auth scope and real Git workflows |
| ZIP import/export and Android file picker | NOT IMPLEMENTED | README supports Studio JSON only | Must be implemented and tested with traversal protections |
| Local-first ZIP source ownership | NOT IMPLEMENTED | Existing workspace JSON backup only | Must preserve actual full tree, filter secrets safely |
| Native Git, branches, commits, conflicts | NOT IMPLEMENTED | No Git integration verified | Internal snapshots must not be labeled Git commits |
| AI chat with protected keys and zero-cost routing | NOT IMPLEMENTED | README says browser API calls, experimental | No server-side secret service or verified free route |
| AI Work, four roles, independent review/approval | NOT IMPLEMENTED | No orchestrator verified | Requires task checkpoints and controlled sole writer |
| Full-stack runtime adapters | NOT IMPLEMENTED | Existing static sandbox only | Backend/database runtimes unverified |
| Android-first Capacitor/native app | NOT IMPLEMENTED | No Android project verified | Must build/install/test real APK |
| GitHub Actions APK pipeline | NOT IMPLEMENTED | No verified workflow/run/artifact | Workflow success and artifact required |
| Security and storage migration | PARTIAL | Existing iframe sandbox and in-memory key claim in README | No comprehensive threat review or migration evidence |
| Provider route pricing/IDs verification | BLOCKED | No internet search/provider APIs available in this audit toolset | Must verify model IDs/pricing directly before enabling |
| Android device end-to-end testing | BLOCKED | No device or emulator available here | Required device validation outstanding |

## Minimum measurable final acceptance

A gate can become PASS only when the actual source, tests, and relevant real integration prove the behavior. Required end-to-end tests include project create/edit/preview/export; valid and malicious ZIP import; GitHub selected non-default branch and sync; offline editing/reopen; visual source change/undo; AI proposal/diff/reject/accept and independent review; four-role routing/cost block; and GitHub Actions debug APK artifact plus device install. Preserve local files when a remote operation fails.

## Current delivery evidence

This branch contains only the audit status and acceptance register at this point. No final application build or APK was produced by the audit. Do not describe this baseline audit as platform completion.