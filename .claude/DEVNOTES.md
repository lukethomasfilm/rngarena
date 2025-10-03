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

## Recent Changes (2025-10-03 - Session 3)

### Loot Helmet Reveal System
- **NEW FEATURE:** Interactive loot chest opening with helmet reveal
  - Click chest in loot claim popup to reveal helmet item
  - Helmet appears with gold/white glow and wiggle animation
  - Chest fades out when helmet is revealed
  - After claiming, chest/button/shadow disappear from sidebar
  - Independent claim states for hero mode vs tournament mode
  - `heroLootClaimed` flag: Tracks hero-only mode claims (toggle OFF)
  - `tournamentLootClaimed` flag: Tracks tournament mode claims (toggle ON)
  - Toggle switching preserves independent claim states

### Fullscreen Fighter Adjustments
- **Fighter positioning and scaling:**
  - Scale: 1.35 (198px × 224px character images)
  - Left fighter: 19% from left edge
  - Right fighter: 81% from left edge
  - Bottom position: 5% from bottom
  - Transform: translateX(-50%) centers fighters on their position

### Victory Screen Improvements
- **Winner nameplate:**
  - Text centered when scaled up (textAlign: center)
  - Nameplate moves to 50% and scales to 1.3x
  - Loser nameplate and VS display fade out
- **Claim loot button:**
  - Now updates after `heroEliminated` flag is set
  - Ensures button appears on victory screen in hero mode

### Loot System Cleanup
- Removed fade effect on loot container after claiming
- Only chest, shadow, and button hide after claim
- Sidebar headers remain fully visible

### Technical Implementation
- Helmet image path: `/images/Loot Items/Loot_helmet_test.png`
- Helmet animations: `helmetWiggle` (1s) and `helmetGlow` (2s)
- Popup chest click handler in `initLootClaimDevFrame()`
- `revealHelmet()` checks current mode claim state
- Toggle handler updates loot box only if not claimed in that mode
- Loot box visibility restored on toggle switch if not claimed

---

## Recent Changes (2025-10-03 - Session 2)

### Fullscreen Battlefield Mode
- **NEW FEATURE:** Fullscreen mode for battlefield
  - Fullscreen button (⛶) in bottom-right view grid
  - Expands battlefield to fill entire phone preview window
  - Gold circular X button (35px) appears in top-right to exit fullscreen
  - Contained within `.container` using `position: relative`
  - `overflow: hidden` prevents overflow outside phone frame
- **Fullscreen-specific adjustments (no changes to normal mode):**
  - HP bars moved 40% further from center (translateX -40%/+40%)
  - Knights positioned at bottom: -10% (previously -15%)
  - Knight sprites scaled to 0.92
  - All adjustments only apply when `.battlefield-section.fullscreen` class is active

### Control Grid Improvements
- **Bottom-Left Section sizing:** 90% width, 85% height (from 70%/70%)
  - Better button proportions and visibility
  - EXIT button spans full height (grid-row: 1/3, grid-column: 1)
  - Settings (⚙️), Audio (🔊) buttons properly sized
- **Toggle Switch Redesign:** Professional iOS-style appearance
  - Track: 80% width, 60% height with rounded corners (20px)
  - Gradient background: Dark gray (#555 to #333) when off
  - Gradient background: Red (#e74c3c to #c0392b) when on
  - Circle slider: 50% width, rounded (border-radius: 50%)
  - Smooth cubic-bezier transition (0.4s)
  - Inset shadow for depth, outer glow when active

### Lady Luck System Updates
- **Name Change:** "Lady By-Chance" → "Lady Luck"
- **Announcer Messages:**
  - Center battlefield text: "✨ LADY LUCK VISITS YOU! ✨"
  - Subtitle: "You get a bye and a free loot tier - lucky you!"
  - Chat message: "✨ LADY LUCK VISITS YOU! ✨"
  - Chat message: "🍀 You get a bye and a free loot tier - lucky you! 🍀"
- **Nameplate:** Title remains "Bringer of Fortune"

### UI Control Grid Redesign
- **Bottom-Left Section:** Converted to 2x2 control grid (green stone background)
  - Top-left: Settings button (⚙️) - placeholder for future settings panel
  - Top-right: Audio/mute button (🔊) - moved from bottom-right
  - Bottom-left: EXIT button (gold shimmer, spans 2 rows)
  - Bottom-right: Daring Hero toggle switch (professional iOS-style)
- **Bottom-Right Section:** Converted to 2x2 view grid (yellow stone background)
  - Top-left: LIVE CHAT button (simplified text)
  - Top-right: BRACKET button (simplified text)
  - Bottom-left: Fullscreen button (⛶) - toggles fullscreen battlefield mode
  - Bottom-right: Shield button (🛡️) - gold gradient background

### Loot Chest UI Fixes
- Fixed main chest position (bottom of container with 5px padding)
- Claim button positioning: `bottom: 400px` for correct placement above chest
- Claim button sizing: 1.4rem font, 16px 40px padding (increased for better visibility)
- Fixed chest horizontal flip (only chest image flipped, not shadow)
- Reduced popup chest sizes by 20%:
  - `.popup-treasure-chest`: 0.65 → 0.52
  - `.dev-treasure-chest`: 1.4 → 1.12
- Bracket overlay close button: Changed from red (#ff4444) to black (#000)

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
- Lady Luck styling: `.lady-bye-chance` class with green theme (class name not updated)
- Nameplate animation: `.nameplate-vs-container.visible` class triggers slide-up
- Fighter opacity must be set to '0' before updateMatchDisplay() to prevent glitches
- **Fullscreen containment:** `.container` requires `position: relative` for absolute fullscreen to stay within bounds
- **Grid positioning:** EXIT button uses explicit `grid-column: 1` and `grid-row: 1/3` to span full height

### Previous Changes (Earlier 2025-10-01)
- Added stone texture backgrounds to UI windows
- Added vignette depth effects to textured windows and battlefield
- Redesigned tournament progress bar as tab-styled components
- Added gradient borders to HP bars
- Fixed duplicate RNGArena instances causing 2-4 simultaneous combat actions

---

## Key File Locations (Updated 2025-10-03)

### Fullscreen Implementation
- **HTML:** `index.html` line 33 - Fullscreen close button
- **CSS:** `styles.css` lines 428-456 - Fullscreen styles and adjustments
- **JavaScript:** `js/RNGArena.js` lines 1392-1405 - Fullscreen toggle handlers

### Toggle Switch Styling
- **CSS:** `styles.css` lines 599-619 - Professional iOS-style toggle
- **HTML:** `index.html` lines 121-125 - Toggle structure

### Lady Luck Messages
- **JavaScript:** `js/RNGArena.js` line 470 - Battlefield announcer text
- **JavaScript:** `js/RNGArena.js` lines 492-493 - Chat messages

---
*Last updated: 2025-10-03 Session 3*
