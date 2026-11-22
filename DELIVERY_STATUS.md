# Studio functional platform delivery status

**Implementation in progress.** This branch contains implementation source changes; this status does not assert end-to-end acceptance. Current source modules include ZIP archive generation/inspection, local file storage, static preview adapter and framework detector, GitHub REST client, AI work orchestration primitives, and snapshot history. Tests were added for these modules but have not yet been executed in this environment.

## Current verified scope

- **Source changes:** committed on `delivery/studio-complete-platform`; source changes are verified in GitHub.
- **Automated tests:** test source files committed; no local Node runtime is available through the connected GitHub interface, and no Actions runs exist. Execution is pending.
- **ZIP import/export:** utilities exist; UI integration and browser/Android test still pending. Import supports stored/deflated ZIP only and only text-decodes entries, so binary assets are not yet faithfully preserved.
- **GitHub client:** direct REST client source exists, but browser OAuth, secure token handling, branch push/pull/conflicts, and app UI integration remain incomplete. Never paste a GitHub token into a public/static client as a production credential.
- **AI:** orchestration primitives require caller-supplied providers and verified-free route metadata. No candidate provider/model route is verified or enabled.
- **Runtime:** actual static iframe only. React/Vite/backend runtimes remain unsupported/unverified.
- **Android:** no Android project or verified APK workflow/artifact yet.

See `docs/ACCEPTANCE_STATUS.md` for existing acceptance gates. Do not declare the product complete until each critical workflow has real evidence.