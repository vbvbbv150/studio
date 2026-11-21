# StackBlitz Android smoke test
Result: passed for a small Vite starter hosted by StackBlitz.

Observed:
- Vite dev server started at http://localhost:5173/.
- User added an H1 to index.html.
- The heading appeared in Preview without restarting the server.

Proves:
- A small Vite dev server ran in the tested Android browser session.
- Source edits refreshed Preview.

Does not prove:
- WebContainers API can be embedded in Studio.
- Large projects fit mobile memory.
- Private GitHub import or Studio-controlled Git operations work.
- Persistent or unlimited free compute exists.

Next: validate API terms, cross-origin isolation, and Android support before integration.
