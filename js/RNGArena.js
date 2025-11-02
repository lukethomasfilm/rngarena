import { ChatSystem } from './ChatSystem.js';
import { EmojiSystem } from './EmojiSystem.js';
import { LootSystem } from './LootSystem.js';
import { CombatSystem } from './CombatSystem.js';
import { BracketSystem } from './BracketSystem.js';
import { GameManager } from './GameManager.js';
import { PVEBattleSystem } from './pve/PVEBattleSystem.js';
import {
    GAME_CONFIG,
    ARENA_CONFIG,
    CHARACTER_CONFIG,
    EMOJI_CONFIG,
    BRACKET_CONFIG,
    ANNOUNCER_MESSAGES,
    ROUND_NAMES,
    UI_CONFIG
} from './constants.js';

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * RNGArena - PVP Tournament System
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * ARCHITECTURAL SEPARATION:
 * -------------------------
 * This class handles EXCLUSIVELY PVP tournament functionality.
 * All DOM element references are scoped to #tournament-screen.
 *
 * PVE System (COMPLETELY SEPARATE):
 * - Located in: js/pve/PVEBattleSystem.js & js/pve/PVECombatSystem.js
 * - Screens: #pve-screen (map), #pve-battle-screen (battle)
 * - Elements: All use pve- prefix (pve-hero-sprite, pve-monster-sprite, etc.)
 *
 * CRITICAL RULES:
 * ---------------
 * 1. NEVER use document.querySelector() for shared class names
 *    (e.g., .fighter-left, .arena-viewport, .nameplate-vs-container)
 *
 * 2. ALWAYS scope selectors: this.tournamentScreen.querySelector()
 *
 * 3. Store all PVP element references in constructor with pvpScreen scoping
 *
 * 4. PVE system is self-contained - RNGArena never touches PVE elements
 *
 * This separation prevents cross-contamination bugs where PVP code
 * accidentally manipulates PVE elements or vice versa.
 * ═══════════════════════════════════════════════════════════════════════════
 */
export class RNGArena {
    constructor() {
        console.log('🎮 RNG: Legends v1.0.11 - Home Screen & Navigation');

        // Core tournament
        this.tournament = new window.TournamentBracket();
        this.tournamentStarted = false;
        this.autoContinue = false;
        this.battleInProgress = false;
        this.heroLootOnlyMode = true; // Default: only track hero's wins
        this.isFirstBattle = true; // Track if this is the first battle (no fade needed)
        this.heroMaxRound = 0; // Track the max round the hero reached
        this.heroEliminated = false; // Track if hero has been eliminated
        this.heroLootClaimed = false; // Track if hero loot has been claimed
        this.tournamentLootClaimed = false; // Track if tournament loot has been claimed

        // Character management
        this.characterImageCache = new Map();
        this.allImages = [];
        this.imagesLoaded = false;
        this.previousWinnerName = null; // Track previous battle winner

        // Lady Luck animation state
        this.ladyLuckFrame = 1; // Current frame (1-4)
        this.ladyLuckAnimationInterval = null; // Animation interval ID

        // DOM Elements - ALL scoped to Tournament screen to avoid conflicts with PVE
        // CRITICAL: This ensures RNGArena only manipulates Tournament elements, never PVE
        const tournamentScreen = document.getElementById('tournament-screen');
        if (!tournamentScreen) {
            console.error('❌ Tournament screen not found! RNGArena cannot initialize.');
            return;
        }

        this.tournamentScreen = tournamentScreen; // Store reference for future use
        this.leftFighter = tournamentScreen.querySelector('.fighter-left');
        this.rightFighter = tournamentScreen.querySelector('.fighter-right');
        this.battleStatus = tournamentScreen.querySelector('.battle-status');
        this.roundAnnouncement = tournamentScreen.querySelector('.round-announcement');
        this.startButton = document.getElementById('start-battle');
        this.chatMessages = document.getElementById('chat-messages');
        this.arenaViewport = tournamentScreen.querySelector('.arena-viewport');
        this.progressSegments = document.getElementById('progress-segments');
        this.heroProgressIndicator = document.getElementById('hero-progress-indicator');
        this.leftFighterNameEl = document.getElementById('left-nameplate-name');
        this.rightFighterNameEl = document.getElementById('right-nameplate-name');
        this.countdownOverlay = document.getElementById('countdown-overlay');
        this.countdownTimer = document.getElementById('countdown-timer');
        this.leftFighterTitlesEl = document.getElementById('left-nameplate-titles');
        this.rightFighterTitlesEl = document.getElementById('right-nameplate-titles');
        this.leftFighterCard = tournamentScreen.querySelector('.left-fighter-card');
        this.rightFighterCard = tournamentScreen.querySelector('.right-fighter-card');
        this.bracketDisplay = document.getElementById('bracket-display');
        this.overlayBracketDisplay = document.getElementById('overlay-bracket-display');
        this.bracketViewport = tournamentScreen.querySelector('.bracket-viewport');
        this.bracketSlider = document.getElementById('bracket-slider');
        this.zoomInBtn = document.getElementById('zoom-in');
        this.zoomOutBtn = document.getElementById('zoom-out');
        this.zoomLevel = document.getElementById('zoom-level');
        this.overlayZoomInBtn = document.getElementById('overlay-zoom-in');
        this.overlayZoomOutBtn = document.getElementById('overlay-zoom-out');
        this.overlayZoomLevel = document.getElementById('overlay-zoom-level');
        this.overlayBracketSlider = document.getElementById('overlay-bracket-slider');
        this.chatContainer = tournamentScreen.querySelector('.chat-container');
        this.chatInput = document.getElementById('chat-input');

        // Additional Tournament-specific elements (scoped to prevent PVE conflicts)
        this.nameplateVsContainer = tournamentScreen.querySelector('.nameplate-vs-container');
        this.leftNameplate = tournamentScreen.querySelector('.left-nameplate');
        this.rightNameplate = tournamentScreen.querySelector('.right-nameplate');
        this.crownOdds = tournamentScreen.querySelector('.crown-odds');
        this.lootHeaderBottom = tournamentScreen.querySelector('.loot-header-bottom');
        this.sendChatBtn = document.getElementById('send-chat');

        // Initialize Systems
        this.gameManager = new GameManager();
        this.chatSystem = new ChatSystem(this.chatMessages);
        this.emojiSystem = new EmojiSystem(this.arenaViewport);
        this.lootSystem = new LootSystem();
        this.bracketSystem = new BracketSystem(this.bracketDisplay, this.tournament);
        this.pveBattleSystem = new PVEBattleSystem(); // PVE battle system

        // Combat system will be initialized per battle
        this.combatSystem = null;

        // Background management
        this.backgrounds = ARENA_CONFIG.BACKGROUNDS;
        this.currentBgIndex = 0;

        // Bracket zoom state
        this.currentZoom = BRACKET_CONFIG.DEFAULT_ZOOM;
        this.currentScrollX = 0;
        this.currentScrollY = 0;

        // Background music
        this.backgroundMusic = new Audio('/sfx/RNG Arena.mp3');
        this.backgroundMusic.loop = true;
        this.backgroundMusic.volume = 0.60;
        this.backgroundMusic.preload = 'auto';

        // Home screen music (will be initialized in init())
        this.homeMusic = null;

        // Audio state
        this.audioMuted = false;

        // Sound paths - URL encode special characters like #
        this.fightEntranceSoundPaths = [
            '/sfx/Fight!_fighter_game_-1760024915376.mp3',
            '/sfx/Fight!_fighter_game_-1760027803039.mp3',
            '/sfx/Fight_fighter_game_1-1760027804743.mp3',
            '/sfx/Fight_fighter_game_2-1760027804744.mp3',
            '/sfx/Fight_fighter_game_3-1760027804744.mp3'
        ];

        // Special round sounds
        this.semifinalsSoundPath = '/sfx/Semifinals_fighter_g_3-1760030125624.mp3';
        this.finalBattleSoundPath = '/sfx/Final_Battle_fighter_3-1760028925425.mp3';
        this.victorySoundPath = '/sfx/You_are_the_victorio_1-1760029102157.mp3';
        this.byeSoundPath = '/sfx/game_female_soft_com_3-1760029620130.mp3';
        this.chestOpenSoundPath = '/sfx/old_creaky_chest_ope_1-1759992997491.mp3';

        this.init();
    }

