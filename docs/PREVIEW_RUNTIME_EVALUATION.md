# Preview runtime evaluation
Updated 2026-11-21. StackBlitz browser smoke test passed; embedded Studio runtime is not proven.

## Android test evidence
- User signed into StackBlitz.
- Old private GitHub import URL failed with a repository access message; this was not a runtime failure.
- A new Vite project opened.
- Vite started on port 5173.
- User edited index.html and saw the new heading in Preview without restarting the server.

## Conclusion
StackBlitz-hosted WebContainers can run a small Vite dev server and hot-reload a source edit in the tested Android browser session. This does not prove Studio can embed WebContainers, import private repositories, or run arbitrary large projects.

## Next validation
Verify official API terms, cross-origin isolation headers, Android browser support, memory limits, GitHub import/export, and quota behavior before integration.
