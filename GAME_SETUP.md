# RNG Arena - Game Setup Documentation

## Architecture Overview

The game is now structured with a **session-based** architecture ready for multi-screen navigation.

### Core Systems

```
┌─────────────────────────────────────────────────┐
│                  GameManager                    │
│  (Session state, navigation, currency)          │
└──────────────┬──────────────────────────────────┘
               │
       ┌───────┴───────┐
       ▼               ▼
  Navigation      Player Session
  ┌──────────┐   ┌────────────────┐
  │ Home     │   │ Stats          │
  │ Castle   │   │ Gold/Gems      │
  │ Map      │   │ Current Run    │
  │ PVE      │   └────────────────┘
  └──────────┘
```

## Files & Responsibilities

### GameManager.js (NEW)
**Purpose:** Central controller for game state and navigation

**Key Features:**
- Screen navigation (home → castle → map → PVE tournament)
- Session statistics tracking (tournaments played/won, battles, crits)
- Currency management (gold/gems awarded and tracked)
- Tournament run state (current progress, completion tracking)

**Usage:**
```javascript
import { GameManager } from './js/GameManager.js';

const gameManager = new GameManager();

// Navigate between screens
gameManager.navigateTo('home');
gameManager.navigateTo('pve-tournament');

// Award currency
gameManager.awardCurrency('gold', 500);

// Update stats
gameManager.updateStats('battlesWon', 1);
gameManager.updateStats('criticalHits', 1);

// Start/complete tournaments
gameManager.startPVETournament();
gameManager.completePVETournament(won, roundReached);
```

### constants.js (UPDATED)
**New Additions:**
- `ECONOMY_CONFIG`: Gold rewards, battle bonuses, starting values
- `SCREENS`: Navigation screen IDs

**Economy Values:**
```javascript
TOURNAMENT_REWARDS: {
  ROUND_1: 100,   // Wood chest
  ROUND_2: 200,   // Stone chest
  ROUND_3: 300,   // Copper chest
  ROUND_4: 400,   // Bronze chest
  ROUND_5: 500,   // Silver chest (Quarterfinals)
  ROUND_6: 750,   // Gold chest (Semifinals)
  ROUND_7: 1000,  // Diamond chest (Final)
  ROUND_8: 2000   // Platinum chest (Champion)
}
```

## Current Game Screens

### 1. **PVE Tournament** (COMPLETE ✅)
- **File:** Current `index.html` + `RNGArena.js`
- **Status:** Production-ready, fully polished
- **Features:** 8-round tournament, loot system, combat animations

### 2. **Home Screen** (TO BUILD)
- Main menu / landing page
- Buttons: "Play Tournament", "Castle", "Map", "Settings"
- Display session stats and gold

### 3. **Castle / Rewards Area** (TO BUILD)
- View collected loot
- Spend gold on upgrades
- Character/skin selection

### 4. **Map / Battle Selection** (TO BUILD)
- Visual map of available battles
- Select difficulty / tournament type
- Preview rewards

## Integration Pattern

### Step 1: Create Screen HTML Structure
Each screen should be a container div:

```html
<!-- Home Screen -->
<div id="home-screen" class="game-screen">
  <h1>RNG Arena</h1>
  <button onclick="gameManager.navigateTo('map')">Enter Map</button>
</div>

<!-- Map Screen -->
<div id="map-screen" class="game-screen" style="display: none;">
  <h1>Battle Map</h1>
  <button onclick="gameManager.startPVETournament()">Start Tournament</button>
</div>

<!-- PVE Tournament Screen -->
<div id="pve-tournament-screen" class="game-screen" style="display: none;">
  <!-- Current RNGArena content goes here -->
</div>
```

### Step 2: Initialize GameManager
```javascript
// In main initialization
import { GameManager } from './js/GameManager.js';
window.gameManager = new GameManager();

// Start at home screen
gameManager.navigateTo('home');
```

### Step 3: Hook Tournament Completion
In `RNGArena.js`, when tournament completes:

```javascript
// After tournament victory
const roundReached = this.tournament.getRoundInfo().current;
window.gameManager.completePVETournament(true, roundReached);

// Award gold based on round
const goldReward = ECONOMY_CONFIG.TOURNAMENT_REWARDS[`ROUND_${roundReached}`];
window.gameManager.awardCurrency('gold', goldReward);
```

## Session Data (Resets on Refresh)

**Player Session Structure:**
```javascript
{
  name: 'Adventurer',
  sessionStats: {
    tournamentsPlayed: 0,
    tournamentsWon: 0,
    battlesWon: 0,
    criticalHits: 0
  },
  sessionCurrency: {
    gold: 0,
    gems: 0
  },
  currentRun: {
    startTime: timestamp,
    round: 1,
    maxRound: 1,
    isComplete: false
  }
}
```

## Next Steps for Development

### Immediate (Before Home Screen):
- [x] GameManager created
- [x] Economy constants defined
- [x] Navigation system ready

### Home Screen Development:
1. Create `home-screen` HTML/CSS
2. Add navigation buttons
3. Display session stats (gold, tournaments won)
4. "Start Tournament" button → `gameManager.navigateTo('pve-tournament')`

### Castle Development:
1. Create `castle-screen` HTML/CSS
2. Display collected loot items
3. Show available upgrades
4. Gold spending system

### Map Development:
1. Create `map-screen` HTML/CSS
2. Visual map with tournament nodes
3. Difficulty selection
4. Reward preview

## Demo Mode (Current State)

Since we're in demo mode with session-only saves:
- **All progress resets on page refresh** ✅
- **Stats tracked during current session only** ✅
- **Currency earned but not persistent** ✅
- **Perfect for testing and iteration** ✅

When ready for production, we can easily add:
- LocalStorage persistence
- Cloud saves with backend API
- Leaderboards and social features

---

**Status:** Foundation complete, ready to build Home → Castle → Map screens! 🎮
