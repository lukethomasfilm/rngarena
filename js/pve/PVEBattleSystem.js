import { getMonster } from './PVEMonsters.js';
import { CHARACTER_CONFIG } from '../constants.js';
import { PVECombatSystem } from './PVECombatSystem.js';

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * PVEBattleSystem - PVE Battle Management System
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * ARCHITECTURAL SEPARATION:
 * -------------------------
 * This class handles EXCLUSIVELY PVE battle functionality.
 * All DOM element references use pve- prefixed IDs.
 *
 * PVP System (COMPLETELY SEPARATE):
 * - Located in: js/RNGArena.js, js/CombatSystem.js
 * - Screen: #pvp-tournament-screen
 * - Elements: Generic classes (.fighter-left, .arena-viewport, etc.)
 *
 * CRITICAL RULES:
 * ---------------
 * 1. ALL PVE elements use pve- prefix:
 *    - #pve-battle-screen, #pve-screen
 *    - #pve-hero-sprite, #pve-monster-sprite
 *    - #pve-exit-game, #pve-fullscreen-btn, etc.
 *
 * 2. NEVER touch PVP elements (no pvp- prefix, generic classes)
 *
 * 3. PVE system is self-contained and independent
 *
 * 4. Use document.getElementById() for pve- prefixed IDs (safe)
 *    Use querySelector() ONLY within #pve-battle-screen or #pve-screen
 *
 * This separation prevents cross-contamination bugs where PVE code
 * accidentally manipulates PVP tournament elements or vice versa.
 * ═══════════════════════════════════════════════════════════════════════════
 */
export class PVEBattleSystem {
    constructor() {
        // Battle state
        this.currentMonster = null;
        this.hero = null;
        this.combat = null;
        this.battleActive = false;

        // UI Elements
        this.screen = document.getElementById('pve-battle-screen');
        this.viewport = document.getElementById('pve-arena-viewport');

        // HP Bars
        this.heroHPFill = document.getElementById('pve-hero-hp-fill');
        this.heroHPText = document.getElementById('pve-hero-hp-text');
        this.monsterHPFill = document.getElementById('pve-monster-hp-fill');
        this.monsterHPText = document.getElementById('pve-monster-hp-text');

        // Fighters
        this.heroSprite = document.getElementById('pve-hero-sprite');
        this.monsterSprite = document.getElementById('pve-monster-sprite');

        // Nameplates
        this.heroName = document.getElementById('pve-hero-name');
        this.monsterName = document.getElementById('pve-monster-name');
        this.heroTitles = document.getElementById('pve-hero-titles');
        this.monsterTitles = document.getElementById('pve-monster-titles');
        this.nameplateContainer = this.screen.querySelector('.nameplate-vs-container');

        // Battle status
        this.battleStatus = document.getElementById('pve-battle-status');
        this.roundAnnouncement = document.getElementById('pve-round-announcement');

        // Loot
        this.lootBox = document.getElementById('pve-loot-box');
        this.claimLootBtn = document.getElementById('pve-claim-loot-btn');

        // Controls
        this.exitBtn = document.getElementById('pve-exit-game');
        this.fastForwardBtn = document.getElementById('pve-fast-forward');
        this.mainViewBtn = document.getElementById('pve-main-view');
        this.fullscreenBtn = document.getElementById('pve-fullscreen-btn');

        // Battlefield section for fullscreen
        this.battlefieldSection = this.screen.querySelector('.battlefield-section');
        this.fullscreenCloseBtn = this.screen.querySelector('.battlefield-fullscreen-close');

        this.setupEventListeners();
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Exit button - return to PVE map
        if (this.exitBtn) {
            this.exitBtn.addEventListener('click', () => {
                this.exitBattle();
            });
        }

        // Claim loot button
        if (this.claimLootBtn) {
            this.claimLootBtn.addEventListener('click', () => {
                this.claimLoot();
            });
        }

        // MAIN button - return to home screen
        if (this.mainViewBtn) {
            this.mainViewBtn.addEventListener('click', () => {
                console.log('← Returning to home from PVE battle');
                // Import RNGArena instance is not available here, so we'll use direct navigation
                const pveScreen = document.getElementById('pve-screen');
                const homeScreen = document.getElementById('home-screen');

                // Hide PVE battle and PVE map
                this.screen.classList.add('hidden');
                if (pveScreen) pveScreen.classList.add('hidden');

                // Show home screen
                if (homeScreen) homeScreen.classList.remove('hidden');

                // Cleanup and resume music
                if (this.combat) this.combat.cleanup();
                const homeMusic = document.getElementById('home-music');
                if (homeMusic && homeMusic.paused && !homeMusic.muted) {
                    homeMusic.volume = 0.5;
                    homeMusic.play().catch(e => console.log('Home music resume failed:', e));
                }
            });
        }

        // Fullscreen button
        if (this.fullscreenBtn && this.battlefieldSection) {
            this.fullscreenBtn.addEventListener('click', () => {
                this.battlefieldSection.classList.add('fullscreen');
            });
        }

        // Fullscreen close button
        if (this.fullscreenCloseBtn && this.battlefieldSection) {
            this.fullscreenCloseBtn.addEventListener('click', () => {
                this.battlefieldSection.classList.remove('fullscreen');
            });
        }
    }

