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
 * - Screen: #tournament-screen
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

        // Monster progression sequence
        this.monsterSequence = [
            'wood-dummy',
            'raccoon',
            'ram',
            'goblin',
            'frog-fish',
            'serpent',
            'nymph',
            'minitaur',
            'dragon'
        ];

        // PVE Battle Music
        this.pveMusicTracks = [
            '/images/pve/Music/RNG PVE (1).mp3',
            '/images/pve/Music/RNG PVE (2).mp3'
        ];
        this.currentMusicIndex = 0;
        this.shuffledTracks = [];
        this.battleMusic = null;
        this.battleMusicEndedHandler = null; // Store listener for cleanup

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
        this.muteBtn = document.getElementById('pve-mute-audio');
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

        // Mute button - use global toggleMute for consistency
        if (this.muteBtn) {
            this.muteBtn.addEventListener('click', () => {
                if (window.arena && window.arena.toggleMute) {
                    window.arena.toggleMute();
                }
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

        // Remove glow effect from this monster if it has it
        const monsterBtn = document.getElementById(`pve-${monsterId}`);
        if (monsterBtn) {
            monsterBtn.classList.remove('pve-newly-unlocked');
        }

        // Load monster data
        this.currentMonster = getMonster(monsterId);
        if (!this.currentMonster) {
            console.error('Failed to load monster:', monsterId);
            return;
        }

        // Get hero stats from PVE gear
        const gearStats = this.getHeroGearStats();

        // Initialize hero (always Daring Hero or Dragon Armor if full set equipped)
        const hasFullDragonArmor = this.hasFullDragonArmorSet();
        this.hero = {
            name: 'DARING HERO',
            maxHealth: 40 + (gearStats.health || 0), // Base HP + gear HP
            health: 40 + (gearStats.health || 0),
            stats: gearStats, // Include all gear stats for combat
            images: {
                neutral: hasFullDragonArmor ? `/images/characters/Dragon_armor_neutral.png` : `/images/characters/${CHARACTER_CONFIG.HERO_READY}`,
                attack: hasFullDragonArmor ? `/images/characters/Dragon_armor_attackl.png` : `/images/characters/${CHARACTER_CONFIG.HERO_ATTACK}`,
                defense: hasFullDragonArmor ? `/images/characters/Dragon_armor_defend.png` : `/images/characters/${CHARACTER_CONFIG.HERO_DEFENSE}`
            }
        };

        // Setup UI
        this.setupBattleUI();

        // Hide PVE map screen
        const pveScreen = document.getElementById('pve-screen');
        if (pveScreen) {
            pveScreen.classList.add('hidden');
        }

        // Show battle screen with fade in
        this.screen.classList.remove('hidden');
        this.screen.style.transition = 'opacity 0.3s ease';
        this.screen.style.opacity = '0';

        setTimeout(() => {
            this.screen.style.opacity = '1';
        }, 50);

        this.battleActive = true;

        // Pause home music during battle
        const homeMusic = document.getElementById('home-music');
        if (homeMusic && !homeMusic.paused) {
            homeMusic.pause();
        }

        // Start PVE battle music
        this.startBattleMusic();

        // Initialize and start combat
        this.combat = new PVECombatSystem(this.hero, this.currentMonster, this);
        this.combat.startCombat();
    }

    /**
     * Shuffle array using Fisher-Yates algorithm
     */
    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    /**
     * Start PVE battle music on shuffle
     */
    startBattleMusic() {
        // Check if audio is muted
        if (window.arena && window.arena.audioMuted) {
            return;
        }

        // Shuffle tracks if starting fresh
        if (this.shuffledTracks.length === 0) {
            this.shuffledTracks = this.shuffleArray(this.pveMusicTracks);
            this.currentMusicIndex = 0;
        }

        // Remove old listener if it exists (prevent memory leak)
        if (this.battleMusic && this.battleMusicEndedHandler) {
            this.battleMusic.removeEventListener('ended', this.battleMusicEndedHandler);
        }

        // Create audio element for current track
        this.battleMusic = new Audio(this.shuffledTracks[this.currentMusicIndex]);
        this.battleMusic.volume = 0.425; // 15% quieter than 0.5

        // Store listener reference so we can remove it later
        this.battleMusicEndedHandler = () => {
            this.playNextTrack();
        };

        // When track ends, play next track
        this.battleMusic.addEventListener('ended', this.battleMusicEndedHandler);

        // Play the music
        this.battleMusic.play().catch(e => console.log('PVE battle music play failed:', e));
        console.log(`🎵 Playing PVE battle music: ${this.shuffledTracks[this.currentMusicIndex]}`);
    }

    /**
     * Play next track in shuffled playlist
     */
    playNextTrack() {
        this.currentMusicIndex++;

        // If we've played all tracks, reshuffle
        if (this.currentMusicIndex >= this.shuffledTracks.length) {
            this.shuffledTracks = this.shuffleArray(this.pveMusicTracks);
            this.currentMusicIndex = 0;
            console.log('🔀 Reshuffling PVE music playlist');
        }

        // Stop current music (will remove listener)
        this.stopBattleMusic();

        // Play next track if battle is still active
        if (this.battleActive) {
            this.startBattleMusic();
        }
    }

    /**
     * Stop battle music
     */
    stopBattleMusic() {
        if (this.battleMusic) {
            // Remove event listener to prevent memory leak
            if (this.battleMusicEndedHandler) {
                this.battleMusic.removeEventListener('ended', this.battleMusicEndedHandler);
                this.battleMusicEndedHandler = null;
            }
            this.battleMusic.pause();
            this.battleMusic.currentTime = 0;
            this.battleMusic = null;
        }
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

        // Titles are hidden in PVE via CSS (display: none)
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
            // Make hero 10% smaller (scale 0.9)
            this.heroSprite.style.transform = 'scale(0.9)';
            // Make hero sprite visible (fighters start with opacity: 0)
            const heroFighter = this.heroSprite.closest('.fighter-left');
            if (heroFighter) {
                heroFighter.style.opacity = '1';
            }
        }
        if (this.monsterSprite) {
            this.monsterSprite.style.backgroundImage = `url('${this.currentMonster.sprite}')`;
            // Add data attribute for monster-specific styling (e.g., flipping raccoon)
            this.monsterSprite.setAttribute('data-monster', this.currentMonster.id);

            // Get monster's base transform from monster data (data-driven, not hardcoded!)
            const monsterTransform = this.currentMonster.baseTransform || 'scaleX(-1) scale(0.4)';

            this.monsterSprite.style.setProperty('transform', monsterTransform, 'important');
            console.log(`🎨 [PVEBattleSystem] Set monster (${this.currentMonster.id}) sprite transform:`, monsterTransform);

            // Force reflow and re-apply after CSS loads
            setTimeout(() => {
                this.monsterSprite.style.setProperty('transform', monsterTransform, 'important');
                console.log(`🎨 [PVEBattleSystem] Re-applied transform after delay:`, window.getComputedStyle(this.monsterSprite).transform);
            }, 100);

            // Debug: Check container transform
            const monsterFighter = this.monsterSprite.closest('.fighter-right');
            if (monsterFighter) {
                monsterFighter.style.opacity = '1';
                console.log(`🎨 [PVEBattleSystem] Container transform:`, window.getComputedStyle(monsterFighter).transform);
                console.log(`🎨 [PVEBattleSystem] Sprite computed transform:`, window.getComputedStyle(this.monsterSprite).transform);
            }
        }

        // Set arena background
        if (this.viewport) {
            // Remove existing background classes
            this.viewport.classList.remove('wood-castle');

            // Set monster-specific background if available
            if (this.currentMonster.backgroundImage) {
                this.viewport.style.setProperty('background', `url('${this.currentMonster.backgroundImage}')`, 'important');
                this.viewport.style.setProperty('background-size', '110%', 'important');
                this.viewport.style.setProperty('background-position', 'center calc(100% + 15px)', 'important');
                this.viewport.style.setProperty('background-repeat', 'no-repeat', 'important');
            } else {
                // Use default wood castle for monsters without custom backgrounds
                this.viewport.classList.add('wood-castle');
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
    updateHeroHP(current, max, isPoisoned = false) {
        // Clamp HP to minimum of 0
        const displayHP = Math.max(0, current);
        const percentage = (displayHP / max) * 100;
        if (this.heroHPFill) {
            this.heroHPFill.style.width = `${percentage}%`;
            // Turn HP bar green when poisoned
            if (isPoisoned) {
                this.heroHPFill.style.background = '#00ff00'; // Override gradient with solid green
                this.heroHPFill.style.boxShadow = '0 0 10px rgba(0, 255, 0, 0.8), 0 0 20px rgba(0, 255, 0, 0.4)'; // Green glow
            } else {
                this.heroHPFill.style.background = ''; // Reset to default gradient
                this.heroHPFill.style.boxShadow = ''; // Reset box shadow
            }
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

            // Add light blue glow for Ripplefang (medium boss)
            if (this.currentMonster && this.currentMonster.id === 'ripplefang') {
                this.monsterHPFill.style.boxShadow = '0 0 10px rgba(100, 200, 255, 0.8), 0 0 20px rgba(100, 200, 255, 0.4)';
            }
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

        // Hide win odds display
        const winOddsDisplay = document.getElementById('pve-win-odds');
        if (winOddsDisplay) {
            winOddsDisplay.style.display = 'none';
        }

        // Create large centered VICTORY text
        const victoryText = document.createElement('div');
        victoryText.className = 'pve-victory-text';
        victoryText.style.cssText = `
            position: absolute;
            top: calc(50% - 55px);
            left: 50%;
            transform: translate(-50%, -50%);
            font-family: 'Cinzel', serif;
            font-size: 4rem;
            font-weight: bold;
            color: #FFD700;
            text-align: center;
            z-index: 1000;
            pointer-events: none;
            opacity: 0;
            text-shadow:
                0 0 25px rgba(255, 215, 0, 1),
                0 0 50px rgba(255, 215, 0, 0.9),
                0 0 75px rgba(255, 255, 255, 0.7),
                4px 4px 10px rgba(0, 0, 0, 0.9);
            animation: pveVictoryTextPulse 3s ease-in-out infinite;
            will-change: auto;
            contain: layout;
        `;
        victoryText.textContent = 'VICTORY';

        // Add to battle screen
        this.screen.appendChild(victoryText);

        // Fade in victory text after 1 second
        setTimeout(() => {
            victoryText.style.opacity = '1';
        }, 1000);

        // Show 80% black overlay and claim loot button after short delay
        setTimeout(() => {
            this.showLootOverlay();
        }, 1500);

        // Show victory message (keep for compatibility)
        if (this.battleStatus) {
            this.battleStatus.textContent = 'Enemy Defeated';
            this.battleStatus.style.display = 'block';
        }
    }

    /**
     * Show 80% black overlay with claim loot button
     */
    showLootOverlay() {
        // Create 80% black overlay
        const overlay = document.createElement('div');
        overlay.className = 'pve-loot-overlay';
        overlay.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            z-index: 900;
            opacity: 0;
            transition: opacity 0.3s ease;
        `;

        // Create claim loot button (50% smaller)
        const claimButton = document.createElement('button');
        claimButton.className = 'pve-claim-loot-overlay-btn';
        claimButton.textContent = 'CLAIM LOOT';
        claimButton.style.cssText = `
            position: absolute;
            top: calc(50% + 15px);
            left: 50%;
            transform: translate(-50%, -50%) scale(0.5);
            padding: 15px 40px;
            font-family: 'Cinzel', serif;
            font-size: 1.5rem;
            font-weight: bold;
            color: #FFD700;
            background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
            border: 3px solid #FFD700;
            border-radius: 8px;
            cursor: pointer;
            z-index: 950;
            transition: transform 0.15s ease, box-shadow 0.15s ease;
            box-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
        `;

        // Simplified hover effects - only scale and glow
        claimButton.addEventListener('mouseenter', () => {
            claimButton.style.boxShadow = '0 0 30px rgba(255, 215, 0, 0.8)';
            claimButton.style.transform = 'translate(-50%, -50%) scale(0.525)'; // 0.5 * 1.05
        });

        claimButton.addEventListener('mouseleave', () => {
            claimButton.style.boxShadow = '0 0 20px rgba(255, 215, 0, 0.5)';
            claimButton.style.transform = 'translate(-50%, -50%) scale(0.5)';
        });

        // Click handler
        claimButton.addEventListener('click', () => {
            // Remove overlay and button
            overlay.remove();
            claimButton.remove();
            // Open loot claim
            this.claimLoot();
        });

        // Add to screen
        this.screen.appendChild(overlay);
        this.screen.appendChild(claimButton);

        // Fade in overlay
        setTimeout(() => {
            overlay.style.opacity = '1';
        }, 50);
    }

    /**
     * Handle battle defeat
     */
    onDefeat() {
        console.log('💀 Defeated by monster...');
        this.battleActive = false;

        // Hide win odds display
        const winOddsDisplay = document.getElementById('pve-win-odds');
        if (winOddsDisplay) {
            winOddsDisplay.style.display = 'none';
        }

        // Create large centered DEFEAT text in red
        const defeatText = document.createElement('div');
        defeatText.className = 'pve-defeat-text';
        defeatText.style.cssText = `
            position: absolute;
            top: calc(50% - 55px);
            left: 50%;
            transform: translate(-50%, -50%);
            font-family: 'Cinzel', serif;
            font-size: 4rem;
            font-weight: bold;
            color: #FF0000;
            text-align: center;
            z-index: 1000;
            pointer-events: none;
            opacity: 0;
            text-shadow:
                0 0 25px rgba(255, 0, 0, 1),
                0 0 50px rgba(255, 0, 0, 0.9),
                0 0 75px rgba(255, 100, 100, 0.7),
                4px 4px 10px rgba(0, 0, 0, 0.9);
            animation: pveDefeatTextPulse 3s ease-in-out infinite;
            will-change: auto;
            contain: layout;
        `;
        defeatText.textContent = 'DEFEAT';

        // Add to battle screen
        this.screen.appendChild(defeatText);

        // Fade in defeat text
        setTimeout(() => {
            defeatText.style.opacity = '1';
        }, 100);

        // Create defeat buttons container
        const buttonsContainer = document.createElement('div');
        buttonsContainer.className = 'pve-defeat-buttons';
        buttonsContainer.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translateX(-50%);
            display: flex;
            gap: 10px;
            z-index: 1001;
            opacity: 0;
        `;

        // Retry button
        const retryBtn = document.createElement('button');
        retryBtn.className = 'pve-action-btn';
        retryBtn.textContent = 'RETRY';
        retryBtn.style.cssText = `
            font-family: 'Cinzel', serif;
            font-size: 0.6rem;
            font-weight: bold;
            color: #FFD700;
            background: rgba(0, 0, 0, 0.7);
            border: 2px solid #FFD700;
            padding: 6px 15px;
            cursor: pointer;
            transition: all 0.3s ease;
            text-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
        `;
        retryBtn.addEventListener('mouseenter', () => {
            retryBtn.style.background = 'rgba(255, 215, 0, 0.2)';
            retryBtn.style.transform = 'scale(1.05)';
        });
        retryBtn.addEventListener('mouseleave', () => {
            retryBtn.style.background = 'rgba(0, 0, 0, 0.7)';
            retryBtn.style.transform = 'scale(1)';
        });
        retryBtn.addEventListener('click', () => {
            this.retryBattle();
        });

        // Return to Map button
        const returnBtn = document.createElement('button');
        returnBtn.className = 'pve-action-btn';
        returnBtn.textContent = 'RETURN TO MAP';
        returnBtn.style.cssText = `
            font-family: 'Cinzel', serif;
            font-size: 0.6rem;
            font-weight: bold;
            color: #CCCCCC;
            background: rgba(0, 0, 0, 0.7);
            border: 2px solid #888888;
            padding: 6px 15px;
            cursor: pointer;
            transition: all 0.3s ease;
        `;
        returnBtn.addEventListener('mouseenter', () => {
            returnBtn.style.background = 'rgba(255, 255, 255, 0.1)';
            returnBtn.style.transform = 'scale(1.05)';
        });
        returnBtn.addEventListener('mouseleave', () => {
            returnBtn.style.background = 'rgba(0, 0, 0, 0.7)';
            returnBtn.style.transform = 'scale(1)';
        });
        returnBtn.addEventListener('click', () => {
            this.exitBattle();
        });

        buttonsContainer.appendChild(retryBtn);
        buttonsContainer.appendChild(returnBtn);
        this.screen.appendChild(buttonsContainer);

        // Fade in buttons
        setTimeout(() => {
            buttonsContainer.style.opacity = '1';
        }, 500);

        // Show defeat message (keep for compatibility)
        if (this.battleStatus) {
            this.battleStatus.textContent = 'DEFEATED';
            this.battleStatus.style.display = 'block';
        }
    }

    /**
     * Claim loot after victory
     */
    claimLoot() {
        console.log('📦 Claiming loot...');

        // Mark monster as completed
        this.markMonsterCompleted();

        // Set loot chest image and text based on monster's loot data
        if (this.currentMonster && this.currentMonster.loot) {
            const loot = this.currentMonster.loot;
            const chestImage = document.querySelector('.popup-loot-chest-image');
            const lootHeaderBottom = document.querySelector('.popup-loot-header-bottom');

            if (chestImage && loot.chestNumber) {
                // Format chest number with leading zero (e.g., 5 -> "05")
                const chestNumber = String(loot.chestNumber).padStart(2, '0');
                chestImage.src = `/images/Loot/chest_${chestNumber}.png`;
                console.log(`📦 Set chest image to: chest_${chestNumber}.png`);
            }

            if (lootHeaderBottom && loot.material && loot.rarity) {
                lootHeaderBottom.innerHTML = `${loot.material.toUpperCase()} CHEST<br>${loot.rarity.toUpperCase()} LOOT`;
                console.log(`📦 Set loot text to: ${loot.material} / ${loot.rarity}`);
            }
        }

        // Show loot claim popup overlay
        const lootClaimOverlay = document.getElementById('loot-claim-overlay');
        if (lootClaimOverlay) {
            lootClaimOverlay.classList.remove('hidden');

            // Set up one-time click handler to return to map
            const handleLootClose = () => {
                lootClaimOverlay.classList.add('hidden');
                lootClaimOverlay.removeEventListener('click', handleLootClose);

                // Return directly to map
                this.exitBattle();
            };

            lootClaimOverlay.addEventListener('click', handleLootClose);
        } else {
            // Fallback if overlay doesn't exist - return to map
            this.exitBattle();
        }
    }

    /**
     * Show post-victory action buttons
     */
    showPostVictoryButtons() {
        // Create victory buttons container
        const buttonsContainer = document.createElement('div');
        buttonsContainer.className = 'pve-victory-buttons';
        buttonsContainer.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translateX(-50%);
            display: flex;
            gap: 10px;
            z-index: 1001;
            opacity: 0;
        `;

        // Return to Map button
        const returnBtn = document.createElement('button');
        returnBtn.className = 'pve-action-btn';
        returnBtn.textContent = 'RETURN TO MAP';
        returnBtn.style.cssText = `
            font-family: 'Cinzel', serif;
            font-size: 0.6rem;
            font-weight: bold;
            color: #CCCCCC;
            background: rgba(0, 0, 0, 0.7);
            border: 2px solid #888888;
            padding: 6px 15px;
            cursor: pointer;
            transition: all 0.3s ease;
        `;
        returnBtn.addEventListener('mouseenter', () => {
            returnBtn.style.background = 'rgba(255, 255, 255, 0.1)';
            returnBtn.style.transform = 'scale(1.05)';
        });
        returnBtn.addEventListener('mouseleave', () => {
            returnBtn.style.background = 'rgba(0, 0, 0, 0.7)';
            returnBtn.style.transform = 'scale(1)';
        });
        returnBtn.addEventListener('click', () => {
            this.exitBattle();
        });

        buttonsContainer.appendChild(returnBtn);

        // Next Battle button (only show if there's a next monster)
        const nextMonsterId = this.getNextMonsterId();

        if (nextMonsterId) {
            const nextBtn = document.createElement('button');
            nextBtn.className = 'pve-action-btn';
            nextBtn.textContent = 'NEXT BATTLE';
            nextBtn.style.cssText = `
                font-family: 'Cinzel', serif;
                font-size: 0.6rem;
                font-weight: bold;
                color: #FFD700;
                background: rgba(0, 0, 0, 0.7);
                border: 2px solid #FFD700;
                padding: 6px 15px;
                cursor: pointer;
                transition: all 0.3s ease;
                text-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
            `;
            nextBtn.addEventListener('mouseenter', () => {
                nextBtn.style.background = 'rgba(255, 215, 0, 0.2)';
                nextBtn.style.transform = 'scale(1.05)';
            });
            nextBtn.addEventListener('mouseleave', () => {
                nextBtn.style.background = 'rgba(0, 0, 0, 0.7)';
                nextBtn.style.transform = 'scale(1)';
            });
            nextBtn.addEventListener('click', () => {
                this.startNextBattle();
            });

            buttonsContainer.appendChild(nextBtn);
        }
        this.screen.appendChild(buttonsContainer);

        // Fade in buttons
        setTimeout(() => {
            buttonsContainer.style.opacity = '1';
        }, 100);
    }

    /**
     * Mark monster as completed and unlock next
     */
    markMonsterCompleted() {
        console.log(`✅ ${this.currentMonster.id} marked as completed`);

        // Mark current monster as completed
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

        // Unlock next monster in sequence
        this.unlockNextMonster();
    }

    /**
     * Unlock the next monster in the sequence
     */
    unlockNextMonster() {
        const currentIndex = this.monsterSequence.indexOf(this.currentMonster.id);
        const nextIndex = currentIndex + 1;

        if (nextIndex < this.monsterSequence.length) {
            const nextMonsterId = this.monsterSequence[nextIndex];
            const nextMonsterBtn = document.getElementById(`pve-${nextMonsterId}`);

            if (nextMonsterBtn) {
                nextMonsterBtn.classList.remove('pve-locked');

                // Remove lock icon
                const lockIcon = nextMonsterBtn.querySelector('.pve-lock-icon');
                if (lockIcon) {
                    lockIcon.remove();
                }

                // Add glow animation class (persistent subtle glow after 3s animation)
                nextMonsterBtn.classList.add('pve-newly-unlocked');

                console.log(`🔓 Unlocked next monster: ${nextMonsterId}`);
            }
        } else {
            console.log('🎉 All monsters completed!');
            // Trigger castle completion visual
            this.triggerCastleCompletion();
        }
    }

    /**
     * Check if all monsters are completed
     */
    areAllMonstersCompleted() {
        return this.monsterSequence.every(monsterId => {
            const btn = document.getElementById(`pve-${monsterId}`);
            return btn && btn.classList.contains('pve-completed');
        });
    }

    /**
     * Trigger castle completion visual (switch to Castle_2)
     */
    triggerCastleCompletion() {
        const castle1 = document.getElementById('castle-parallax-1');
        const castle2 = document.getElementById('castle-parallax-2');

        if (castle1 && castle2) {
            castle1.classList.add('hidden');
            castle2.classList.remove('hidden');
            console.log('🏰 Castle upgraded to completed version!');
        }
    }

    /**
     * Get the next monster in sequence
     */
    getNextMonsterId() {
        const currentIndex = this.monsterSequence.indexOf(this.currentMonster.id);
        const nextIndex = currentIndex + 1;

        if (nextIndex < this.monsterSequence.length) {
            return this.monsterSequence[nextIndex];
        }

        return null; // No more monsters
    }

    /**
     * Retry the current battle
     */
    retryBattle() {
        console.log('🔄 Retrying battle...');

        // Store current monster ID
        const monsterId = this.currentMonster.id;

        // Fade out
        this.screen.style.transition = 'opacity 0.3s ease';
        this.screen.style.opacity = '0';

        setTimeout(() => {
            // Stop current battle music
            this.stopBattleMusic();

            // CRITICAL: Cleanup the old combat system BEFORE creating a new one
            if (this.combat) {
                this.combat.cleanup();
                this.combat = null;
            }

            // Clean up battle UI elements
            this.cleanupBattle();

            // Restart battle with same monster (will start new music and fade in)
            this.startBattle(monsterId);

            // Fade back in
            setTimeout(() => {
                this.screen.style.opacity = '1';
            }, 50);
        }, 300); // Wait for fade out
    }

    /**
     * Start the next battle in sequence
     */
    startNextBattle() {
        console.log('➡️ Starting next battle...');

        const nextMonsterId = this.getNextMonsterId();

        if (nextMonsterId) {
            // Fade out current battle
            this.screen.style.transition = 'opacity 0.3s ease';
            this.screen.style.opacity = '0';

            setTimeout(() => {
                // Stop battle music
                this.stopBattleMusic();

                // CRITICAL: Cleanup the old combat system BEFORE creating a new one
                if (this.combat) {
                    this.combat.cleanup();
                    this.combat = null;
                }

                // Clean up battle UI elements
                this.cleanupBattle();

                // Start next battle
                this.startBattle(nextMonsterId);

                // Fade back in
                setTimeout(() => {
                    this.screen.style.opacity = '1';
                }, 50);
            }, 300); // Wait for fade out
        } else {
            // No more monsters - return to map
            console.log('🎉 No more monsters! Returning to map.');
            this.exitBattle();
        }
    }

    /**
     * Clean up battle UI elements
     */
    cleanupBattle() {
        console.log('🧹 Cleaning up battle...');

        // Remove victory/defeat text elements
        const victoryText = this.screen.querySelector('.pve-victory-text');
        if (victoryText) {
            console.log('  ✅ Removing victory text');
            victoryText.remove();
        } else {
            console.log('  ℹ️ No victory text found');
        }
        const defeatText = this.screen.querySelector('.pve-defeat-text');
        if (defeatText) {
            console.log('  ✅ Removing defeat text');
            defeatText.remove();
        }

        // Remove loot overlay and button
        const lootOverlay = this.screen.querySelector('.pve-loot-overlay');
        if (lootOverlay) {
            console.log('  ✅ Removing loot overlay');
            lootOverlay.remove();
        }
        const claimButton = this.screen.querySelector('.pve-claim-loot-overlay-btn');
        if (claimButton) {
            console.log('  ✅ Removing claim loot button');
            claimButton.remove();
        }

        // Remove button containers
        const victoryButtons = this.screen.querySelector('.pve-victory-buttons');
        if (victoryButtons) {
            console.log('  ✅ Removing victory buttons');
            victoryButtons.remove();
        }
        const defeatButtons = this.screen.querySelector('.pve-defeat-buttons');
        if (defeatButtons) {
            console.log('  ✅ Removing defeat buttons');
            defeatButtons.remove();
        }

        // Restore win odds display
        const winOddsDisplay = document.getElementById('pve-win-odds');
        if (winOddsDisplay) {
            winOddsDisplay.style.display = 'flex';
            console.log('  ✅ Restored win odds display');
        }
    }

    /**
     * Exit battle and return to PVE map
     */
    exitBattle() {
        console.log('← Returning to PVE map');

        // Stop battle music
        this.stopBattleMusic();

        // Cleanup combat audio first
        if (this.combat) {
            this.combat.cleanup();
        }

        // Clean up battle UI elements
        this.cleanupBattle();

        // Clear arena background and restore default
        if (this.viewport) {
            this.viewport.style.removeProperty('background');
            this.viewport.style.removeProperty('background-size');
            this.viewport.style.removeProperty('background-position');
            this.viewport.style.removeProperty('background-repeat');
            this.viewport.classList.add('wood-castle');
        }

        // Fade out and hide battle screen
        this.screen.style.transition = 'opacity 0.3s ease';
        this.screen.style.opacity = '0';

        setTimeout(() => {
            this.screen.classList.add('hidden');
            this.screen.style.opacity = '1'; // Reset for next time
        }, 300);

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
     * Set muted state for all PVE audio
     */
    setMuted(muted) {
        // Pass muted state to combat system
        if (this.combat) {
            this.combat.setMuted(muted);
        }
    }

    /**
     * Get hero gear stats from PVE equip system
     */
    getHeroGearStats() {
        // Access the gear library's PVE equip system
        if (window.arena && window.arena.gearLibrary && window.arena.gearLibrary.pveEquipSystem) {
            return window.arena.gearLibrary.pveEquipSystem.getTotalStats();
        }

        // Return default empty stats if gear system not available
        return {
            attack: 0,
            defense: 0,
            health: 0,
            crit: 0,
            dodge: 0,
            draconicCrit: 0
        };
    }

    /**
     * Check if player has full Dragon Armor set equipped
     */
    hasFullDragonArmorSet() {
        if (window.arena && window.arena.gearLibrary && window.arena.gearLibrary.pveEquipSystem) {
            const stats = window.arena.gearLibrary.pveEquipSystem.getTotalStats();
            // If draconic crit is present, full set is equipped
            return stats.draconicCrit > 0;
        }
        return false;
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
