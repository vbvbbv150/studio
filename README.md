# Studio — Local-first Visual App Builder MVP

Studio is an early, source-backed application-builder workspace. This delivery focuses on a usable local workflow: create projects from real starter files, edit HTML/CSS/JS, run those files in an isolated iframe preview, select supported DOM elements, apply source-backed style/text edits, and export/import portable project bundles.

> **Scope honesty:** This is a functional local MVP, not the complete hosted Studio platform. It does not yet provide a persistent cloud runtime, GitHub OAuth/repository provisioning, arbitrary framework runtime, secure server-side AI execution, team accounts, database provisioning, or APK compilation. Those capabilities require separate infrastructure and security work.

## Requirements

- Node.js 20+ or 22+
- npm
- A modern browser with IndexedDB and iframe support

## Run locally

```bash
npm run dev
```

No third-party npm packages are required for the current local MVP.

Open the URL printed by Vite. For a production bundle:

```bash
npm run build
npm run preview
```

Run the included checks:

```bash
npm test
```

## Working features

- Responsive workspace shell with dark/light theme.
- Project dashboard, search, recent projects, rename/duplicate/delete.
- Blank project creation and three starter templates.
- IndexedDB persistence in the current browser profile.
- File explorer and source editor for project files.
- Real HTML/CSS/JS preview rendered in a sandboxed iframe from project source.
- Preview element selection and an inspector for text and common CSS properties.
- Inspector changes are written back to `index.html` and `style.css`.
- Studio JSON project import/export and whole-workspace backup.
- Optional provider connection for OpenAI-compatible chat-completions APIs or Anthropic Messages APIs, with proposed file patches requiring user confirmation.
- AI credentials are held in page memory only and cleared on reload; they are not written to IndexedDB.

## Important limitations

- The current preview runtime executes plain HTML/CSS/JS only. It does not install npm packages or run Vite/Next/React/Flutter inside the browser.
- Project import currently supports Studio `.studio.json` bundles, not ZIP or GitHub repository import.
- The code editor is a lightweight textarea, not Monaco/CodeMirror; syntax highlighting and language services are not included.
- Visual editing works best for simple DOM elements and selector-backed styles. Complex component frameworks, shadow DOM, canvas, and generated CSS require source editing.
- AI provider calls originate in the browser. This is suitable only for a personal local experiment. A production deployment must move provider calls to a protected backend, implement authorization, rate limits, audit logs, and a secrets vault. Browser CORS policies may block some providers.
- There is no automatic paid fallback, no bundled AI quota, and no automatic billing.
- Projects are local to the browser profile. Clearing browser data can remove them; export backups regularly.

## Project format

A single project export is JSON with `format: "studio-project"`, `version: 1`, and a `project` object containing metadata and a `files` map. Workspace backups use `format: "studio-workspace"` and a `projects` array.

## Security notes

- The preview iframe uses a sandbox without `allow-same-origin` and does not receive the Studio application's storage context.
- Imported project files are treated as source text and rendered only inside the sandboxed preview.
- The current browser AI connector is intentionally labeled as experimental and must not be used for shared/public deployments.
- Never commit API keys, access tokens, or private user data.

## Repository delivery

The source archive is designed to be extracted into the repository root. Do not nest the contents under an extra `studio-mvp/` directory. Keep this work on a feature branch until reviewed; do not overwrite unrelated repository content.
