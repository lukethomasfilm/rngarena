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

### Lady By-Chance Bye Round System
- **New Feature:** Lady By-Chance character appears during bye rounds
  - Green nameplate with "Bringer of Fortune" title
  - 7-second lucky clover shower (falling emoji animation)
  - Special announcer messages: "LUCKY YOU! YOU'VE BEEN VISITED BY LADY BY-CHANCE!"
  - Free loot upgrade on bye rounds
  - Character sprite: `images/Characters/Lady_bye_chance.png`

### Combat Improvements
- Critical hits now deal 3 damage even when blocked
  - Normal blocks still prevent all damage
  - Message: "[Name] blocks the CRIT but takes 3 damage!"
  - Updated handleBlock() in CombatSystem.js

### UI Animations & Polish
- **Nameplate Entrance:** Nameplates slide up from bottom when tournament starts
  - Smooth 1-second transition on first battle
  - Names populate before animation (no blank slides)
- **Falling Emojis:** Added falling animation system for bye rounds
  - Size: 1rem (smaller, subtle)
  - Z-index: 1 (behind UI, above background)
  - Duration: 3 seconds fall time
- Blank nameplates before tournament starts for cleaner initial state
- Fixed fighter entrance glitching by setting opacity before display updates

### Bug Fixes
- **CRITICAL:** Fixed bye round detection order
  - Moved `hasFollowedCharacterBye()` check before `getCurrentMatch()`
  - Prevents bye rounds from being skipped
- Fixed fighter entrance animations on bye rounds
- Eliminated fighter blink on tournament start

### Technical Notes
- Bye round check must happen BEFORE match check in startBattle()
- Falling emoji CSS class: `.falling-emoji` with floatDown animation
- Lady By-Chance styling: `.lady-bye-chance` class with green theme
- Nameplate animation: `.nameplate-vs-container.visible` class triggers slide-up
- Fighter opacity must be set to '0' before updateMatchDisplay() to prevent glitches

### Previous Changes (Earlier 2025-10-01)
- Added stone texture backgrounds to UI windows
- Added vignette depth effects to textured windows and battlefield
- Redesigned tournament progress bar as tab-styled components
- Added gradient borders to HP bars
- Fixed duplicate RNGArena instances causing 2-4 simultaneous combat actions

---
*Last updated: 2025-10-02*
