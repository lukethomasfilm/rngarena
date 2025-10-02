# RNG Arena - Development Notes

## ⚡ STARTUP PROCESS - RUN THIS IMMEDIATELY WHEN ASKED

When the user says "run the startup process", "launch RNG Arena", or "start the server":

```bash
npm start
```

That's it! This runs Vite dev server on port 8000 with hot reload.

Server will be available at: http://localhost:8000

---

## Development Commands

### Standard Commands (Professional)
```bash
npm start          # Start dev server (Vite)
npm run build      # Build for production
npm run preview    # Preview production build
npm run lint       # Run ESLint
npm run format     # Run Prettier
```

### Troubleshooting

#### Port Already in Use
If port 8000 is occupied:

**Diagnosis:**
```bash
netstat -ano | findstr :8000
```

**Fix:**
```bash
taskkill -F -PID [process_id]
npm start
```

#### Manual Server (Fallback)
If npm start fails, use http-server as fallback:
```bash
npx http-server -p 8000 .
```

**CRITICAL:** Must include `.` at end to serve from root, NOT from `./public`

---

## Recent Changes (2025-10-01)

### UI Polish
- Added stone texture backgrounds to UI windows (exit, chat, chat mode buttons)
- Added vignette depth effects to textured windows and battlefield
- Reduced button glow effects for cleaner look
- Adjusted chat background opacity and padding alignment
- Redesigned tournament progress bar as tab-styled components
- Added gradient borders to HP bars (black to grey, flipped on right side)
- Improved odds display readability (removed gradient texture)

### Bug Fixes
- **CRITICAL:** Fixed duplicate RNGArena instances causing 2-4 simultaneous combat actions
  - Removed auto-initialization in RNGArena.js (kept only index.html initialization)
- Fixed bye round progression - now properly advances to next round
- Fixed HP bar positioning to be independent of progress bar width
- Rounded HP bar corners to 5px for softer appearance

### Technical Notes
- HP bars now use flexbox positioning with 10px gap between elements
- Progress bar has fixed 252px width, independent of container
- Odds tab padding: 6px 20px
- Tournament progress system uses tab-style UI with rounded corners
- Stone textures: UX Images folder with URL-encoded paths

---
*Last updated: 2025-10-01*
