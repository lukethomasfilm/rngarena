import { ChatSystem } from './ChatSystem.js';
import { EmojiSystem } from './EmojiSystem.js';
import { LootSystem } from './LootSystem.js';
import { CombatSystem } from './CombatSystem.js';
import { BracketSystem } from './BracketSystem.js';
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
 * RNGArena - Main game controller
 * Coordinates all systems and manages game flow
 */
export class RNGArena {
    constructor() {
        // Core tournament
        this.tournament = new window.TournamentBracket();
        this.tournamentStarted = false;
        this.autoContinue = false;
        this.battleInProgress = false;
        this.heroLootOnlyMode = true; // Default: only track hero's wins
        this.isFirstBattle = true; // Track if this is the first battle (no fade needed)
        this.heroMaxRound = 0; // Track the max round the hero reached
        this.heroEliminated = false; // Track if hero has been eliminated

        // Character management
        this.characterImageCache = new Map();
        this.allImages = [];
        this.imagesLoaded = false;

        // DOM Elements
        this.leftFighter = document.querySelector('.fighter-left');
        this.rightFighter = document.querySelector('.fighter-right');
        this.battleStatus = document.querySelector('.battle-status');
        this.roundAnnouncement = document.querySelector('.round-announcement');
        this.startButton = document.getElementById('start-battle');
        this.chatMessages = document.getElementById('chat-messages');
        this.arenaViewport = document.querySelector('.arena-viewport');
        this.progressSegments = document.getElementById('progress-segments');
        this.heroProgressIndicator = document.getElementById('hero-progress-indicator');
        this.leftFighterNameEl = document.getElementById('left-nameplate-name');
        this.rightFighterNameEl = document.getElementById('right-nameplate-name');
        this.leftFighterTitlesEl = document.getElementById('left-nameplate-titles');
        this.rightFighterTitlesEl = document.getElementById('right-nameplate-titles');
        this.leftFighterCard = document.querySelector('.left-fighter-card');
        this.rightFighterCard = document.querySelector('.right-fighter-card');
        this.bracketDisplay = document.getElementById('bracket-display');
        this.overlayBracketDisplay = document.getElementById('overlay-bracket-display');
        this.bracketViewport = document.querySelector('.bracket-viewport');
        this.bracketSlider = document.getElementById('bracket-slider');
        this.zoomInBtn = document.getElementById('zoom-in');
        this.zoomOutBtn = document.getElementById('zoom-out');
        this.zoomLevel = document.getElementById('zoom-level');
        this.overlayZoomInBtn = document.getElementById('overlay-zoom-in');
        this.overlayZoomOutBtn = document.getElementById('overlay-zoom-out');
        this.overlayZoomLevel = document.getElementById('overlay-zoom-level');
        this.overlayBracketSlider = document.getElementById('overlay-bracket-slider');
        this.chatContainer = document.querySelector('.chat-container');
        this.chatInput = document.getElementById('chat-input');
        this.sendChatBtn = document.getElementById('send-chat');

        // Initialize Systems
        this.chatSystem = new ChatSystem(this.chatMessages);
        this.emojiSystem = new EmojiSystem(this.arenaViewport);
        this.lootSystem = new LootSystem();
        this.bracketSystem = new BracketSystem(this.bracketDisplay, this.tournament);

        // Combat system will be initialized per battle
        this.combatSystem = null;

        // Background management
        this.backgrounds = ARENA_CONFIG.BACKGROUNDS;
        this.currentBgIndex = 0;

        // Bracket zoom state
        this.currentZoom = BRACKET_CONFIG.DEFAULT_ZOOM;
        this.currentScrollX = 0;
        this.currentScrollY = 0;

        this.init();
    }

