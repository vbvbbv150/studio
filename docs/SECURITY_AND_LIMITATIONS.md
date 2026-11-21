# Security and Limitations

- Never put secrets in project source files or commits.
- Current optional AI calls originate from the browser and are intended only for local experimentation. Do not deploy this configuration for multiple users.
- A production backend must authenticate users, isolate workspaces, keep provider keys server-side, rate-limit tasks, enforce budget caps, and audit tool operations.
- Project preview code is untrusted. Keep it in a sandboxed origin/runtime and do not expose host credentials or privileged APIs.
- The current editor is a textarea and does not parse arbitrary application ASTs.
- Inspector edits are basic selector-based transformations and can be unsuitable for complex nested DOM structures.
- The current project importer accepts only Studio JSON bundles. ZIP and GitHub imports are future work.
