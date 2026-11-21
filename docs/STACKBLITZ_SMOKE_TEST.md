# StackBlitz Android smoke test

Historical result: passed for a small Vite starter hosted by StackBlitz.

Observed:
- Vite dev server started at `http://localhost:5173/`.
- The user edited `index.html` and saw the heading update in Preview.

This proves a small Vite development server and source hot reload worked in that tested Android browser session. It does not prove WebContainers can be embedded in Studio, large projects fit mobile memory, private GitHub import works, or unlimited free compute exists.

The current Studio local MVP uses a different, deliberately lightweight approach for its own plain HTML/CSS/JS preview. It does not yet embed WebContainers.