    /**
     * Start a PVE battle
     * @param {string} monsterId - The monster to fight
     */
    async startBattle(monsterId) {
        console.log(`🎯 Starting PVE battle against: ${monsterId}`);

        // Load monster data
        this.currentMonster = getMonster(monsterId);
        if (!this.currentMonster) {
            console.error('Failed to load monster:', monsterId);
            return;
        }

        // Initialize hero (always Daring Hero)
        this.hero = {
            name: 'DARING HERO',
            maxHealth: 10, // Hero HP
            health: 10,
            images: {
                neutral: `/images/characters/${CHARACTER_CONFIG.HERO_READY}`,
                attack: `/images/characters/${CHARACTER_CONFIG.HERO_ATTACK}`,
                defense: `/images/characters/${CHARACTER_CONFIG.HERO_DEFENSE}`
            }
        };

        // Setup UI
        this.setupBattleUI();

        // Hide PVE map screen
        const pveScreen = document.getElementById('pve-screen');
        if (pveScreen) {
            pveScreen.classList.add('hidden');
        }

        // Show battle screen
        this.screen.classList.remove('hidden');
        this.battleActive = true;

        // Pause home music during battle
        const homeMusic = document.getElementById('home-music');
        if (homeMusic && !homeMusic.paused) {
            homeMusic.pause();
        }

        // Initialize and start combat
        this.combat = new PVECombatSystem(this.hero, this.currentMonster, this);
        this.combat.startCombat();
    }

    /**
     * Setup battle UI with hero and monster info
     */
    setupBattleUI() {
        // Set nameplates
        if (this.heroName) {
            this.heroName.textContent = this.hero.name;
        }
        if (this.monsterName) {
            this.monsterName.textContent = this.currentMonster.displayName;
        }

        // Set titles
        if (this.heroTitles) {
            this.heroTitles.textContent = 'The Bold • The Brave • The Lucky';
        }
        if (this.monsterTitles && this.currentMonster.id === 'wood-dummy') {
            this.monsterTitles.textContent = 'Masochist • Made of Wood';
        }

        // Show nameplate container (needs 'visible' class like PVP)
        if (this.nameplateContainer) {
            this.nameplateContainer.classList.add('visible');
        }

        // Set HP bars
        this.updateHeroHP(this.hero.health, this.hero.maxHealth);
        this.updateMonsterHP(this.currentMonster.health, this.currentMonster.maxHealth);

        // Set fighter sprites
        if (this.heroSprite) {
            this.heroSprite.style.backgroundImage = `url('${this.hero.images.neutral}')`;
            // Make hero sprite visible (fighters start with opacity: 0)
            const heroFighter = this.heroSprite.closest('.fighter-left');
            if (heroFighter) {
                heroFighter.style.opacity = '1';
            }
        }
        if (this.monsterSprite) {
            this.monsterSprite.style.backgroundImage = `url('${this.currentMonster.sprite}')`;
            // Make monster sprite visible (fighters start with opacity: 0)
            const monsterFighter = this.monsterSprite.closest('.fighter-right');
            if (monsterFighter) {
                monsterFighter.style.opacity = '1';
            }
        }

        // Hide loot claim button initially
        if (this.claimLootBtn) {
            this.claimLootBtn.classList.add('hidden');
        }
    }

