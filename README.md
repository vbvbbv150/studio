# Studio
AI-assisted visual app builder for real, source-backed applications.

## Non-negotiable rules
- Live Preview runs actual project source, never a screenshot presented as a runtime.
- Supported preview elements can be selected and edited through source-aware visual tools.
- Complex changes use an AI engineering agent with plans, diffs, tests, and approval gates.
- Each generated app has its own repository and isolated workspace.
- No mandatory paid services, automatic billing, or silent paid fallback.

## Current status
The Android StackBlitz smoke test succeeded for a small Vite starter: the dev server started on port 5173 and a source edit appeared in Preview. This validates StackBlitz-hosted Vite on the tested tablet, not yet a WebContainers runtime embedded inside Studio.

This is an early Studio shell foundation. GitHub project operations, embedded runtime, AI orchestration, and visual selection are not implemented yet.

## Development
Run `npm install`, then `npm run dev`.

## Documentation
See the `docs/` directory for the product specification, architecture, roadmap, cost rules, decisions, and runtime test evidence.
