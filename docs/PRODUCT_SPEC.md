# Product specification
Studio is a visual AI app builder. Preview must run the same real source represented by the editor.

## User journey
1. Choose a template or blank starter.
2. Create a separate GitHub repository for the generated app.
3. Provision an isolated workspace and run the actual dev server.
4. Interact with real Preview.
5. Select supported elements and edit their source-backed properties.
6. Use the AI Agent for complex multi-file changes.
7. Review plans, diffs, and tests; approve consequential operations.
8. Commit, inspect history, revert, or build an APK for compatible stacks.

## Main areas
- Projects and versioned templates.
- Real source-backed Preview with hot reload, responsive viewports, logs, and revision identity.
- Visual editor with stable component IDs and editable-property schemas.
- Provider-independent AI engineering Agent.
- Full-stack workflows: APIs, DB, auth, roles, permissions, migrations, tests.
- Android builds only for compatible Capacitor/Flutter templates.

## Hard constraints
No mandatory paid plan/API/hosting, automatic billing, or paid fallback. Free quotas must be explicit. Unsupported arbitrary code is Agent-editable, not falsely described as visually editable.
