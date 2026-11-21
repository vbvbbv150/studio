# Architecture Decisions

## ADR-001: Local-first project storage
Use IndexedDB for browser-local project persistence. This avoids a mandatory backend for the first usable workflow. Trade-off: projects are device/browser-profile scoped and require export backups.

## ADR-002: Source-backed preview
Render project HTML/CSS/JS in a sandboxed iframe rather than showing screenshots. This is an honest live preview for the supported plain-web project type, not a general Node runtime.

## ADR-003: Small template set
Ship three complete starter templates instead of a large gallery of incomplete templates.

## ADR-004: Explicit AI patch approval
AI output must be structured as file changes and shown for confirmation before project files are changed.

## ADR-005: No hidden paid fallback
The app never silently changes providers or starts paid infrastructure. Provider costs and quota limits remain explicit.
