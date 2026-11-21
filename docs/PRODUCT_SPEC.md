# Product Specification — Studio Local MVP

## Product goal
Provide a local-first workspace where a user can create a small web project, edit its real source, see that source execute in a live preview, inspect supported DOM elements, and export the project.

## Primary user journeys
1. Create a blank project or choose one of three templates.
2. Edit `index.html`, `style.css`, or `app.js` in the source editor.
3. Refresh the preview and interact with the running page.
4. Enable element inspection, select an element, and apply text/style edits back to source.
5. Export a project bundle or import a previously exported Studio bundle.
6. Optionally configure an AI provider and review a structured file patch before applying it.

## MVP acceptance criteria
- Projects persist across reloads in the same browser profile using IndexedDB.
- Project creation, search, open, rename, duplicate, delete, and export work.
- The preview is generated from the project's current source files, not a screenshot.
- Supported inspector edits update source files and refresh the preview.
- AI patches are not applied without explicit confirmation.
- Provider credentials are not stored in IndexedDB.

## Out of scope for this delivery
Cloud workspaces, multi-user collaboration, GitHub OAuth, repository provisioning, arbitrary Node runtimes, package installation, full-stack infrastructure provisioning, APK builds, and production-grade server-side AI orchestration.
