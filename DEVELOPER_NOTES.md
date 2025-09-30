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

### Starting Development
```bash
# 1. Pull latest from main
git pull origin main

# 2. Create feature branch
git checkout -b feature/home-screen

# 3. Make changes (follow architecture principles)

# 4. Test thoroughly
# Open index.html in browser, test all features

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

**Last Updated:** 2025-09-30
**Next Review:** When adding 3+ new systems or before major feature