    async init() {
        // Initialize home screen navigation
        this.initHomeScreen();

        // Initialize PVP selection screen navigation
        this.initPVPSelection();

        // Initialize home music - HTML autoplay handles playing (muted)
        // We just unmute it here to bypass browser restrictions
        this.homeMusic = document.getElementById('home-music');
        if (this.homeMusic) {
            console.log('🎵 Home music element found (autoplay muted in HTML)');

            // Set volume (half volume)
            this.homeMusic.volume = 0.5;

            // Wait for the audio to be ready to play
            const startMusic = () => {
                console.log('🎵 Attempting to start home music...');
                console.log('   - paused:', this.homeMusic.paused);
                console.log('   - muted:', this.homeMusic.muted);
                console.log('   - readyState:', this.homeMusic.readyState);

                // Ensure it's playing (muted - user can unmute with button)
                if (this.homeMusic.paused) {
                    this.homeMusic.play()
                        .then(() => {
                            console.log('✅ Started playing (muted - use button to unmute)');
                        })
                        .catch(err => {
                            console.log('⚠️ Autoplay blocked by browser. Music will start on first interaction.');

                            // Add multiple interaction listeners as fallback
                            const playOnInteraction = (eventType) => {
                                console.log(`🎵 User interaction detected (${eventType}) - starting music (muted)...`);
                                if (this.homeMusic && this.homeMusic.paused) {
                                    this.homeMusic.play()
                                        .then(() => {
                                            console.log('✅ Home music now playing (muted - use button to unmute)');

                                            // Remove all listeners
                                            document.removeEventListener('click', clickHandler, true);
                                            document.removeEventListener('keydown', keyHandler, true);
                                            document.removeEventListener('touchstart', touchHandler, true);
                                        })
                                        .catch(e => console.log('Failed to play:', e));
                                }
                            };

                            const clickHandler = () => playOnInteraction('click');
                            const keyHandler = () => playOnInteraction('keydown');
                            const touchHandler = () => playOnInteraction('touchstart');

                            // Listen for any user interaction (capture phase)
                            document.addEventListener('click', clickHandler, true);
                            document.addEventListener('keydown', keyHandler, true);
                            document.addEventListener('touchstart', touchHandler, true);
                        });
                } else {
                    // Already playing (stays muted until user clicks button)
                    console.log('✅ Already playing (muted - use button to unmute)');
                }
            };

            // Try immediately
            setTimeout(startMusic, 100);
        } else {
            console.error('❌ Home music element not found!');
        }

        // Add start button functionality
        if (this.startButton) {
            this.startButton.addEventListener('click', () => {
                this.startTournament();
            });
        }

        // Render bracket
        this.renderBracket();

        // Chat functionality
        if (this.sendChatBtn) {
            this.sendChatBtn.addEventListener('click', () => this.sendUserMessage());
        }

        if (this.chatInput) {
            this.chatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.sendUserMessage();
                }
            });
        }

        // Essential systems
        this.startChatScroll();
        this.updateOdds();
        this.initProgressBar();
        this.updateProgressBar(); // Apply initial tier colors
        this.updateDisplay();
        this.hideRightFighter();
        this.initBracketOverlay();
        this.initBracketControls();
        this.emojiSystem.initEmojiButtons();
        this.initTestModeToggle();
        this.initLootClaimDevFrame();
        this.initClaimLootButton();
        this.initDevTabs();
        this.initAudioToggle();
    }

    initAudioToggle() {
        const muteBtn = document.getElementById('mute-audio');
        console.log('🔊 Audio button found:', muteBtn);
        if (!muteBtn) {
            console.error('❌ Audio button not found!');
            return;
        }

        muteBtn.addEventListener('click', () => {
            console.log('🔊 Audio button clicked! Current state:', this.audioMuted);
            this.audioMuted = !this.audioMuted;

            if (this.audioMuted) {
                // Mute everything
                this.backgroundMusic.pause();
                if (this.homeMusic) this.homeMusic.pause();
                const muteBtnImg = muteBtn.querySelector('.icon-img');
                if (muteBtnImg) {
                    muteBtnImg.src = '/images/UX Images/sound-off.png';
                    muteBtnImg.alt = 'Muted';
                }
                console.log('🔇 Audio muted');
            } else {
                // Unmute - only play music for current screen
                const currentScreen = this.gameManager.getCurrentScreen();
                if (currentScreen === 'home' && this.homeMusic) {
                    this.homeMusic.play().catch(e => console.log('Home music play failed:', e));
                } else if (currentScreen === 'tournament') {
                    this.backgroundMusic.play().catch(e => console.log('Arena music play failed:', e));
                }
                const muteBtnImg = muteBtn.querySelector('.icon-img');
                if (muteBtnImg) {
                    muteBtnImg.src = '/images/UX Images/Sound.png';
                    muteBtnImg.alt = 'Sound';
                }
                console.log('🔊 Audio unmuted');
            }

            // Mute/unmute all sound effects in combat system
            if (this.combatSystem) {
                this.combatSystem.setMuted(this.audioMuted);
            }
        });
        console.log('✅ Audio button listener attached');
    }

    /**
     * Initialize home screen navigation and buttons
     */
    initHomeScreen() {
        // Bottom bar buttons (new IDs with -bar suffix)
        const pvpBtn = document.getElementById('home-pvp-btn-bar');
        const pveBtn = document.getElementById('home-pve-btn-bar');
        const storeBtn = document.getElementById('home-store-btn-bar');
        const castleBtn = document.getElementById('home-castle-btn-bar');
        const dominionBtn = document.getElementById('home-dominion-btn-bar');
        const guildsBtn = document.getElementById('home-guilds-btn-bar');

        // Top buttons
        const settingsBtn = document.getElementById('home-settings-btn');
        const audioBtn = document.getElementById('home-audio-btn');

        // PVP button launches the PVP screen
        if (pvpBtn) {
            pvpBtn.addEventListener('click', () => {
                this.navigateToScreen('pvp');
            });
        }

        // PVE button - navigate to PVE screen
        if (pveBtn) {
            pveBtn.addEventListener('click', () => {
                this.navigateToScreen('pve');
            });
        }

        if (storeBtn) {
            storeBtn.addEventListener('click', () => {
                this.navigateToScreen('store');
            });
        }

        if (castleBtn) {
            castleBtn.addEventListener('click', () => {
                this.navigateToScreen('castle');
            });
        }

        if (dominionBtn) {
            dominionBtn.addEventListener('click', () => {
                this.navigateToScreen('dominion');
            });
        }

        if (guildsBtn) {
            guildsBtn.addEventListener('click', () => {
                alert('Guilds coming soon!');
            });
        }

        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => {
                alert('Settings coming soon!');
            });
        }

        if (audioBtn) {
            audioBtn.addEventListener('click', () => {
                this.audioMuted = !this.audioMuted;

                if (this.audioMuted) {
                    // Mute everything
                    this.backgroundMusic.pause();
                    if (this.homeMusic) this.homeMusic.pause();
                    const audioBtnImg = audioBtn.querySelector('.icon-img');
                    if (audioBtnImg) {
                        audioBtnImg.src = '/images/UX Images/sound-off.png';
                        audioBtnImg.alt = 'Muted';
                    }
                } else {
                    // Unmute - only play music for current screen
                    const currentScreen = this.gameManager.getCurrentScreen();
                    if (currentScreen === 'home' && this.homeMusic) {
                        this.homeMusic.play().catch(e => console.log('Home music play failed:', e));
                    } else if (currentScreen === 'tournament') {
                        this.backgroundMusic.play().catch(e => console.log('Arena music play failed:', e));
                    }
                    const audioBtnImg = audioBtn.querySelector('.icon-img');
                    if (audioBtnImg) {
                        audioBtnImg.src = '/images/UX Images/Sound.png';
                        audioBtnImg.alt = 'Sound';
                    }
                }

                // Mute/unmute all sound effects in combat system
                if (this.combatSystem) {
                    this.combatSystem.setMuted(this.audioMuted);
                }
            });
        }

        // Exit button is on PVP tournament screen, not home screen
        // Event listener added in initBracketOverlay() instead

        // START TOURNAMENT button - sets timer to 15s, opens PVP at 10s
        const startTournamentBtn = document.getElementById('start-tournament-btn');
        if (startTournamentBtn) {
            startTournamentBtn.addEventListener('click', () => {
                console.log('🏆 START TOURNAMENT clicked - setting timer to 15 seconds');

                // Clear any existing tournament start timeout
                if (this.startTournamentTimeout) {
                    clearTimeout(this.startTournamentTimeout);
                    this.startTournamentTimeout = null;
                }

                // Restart countdown with 15 seconds
                this.startHomeCountdown(15);

                // After 5 seconds (when timer hits 10), navigate to Tournament
                this.startTournamentTimeout = setTimeout(() => {
                    console.log('🏆 Auto-launching Tournament mode at 10 seconds');
                    this.navigateToScreen('tournament');
                    this.startTournamentTimeout = null;
                }, 5000);
            });
        }

        // Store screen event listeners
        const storeBackBtn = document.getElementById('store-back-btn');
        if (storeBackBtn) {
            storeBackBtn.addEventListener('click', () => {
                console.log('🔙 Returning to home from store');
                this.navigateToScreen('home');
            });
        }

        // Battle Pass overlay
        const battlepassBtn = document.getElementById('store-battlepass-btn');
        const battlepassOverlay = document.getElementById('battlepass-overlay');
        const battlepassCloseBtn = document.getElementById('battlepass-close-btn');
        const battlepassBackground = document.querySelector('.battlepass-background');

        if (battlepassBtn && battlepassOverlay) {
            battlepassBtn.addEventListener('click', () => {
                console.log('🎫 Opening Battle Pass');
                battlepassOverlay.classList.remove('hidden');
            });
        }

        if (battlepassCloseBtn && battlepassOverlay) {
            battlepassCloseBtn.addEventListener('click', () => {
                console.log('✕ Closing Battle Pass');
                battlepassOverlay.classList.add('hidden');
            });
        }

        if (battlepassBackground && battlepassOverlay) {
            battlepassBackground.addEventListener('click', () => {
                console.log('✕ Closing Battle Pass (background click)');
                battlepassOverlay.classList.add('hidden');
            });
        }

        const storeMainImage = document.getElementById('store-main-image');
        if (storeMainImage) {
            // Track current state
            let isWaving = false;

            storeMainImage.addEventListener('click', () => {
                // Toggle between shop.png and shop2.png
                if (isWaving) {
                    storeMainImage.src = '/images/shop/shop.png';
                    console.log('🏪 Switched to shop.png (not waving)');
                } else {
                    storeMainImage.src = '/images/shop/shop2.png';
                    console.log('🏪 Switched to shop2.png (waving)');
                }
                isWaving = !isWaving;
            });
        }

        // Castle screen event listeners
        const castleBackBtn = document.getElementById('castle-back-btn');
        if (castleBackBtn) {
            castleBackBtn.addEventListener('click', () => {
                console.log('🔙 Returning to home from Castle');
                this.navigateToScreen('home');
            });
        }

        const castleEnterBtn = document.getElementById('castle-enter-btn');
        if (castleEnterBtn) {
            castleEnterBtn.addEventListener('click', () => {
                console.log('🏰 Entering Castle');
                // For now, just return to home - can be expanded later
                this.navigateToScreen('home');
            });
        }

        // Top-right castle menu button
        const homeCastleMenuBtn = document.getElementById('home-castle-btn');
        if (homeCastleMenuBtn) {
            homeCastleMenuBtn.addEventListener('click', () => {
                console.log('🏰 Opening Castle from menu button');
                this.navigateToScreen('castle');
            });
        }

        // PVE screen event listeners
        const pveBackBtn = document.getElementById('pve-back-btn');
        if (pveBackBtn) {
            pveBackBtn.addEventListener('click', () => {
                console.log('🔙 Returning to home from PVE');
                this.navigateToScreen('home');
            });
        }

        // PVE Monster button click handlers
        const pveMonsterButtons = document.querySelectorAll('.pve-monster-btn');
        pveMonsterButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const monsterId = btn.dataset.monster;
                const isLocked = btn.classList.contains('pve-locked');

                if (!isLocked) {
                    console.log(`🎯 Starting battle against: ${monsterId}`);
                    this.pveBattleSystem.startBattle(monsterId);
                } else {
                    console.log(`🔒 Monster ${monsterId} is locked`);
                }
            });
        });

        // Dev Mode Unlock Button (PVE)
        const pveDevUnlockBtn = document.getElementById('pve-dev-unlock');
        if (pveDevUnlockBtn) {
            let devUnlocked = false;
            pveDevUnlockBtn.addEventListener('click', () => {
                devUnlocked = !devUnlocked;

                if (devUnlocked) {
                    // Unlock all monsters
                    console.log('🔓 DEV MODE: Unlocking all PVE monsters');
                    pveMonsterButtons.forEach(btn => {
                        btn.classList.remove('pve-locked');
                        const lockIcon = btn.querySelector('.pve-lock-icon');
                        if (lockIcon) {
                            lockIcon.style.display = 'none';
                        }
                    });
                    pveDevUnlockBtn.classList.add('unlocked');

                    // Change lock icon to unlocked (open lock)
                    const svg = pveDevUnlockBtn.querySelector('svg');
                    if (svg) {
                        svg.innerHTML = '<rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 9.9-1"></path>';
                    }
                } else {
                    // Lock all monsters (except wood dummy which stays unlocked)
                    console.log('🔒 DEV MODE: Re-locking PVE monsters');
                    pveMonsterButtons.forEach(btn => {
                        const monsterId = btn.dataset.monster;
                        if (monsterId !== 'wood-dummy') {
                            btn.classList.add('pve-locked');
                            const lockIcon = btn.querySelector('.pve-lock-icon');
                            if (lockIcon) {
                                lockIcon.style.display = 'block';
                            }
                        }
                    });
                    pveDevUnlockBtn.classList.remove('unlocked');

                    // Change icon back to locked
                    const svg = pveDevUnlockBtn.querySelector('svg');
                    if (svg) {
                        svg.innerHTML = '<rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path>';
                    }
                }
            });
        }

        // Dominion screen event listeners
        const dominionBackBtn = document.getElementById('dominion-back-btn');
        if (dominionBackBtn) {
            dominionBackBtn.addEventListener('click', () => {
                console.log('🔙 Returning to home from Dominion');
                this.navigateToScreen('home');
            });
        }

        // Map navigation and zoom state
        let mapPosX = 50; // Center X (percentage)
        let mapPosY = 50; // Center Y (percentage)
        let mapZoom = 100; // Zoom level (percentage) - Start fully zoomed out
        const panStep = 10; // How much to move per click (percentage)
        const zoomStep = 20; // How much to zoom per click (percentage)
        const maxZoom = 400;
        const minZoom = 100;

        const updateMapPosition = () => {
            const map = document.getElementById('dominion-map');
            if (map) {
                map.style.backgroundPosition = `${mapPosX}% ${mapPosY}%`;
                map.style.backgroundSize = `${mapZoom}%`;
                console.log(`🗺️ Map position: ${mapPosX}%, ${mapPosY}%, zoom: ${mapZoom}%`);
            }
        };

        // Map navigation button handlers
        const navUpBtn = document.getElementById('dominion-nav-up');
        const navDownBtn = document.getElementById('dominion-nav-down');
        const navLeftBtn = document.getElementById('dominion-nav-left');
        const navRightBtn = document.getElementById('dominion-nav-right');
        const zoomInBtn = document.getElementById('dominion-zoom-in');
        const zoomOutBtn = document.getElementById('dominion-zoom-out');

        if (navUpBtn) {
            navUpBtn.addEventListener('click', () => {
                mapPosY = Math.max(0, mapPosY - panStep);
                updateMapPosition();
            });
        }

        if (navDownBtn) {
            navDownBtn.addEventListener('click', () => {
                mapPosY = Math.min(100, mapPosY + panStep);
                updateMapPosition();
            });
        }

        if (navLeftBtn) {
            navLeftBtn.addEventListener('click', () => {
                mapPosX = Math.max(0, mapPosX - panStep);
                updateMapPosition();
            });
        }

        if (navRightBtn) {
            navRightBtn.addEventListener('click', () => {
                mapPosX = Math.min(100, mapPosX + panStep);
                updateMapPosition();
            });
        }

        if (zoomInBtn) {
            zoomInBtn.addEventListener('click', () => {
                mapZoom = Math.min(maxZoom, mapZoom + zoomStep);
                updateMapPosition();
            });
        }

        if (zoomOutBtn) {
            zoomOutBtn.addEventListener('click', () => {
                mapZoom = Math.max(minZoom, mapZoom - zoomStep);
                updateMapPosition();
            });
        }

        // Map drag functionality (mouse and touch)
        const dominionMap = document.getElementById('dominion-map');
        if (dominionMap) {
            let isDragging = false;
            let startX, startY;
            let startPosX, startPosY;

            // Mouse events
            dominionMap.addEventListener('mousedown', (e) => {
                isDragging = true;
                startX = e.clientX;
                startY = e.clientY;
                startPosX = mapPosX;
                startPosY = mapPosY;
                dominionMap.style.cursor = 'grabbing';
            });

            document.addEventListener('mousemove', (e) => {
                if (!isDragging) return;

                const deltaX = e.clientX - startX;
                const deltaY = e.clientY - startY;

                // Convert pixel movement to percentage (negative because dragging right means map moves left)
                const mapWidth = dominionMap.offsetWidth;
                const mapHeight = dominionMap.offsetHeight;
                const deltaPercentX = -(deltaX / mapWidth) * (mapZoom / 2);
                const deltaPercentY = -(deltaY / mapHeight) * (mapZoom / 2);

                mapPosX = Math.max(0, Math.min(100, startPosX + deltaPercentX));
                mapPosY = Math.max(0, Math.min(100, startPosY + deltaPercentY));
                updateMapPosition();
            });

            document.addEventListener('mouseup', () => {
                if (isDragging) {
                    isDragging = false;
                    dominionMap.style.cursor = 'grab';
                }
            });

            // Touch events
            dominionMap.addEventListener('touchstart', (e) => {
                if (e.touches.length === 1) {
                    isDragging = true;
                    const touch = e.touches[0];
                    startX = touch.clientX;
                    startY = touch.clientY;
                    startPosX = mapPosX;
                    startPosY = mapPosY;
                    e.preventDefault();
                }
            });

            dominionMap.addEventListener('touchmove', (e) => {
                if (!isDragging || e.touches.length !== 1) return;

                const touch = e.touches[0];
                const deltaX = touch.clientX - startX;
                const deltaY = touch.clientY - startY;

                const mapWidth = dominionMap.offsetWidth;
                const mapHeight = dominionMap.offsetHeight;
                const deltaPercentX = -(deltaX / mapWidth) * (mapZoom / 2);
                const deltaPercentY = -(deltaY / mapHeight) * (mapZoom / 2);

                mapPosX = Math.max(0, Math.min(100, startPosX + deltaPercentX));
                mapPosY = Math.max(0, Math.min(100, startPosY + deltaPercentY));
                updateMapPosition();
                e.preventDefault();
            });

            dominionMap.addEventListener('touchend', () => {
                isDragging = false;
            });

            // Set initial cursor
            dominionMap.style.cursor = 'grab';
        }

        // Monster button handlers - REMOVED (duplicate, see PVE screen event listeners above)
        // Now handled by pveBattleSystem in the PVE screen event listeners section

        // Update home screen stats
        this.updateHomeScreenStats();

        // Start home screen countdown
        this.startHomeCountdown();

        // Initialize parallax effect
        this.initParallax();

        console.log('🏠 Home screen initialized');
    }

    /**
     * Initialize PVP selection screen navigation
     */
    initPVPSelection() {
        const pvpTournamentBtn = document.getElementById('pvp-tournament-btn');
        const pvpLegendsBtn = document.getElementById('pvp-legends-btn');
        const pvpBackBtn = document.getElementById('pvp-back-btn');

        // Tournament button - navigate to tournament screen
        if (pvpTournamentBtn) {
            pvpTournamentBtn.addEventListener('click', () => {
                this.navigateToScreen('tournament');
            });
        }

        // Legends button - show coming soon message (disabled for now)
        if (pvpLegendsBtn) {
            pvpLegendsBtn.addEventListener('click', () => {
                console.log('⚔️ Legends mode coming soon!');
                // Could add a toast notification here in the future
            });
        }

        // Back button - return to home screen
        if (pvpBackBtn) {
            pvpBackBtn.addEventListener('click', () => {
                this.navigateToScreen('home');
            });
        }

        console.log('⚔️ PVP screen initialized');
    }

    /**
     * Initialize mouse parallax effect for home screen
     */
    initParallax() {
        const parallaxLayers = document.querySelectorAll('.parallax-logo, .parallax-castle, .parallax-trees');
        const characters = document.querySelectorAll('.home-character');
        const storeImage = document.getElementById('store-main-image');
        // No parallax buttons now - all moved to bottom bar

        // Auto-drift animation using requestAnimationFrame
        let startTime = Date.now();
        let animationId = null;

        const animateParallax = () => {
            const currentScreen = this.gameManager.currentScreen;

            // Only apply parallax if on home or store screen
            if (currentScreen !== 'home' && currentScreen !== 'store') {
                // Stop animation when not on parallax-enabled screens to save resources
                if (animationId) {
                    cancelAnimationFrame(animationId);
                    animationId = null;
                }
                return;
            }

            const elapsed = (Date.now() - startTime) / 1000; // Time in seconds

            // Create slow, smooth drift using sine waves
            // Different frequencies for X and Y create organic movement
            const xOffset = Math.sin(elapsed * 0.15) * 0.8; // Slow horizontal drift
            const yOffset = Math.sin(elapsed * 0.1) * 0.5;  // Even slower vertical drift

            // Apply parallax to home screen elements
            if (currentScreen === 'home') {
                // Apply parallax to background layers
                parallaxLayers.forEach(layer => {
                    const speed = parseFloat(layer.dataset.speed) || 0.5;
                    const moveX = xOffset * 22.5 * speed; // Reduced by 50%: 22.5px max movement scaled by speed
                    const moveY = yOffset * 15 * speed; // Reduced by 50%: 15px max vertical

                    layer.style.transform = `translate3d(${moveX}px, ${moveY}px, 0)`; // Use translate3d for GPU acceleration
                });

                // Apply parallax to characters (faster movement, they're in front)
                characters.forEach((char) => {
                    // Hero in front gets more parallax than side characters
                    const speed = char.classList.contains('home-hero') ? 1.0 : 0.7;
                    const moveX = xOffset * 22.5 * speed;
                    const moveY = yOffset * 15 * speed;

                    // Hero is centered, so use translateX(-50%) + parallax
                    if (char.classList.contains('home-hero')) {
                        char.style.transform = `translateX(-50%) translate3d(${moveX}px, ${moveY}px, 0)`; // GPU accelerated
                    } else {
                        char.style.transform = `translate3d(${moveX}px, ${moveY}px, 0)`; // GPU accelerated
                    }
                });

                // No parallax on home buttons now - all moved to bottom bar
            }

            // Apply parallax to store screen
            if (currentScreen === 'store' && storeImage) {
                const speed = parseFloat(storeImage.dataset.speed) || 0.3;
                const moveX = xOffset * 22.5 * speed; // Reduced by 50%
                const moveY = yOffset * 15 * speed;

                // Preserve the centering transform
                storeImage.style.transform = `translate(-50%, -50%) translate3d(${moveX}px, ${moveY}px, 0)`;
            }

            animationId = requestAnimationFrame(animateParallax);
        };

        // Start the animation loop
        animationId = requestAnimationFrame(animateParallax);

        // Store animation ID for cleanup
        this.parallaxAnimationId = animationId;

        console.log('🌄 Auto-drift parallax effect initialized');
    }

    /**
     * Home screen countdown timer (decorative, loops continuously)
     * @param {number} customStartTime - Optional custom start time in seconds (defaults to 9100 = 02:31:40)
     */
    startHomeCountdown(customStartTime = null) {
        const homeTimer = document.querySelector('#home-countdown-timer .countdown-time');
        if (!homeTimer) return;

        // Start at custom time or default 02:31:40 (2 hours 31 minutes 40 seconds = 9100 seconds)
        let timeRemaining = customStartTime !== null ? customStartTime : 9100;
        const resetTime = customStartTime !== null ? customStartTime : 9100;

        const updateTimer = () => {
            const hours = Math.floor(timeRemaining / 3600);
            const minutes = Math.floor((timeRemaining % 3600) / 60);
            const seconds = timeRemaining % 60;
            const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            homeTimer.textContent = formattedTime;
        };

        // Initial display
        updateTimer();

        // Clear any existing interval
        if (this.homeCountdownInterval) {
            clearInterval(this.homeCountdownInterval);
        }

        // Countdown interval - loops back to reset time when reaching 0
        this.homeCountdownInterval = setInterval(() => {
            timeRemaining--;
            if (timeRemaining < 0) {
                timeRemaining = resetTime; // Reset to custom or default time
            }
            updateTimer();
        }, 1000);
    }

    /**
     * Navigate to a different screen - each screen is completely self-contained
     */
    navigateToScreen(screenName) {
        console.log(`🎮 Navigating to ${screenName}`);

        // Update GameManager state
        this.gameManager.navigateTo(screenName);

        // Hide all screens
        const screens = document.querySelectorAll('.game-screen');
        screens.forEach(screen => screen.classList.add('hidden'));

        // Show target screen
        const targetScreen = document.getElementById(`${screenName}-screen`);
        if (targetScreen) {
            targetScreen.classList.remove('hidden');
        }

        // === HOME SCREEN ===
        if (screenName === 'home') {
            // Stop ALL PVP activity completely
            this.stopAllPVPActivity();

            // Resume home music if it was playing (respects mute state)
            if (this.homeMusic) {
                this.homeMusic.volume = 0.5; // Half volume

                // Only restart if not already playing and not muted
                if (this.homeMusic.paused && !this.homeMusic.muted) {
                    this.homeMusic.currentTime = 0; // Start from beginning
                    this.homeMusic.play().catch(e => console.log('Home music play failed:', e));
                }
            }

            // Update home screen stats
            this.updateHomeScreenStats();

            // Reset countdown timer to default (02:31:40)
            this.startHomeCountdown();
        }

        // === STORE SCREEN ===
        else if (screenName === 'store') {
            // Keep home music playing in background
            if (this.homeMusic) {
                this.homeMusic.volume = 0.5; // Half volume

                // Start music if not playing and not muted
                if (this.homeMusic.paused && !this.homeMusic.muted) {
                    this.homeMusic.play().catch(e => console.log('Home music play failed:', e));
                }
            }
        }

        // === CASTLE SCREEN ===
        else if (screenName === 'castle') {
            // Keep home music playing in background
            if (this.homeMusic) {
                this.homeMusic.volume = 0.5; // Half volume

                // Start music if not playing and not muted
                if (this.homeMusic.paused && !this.homeMusic.muted) {
                    this.homeMusic.play().catch(e => console.log('Home music play failed:', e));
                }
            }
        }

        // === PVE SCREEN ===
        else if (screenName === 'pve') {
            // Keep home music playing in background
            if (this.homeMusic) {
                this.homeMusic.volume = 0.5; // Half volume

                // Start music if not playing and not muted
                if (this.homeMusic.paused && !this.homeMusic.muted) {
                    this.homeMusic.play().catch(e => console.log('Home music play failed:', e));
                }
            }
        }

        // === DOMINION SCREEN ===
        else if (screenName === 'dominion') {
            // Keep home music playing in background
            if (this.homeMusic) {
                this.homeMusic.volume = 0.5; // Half volume

                // Start music if not playing and not muted
                if (this.homeMusic.paused && !this.homeMusic.muted) {
                    this.homeMusic.play().catch(e => console.log('Home music play failed:', e));
                }
            }
        }

        // === PVP SCREEN ===
        else if (screenName === 'pvp') {
            // Stop ALL PVP tournament activity completely (like going to home)
            this.stopAllPVPActivity();

            // Keep home music playing in background
            if (this.homeMusic) {
                this.homeMusic.volume = 0.5; // Half volume

                // Start music if not playing and not muted
                if (this.homeMusic.paused && !this.homeMusic.muted) {
                    this.homeMusic.play().catch(e => console.log('Home music play failed:', e));
                }
            }
        }

        // === TOURNAMENT SCREEN ===
        else if (screenName === 'tournament') {
            // Stop home music completely
            if (this.homeMusic) {
                this.homeMusic.pause();
                this.homeMusic.currentTime = 0;
                this.homeMusic.muted = true; // Re-mute for next time
            }

            // Complete reset of tournament (like a fresh page load)
            this.resetTournament();

            // Start arena music (if not muted)
            if (!this.audioMuted) {
                this.backgroundMusic.currentTime = 0; // Start from beginning
                this.backgroundMusic.play().catch(e => console.log('Arena music play failed:', e));
            }

            // Auto-start fresh tournament
            this.startTournament();
        }
    }

    /**
     * Start a battle with a specific monster (PVE mode)
     * DEPRECATED: Now handled by PVEBattleSystem
     */
    // startMonsterBattle(monsterName) - REMOVED, see PVEBattleSystem instead

    /**
     * Stop all PVP tournament activity and reset tournament state
     */
    stopAllPVPActivity() {
        console.log('⏹️ Stopping ALL PVP activity...');

        // CRITICAL: Stop auto-continue FIRST to prevent new battles from starting
        this.autoContinue = false;

        // CRITICAL: Stop combat immediately if active
        if (this.combatSystem) {
            this.combatSystem.combatEnded = true; // Stop combat progression
            this.combatSystem.setMuted(true); // Mute all combat sounds immediately
        }

        // Stop all music and audio
        this.backgroundMusic.pause();
        this.backgroundMusic.currentTime = 0;

        // Stop active bye sound if playing
        if (this.activeByeSound) {
            this.activeByeSound.pause();
            this.activeByeSound.currentTime = 0;
            this.activeByeSound = null;
        }

        // Stop countdown interval
        if (this.pvpCountdownInterval) {
            clearInterval(this.pvpCountdownInterval);
            this.pvpCountdownInterval = null;
        }

        // Stop home countdown interval
        if (this.homeCountdownInterval) {
            clearInterval(this.homeCountdownInterval);
            this.homeCountdownInterval = null;
        }

        // Stop Lady Luck animation
        this.stopLadyLuckAnimation();

        // Stop emoji reactions and clear all floating emojis
        if (this.emojiSystem) {
            this.emojiSystem.stopEmojiReactions();
            this.emojiSystem.clearAllEmojis();
        }

        // Stop victory coin shower
        this.stopVictoryCoinShower();

        // Stop chat mode syncing
        if (this.chatModeSyncInterval) {
            clearInterval(this.chatModeSyncInterval);
            this.chatModeSyncInterval = null;
        }

        // Clear combat system reference (combat will stop when autoContinue is false)
        if (this.combatSystem) {
            this.combatSystem = null;
        }

        // Clear any active battle status displays
        if (this.battleStatus) {
            this.battleStatus.style.opacity = '0';
            this.battleStatus.innerHTML = '';
        }

        // Reset ALL tournament state flags
        this.tournamentStarted = false;
        this.battleInProgress = false;
        this.isFirstBattle = true;
        this.heroEliminated = false;
        this.heroLootClaimed = false;
        this.tournamentLootClaimed = false;
        this.heroMaxRound = 0;
        this.previousWinnerName = null;

        // Reset fighters to initial state
        this.resetFighters();

        // Clean up any combat elements
        this.cleanupCombatElements();

        console.log('✅ All PVP activity stopped and tournament state reset');
    }

    /**
     * Reset tournament to initial state
     */
    resetTournament() {
        console.log('🔄 Resetting tournament - COMPLETE STOP...');

        // === STOP ALL ACTIVE ANIMATIONS/SOUNDS ===

        // Stop PVP countdown timer
        if (this.pvpCountdownInterval) {
            clearInterval(this.pvpCountdownInterval);
            this.pvpCountdownInterval = null;
        }

        // Stop Lady Luck animation
        this.stopLadyLuckAnimation();

        // Stop emoji reactions
        if (this.emojiSystem) {
            this.emojiSystem.stopEmojiReactions();
        }

        // Stop victory coin shower
        this.stopVictoryCoinShower();

        // Clean up combat elements
        this.cleanupCombatElements();

        // Stop combat system if active
        if (this.combatSystem) {
            // Combat system doesn't have a stop method, but setting to null will help
            this.combatSystem = null;
        }

        // === RESET STATE FLAGS ===

        this.tournamentStarted = false;
        this.autoContinue = false;
        this.battleInProgress = false;
        this.isFirstBattle = true;
        this.heroEliminated = false;
        this.heroLootClaimed = false;
        this.tournamentLootClaimed = false;
        this.heroMaxRound = 0;

        // === RESET UI ELEMENTS ===

        // Hide countdown overlay for next tournament
        if (this.countdownOverlay) {
            this.countdownOverlay.classList.add('hidden');
        }

        // Reset countdown timer display
        if (this.countdownTimer) {
            this.countdownTimer.textContent = '00:00:10';
        }

        // === CREATE FRESH TOURNAMENT ===

        // Create new tournament bracket
        this.tournament = new window.TournamentBracket();

        // Update bracket system with new tournament
        this.bracketSystem = new BracketSystem(this.bracketDisplay, this.tournament);

        // Re-render bracket
        this.renderBracket();

        console.log('✅ Tournament COMPLETELY reset - all animations/sounds stopped');
    }

    /**
     * Update home screen stat displays
     */
    updateHomeScreenStats() {
        const stats = this.gameManager.getPlayerStats();

        const goldDisplayTop = document.getElementById('home-gold-display-top');
        const gemsDisplay = document.getElementById('home-gems-display');

        if (goldDisplayTop) {
            goldDisplayTop.textContent = stats.gold;
        }

        if (gemsDisplay) {
            gemsDisplay.textContent = stats.gems;
        }
    }

    initTestModeToggle() {
        const daringHeroCheckbox = document.getElementById('daring-hero-checkbox');
        if (daringHeroCheckbox) {
            daringHeroCheckbox.addEventListener('change', (e) => {
                // Inverted: checked = track all battles, unchecked = only hero
                this.heroLootOnlyMode = !e.target.checked;
                console.log('Daring Hero Tracking:', e.target.checked ? 'ALL BATTLES' : 'HERO ONLY');

                const claimBtn = document.getElementById('claim-loot-btn');
                const lootBox = document.getElementById('loot-box');

                if (e.target.checked) {
                    this.chatSystem.addChatMessage('🌐 TRACKING ALL BATTLE LOOT');

                    // Hide/show elements based on tournament loot claim state
                    if (this.tournamentLootClaimed) {
                        // Don't call updateLootBox - just show helmet directly (already claimed)
                        const roundInfo = this.tournament.getRoundInfo();
                        // Update banner to current tournament tier even though loot is claimed
                        this.updateLootBanner(roundInfo);

                        // Show helmet if already claimed in this mode
                        if (claimBtn) claimBtn.style.display = 'none';
                        if (lootBox) {
                            lootBox.style.display = '';
                            lootBox.innerHTML = `
                                <img src="/images/Loot Items/Loot_helmet_test.png"
                                     alt="Legendary Helmet"
                                     class="loot-helmet-claimed"
                                     style="
                                         position: absolute;
                                         top: calc(48% - 260px);
                                         left: 50%;
                                         transform: translate(-50%, -50%);
                                         width: 333px;
                                         height: auto;
                                         object-fit: contain;
                                         filter: drop-shadow(0 0 20px rgba(255, 215, 0, 1)) drop-shadow(0 0 40px rgba(255, 255, 255, 0.8));
                                         animation: helmetWiggle 1s ease-in-out infinite, helmetGlow 2s ease-in-out infinite;
                                         z-index: 10;
                                     ">
                            `;
                        }
                    } else {
                        // Update loot to current tournament round (chest not yet claimed)
                        const roundInfo = this.tournament.getRoundInfo();
                        this.lootSystem.updateLootBox(roundInfo);

                        // Show chest and possibly claim button if tournament is complete
                        if (lootBox) {
                            lootBox.classList.remove('claimable');
                            lootBox.style.display = '';
                        }
                        // Show button if tournament is complete
                        if (this.tournament?.isComplete()) {
                            this.showClaimLootButton();
                        } else {
                            // Hide claim button during tournament
                            if (claimBtn) {
                                claimBtn.classList.add('hidden');
                                claimBtn.style.display = '';
                            }
                        }
                    }
                } else {
                    this.chatSystem.addChatMessage('🎯 TRACKING HERO WINS ONLY');

                    // Hide/show elements based on hero loot claim state
                    if (this.heroLootClaimed) {
                        // Don't call updateLootBox - just show helmet directly (already claimed)
                        // Update banner to hero's tier even though loot is claimed
                        if (this.heroMaxRound > 0) {
                            this.updateLootBanner({ current: this.heroMaxRound });
                        }

                        // Show helmet if already claimed in this mode
                        if (claimBtn) claimBtn.style.display = 'none';
                        if (lootBox) {
                            lootBox.style.display = '';
                            lootBox.innerHTML = `
                                <img src="/images/Loot Items/Loot_helmet_test.png"
                                     alt="Legendary Helmet"
                                     class="loot-helmet-claimed"
                                     style="
                                         position: absolute;
                                         top: calc(48% - 260px);
                                         left: 50%;
                                         transform: translate(-50%, -50%);
                                         width: 333px;
                                         height: auto;
                                         object-fit: contain;
                                         filter: drop-shadow(0 0 20px rgba(255, 215, 0, 1)) drop-shadow(0 0 40px rgba(255, 255, 255, 0.8));
                                         animation: helmetWiggle 1s ease-in-out infinite, helmetGlow 2s ease-in-out infinite;
                                         z-index: 10;
                                     ">
                            `;
                        }
                    } else {
                        // Update loot back to hero's max round (chest not yet claimed)
                        if (this.heroMaxRound > 0) {
                            this.lootSystem.updateLootBox({ current: this.heroMaxRound });
                        }

                        // Show button only if hero has been eliminated
                        if (claimBtn) claimBtn.style.display = '';
                        if (lootBox) lootBox.style.display = '';
                        this.showClaimLootButton();
                    }
                }

                // Update chevron position and color based on toggle state
                this.updateHeroProgressIndicator();
            });
        }
    }

    /**
     * Update just the loot banner/header (for when loot is already claimed)
     */
    updateLootBanner(roundInfo) {
        const lootHeaderBottom = document.querySelector('.loot-header-bottom');
        if (!lootHeaderBottom) return;

        const lootTiers = [
            { name: 'grey', material: 'Wood', rarity: 'Common' },
            { name: 'green', material: 'Stone', rarity: 'Uncommon' },
            { name: 'blue', material: 'Copper', rarity: 'Rare' },
            { name: 'teal', material: 'Bronze', rarity: 'Superior' },
            { name: 'purple', material: 'Silver', rarity: 'Epic' },
            { name: 'orange', material: 'Gold', rarity: 'Legendary' },
            { name: 'crimson', material: 'Diamond', rarity: 'Mythic' },
            { name: 'gold', material: 'Platinum', rarity: 'Exalted' }
        ];

        const currentRound = Math.max(0, roundInfo.current - 1);
        const lootTier = lootTiers[Math.min(currentRound, lootTiers.length - 1)];

        const material = lootTier.material.toUpperCase();
        const rarity = lootTier.rarity.toUpperCase();
        lootHeaderBottom.innerHTML = `${material} CHEST<br>${rarity} LOOT`;

        const tierColors = {
            'grey': 'linear-gradient(135deg, #808080, #a0a0a0, #606060)',
            'green': 'linear-gradient(135deg, #00ff7f, #32cd32, #228b22)',
            'blue': 'linear-gradient(135deg, #4169e1, #1e90ff, #0066cc)',
            'teal': 'linear-gradient(135deg, #00CED1, #20B2AA, #008B8B)',
            'purple': 'linear-gradient(135deg, #8a2be2, #9370db, #6a0dad)',
            'orange': 'linear-gradient(135deg, #ff8c00, #ffa500, #ff6347)',
            'crimson': 'linear-gradient(135deg, #DC143C, #B22222, #8B0000)',
            'gold': 'linear-gradient(135deg, #ffd700, #ffed4a, #daa520)'
        };

        const tierName = lootTier.name.toLowerCase();
        if (tierColors[tierName]) {
            lootHeaderBottom.style.background = tierColors[tierName];
            lootHeaderBottom.style.color = '#fff';
        }
    }

    initLootClaimDevFrame() {
        const lootClaimOverlay = document.getElementById('loot-claim-overlay');
        const popupLootContainer = document.querySelector('.popup-loot-container');
        const popupLootBox = document.getElementById('popup-loot-box');

        if (lootClaimOverlay) {
            // Click overlay background to close
            lootClaimOverlay.addEventListener('click', (e) => {
                // Close if clicking on the overlay background (not the container)
                if (e.target === lootClaimOverlay || e.target.classList.contains('loot-claim-viewport')) {
                    lootClaimOverlay.classList.add('hidden');

                    // If loot was claimed in current mode, replace chest with glowing helmet
                    const isLootClaimedInCurrentMode = this.heroLootOnlyMode ? this.heroLootClaimed : this.tournamentLootClaimed;
                    if (isLootClaimedInCurrentMode) {
                        const claimBtn = document.getElementById('claim-loot-btn');
                        const lootBox = document.getElementById('loot-box');

                        if (claimBtn) claimBtn.style.display = 'none';

                        // Replace chest with glowing helmet (centered using absolute positioning)
                        // Note: parent .treasure-chest has scale(0.31), so 333px width = ~103px displayed
                        if (lootBox) {
                            lootBox.innerHTML = `
                                <img src="/images/Loot Items/Loot_helmet_test.png"
                                     alt="Legendary Helmet"
                                     class="loot-helmet-claimed"
                                     style="
                                         position: absolute;
                                         top: calc(48% - 260px);
                                         left: 50%;
                                         transform: translate(-50%, -50%);
                                         width: 333px;
                                         height: auto;
                                         object-fit: contain;
                                         filter: drop-shadow(0 0 20px rgba(255, 215, 0, 1)) drop-shadow(0 0 40px rgba(255, 255, 255, 0.8));
                                         animation: helmetWiggle 1s ease-in-out infinite, helmetGlow 2s ease-in-out infinite;
                                         z-index: 10;
                                     ">
                            `;
                        }
                    }
                }
            });
        }

        // Prevent clicks inside the popup container from closing (except chest click)
        if (popupLootContainer) {
            popupLootContainer.addEventListener('click', (e) => {
                e.stopPropagation();
            });
        }

        // Click on chest to reveal helmet
        if (popupLootBox) {
            popupLootBox.addEventListener('click', () => {
                this.revealHelmet();
            });
        }
    }

    initClaimLootButton() {
        const claimBtn = document.getElementById('claim-loot-btn');
        console.log('🎁 Claim loot button found:', claimBtn);
        if (claimBtn) {
            claimBtn.addEventListener('click', () => {
                console.log('🎁 Claim loot button clicked!');
                this.claimLoot();
            });
            console.log('✅ Claim loot button listener attached');
        } else {
            console.log('⚠️ Claim loot button not found - may appear after tournament win');
        }
    }

    showClaimLootButton() {
        console.log('showClaimLootButton called', {
            heroLootOnlyMode: this.heroLootOnlyMode,
            heroEliminated: this.heroEliminated,
            tournamentComplete: this.tournament?.isComplete()
        });

        const claimBtn = document.getElementById('claim-loot-btn');
        const lootBox = document.getElementById('loot-box');

        // Check if loot has already been claimed in current mode
        const isAlreadyClaimed = this.heroLootOnlyMode ? this.heroLootClaimed : this.tournamentLootClaimed;

        if (isAlreadyClaimed) {
            console.log('Loot already claimed in current mode');
            if (claimBtn) claimBtn.style.display = 'none';
            return;
        }

        // Show button if:
        // 1. Tournament is complete (any mode), OR
        // 2. Hero-only mode AND hero has been eliminated
        const shouldShow = this.tournament?.isComplete() || (this.heroLootOnlyMode && this.heroEliminated);

        if (!shouldShow) {
            console.log('Button not shown - conditions not met');
            return;
        }

        console.log('Elements found:', { claimBtn, lootBox });

        if (claimBtn) {
            claimBtn.classList.remove('hidden');
            claimBtn.style.display = '';
            console.log('Button shown!');
        }

        if (lootBox) {
            lootBox.classList.add('claimable');
            console.log('Chest glow added!');
        }
    }

    claimLoot() {
        // Check if loot already claimed in current mode
        const isAlreadyClaimed = this.heroLootOnlyMode ? this.heroLootClaimed : this.tournamentLootClaimed;
        if (isAlreadyClaimed) {
            console.log('⚠️ Loot already claimed in current mode');
            this.chatSystem.addAnnouncerMessage('⚠️ LOOT ALREADY CLAIMED IN THIS MODE!');
            return;
        }

        const lootClaimOverlay = document.getElementById('loot-claim-overlay');
        const popupLootBox = document.getElementById('popup-loot-box');
        const popupLootDisplay = document.querySelector('.popup-loot-display');

        // Fully reset popup content to ensure clean state (remove any leftover helmet from other mode)
        if (popupLootDisplay) {
            // Remove any helmets that might be lingering from previous claims
            const existingHelmet = popupLootDisplay.querySelector('.loot-helmet');
            if (existingHelmet) {
                existingHelmet.remove();
                console.log('Removed leftover helmet from popup');
            }
        }
        if (popupLootBox) {
            popupLootBox.classList.remove('opened');
        }

        // Update popup loot to match current loot tier before showing
        const roundInfo = this.heroLootOnlyMode
            ? { current: this.heroMaxRound }
            : this.tournament.getRoundInfo();

        if (roundInfo && roundInfo.current > 0) {
            this.lootSystem.updatePopupLoot(this.getLootTierInfo(roundInfo));
        }

        // Show the loot claim popup overlay (keep button and glow visible)
        if (lootClaimOverlay) {
            lootClaimOverlay.classList.remove('hidden');
        }

        // Add feedback message
        this.chatSystem.addAnnouncerMessage('🎁 CLICK THE CHEST TO OPEN! 🎁');
    }

    getLootTierInfo(roundInfo) {
        const lootTiers = [
            { name: 'grey', material: 'Wood', rarity: 'Common', chestNumber: 8 },
            { name: 'green', material: 'Stone', rarity: 'Uncommon', chestNumber: 7 },
            { name: 'blue', material: 'Copper', rarity: 'Rare', chestNumber: 6 },
            { name: 'teal', material: 'Bronze', rarity: 'Superior', chestNumber: 5 },
            { name: 'purple', material: 'Silver', rarity: 'Epic', chestNumber: 4 },
            { name: 'orange', material: 'Gold', rarity: 'Legendary', chestNumber: 3 },
            { name: 'crimson', material: 'Diamond', rarity: 'Mythic', chestNumber: 2 },
            { name: 'gold', material: 'Platinum', rarity: 'Exalted', chestNumber: 1 }
        ];

        const currentRound = Math.max(0, roundInfo.current - 1);
        return lootTiers[Math.min(currentRound, lootTiers.length - 1)];
    }

    revealHelmet() {
        console.log('revealHelmet() called');
        const popupLootBox = document.getElementById('popup-loot-box');
        const popupLootDisplay = document.querySelector('.popup-loot-display');

        // Check if loot already claimed in current mode
        const isAlreadyClaimed = this.heroLootOnlyMode ? this.heroLootClaimed : this.tournamentLootClaimed;
        console.log('Loot claim check:', { popupLootBox, popupLootDisplay, isAlreadyClaimed, audioMuted: this.audioMuted });
        if (!popupLootBox || !popupLootDisplay || isAlreadyClaimed) {
            console.log('Exiting early - elements missing or already claimed');
            return;
        }

        // Play chest opening sound
        if (!this.audioMuted) {
            console.log('Attempting to play chest sound...');
            // Create a fresh audio instance using the path directly
            const chestSound = new Audio(this.chestOpenSoundPath);
            chestSound.volume = 0.5;
            chestSound.play().then(() => {
                console.log('Chest sound playing successfully!');
            }).catch(err => {
                console.error('Chest sound failed:', err);
            });
        } else {
            console.log('Audio is muted, skipping chest sound');
        }

        // Set the appropriate claim flag based on current mode
        if (this.heroLootOnlyMode) {
            this.heroLootClaimed = true;
        } else {
            this.tournamentLootClaimed = true;
        }

        // Remove chest glow and wiggle
        popupLootBox.classList.remove('claimable');
        const chestImage = popupLootBox.querySelector('.popup-loot-chest-image');
        if (chestImage) {
            chestImage.style.animation = 'none';
            chestImage.style.filter = 'none';
        }

        // Create helmet element
        const helmet = document.createElement('img');
        helmet.src = '/images/Loot Items/Loot_helmet_test.png';
        helmet.className = 'loot-helmet';
        helmet.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) scale(0);
            width: 200px;
            height: 200px;
            object-fit: contain;
            opacity: 0;
            transition: all 0.5s ease;
            filter: drop-shadow(0 0 20px rgba(255, 215, 0, 1)) drop-shadow(0 0 40px rgba(255, 255, 255, 0.8));
            animation: helmetWiggle 1s ease-in-out infinite, helmetGlow 2s ease-in-out infinite;
            z-index: 100;
        `;

        popupLootDisplay.appendChild(helmet);

        // Animate helmet reveal
        setTimeout(() => {
            helmet.style.transform = 'translate(-50%, -50%) scale(1)';
            helmet.style.opacity = '1';
        }, 100);

        // Fade out chest
        if (chestImage) {
            chestImage.style.transition = 'opacity 0.5s ease';
            chestImage.style.opacity = '0';
        }

        // Add feedback message
        this.chatSystem.addAnnouncerMessage('✨ LEGENDARY HELMET OBTAINED! ✨');
        this.chatSystem.addChatMessage('A rare treasure!');
    }

    // ===== Background Music =====

    startBackgroundMusic() {
        // Try to play background music
        // Note: browsers may block autoplay, so we handle the error gracefully
        this.backgroundMusic.play().catch(err => {
            console.log('Background music autoplay blocked:', err);
            // Add user interaction listener to start music
            const startMusic = () => {
                this.backgroundMusic.play().catch(e => console.log('Music play failed:', e));
                document.removeEventListener('click', startMusic);
            };
            document.addEventListener('click', startMusic);
        });
    }

    // ===== Tournament Flow =====

    /**
     * Start the countdown timer
     */
    startCountdown() {
        let timeRemaining = 10; // 10 seconds

        // Update timer display
        const updateTimer = () => {
            const minutes = Math.floor(timeRemaining / 60);
            const seconds = timeRemaining % 60;
            const formattedTime = `00:00:${seconds.toString().padStart(2, '0')}`;
            if (this.countdownTimer) {
                this.countdownTimer.textContent = formattedTime;
            }
        };

        // Initial display
        updateTimer();

        // Clear any existing countdown interval
        if (this.pvpCountdownInterval) {
            clearInterval(this.pvpCountdownInterval);
        }

        // Countdown interval
        this.pvpCountdownInterval = setInterval(() => {
            timeRemaining--;
            updateTimer();

            if (timeRemaining <= 0) {
                clearInterval(this.pvpCountdownInterval);
                this.pvpCountdownInterval = null;
                // Hide countdown overlay
                if (this.countdownOverlay) {
                    this.countdownOverlay.classList.add('hidden');
                }
                // Proceed with tournament start
                this.proceedWithTournamentStart();
            }
        }, 1000);
    }

    /**
     * Proceed with the actual tournament start (after countdown)
     */
    proceedWithTournamentStart() {
        // Check if first round is a bye - if so, skip initial nameplate animation
        const firstBye = this.tournament.hasFollowedCharacterBye();

        if (!firstBye) {
            // CRITICAL: Reset fighters FIRST before anything else
            // This ensures they're fully off-screen and hidden
            this.resetFighters();

            // Get the first match to populate nameplate names AND titles
            const firstMatch = this.tournament.getCurrentMatch();
            if (firstMatch) {
                const displayOrder = this.tournament.getDisplayOrder();

                // Populate nameplate names
                if (this.leftFighterNameEl && displayOrder) {
                    this.leftFighterNameEl.textContent = this.tournament.getCharacterName(displayOrder.leftFighter);
                }
                if (this.rightFighterNameEl && displayOrder) {
                    this.rightFighterNameEl.textContent = this.tournament.getCharacterName(displayOrder.rightFighter);
                }

                // CRITICAL: Also populate titles BEFORE animation so height is stable
                if (this.leftFighterTitlesEl && displayOrder) {
                    const leftTitles = this.tournament.getCharacterTitles(displayOrder.leftFighter);
                    this.leftFighterTitlesEl.textContent = leftTitles.join(' • ');
                }
                if (this.rightFighterTitlesEl && displayOrder) {
                    const rightTitles = this.tournament.getCharacterTitles(displayOrder.rightFighter);
                    this.rightFighterTitlesEl.textContent = rightTitles.join(' • ');
                }

                // Note: Images will be loaded later by startBattle()
            }

            // Animate nameplates into view immediately (scoped to PVP)
            const nameplateContainer = this.tournamentScreen.querySelector('.nameplate-vs-container');
            if (nameplateContainer) {
                // Remove visible class first to ensure clean start
                nameplateContainer.classList.remove('visible');

                // Clear any lingering inline styles from previous victory animations
                nameplateContainer.removeAttribute('style');

                // Force browser to recognize the reset state
                nameplateContainer.offsetHeight;

                setTimeout(() => {
                    nameplateContainer.classList.add('visible');

                    // Play slide sound when nameplates appear
                    if (!this.audioMuted) {
                        const slideSound = new Audio('/sfx/slide.mp3');
                        slideSound.volume = 0.4;
                        slideSound.play().catch(err => console.log('Slide sound failed:', err));
                    }
                }, 100);
            }
        } else {
            // First round is a bye - keep nameplates hidden, let handleByeRound animate them (scoped to PVP)
            const nameplateContainer = this.tournamentScreen.querySelector('.nameplate-vs-container');
            if (nameplateContainer) {
                nameplateContainer.classList.remove('visible');
            }
        }

        this.chatSystem.addAnnouncerMessage(ANNOUNCER_MESSAGES.TOURNAMENT_START);
        this.chatSystem.addAnnouncerMessage(ANNOUNCER_MESSAGES.DARING_HERO_START);
        this.chatSystem.addAnnouncerMessage(ANNOUNCER_MESSAGES.BATTLE_COMMENCE);

        setTimeout(() => {
            this.startBattle();
        }, GAME_CONFIG.TIMING.BATTLE_START_DELAY);
    }

    startTournament() {
        if (!this.tournamentStarted) {
            this.tournamentStarted = true;
            this.autoContinue = true;
            this.heroEliminated = false; // Reset hero elimination status

            // CRITICAL: Reset fighters immediately to ensure they're hidden during countdown
            this.resetFighters();

            if (this.startButton) {
                this.startButton.style.display = 'none';
            }

            // Show countdown overlay and start the countdown
            if (this.countdownOverlay) {
                this.countdownOverlay.classList.remove('hidden');
            }
            this.startCountdown();
        } else {
            this.startBattle();
        }
    }

    startBattle() {
        // Stop any existing Lady Luck animation from previous battle
        this.stopLadyLuckAnimation();

        // Check for bye round FIRST (before checking for match)
        const byeInfo = this.tournament.hasFollowedCharacterBye();
        if (byeInfo) {
            this.handleByeRound(byeInfo);
            return;
        }

        const match = this.tournament.getCurrentMatch();
        if (!match) {
            this.handleNoMatch();
            return;
        }

        // Start emoji reactions
        const roundInfo = this.tournament.getRoundInfo();
        this.emojiSystem.updateEmojiSpawnRate(roundInfo.current);
        this.emojiSystem.startEmojiReactions(roundInfo.current);

        // Play special round sounds
        if (!this.audioMuted) {
            if (roundInfo.current === 6) {
                // Semifinals - play first 1.5 seconds
                const sound = new Audio(this.semifinalsSoundPath);
                sound.volume = 0.5;
                sound.play().catch(err => console.log('Semifinals sound failed:', err));
                setTimeout(() => {
                    sound.pause();
                    sound.currentTime = 0;
                }, 1500);
            } else if (roundInfo.current === 7) {
                // Final Battle - play first 2 seconds
                const sound = new Audio(this.finalBattleSoundPath);
                sound.volume = 0.5;
                sound.play().catch(err => console.log('Final Battle sound failed:', err));
                setTimeout(() => {
                    sound.pause();
                    sound.currentTime = 0;
                }, 2000);
            }
        }

        // Update chat rate based on round
        this.updateChatRate(roundInfo.current);

        // Show round announcement
        this.showRoundAnnouncement(roundInfo.name);

        // Add announcer messages
        this.chatSystem.addAnnouncerMessage(`🎺 ${roundInfo.name.toUpperCase()} BEGINS! 🎺`);
        this.chatSystem.addAnnouncerMessage(`⚔️ ${match.participant1.toUpperCase()} VS ${match.participant2.toUpperCase()} ⚔️`);

        // Track hero's progress if Daring Hero is in this match
        if (match.participant1 === 'Daring Hero' || match.participant2 === 'Daring Hero') {
            this.heroMaxRound = Math.max(this.heroMaxRound, roundInfo.current);
        }

        // Update loot and progress bar together (only if not in hero-only mode, or if following hero)
        if (!this.heroLootOnlyMode || this.tournament.followingCharacter === 'Daring Hero') {
            this.lootSystem.updateLootBox(roundInfo);
        }
        this.updateProgressBar();

        // Render bracket and scroll to current match
        this.renderBracket();
        setTimeout(() => {
            this.scrollToCurrentMatch();
        }, BRACKET_CONFIG.SCROLL_DELAY);

        this.battleStatus.style.opacity = '0';

        // If there's already a fade in progress, just switch the background without interfering
        if (this.bgOverlay) {
            // Switch background silently under the overlay
            const roundInfo = this.tournament.getRoundInfo();
            if (roundInfo.current === 7) {
                this.backgrounds.forEach(bg => {
                    this.arenaViewport.classList.remove(bg);
                });
                this.arenaViewport.classList.remove(ARENA_CONFIG.GOLD_BACKGROUND);
                this.arenaViewport.classList.add(ARENA_CONFIG.GOLD_BACKGROUND);
                this.chatSystem.addChatMessage(this.chatSystem.getArenaWelcomeMessage(ARENA_CONFIG.GOLD_BACKGROUND));
            } else {
                this.backgrounds.forEach(bg => {
                    this.arenaViewport.classList.remove(bg);
                });
                this.arenaViewport.classList.remove(ARENA_CONFIG.GOLD_BACKGROUND);
                const newBg = this.backgrounds[this.currentBgIndex];
                this.arenaViewport.classList.add(newBg);
                this.currentBgIndex = (this.currentBgIndex + 1) % this.backgrounds.length;
                this.chatSystem.addChatMessage(this.chatSystem.getArenaWelcomeMessage(newBg));
            }

            // Reset and update fighters BEFORE fading overlay out (prevents flash)
            this.resetFighters();
            this.cleanupCombatElements();
            this.updateMatchDisplay(match);

            // Now fade out the overlay to reveal new fighters
            setTimeout(() => {
                if (this.bgOverlay) {
                    this.bgOverlay.style.transition = 'opacity 0.5s ease-in-out';
                    this.bgOverlay.style.opacity = '0';
                    setTimeout(() => {
                        if (this.bgOverlay) {
                            this.bgOverlay.remove();
                            this.bgOverlay = null;
                        }
                    }, 500);
                }
            }, 50);
        } else {
            // No overlay, do normal background switch
            this.completeBackgroundSwitch();

            // Reset fighters
            this.resetFighters();
            this.cleanupCombatElements();

            // Update display
            this.updateMatchDisplay(match);
        }

        // Start fighter entrances
        setTimeout(() => this.fighterEntrance(), GAME_CONFIG.TIMING.FIGHTER_ENTRANCE_DELAY);
    }

    fighterEntrance() {
        // Get current round info
        const roundInfo = this.tournament.getRoundInfo();

        // Play random fight entrance sound (first second only)
        // Skip for semifinals (round 6) and finals (round 7) - they have their own sounds
        if (!this.audioMuted && roundInfo.current !== 6 && roundInfo.current !== 7) {
            // Randomly select one of the fight entrance sounds
            const randomIndex = Math.floor(Math.random() * this.fightEntranceSoundPaths.length);
            const soundPath = this.fightEntranceSoundPaths[randomIndex];

            // Create a fresh Audio instance using the path directly
            const sound = new Audio(soundPath);
            sound.volume = 0.5;

            sound.play().catch(err => console.log('Fight entrance sound failed:', err));

            // Stop after 1 second
            setTimeout(() => {
                sound.pause();
                sound.currentTime = 0;
            }, 1000);
        }

        // SIMPLIFIED: Both fighters ALWAYS enter from their sides
        // Animation handles opacity transition from 0 to 1
        if (this.leftFighter) {
            // Clear inline opacity so animation can control it
            this.leftFighter.style.opacity = '';
            this.leftFighter.classList.add(UI_CONFIG.ENTRANCE_LEFT);

            // Remove entrance class after animation completes
            // CSS :not(.fighter-entrance-left) rule will automatically apply the correct transform
            // based on the current view (normal, fullscreen, or chat mode)
            const removeLeftEntrance = () => {
                this.leftFighter.classList.remove(UI_CONFIG.ENTRANCE_LEFT);
                // Ensure fighter stays visible after animation
                this.leftFighter.style.opacity = '1';
                this.leftFighter.removeEventListener('animationend', removeLeftEntrance);
            };
            this.leftFighter.addEventListener('animationend', removeLeftEntrance);
        }

        if (this.rightFighter) {
            // Clear inline opacity so animation can control it
            this.rightFighter.style.opacity = '';
            this.rightFighter.classList.add(UI_CONFIG.ENTRANCE_RIGHT);

            // Remove entrance class after animation completes
            // CSS :not(.fighter-entrance-right) rule will automatically apply the correct transform
            // based on the current view (normal, fullscreen, or chat mode)
            const removeRightEntrance = () => {
                this.rightFighter.classList.remove(UI_CONFIG.ENTRANCE_RIGHT);
                // Ensure fighter stays visible after animation
                this.rightFighter.style.opacity = '1';
                this.rightFighter.removeEventListener('animationend', removeRightEntrance);
            };
            this.rightFighter.addEventListener('animationend', removeRightEntrance);
        }

        setTimeout(() => this.executeFight(), GAME_CONFIG.TIMING.ENTRANCE_DURATION);
    }

    executeFight() {
        // Initialize combat system for this battle
        this.combatSystem = new CombatSystem(
            this.tournament,
            this.leftFighter,
            this.rightFighter,
            this.leftFighterNameEl,
            this.rightFighterNameEl,
            this.battleStatus
        );

        // Apply current mute state
        if (this.audioMuted) {
            this.combatSystem.setMuted(true);
        }

        // Reconnect MutationObservers if chat mode is open
        const chatModeOverlay = document.getElementById('chat-mode-overlay');
        if (chatModeOverlay && !chatModeOverlay.classList.contains('hidden')) {
            console.log('🔄 Chat mode is open, reconnecting observers for new battle');
            this.setupAnimationObservers();
        }

        // Set combat callbacks
        this.combatSystem.onCombatEnd = (leftWins) => {
            this.resolveFight(leftWins);
        };

        this.combatSystem.onCombatMessage = (message) => {
            this.chatSystem.addCombatMessage(message);
        };

        this.combatSystem.startCombat();
    }

    resolveFight(leftWins) {
        const battleResult = this.tournament.battleResult(leftWins);
        if (!battleResult) return;

        // Disconnect MutationObservers when combat ends to prevent repeating damage elements
        if (this.chatModeObservers) {
            console.log('🔇 Disconnecting chat mode observers (combat ended)');
            this.chatModeObservers.forEach(observer => observer.disconnect());
            this.chatModeObservers = null;
        }

        // Track previous winner name for next battle
        this.previousWinnerName = battleResult.winner;

        // Update fighter cards
        const currentMatch = this.tournament.getCurrentMatch();
        const displayOrder = this.tournament.getDisplayOrder();
        if (currentMatch && displayOrder) {
            this.updateFighterCards(currentMatch, displayOrder);
        }

        const winner = leftWins ? this.leftFighter : this.rightFighter;
        const loser = leftWins ? this.rightFighter : this.leftFighter;

        // Store winner/loser for final victory screen (clone to preserve state)
        // ALWAYS store these before advancing the tournament, then check if complete after
        console.log('🏆 Pre-storing battle elements - winner:', battleResult.winner);
        this.finalWinnerElement = winner.cloneNode(true);
        this.finalWinnerName = battleResult.winner;
        this.finalLoserElement = loser.cloneNode(true);

        // Clean up damage elements from stored fighters to prevent repeating animations in chat mode
        const damageClasses = ['.damage-number', '.attacker-damage-number', '.crit-number', '.attacker-crit-number',
                              '.block-text', '.parry-text', '.miss-text', '.slash-effect', '.block-effect', '.parry-effect'];
        damageClasses.forEach(selector => {
            this.finalWinnerElement.querySelectorAll(selector).forEach(el => el.remove());
            this.finalLoserElement.querySelectorAll(selector).forEach(el => el.remove());
        });
        console.log('🧹 Cleaned damage elements from stored battle elements');

        console.log('🏆 Battle elements stored:', {
            winner: this.finalWinnerName,
            hasWinnerElement: !!this.finalWinnerElement,
            hasLoserElement: !!this.finalLoserElement
        });

        // Winner gets a pulsing gold-white glow and scale animation (scale on sprite only to avoid position conflicts)
        const winnerSprite = winner.querySelector('.fighter-sprite img');
        if (winnerSprite) {
            winnerSprite.style.animation = 'victory-glow-pulse 1.5s ease-in-out infinite, winner-scale-pulse 1.5s ease-in-out infinite';
        }

        // Update battle status
        this.battleStatus.textContent = `${battleResult.winner.toUpperCase()} WINS!`;
        this.battleStatus.style.opacity = '1';

        // Start background fade after loser completes fade + 1.5s pause (500ms + 2000ms + 1500ms = 4000ms)
        setTimeout(() => {
            this.startBackgroundFadeOut();
            // Also trigger simple chat mode transition
            this.triggerChatModeTransition();
        }, 4000);

        // Keep text visible until black screen covers it
        setTimeout(() => {
            this.battleStatus.style.opacity = '0';
        }, 4000);

        // Announcer messages
        this.chatSystem.addAnnouncerMessage(`${ANNOUNCER_MESSAGES.WINNER_PREFIX}${battleResult.winner.toUpperCase()}${ANNOUNCER_MESSAGES.WINNER_SUFFIX}`);
        if (battleResult.loser === 'Daring Hero') {
            this.heroEliminated = true; // Mark hero as eliminated
            this.chatSystem.addAnnouncerMessage(ANNOUNCER_MESSAGES.HERO_ELIMINATED);
            this.chatSystem.addAnnouncerMessage(`${ANNOUNCER_MESSAGES.NEW_FOLLOW_PREFIX}${battleResult.winner.toUpperCase()}! 👑`);

            // Show claim loot button and add glow to chest
            this.showClaimLootButton();
        }
        this.chatSystem.addChatMessage(this.chatSystem.getRandomWinMessage());
        this.chatSystem.addChatMessage("GG!");

        // Progress tournament - wait until loser faded + pause before loading next fighters
        setTimeout(() => {
            this.tournament.advanceToNextMatch();
            this.updateOdds();
            this.updateProgressBar();
            this.updateDisplay();
            this.renderBracket();

            setTimeout(() => {
                this.scrollToCurrentMatch();
            }, 300);

            if (this.autoContinue && !this.tournament.isComplete()) {
                setTimeout(() => this.startBattle(), GAME_CONFIG.TIMING.AUTO_CONTINUE_DELAY - 4000);
            } else {
                this.enableRestart();
            }
        }, 4000); // 500ms beat + 2000ms fade + 1500ms pause
    }

    handleByeRound(byeInfo) {
        // Play bye round sound (first 2 seconds at 75% volume)
        if (!this.audioMuted) {
            const sound = new Audio(this.byeSoundPath);
            sound.volume = 0.75;
            sound.play().catch(err => console.log('Bye sound failed:', err));

            // Store reference to pause it if navigating away
            this.activeByeSound = sound;

            setTimeout(() => {
                sound.pause();
                sound.currentTime = 0;
                this.activeByeSound = null;
            }, 2000);

            // Replay Lady Luck laugh after 1 second pause (at 3 seconds total)
            setTimeout(() => {
                // Only play if tournament is still running (not navigated away)
                if (!this.audioMuted && this.autoContinue) {
                    const laughSound = new Audio('/sfx/game_female_soft_com_3-1760029620130.mp3');
                    laughSound.volume = 0.6;
                    laughSound.play().catch(err => console.log('Lady Luck laugh failed:', err));
                }
            }, 3000); // 2000ms bye sound + 1000ms pause
        }

        this.battleStatus.innerHTML = '✨ LADY LUCK VISITS YOU! ✨<br><span style="font-size: 0.6em;">You get a bye and a free loot tier - lucky you!</span>';
        this.battleStatus.style.opacity = '0'; // Start hidden

        // Hide nameplates initially to prevent animation jump (scoped to Tournament)
        const nameplateContainer = this.tournamentScreen.querySelector('.nameplate-vs-container');
        if (nameplateContainer) {
            nameplateContainer.classList.remove('visible');
        }

        // Update loot and progress bar together (only if not in hero-only mode, or if following hero)
        const roundInfo = this.tournament.getRoundInfo();

        // Track hero's progress if Daring Hero gets a bye
        if (byeInfo.character === 'Daring Hero') {
            this.heroMaxRound = Math.max(this.heroMaxRound, roundInfo.current);
        }

        // Show round announcement
        this.showRoundAnnouncement(roundInfo.name);

        // Delay Lady Luck messages until after round announcement (3.5s)
        setTimeout(() => {
            this.chatSystem.addAnnouncerMessage("✨ LADY LUCK VISITS YOU! ✨");
            this.chatSystem.addAnnouncerMessage("🍀 You get a bye and a free loot tier - lucky you! 🍀");

            if (!this.heroLootOnlyMode || this.tournament.followingCharacter === 'Daring Hero') {
                this.lootSystem.updateLootBox(roundInfo);
            } else {
                this.chatSystem.addAnnouncerMessage("🎁 LOOT LOCKED (HERO LOOT ONLY MODE) 🎁");
            }

            this.chatSystem.addAnnouncerMessage(`⬆️ ${byeInfo.character.toUpperCase()} ADVANCES TO NEXT ROUND! ⬆️`);
        }, 3500);
        this.updateProgressBar();

        // Update chat rate based on round
        this.updateChatRate(roundInfo.current);

        // Reset fighters
        this.resetFighters();
        this.cleanupCombatElements();

        // Hide fighters initially
        if (this.leftFighter) this.leftFighter.style.opacity = '0';
        if (this.rightFighter) this.rightFighter.style.opacity = '0';

        this.updateByeDisplay(byeInfo);

        // Handle background transition (same logic as normal battles)
        if (this.bgOverlay) {
            // There's an existing overlay from previous battle - switch background while black
            this.backgrounds.forEach(bg => {
                this.arenaViewport.classList.remove(bg);
            });
            this.arenaViewport.classList.remove(ARENA_CONFIG.GOLD_BACKGROUND);
            const newBg = this.backgrounds[this.currentBgIndex];
            this.arenaViewport.classList.add(newBg);
            this.currentBgIndex = (this.currentBgIndex + 1) % this.backgrounds.length;
            this.chatSystem.addChatMessage(this.chatSystem.getArenaWelcomeMessage(newBg));

            // Fade out overlay to reveal new background
            setTimeout(() => {
                if (this.bgOverlay) {
                    this.bgOverlay.style.transition = 'opacity 0.5s ease-in-out';
                    this.bgOverlay.style.opacity = '0';
                    setTimeout(() => {
                        if (this.bgOverlay) {
                            this.bgOverlay.remove();
                            this.bgOverlay = null;
                        }
                    }, 500);
                }
            }, 50);
        } else {
            // No overlay, do normal background switch
            this.completeBackgroundSwitch();
        }

        // Start fighter entrance animations
        // Animation handles opacity transition from 0 to 1
        setTimeout(() => {
            if (this.leftFighter) {
                // Clear inline opacity so animation can control it
                this.leftFighter.style.opacity = '';
                this.leftFighter.classList.add(UI_CONFIG.ENTRANCE_LEFT);

                // Remove entrance class after animation completes
                // CSS :not(.fighter-entrance-left) rule will automatically apply the correct transform
                const removeLeftEntrance = () => {
                    this.leftFighter.classList.remove(UI_CONFIG.ENTRANCE_LEFT);
                    // Ensure fighter stays visible after animation
                    this.leftFighter.style.opacity = '1';
                    this.leftFighter.removeEventListener('animationend', removeLeftEntrance);
                };
                this.leftFighter.addEventListener('animationend', removeLeftEntrance);
            }
            if (this.rightFighter) {
                // Clear inline opacity so animation can control it
                this.rightFighter.style.opacity = '';
                this.rightFighter.classList.add(UI_CONFIG.ENTRANCE_RIGHT);

                // Remove entrance class after animation completes
                // CSS :not(.fighter-entrance-right) rule will automatically apply the correct transform
                const removeRightEntrance = () => {
                    this.rightFighter.classList.remove(UI_CONFIG.ENTRANCE_RIGHT);
                    // Ensure fighter stays visible after animation
                    this.rightFighter.style.opacity = '1';
                    this.rightFighter.removeEventListener('animationend', removeRightEntrance);
                };
                this.rightFighter.addEventListener('animationend', removeRightEntrance);
            }

            // Show nameplates with smooth slide-up animation (scoped to PVP)
            const nameplateContainer = this.tournamentScreen.querySelector('.nameplate-vs-container');
            if (nameplateContainer) {
                setTimeout(() => {
                    nameplateContainer.classList.add('visible');

                    // Play slide sound when nameplates appear
                    if (!this.audioMuted) {
                        const slideSound = new Audio('/sfx/slide.mp3');
                        slideSound.volume = 0.4;
                        slideSound.play().catch(err => console.log('Slide sound failed:', err));
                    }
                }, 100);
            }

            // Show battle status after round announcement finishes (2.7 seconds)
            setTimeout(() => {
                this.battleStatus.style.opacity = '1';
            }, 2700);
        }, GAME_CONFIG.TIMING.FIGHTER_ENTRANCE_DELAY);

        // Lucky clover shower from above for 9 seconds (extended)
        this.emojiSystem.startEmojiShower(['🍀'], 9000);

        // Fade out battle status after 8 seconds
        setTimeout(() => {
            this.battleStatus.style.opacity = '0';
        }, 8000);

        // Start fade-out at 8.5 seconds (1.5 second fade-out before advancing)
        setTimeout(() => {
            // Fade out both fighters using the loser-fade-out animation
            if (this.leftFighter) {
                const leftSprite = this.leftFighter.querySelector('.fighter-sprite');
                if (leftSprite) {
                    leftSprite.style.animation = 'loser-fade-out 1.5s ease-out forwards';
                }
            }
            if (this.rightFighter) {
                const rightSprite = this.rightFighter.querySelector('.fighter-sprite');
                if (rightSprite) {
                    rightSprite.style.animation = 'loser-fade-out 1.5s ease-out forwards';
                }
            }

            // Also fade out nameplates (scoped to PVP)
            const nameplateContainer = this.tournamentScreen.querySelector('.nameplate-vs-container');
            if (nameplateContainer) {
                nameplateContainer.style.transition = 'opacity 1.5s ease-out';
                nameplateContainer.style.opacity = '0';
            }

            // Start background fade-to-black transition (same as normal battles)
            this.startBackgroundFadeOut();
            // Also trigger chat mode transition
            this.triggerChatModeTransition();
        }, 8500);

        // Complete background switch when overlay is fully black (after 1.5s fade)
        setTimeout(() => {
            this.completeBackgroundSwitch();

            // Update fighters WHILE screen is black (prevents flash)
            this.tournament.advanceToNextMatch();
            this.updateOdds();
            this.updateDisplay();
            this.renderBracket();

            // Start next battle immediately while overlay is still black
            // This matches the timing of normal battles where startBattle() handles the fade-out
            if (this.autoContinue && !this.tournament.isComplete()) {
                // startBattle() will handle fading out the overlay and entrance animations
                this.startBattle();
            } else {
                // If not auto-continuing, manually fade out the overlay
                if (this.bgOverlay) {
                    setTimeout(() => {
                        if (this.bgOverlay) {
                            this.bgOverlay.style.transition = 'opacity 0.5s ease-in-out';
                            this.bgOverlay.style.opacity = '0';
                            setTimeout(() => {
                                if (this.bgOverlay) {
                                    this.bgOverlay.remove();
                                    this.bgOverlay = null;
                                }
                            }, 500);
                        }
                    }, 50);
                }
                this.enableRestart();
            }
        }, 10000); // 8500ms + 1500ms = 10000ms
    }

    handleNoMatch() {
        this.chatSystem.addChatMessage("Tournament completed or no match available!");
        this.enableRestart();
    }

    enableRestart() {
        // Guard against null startButton (can happen in different navigation contexts)
        if (this.startButton) {
            this.startButton.disabled = false;
        }

        if (this.tournament.isComplete()) {
            const winner = this.tournament.getWinner();
            if (this.startButton) {
                this.startButton.textContent = `${winner.toUpperCase()} WINS THE CROWN!`;
                this.startButton.disabled = true;
            }
            this.chatSystem.addChatMessage("CROWN WINNER!");
            this.chatSystem.addChatMessage("LEGENDARY!");

            this.showVictoryAnimation(winner);

            // In hero-only mode: keep loot at hero's max round (don't upgrade if hero lost)
            // In track-all mode: use final round
            const roundInfo = this.heroLootOnlyMode && this.heroEliminated
                ? { current: this.heroMaxRound }
                : this.tournament.getRoundInfo();
            this.lootSystem.updateLootBox(roundInfo);

            // Always show button when tournament completes (after a delay to ensure loot system updates first)
            setTimeout(() => {
                // Use the unified function to show claim button (works for both modes)
                this.showClaimLootButton();

                // Add victory glow to chest
                const lootBox = document.getElementById('loot-box');
                if (lootBox) {
                    this.lootSystem.addVictoryGlow();
                }
            }, 500);
        } else {
            const roundInfo = this.tournament.getRoundInfo();
            if (this.startButton) {
                this.startButton.textContent = `CONTINUE ${roundInfo.name.toUpperCase()}`;
            }
        }
    }

    // ===== Display Updates =====

    updateDisplay() {
        const match = this.tournament.getCurrentMatch();
        const displayOrder = this.tournament.getDisplayOrder();
        this.updateFighterCards(match, displayOrder);
    }

    updateMatchDisplay(match) {
        const displayOrder = this.tournament.getDisplayOrder();
        if (!displayOrder) return;

        if (this.leftFighterNameEl) {
            this.leftFighterNameEl.textContent = this.tournament.getCharacterName(displayOrder.leftFighter);
            this.updateFighterSprite(this.leftFighter, displayOrder.leftFighter);
        }

        if (this.leftFighterTitlesEl) {
            const leftTitles = this.tournament.getCharacterTitles(displayOrder.leftFighter);
            this.leftFighterTitlesEl.textContent = leftTitles.join(' • ');
        }

        if (this.rightFighterNameEl) {
            this.rightFighterNameEl.textContent = this.tournament.getCharacterName(displayOrder.rightFighter);
            this.updateFighterSprite(this.rightFighter, displayOrder.rightFighter);

            if (this.rightFighterTitlesEl) {
                const rightTitles = this.tournament.getCharacterTitles(displayOrder.rightFighter);
                this.rightFighterTitlesEl.textContent = rightTitles.join(' • ');
            }
        }

        this.updateFighterCards(match, displayOrder);
    }

    updateByeDisplay(byeInfo) {
        // ALWAYS show hero on LEFT, Lady Luck on RIGHT (loser's side)
        this.leftFighterNameEl.textContent = this.tournament.getCharacterName(byeInfo.character);
        const leftTitles = this.tournament.getCharacterTitles(byeInfo.character);
        this.leftFighterTitlesEl.textContent = leftTitles.join(' • ');
        this.updateFighterSprite(this.leftFighter, byeInfo.character);

        // Show Lady Luck on the right (loser's side)
        this.rightFighterNameEl.textContent = 'Lady Luck';
        this.rightFighterTitlesEl.textContent = 'Bringer of Fortune';
        this.updateFighterSprite(this.rightFighter, 'Lady Luck');

        // Add green styling to right card
        if (this.rightFighterCard) {
            this.rightFighterCard.classList.add('lady-bye-chance');
        }

        const match = { participant1: null, participant2: null };
        if (byeInfo.position === 'left') {
            match.participant1 = byeInfo.character;
        } else {
            match.participant2 = byeInfo.character;
        }

        this.updateFighterCards(match, null);

        // Start Lady Luck's GIF-like animation
        this.startLadyLuckAnimation();
    }

    updateFighterCards(match, displayOrder) {
        if (this.leftFighterCard) {
            this.leftFighterCard.className = 'fighter-card left-fighter-card';
        }
        if (this.rightFighterCard) {
            this.rightFighterCard.className = 'fighter-card right-fighter-card';
        }

        if (!match) return;

        const leftFighter = displayOrder ? displayOrder.leftFighter : match.participant1;
        const rightFighter = displayOrder ? displayOrder.rightFighter : match.participant2;

        if (this.leftFighterCard) {
            if (this.tournament.isWinner(leftFighter)) {
                this.leftFighterCard.classList.add('following');
            } else if (leftFighter === 'Daring Hero') {
                this.leftFighterCard.classList.add('daring-hero');
            }
        }

        if (this.rightFighterCard) {
            if (this.tournament.isWinner(rightFighter)) {
                this.rightFighterCard.classList.add('following');
            } else if (rightFighter === 'Daring Hero') {
                this.rightFighterCard.classList.add('daring-hero');
            }
        }
    }

    updateOdds() {
        const roundInfo = this.tournament.getRoundInfo();
        const remainingParticipants = roundInfo.participantsLeft;
        const oddsText = `1 in ${remainingParticipants.toLocaleString()}`;

        const crownOdds = document.querySelector('.crown-odds');
        if (crownOdds) crownOdds.textContent = oddsText;
    }

    // ===== Fighter Management =====

    resetFighters() {
        // Stop coin shower if running
        this.stopVictoryCoinShower();

        if (this.leftFighter) {
            // Remove ALL classes (entrance, exit, victory, etc.)
            this.leftFighter.className = 'fighter-left';
            // Clear all inline styles
            this.leftFighter.removeAttribute('style');
            // Explicitly position off-screen and hide
            this.leftFighter.style.opacity = '0';
            this.leftFighter.style.transform = 'translateX(-100%)';

            // Clear sprite element
            const leftSprite = this.leftFighter.querySelector('.fighter-sprite');
            if (leftSprite) {
                leftSprite.className = 'fighter-sprite';
                leftSprite.removeAttribute('style');
            }
        }

        if (this.rightFighter) {
            // Remove ALL classes (entrance, exit, victory, etc.)
            this.rightFighter.className = 'fighter-right';
            // Clear all inline styles
            this.rightFighter.removeAttribute('style');
            // Explicitly position off-screen and hide
            this.rightFighter.style.opacity = '0';
            this.rightFighter.style.transform = 'translateX(100%)';

            // Clear sprite element
            const rightSprite = this.rightFighter.querySelector('.fighter-sprite');
            if (rightSprite) {
                rightSprite.className = 'fighter-sprite';
                rightSprite.removeAttribute('style');
            }
        }
    }

    hideRightFighter() {
        if (this.rightFighter) {
            this.rightFighter.style.opacity = '0';
        }
        if (this.rightFighterCard) {
            this.rightFighterCard.style.opacity = '0';
            this.rightFighterCard.style.transform = 'translateX(50px)';
        }
    }

    getCharacterImage(characterName, pose = 'ready') {
        if (characterName === 'Daring Hero') {
            // Return appropriate pose for Daring Hero
            if (pose === 'attack') return CHARACTER_CONFIG.HERO_ATTACK;
            if (pose === 'defense') return CHARACTER_CONFIG.HERO_DEFENSE;
            return CHARACTER_CONFIG.HERO_READY;
        }

        // IMPORTANT: Check if female first to prevent matching male arrays
        const isFemale = CHARACTER_CONFIG.FEMALE_NAMES.includes(characterName);
        if (isFemale) {
            // Female character - use Athena or Nesta skin only
            if (CHARACTER_CONFIG.ATHENA_NAMES.includes(characterName)) {
                // Return appropriate pose for Athena skin
                if (pose === 'attack') return CHARACTER_CONFIG.ATHENA_ATTACK;
                if (pose === 'defense') return CHARACTER_CONFIG.ATHENA_DEFEND;
                return CHARACTER_CONFIG.ATHENA_NEUTRAL;
            }
            // Default to Nesta for other female names
            if (pose === 'attack') return CHARACTER_CONFIG.NESTA_ATTACK;
            if (pose === 'defense') return CHARACTER_CONFIG.NESTA_DEFEND;
            return CHARACTER_CONFIG.NESTA_NEUTRAL;
        }

        // Check if this is a male fighter using Green Knight skin
        if (CHARACTER_CONFIG.GREEN_KNIGHT_NAMES.includes(characterName)) {
            // Return appropriate pose for Green Knight skin
            if (pose === 'attack') return CHARACTER_CONFIG.GREEN_KNIGHT_ATTACK;
            if (pose === 'defense') return CHARACTER_CONFIG.GREEN_KNIGHT_DEFEND;
            return CHARACTER_CONFIG.GREEN_KNIGHT_NEUTRAL;
        }

        // Check if this is a male fighter using Barb skin
        if (CHARACTER_CONFIG.BARB_NAMES.includes(characterName)) {
            // Return appropriate pose for Barb skin
            if (pose === 'attack') return CHARACTER_CONFIG.BARB_ATTACK;
            if (pose === 'defense') return CHARACTER_CONFIG.BARB_DEFEND;
            return CHARACTER_CONFIG.BARB_NEUTRAL;
        }

        // Check if this is a male fighter using Black Knight skin
        if (CHARACTER_CONFIG.BLACK_NAMES.includes(characterName)) {
            // Return appropriate pose for Black Knight skin
            if (pose === 'attack') return CHARACTER_CONFIG.BLACK_ATTACK;
            if (pose === 'defense') return CHARACTER_CONFIG.BLACK_DEFEND;
            return CHARACTER_CONFIG.BLACK_NEUTRAL;
        }

        // Check if this is a male fighter using Red Knight skin
        if (CHARACTER_CONFIG.RED_NAMES.includes(characterName)) {
            // Return appropriate pose for Red Knight skin
            if (pose === 'attack') return CHARACTER_CONFIG.RED_ATTACK;
            if (pose === 'defense') return CHARACTER_CONFIG.RED_DEFEND;
            return CHARACTER_CONFIG.RED_NEUTRAL;
        }

        // Check if this is a male fighter using Brown Knight skin
        if (CHARACTER_CONFIG.BROWN_NAMES.includes(characterName)) {
            // Return appropriate pose for Brown Knight skin
            if (pose === 'attack') return CHARACTER_CONFIG.BROWN_ATTACK;
            if (pose === 'defense') return CHARACTER_CONFIG.BROWN_DEFEND;
            return CHARACTER_CONFIG.BROWN_NEUTRAL;
        }

        // Check if this is a male fighter using Blue Knight skin
        if (CHARACTER_CONFIG.BLUE_NAMES.includes(characterName)) {
            // Return appropriate pose for Blue Knight skin
            if (pose === 'attack') return CHARACTER_CONFIG.BLUE_ATTACK;
            if (pose === 'defense') return CHARACTER_CONFIG.BLUE_DEFEND;
            return CHARACTER_CONFIG.BLUE_NEUTRAL;
        }

        if (characterName === 'Lady Luck') {
            return `lady_luck_${this.ladyLuckFrame}.png`;
        }

        // OLD KNIGHT SYSTEM REMOVED - All fighters now use 3-pose systems
        // If we reach here, something is wrong - return a default
        console.warn(`Character ${characterName} not found in any skin configuration`);
        return CHARACTER_CONFIG.GREEN_KNIGHT_NEUTRAL;
    }

    // ===== View Detection =====

    getCurrentView() {
        // Check if fullscreen mode is active
        if (this.battlefieldSection && this.battlefieldSection.classList.contains('fullscreen')) {
            return 'fullscreen';
        }
        // Check if chat mode overlay is visible
        if (this.chatModeOverlay && !this.chatModeOverlay.classList.contains('hidden')) {
            return 'chat';
        }
        // Default to regular view
        return 'regular';
    }

    // ===== Character Positioning System =====

    updateFighterSprite(fighterElement, characterName, pose = 'ready') {
        const spriteElement = fighterElement.querySelector('.fighter-sprite');
        if (!spriteElement) return;

        const imageName = this.getCharacterImage(characterName, pose);
        const imagePath = `${CHARACTER_CONFIG.CHARACTER_PATH}${imageName}`;

        const isLeftFighter = fighterElement.classList.contains('fighter-left');
        const isRightFighter = fighterElement.classList.contains('fighter-right');


        // Check if this is left-oriented (Athena, Blue - flips on LEFT, not right)
        const isLeftOriented = imageName.toLowerCase().includes('athena') ||
                               imageName.toLowerCase().includes('blue_');
        // Check if this is right-oriented (Daring Hero, Nesta, Barb, Green, Black, Red, Brown - flips on right side)
        const needsRightFlip = imageName.toLowerCase().includes('daring_hero') ||
                               imageName.toLowerCase().includes('nesta') ||
                               imageName.toLowerCase().includes('barb_') ||
                               imageName.toLowerCase().includes('green_') ||
                               imageName.toLowerCase().includes('black_') ||
                               imageName.toLowerCase().includes('red_') ||
                               imageName.toLowerCase().includes('brown_');

        // Special case: brown_attack.png should always be flipped
        const isBrownAttack = imageName.toLowerCase() === 'brown_attack.png';

        let needsFlip = (isLeftFighter && (
            imageName === 'knight_05.png' ||
            imageName === 'Knight_01.png' ||
            isLeftOriented  // Athena/Blue flip when on left side
        )) || (isRightFighter && (
            imageName === 'knight_04.png' ||
            needsRightFlip  // Daring Hero/Nesta/Barb/Green/Black/Red/Brown flip when on right side
        ));

        // Override flip for brown attack - always flip it
        if (isBrownAttack) {
            needsFlip = !needsFlip;  // Invert the flip state
        }

        // Get current view and apply view-specific character settings
        const view = this.getCurrentView();

        // Character type detection
        const isRedCharacter = imageName.toLowerCase().includes('red_');
        const isBarbCharacter = imageName.toLowerCase().includes('barb_');
        const isGreenCharacter = imageName.toLowerCase().includes('green_');
        const isBlackCharacter = imageName.toLowerCase().includes('black_');
        const isBrownCharacter = imageName.toLowerCase().includes('brown_');
        const isBlueCharacter = imageName.toLowerCase().includes('blue_');
        const isNestaCharacter = imageName.toLowerCase().includes('nesta');
        const isAthenaCharacter = imageName.toLowerCase().includes('athena');

        // CHARACTER POSITIONING CONFIG - Adjust each view independently
        // Format: { regular: {scale, top}, fullscreen: {scale, top}, chat: {scale, top} }
        // Fullscreen values = regular * 1.35 (old CSS scale), Chat values = regular * 0.5625 (old CSS scale)
        const characterConfig = {
            athena:  { regular: {scale: 0.80, top: 10},   fullscreen: {scale: 1.08, top: 14},   chat: {scale: 0.45, top: 6} },
            nesta:   { regular: {scale: 1.01, top: 15},   fullscreen: {scale: 1.36, top: 20},   chat: {scale: 0.57, top: 8} },
            barb:    { regular: {scale: 0.92, top: 0},    fullscreen: {scale: 1.24, top: 0},    chat: {scale: 0.52, top: 0} },
            blue:    { regular: {scale: 0.92, top: -15},  fullscreen: {scale: 1.24, top: -20},  chat: {scale: 0.52, top: -8} },
            black:   { regular: {scale: 0.95, top: 5},    fullscreen: {scale: 1.28, top: 7},    chat: {scale: 0.53, top: 3} },
            brown:   { regular: {scale: 0.94, top: 0},    fullscreen: {scale: 1.34, top: 115},  chat: {scale: 0.56, top: 48} },
            red:     { regular: {scale: 0.97, top: -20},  fullscreen: {scale: 1.31, top: -27},  chat: {scale: 0.55, top: -11} },
            green:   { regular: {scale: 1.07, top: 15},   fullscreen: {scale: 1.53, top: 14},   chat: {scale: 0.64, top: 6} },
            default: { regular: {scale: 0.80, top: 0},    fullscreen: {scale: 1.08, top: 0},    chat: {scale: 0.45, top: 0} }
        };

        // Select character config based on type
        let config;
        if (isAthenaCharacter) config = characterConfig.athena;
        else if (isNestaCharacter) config = characterConfig.nesta;
        else if (isBarbCharacter) config = characterConfig.barb;
        else if (isBlueCharacter) config = characterConfig.blue;
        else if (isBlackCharacter) config = characterConfig.black;
        else if (isBrownCharacter) config = characterConfig.brown;
        else if (isRedCharacter) config = characterConfig.red;
        else if (isGreenCharacter) config = characterConfig.green;
        else config = characterConfig.default;

        // Get view-specific values
        const { scale: baseScale, top: topOffset } = config[view];

        // Apply positioning
        const verticalOffset = `position: relative !important; top: ${topOffset}px !important;`;
        const flipStyle = needsFlip ? `transform: scale(${baseScale}) scaleX(-1) !important;` : `transform: scale(${baseScale}) !important;`;

        spriteElement.innerHTML = `<img src="${imagePath}" alt="${characterName}" class="character-image" style="${flipStyle} ${verticalOffset}">`;
    }

    updateFighterPose(fighterElement, characterName, pose) {
        // Quick pose update without rebuilding the sprite
        const img = fighterElement.querySelector('.fighter-sprite img');
        if (!img) return;

        const imageName = this.getCharacterImage(characterName, pose);
        const imagePath = `${CHARACTER_CONFIG.CHARACTER_PATH}${imageName}`;
        img.src = imagePath;

        // Update flip state for 3-pose characters
        const isRightFighter = fighterElement.classList.contains('fighter-right');
        const isLeftFighter = fighterElement.classList.contains('fighter-left');
        // Check if this is left-oriented (Athena, Blue - flips on LEFT, not right)
        const isLeftOriented = imageName.toLowerCase().includes('athena') ||
                               imageName.toLowerCase().includes('blue_');
        // Check if this is right-oriented (Daring Hero, Nesta, Barb, Green, Black, Red, Brown - flips on right side)
        const needsRightFlip = imageName.toLowerCase().includes('daring_hero') ||
                               imageName.toLowerCase().includes('nesta') ||
                               imageName.toLowerCase().includes('barb_') ||
                               imageName.toLowerCase().includes('green_') ||
                               imageName.toLowerCase().includes('black_') ||
                               imageName.toLowerCase().includes('red_') ||
                               imageName.toLowerCase().includes('brown_');

        // Special case: brown_attack.png should always be flipped
        const isBrownAttack = imageName.toLowerCase() === 'brown_attack.png';

        let needsFlip = (isLeftFighter && (
            imageName === 'knight_05.png' ||
            imageName === 'Knight_01.png' ||
            isLeftOriented  // Athena/Blue flip when on left side
        )) || (isRightFighter && (
            imageName === 'knight_04.png' ||
            needsRightFlip  // Daring Hero/Nesta/Barb/Green/Black/Red/Brown flip when on right side
        ));

        // Override flip for brown attack - always flip it
        if (isBrownAttack) {
            needsFlip = !needsFlip;  // Invert the flip state
        }

        // Get current view and apply view-specific character settings
        const view = this.getCurrentView();

        // Character type detection
        const isRedCharacter = imageName.toLowerCase().includes('red_');
        const isBarbCharacter = imageName.toLowerCase().includes('barb_');
        const isGreenCharacter = imageName.toLowerCase().includes('green_');
        const isBlackCharacter = imageName.toLowerCase().includes('black_');
        const isBrownCharacter = imageName.toLowerCase().includes('brown_');
        const isBlueCharacter = imageName.toLowerCase().includes('blue_');
        const isNestaCharacter = imageName.toLowerCase().includes('nesta');
        const isAthenaCharacter = imageName.toLowerCase().includes('athena');

        // CHARACTER POSITIONING CONFIG - Adjust each view independently
        // MUST MATCH the config in updateFighterSprite for consistency
        // Fullscreen values = regular * 1.35 (old CSS scale), Chat values = regular * 0.5625 (old CSS scale)
        const characterConfig = {
            athena:  { regular: {scale: 0.80, top: 10},   fullscreen: {scale: 1.08, top: 14},   chat: {scale: 0.45, top: 6} },
            nesta:   { regular: {scale: 1.01, top: 15},   fullscreen: {scale: 1.36, top: 20},   chat: {scale: 0.57, top: 8} },
            barb:    { regular: {scale: 0.92, top: 0},    fullscreen: {scale: 1.24, top: 0},    chat: {scale: 0.52, top: 0} },
            blue:    { regular: {scale: 0.92, top: -15},  fullscreen: {scale: 1.24, top: -20},  chat: {scale: 0.52, top: -8} },
            black:   { regular: {scale: 0.95, top: 5},    fullscreen: {scale: 1.28, top: 7},    chat: {scale: 0.53, top: 3} },
            brown:   { regular: {scale: 0.94, top: 0},    fullscreen: {scale: 1.34, top: 115},  chat: {scale: 0.56, top: 48} },
            red:     { regular: {scale: 0.97, top: -20},  fullscreen: {scale: 1.31, top: -27},  chat: {scale: 0.55, top: -11} },
            green:   { regular: {scale: 1.07, top: 15},   fullscreen: {scale: 1.53, top: 14},   chat: {scale: 0.64, top: 6} },
            default: { regular: {scale: 0.80, top: 0},    fullscreen: {scale: 1.08, top: 0},    chat: {scale: 0.45, top: 0} }
        };

        // Select character config based on type
        let config;
        if (isAthenaCharacter) config = characterConfig.athena;
        else if (isNestaCharacter) config = characterConfig.nesta;
        else if (isBarbCharacter) config = characterConfig.barb;
        else if (isBlueCharacter) config = characterConfig.blue;
        else if (isBlackCharacter) config = characterConfig.black;
        else if (isBrownCharacter) config = characterConfig.brown;
        else if (isRedCharacter) config = characterConfig.red;
        else if (isGreenCharacter) config = characterConfig.green;
        else config = characterConfig.default;

        // Get view-specific values
        const { scale: baseScale, top: topOffset } = config[view];

        // Apply positioning
        img.style.setProperty('position', 'relative', 'important');
        img.style.setProperty('top', `${topOffset}px`, 'important');
        img.style.setProperty('transform', needsFlip ? `scale(${baseScale}) scaleX(-1)` : `scale(${baseScale})`, 'important');
    }

    // ===== Lady Luck Animation =====

    startLadyLuckAnimation() {
        // Stop any existing animation
        this.stopLadyLuckAnimation();

        // Start animation loop (cycle through frames 1-4 every 200ms)
        this.ladyLuckAnimationInterval = setInterval(() => {
            // Cycle to next frame (1 -> 2 -> 3 -> 4 -> 1)
            this.ladyLuckFrame = (this.ladyLuckFrame % 4) + 1;

            // Update both fighters (one will be Lady Luck)
            if (this.leftFighterNameEl.textContent === 'Lady Luck') {
                this.updateFighterSprite(this.leftFighter, 'Lady Luck');
            }
            if (this.rightFighterNameEl.textContent === 'Lady Luck') {
                this.updateFighterSprite(this.rightFighter, 'Lady Luck');
            }
        }, 200); // 200ms per frame = 5 frames per second
    }

    stopLadyLuckAnimation() {
        if (this.ladyLuckAnimationInterval) {
            clearInterval(this.ladyLuckAnimationInterval);
            this.ladyLuckAnimationInterval = null;
        }
        // Reset to frame 1
        this.ladyLuckFrame = 1;
    }

    // ===== Round Announcement =====

    showRoundAnnouncement(roundName) {
        if (!this.roundAnnouncement) return;

        this.roundAnnouncement.textContent = roundName.toUpperCase();
        this.roundAnnouncement.classList.remove('show');

        // Force reflow to restart animation
        void this.roundAnnouncement.offsetWidth;

        this.roundAnnouncement.classList.add('show');

        // Remove class after animation completes
        setTimeout(() => {
            this.roundAnnouncement.classList.remove('show');
        }, 2500);
    }

    // ===== Background Management =====

    switchBackground() {
        if (!this.arenaViewport) return;

        // Skip fade on first battle
        if (this.isFirstBattle) {
            this.isFirstBattle = false;

            // Just set initial background without fade
            const newBg = this.backgrounds[this.currentBgIndex];
            this.arenaViewport.classList.add(newBg);
            this.currentBgIndex = (this.currentBgIndex + 1) % this.backgrounds.length;
            this.chatSystem.addChatMessage(this.chatSystem.getArenaWelcomeMessage(newBg));
            return;
        }

        // Start fade out (will complete in completeBackgroundSwitch)
        this.startBackgroundFadeOut();
    }

    startBackgroundFadeOut() {
        if (!this.arenaViewport) return;

        // Create black overlay to fade ENTIRE arena (covers fighters too)
        this.bgOverlay = document.createElement('div');
        this.bgOverlay.className = 'bg-overlay'; // Add class so sync can find it
        this.bgOverlay.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: black;
            opacity: 0;
            z-index: 100;
            pointer-events: none;
        `;
        this.arenaViewport.appendChild(this.bgOverlay);

        // Force browser to acknowledge initial state
        this.bgOverlay.offsetHeight;

        // Now add transition
        this.bgOverlay.style.transition = 'opacity 1s ease-in-out';

        // Use requestAnimationFrame to ensure browser has applied transition before changing opacity
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                if (this.bgOverlay) {
                    this.bgOverlay.style.opacity = '0.95';
                }
            });
        });
    }

    completeBackgroundSwitch() {
        if (!this.arenaViewport) return;

        // Check if final round - use gold background
        const roundInfo = this.tournament.getRoundInfo();
        if (roundInfo.current === 7) {
            this.backgrounds.forEach(bg => {
                this.arenaViewport.classList.remove(bg);
            });
            this.arenaViewport.classList.remove(ARENA_CONFIG.GOLD_BACKGROUND);
            this.arenaViewport.classList.add(ARENA_CONFIG.GOLD_BACKGROUND);
            this.chatSystem.addChatMessage(this.chatSystem.getArenaWelcomeMessage(ARENA_CONFIG.GOLD_BACKGROUND));
        } else {
            // Remove current background
            this.backgrounds.forEach(bg => {
                this.arenaViewport.classList.remove(bg);
            });
            this.arenaViewport.classList.remove(ARENA_CONFIG.GOLD_BACKGROUND);

            // Add new background
            const newBg = this.backgrounds[this.currentBgIndex];
            this.arenaViewport.classList.add(newBg);

            this.currentBgIndex = (this.currentBgIndex + 1) % this.backgrounds.length;

            this.chatSystem.addChatMessage(this.chatSystem.getArenaWelcomeMessage(newBg));
        }

        // Immediately start fading back out to reveal new background
        if (this.bgOverlay) {
            this.bgOverlay.style.transition = 'opacity 0.5s ease-in-out';
            this.bgOverlay.style.opacity = '0';

            // Remove overlay after fade completes
            setTimeout(() => {
                if (this.bgOverlay) {
                    this.bgOverlay.remove();
                    this.bgOverlay = null;
                }
            }, 500);
        }
    }

    // ===== Victory Animation =====

    showVictoryAnimation(winner) {
        console.log('🏆 showVictoryAnimation called for:', winner);
        console.log('🏆 finalWinnerElement:', this.finalWinnerElement);
        console.log('🏆 finalLoserElement:', this.finalLoserElement);

        // Disconnect MutationObservers to prevent repeating damage elements on chat mode
        if (this.chatModeObservers) {
            console.log('🔇 Disconnecting chat mode observers to prevent damage element repetition');
            this.chatModeObservers.forEach(observer => observer.disconnect());
            this.chatModeObservers = null;
        }

        this.emojiSystem.setMaxSpawnRate();

        // Start coin shower from above (continuous until stopped)
        this.startVictoryCoinShower();

        // Play victory sound (full duration)
        if (!this.audioMuted) {
            const sound = new Audio(this.victorySoundPath);
            sound.volume = 0.5;
            sound.play().catch(err => console.log('Victory sound failed:', err));
        }

        // Upgrade chest to max tier ONLY if:
        // - NOT in hero-only mode, OR
        // - Hero won the tournament
        const heroWon = winner === 'Daring Hero';
        if (!this.heroLootOnlyMode || heroWon) {
            this.lootSystem.setMaxTier();
        }

        // Use stored winner/loser elements to ensure correct display
        if (!this.finalWinnerElement || !this.finalLoserElement) {
            console.error('❌ Final battle elements not stored! finalWinnerElement:', this.finalWinnerElement, 'finalLoserElement:', this.finalLoserElement);
            console.error('❌ Aborting victory animation');
            return;
        }

        console.log('✅ Final battle elements found, proceeding with victory animation');
        console.log('🎬 Creating victory screen elements...');

        // Stop emoji spam after 2 seconds to reduce lag
        setTimeout(() => {
            this.emojiSystem.stopEmojiReactions();
        }, 2000);

        // Hide the black background overlay immediately
        if (this.bgOverlay) {
            this.bgOverlay.style.display = 'none';
        }

        // Slide tournament progress out (up) - all instances
        document.querySelectorAll('.progress-container').forEach(el => {
            el.style.setProperty('transition', 'transform 0.8s ease-in, opacity 0.8s ease-in', 'important');
            el.style.setProperty('transform', 'translateY(-200px)', 'important');
            el.style.setProperty('opacity', '0', 'important');
        });

        // Slide odds display out (up) - all instances
        document.querySelectorAll('.top-odds').forEach(el => {
            el.style.setProperty('transition', 'transform 0.8s ease-in, opacity 0.8s ease-in', 'important');
            el.style.setProperty('transform', 'translateY(-200px)', 'important');
            el.style.setProperty('opacity', '0', 'important');
        });

        // Slide HP bars out (left and right) - all instances
        document.querySelectorAll('.left-hp').forEach(el => {
            el.style.setProperty('transition', 'transform 0.8s ease-in, opacity 0.8s ease-in', 'important');
            el.style.setProperty('transform', 'translateX(-300px)', 'important');
            el.style.setProperty('opacity', '0', 'important');
        });
        document.querySelectorAll('.right-hp').forEach(el => {
            el.style.setProperty('transition', 'transform 0.8s ease-in, opacity 0.8s ease-in', 'important');
            el.style.setProperty('transform', 'translateX(300px)', 'important');
            el.style.setProperty('opacity', '0', 'important');
        });

        // Hide existing fighters completely - all instances (main and chat mode)
        if (this.leftFighter) this.leftFighter.style.display = 'none';
        if (this.rightFighter) this.rightFighter.style.display = 'none';
        document.querySelectorAll('.fighter-left, .fighter-right').forEach(el => {
            el.style.display = 'none';
        });

        // Drop VS element down and away - all instances
        document.querySelectorAll('.vs-display').forEach(el => {
            el.style.setProperty('transition', 'transform 1s ease-in, opacity 0.8s ease-in', 'important');
            el.style.setProperty('transform', 'translateY(300px)', 'important');
            el.style.setProperty('opacity', '0', 'important');
        });

        // Also hide the nameplate-vs-container (scoped to PVP)
        this.tournamentScreen.querySelectorAll('.nameplate-vs-container').forEach(el => {
            el.style.setProperty('transition', 'transform 1s ease-in, opacity 0.8s ease-in', 'important');
            el.style.setProperty('transform', 'translateY(300px)', 'important');
            el.style.setProperty('opacity', '0', 'important');
        });

        // Find winner's nameplate and loser's nameplate (scoped to PVP)
        const leftNameplate = this.tournamentScreen.querySelector('.left-nameplate');
        const rightNameplate = this.tournamentScreen.querySelector('.right-nameplate');
        let winnerNameplate = null;
        let loserNameplate = null;

        if (leftNameplate) {
            const leftName = leftNameplate.querySelector('.nameplate-name')?.textContent;
            if (leftName === this.finalWinnerName) {
                winnerNameplate = leftNameplate;
                loserNameplate = rightNameplate;
            }
        }

        if (rightNameplate && !winnerNameplate) {
            const rightName = rightNameplate.querySelector('.nameplate-name')?.textContent;
            if (rightName === this.finalWinnerName) {
                winnerNameplate = rightNameplate;
                loserNameplate = leftNameplate;
            }
        }

        // Drop both nameplates down and away
        if (loserNameplate) {
            loserNameplate.style.setProperty('transition', 'transform 1s ease-in, opacity 0.8s ease-in', 'important');
            loserNameplate.style.setProperty('transform', 'translateY(300px)', 'important');
            loserNameplate.style.setProperty('opacity', '0', 'important');
        }

        if (winnerNameplate) {
            winnerNameplate.style.setProperty('transition', 'transform 1s ease-in, opacity 0.8s ease-in', 'important');
            winnerNameplate.style.setProperty('transform', 'translateY(300px)', 'important');
            winnerNameplate.style.setProperty('opacity', '0', 'important');
        }

        // Create 40% opacity black overlay above background
        const blackOverlay = document.createElement('div');
        blackOverlay.className = 'victory-black-overlay';
        blackOverlay.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.4);
            z-index: 2;
            opacity: 0;
            transition: opacity 0.8s ease-in;
            pointer-events: none;
        `;
        this.arenaViewport.appendChild(blackOverlay);

        // Fade in black overlay
        setTimeout(() => {
            blackOverlay.style.setProperty('opacity', '1', 'important');
        }, 100);

        // Create victory container (above overlay, z-index 500)
        const victoryContainer = document.createElement('div');
        victoryContainer.className = 'final-victory-container';
        victoryContainer.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 500;
            pointer-events: none;
        `;
        this.arenaViewport.appendChild(victoryContainer);
        console.log('✅ Victory container created and appended to viewport');

        // Clone and add winner to screen (fill screen, centered, lowered by 20px)
        const winnerDisplay = this.finalWinnerElement.cloneNode(true);
        winnerDisplay.className = 'final-victory-winner';
        winnerDisplay.style.cssText = `
            position: absolute;
            left: 50%;
            top: calc(50% + 20px);
            transform: translate(-50%, -50%) scale(1.1);
            z-index: 600;
            opacity: 0;
            transition: opacity 1s ease-in-out, transform 1s ease-in-out;
            will-change: opacity, transform;
        `;

        // Remove any nameplate that got cloned with the winner
        const clonedNameplate = winnerDisplay.querySelector('.left-nameplate, .right-nameplate');
        if (clonedNameplate) clonedNameplate.remove();

        victoryContainer.appendChild(winnerDisplay);

        // Fade in and scale up winner
        setTimeout(() => {
            winnerDisplay.style.setProperty('opacity', '1', 'important');
            winnerDisplay.style.setProperty('transform', 'translate(-50%, -50%) scale(1.2)', 'important');
            console.log('✅ Winner display fading in and scaling up');
        }, 200);

        // Add victory glow to winner sprite with subtle pulse
        setTimeout(() => {
            const winnerSprite = winnerDisplay.querySelector('.fighter-sprite img');
            if (winnerSprite) {
                winnerSprite.style.filter = 'drop-shadow(0 0 30px rgba(255, 215, 0, 0.8)) brightness(1.2)';
                winnerSprite.style.animation = 'winnerGlowPulse 2.5s ease-in-out infinite';
            }
        }, 500);

        // Create VICTORY! text near top (BEHIND hero, lower z-index)
        const victoryText = document.createElement('div');
        victoryText.className = 'final-victory-text';
        victoryText.style.cssText = `
            position: absolute;
            top: 20%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: 4rem;
            font-weight: bold;
            color: #FFD700;
            text-align: center;
            text-shadow:
                0 0 20px rgba(255, 215, 0, 1),
                0 0 40px rgba(255, 215, 0, 0.8),
                0 0 60px rgba(255, 255, 255, 0.6),
                4px 4px 8px rgba(0, 0, 0, 0.8);
            z-index: 550;
            pointer-events: none;
            opacity: 0;
            transition: opacity 0.8s ease-in-out;
            animation: victoryTextPulse 3s ease-in-out infinite;
            will-change: opacity;
        `;
        victoryText.textContent = 'VICTORY!';
        victoryContainer.appendChild(victoryText);
        console.log('✅ VICTORY text created and appended');

        // Fade in victory text
        setTimeout(() => {
            victoryText.style.setProperty('opacity', '1', 'important');
            console.log('✅ Victory text opacity set to 1');
            console.log('   Victory text computed opacity:', window.getComputedStyle(victoryText).opacity);
            console.log('   Victory text computed display:', window.getComputedStyle(victoryText).display);
            console.log('   Victory text computed visibility:', window.getComputedStyle(victoryText).visibility);
        }, 400);

        // Create centered victory nameplate for winner (matches original, 20% bigger, 50px wider)
        const victoryNameplate = document.createElement('div');
        victoryNameplate.className = 'victory-nameplate';
        victoryNameplate.style.cssText = `
            position: absolute !important;
            bottom: 0 !important;
            top: auto !important;
            left: 50% !important;
            transform: translateX(-50%) translateY(100px) scale(1.2) !important;
            background: linear-gradient(45deg, #ffd700, #ffed4e, #ffd700) !important;
            border: 2px solid #ffed4e !important;
            border-bottom: none !important;
            border-radius: 8px 8px 0 0 !important;
            padding: 12px 41px !important;
            text-align: center !important;
            box-shadow: 0 -4px 15px rgba(255, 215, 0, 0.4) !important;
            z-index: 1000 !important;
            opacity: 0;
            transition: opacity 0.8s ease-in-out, transform 0.8s ease-in-out;
            animation: victoryNameplatePulse 2s ease-in-out infinite;
        `;

        // Get winner's name and titles (matching original nameplate styles)
        const winnerName = document.createElement('div');
        winnerName.className = 'victory-nameplate-name';
        winnerName.style.cssText = `
            font-size: 1.1rem;
            font-weight: bold;
            color: #000;
            text-shadow: 1px 1px 2px rgba(255, 255, 255, 0.3);
            margin-bottom: 2px;
        `;
        winnerName.textContent = this.finalWinnerName;

        const winnerTitles = document.createElement('div');
        winnerTitles.className = 'victory-nameplate-titles';
        winnerTitles.style.cssText = `
            font-size: 0.7rem;
            color: #333;
            font-weight: 600;
            opacity: 0.8;
        `;

        // Get titles from the original nameplate if available
        let titlesText = 'Champion';
        if (winnerNameplate) {
            const originalTitles = winnerNameplate.querySelector('.nameplate-titles');
            if (originalTitles) {
                titlesText = originalTitles.textContent;
            }
        }
        winnerTitles.textContent = titlesText;

        victoryNameplate.appendChild(winnerName);
        victoryNameplate.appendChild(winnerTitles);
        victoryContainer.appendChild(victoryNameplate);
        console.log('✅ Victory nameplate created and appended');
        console.log('🎬 All victory elements created! Starting fade-in animations...');

        // Slide up and fade in victory nameplate (delayed to avoid flicker with old nameplates)
        setTimeout(() => {
            victoryNameplate.style.setProperty('opacity', '1', 'important');
            victoryNameplate.style.setProperty('transform', 'translateX(-50%) translateY(0) scale(1.2)', 'important');
            console.log('✅ Victory nameplate sliding up and fading in');
        }, 1200);

        this.battleStatus.style.opacity = '0';
    }

    /**
     * Start continuous coin shower for victory animation
     */
    startVictoryCoinShower() {
        console.log('💰 Starting victory coin shower!');

        // Create coins at a steady rate
        this.victoryCoinInterval = setInterval(() => {
            const coin = document.createElement('img');
            coin.className = 'victory-coin';
            coin.src = '/images/effects/Gold Coin.webp';

            // Increased randomization for better stagger effect
            const randomDelay = Math.random() * 1.2; // 0-1200ms delay
            const randomDuration = 2 + Math.random() * 2; // 2-4s duration

            coin.style.cssText = `
                position: absolute;
                left: ${Math.random() * 100}%;
                top: -50px;
                width: ${7.5 + Math.random() * 5}px;
                height: auto;
                z-index: 3;
                pointer-events: none;
                animation: coinFall ${randomDuration}s linear forwards ${randomDelay}s, coinRotate 1s linear infinite ${randomDelay}s !important;
            `;
            this.arenaViewport.appendChild(coin);

            // Remove coin after animation completes (account for longest possible duration)
            setTimeout(() => coin.remove(), 5500);
        }, 100); // Spawn a coin every 100ms (faster spawn rate)
    }

    /**
     * Stop victory coin shower
     */
    stopVictoryCoinShower() {
        if (this.victoryCoinInterval) {
            clearInterval(this.victoryCoinInterval);
            this.victoryCoinInterval = null;
        }
    }

    // ===== Combat Cleanup =====

    cleanupCombatElements() {
        // Remove combat text elements (scoped to Tournament)
        const leftNameplate = this.tournamentScreen.querySelector('.left-nameplate');
        if (leftNameplate) {
            leftNameplate.querySelectorAll('.fighter-health').forEach(el => el.remove());
        }

        if (this.leftFighter) {
            this.leftFighter.querySelectorAll('.damage-number, .block-text, .parry-text, .miss-text').forEach(el => el.remove());
        }
        if (this.rightFighter) {
            this.rightFighter.querySelectorAll('.damage-number, .block-text, .parry-text, .miss-text').forEach(el => el.remove());
        }

        // CRITICAL: Remove crit-shake class from arena viewport (prevents lingering shake)
        if (this.arenaViewport) {
            this.arenaViewport.classList.remove('crit-shake');
        }

        // SIMPLIFIED: Clear any glow filters and animations from fighters
        if (this.leftFighter) {
            const leftSprite = this.leftFighter.querySelector('.fighter-sprite img');
            if (leftSprite) {
                leftSprite.style.removeProperty('filter');
                leftSprite.style.removeProperty('animation');
            }
        }
        if (this.rightFighter) {
            const rightSprite = this.rightFighter.querySelector('.fighter-sprite img');
            if (rightSprite) {
                rightSprite.style.removeProperty('filter');
                rightSprite.style.removeProperty('animation');
            }
        }

        // Remove victory container and black overlay
        if (this.arenaViewport) {
            const victoryContainer = this.arenaViewport.querySelector('.final-victory-container');
            if (victoryContainer) {
                victoryContainer.remove();
            }

            const blackOverlay = this.arenaViewport.querySelector('.victory-black-overlay');
            if (blackOverlay) {
                blackOverlay.remove();
            }
        }

        // Restore background overlay
        if (this.bgOverlay) {
            this.bgOverlay.style.display = '';
        }

        // Restore tournament progress and odds (scoped to PVP)
        const progressContainer = this.tournamentScreen.querySelector('.progress-container');
        if (progressContainer) {
            progressContainer.style.transform = '';
            progressContainer.style.opacity = '1';
            progressContainer.style.transition = '';
        }

        const oddsDisplay = this.tournamentScreen.querySelector('.top-odds');
        if (oddsDisplay) {
            oddsDisplay.style.transform = '';
            oddsDisplay.style.opacity = '1';
            oddsDisplay.style.transition = '';
        }

        // Restore HP bars (scoped to PVP)
        const leftHP = this.tournamentScreen.querySelector('.left-hp');
        const rightHP = this.tournamentScreen.querySelector('.right-hp');
        if (leftHP) {
            leftHP.style.transform = '';
            leftHP.style.opacity = '1';
            leftHP.style.transition = '';
        }
        if (rightHP) {
            rightHP.style.transform = '';
            rightHP.style.opacity = '1';
            rightHP.style.transition = '';
        }

        this.tournamentScreen.querySelectorAll('.fighter-health').forEach(hp => {
            hp.style.opacity = '1';
        });

        // Restore nameplates (scoped to PVP)
        this.tournamentScreen.querySelectorAll('.left-nameplate, .right-nameplate').forEach(plate => {
            plate.style.display = '';
            plate.style.position = '';
            plate.style.left = '';
            plate.style.bottom = '';
            plate.style.top = '';
            plate.style.transform = '';
            plate.style.opacity = '1';
            plate.style.zIndex = '';
            plate.style.transition = '';
        });

        // Restore VS elements (scoped to PVP)
        const vsDisplay = this.tournamentScreen.querySelector('.vs-display');
        if (vsDisplay) {
            vsDisplay.style.display = '';
            vsDisplay.style.transform = '';
            vsDisplay.style.opacity = '1';
            vsDisplay.style.transition = '';
        }

        const nameplateVsContainer = this.tournamentScreen.querySelector('.nameplate-vs-container');
        if (nameplateVsContainer) {
            nameplateVsContainer.style.display = '';
            nameplateVsContainer.style.transform = '';
            nameplateVsContainer.style.opacity = '1';
            nameplateVsContainer.style.transition = '';
        }

        // Restore fighter visibility
        if (this.leftFighter) {
            this.leftFighter.style.display = '';
            this.leftFighter.style.opacity = '1';
        }
        if (this.rightFighter) {
            this.rightFighter.style.display = '';
            this.rightFighter.style.opacity = '1';
        }

        // Remove loot glow
        this.lootSystem.removeVictoryGlow();
    }

    // ===== Bracket Management =====

    renderBracket() {
        if (!this.bracketDisplay) return;

        const currentMatch = this.tournament.getCurrentMatch();
        const roundInfo = this.tournament.getRoundInfo();

        const htmlParts = [];

        // Render each round
        for (let roundIndex = 0; roundIndex < this.tournament.bracket.length - 1; roundIndex++) {
            const round = this.tournament.bracket[roundIndex];
            const roundName = this.getRoundName(roundIndex + 1);
            const isCurrentRound = roundIndex + 1 === roundInfo.current;

            htmlParts.push(`<div class="bracket-round">`);
            htmlParts.push(`<div class="bracket-round-title ${isCurrentRound ? 'active-round' : ''}">${roundName}</div>`);
            htmlParts.push(`<div class="bracket-matches">`);

            for (let i = 0; i < round.length; i += 2) {
                const participant1 = round[i];
                const participant2 = round[i + 1];
                const matchIndex = Math.floor(i / 2);

                const nextRound = this.tournament.bracket[roundIndex + 1];
                const isCompleted = nextRound && nextRound[matchIndex];
                const isCurrent = currentMatch &&
                    roundIndex + 1 === roundInfo.current &&
                    ((participant1 === currentMatch.participant1 && participant2 === currentMatch.participant2) ||
                     (participant1 === currentMatch.participant2 && participant2 === currentMatch.participant1));

                const isOnFollowingPath = this.isMatchOnFollowingPath(participant1, participant2, roundIndex + 1);

                htmlParts.push(this.renderMatch(participant1, participant2, isCompleted, isCurrent, nextRound ? nextRound[matchIndex] : null, isOnFollowingPath, roundIndex < this.tournament.bracket.length - 2));
            }

            htmlParts.push(`</div></div>`);
        }

        // Champion
        const winner = this.tournament.bracket[this.tournament.bracket.length - 1][0];
        htmlParts.push(`<div class="bracket-round" style="display: flex; flex-direction: column; justify-content: center;">`);
        htmlParts.push(`<div class="bracket-round-title">CHAMPION</div>`);
        if (winner) {
            htmlParts.push(`<div class="bracket-winner-display">🏆 ${winner} 🏆</div>`);
        } else {
            htmlParts.push(`<div class="bracket-winner-display awaiting">Awaiting Winner...</div>`);
        }
        htmlParts.push(`</div>`);

        const bracketHTML = htmlParts.join('');
        this.bracketDisplay.innerHTML = bracketHTML;
        if (this.overlayBracketDisplay) {
            this.overlayBracketDisplay.innerHTML = bracketHTML;
        }

        setTimeout(() => {
            this.updateBracketTransform();
            this.updateSliderRange();
        }, 50);

        setTimeout(() => {
            this.scrollToCurrentMatch();
        }, 100);
    }

    renderMatch(participant1, participant2, isCompleted, isCurrent, winner, isOnFollowingPath, showConnector) {
        if (!participant1 && !participant2) {
            return `<div class="bracket-match empty"><div class="bracket-bye">Empty</div></div>`;
        }

        if (!participant1 || !participant2) {
            const advancer = participant1 || participant2;
            let matchClass = 'bracket-match bye-match';
            if (isOnFollowingPath) matchClass += ' following-path';

            return `<div class="${matchClass}">
                <div class="bracket-participant bye-winner ${advancer === this.tournament.followingCharacter ? 'following' : ''}">${advancer}</div>
                ${showConnector ? '<div class="bracket-connector' + (isOnFollowingPath ? ' active' : '') + '"></div>' : ''}
            </div>`;
        }

        let matchClass = 'bracket-match';
        if (isCompleted) matchClass += ' completed';
        if (isCurrent) matchClass += ' current';
        if (isOnFollowingPath) matchClass += ' following-path';

        let html = `<div class="${matchClass}">`;

        let p1Class = 'bracket-participant';
        if (isCompleted && winner === participant1) p1Class += ' winner';
        else if (isCompleted && winner !== participant1) p1Class += ' eliminated';
        if (participant1 === this.tournament.followingCharacter) p1Class += ' following';

        html += `<div class="${p1Class}">${participant1}</div>`;
        html += `<div class="vs-separator">VS</div>`;

        let p2Class = 'bracket-participant';
        if (isCompleted && winner === participant2) p2Class += ' winner';
        else if (isCompleted && winner !== participant2) p2Class += ' eliminated';
        if (participant2 === this.tournament.followingCharacter) p2Class += ' following';

        html += `<div class="${p2Class}">${participant2}</div>`;

        if (showConnector) {
            html += `<div class="bracket-connector${isOnFollowingPath ? ' active' : ''}"></div>`;
        }

        html += `</div>`;
        return html;
    }

    isMatchOnFollowingPath(participant1, participant2, roundNumber) {
        if (!this.tournament.followingCharacter) return false;

        const followingChar = this.tournament.followingCharacter;
        if (participant1 === followingChar || participant2 === followingChar) {
            return true;
        }

        return false;
    }

    getRoundName(roundNumber) {
        return ROUND_NAMES[roundNumber] || `Round ${roundNumber}`;
    }

    scrollToCurrentMatch() {
        this.bracketSystem.scrollToCurrentMatch();
    }

    // ===== Progress Bar =====

    initProgressBar() {
        if (!this.progressSegments) return;

        this.progressSegments.innerHTML = '';
        for (let i = 0; i < UI_CONFIG.TOTAL_ROUNDS; i++) {
            const segment = document.createElement('div');
            segment.className = 'progress-segment';
            this.progressSegments.appendChild(segment);
        }
    }

    updateProgressBar() {
        if (!this.progressSegments) return;

        const roundInfo = this.tournament.getRoundInfo();
        const segments = this.progressSegments.querySelectorAll('.progress-segment');

        // Tier names for each round - New system: Wood/Stone/Copper/Bronze/Silver/Gold/Diamond/Platinum
        const tiers = ['grey', 'green', 'blue', 'teal', 'purple', 'orange', 'crimson', 'gold'];

        segments.forEach((segment, index) => {
            // Remove all tier classes first
            tiers.forEach(tier => segment.classList.remove(`tier-${tier}`));

            // Current round and all previous rounds should be filled/completed
            if (index <= roundInfo.current - 1) {
                segment.classList.add('completed');
                segment.classList.remove('active');
                // Add tier class for completed segments
                segment.classList.add(`tier-${tiers[index]}`);
            } else {
                segment.classList.remove('completed', 'active');
            }
        });

        // Update hero progress indicator
        this.updateHeroProgressIndicator();
    }

    updateHeroProgressIndicator() {
        if (!this.heroProgressIndicator || !this.progressSegments) return;

        const segments = this.progressSegments.querySelectorAll('.progress-segment');
        if (segments.length === 0) return;

        const segmentWidth = 252 / segments.length; // Total progress bar width is 252px

        // Determine which round to show based on toggle state
        let displayRound;
        if (!this.heroLootOnlyMode) {
            // Toggle ON: show current tournament round
            const roundInfo = this.tournament.getRoundInfo();
            displayRound = roundInfo.current;
        } else {
            // Toggle OFF: show hero's max round
            displayRound = this.heroMaxRound;
        }

        // Calculate position - always stay gold, no color changes
        // If displayRound is 0 or undefined, default to round 1 position (center of first segment)
        const effectiveRound = displayRound > 0 ? displayRound : 1;
        const position = (effectiveRound - 1) * segmentWidth + (segmentWidth / 2) - 7; // Center on segment, offset for chevron width
        this.heroProgressIndicator.style.left = `${position}px`;
    }

    // ===== Chat Management =====

    startChatScroll() {
        if (!this.chatMessages) return;

        this.chatSystem.addChatMessage("Welcome to RNG Arena!");
        this.chatSystem.addChatMessage("Pure RNG battles await...");

        this.updateChatRate(1); // Start with round 1 rate
    }

    updateChatRate(roundNumber) {
        // Clear existing interval
        if (this.chatScrollInterval) {
            clearInterval(this.chatScrollInterval);
        }

        // Get base rate for this round
        const baseRate = UI_CONFIG.CHAT_RATE_BY_ROUND[roundNumber] || 1200;
        const randomVariation = Math.random() * 400; // Add some randomness

        this.chatScrollInterval = setInterval(() => {
            if ((this.startButton && !this.startButton.disabled) || this.tournamentStarted) {
                this.chatSystem.addChatMessage(this.chatSystem.getRandomHypeMessage());
            }
        }, baseRate + randomVariation);
    }

    sendUserMessage() {
        if (!this.chatInput) return;

        const message = this.chatInput.value.trim();
        if (message) {
            this.chatSystem.addChatMessage(message, true); // Mark as user's own message
            this.chatInput.value = '';
        }
    }

    // ===== Bracket Controls =====

    initBracketControls() {
        // Dev frame zoom controls
        if (this.zoomInBtn) {
            this.zoomInBtn.addEventListener('click', () => {
                this.currentZoom = Math.min(BRACKET_CONFIG.MAX_ZOOM, this.currentZoom + BRACKET_CONFIG.ZOOM_STEP);
                this.bracketSystem.setZoom(this.currentZoom);
                this.updateZoomDisplay();
            });
        }

        if (this.zoomOutBtn) {
            this.zoomOutBtn.addEventListener('click', () => {
                this.currentZoom = Math.max(BRACKET_CONFIG.MIN_ZOOM, this.currentZoom - BRACKET_CONFIG.ZOOM_STEP);
                this.bracketSystem.setZoom(this.currentZoom);
                this.updateZoomDisplay();
            });
        }

        if (this.bracketSlider) {
            this.bracketSlider.addEventListener('input', (e) => {
                const scrollPercent = parseFloat(e.target.value);
                this.scrollBracketTo(scrollPercent);
            });
        }

        // Overlay zoom controls
        if (this.overlayZoomInBtn) {
            this.overlayZoomInBtn.addEventListener('click', () => {
                this.currentZoom = Math.min(BRACKET_CONFIG.MAX_ZOOM, this.currentZoom + BRACKET_CONFIG.ZOOM_STEP);
                if (this.overlayBracketDisplay) {
                    this.overlayBracketDisplay.style.zoom = this.currentZoom;
                }
                this.updateZoomDisplay();
            });
        }

        if (this.overlayZoomOutBtn) {
            this.overlayZoomOutBtn.addEventListener('click', () => {
                this.currentZoom = Math.max(BRACKET_CONFIG.MIN_ZOOM, this.currentZoom - BRACKET_CONFIG.ZOOM_STEP);
                if (this.overlayBracketDisplay) {
                    this.overlayBracketDisplay.style.zoom = this.currentZoom;
                }
                this.updateZoomDisplay();
            });
        }

        if (this.overlayBracketSlider) {
            this.overlayBracketSlider.addEventListener('input', (e) => {
                const scrollPercent = parseFloat(e.target.value);
                // TODO: Implement overlay bracket scrolling
            });
        }

        this.updateZoomDisplay();
    }

    updateZoomDisplay() {
        if (this.zoomLevel) {
            const displayZoom = this.bracketSystem.getDisplayZoom();
            this.zoomLevel.textContent = `${displayZoom}%`;
        }
        if (this.overlayZoomLevel) {
            const displayZoom = this.bracketSystem.getDisplayZoom();
            this.overlayZoomLevel.textContent = `${displayZoom}%`;
        }

        // Update button states
        if (this.zoomOutBtn) {
            this.zoomOutBtn.disabled = this.currentZoom <= BRACKET_CONFIG.MIN_ZOOM;
        }
        if (this.zoomInBtn) {
            this.zoomInBtn.disabled = this.currentZoom >= BRACKET_CONFIG.MAX_ZOOM;
        }
        if (this.overlayZoomOutBtn) {
            this.overlayZoomOutBtn.disabled = this.currentZoom <= BRACKET_CONFIG.MIN_ZOOM;
        }
        if (this.overlayZoomInBtn) {
            this.overlayZoomInBtn.disabled = this.currentZoom >= BRACKET_CONFIG.MAX_ZOOM;
        }
    }

    updateBracketTransform() {
        if (this.bracketDisplay) {
            this.bracketDisplay.style.zoom = this.currentZoom;
        }
        if (this.overlayBracketDisplay) {
            this.overlayBracketDisplay.style.zoom = this.currentZoom;
        }
    }

    updateSliderRange() {
        if (!this.bracketViewport || !this.bracketSlider) return;

        const maxScroll = this.bracketViewport.scrollWidth - this.bracketViewport.clientWidth;
        if (maxScroll > 0) {
            this.bracketSlider.disabled = false;
        } else {
            this.bracketSlider.disabled = true;
        }
    }

    scrollBracketTo(percent) {
        if (!this.bracketViewport) return;

        const maxScroll = this.bracketViewport.scrollWidth - this.bracketViewport.clientWidth;
        const targetScroll = (percent / 100) * maxScroll;

        this.bracketViewport.scrollTo({
            left: targetScroll,
            behavior: 'smooth'
        });
    }

    // ===== Bracket Overlay =====

    initBracketOverlay() {
        const bracketModeBtn = document.getElementById('bracket-mode');
        const chatModeBtn = document.getElementById('chat-mode');
        const bracketOverlay = document.getElementById('bracket-overlay');
        const closeBracket = document.getElementById('close-bracket');
        const fullscreenBtn = document.getElementById('fullscreen-btn');
        const settingsBtn = document.getElementById('settings-btn');
        const muteBtn = document.getElementById('mute-audio');

        if (bracketModeBtn && bracketOverlay) {
            bracketModeBtn.addEventListener('click', () => {
                bracketOverlay.classList.remove('hidden');
                bracketOverlay.classList.add('active');
            });
        }

        if (chatModeBtn) {
            const chatModeOverlay = document.getElementById('chat-mode-overlay');
            const closeChatModeBtn = document.getElementById('close-chat-mode-overlay');
            const chatModeSettingsBtn = document.getElementById('chat-mode-settings-btn');
            const chatModeMuteBtn = document.getElementById('chat-mode-mute-btn');
            const devFrame = document.querySelector('.dev-frame');

            const openChatMode = () => {
                console.log('Opening chat mode...');

                // Hide bracket overlay if open
                if (bracketOverlay) {
                    bracketOverlay.classList.add('hidden');
                    bracketOverlay.classList.remove('active');
                }

                // Switch to chat tab
                const chatTab = document.querySelector('.dev-tab[data-tab="chat"]');
                if (chatTab) {
                    chatTab.click(); // This will switch the tab
                }

                // Hide tabs and other dev frames
                const tabsContainer = document.querySelector('.dev-tabs-container');
                const bracketDevFrame = document.querySelector('.bracket-dev-frame');
                const lootDevFrame = document.querySelector('.loot-claim-dev-frame');
                const chatDevFrame = document.querySelector('.chat-mode-dev-frame');

                if (tabsContainer) tabsContainer.style.display = 'none';
                if (bracketDevFrame) bracketDevFrame.style.display = 'none';
                if (lootDevFrame) lootDevFrame.style.display = 'none';
                if (chatDevFrame) chatDevFrame.style.display = 'none';

                // Pause main battlefield to prevent performance issues
                const mainBattlefield = document.querySelector('.battlefield-section');
                if (mainBattlefield) {
                    mainBattlefield.style.visibility = 'hidden';
                    mainBattlefield.style.pointerEvents = 'none';
                }

                // Rotate dev-frame counter-clockwise
                if (devFrame) {
                    console.log('Adding chat-mode-active class to dev-frame');
                    devFrame.classList.add('chat-mode-active');
                    // Force the rotation with inline styles (keep original dimensions)
                    devFrame.style.transform = 'rotate(-90deg)';
                    console.log('Dev-frame classes:', devFrame.className);
                    console.log('Dev-frame transform:', devFrame.style.transform);
                } else {
                    console.log('Dev-frame not found!');
                }

                // Open chat mode overlay
                if (chatModeOverlay) {
                    chatModeOverlay.classList.remove('hidden');
                    // Init battlefield clone and start syncing immediately
                    this.initChatModeBattlefield();
                    this.initChatModeInput();
                }
            };

            const closeChatModeOverlay = () => {
                // Rotate dev-frame back
                if (devFrame) {
                    devFrame.classList.remove('chat-mode-active');
                    devFrame.style.transform = '';
                }

                // Resume main battlefield
                const mainBattlefield = document.querySelector('.battlefield-section');
                if (mainBattlefield) {
                    mainBattlefield.style.visibility = '';
                    mainBattlefield.style.pointerEvents = '';
                }

                // Show tabs and other dev frames again
                const tabsContainer = document.querySelector('.dev-tabs-container');
                const bracketDevFrame = document.querySelector('.bracket-dev-frame');
                const lootDevFrame = document.querySelector('.loot-claim-dev-frame');
                const chatDevFrame = document.querySelector('.chat-mode-dev-frame');

                if (tabsContainer) tabsContainer.style.display = '';
                if (bracketDevFrame) bracketDevFrame.style.display = '';
                if (lootDevFrame) lootDevFrame.style.display = '';
                if (chatDevFrame) chatDevFrame.style.display = '';

                if (chatModeOverlay) {
                    chatModeOverlay.classList.add('hidden');

                    // Stop syncing to save performance
                    if (this.syncChatModeBattlefield) {
                        clearInterval(this.syncChatModeBattlefield);
                        this.syncChatModeBattlefield = null;
                    }

                    // Disconnect mutation observers
                    if (this.chatModeObservers) {
                        this.chatModeObservers.forEach(observer => observer.disconnect());
                        this.chatModeObservers = null;
                    }
                }
            };

            chatModeBtn.addEventListener('click', openChatMode);

            if (closeChatModeBtn) {
                closeChatModeBtn.addEventListener('click', closeChatModeOverlay);
            }

            // Top bar buttons in chat mode
            if (chatModeSettingsBtn && settingsBtn) {
                chatModeSettingsBtn.addEventListener('click', () => {
                    settingsBtn.click();
                });
            }

            if (chatModeMuteBtn && muteBtn) {
                // Sync mute button appearance
                const syncMuteButton = () => {
                    const muteBtnImg = muteBtn.querySelector('.icon-img');
                    const chatModeMuteBtnImg = chatModeMuteBtn.querySelector('.icon-img');
                    if (muteBtnImg && chatModeMuteBtnImg) {
                        chatModeMuteBtnImg.src = muteBtnImg.src;
                        chatModeMuteBtnImg.alt = muteBtnImg.alt;
                    }
                };

                chatModeMuteBtn.addEventListener('click', () => {
                    muteBtn.click();
                    setTimeout(syncMuteButton, 50);
                });

                // Initial sync
                syncMuteButton();

                // Observe changes to main mute button
                const muteObserver = new MutationObserver(syncMuteButton);
                muteObserver.observe(muteBtn, { childList: true, characterData: true, subtree: true });
            }
        }

        if (closeBracket && bracketOverlay) {
            closeBracket.addEventListener('click', () => {
                bracketOverlay.classList.add('hidden');
                bracketOverlay.classList.remove('active');
            });
        }

        if (bracketOverlay) {
            bracketOverlay.addEventListener('click', (e) => {
                if (e.target === bracketOverlay) {
                    bracketOverlay.classList.add('hidden');
                    bracketOverlay.classList.remove('active');
                }
            });
        }

        // Fullscreen button - scope to Tournament screen
        const tournamentScreen = document.getElementById('tournament-screen');
        const battlefieldSection = tournamentScreen ? tournamentScreen.querySelector('.battlefield-section') : null;
        const fullscreenCloseBtn = tournamentScreen ? tournamentScreen.querySelector('.battlefield-fullscreen-close') : null;

        if (fullscreenBtn && battlefieldSection) {
            fullscreenBtn.addEventListener('click', () => {
                battlefieldSection.classList.add('fullscreen');
            });
        }

        if (fullscreenCloseBtn && battlefieldSection) {
            fullscreenCloseBtn.addEventListener('click', () => {
                battlefieldSection.classList.remove('fullscreen');
            });
        }

        // Settings button (placeholder)
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => {
                console.log('Settings button clicked');
                // TODO: Open settings panel
            });
        }

        // Exit button - returns to PVP screen
        const exitBtn = document.getElementById('exit-game');
        if (exitBtn) {
            exitBtn.addEventListener('click', () => {
                this.navigateToScreen('pvp');
            });
        }
    }

    // ===== Chat Mode Battlefield =====

    initChatModeBattlefield() {
        const chatModeBattlefield = document.getElementById('chat-mode-battlefield-overlay');
        // Get Tournament arena viewport specifically (has 'castle' class, not 'wood-castle')
        const arenaViewport = document.querySelector('#tournament-screen .arena-viewport.castle');

        if (!chatModeBattlefield || !arenaViewport) {
            console.log('Chat mode battlefield elements not found:', { chatModeBattlefield, arenaViewport });
            return;
        }

        // Clone the arena viewport
        const clone = arenaViewport.cloneNode(true);

        // Clear the chat mode battlefield and append clone
        chatModeBattlefield.innerHTML = '';
        chatModeBattlefield.appendChild(clone);

        // Clean up cloned elements
        const startBtn = clone.querySelector('#start-battle');
        if (startBtn) startBtn.style.display = 'none';

        // Calculate scale to fit container
        // Arena viewport is 588px wide × 280px tall
        // Default container: 374px wide × 300px tall (portrait mode in dev)
        // Overlay container: 160px tall

        // Check if chat mode overlay is active
        const chatModeOverlay = document.getElementById('chat-mode-overlay');
        const isActive = chatModeOverlay && !chatModeOverlay.classList.contains('hidden');

        let scale, leftOffset;
        if (isActive) {
            // Overlay mode: scale to fit 216px height (35% bigger)
            scale = 216 / 280; // 0.771
            const scaledWidth = 588 * scale; // 453.348px
            // Center horizontally in 374px container
            leftOffset = (374 - scaledWidth) / 2; // -39.674px (centered)
        } else {
            // Dev mode: scale to fit 300px height
            scale = 300 / 280; // 1.071
            const scaledWidth = 588 * scale;
            leftOffset = (374 - scaledWidth) / 2;
        }

        clone.style.transform = `scale(${scale})`;
        clone.style.transformOrigin = 'top left';
        clone.style.width = '588px';
        clone.style.height = '280px';
        clone.style.position = 'absolute';
        clone.style.top = '0';
        clone.style.left = `${leftOffset}px`;

        console.log('Chat mode battlefield initialized with scale:', scale);

        // Set up continuous sync at 100ms for smooth transitions (10 FPS)
        if (this.syncChatModeBattlefield) {
            clearInterval(this.syncChatModeBattlefield);
        }
        this.syncChatModeBattlefield = setInterval(() => {
            this.updateChatModeBattlefield();
        }, 100);

        // Create a simple black overlay for chat mode transitions (independent of main battlefield)
        const chatModeTransitionOverlay = document.createElement('div');
        chatModeTransitionOverlay.id = 'chat-mode-transition-overlay';
        chatModeTransitionOverlay.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: black;
            opacity: 0;
            z-index: 200;
            pointer-events: none;
            transition: opacity 0.8s ease-in-out;
        `;
        clone.appendChild(chatModeTransitionOverlay);

        // Set up MutationObservers for real-time animation class syncing
        this.setupAnimationObservers();
    }

    // Simple chat mode transition - fade to black and back
    triggerChatModeTransition() {
        const overlay = document.getElementById('chat-mode-transition-overlay');
        if (!overlay) return;

        console.log('🎬 Chat mode transition starting');

        // Fade to full black over 0.8s
        overlay.style.opacity = '1';

        // After 1.5s at full black, fade back out over 0.8s
        setTimeout(() => {
            overlay.style.opacity = '0';
            console.log('🎬 Chat mode transition complete');
        }, 1500);
    }

    setupAnimationObservers() {
        // Get Tournament arena viewport specifically
        const tournamentScreen = document.getElementById('tournament-screen');
        const arenaViewport = tournamentScreen ? tournamentScreen.querySelector('.arena-viewport') : null;
        const chatModeBattlefield = document.getElementById('chat-mode-battlefield-overlay');

        if (!arenaViewport || !chatModeBattlefield) return;

        // Disconnect existing observers first (if any)
        if (this.chatModeObservers) {
            console.log('🔄 Disconnecting old observers before setting up new ones');
            this.chatModeObservers.forEach(observer => observer.disconnect());
            this.chatModeObservers = null;
        }

        const originalLeftFighter = arenaViewport.querySelector('.fighter-left');
        const originalRightFighter = arenaViewport.querySelector('.fighter-right');
        const cloneLeftFighter = chatModeBattlefield.querySelector('.fighter-left');
        const cloneRightFighter = chatModeBattlefield.querySelector('.fighter-right');

        if (!originalLeftFighter || !originalRightFighter || !cloneLeftFighter || !cloneRightFighter) return;

        const animClasses = ['fighter-attacking', 'fighter-crit-attack', 'fighter-defending', 'fighter-miss', 'fighter-block', 'fighter-parry', 'fighter-hit', 'fighter-crit-glow', 'fighter-entrance-left', 'fighter-entrance-right'];
        const combatElementClasses = ['damage-number', 'attacker-damage-number', 'crit-number', 'attacker-crit-number', 'block-text', 'parry-text', 'miss-text', 'slash-effect', 'block-effect', 'parry-effect'];

        // Observer for left fighter
        const leftObserver = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    const originalClasses = originalLeftFighter.className.split(' ');
                    const newAnimClasses = originalClasses.filter(c => animClasses.includes(c));

                    console.log('[LEFT FIGHTER] Class changed:', {
                        allClasses: originalClasses,
                        animClasses: newAnimClasses,
                        cloneBefore: cloneLeftFighter.className
                    });

                    // Remove all animation classes from clone
                    animClasses.forEach(c => cloneLeftFighter.classList.remove(c));

                    // Add current animation classes
                    newAnimClasses.forEach(c => {
                        console.log('[LEFT FIGHTER] Adding animation class to clone:', c);
                        cloneLeftFighter.classList.add(c);
                    });

                    console.log('[LEFT FIGHTER] Clone after:', cloneLeftFighter.className);
                }

                // Handle added nodes (damage numbers, effects, etc.)
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === 1) { // Element node
                            const isCombatElement = combatElementClasses.some(cls => node.classList.contains(cls));
                            if (isCombatElement) {
                                // Give the original element a unique ID
                                if (!node.dataset.cloneId) {
                                    node.dataset.cloneId = Math.random().toString(36).substr(2, 9);
                                }

                                // Clone the element immediately to chat mode with the ID
                                const clonedNode = node.cloneNode(true);
                                clonedNode.dataset.cloneId = node.dataset.cloneId;
                                cloneLeftFighter.appendChild(clonedNode);
                            }
                        }
                    });
                }
            });
        });

        // Observer for right fighter
        const rightObserver = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    const originalClasses = originalRightFighter.className.split(' ');
                    const newAnimClasses = originalClasses.filter(c => animClasses.includes(c));

                    console.log('[RIGHT FIGHTER] Class changed:', {
                        allClasses: originalClasses,
                        animClasses: newAnimClasses,
                        cloneBefore: cloneRightFighter.className
                    });

                    // Remove all animation classes from clone
                    animClasses.forEach(c => cloneRightFighter.classList.remove(c));

                    // Add current animation classes
                    newAnimClasses.forEach(c => {
                        console.log('[RIGHT FIGHTER] Adding animation class to clone:', c);
                        cloneRightFighter.classList.add(c);
                    });

                    console.log('[RIGHT FIGHTER] Clone after:', cloneRightFighter.className);
                }

                // Handle added nodes (damage numbers, effects, etc.)
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === 1) { // Element node
                            const isCombatElement = combatElementClasses.some(cls => node.classList.contains(cls));
                            if (isCombatElement) {
                                // Give the original element a unique ID
                                if (!node.dataset.cloneId) {
                                    node.dataset.cloneId = Math.random().toString(36).substr(2, 9);
                                }

                                // Clone the element immediately to chat mode with the ID
                                const clonedNode = node.cloneNode(true);
                                clonedNode.dataset.cloneId = node.dataset.cloneId;
                                cloneRightFighter.appendChild(clonedNode);
                            }
                        }
                    });
                }
            });
        });

        // Observer for left sprite style changes (loser fade-out)
        const leftSpriteObserver = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                    const originalLeftSprite = originalLeftFighter.querySelector('.fighter-sprite');
                    const cloneLeftSprite = cloneLeftFighter.querySelector('.fighter-sprite');
                    if (originalLeftSprite && cloneLeftSprite && originalLeftSprite.style.animation) {
                        // Only update if animation actually changed
                        if (cloneLeftSprite.style.animation !== originalLeftSprite.style.animation) {
                            console.log('[LEFT SPRITE] Style animation changed to:', originalLeftSprite.style.animation);
                            cloneLeftSprite.style.animation = originalLeftSprite.style.animation;
                        }
                    }
                }
            });
        });

        // Observer for right sprite style changes (loser fade-out)
        const rightSpriteObserver = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                    const originalRightSprite = originalRightFighter.querySelector('.fighter-sprite');
                    const cloneRightSprite = cloneRightFighter.querySelector('.fighter-sprite');
                    if (originalRightSprite && cloneRightSprite && originalRightSprite.style.animation) {
                        // Only update if animation actually changed
                        if (cloneRightSprite.style.animation !== originalRightSprite.style.animation) {
                            console.log('[RIGHT SPRITE] Style animation changed to:', originalRightSprite.style.animation);
                            cloneRightSprite.style.animation = originalRightSprite.style.animation;
                        }
                    }
                }
            });
        });

        // Start observing
        console.log('[ANIMATION OBSERVERS] Setting up observers for:', {
            originalLeft: originalLeftFighter,
            originalRight: originalRightFighter,
            cloneLeft: cloneLeftFighter,
            cloneRight: cloneRightFighter
        });
        leftObserver.observe(originalLeftFighter, {
            attributes: true,
            attributeFilter: ['class'],
            childList: true, // Watch for added/removed child nodes (damage numbers, effects)
            subtree: false // Only direct children
        });
        rightObserver.observe(originalRightFighter, {
            attributes: true,
            attributeFilter: ['class'],
            childList: true, // Watch for added/removed child nodes (damage numbers, effects)
            subtree: false // Only direct children
        });

        // Observe sprite style changes
        const originalLeftSprite = originalLeftFighter.querySelector('.fighter-sprite');
        const originalRightSprite = originalRightFighter.querySelector('.fighter-sprite');
        if (originalLeftSprite) {
            leftSpriteObserver.observe(originalLeftSprite, {
                attributes: true,
                attributeFilter: ['style']
            });
        }
        if (originalRightSprite) {
            rightSpriteObserver.observe(originalRightSprite, {
                attributes: true,
                attributeFilter: ['style']
            });
        }

        console.log('[ANIMATION OBSERVERS] Observers active');

        // Store observers so we can disconnect them later
        this.chatModeObservers = [leftObserver, rightObserver, leftSpriteObserver, rightSpriteObserver];
    }

    updateChatModeBattlefield() {
        const chatModeBattlefield = document.getElementById('chat-mode-battlefield-overlay');
        // Get Tournament arena viewport specifically
        const tournamentScreen = document.getElementById('tournament-screen');
        const arenaViewport = tournamentScreen ? tournamentScreen.querySelector('.arena-viewport') : null;

        if (!chatModeBattlefield || !arenaViewport) return;

        const clone = chatModeBattlefield.querySelector('.arena-viewport');
        if (!clone) return;

        // Sync classes (for background changes)
        clone.className = arenaViewport.className;

        // Sync opacity and transition for smooth background fades
        if (arenaViewport.style.opacity !== '') clone.style.opacity = arenaViewport.style.opacity;
        if (arenaViewport.style.transition) clone.style.transition = arenaViewport.style.transition;

        // Sync countdown overlay
        const originalCountdown = arenaViewport.querySelector('.countdown-overlay');
        const cloneCountdown = clone.querySelector('.countdown-overlay');
        if (originalCountdown && cloneCountdown) {
            cloneCountdown.className = originalCountdown.className;
            const originalTimer = originalCountdown.querySelector('.countdown-timer');
            const cloneTimer = cloneCountdown.querySelector('.countdown-timer');
            if (originalTimer && cloneTimer) {
                cloneTimer.textContent = originalTimer.textContent;
            }
        }

        // Sync battle status
        const originalStatus = arenaViewport.querySelector('.battle-status');
        const cloneStatus = clone.querySelector('.battle-status');
        if (originalStatus && cloneStatus) {
            cloneStatus.innerHTML = originalStatus.innerHTML;
            cloneStatus.style.opacity = originalStatus.style.opacity;
        }

        // Sync fighters - sync sprite innerHTML and className
        const originalLeftFighter = arenaViewport.querySelector('.fighter-left');
        const cloneLeftFighter = clone.querySelector('.fighter-left');
        if (originalLeftFighter && cloneLeftFighter) {
            // Sync sprite innerHTML for knight image changes
            const originalLeftSprite = originalLeftFighter.querySelector('.fighter-sprite');
            const cloneLeftSprite = cloneLeftFighter.querySelector('.fighter-sprite');
            if (originalLeftSprite && cloneLeftSprite) {
                // Only update innerHTML if it changed to avoid resetting animations
                if (cloneLeftSprite.innerHTML !== originalLeftSprite.innerHTML) {
                    cloneLeftSprite.innerHTML = originalLeftSprite.innerHTML;
                }
            }

            // Sync opacity and other inline styles (for victory animations) - only update if changed
            if (originalLeftFighter.style.opacity !== '' && cloneLeftFighter.style.opacity !== originalLeftFighter.style.opacity) {
                const priority = originalLeftFighter.style.getPropertyPriority('opacity');
                cloneLeftFighter.style.setProperty('opacity', originalLeftFighter.style.opacity, priority);
            }

            // Sync display property (for visibility during transitions) - only update if changed
            if (originalLeftFighter.style.display !== '' && cloneLeftFighter.style.display !== originalLeftFighter.style.display) {
                const priority = originalLeftFighter.style.getPropertyPriority('display');
                cloneLeftFighter.style.setProperty('display', originalLeftFighter.style.display, priority);
            }

            // Only sync transform/position if they have explicit inline values (for victory animations) - only update if changed
            if (originalLeftFighter.style.left && cloneLeftFighter.style.left !== originalLeftFighter.style.left) {
                const priority = originalLeftFighter.style.getPropertyPriority('left');
                cloneLeftFighter.style.setProperty('left', originalLeftFighter.style.left, priority);
            }
            if (originalLeftFighter.style.transform && cloneLeftFighter.style.transform !== originalLeftFighter.style.transform) {
                const priority = originalLeftFighter.style.getPropertyPriority('transform');
                cloneLeftFighter.style.setProperty('transform', originalLeftFighter.style.transform, priority);
            }
            // Sync transition property only when it changes (won't interrupt if already set)
            if (originalLeftFighter.style.transition && cloneLeftFighter.style.transition !== originalLeftFighter.style.transition) {
                const priority = originalLeftFighter.style.getPropertyPriority('transition');
                cloneLeftFighter.style.setProperty('transition', originalLeftFighter.style.transition, priority);
            }

            // Sync sprite filter (for victory glow)
            const originalLeftSpriteImg = originalLeftFighter.querySelector('.fighter-sprite img');
            const cloneLeftSpriteImg = cloneLeftFighter.querySelector('.fighter-sprite img');
            if (originalLeftSpriteImg && cloneLeftSpriteImg) {
                cloneLeftSpriteImg.style.filter = originalLeftSpriteImg.style.filter;
                cloneLeftSpriteImg.style.animation = originalLeftSpriteImg.style.animation;
            }

            // REMOVED: Damage element syncing from 500ms loop
            // MutationObserver handles ALL damage elements in real-time when they're added
            // Syncing here causes flashing because elements are cloned mid-animation
        }

        const originalRightFighter = arenaViewport.querySelector('.fighter-right');
        const cloneRightFighter = clone.querySelector('.fighter-right');
        if (originalRightFighter && cloneRightFighter) {
            // Sync sprite innerHTML for knight image changes
            const originalRightSprite = originalRightFighter.querySelector('.fighter-sprite');
            const cloneRightSprite = cloneRightFighter.querySelector('.fighter-sprite');
            if (originalRightSprite && cloneRightSprite) {
                // Only update innerHTML if it changed to avoid resetting animations
                if (cloneRightSprite.innerHTML !== originalRightSprite.innerHTML) {
                    cloneRightSprite.innerHTML = originalRightSprite.innerHTML;
                }
            }

            // Sync opacity and other inline styles (for victory animations) - only update if changed
            if (originalRightFighter.style.opacity !== '' && cloneRightFighter.style.opacity !== originalRightFighter.style.opacity) {
                const priority = originalRightFighter.style.getPropertyPriority('opacity');
                cloneRightFighter.style.setProperty('opacity', originalRightFighter.style.opacity, priority);
            }

            // Sync display property (for visibility during transitions) - only update if changed
            if (originalRightFighter.style.display !== '' && cloneRightFighter.style.display !== originalRightFighter.style.display) {
                const priority = originalRightFighter.style.getPropertyPriority('display');
                cloneRightFighter.style.setProperty('display', originalRightFighter.style.display, priority);
            }

            // Only sync transform/position if they have explicit inline values (for victory animations) - only update if changed
            if (originalRightFighter.style.left && cloneRightFighter.style.left !== originalRightFighter.style.left) {
                const priority = originalRightFighter.style.getPropertyPriority('left');
                cloneRightFighter.style.setProperty('left', originalRightFighter.style.left, priority);
            }
            if (originalRightFighter.style.right && cloneRightFighter.style.right !== originalRightFighter.style.right) {
                const priority = originalRightFighter.style.getPropertyPriority('right');
                cloneRightFighter.style.setProperty('right', originalRightFighter.style.right, priority);
            }
            if (originalRightFighter.style.transform && cloneRightFighter.style.transform !== originalRightFighter.style.transform) {
                const priority = originalRightFighter.style.getPropertyPriority('transform');
                cloneRightFighter.style.setProperty('transform', originalRightFighter.style.transform, priority);
            }
            // Sync transition property only when it changes (won't interrupt if already set)
            if (originalRightFighter.style.transition && cloneRightFighter.style.transition !== originalRightFighter.style.transition) {
                const priority = originalRightFighter.style.getPropertyPriority('transition');
                cloneRightFighter.style.setProperty('transition', originalRightFighter.style.transition, priority);
            }

            // Sync sprite filter (for victory glow)
            const originalRightSpriteImg = originalRightFighter.querySelector('.fighter-sprite img');
            const cloneRightSpriteImg = cloneRightFighter.querySelector('.fighter-sprite img');
            if (originalRightSpriteImg && cloneRightSpriteImg) {
                cloneRightSpriteImg.style.filter = originalRightSpriteImg.style.filter;
                cloneRightSpriteImg.style.animation = originalRightSpriteImg.style.animation;
            }

            // REMOVED: Damage element syncing from 500ms loop (same as left fighter)
            // MutationObserver handles ALL damage elements in real-time when they're added
            // Syncing here causes the "repeating attack messages" bug on victory screen
        }

        // Sync nameplates container (including victory slide-away animations)
        const originalNameplates = arenaViewport.querySelector('.nameplate-vs-container');
        const cloneNameplates = clone.querySelector('.nameplate-vs-container');
        if (originalNameplates && cloneNameplates) {
            cloneNameplates.innerHTML = originalNameplates.innerHTML;
            cloneNameplates.className = originalNameplates.className;
            // Sync inline styles for victory animations - only update if changed
            if (originalNameplates.style.opacity !== '' && cloneNameplates.style.opacity !== originalNameplates.style.opacity) {
                const priority = originalNameplates.style.getPropertyPriority('opacity');
                cloneNameplates.style.setProperty('opacity', originalNameplates.style.opacity, priority);
            }
            if (originalNameplates.style.transform && cloneNameplates.style.transform !== originalNameplates.style.transform) {
                const priority = originalNameplates.style.getPropertyPriority('transform');
                cloneNameplates.style.setProperty('transform', originalNameplates.style.transform, priority);
            }
            if (originalNameplates.style.transition && cloneNameplates.style.transition !== originalNameplates.style.transition) {
                const priority = originalNameplates.style.getPropertyPriority('transition');
                cloneNameplates.style.setProperty('transition', originalNameplates.style.transition, priority);
            }
            if (originalNameplates.style.display !== '' && cloneNameplates.style.display !== originalNameplates.style.display) {
                const priority = originalNameplates.style.getPropertyPriority('display');
                cloneNameplates.style.setProperty('display', originalNameplates.style.display, priority);
            }
        }

        // Sync individual nameplate styles (for victory animations)
        const originalLeftNameplate = arenaViewport.querySelector('.left-nameplate');
        const cloneLeftNameplate = clone.querySelector('.left-nameplate');
        if (originalLeftNameplate && cloneLeftNameplate) {
            if (originalLeftNameplate.style.opacity !== '') cloneLeftNameplate.style.opacity = originalLeftNameplate.style.opacity;
            if (originalLeftNameplate.style.transition) cloneLeftNameplate.style.transition = originalLeftNameplate.style.transition;
            if (originalLeftNameplate.style.position) cloneLeftNameplate.style.position = originalLeftNameplate.style.position;
            if (originalLeftNameplate.style.left) cloneLeftNameplate.style.left = originalLeftNameplate.style.left;
            if (originalLeftNameplate.style.top) cloneLeftNameplate.style.top = originalLeftNameplate.style.top;
            if (originalLeftNameplate.style.transform) cloneLeftNameplate.style.transform = originalLeftNameplate.style.transform;
            if (originalLeftNameplate.style.textAlign) cloneLeftNameplate.style.textAlign = originalLeftNameplate.style.textAlign;
            if (originalLeftNameplate.style.zIndex) cloneLeftNameplate.style.zIndex = originalLeftNameplate.style.zIndex;
        }

        const originalRightNameplate = arenaViewport.querySelector('.right-nameplate');
        const cloneRightNameplate = clone.querySelector('.right-nameplate');
        if (originalRightNameplate && cloneRightNameplate) {
            if (originalRightNameplate.style.opacity !== '') cloneRightNameplate.style.opacity = originalRightNameplate.style.opacity;
            if (originalRightNameplate.style.transition) cloneRightNameplate.style.transition = originalRightNameplate.style.transition;
            if (originalRightNameplate.style.position) cloneRightNameplate.style.position = originalRightNameplate.style.position;
            if (originalRightNameplate.style.left) cloneRightNameplate.style.left = originalRightNameplate.style.left;
            if (originalRightNameplate.style.top) cloneRightNameplate.style.top = originalRightNameplate.style.top;
            if (originalRightNameplate.style.transform) cloneRightNameplate.style.transform = originalRightNameplate.style.transform;
            if (originalRightNameplate.style.textAlign) cloneRightNameplate.style.textAlign = originalRightNameplate.style.textAlign;
            if (originalRightNameplate.style.zIndex) cloneRightNameplate.style.zIndex = originalRightNameplate.style.zIndex;
        }

        // Sync VS display opacity, transform, and display - only update if changed
        const originalVS = arenaViewport.querySelector('.vs-display');
        const cloneVS = clone.querySelector('.vs-display');
        if (originalVS && cloneVS) {
            if (originalVS.style.opacity !== '' && cloneVS.style.opacity !== originalVS.style.opacity) {
                const priority = originalVS.style.getPropertyPriority('opacity');
                cloneVS.style.setProperty('opacity', originalVS.style.opacity, priority);
            }
            if (originalVS.style.transform && cloneVS.style.transform !== originalVS.style.transform) {
                const priority = originalVS.style.getPropertyPriority('transform');
                cloneVS.style.setProperty('transform', originalVS.style.transform, priority);
            }
            if (originalVS.style.transition && cloneVS.style.transition !== originalVS.style.transition) {
                const priority = originalVS.style.getPropertyPriority('transition');
                cloneVS.style.setProperty('transition', originalVS.style.transition, priority);
            }
            if (originalVS.style.display !== '' && cloneVS.style.display !== originalVS.style.display) {
                const priority = originalVS.style.getPropertyPriority('display');
                cloneVS.style.setProperty('display', originalVS.style.display, priority);
            }
        }

        // Sync HP bar containers (for victory slide-out animations) - only update if changed
        const originalLeftHPContainer = arenaViewport.querySelector('.left-hp');
        const cloneLeftHPContainer = clone.querySelector('.left-hp');
        if (originalLeftHPContainer && cloneLeftHPContainer) {
            if (originalLeftHPContainer.style.transform && cloneLeftHPContainer.style.transform !== originalLeftHPContainer.style.transform) {
                const priority = originalLeftHPContainer.style.getPropertyPriority('transform');
                cloneLeftHPContainer.style.setProperty('transform', originalLeftHPContainer.style.transform, priority);
            }
            if (originalLeftHPContainer.style.opacity !== '' && cloneLeftHPContainer.style.opacity !== originalLeftHPContainer.style.opacity) {
                const priority = originalLeftHPContainer.style.getPropertyPriority('opacity');
                cloneLeftHPContainer.style.setProperty('opacity', originalLeftHPContainer.style.opacity, priority);
            }
            if (originalLeftHPContainer.style.transition && cloneLeftHPContainer.style.transition !== originalLeftHPContainer.style.transition) {
                const priority = originalLeftHPContainer.style.getPropertyPriority('transition');
                cloneLeftHPContainer.style.setProperty('transition', originalLeftHPContainer.style.transition, priority);
            }
        }

        const originalRightHPContainer = arenaViewport.querySelector('.right-hp');
        const cloneRightHPContainer = clone.querySelector('.right-hp');
        if (originalRightHPContainer && cloneRightHPContainer) {
            if (originalRightHPContainer.style.transform && cloneRightHPContainer.style.transform !== originalRightHPContainer.style.transform) {
                const priority = originalRightHPContainer.style.getPropertyPriority('transform');
                cloneRightHPContainer.style.setProperty('transform', originalRightHPContainer.style.transform, priority);
            }
            if (originalRightHPContainer.style.opacity !== '' && cloneRightHPContainer.style.opacity !== originalRightHPContainer.style.opacity) {
                const priority = originalRightHPContainer.style.getPropertyPriority('opacity');
                cloneRightHPContainer.style.setProperty('opacity', originalRightHPContainer.style.opacity, priority);
            }
            if (originalRightHPContainer.style.transition && cloneRightHPContainer.style.transition !== originalRightHPContainer.style.transition) {
                const priority = originalRightHPContainer.style.getPropertyPriority('transition');
                cloneRightHPContainer.style.setProperty('transition', originalRightHPContainer.style.transition, priority);
            }
        }

        // Sync HP bars (fill width)
        const originalLeftHP = arenaViewport.querySelector('#left-hp-fill');
        const cloneLeftHP = clone.querySelector('#left-hp-fill');
        if (originalLeftHP && cloneLeftHP) {
            cloneLeftHP.style.width = originalLeftHP.style.width;
        }

        const originalRightHP = arenaViewport.querySelector('#right-hp-fill');
        const cloneRightHP = clone.querySelector('#right-hp-fill');
        if (originalRightHP && cloneRightHP) {
            cloneRightHP.style.width = originalRightHP.style.width;
        }

        const originalLeftHPText = arenaViewport.querySelector('#left-hp-text');
        const cloneLeftHPText = clone.querySelector('#left-hp-text');
        if (originalLeftHPText && cloneLeftHPText) {
            cloneLeftHPText.textContent = originalLeftHPText.textContent;
        }

        const originalRightHPText = arenaViewport.querySelector('#right-hp-text');
        const cloneRightHPText = clone.querySelector('#right-hp-text');
        if (originalRightHPText && cloneRightHPText) {
            cloneRightHPText.textContent = originalRightHPText.textContent;
        }

        // Sync round announcement
        const originalAnnouncement = arenaViewport.querySelector('.round-announcement');
        const cloneAnnouncement = clone.querySelector('.round-announcement');
        if (originalAnnouncement && cloneAnnouncement) {
            cloneAnnouncement.innerHTML = originalAnnouncement.innerHTML;
            cloneAnnouncement.className = originalAnnouncement.className;
        }

        // Sync progress container (for victory slide-out animations) - only update if changed
        const originalProgressContainer = arenaViewport.querySelector('.progress-container');
        const cloneProgressContainer = clone.querySelector('.progress-container');
        if (originalProgressContainer && cloneProgressContainer) {
            if (originalProgressContainer.style.transform && cloneProgressContainer.style.transform !== originalProgressContainer.style.transform) {
                const priority = originalProgressContainer.style.getPropertyPriority('transform');
                cloneProgressContainer.style.setProperty('transform', originalProgressContainer.style.transform, priority);
            }
            if (originalProgressContainer.style.opacity !== '' && cloneProgressContainer.style.opacity !== originalProgressContainer.style.opacity) {
                const priority = originalProgressContainer.style.getPropertyPriority('opacity');
                cloneProgressContainer.style.setProperty('opacity', originalProgressContainer.style.opacity, priority);
            }
            if (originalProgressContainer.style.transition && cloneProgressContainer.style.transition !== originalProgressContainer.style.transition) {
                const priority = originalProgressContainer.style.getPropertyPriority('transition');
                cloneProgressContainer.style.setProperty('transition', originalProgressContainer.style.transition, priority);
            }
        }

        // Sync odds display (for victory slide-out animations) - only update if changed
        const originalTopOdds = arenaViewport.querySelector('.top-odds');
        const cloneTopOdds = clone.querySelector('.top-odds');
        if (originalTopOdds && cloneTopOdds) {
            if (originalTopOdds.style.transform && cloneTopOdds.style.transform !== originalTopOdds.style.transform) {
                const priority = originalTopOdds.style.getPropertyPriority('transform');
                cloneTopOdds.style.setProperty('transform', originalTopOdds.style.transform, priority);
            }
            if (originalTopOdds.style.opacity !== '' && cloneTopOdds.style.opacity !== originalTopOdds.style.opacity) {
                const priority = originalTopOdds.style.getPropertyPriority('opacity');
                cloneTopOdds.style.setProperty('opacity', originalTopOdds.style.opacity, priority);
            }
            if (originalTopOdds.style.transition && cloneTopOdds.style.transition !== originalTopOdds.style.transition) {
                const priority = originalTopOdds.style.getPropertyPriority('transition');
                cloneTopOdds.style.setProperty('transition', originalTopOdds.style.transition, priority);
            }
        }

        // Sync tournament progress segments
        const originalProgressSegments = arenaViewport.querySelector('#progress-segments');
        const cloneProgressSegments = clone.querySelector('#progress-segments');
        if (originalProgressSegments && cloneProgressSegments) {
            cloneProgressSegments.innerHTML = originalProgressSegments.innerHTML;
        }

        // Sync hero progress indicator
        const originalHeroIndicator = arenaViewport.querySelector('#hero-progress-indicator');
        const cloneHeroIndicator = clone.querySelector('#hero-progress-indicator');
        if (originalHeroIndicator && cloneHeroIndicator) {
            cloneHeroIndicator.style.left = originalHeroIndicator.style.left;
        }

        // Sync background overlay (for round transitions)
        const originalBgOverlay = arenaViewport.querySelector('.bg-overlay');
        let cloneBgOverlay = clone.querySelector('.bg-overlay');

        if (originalBgOverlay && !cloneBgOverlay) {
            // BG overlay exists in original but not in clone - create it
            cloneBgOverlay = originalBgOverlay.cloneNode(true);
            clone.appendChild(cloneBgOverlay);
        } else if (!originalBgOverlay && cloneBgOverlay) {
            // BG overlay removed from original - remove from clone
            cloneBgOverlay.remove();
        } else if (originalBgOverlay && cloneBgOverlay) {
            // Sync opacity, transition, and display
            if (originalBgOverlay.style.opacity !== '' && cloneBgOverlay.style.opacity !== originalBgOverlay.style.opacity) {
                const priority = originalBgOverlay.style.getPropertyPriority('opacity');
                cloneBgOverlay.style.setProperty('opacity', originalBgOverlay.style.opacity, priority);
            }
            if (originalBgOverlay.style.transition && cloneBgOverlay.style.transition !== originalBgOverlay.style.transition) {
                const priority = originalBgOverlay.style.getPropertyPriority('transition');
                cloneBgOverlay.style.setProperty('transition', originalBgOverlay.style.transition, priority);
            }
            if (originalBgOverlay.style.display !== '' && cloneBgOverlay.style.display !== originalBgOverlay.style.display) {
                const priority = originalBgOverlay.style.getPropertyPriority('display');
                cloneBgOverlay.style.setProperty('display', originalBgOverlay.style.display, priority);
            }
        }

        // Sync victory black overlay (for victory screen)
        const originalVictoryBlackOverlay = arenaViewport.querySelector('.victory-black-overlay');
        let cloneVictoryBlackOverlay = clone.querySelector('.victory-black-overlay');

        if (originalVictoryBlackOverlay && !cloneVictoryBlackOverlay) {
            cloneVictoryBlackOverlay = originalVictoryBlackOverlay.cloneNode(true);
            clone.appendChild(cloneVictoryBlackOverlay);
        } else if (!originalVictoryBlackOverlay && cloneVictoryBlackOverlay) {
            cloneVictoryBlackOverlay.remove();
        } else if (originalVictoryBlackOverlay && cloneVictoryBlackOverlay) {
            if (originalVictoryBlackOverlay.style.opacity !== '' && cloneVictoryBlackOverlay.style.opacity !== originalVictoryBlackOverlay.style.opacity) {
                const priority = originalVictoryBlackOverlay.style.getPropertyPriority('opacity');
                cloneVictoryBlackOverlay.style.setProperty('opacity', originalVictoryBlackOverlay.style.opacity, priority);
            }
            if (originalVictoryBlackOverlay.style.transition && cloneVictoryBlackOverlay.style.transition !== originalVictoryBlackOverlay.style.transition) {
                const priority = originalVictoryBlackOverlay.style.getPropertyPriority('transition');
                cloneVictoryBlackOverlay.style.setProperty('transition', originalVictoryBlackOverlay.style.transition, priority);
            }
        }

        // Sync victory overlay (old system)
        const originalVictoryOverlay = arenaViewport.querySelector('.victory-overlay');
        let cloneVictoryOverlay = clone.querySelector('.victory-overlay');

        if (originalVictoryOverlay && !cloneVictoryOverlay) {
            // Victory overlay exists in original but not in clone - create it
            cloneVictoryOverlay = originalVictoryOverlay.cloneNode(true);
            clone.appendChild(cloneVictoryOverlay);
        } else if (!originalVictoryOverlay && cloneVictoryOverlay) {
            // Victory overlay removed from original - remove from clone
            cloneVictoryOverlay.remove();
        } else if (originalVictoryOverlay && cloneVictoryOverlay) {
            // Sync opacity
            if (originalVictoryOverlay.style.opacity !== '') {
                cloneVictoryOverlay.style.opacity = originalVictoryOverlay.style.opacity;
            }
        }

        // Sync final victory container (new victory screen)
        const originalVictoryContainer = arenaViewport.querySelector('.final-victory-container');
        let cloneVictoryContainer = clone.querySelector('.final-victory-container');

        if (originalVictoryContainer && !cloneVictoryContainer) {
            // Victory container exists in original but not in clone - create it
            cloneVictoryContainer = originalVictoryContainer.cloneNode(true);
            clone.appendChild(cloneVictoryContainer);
        } else if (!originalVictoryContainer && cloneVictoryContainer) {
            // Victory container removed from original - remove from clone
            cloneVictoryContainer.remove();
        } else if (originalVictoryContainer && cloneVictoryContainer) {
            // Replace clone with fresh copy to sync all animations
            cloneVictoryContainer.remove();
            cloneVictoryContainer = originalVictoryContainer.cloneNode(true);
            clone.appendChild(cloneVictoryContainer);
        }

        // Sync victor text (old system)
        const originalVictorText = arenaViewport.querySelector('.victor-text');
        let cloneVictorText = clone.querySelector('.victor-text');

        if (originalVictorText && !cloneVictorText) {
            // Victor text exists in original but not in clone - create it
            cloneVictorText = originalVictorText.cloneNode(true);
            clone.appendChild(cloneVictorText);
        } else if (!originalVictorText && cloneVictorText) {
            // Victor text removed from original - remove from clone
            cloneVictorText.remove();
        }

        // Sync victory crown
        const originalLeftCrown = arenaViewport.querySelector('.fighter-left .victory-crown');
        const originalRightCrown = arenaViewport.querySelector('.fighter-right .victory-crown');
        let cloneLeftCrown = clone.querySelector('.fighter-left .victory-crown');
        let cloneRightCrown = clone.querySelector('.fighter-right .victory-crown');

        if (originalLeftCrown && !cloneLeftCrown) {
            const cloneLeftFighter = clone.querySelector('.fighter-left');
            if (cloneLeftFighter) {
                cloneLeftFighter.appendChild(originalLeftCrown.cloneNode(true));
            }
        }
        if (originalRightCrown && !cloneRightCrown) {
            const cloneRightFighter = clone.querySelector('.fighter-right');
            if (cloneRightFighter) {
                cloneRightFighter.appendChild(originalRightCrown.cloneNode(true));
            }
        }

        // Sync victory nameplate
        const originalLeftVictoryNameplate = arenaViewport.querySelector('.fighter-left .victory-nameplate');
        const originalRightVictoryNameplate = arenaViewport.querySelector('.fighter-right .victory-nameplate');
        let cloneLeftVictoryNameplate = clone.querySelector('.fighter-left .victory-nameplate');
        let cloneRightVictoryNameplate = clone.querySelector('.fighter-right .victory-nameplate');

        if (originalLeftVictoryNameplate && !cloneLeftVictoryNameplate) {
            const cloneLeftFighter = clone.querySelector('.fighter-left');
            if (cloneLeftFighter) {
                cloneLeftFighter.appendChild(originalLeftVictoryNameplate.cloneNode(true));
            }
        }
        if (originalRightVictoryNameplate && !cloneRightVictoryNameplate) {
            const cloneRightFighter = clone.querySelector('.fighter-right');
            if (cloneRightFighter) {
                cloneRightFighter.appendChild(originalRightVictoryNameplate.cloneNode(true));
            }
        }
    }

    initChatModeInput() {
        const chatModeInput = document.getElementById('chat-mode-input-overlay');
        const chatModeSendBtn = document.getElementById('chat-mode-send-btn-overlay');

        console.log('Initializing chat mode input:', { chatModeInput, chatModeSendBtn });

        if (!chatModeInput || !chatModeSendBtn) {
            console.log('Chat mode input elements not found!');
            return;
        }

        const sendMessage = () => {
            const message = chatModeInput.value.trim();
            console.log('Sending message from chat mode:', message);
            if (message) {
                this.chatSystem.addChatMessage(message, true); // Mark as user's own message
                chatModeInput.value = '';
            }
        };

        // Remove any existing listeners first
        const newSendBtn = chatModeSendBtn.cloneNode(true);
        chatModeSendBtn.parentNode.replaceChild(newSendBtn, chatModeSendBtn);

        newSendBtn.addEventListener('click', sendMessage);
        console.log('Send button listener added');

        chatModeInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                sendMessage();
            }
        });
        console.log('Input keypress listener added');
    }

    // ===== Dev Tabs =====

    initDevTabs() {
        const tabs = document.querySelectorAll('.dev-tab');
        const frames = document.querySelectorAll('.dev-frame-tab');

        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const targetFrame = tab.dataset.tab;

                // Update active tab
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');

                // Show/hide frames
                frames.forEach(frame => {
                    if (frame.dataset.frame === targetFrame) {
                        frame.classList.remove('hidden');
                    } else {
                        frame.classList.add('hidden');
                    }
                });
            });
        });
    }
}
console.log('🎮 RNGArena v3.0 - Audio & Loot Debug + CSS Fixes Loaded');
