/**
 * GameManager - Handles game state, navigation, and session management
 * Session-based: Resets on page refresh (no persistent saves)
 */
export class GameManager {
    constructor() {
        // Current game state
        this.currentScreen = 'home'; // 'home', 'castle', 'map', 'pvp', 'tournament'

        // Player session data (resets on refresh)
        this.player = {
            name: 'Adventurer',
            sessionStats: {
                tournamentsPlayed: 0,
                tournamentsWon: 0,
                battlesWon: 0,
                criticalHits: 0
            },
            sessionCurrency: {
                gold: 10000,
                gems: 120
            },
            currentRun: null // Active tournament data if in progress
        };

        // Game screens/views
        this.screens = {
            home: null,
            castle: null,
            map: null,
            pvpTournament: null
        };

        console.log('🎮 GameManager initialized - Session started');
    }

    /**
     * Navigate to a different screen
     */
    navigateTo(screenName) {
        console.log(`🎮 Navigating from ${this.currentScreen} to ${screenName}`);

        // Hide current screen
        this.hideScreen(this.currentScreen);

        // Show new screen
        this.showScreen(screenName);

        this.currentScreen = screenName;
    }

    /**
     * Show a screen
     */
    showScreen(screenName) {
        const screen = document.getElementById(`${screenName}-screen`);
        if (screen) {
            screen.style.display = 'block';
            console.log(`✅ Showing ${screenName} screen`);
        } else {
            console.warn(`⚠️ Screen not found: ${screenName}`);
        }
    }

    /**
     * Hide a screen
     */
    hideScreen(screenName) {
        const screen = document.getElementById(`${screenName}-screen`);
        if (screen) {
            screen.style.display = 'none';
            console.log(`✅ Hiding ${screenName} screen`);
        }
    }

    /**
     * Award currency to player
     */
    awardCurrency(type, amount) {
        if (this.player.sessionCurrency[type] !== undefined) {
            this.player.sessionCurrency[type] += amount;
            console.log(`💰 Awarded ${amount} ${type} (Total: ${this.player.sessionCurrency[type]})`);
            return true;
        }
        return false;
    }

    /**
     * Update session stats
     */
    updateStats(statName, value) {
        if (this.player.sessionStats[statName] !== undefined) {
            this.player.sessionStats[statName] += value;
            console.log(`📊 ${statName}: ${this.player.sessionStats[statName]}`);
        }
    }

    /**
     * Start PVP tournament
     */
    startPVPTournament() {
        this.player.currentRun = {
            startTime: Date.now(),
            round: 1,
            maxRound: 1,
            isComplete: false
        };
        this.updateStats('tournamentsPlayed', 1);
        this.navigateTo('tournament');
    }

    /**
     * Complete PVP tournament
     */
    completePVPTournament(won, roundReached) {
        if (!this.player.currentRun) return;

        this.player.currentRun.isComplete = true;
        this.player.currentRun.maxRound = roundReached;

        if (won) {
            this.updateStats('tournamentsWon', 1);
            // Award gold based on round reached
            const goldReward = roundReached * 100;
            this.awardCurrency('gold', goldReward);
        }

        this.player.currentRun = null;
    }

    /**
     * Get current screen name
     */
    getCurrentScreen() {
        return this.currentScreen;
    }

    /**
     * Get player stats summary
     */
    getPlayerStats() {
        return {
            ...this.player.sessionStats,
            gold: this.player.sessionCurrency.gold,
            gems: this.player.sessionCurrency.gems
        };
    }

    /**
     * Reset session (useful for demo)
     */
    resetSession() {
        console.log('🔄 Resetting game session...');
        this.player.sessionStats = {
            tournamentsPlayed: 0,
            tournamentsWon: 0,
            battlesWon: 0,
            criticalHits: 0
        };
        this.player.sessionCurrency = {
            gold: 10000,
            gems: 120
        };
        this.player.currentRun = null;
        this.navigateTo('home');
    }
}
