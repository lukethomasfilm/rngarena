# RNG Arena Dev Notes

## Latest Session - Character Positioning System Overhaul

### Major Changes

1. **View-Specific Positioning System**
   - Created `getCurrentView()` function to detect active view (regular/fullscreen/chat)
   - Built independent positioning config for each character across all three views
   - Located in `js/RNGArena.js` lines 1235-1426

2. **CSS Override Fixes**
   - Removed `.fighter-sprite` transform scale from CSS (was causing double scaling)
   - Removed container scaling from fullscreen and chat mode CSS
   - All scaling now handled exclusively in JavaScript with `!important`
   - Changed from `margin-top` to `position: relative` + `top` for reliable positioning

3. **Character Skin Bug Fix**
   - Fixed Nesta characters turning into green knights
   - Problem: CombatSystem was reading truncated display names ("Baroness Wobble...")
   - Solution: Added `leftFighterFullName` and `rightFighterFullName` properties
   - Created `initializeFighterNames()` method in CombatSystem.js to store full names
   - Updated attack voice system to use full names for female character detection

### Current Character Positions (Regular View)

```javascript
const characterConfig = {
    athena:  { regular: {scale: 0.80, top: 10},   fullscreen: {scale: 1.08, top: 14},   chat: {scale: 0.45, top: 6} },
    nesta:   { regular: {scale: 1.01, top: 15},   fullscreen: {scale: 1.36, top: 20},   chat: {scale: 0.57, top: 8} },
    barb:    { regular: {scale: 0.92, top: 0},    fullscreen: {scale: 1.24, top: 0},    chat: {scale: 0.52, top: 0} },
    blue:    { regular: {scale: 0.92, top: -15},  fullscreen: {scale: 1.24, top: -20},  chat: {scale: 0.52, top: -8} },
    black:   { regular: {scale: 0.95, top: 5},    fullscreen: {scale: 1.28, top: 7},    chat: {scale: 0.53, top: 3} },
    brown:   { regular: {scale: 0.99, top: -15},  fullscreen: {scale: 1.34, top: 115},  chat: {scale: 0.56, top: 48} },
    red:     { regular: {scale: 0.97, top: -20},  fullscreen: {scale: 1.31, top: -27},  chat: {scale: 0.55, top: -11} },
    green:   { regular: {scale: 1.13, top: 10},   fullscreen: {scale: 1.53, top: 14},   chat: {scale: 0.64, top: 6} },
    default: { regular: {scale: 0.80, top: 0},    fullscreen: {scale: 1.08, top: 0},    chat: {scale: 0.45, top: 0} }
};
```

### Characters Confirmed Good (Regular View)
- Athena
- Nesta
- Barb
- Blue
- Black
- Green
- Red

### Still Need Testing
- Brown (just adjusted from +85px to -15px in regular view)
- Fullscreen view for all characters
- Chat mode for all characters

### Character Skin Distribution
- **Female (25 total):** 50/50 split
  - Athena skin: 13 fighters
  - Nesta skin: 13 fighters
- **Male (75 total):** Unequal distribution
  - Green Knight: 20 fighters
  - Barb: 21 fighters
  - Black Knight: 16 fighters
  - Red Knight: 17 fighters
  - Brown Knight: 16 fighters
  - Blue Knight: 16 fighters

### Files Modified
- `js/RNGArena.js` - Added getCurrentView(), view-specific positioning configs
- `js/CombatSystem.js` - Added full name tracking for skin lookups
- `styles.css` - Removed transform from .fighter-sprite, removed container scaling

### Next Steps
- Test fullscreen view positioning for all characters
- Test chat mode positioning for all characters
- Fine-tune any characters that need adjustment in different views
- Update brown knight fullscreen and chat values if needed
