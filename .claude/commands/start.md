---
description: Start the Vite dev server and open browser
---

📝 **BEFORE STARTING:** Check the most recent dev notes file to see where we left off last session:
- Look for: `DEV_NOTES_SESSION_2025-*.md` (sorted by date)
- Current session: `DEV_NOTES_SESSION_2025-11-15.md`

---

Start the Vite development server using `npm run dev`. Vite is configured to automatically open http://localhost:8000 in the browser.

Also open the following folders in Windows Explorer:
- Desktop RNG Legends folder: `start "" "C:\Users\Luke\Desktop\RNG LEGENDS"`

IMPORTANT:
- Always use `npm run dev` (Vite), not `npx http-server`. See DEVELOPER_NOTES.md lines 273-278.
- Do NOT manually open the browser - Vite's `open: true` config (vite.config.js:20) handles this automatically.
