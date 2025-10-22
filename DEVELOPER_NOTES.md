# 🎮 RNG Arena - Developer Notes

**Last Updated:** 2025-09-30
**Architecture:** Component-Based Modular System
**Status:** Production-Ready Foundation

---

## 📐 Architecture Philosophy

### Core Principle: Separation of Concerns
**Each system has ONE responsibility. No mixing of concerns.**

```
┌─────────────────────────────────────┐
│         RNGArena.js                 │
│      (Main Controller)              │
│  - Coordinates all systems          │
│  - Handles game flow               │
└──────────┬──────────────────────────┘
           │
    ┌──────┴──────┐
    │   Systems   │
    └──────┬──────┘
           │
    ┌──────┼──────┬──────┬──────┬──────┐
    │      │      │      │      │      │
    v      v      v      v      v      v
 Chat  Emoji  Loot Combat Bracket Tournament
System System System System System   System
```

### Design Rules (MUST FOLLOW)

1. **One System = One Responsibility**
   - ChatSystem handles ONLY chat/messages
   - CombatSystem handles ONLY battle mechanics
   - Never mix concerns (e.g., don't put chat code in CombatSystem)

2. **Systems Don't Talk Directly**
   - ❌ `CombatSystem` calling `ChatSystem.addMessage()`
   - ✅ `CombatSystem` calls callback → `RNGArena` routes to `ChatSystem`
   - Controller (RNGArena) coordinates all systems

3. **Constants Over Magic Numbers**
   - ❌ `if (damage === 7)` ← What's 7?
   - ✅ `if (damage === GAME_CONFIG.DAMAGE.CRITICAL)` ← Clear
   - All config in `constants.js`

4. **ES6 Modules Everywhere**
   - Every new file exports a class or constants
   - Import what you need, explicitly
   - No global variables (except window.arena for debugging)

5. **Clean File Structure**
   ```
   js/
   ├── constants.js        ← All config
   ├── [System]System.js   ← Individual systems
   └── RNGArena.js        ← Main controller
   ```

---

## 🏗️ Current Architecture

### System Breakdown

| System | Lines | Purpose | Key Methods |
|--------|-------|---------|-------------|
| **constants.js** | 231 | Config & magic numbers | N/A (exports only) |
| **ChatSystem.js** | 189 | Messages & announcements | `addChatMessage()`, `addAnnouncerMessage()` |
| **EmojiSystem.js** | 148 | Floating reactions | `spawnEmoji()`, `startEmojiReactions()` |
| **LootSystem.js** | 148 | Reward progression | `updateLootBox()`, `addVictoryGlow()` |
| **CombatSystem.js** | 507 | Turn-based battles | `startCombat()`, `executeCombatBeat()` |
| **BracketSystem.js** | 237 | Tournament display | `renderBracket()`, `scrollToCurrentMatch()` |
| **RNGArena.js** | 982 | Main orchestration | `startTournament()`, `startBattle()` |
| **tournament.js** | 512 | Tournament logic (unchanged) | `getCurrentMatch()`, `battleResult()` |

**Total: 2,954 lines** (was 6,467 before refactor)

---

## 🎯 The Refactoring Story

### What We Had (The Problem)
- **One massive file:** `script.js` with 2,644 lines
- **Spaghetti code:** Everything mixed together
- **Unmaintainable:** Can't find code, can't add features safely
- **Magic numbers:** Scattered throughout
- **No structure:** Ready to collapse under its own weight

### What We Did (The Solution)
1. ✅ Created backup branch (`backup-before-refactor`)
2. ✅ Identified 7 distinct responsibilities
3. ✅ Extracted each into its own module
4. ✅ Created constants.js for all config
5. ✅ Converted to ES6 module system
6. ✅ Removed dead code (`src/` directory)
7. ✅ Cleaned up console logs and magic numbers
8. ✅ Reduced codebase by 54% while maintaining functionality

### Why This Matters

**Before Refactor:**
```javascript
// Adding home screen = nightmare
// script.js is already 2,644 lines
// Where do you even put the code?
// Risk breaking everything
```

**After Refactor:**
```javascript
// Create js/HomeScreen.js (~200 lines)
// Import it in RNGArena.js
// Clean, isolated, testable
// Zero risk to existing systems
```

---

## 🚀 Adding New Features (The Process)

### Step-by-Step Guide

#### 1. **Plan the Feature**
- What is its single responsibility?
- Does it need a new system or extend existing?
- What config values does it need?

#### 2. **Add Constants First**
```javascript
// js/constants.js
export const HOME_SCREEN_CONFIG = {
    FADE_DURATION: 500,
    BUTTON_COLORS: {
        play: '#FFD700',
        settings: '#4CAF50'
    }
};
```

#### 3. **Create the System**
```javascript
// js/HomeScreen.js
import { HOME_SCREEN_CONFIG } from './constants.js';

export class HomeScreen {
    constructor(containerElement) {
        this.container = containerElement;
        this.isVisible = true;
    }

    show() {
        // Implementation
    }

    hide() {
        // Implementation
    }

    onPlayClick(callback) {
        // Register callback
        this.playCallback = callback;
    }
}
```

#### 4. **Integrate in RNGArena**
```javascript
// js/RNGArena.js
import { HomeScreen } from './HomeScreen.js';

constructor() {
    // ... existing systems
    this.homeScreen = new HomeScreen(homeElement);
    this.homeScreen.onPlayClick(() => this.startTournament());
}
```

#### 5. **Test Independently**
- Test the system in isolation first
- Then test integration with RNGArena
- Ensure no breaking changes to existing features

---

## 📋 Code Style Guide

### Naming Conventions
```javascript
// Classes: PascalCase
class ChatSystem { }

// Files: Match class name
ChatSystem.js

// Constants: UPPER_SNAKE_CASE
const MAX_HP = 20;

// Config Objects: UPPER_SNAKE_CASE
export const GAME_CONFIG = { };

// Methods: camelCase
addChatMessage() { }

// Private methods: _camelCase (convention)
_calculateDamage() { }

// Callbacks: onEventName
onCombatEnd(leftWins) { }
```

### File Structure Template
```javascript
// 1. Imports
import { CONSTANTS } from './constants.js';
import { OtherSystem } from './OtherSystem.js';

// 2. Class definition
/**
 * SystemName - Brief description
 */
export class SystemName {
    // 3. Constructor
    constructor(dependencies) {
        this.dependencies = dependencies;
        this.state = {};
    }

    // 4. Public methods (interface)
    publicMethod() {
        // Implementation
    }

    // 5. Private methods (helpers)
    _privateHelper() {
        // Implementation
    }

    // 6. Callbacks (optional)
    setCallback(callback) {
        this.callback = callback;
    }
}
```

### Comments Policy
```javascript
// ✅ Good: Explain WHY, not WHAT
// Calculate seed from fighter names for reproducible battles
const seed = this.generateSeed();

// ✅ Good: Document complex logic
// Linear interpolation: Round 1 = 1000ms, Round 8 = 100ms
const rate = minRate - (progress * (minRate - maxRate));

// ❌ Bad: Obvious what code does
// Set the value to 5
const maxHP = 5;

// ❌ Bad: Commented-out code (delete it, use git if you need it back)
// this.oldMethod();
```

---

## 🔧 Development Workflow

### Testing & Running Locally
```bash
# IMPORTANT: Use npm run dev (Vite dev server)
npm run dev

# Vite will automatically open browser to:
# http://localhost:8000
```

### Starting Development
```bash
# 1. Pull latest from main
git pull origin main

# 2. Create feature branch
git checkout -b feature/home-screen

# 3. Make changes (follow architecture principles)

# 4. Test thoroughly
# Run dev server: npm run dev
# Vite opens browser automatically, test all features

# 5. Commit with descriptive message
git add -A
git commit -m "Add home screen system with fade transitions"

# 6. Push and create PR
git push origin feature/home-screen
```

### Testing Checklist
Before committing any feature:
- [ ] Tournament starts successfully
- [ ] Combat works (attack, block, parry)
- [ ] Chat messages appear
- [ ] Emojis spawn correctly
- [ ] Loot progresses through tiers
- [ ] Bracket renders and scrolls
- [ ] No console errors
- [ ] Mobile responsive (if applicable)

---

## 🎨 Adding New Systems (Examples)

### Example 1: Home Screen
```javascript
// js/HomeScreen.js
export class HomeScreen {
    constructor() {
        this.element = document.getElementById('home-screen');
    }

    show() {
        this.element.style.display = 'flex';
    }

    hide() {
        this.element.style.display = 'none';
    }
}

// In RNGArena.js
import { HomeScreen } from './HomeScreen.js';

constructor() {
    this.homeScreen = new HomeScreen();
    this.homeScreen.show(); // Show on load
}

startTournament() {
    this.homeScreen.hide(); // Hide when starting
    // ... existing tournament start code
}
```

### Example 2: Leaderboard System
```javascript
// js/LeaderboardSystem.js
export class LeaderboardSystem {
    constructor() {
        this.scores = [];
    }

    addScore(playerName, round, timestamp) {
        this.scores.push({ playerName, round, timestamp });
        this.sort();
    }

    getTopTen() {
        return this.scores.slice(0, 10);
    }

    sort() {
        this.scores.sort((a, b) => b.round - a.round);
    }
}

// In RNGArena.js
import { LeaderboardSystem } from './LeaderboardSystem.js';

constructor() {
    this.leaderboard = new LeaderboardSystem();
}

handleTournamentEnd(winner, round) {
    this.leaderboard.addScore(winner, round, Date.now());
}
```

### Example 3: Settings System
```javascript
// js/SettingsSystem.js
export class SettingsSystem {
    constructor() {
        this.settings = this.loadFromLocalStorage();
    }

    setSetting(key, value) {
        this.settings[key] = value;
        this.saveToLocalStorage();
    }

    getSetting(key, defaultValue) {
        return this.settings[key] ?? defaultValue;
    }

    loadFromLocalStorage() {
        const stored = localStorage.getItem('rng-arena-settings');
        return stored ? JSON.parse(stored) : {};
    }

    saveToLocalStorage() {
        localStorage.setItem('rng-arena-settings', JSON.stringify(this.settings));
    }
}
```

---

## 🐛 Debugging Tips

### Console Access
```javascript
// In index.html, we expose arena to window
window.arena = arena;

// In browser console:
arena.chat.addChatMessage("Test message");
arena.combat.leftFighterHP = 1; // Manual HP adjustment
arena.lootSystem.setMaxTier(); // Jump to gold chest
```

### Common Issues

**Issue: "Module not found"**
```
Solution: Check import paths are correct
- Use relative paths: './ChatSystem.js'
- Must include .js extension
- Case-sensitive on some systems
```

**Issue: "Uncaught ReferenceError"**
```
Solution: System not initialized in RNGArena
- Check constructor initializes all systems
- Verify import statement exists
```

**Issue: Changes not reflected**
```
Solution: Browser caching
- Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
- Or open DevTools → Disable cache
```

---

## 📊 Performance Considerations

### Current Optimizations
- ✅ Emoji animations use CSS transforms (GPU accelerated)
- ✅ Bracket rendering only updates on change
- ✅ Combat uses seeded RNG (reproducible, no server calls)
- ✅ Chat messages limited to 100 (memory management)

### Future Optimizations (When Needed)
- [ ] Virtual scrolling for large brackets
- [ ] Lazy load character images
- [ ] Web Workers for combat calculations
- [ ] Service Worker for offline play (PWA)

**Don't Optimize Early**
> "Premature optimization is the root of all evil" - Donald Knuth

Only optimize when you measure actual performance issues.

---

## 🔐 Git Workflow & Safety

### Branch Strategy
```
main            ← Production-ready code
  ├─ feature/*  ← New features
  ├─ fix/*      ← Bug fixes
  └─ refactor/* ← Code improvements
```

### Safety Net
```bash
# Before ANY major refactor:
git checkout -b backup-before-[feature-name]
git commit -m "Backup before [feature-name]"
git checkout main

# If things go wrong:
git checkout backup-before-[feature-name]
```

### Commit Message Format
```
Type: Brief description (50 chars max)

- Bullet points of what changed
- Why it changed
- Any breaking changes

Examples:
✅ "Add home screen system with fade transitions"
✅ "Fix: Combat crash when HP reaches exactly 0"
✅ "Refactor: Extract settings to SettingsSystem"
```

---

## 📚 Learning Resources

### JavaScript/ES6 Modules
- [MDN: JavaScript Modules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules)
- [ES6 Import/Export](https://javascript.info/import-export)

### Architecture Patterns
- Component-Based Architecture
- Separation of Concerns
- MVC/MVVM patterns (RNGArena is the Controller)

### Game Development
- Entity-Component-System (ECS) patterns
- State management in games
- Event-driven architecture

---

## 🎯 Roadmap & Future Systems

### Planned Features (Easy to Add Now)
1. **HomeScreen.js** - Main menu, play button, settings access
2. **CustomizationSystem.js** - Character skins, colors, unlockables
3. **DailyTournamentSystem.js** - Seeded daily challenges
4. **LeaderboardSystem.js** - Local/online rankings
5. **SettingsSystem.js** - Sound, graphics, controls
6. **AchievementSystem.js** - Unlock tracking, notifications
7. **ProfileSystem.js** - Player stats, history
8. **SocialSystem.js** - Share results, friend challenges

### Each New System Should:
- ✅ Be in its own file (`js/SystemName.js`)
- ✅ Import what it needs from constants.js
- ✅ Export a single class
- ✅ Have a clear, single responsibility
- ✅ Integrate via RNGArena (not directly with other systems)
- ✅ Be testable in isolation

---

## 🚨 CRITICAL: PVE MODE PROTECTION

### **⚠️ WARNING: DO NOT MODIFY PVE CODE WITHOUT EXPLICIT REVIEW ⚠️**

**The PVE tournament system is PRODUCTION-READY and fully tested. Any changes to home screen navigation, GameManager, or related systems MUST NOT affect PVE functionality.**

#### Protected PVE Components:
- `js/RNGArena.js` - Core PVE battle system
  - Lines 1232-1785: `startBattle()`, `handleByeRound()`, `fighterEntrance()`, `executeFight()`
  - **DO NOT MODIFY** battle flow, timing, or transition logic without explicit testing

- `tournament.js` - Tournament bracket logic
  - **DO NOT MODIFY** bracket generation, match advancement, or bye round handling

- `js/CombatSystem.js` - Combat mechanics
  - **DO NOT MODIFY** turn-based combat, damage calculations, or victory conditions

- `styles.css` - PVE animations and transitions
  - Lines 887-905: Chat gradient (carefully tuned)
  - **DO NOT MODIFY** fighter entrance/exit animations, fade-to-black transitions, or combat effects

#### **What Happens If You Break PVE Code:**

**🔴 BREAKING PVE WILL CAUSE:**
- **Invisible fighters** during entrance animations
- **Flash/glitch effects** between rounds
- **Tournament progression failures** (rounds not advancing)
- **Bye round crashes** or infinite loops
- **Victory screen failures** (black screen, no winner display)
- **Chat mode desync** between battlefield and live chat
- **Fighter positioning bugs** (overlapping, wrong sides)
- **Audio/timing desync** during transitions

#### Safe Development Rules:

✅ **SAFE:** Adding new home screen features in isolated components
✅ **SAFE:** Creating new navigation screens (PVP, Settings, etc.)
✅ **SAFE:** Adding new CSS classes for home screen elements
✅ **SAFE:** Modifying `GameManager.js` screen switching logic (with testing)

❌ **DANGEROUS:** Changing `RNGArena.js` battle timing constants
❌ **DANGEROUS:** Modifying fighter entrance/exit animations
❌ **DANGEROUS:** Altering tournament bracket structure
❌ **DANGEROUS:** Changing fade-to-black overlay behavior
❌ **DANGEROUS:** Modifying null checks on `this.startButton` or fighter elements

#### Testing Requirements Before Touching PVE:

**If you MUST modify any PVE-related code, you MUST test:**
1. ✅ Full tournament from Round 1 to Finals
2. ✅ Bye rounds (natural tournament byes, not forced)
3. ✅ Victory screen displays correctly
4. ✅ All transitions are smooth (no flashing/glitching)
5. ✅ Live chat mode stays in sync
6. ✅ Fighters are visible during all entrance animations
7. ✅ No console errors
8. ✅ Auto-continue works through entire tournament
9. ✅ Home screen navigation doesn't break PVE state

#### Emergency Rollback:

**If PVE breaks after a change:**
```bash
# Check git log to find last working commit
git log --oneline

# Revert to last stable PVE commit
git checkout <commit-hash> -- js/RNGArena.js tournament.js styles.css

# Test PVE works
# Then carefully reapply home screen changes WITHOUT touching PVE code
```

---

## 🚨 Things to NEVER Do

### ❌ DON'T: Mix Concerns
```javascript
// ❌ BAD: Combat system sending chat messages directly
class CombatSystem {
    handleHit() {
        // ...
        ChatSystem.addMessage("Hit!"); // NO!
    }
}

// ✅ GOOD: Use callbacks
class CombatSystem {
    handleHit() {
        // ...
        if (this.onMessage) {
            this.onMessage("Hit!");
        }
    }
}

// RNGArena wires it up:
this.combat.onMessage = (msg) => this.chat.addMessage(msg);
```

### ❌ DON'T: Add to Global Scope
```javascript
// ❌ BAD
window.myGlobalFunction = () => { };

// ✅ GOOD: Keep in modules
export function myFunction() { }
```

### ❌ DON'T: Use Magic Numbers
```javascript
// ❌ BAD
if (attackRoll === 5) { }

// ✅ GOOD
if (attackRoll === GAME_CONFIG.CRIT_THRESHOLD) { }
```

### ❌ DON'T: Create Giant Files
```javascript
// If a file exceeds ~500 lines, consider splitting it
// Example: CombatSystem.js is 507 lines - borderline
// If it grows more, split into:
// - CombatSystem.js (core)
// - CombatAnimations.js (visual effects)
// - CombatCalculations.js (damage, HP logic)
```

---

## ✅ Code Review Checklist

Before merging any PR:
- [ ] Follows architecture principles (separation of concerns)
- [ ] No magic numbers (uses constants.js)
- [ ] ES6 module imports/exports correct
- [ ] No console.log in production code
- [ ] Descriptive variable/function names
- [ ] Comments explain WHY not WHAT
- [ ] No code duplication
- [ ] Tested in browser (all features work)
- [ ] No console errors
- [ ] Mobile responsive (if UI changes)
- [ ] Git commit messages are clear
- [ ] No merge conflicts

---

## 🎓 Key Takeaways

1. **Systems are independent** - Change one without breaking others
2. **RNGArena coordinates** - It's the conductor of the orchestra
3. **Constants centralize config** - One place to change game parameters
4. **ES6 modules = modern** - Explicit dependencies, tree-shaking, clean
5. **Test in isolation** - Each system can be tested independently
6. **Git is your safety net** - Backup branches before big changes
7. **Clean code > clever code** - Readable, maintainable, obvious

---

## 🤝 Contributing Guidelines

### For New Developers
1. Read this document completely
2. Explore existing systems to understand patterns
3. Start with small features (add a new chat message type)
4. Graduate to new systems (create LeaderboardSystem)
5. Always create backup branches before refactoring
6. Ask questions before duplicating code

### For Designer/Config Changes
1. Edit `js/constants.js` for game balance changes
2. Edit `styles.css` for visual changes
3. Test in browser after changes
4. Commit with descriptive messages

---

**Remember:** This architecture took us from prototype to production-ready. Maintain these standards as the game grows.

---

## 🆕 Recent Additions (2025-10-03)

### Live Chat Mode System
**Purpose:** Mobile vertical preview with real-time battlefield syncing for demo purposes

**Architecture:**
```javascript
// Chat mode lifecycle:
1. Click LIVE CHAT button
2. Phone frame (844×390 landscape) appears over dev-frame
3. Battlefield clones and syncs every 500ms
4. After 1s: Dev-frame rotates -90°, phone layout switches to portrait
5. User can type messages, view live battle
6. Click X: Everything rotates back, syncing stops
```

**Key Files:**
- `js/RNGArena.js` - `initChatModeBattlefield()`, `updateChatModeBattlefield()`, `initDevTabs()`
- `js/ChatSystem.js` - `addToChatMode()` for message syncing
- `styles.css` - Phone rotation animations, tab navigation
- `index.html` - Chat mode frame structure, dev tabs

**Performance Optimizations:**
- ✅ Only syncs when chat mode is visible (no background syncing)
- ✅ 500ms sync interval (was 100ms initially - reduced lag)
- ✅ All animations disabled on cloned battlefield
- ✅ Stops syncing immediately on close

**Important Constants:**
```javascript
// Battlefield scaling in chat mode
Active mode: scale = 828 / 588 = 1.408 (landscape)
Dev tab mode: scale = 300 / 280 = 1.071 (portrait)

// Phone dimensions
Landscape: 844×390 (initial state)
Portrait: 390×844 (after rotation)
```

### Tabbed Dev Frame Navigation
**Purpose:** Organize development preview windows (Bracket, Loot, Chat)

**Features:**
- Golden tab styling with active state
- Click to switch between preview frames
- Only one frame visible at a time
- Auto-switches to chat tab when opening live chat mode

**CSS Classes:**
```css
.dev-tab - Tab button styling
.dev-tab.active - Active tab (golden gradient)
.dev-frame-tab - Any tabbable frame
.dev-frame-tab.hidden - Hidden frames
```

### Victory Screen Fixes
**Z-Index Hierarchy (from back to front):**
1. Overlay background (z-index: 50)
2. VICTOR text (z-index: 10)
3. Victory nameplate (z-index: 20)
4. Winning knight (z-index: 30)

**Positioning:**
- Nameplate centered with `translate(-50%, -50%)`
- Victory screen works correctly in fullscreen mode
- All child elements forced to center alignment

### Chat Message Improvements
**Added 10 new long-form hype messages:**
- "I've been watching this tournament for 3 hours straight..."
- "My entire family is gathered around the screen..."
- More engaging, humorous chat atmosphere

**Added 5 new win messages and 4 combat messages**
- Builds excitement and immersion
- Located in `js/constants.js` - `CHAT_MESSAGES`

---

## 📝 Next Session TODO

### Known Issues
- [ ] None currently

### Potential Enhancements
- [ ] Add smooth transitions when switching dev tabs
- [ ] Consider adding chat history persistence
- [ ] Add ability to toggle auto-scroll in chat mode
- [ ] Optimize battlefield clone (use canvas instead of DOM clone?)

### Future Systems to Consider
- [ ] Replay System (record/playback tournament)
- [ ] Share/Screenshot feature for chat mode
- [ ] Mobile-specific optimizations
- [ ] PWA setup for installability

---

---

## 🐉 PVE SCREEN SYSTEM (2025-10-22)

**Timestamp:** 2025-10-22 12:05 AM
**Status:** Production-ready foundation for PVE battles

### Overview
Complete PVE screen implementation with battle map, 9 monster icons, navigation system, and placeholder battle handlers. Ready for tournament-style PVE battles against monsters.

---

### Architecture

#### Screen Structure
```
index.html
└── #pve-screen (game-screen)
    └── .pve-container
        ├── .pve-battle-map (background image)
        │   ├── 9x .pve-monster-btn (positioned icons)
        │   │   ├── #pve-wood-dummy
        │   │   ├── #pve-raccoon
        │   │   ├── #pve-goblin
        │   │   ├── #pve-ram
        │   │   ├── #pve-eagle
        │   │   ├── #pve-serpent
        │   │   ├── #pve-nymph
        │   │   ├── #pve-minitaur
        │   │   └── #pve-dragon (special boss styling)
        └── .pve-back-btn (returns to home)
```

#### File Changes

**index.html (lines 166-204)**
- New `#pve-screen` section
- Battle map container with background
- 9 positioned monster buttons with data attributes
- Back button for navigation

**styles.css (lines 6393-6524)**
- `.pve-container` - Full screen container
- `.pve-battle-map` - Background image (Battle-map.png, cover sizing)
- `.pve-monster-btn` - Circular buttons (80px) with golden glow
- `.pve-monster-btn:hover` - Scale 1.15, pulse animation, golden glow
- `#pve-dragon` - Special boss styling (100px, red glow)
- `.pve-back-btn` - Standard back button (matches store)
- `@keyframes pulse` - Glowing pulse effect on hover

**js/RNGArena.js**
- Line 305-309: PVE button navigation handler
- Line 454-460: PVE back button handler
- Line 462-470: Monster button click handlers
- Line 660-666: PVE screen audio handling in `navigateToScreen()`
- Line 691-706: `startMonsterBattle()` method (placeholder for future battles)

**js/GameManager.js**
- No changes needed - existing `navigateTo()` method handles 'pve' screen

---

### Monster Icon Positioning

Based on `RNG-Arena-Layout-filled.png` reference, icons positioned to match natural map layout:

| Monster | Position | Notes |
|---------|----------|-------|
| Wood Dummy | 5% left, 60% top | Tutorial/starter enemy |
| Raccoon | 13% left, 35% top | Early game |
| Goblin | 22% left, 75% top | Bottom left area |
| Ram | 35% left, 25% top | Upper center-left |
| Eagle | 45% left, 50% top | Central position |
| Serpent | 58% left, 30% top | Upper center-right |
| Nymph | 72% left, 60% top | Right side |
| Minitaur | 82% left, 35% top | Far right upper |
| Dragon | 88% left, 15% top | Final boss, top right corner |

**CSS Transform:** All buttons use `transform: translate(-50%, -50%)` to center icon on coordinates

---

### Styling System

#### Monster Button States

**Base State:**
```css
width: 80px;
height: 80px;
border: 3px solid rgba(255, 215, 0, 0.6); /* Golden */
background: radial-gradient(circle, rgba(255, 255, 255, 0.2) 0%, rgba(0, 0, 0, 0.3) 100%);
box-shadow: 0 4px 12px rgba(0, 0, 0, 0.6), 0 0 20px rgba(255, 215, 0, 0.3);
```

**Hover State:**
```css
transform: translate(-50%, -50%) scale(1.15);
border-color: #ffd700; /* Bright gold */
background: radial-gradient(circle, rgba(255, 255, 255, 0.3) 0%, rgba(255, 215, 0, 0.2) 100%);
animation: pulse 1.5s ease-in-out infinite;
```

**Dragon Boss (Special):**
```css
width: 100px; /* Larger than others */
height: 100px;
border-color: rgba(255, 50, 50, 0.8); /* Red border */
box-shadow: 0 0 25px rgba(255, 50, 50, 0.5); /* Red glow */
```

#### Pulse Animation
```css
@keyframes pulse {
    0%, 100% { box-shadow: ..., 0 0 30px rgba(255, 215, 0, 0.6), ...; }
    50% { box-shadow: ..., 0 0 40px rgba(255, 215, 0, 0.9), ...; }
}
```

---

### Navigation Flow

#### User Journey
```
Home Screen
    ↓ (click PVE button)
PVE Screen (battle map visible)
    ↓ (click monster icon)
Battle Alert ("Battle with [monster] coming soon!")
    ↓ (click BACK button)
Home Screen (music volume restored)
```

#### Audio Handling
```javascript
// PVE screen (in navigateToScreen)
if (screenName === 'pve') {
    // Keep home music playing softly
    if (!this.audioMuted && this.homeMusic) {
        this.homeMusic.volume = 0.3;
    }
}

// Home screen
if (screenName === 'home') {
    // Restore full volume
    if (!this.audioMuted && this.homeMusic) {
        this.homeMusic.volume = 1.0;
    }
}
```

---

### Battle System (Future Implementation)

#### Current Placeholder
```javascript
startMonsterBattle(monsterName) {
    console.log(`⚔️ Starting PVE battle with ${monsterName}`);
    alert(`Battle with ${monsterName} coming soon!\n\nThis will launch a tournament-style battle against this monster.`);
}
```

#### Planned Implementation
```javascript
startMonsterBattle(monsterName) {
    // 1. Create custom tournament with monster as opponent
    const monsterFighter = {
        name: monsterName,
        sprite: `/images/pve/${monsterName}.png`,
        stats: MONSTER_STATS[monsterName] // From constants.js
    };

    // 2. Set PVE mode flag
    this.isPVEMode = true;
    this.currentMonster = monsterFighter;

    // 3. Navigate to pvp-tournament screen (reuse existing system)
    this.navigateToScreen('pvp-tournament');

    // 4. CombatSystem will use monster sprite instead of knight
    // 5. Award PVE-specific rewards on victory
    // 6. Track PVE progress/unlocks
}
```

#### Integration Points
- **Tournament System:** Use existing bracket for 1v1 PVE battle
- **Combat System:** Replace right fighter sprite with monster icon
- **Loot System:** Award PVE-specific rewards (monster drops)
- **Progress Tracking:** Unlock higher-tier monsters after victories

---

### Assets

#### Battle Map
- **File:** `/images/pve/Battle-map.png`
- **Type:** Isometric fantasy landscape with lake, mountains, forests
- **Usage:** Full screen background (`background-size: cover`)

#### Monster Icons (9 total)
```
/images/pve/
├── wood-dummy.png    - Training dummy (starter)
├── raccoon.png       - Forest creature
├── goblin.png        - Goblin enemy
├── ram.png          - Mountain ram
├── eagle.png        - Flying enemy
├── serpent.png      - Snake/serpent
├── nymph.png        - Nature spirit
├── minitaur.png     - Minotaur/bull warrior
└── dragon.png       - Final boss
```

#### Layout Reference
- **File:** `/images/pve/RNG-Arena-Layout-filled.png`
- **Purpose:** Shows where each monster icon should be placed on map
- **Used for:** Positioning coordinates during implementation

---

### Battle Pass Dev Preview Fix

**Timestamp:** Same session (2025-10-22 12:05 AM)

**Issue:** Battle pass image extending beyond dev preview phone frame

**Solution:**
```css
/* styles.css lines 998-1007 */
.battlepass-dev-image {
    max-width: 90%;
    max-height: 30%;  /* Constrain very wide image */
    width: auto;
    height: auto;
    object-fit: contain;
}
```

**Why:** Battle pass image is extremely wide (horizontal banner). Changed from width-based to max-height constraint to prevent vertical overflow.

---

### Testing Checklist

Before marking PVE complete, verified:
- [x] PVE button navigates to PVE screen
- [x] Battle map displays correctly (full screen, centered)
- [x] All 9 monster icons positioned correctly per reference layout
- [x] Monster icons have golden glow effect
- [x] Dragon boss has red glow (special styling)
- [x] Hover effects work (scale, pulse animation)
- [x] Click handlers registered for all monsters
- [x] Alert appears when clicking monster
- [x] Back button returns to home screen
- [x] Home music volume adjusts correctly
- [x] No console errors
- [x] Battle pass preview fixed in dev frame

---

### Future Enhancements

#### Short Term
- [ ] Add monster stats to constants.js
- [ ] Implement actual PVE battles (reuse tournament system)
- [ ] Add monster health bars on battle map
- [ ] Lock higher-tier monsters (progressive unlocking)
- [ ] Add "LOCKED" overlay on inaccessible monsters

#### Medium Term
- [ ] Monster-specific combat animations
- [ ] PVE rewards system (monster drops, materials)
- [ ] Boss battle mechanics (special abilities)
- [ ] Victory rewards display after PVE battle
- [ ] Monster bestiary/info screen

#### Long Term
- [ ] Multiple difficulty tiers per monster
- [ ] Monster capture/collection system
- [ ] PVE campaign/story mode
- [ ] Daily PVE challenges
- [ ] Leaderboards for PVE speed runs

---

### Code Quality Notes

#### Follows Architecture Principles
- ✅ Separation of concerns (PVE screen isolated from PVP)
- ✅ Reuses existing navigation system (`navigateToScreen()`)
- ✅ No magic numbers (all dimensions explicit)
- ✅ Proper event handler cleanup on navigation
- ✅ Clear naming conventions (`pve-monster-btn`, `startMonsterBattle`)

#### Performance Considerations
- ✅ Single background image (no sprite sheets needed yet)
- ✅ CSS transforms for hover (GPU accelerated)
- ✅ No JavaScript animations (pure CSS)
- ✅ Minimal DOM elements (9 buttons + container)
- ✅ No active polling or timers in PVE screen

#### Maintainability
- ✅ All PVE styles in dedicated section (lines 6393-6524)
- ✅ All PVE HTML in one block (lines 166-204)
- ✅ Monster data attributes for future expansion (`data-monster="dragon"`)
- ✅ Placeholder method ready for battle implementation
- ✅ Comments explain future integration points

---

### Known Limitations

1. **No Monster Stats Yet**
   - Monsters don't have HP, attack, defense values
   - Will need `MONSTER_STATS` in constants.js

2. **No Progressive Unlocking**
   - All monsters clickable immediately
   - Should lock higher-tier monsters until earlier ones defeated

3. **No Visual Feedback**
   - No health bars or level indicators on map
   - Could add small HP badges above icons

4. **Placeholder Battle System**
   - Shows alert instead of launching battle
   - Needs integration with tournament/combat systems

5. **No PVE Progress Tracking**
   - No win/loss record for PVE
   - No unlocked monsters tracking
   - Could extend GameManager for PVE stats

---

### Git Commit Strategy

**Commit 1: Battle Pass Fix**
```bash
git add styles.css
git commit -m "Fix battle pass image sizing in dev preview

- Constrain max-height to 30% for very wide image
- Prevents vertical overflow in phone frame
- styles.css:998-1007"
```

**Commit 2: PVE Screen Implementation**
```bash
git add index.html styles.css js/RNGArena.js
git commit -m "Add PVE screen with battle map and 9 monster icons

- Create #pve-screen with battle map background
- Position 9 monsters per layout reference (wood-dummy to dragon)
- Golden circular buttons with hover effects and pulse animation
- Special red boss styling for dragon
- Link PVE button to navigate to screen
- Add back button and audio handling
- Placeholder startMonsterBattle() for future integration

Files modified:
- index.html: 166-204 (PVE screen HTML)
- styles.css: 6393-6524 (PVE styles)
- js/RNGArena.js: Multiple sections for navigation/handlers

🎮 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

**Last Updated:** 2025-10-22 12:05 AM
**Next Review:** When implementing actual PVE battle system