    /**
     * Update hero HP bar
     */
    updateHeroHP(current, max) {
        // Clamp HP to minimum of 0
        const displayHP = Math.max(0, current);
        const percentage = (displayHP / max) * 100;
        if (this.heroHPFill) {
            this.heroHPFill.style.width = `${percentage}%`;
        }
        if (this.heroHPText) {
            this.heroHPText.textContent = `${displayHP}/${max}`;
        }
    }

    /**
     * Update monster HP bar
     */
    updateMonsterHP(current, max) {
        // Clamp HP to minimum of 0
        const displayHP = Math.max(0, current);
        const percentage = (displayHP / max) * 100;
        if (this.monsterHPFill) {
            this.monsterHPFill.style.width = `${percentage}%`;
        }
        if (this.monsterHPText) {
            this.monsterHPText.textContent = `${displayHP}/${max}`;
        }
    }

    /**
     * Handle battle victory
     */
    onVictory() {
        console.log('🎉 Victory! Monster defeated!');
        this.battleActive = false;

        // Show loot claim button
        if (this.claimLootBtn) {
            this.claimLootBtn.classList.remove('hidden');
        }

        // Show victory message
        if (this.battleStatus) {
            this.battleStatus.textContent = 'Enemy Defeated';
            this.battleStatus.style.display = 'block';
        }
    }

    /**
     * Handle battle defeat
     */
    onDefeat() {
        console.log('💀 Defeated by monster...');
        this.battleActive = false;

        // Show defeat message
        if (this.battleStatus) {
            this.battleStatus.textContent = 'DEFEATED';
            this.battleStatus.style.display = 'block';
        }

        // TODO: Handle defeat (retry? return to map?)
    }

    /**
     * Claim loot after victory
     */
    claimLoot() {
        console.log('📦 Claiming loot...');

        // Mark monster as completed
        this.markMonsterCompleted();

        // Show loot claim popup overlay
        const lootClaimOverlay = document.getElementById('loot-claim-overlay');
        if (lootClaimOverlay) {
            lootClaimOverlay.classList.remove('hidden');

            // Set up one-time click handler to return to PVE map
            const handleLootClose = () => {
                lootClaimOverlay.classList.add('hidden');
                lootClaimOverlay.removeEventListener('click', handleLootClose);

                // Return to PVE map after closing loot
                this.exitBattle();
            };

            lootClaimOverlay.addEventListener('click', handleLootClose);
        } else {
            // Fallback if overlay doesn't exist
            this.exitBattle();
        }
    }

    /**
     * Mark monster as completed and unlock next
     */
    markMonsterCompleted() {
        // TODO: This should integrate with game state management
        // For now, just log it
        console.log(`✅ ${this.currentMonster.id} marked as completed`);

        // Example: Add class to monster button on PVE map
        const monsterBtn = document.getElementById(`pve-${this.currentMonster.id}`);
        if (monsterBtn) {
            monsterBtn.classList.remove('pve-locked');
            monsterBtn.classList.add('pve-completed');

            // Remove lock icon
            const lockIcon = monsterBtn.querySelector('.pve-lock-icon');
            if (lockIcon) {
                lockIcon.remove();
            }
        }

        // TODO: Unlock next monster in sequence
    }

    /**
     * Exit battle and return to PVE map
     */
    exitBattle() {
        console.log('← Returning to PVE map');

        // Cleanup combat audio first
        if (this.combat) {
            this.combat.cleanup();
        }

        // Hide battle screen
        this.screen.classList.add('hidden');

        // Show PVE map screen
        const pveScreen = document.getElementById('pve-screen');
        if (pveScreen) {
            pveScreen.classList.remove('hidden');
        }

        // Resume home music if it was playing and not muted
        const homeMusic = document.getElementById('home-music');
        if (homeMusic && homeMusic.paused && !homeMusic.muted) {
            homeMusic.volume = 0.5; // Half volume
            homeMusic.play().catch(e => console.log('Home music resume failed:', e));
        }

        // Reset battle state
        this.battleActive = false;
        this.currentMonster = null;
        this.hero = null;
    }

    /**
     * Cleanup
     */
    destroy() {
        if (this.combat) {
            this.combat.cleanup();
            this.combat = null;
        }
        this.battleActive = false;
    }
}