    async init() {
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
                    // Update loot to current tournament round
                    const roundInfo = this.tournament.getRoundInfo();
                    this.lootSystem.updateLootBox(roundInfo);

                    // Hide claim button when tracking all battles
                    if (claimBtn) {
                        claimBtn.classList.add('hidden');
                    }
                    if (lootBox) {
                        lootBox.classList.remove('claimable');
                    }
                } else {
                    this.chatSystem.addChatMessage('🎯 TRACKING HERO WINS ONLY');
                    // Update loot back to hero's max round
                    if (this.heroMaxRound > 0) {
                        this.lootSystem.updateLootBox({ current: this.heroMaxRound });
                    }
                    // Show button only if hero has been eliminated
                    this.showClaimLootButton();
                }

                // Update chevron position and color based on toggle state
                this.updateHeroProgressIndicator();
            });
        }
    }

    initLootClaimDevFrame() {
        const lootClaimOverlay = document.getElementById('loot-claim-overlay');
        const popupLootContainer = document.querySelector('.popup-loot-container');

        if (lootClaimOverlay) {
            // Click overlay background to close
            lootClaimOverlay.addEventListener('click', (e) => {
                // Close if clicking on the overlay background (not the container)
                if (e.target === lootClaimOverlay || e.target.classList.contains('loot-claim-viewport')) {
                    lootClaimOverlay.classList.add('hidden');
                }
            });
        }

        // Prevent clicks inside the popup container from closing
        if (popupLootContainer) {
            popupLootContainer.addEventListener('click', (e) => {
                e.stopPropagation();
            });
        }
    }

    initClaimLootButton() {
        const claimBtn = document.getElementById('claim-loot-btn');
        if (claimBtn) {
            claimBtn.addEventListener('click', () => {
                this.claimLoot();
            });
        }
    }

    showClaimLootButton() {
        console.log('showClaimLootButton called', {
            heroLootOnlyMode: this.heroLootOnlyMode,
            heroEliminated: this.heroEliminated
        });

        // Only show button if BOTH:
        // 1. We're in hero-only mode (toggle OFF)
        // 2. Hero has been eliminated
        if (!this.heroLootOnlyMode || !this.heroEliminated) {
            console.log('Button not shown - conditions not met');
            return;
        }

        const claimBtn = document.getElementById('claim-loot-btn');
        const lootBox = document.getElementById('loot-box');

        console.log('Elements found:', { claimBtn, lootBox });

        if (claimBtn) {
            claimBtn.classList.remove('hidden');
            console.log('Button shown!');
        }

        if (lootBox) {
            lootBox.classList.add('claimable');
            console.log('Chest glow added!');
        }
    }

    claimLoot() {
        const lootClaimOverlay = document.getElementById('loot-claim-overlay');

        // Show the loot claim popup overlay (keep button and glow visible)
        if (lootClaimOverlay) {
            lootClaimOverlay.classList.remove('hidden');
        }

        // Add feedback message
        this.chatSystem.addAnnouncerMessage('🎁 LOOT CLAIMED! 🎁');
        this.chatSystem.addChatMessage('Check your inventory!');

        // Optional: trigger chest opening animation or other effects here
    }

    // ===== Tournament Flow =====

    startTournament() {
        if (!this.tournamentStarted) {
            this.tournamentStarted = true;
            this.autoContinue = true;
            this.heroEliminated = false; // Reset hero elimination status

            if (this.startButton) {
                this.startButton.style.display = 'none';
            }

            // Check if first round is a bye - if so, skip initial nameplate animation
            const firstBye = this.tournament.hasFollowedCharacterBye();

            if (!firstBye) {
                // Get the first match and populate names BEFORE animation
                const firstMatch = this.tournament.getCurrentMatch();
                if (firstMatch) {
                    // Make sure fighters are hidden before updating display
                    if (this.leftFighter) this.leftFighter.style.opacity = '0';
                    if (this.rightFighter) this.rightFighter.style.opacity = '0';

                    this.updateMatchDisplay(firstMatch);
                }

                // Animate nameplates into view with names already on them
                const nameplateContainer = document.querySelector('.nameplate-vs-container');
                if (nameplateContainer) {
                    setTimeout(() => {
                        nameplateContainer.classList.add('visible');
                    }, 100);
                }
            } else {
                // First round is a bye - keep nameplates hidden, let handleByeRound animate them
                const nameplateContainer = document.querySelector('.nameplate-vs-container');
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
        } else {
            this.startBattle();
        }
    }

    startBattle() {
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

        // Switch background
        this.switchBackground();

        // Reset fighters
        this.resetFighters();
        this.cleanupCombatElements();

        // Update display
        this.updateMatchDisplay(match);

        // Start fighter entrances
        setTimeout(() => this.fighterEntrance(), GAME_CONFIG.TIMING.FIGHTER_ENTRANCE_DELAY);
    }

    fighterEntrance() {
        if (this.leftFighter) {
            this.leftFighter.style.opacity = '1';
            this.leftFighter.classList.add(UI_CONFIG.ENTRANCE_LEFT);
        }

        if (this.rightFighter) {
            this.rightFighter.style.opacity = '1';
            this.rightFighter.classList.add(UI_CONFIG.ENTRANCE_RIGHT);
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

        // Update fighter cards
        const currentMatch = this.tournament.getCurrentMatch();
        const displayOrder = this.tournament.getDisplayOrder();
        if (currentMatch && displayOrder) {
            this.updateFighterCards(currentMatch, displayOrder);
        }

        const winner = leftWins ? this.leftFighter : this.rightFighter;
        const loser = leftWins ? this.rightFighter : this.leftFighter;

        // Winner animation
        const winnerSprite = winner.querySelector('.fighter-sprite img');
        if (winnerSprite) {
            winnerSprite.style.animation = 'victory-glow 1s ease-in-out';
        }

        // Loser exit
        setTimeout(() => {
            loser.classList.add(UI_CONFIG.FIGHTER_EXIT);
        }, 300);

        // Winner pose
        setTimeout(() => {
            const winnerSprite = winner.querySelector('.fighter-sprite');
            if (winnerSprite) winnerSprite.classList.add(UI_CONFIG.WINNER_POSE);
        }, 500);

        // Update battle status
        this.battleStatus.textContent = `${battleResult.winner.toUpperCase()} WINS!`;
        this.battleStatus.style.opacity = '1';

        setTimeout(() => {
            this.battleStatus.style.opacity = '0';
        }, GAME_CONFIG.TIMING.STATUS_FADE_OUT);

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

        // Progress tournament
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
                setTimeout(() => this.startBattle(), GAME_CONFIG.TIMING.AUTO_CONTINUE_DELAY);
            } else {
                this.enableRestart();
            }
        }, GAME_CONFIG.TIMING.VICTORY_DISPLAY);
    }

    handleByeRound(byeInfo) {
        this.battleStatus.innerHTML = '✨ LADY LUCK VISITS YOU! ✨<br><span style="font-size: 0.6em;">You get a bye and a free loot tier - lucky you!</span>';
        this.battleStatus.style.opacity = '0'; // Start hidden

        // Hide nameplates initially to prevent animation jump
        const nameplateContainer = document.querySelector('.nameplate-vs-container');
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
        this.switchBackground();

        // Start fighter entrance animations
        setTimeout(() => {
            if (this.leftFighter) {
                this.leftFighter.style.opacity = '1';
                this.leftFighter.classList.add(UI_CONFIG.ENTRANCE_LEFT);
            }
            if (this.rightFighter) {
                this.rightFighter.style.opacity = '1';
                this.rightFighter.classList.add(UI_CONFIG.ENTRANCE_RIGHT);
            }

            // Show nameplates with smooth slide-up animation
            const nameplateContainer = document.querySelector('.nameplate-vs-container');
            if (nameplateContainer) {
                setTimeout(() => {
                    nameplateContainer.classList.add('visible');
                }, 100);
            }

            // Show battle status after round announcement finishes (2.7 seconds)
            setTimeout(() => {
                this.battleStatus.style.opacity = '1';
            }, 2700);
        }, GAME_CONFIG.TIMING.FIGHTER_ENTRANCE_DELAY);

        // Lucky clover shower from above for 7 seconds
        this.emojiSystem.startEmojiShower(['🍀'], 7000);

        // Fade out battle status after 7 seconds
        setTimeout(() => {
            this.battleStatus.style.opacity = '0';
        }, 7000);

        // Advance after 7 seconds
        setTimeout(() => {
            this.tournament.advanceToNextMatch();
            this.updateOdds();
            this.updateDisplay();
            this.renderBracket();

            if (this.autoContinue && !this.tournament.isComplete()) {
                setTimeout(() => this.startBattle(), 1500);
            } else {
                this.enableRestart();
            }
        }, 7000);
    }

    handleNoMatch() {
        this.chatSystem.addChatMessage("Tournament completed or no match available!");
        this.enableRestart();
    }

    enableRestart() {
        this.startButton.disabled = false;

        if (this.tournament.isComplete()) {
            const winner = this.tournament.getWinner();
            this.startButton.textContent = `${winner.toUpperCase()} WINS THE CROWN!`;
            this.startButton.disabled = true;
            this.chatSystem.addChatMessage("CROWN WINNER!");
            this.chatSystem.addChatMessage("LEGENDARY!");

            this.showVictoryAnimation(winner);

            // Show claim loot button if tournament is complete (hero has lost or won)
            // Only show if in hero-only mode
            if (this.heroLootOnlyMode) {
                this.heroEliminated = true; // Mark as eligible for loot claim
                this.showClaimLootButton();
            }
        } else {
            const roundInfo = this.tournament.getRoundInfo();
            this.startButton.textContent = `CONTINUE ${roundInfo.name.toUpperCase()}`;
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
        if (byeInfo.position === 'left') {
            this.leftFighterNameEl.textContent = this.tournament.getCharacterName(byeInfo.character);
            const leftTitles = this.tournament.getCharacterTitles(byeInfo.character);
            this.leftFighterTitlesEl.textContent = leftTitles.join(' • ');
            this.updateFighterSprite(this.leftFighter, byeInfo.character);

            // Show Lady Luck on the right
            this.rightFighterNameEl.textContent = 'Lady Luck';
            this.rightFighterTitlesEl.textContent = 'Bringer of Fortune';
            this.updateFighterSprite(this.rightFighter, 'Lady Luck');

            // Add green styling to right card
            if (this.rightFighterCard) {
                this.rightFighterCard.classList.add('lady-bye-chance');
            }
        } else {
            this.rightFighterNameEl.textContent = this.tournament.getCharacterName(byeInfo.character);
            const rightTitles = this.tournament.getCharacterTitles(byeInfo.character);
            this.rightFighterTitlesEl.textContent = rightTitles.join(' • ');
            this.updateFighterSprite(this.rightFighter, byeInfo.character);

            // Show Lady Luck on the left
            this.leftFighterNameEl.textContent = 'Lady Luck';
            this.leftFighterTitlesEl.textContent = 'Bringer of Fortune';
            this.updateFighterSprite(this.leftFighter, 'Lady Luck');

            // Add green styling to left card
            if (this.leftFighterCard) {
                this.leftFighterCard.classList.add('lady-bye-chance');
            }
        }

        const match = { participant1: null, participant2: null };
        if (byeInfo.position === 'left') {
            match.participant1 = byeInfo.character;
        } else {
            match.participant2 = byeInfo.character;
        }

        this.updateFighterCards(match, null);
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
        if (this.leftFighter) {
            this.leftFighter.className = 'fighter-left';
        }
        if (this.rightFighter) {
            this.rightFighter.className = 'fighter-right';
        }
        const leftSprite = this.leftFighter ? this.leftFighter.querySelector('.fighter-sprite') : null;
        const rightSprite = this.rightFighter ? this.rightFighter.querySelector('.fighter-sprite') : null;
        if (leftSprite) leftSprite.style.animation = '';
        if (rightSprite) rightSprite.style.animation = '';
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

    getCharacterImage(characterName) {
        if (characterName === 'Daring Hero') {
            return CHARACTER_CONFIG.HERO_IMAGE;
        }

        if (characterName === 'Lady Luck') {
            return 'Lady_bye_chance.png';
        }

        if (!this.characterImageCache.has(characterName)) {
            const randomIndex = Math.floor(Math.random() * CHARACTER_CONFIG.KNIGHT_IMAGES.length);
            this.characterImageCache.set(characterName, CHARACTER_CONFIG.KNIGHT_IMAGES[randomIndex]);
        }

        return this.characterImageCache.get(characterName);
    }

    updateFighterSprite(fighterElement, characterName) {
        const spriteElement = fighterElement.querySelector('.fighter-sprite');
        if (!spriteElement) return;

        const imageName = this.getCharacterImage(characterName);
        const imagePath = `${CHARACTER_CONFIG.CHARACTER_PATH}${imageName}`;

        const isLeftFighter = fighterElement.classList.contains('fighter-left');
        const isRightFighter = fighterElement.classList.contains('fighter-right');

        const needsFlip = (isLeftFighter && (
            imageName === 'knight_05.png' ||
            imageName === 'Knight_01.png' ||
            imageName === 'Knight_03.png'
        )) || (isRightFighter && (
            imageName === 'knight_04.png'
        ));

        const flipStyle = needsFlip ? 'transform: scale(0.8) scaleX(-1);' : 'transform: scale(0.8);';
        spriteElement.innerHTML = `<img src="${imagePath}" alt="${characterName}" class="character-image" style="${flipStyle}">`;
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
            this.arenaViewport.style.opacity = '1';

            // Just set initial background without fade
            const newBg = this.backgrounds[this.currentBgIndex];
            this.arenaViewport.classList.add(newBg);
            this.currentBgIndex = (this.currentBgIndex + 1) % this.backgrounds.length;
            this.chatSystem.addChatMessage(this.chatSystem.getArenaWelcomeMessage(newBg));
            return;
        }

        // Fade out
        this.arenaViewport.style.opacity = '0.3';
        this.arenaViewport.style.transition = 'opacity 0.5s ease-in-out';

        setTimeout(() => {
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

            // Fade in
            setTimeout(() => {
                this.arenaViewport.style.opacity = '1';
            }, 50);
        }, 500);
    }

    // ===== Victory Animation =====

    showVictoryAnimation(winner) {
        this.emojiSystem.setMaxSpawnRate();

        // Dark overlay
        const overlay = document.createElement('div');
        overlay.className = 'victory-overlay';
        overlay.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            z-index: 50;
            opacity: 0;
            transition: opacity 1s ease-in-out;
            pointer-events: none;
        `;
        this.arenaViewport.appendChild(overlay);

        setTimeout(() => {
            overlay.style.opacity = '1';
        }, 100);

        // Determine winner fighter
        const leftFighterName = this.leftFighterNameEl.textContent;
        const rightFighterName = this.rightFighterNameEl.textContent;

        let winnerFighter, winnerSide;
        if (leftFighterName === winner) {
            winnerFighter = this.leftFighter;
            winnerSide = 'left';
        } else if (rightFighterName === winner) {
            winnerFighter = this.rightFighter;
            winnerSide = 'right';
        } else {
            winnerFighter = this.leftFighter;
            winnerSide = 'left';
            this.leftFighterNameEl.textContent = this.tournament.getCharacterName(winner);
            const winnerTitles = this.tournament.getCharacterTitles(winner);
            this.leftFighterTitlesEl.textContent = winnerTitles.join(' • ');
        }

        // Hide other fighter
        const otherFighter = winnerSide === 'left' ? this.rightFighter : this.leftFighter;
        otherFighter.style.opacity = '0';

        // Position winner
        const startPosition = winnerSide === 'left' ? '15%' : '85%';
        const startTransform = winnerSide === 'left' ? '0%' : '-100%';

        winnerFighter.style.setProperty('--start-position', startPosition);
        winnerFighter.style.setProperty('--start-transform', startTransform);
        winnerFighter.classList.add('victory-center');

        // Winner glow
        const winnerSprite = winnerFighter.querySelector('.fighter-sprite img');
        if (winnerSprite) {
            winnerSprite.style.filter = 'drop-shadow(0 0 20px white) drop-shadow(0 0 40px white) drop-shadow(0 0 60px white)';
            winnerSprite.style.animation = 'victory-glow 2s ease-in-out infinite';
        }

        // Upgrade chest to legendary (chest_01) with glow
        this.lootSystem.setMaxTier();

        // Crown
        setTimeout(() => {
            const crown = document.createElement('div');
            crown.className = 'victory-crown';
            crown.textContent = '👑';
            winnerFighter.appendChild(crown);
        }, 1000);

        // Victor text
        setTimeout(() => {
            const victorText = document.createElement('div');
            victorText.className = 'victor-text';
            victorText.textContent = 'VICTOR!';
            this.arenaViewport.appendChild(victorText);
        }, 2000);

        // Nameplate
        setTimeout(() => {
            const nameplate = document.createElement('div');
            nameplate.className = 'victory-nameplate';

            const winnerTitles = this.tournament.getCharacterTitles(winner);
            nameplate.innerHTML = `
                <div class="victory-name">${this.tournament.getCharacterName(winner)}</div>
                <div class="victory-title">${winnerTitles.join(' • ')}</div>
            `;

            winnerFighter.appendChild(nameplate);
        }, 2500);

        this.battleStatus.style.opacity = '0';
    }

    // ===== Combat Cleanup =====

    cleanupCombatElements() {
        const leftNameplate = document.querySelector('.left-nameplate');
        if (leftNameplate) {
            leftNameplate.querySelectorAll('.fighter-health').forEach(el => el.remove());
        }

        if (this.leftFighter) {
            this.leftFighter.querySelectorAll('.damage-number, .block-text, .parry-text, .miss-text').forEach(el => el.remove());
        }
        if (this.rightFighter) {
            this.rightFighter.querySelectorAll('.damage-number, .block-text, .parry-text, .miss-text').forEach(el => el.remove());
        }

        if (this.arenaViewport) {
            this.arenaViewport.querySelectorAll('.victor-text').forEach(el => el.remove());
        }
        if (this.leftFighter) {
            this.leftFighter.querySelectorAll('.victory-crown, .victory-nameplate').forEach(el => el.remove());
        }
        if (this.rightFighter) {
            this.rightFighter.querySelectorAll('.victory-crown, .victory-nameplate').forEach(el => el.remove());
        }

        if (this.leftFighter) {
            this.leftFighter.style.opacity = '1';
            this.leftFighter.style.removeProperty('--start-position');
            this.leftFighter.style.removeProperty('--start-transform');
            this.leftFighter.classList.remove('victory-center');
        }
        if (this.rightFighter) {
            this.rightFighter.style.opacity = '1';
            this.rightFighter.style.removeProperty('--start-position');
            this.rightFighter.style.removeProperty('--start-transform');
            this.rightFighter.classList.remove('victory-center');
        }

        if (this.arenaViewport) {
            const victoryOverlay = this.arenaViewport.querySelector('.victory-overlay');
            if (victoryOverlay) {
                victoryOverlay.remove();
            }
        }

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
            if (!this.startButton.disabled || this.tournamentStarted) {
                this.chatSystem.addChatMessage(this.chatSystem.getRandomHypeMessage());
            }
        }, baseRate + randomVariation);
    }

    sendUserMessage() {
        if (!this.chatInput) return;

        const message = this.chatInput.value.trim();
        if (message) {
            this.chatSystem.addChatMessage(message);
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

        if (bracketModeBtn && bracketOverlay) {
            bracketModeBtn.addEventListener('click', () => {
                bracketOverlay.classList.remove('hidden');
                bracketOverlay.classList.add('active');
            });
        }

        if (chatModeBtn && bracketOverlay) {
            chatModeBtn.addEventListener('click', () => {
                bracketOverlay.classList.add('hidden');
                bracketOverlay.classList.remove('active');
            });
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

        // Fullscreen button
        const battlefieldSection = document.querySelector('.battlefield-section');
        const fullscreenCloseBtn = document.querySelector('.battlefield-fullscreen-close');

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
    }
}
