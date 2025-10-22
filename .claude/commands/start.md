---
description: Start the Vite dev server and open browser
---

Start the Vite development server using `npm run dev`. Vite is configured to automatically open http://localhost:8000 in the browser.

IMPORTANT:
- Always use `npm run dev` (Vite), not `npx http-server`. See DEVELOPER_NOTES.md lines 273-278.
- Do NOT manually open the browser - Vite's `open: true` config (vite.config.js:20) handles this automatically.
