class RNGArena {
    constructor() {
        console.log('RNGArena constructor called!');
        this.tournament = new TournamentBracket();
        console.log('Tournament created:', this.tournament);
        this.currentOpponent = 'Random Fighter';
        this.tournamentStarted = false;
        this.autoContinue = false;
        this.battleInProgress = false;

        // Character image management
        this.knightImages = ['Knight_01.png', 'Knight_02.png', 'Knight_03.png', 'knight_04.png', 'knight_05.png'];
        this.characterImageCache = new Map(); // Cache random assignments
        this.allImages = []; // Store all preloaded images
        this.imagesLoaded = false;

        // Combat system
        this.leftFighterHP = 5;
        this.rightFighterHP = 5;
        this.combatLog = [];
        this.currentTurn = 'left'; // 'left' or 'right'
        this.leftDefenseStance = null; // 'block' or 'parry' or null
        this.rightDefenseStance = null; // 'block' or 'parry' or null
        this.combatRound = 1;

        // HP bar elements
        this.leftHPFill = document.getElementById('left-hp-fill');
        this.rightHPFill = document.getElementById('right-hp-fill');
        this.leftHPText = document.getElementById('left-hp-text');
        this.rightHPText = document.getElementById('right-hp-text');

        // Seeded random number generator for fairness
        this.seed = this.generateSeed();
        this.rng = this.createSeededRNG(this.seed);

        this.leftFighter = document.querySelector('.fighter-left');
        this.rightFighter = document.querySelector('.fighter-right');
        this.battleStatus = document.querySelector('.battle-status');
        this.startButton = document.getElementById('start-battle');
        this.chatMessages = document.getElementById('chat-messages');
        this.arenaViewport = document.querySelector('.arena-viewport');
        this.progressSegments = document.getElementById('progress-segments');

        this.backgrounds = ['castle', 'forest', 'desert', 'mountain', 'ships'];
        this.currentBgIndex = 0;

        // Emoji reaction system
        this.emojiSpawnRate = 1000; // ms between spawns (starts at 1/sec)
        this.emojiSpawnInterval = null;
        this.emojiPool = ['⚔️', '🛡️', '💥', '🔥', '⚡', '💀', '👑', '🎯', '✨', '💫', '🌟', '🏆'];
        this.currentRoundEmojis = [];

        this.leftFighterNameEl = document.getElementById('left-nameplate-name');
        this.rightFighterNameEl = document.getElementById('right-nameplate-name');
        this.leftFighterTitlesEl = document.getElementById('left-nameplate-titles');
        this.rightFighterTitlesEl = document.getElementById('right-nameplate-titles');
        this.leftFighterCard = document.querySelector('.left-fighter-card');
        this.rightFighterCard = document.querySelector('.right-fighter-card');
        this.bracketDisplay = document.getElementById('bracket-display');

        // Force bracket display assignment if not found
        if (!this.bracketDisplay) {
            console.warn('bracketDisplay not found, trying again in 100ms');
            setTimeout(() => {
                this.bracketDisplay = document.getElementById('bracket-display');
                console.log('Delayed bracket assignment:', !!this.bracketDisplay);
                if (this.bracketDisplay) {
                    this.renderBracket();
                }
            }, 100);
        }

        console.log('DOM Elements Found:');
        console.log('leftFighter:', !!this.leftFighter);
        console.log('rightFighter:', !!this.rightFighter);
        console.log('battleStatus:', !!this.battleStatus);
        console.log('startButton:', !!this.startButton);
        console.log('chatMessages:', !!this.chatMessages);
        console.log('bracketDisplay:', !!this.bracketDisplay);
        console.log('arenaViewport:', !!this.arenaViewport);
        this.chatContainer = document.querySelector('.chat-container');
        this.chatInput = document.getElementById('chat-input');
        this.sendChatBtn = document.getElementById('send-chat');

        // Bracket viewport controls
        this.bracketViewport = document.querySelector('.bracket-viewport');
        this.bracketSlider = document.getElementById('bracket-slider');
        this.zoomInBtn = document.getElementById('zoom-in');
        this.zoomOutBtn = document.getElementById('zoom-out');
        this.zoomLevel = document.getElementById('zoom-level');

        // Zoom and scroll state
        this.currentZoom = 1.6; // Default to 160% actual zoom (displays as 100%, minimum)
        this.currentScrollX = 0;
        this.currentScrollY = 0;


        this.chatLines = [
            "TOURNAMENT BRACKET BATTLE!",
            "WHO'S GONNA WIN?!",
            "rip",
            "GO HERO!",
            "UPSET INCOMING",
            "50/50 BABY",
            "EPIC MEDIEVAL BATTLE",
            "OMG OMG OMG",
            "POGGERS",
            "EZ CLAP",
            "NO WAY",
            "LUCKY",
            "RNG GOD",
            "SCRIPTED",
            "RIGGED",
            "CASTLE VIBES",
            "FOREST FIGHT",
            "DESERT DUEL",
            "MOUNTAIN MAYHEM",
            "BRACKET MADNESS",
            "KEKW",
            "LMAOOO",
            "THIS IS NUTS",
            "RNG IS CRAZY",
            "SWORD GO BRRRR",
            "SHEESH",
            "BASED",
            "CRACKED",
            "BUILT DIFFERENT",
            "NO CAP",
            "FR FR",
            "STONKS",
            "DIAMOND HANDS",
            "TO THE MOON",
            "MONKE BRAIN",
            "BANANA",
            "SMOOTH BRAIN",
            "BIG BRAIN",
            "GALAXY BRAIN",
            "SADGE",
            "COPIUM",
            "HOPIUM",
            "MALDING",
            "PEPEGA",
            "PEPE LAUGH",
            "OMEGALUL",
            "5HEAD",
            "ACTUALLY INSANE",
            "UNREAL",
            "ABSOLUTELY MENTAL",
            "BONKERS",
            "WILD",
            "SICK PLAY",
            "NUTTY",
            "CRINGE",
            "BASED AND REDPILLED",
            "TOUCH GRASS",
            "RATIO",
            "L + RATIO",
            "SKILL ISSUE",
            "GET GOOD",
            "NOOB",
            "PRO GAMER MOVE",
            "GAMER MOMENT",
            "EPIC GAMER",
            "LITERALLY SHAKING",
            "I CAN'T EVEN",
            "BRUH MOMENT",
            "YEET",
            "PERIODT",
            "SUS",
            "AMONGUS",
            "IMPOSTOR",
            "VENTING",
            "EMERGENCY MEETING",
            "RED SUS",
            "MINECRAFT STEVE",
            "FORTNITE BATTLE PASS",
            "CHUNGUS",
            "WHOLESOME 100",
            "REDDIT MOMENT",
            "SIMP",
            "CHAD",
            "VIRGIN VS CHAD",
            "BASED CHAD",
            "SIGMA MALE",
            "ALPHA MOVE",
            "BETA BEHAVIOR",
            "MAIN CHARACTER ENERGY",
            "NPC BEHAVIOR",
            "CERTIFIED HOOD CLASSIC",
            "HITS DIFFERENT",
            "NO PRINTER",
            "FACTS",
            "SPITTING FACTS",
            "PERIODT NO PRINTER",
            "AND I OOP",
            "SKSKSK",
            "VSCO GIRL",
            "OK BOOMER",
            "ZOOMER ENERGY",
            "MILLENNIAL HUMOR",
            "GEN Z CHAOS",
            "IT'S GIVING...",
            "SLAY QUEEN",
            "PERIODT BESTIE",
            "NOT THE...",
            "THE WAY I...",
            "I'M DECEASED",
            "STOP I'M CRYING",
            "HELP-",
            "BYE-",
            "AKSJDHAKSJD",
            "KEYBOARD SMASH",
            "NO THOUGHTS HEAD EMPTY",
            "BRAIN.EXE STOPPED",
            "404 ERROR",
            "WINDOWS XP SHUTDOWN",
            "DIAL UP INTERNET",
            "LOADING...",
            "BUFFERING",
            "LAG",
            "PING DIFF",
            "SKILLED PLAYER",
            "UNSKILLED PLAYER"
        ];

        this.byeMessages = [
            "AUTOMATIC BYE!",
            "ADVANCED WITHOUT FIGHTING",
            "NO OPPONENT AVAILABLE!",
            "LUCKY BRACKET PLACEMENT",
            "FREE PASS TO NEXT ROUND",
            "BRACKET BYE!"
        ];

        this.winMessages = [
            "WHAT A SWORD FIGHT!",
            "INCREDIBLE BLADE WORK!",
            "GGWP",
            "CLEAN SWEEP",
            "DEMOLISHED",
            "BLADE MASTER!",
            "SWORD LEGEND!",
            "TOURNAMENT CONTINUES!",
            "ADVANCING TO NEXT ROUND!"
        ];

        this.init();
    }

    async init() {
        console.log('Init called - restoring functionality');

        try {
            // Add start button functionality
            if (this.startButton) {
                this.startButton.addEventListener('click', () => {
                    console.log('Starting tournament...');
                    this.startTournament();
                });
                console.log('Start button click listener added');
            } else {
                console.warn('No start button found');
            }

            // Add back functionality one by one to find what breaks bracket
            this.renderBracket();
            console.log('Bracket rendered');

            // Test 1: Add chat functionality
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

            console.log('Chat functionality added - bracket should still be there');

            // Restore essential systems step by step
            this.startChatScroll();
            this.updateOdds();
            this.initProgressBar();
            this.updateDisplay();
            this.hideRightFighter();
            console.log('Essential systems restored');

            // Tournament status removed - rounds fit to top of screen

            // Initialize bracket overlay functionality
            this.initBracketOverlay();
            console.log('Bracket overlay initialized');

            // Initialize bracket controls (zoom and scroll)
            this.initBracketControls();
            console.log('Bracket controls initialized');

            // Initialize emoji button click handlers
            this.initEmojiButtons();
            console.log('Emoji buttons initialized');

            console.log('Init completed with essential functionality');
        } catch (error) {
            console.error('Error in init:', error);
            throw error;
        }
    }

    async preloadAllGraphics() {
        const imagesToLoad = [];

        // Add character images
        this.knightImages.forEach(image => {
            imagesToLoad.push(`images/Characters/${image}`);
        });

        // Add Daring Hero image
        imagesToLoad.push('images/Characters/Daring_hero.png');

        // Add background images
        const backgroundImages = [
            'images/backgrounds/castle_background.png',
            'images/backgrounds/japan_background.png',
            'images/backgrounds/desert_background.png',
            'images/backgrounds/snow_background.png',
            'images/backgrounds/ships_background.png'
        ];
        imagesToLoad.push(...backgroundImages);

        // Preload all images
        const loadPromises = imagesToLoad.map(src => this.loadImage(src));

        try {
            this.allImages = await Promise.all(loadPromises);
            this.imagesLoaded = true;
            console.log('All graphics preloaded successfully');
        } catch (error) {
            console.error('Error preloading graphics:', error);
            // Continue anyway, don't block the game
            this.imagesLoaded = true;
        }
    }

    loadImage(src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = () => reject(new Error(`Failed to load ${src}`));
            img.src = src;
        });
    }

    hideRightFighter() {
        // Hide the right fighter initially
        if (this.rightFighter) {
            this.rightFighter.style.opacity = '0';
            // this.rightFighter.style.transform = 'translateX(100px)';
        }
        if (this.rightFighterCard) {
            this.rightFighterCard.style.opacity = '0';
            this.rightFighterCard.style.transform = 'translateX(50px)';
        }
    }

    showOpponentEntrance() {
        // Animate the opponent entering the battlefield
        if (this.rightFighter) {
            this.rightFighter.style.transition = 'opacity 1s ease, transform 1s ease';
        }
        if (this.rightFighterCard) {
            this.rightFighterCard.style.transition = 'opacity 1s ease, transform 1s ease';
        }

        setTimeout(() => {
            if (this.rightFighter) {
                this.rightFighter.style.opacity = '1';
                // this.rightFighter.style.transform = 'translateX(0)';
            }
            if (this.rightFighterCard) {
                this.rightFighterCard.style.opacity = '1';
                this.rightFighterCard.style.transform = 'translateX(0)';
            }
        }, 500); // Small delay for dramatic effect
    }

    getCharacterImage(characterName) {
        // Use Daring Hero's specific image
        if (characterName === 'Daring Hero') {
            return 'Daring_hero.png';
        }

        // For other characters, use cached random assignment or create new one
        if (!this.characterImageCache.has(characterName)) {
            const randomIndex = Math.floor(Math.random() * this.knightImages.length);
            this.characterImageCache.set(characterName, this.knightImages[randomIndex]);
        }

        return this.characterImageCache.get(characterName);
    }

    updateFighterSprite(fighterElement, characterName) {
        const spriteElement = fighterElement.querySelector('.fighter-sprite');
        if (!spriteElement) return;

        const imageName = this.getCharacterImage(characterName);
        const imagePath = `./images/Characters/${imageName}`;

        // Check if this is the left fighter and needs horizontal flipping
        const isLeftFighter = fighterElement.classList.contains('fighter-left');
        const isRightFighter = fighterElement.classList.contains('fighter-right');

        const needsFlip = (isLeftFighter && (
            imageName === 'knight_05.png' ||
            imageName === 'Knight_01.png' ||
            imageName === 'Knight_03.png'
        )) || (isRightFighter && (
            imageName === 'knight_04.png'
        ));

        // Replace SVG with IMG element
        const flipStyle = needsFlip ? 'transform: scale(0.8) scaleX(-1);' : 'transform: scale(0.8);';
        spriteElement.innerHTML = `<img src="${imagePath}" alt="${characterName}" class="character-image" style="${flipStyle}">`;
    }

    startTournament() {
        console.log('=== startTournament() CALLED ===');

        try {
            if (!this.tournamentStarted) {
                console.log('Starting tournament for the first time');
                this.tournamentStarted = true;
                this.autoContinue = true;

                if (this.startButton) {
                    this.startButton.style.display = 'none';
                    console.log('Start button hidden');
                } else {
                    console.warn('Start button not found when trying to hide it');
                }

                console.log('Adding chat messages...');
                this.addChatMessage("🎺 TOURNAMENT BEGINS! 🎺");
                this.addChatMessage("DARING HERO VS THE WORLD!");
                this.addChatMessage("BATTLE COMMENCING NOW!");
                console.log('Chat messages added');

                // Update the tournament display
                if (this.currentMatchEl) {
                    this.currentMatchEl.textContent = '🎺 TOURNAMENT BEGINS! FIRST BATTLE STARTING! 🎺';
                    console.log('Current match element updated');
                }

                if (this.leftFighterEl) {
                    this.leftFighterEl.textContent = 'DARING HERO';
                    this.leftFighterEl.style.color = '#ffd700';
                    console.log('Left fighter element updated');
                }

                if (this.rightFighterEl) {
                    this.rightFighterEl.textContent = 'ENEMY FIGHTER';
                    this.rightFighterEl.style.color = '#ff4444';
                    console.log('Right fighter element updated');
                }

                console.log('Tournament display updated, calling startBattle in 1500ms');

                // Delay starting the battle to let entrance animation complete
                setTimeout(() => {
                    console.log('Timeout reached, calling startBattle');
                    this.startBattle();
                }, 1500);
            } else {
                console.log('Tournament already started, calling startBattle directly');
                this.startBattle();
            }
        } catch (error) {
            console.error('Error in startTournament:', error);
            alert('Tournament start failed: ' + error.message);
        }
    }

    startBattle() {
        console.log('=== startBattle called! ===');
        const match = this.tournament.getCurrentMatch();
        console.log('Current match:', match);
        if (!match) {
            console.log('ERROR: No match found, calling handleNoMatch');
            this.handleNoMatch();
            return;
        }

        // Check for bye round
        console.log('Checking for bye round...');
        const byeInfo = this.tournament.hasFollowedCharacterBye();
        console.log('Bye info:', byeInfo);
        if (byeInfo) {
            console.log('BYE DETECTED, handling bye round');
            this.handleByeRound(byeInfo);
            return;
        }

        console.log('No bye, proceeding with normal battle');

        // Start/update emoji reactions based on current round
        this.updateEmojiSpawnRate();
        this.startEmojiReactions();

        // Add announcer messages for round start and match
        const roundInfo = this.tournament.getRoundInfo();
        this.addAnnouncerMessage(`🎺 ${roundInfo.name.toUpperCase()} BEGINS! 🎺`);
        this.addAnnouncerMessage(`⚔️ ${match.participant1.toUpperCase()} VS ${match.participant2.toUpperCase()} ⚔️`);

        // Ensure bracket shows current match
        this.renderBracket();
        setTimeout(() => {
            this.scrollToCurrentMatch();
        }, 200);

        this.battleStatus.style.opacity = '0';

        // Switch background
        this.switchBackground();

        // Reset fighter positions and health for new battle
        this.resetFighters();
        this.cleanupCombatElements();

        // Update display with current match
        this.updateMatchDisplay(match);

        // Start fighter entrances
        setTimeout(() => this.fighterEntrance(), 500);
    }

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

        // Reset animations (no longer using SVG)
        // SVG-specific animations removed since we use PNG images now
    }

    fighterEntrance() {
        // Show both fighters
        if (this.leftFighter) {
            this.leftFighter.style.opacity = '1';
            this.leftFighter.classList.add('fighter-entrance-left');
        }

        if (this.rightFighter) {
            this.rightFighter.style.opacity = '1';
            this.rightFighter.classList.add('fighter-entrance-right');
        }

        // Add entrance chat messages
        this.addChatMessage("FIGHTERS ENTER THE ARENA!");
        this.addChatMessage("HERE WE GO!");

        // Start the actual fight after entrance
        setTimeout(() => this.executeFight(), 2000);
    }

    executeFight() {
        // Start the new turn-based combat system
        this.startCombat();
        this.addChatMessage("TURN-BASED COMBAT BEGINS!");
        this.addChatMessage("WATCH THE DICE ROLLS!");
    }

    resolveFight(leftWins) {
        const battleResult = this.tournament.battleResult(leftWins);
        if (!battleResult) return;

        // Update fighter cards immediately to show winner with gold
        const currentMatch = this.tournament.getCurrentMatch();
        const displayOrder = this.tournament.getDisplayOrder();
        if (currentMatch && displayOrder) {
            this.updateFighterCards(currentMatch, displayOrder);
        }

        const winner = leftWins ? this.leftFighter : this.rightFighter;
        const loser = leftWins ? this.rightFighter : this.leftFighter;

        // Add winner animation (PNG image compatible)
        const winnerSprite = winner.querySelector('.fighter-sprite img');
        if (winnerSprite) {
            winnerSprite.style.animation = 'victory-glow 1s ease-in-out';
        }

        // Animate loser exit
        setTimeout(() => {
            loser.classList.add('fighter-exit');
        }, 300);

        // Animate winner pose
        setTimeout(() => {
            const winnerSprite = winner.querySelector('.fighter-sprite');
            if (winnerSprite) winnerSprite.classList.add('winner-pose');
        }, 500);

        // Update battle status
        this.battleStatus.textContent = `${battleResult.winner.toUpperCase()} WINS!`;
        this.battleStatus.style.opacity = '1';

        // Fade out after 1 second
        setTimeout(() => {
            this.battleStatus.style.opacity = '0';
        }, 1000);

        // Add announcer victory messages
        this.addAnnouncerMessage(`🏆 ${battleResult.winner.toUpperCase()} WINS! 🏆`);
        if (battleResult.loser === 'Daring Hero') {
            this.addAnnouncerMessage("💀 DARING HERO HAS BEEN ELIMINATED! 💀");
            this.addAnnouncerMessage(`👑 NOW FOLLOWING ${battleResult.winner.toUpperCase()}! 👑`);
        }
        this.addChatMessage(this.getRandomFromArray(this.winMessages));
        this.addChatMessage("GG!");

        // Update tournament state
        setTimeout(() => {
            this.tournament.advanceToNextMatch();
            this.updateOdds();
            this.updateProgressBar();
            this.updateDisplay();
            this.renderBracket();

            // Ensure we show the next match
            setTimeout(() => {
                this.scrollToCurrentMatch();
            }, 300);

            if (this.autoContinue && !this.tournament.isComplete()) {
                setTimeout(() => this.startBattle(), 2000);
            } else {
                this.enableRestart();
            }
        }, 2000);
    }


    updateOdds() {
        const roundInfo = this.tournament.getRoundInfo();
        const remainingParticipants = roundInfo.participantsLeft;
        const oddsText = `1 in ${remainingParticipants.toLocaleString()}`;

        // Update the single odds display
        const crownOdds = document.querySelector('.crown-odds');
        if (crownOdds) crownOdds.textContent = oddsText;
    }

    enableRestart() {
        const roundInfo = this.tournament.getRoundInfo();
        this.startButton.disabled = false;

        if (this.tournament.isComplete()) {
            const winner = this.tournament.getWinner();
            this.startButton.textContent = `${winner.toUpperCase()} WINS THE CROWN!`;
            this.startButton.disabled = true;
            this.addChatMessage("CROWN WINNER!");
            this.addChatMessage("LEGENDARY!");

            // Trigger victory animation
            this.showVictoryAnimation(winner);
        } else {
            this.startButton.textContent = `CONTINUE ${roundInfo.name.toUpperCase()}`;
        }
    }

    startChatScroll() {
        if (!this.chatMessages) return;

        // Add initial hype messages
        this.addChatMessage("Welcome to RNG Arena!");
        this.addChatMessage("Pure RNG battles await...");

        // Use requestAnimationFrame for better performance
        this.chatScrollInterval = setInterval(() => {
            if (!this.startButton.disabled) {
                this.addChatMessage(this.getRandomFromArray(this.chatLines));
            }
        }, 800 + Math.random() * 1200);
    }

    addChatMessage(message) {
        // Skip empty or whitespace-only messages
        if (!message || !message.trim()) {
            console.log('Skipping empty message');
            return;
        }

        console.log('=== addChatMessage DEBUG ===');
        console.log('Message:', message);
        console.log('this.chatMessages:', this.chatMessages);

        // Try to find chat element again
        const chatEl = document.getElementById('chat-messages');
        console.log('Direct search for chat-messages:', chatEl);

        if (!chatEl) {
            console.error('CHAT ELEMENT NOT FOUND!');
            // Try to create a visible message somewhere
            const testMsg = document.createElement('div');
            testMsg.textContent = 'CHAT: ' + message;
            testMsg.style.cssText = 'position: fixed; top: 100px; right: 10px; background: red; color: white; padding: 5px; z-index: 9999; font-size: 12px; max-width: 200px;';
            document.body.appendChild(testMsg);
            return;
        }

        console.log('Adding message to chat:', message);

        const messageElement = document.createElement('div');
        messageElement.className = 'chat-message';

        const username = this.generateRandomUsername() || 'Player';
        messageElement.innerHTML = `
            <span class="chat-username">${username}: ${message}</span>
        `;

        this.chatMessages.appendChild(messageElement);

        // Scroll to bottom
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;

        // Limit chat messages to prevent memory issues
        const maxMessages = 100;
        while (this.chatMessages.children.length > maxMessages) {
            this.chatMessages.removeChild(this.chatMessages.firstChild);
        }
    }

    addAnnouncerMessage(message) {
        console.log('=== addAnnouncerMessage called ===');
        console.log('Message:', message);

        if (!message || !message.trim()) {
            console.log('Message was empty or whitespace, skipping');
            return;
        }

        const chatEl = document.getElementById('chat-messages');
        console.log('Chat element found:', !!chatEl);
        if (!chatEl) {
            console.log('Chat element not found, returning');
            return;
        }

        const messageElement = document.createElement('div');
        messageElement.className = 'chat-message announcer-message';

        // Style like battle announcements - small text with gold/white color
        messageElement.innerHTML = `<span style="color: gold; font-weight: bold; font-size: 0.65rem;">${message}</span>`;
        messageElement.style.cssText = 'margin-bottom: 3px; padding: 2px 0; display: block !important; opacity: 1 !important;';

        chatEl.appendChild(messageElement);
        console.log('Announcer message added to chat, total messages:', chatEl.children.length);

        requestAnimationFrame(() => {
            chatEl.scrollTop = chatEl.scrollHeight;
        });

        // Limit chat messages to prevent memory issues
        const maxMessages = 100;
        while (chatEl.children.length > maxMessages) {
            chatEl.removeChild(chatEl.firstChild);
        }
    }

    addCombatMessage(message) {
        if (!this.chatMessages || !message) return;

        const messageElement = document.createElement('div');
        messageElement.className = 'chat-message combat-message';

        // Add color coding for different combat actions
        let coloredMessage = message;
        if (message.includes('blocks')) {
            coloredMessage = message.replace(/blocks/g, '<span style="color: #4CAF50; font-weight: bold;">blocks</span>');
        }
        if (message.includes('damage')) {
            coloredMessage = coloredMessage.replace(/damage/g, '<span style="color: #ff4444; font-weight: bold;">damage</span>');
            coloredMessage = coloredMessage.replace(/(\d+)(?=\s+damage)/g, '<span style="color: #ff6666; font-weight: bold;">$1</span>');
        }
        if (message.includes('CRIT')) {
            coloredMessage = coloredMessage.replace(/CRIT/g, '<span style="color: #ff0000; font-weight: bold; text-shadow: 0 0 5px #ff0000;">CRIT</span>');
        }
        if (message.includes('critical')) {
            coloredMessage = coloredMessage.replace(/critical/g, '<span style="color: #ff0000; font-weight: bold;">critical</span>');
        }
        if (message.includes('parries')) {
            coloredMessage = coloredMessage.replace(/parries/g, '<span style="color: #FF9800; font-weight: bold;">parries</span>');
        }
        if (message.includes('misses')) {
            coloredMessage = coloredMessage.replace(/misses/g, '<span style="color: #9E9E9E; font-weight: bold;">misses</span>');
        }

        messageElement.innerHTML = `
            <span class="chat-username">Combat: ${coloredMessage}</span>
        `;

        this.chatMessages.appendChild(messageElement);

        requestAnimationFrame(() => {
            this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
        });

        // Limit chat messages to prevent memory issues
        const maxMessages = 100;
        while (this.chatMessages.children.length > maxMessages) {
            this.chatMessages.removeChild(this.chatMessages.firstChild);
        }
    }

    generateRandomUsername() {
        const prefixes = ['RNG', 'Lucky', 'Fighter', 'Arena', 'Battle', 'Coin', 'Epic', 'Pro'];
        const suffixes = ['God', 'King', 'Master', 'Lord', '2023', 'Pro', 'X', 'Legend'];

        const prefix = this.getRandomFromArray(prefixes);
        const suffix = this.getRandomFromArray(suffixes);
        const number = Math.floor(Math.random() * 999);

        return `${prefix}${suffix}${number}`;
    }

    getRandomFromArray(array) {
        return array[Math.floor(Math.random() * array.length)];
    }

    switchBackground() {
        if (!this.arenaViewport) return;

        // Remove current background class
        this.backgrounds.forEach(bg => {
            this.arenaViewport.classList.remove(bg);
        });

        // Add new background class
        const newBg = this.backgrounds[this.currentBgIndex];
        this.arenaViewport.classList.add(newBg);

        // Move to next background for next battle
        this.currentBgIndex = (this.currentBgIndex + 1) % this.backgrounds.length;

        // Add chat message about the new arena
        const arenaMessages = {
            castle: "Welcome to the Castle Arena!",
            forest: "Fighting in the Forest Arena!",
            desert: "Battle in the Desert Arena!",
            mountain: "Combat in the Mountain Arena!"
        };

        this.addChatMessage(arenaMessages[newBg]);
    }

    updateDisplay() {
        console.log('updateDisplay called');
        const match = this.tournament.getCurrentMatch();
        console.log('Current match:', match);
        const displayOrder = this.tournament.getDisplayOrder();
        console.log('Display order:', displayOrder);
        this.updateFighterCards(match, displayOrder);
    }

    updateMatchDisplay(match) {
        // Use display order to keep fighters on their assigned sides
        const displayOrder = this.tournament.getDisplayOrder();
        if (!displayOrder) return;

        // Show fighters based on their assigned visual sides
        if (this.leftFighterNameEl) {
            this.leftFighterNameEl.textContent = this.tournament.getCharacterName(displayOrder.leftFighter);
            // Update character sprite
            this.updateFighterSprite(this.leftFighter, displayOrder.leftFighter);
        }

        // Update left fighter titles
        if (this.leftFighterTitlesEl) {
            const leftTitles = this.tournament.getCharacterTitles(displayOrder.leftFighter);
            this.leftFighterTitlesEl.textContent = leftTitles.join(' • ');
        }

        // Right side shows the other fighter
        if (this.rightFighterNameEl) {
            this.rightFighterNameEl.textContent = this.tournament.getCharacterName(displayOrder.rightFighter);
            // Update character sprite
            this.updateFighterSprite(this.rightFighter, displayOrder.rightFighter);

            // Update right fighter titles
            if (this.rightFighterTitlesEl) {
                const rightTitles = this.tournament.getCharacterTitles(displayOrder.rightFighter);
                this.rightFighterTitlesEl.textContent = rightTitles.join(' • ');
            }
        }

        // Update knight colors for current fighters
        this.updateKnightColors(displayOrder.leftFighter, displayOrder.rightFighter);

        this.updateFighterCards(match, displayOrder);
    }

    updateFighterCards(match, displayOrder) {
        // Reset all card classes (with null checks)
        if (this.leftFighterCard) {
            this.leftFighterCard.className = 'fighter-card left-fighter-card';
        }
        if (this.rightFighterCard) {
            this.rightFighterCard.className = 'fighter-card right-fighter-card';
        }

        if (!match) return;

        // Use displayOrder if provided, otherwise use match participants
        const leftFighter = displayOrder ? displayOrder.leftFighter : match.participant1;
        const rightFighter = displayOrder ? displayOrder.rightFighter : match.participant2;

        // Apply styling based on displayed fighters
        // Winners always get gold nameplate
        if (this.leftFighterCard) {
            if (this.tournament.isWinner(leftFighter)) {
                this.leftFighterCard.classList.add('following');
            } else if (leftFighter === 'Daring Hero') {
                // Daring Hero gets blue when not a winner yet
                this.leftFighterCard.classList.add('daring-hero');
            }
        }

        if (this.rightFighterCard) {
            if (this.tournament.isWinner(rightFighter)) {
                this.rightFighterCard.classList.add('following');
            } else if (rightFighter === 'Daring Hero') {
                // Daring Hero gets blue when not a winner yet
                this.rightFighterCard.classList.add('daring-hero');
            }
        }
    }

    handleNoMatch() {
        this.addChatMessage("Tournament completed or no match available!");
        this.enableRestart();
    }

    handleByeRound(byeInfo) {
        // Display the bye announcement message
        this.battleStatus.textContent = 'LUCKY BYE!';
        this.battleStatus.style.opacity = '1';

        // Add the bye announcer messages
        this.addAnnouncerMessage("🍀 LUCKY BYE! 🍀");
        this.addAnnouncerMessage("Free Loot Upgrade!");
        this.addAnnouncerMessage(`${byeInfo.character.toUpperCase()} ADVANCES TO NEXT ROUND!`);

        // Update display to show only the advancing character
        this.updateByeDisplay(byeInfo);

        // Switch background for visual variety
        this.switchBackground();

        // Advance to next match after a short delay
        setTimeout(() => {
            this.tournament.advanceToNextMatch();
            this.updateOdds();
            this.updateProgressBar();
            this.updateDisplay();
            this.renderBracket();

            if (this.autoContinue && !this.tournament.isComplete()) {
                setTimeout(() => this.startBattle(), 1500);
            } else {
                this.enableRestart();
            }
        }, 2000);
    }

    updateByeDisplay(byeInfo) {
        // Show the character on their assigned side, hide the other
        if (byeInfo.position === 'left') {
            this.leftFighterNameEl.textContent = this.tournament.getCharacterName(byeInfo.character);
            const leftTitles = this.tournament.getCharacterTitles(byeInfo.character);
            this.leftFighterTitlesEl.textContent = leftTitles.join(' • ');
            // Update character sprite
            this.updateFighterSprite(this.leftFighter, byeInfo.character);

            this.rightFighterNameEl.textContent = '---';
            this.rightFighterTitlesEl.textContent = 'No Opponent';
            // Clear right fighter sprite
            const rightSprite = this.rightFighter.querySelector('.fighter-sprite');
            if (rightSprite) rightSprite.innerHTML = '';
        } else {
            this.rightFighterNameEl.textContent = this.tournament.getCharacterName(byeInfo.character);
            const rightTitles = this.tournament.getCharacterTitles(byeInfo.character);
            this.rightFighterTitlesEl.textContent = rightTitles.join(' • ');
            // Update character sprite
            this.updateFighterSprite(this.rightFighter, byeInfo.character);

            this.leftFighterNameEl.textContent = '---';
            this.leftFighterTitlesEl.textContent = 'No Opponent';
            // Clear left fighter sprite
            const leftSprite = this.leftFighter.querySelector('.fighter-sprite');
            if (leftSprite) leftSprite.innerHTML = '';
        }

        // Update fighter cards for the bye
        const match = { participant1: null, participant2: null };
        if (byeInfo.position === 'left') {
            match.participant1 = byeInfo.character;
        } else {
            match.participant2 = byeInfo.character;
        }

        this.updateFighterCards(match, null);
    }

    showVictoryAnimation(winner) {
        // MAX EMOJI SPAM for victory!
        this.emojiSpawnRate = 100; // 10 per second
        this.startEmojiReactions();

        // Create dark overlay to fade in behind victory
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

        // Fade in the overlay
        setTimeout(() => {
            overlay.style.opacity = '1';
        }, 100);

        // Determine which fighter is the winner and move them to center
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
            // If winner is not currently displayed, use the left fighter position
            winnerFighter = this.leftFighter;
            winnerSide = 'left';
            // Update the display to show the winner
            this.leftFighterNameEl.textContent = this.tournament.getCharacterName(winner);
            const winnerTitles = this.tournament.getCharacterTitles(winner);
            this.leftFighterTitlesEl.textContent = winnerTitles.join(' • ');
        }

        // Hide the other fighter
        const otherFighter = winnerSide === 'left' ? this.rightFighter : this.leftFighter;
        otherFighter.style.opacity = '0';

        // Set CSS custom properties for animation start position
        const startPosition = winnerSide === 'left' ? '15%' : '85%';
        const startTransform = winnerSide === 'left' ? '0%' : '-100%';

        winnerFighter.style.setProperty('--start-position', startPosition);
        winnerFighter.style.setProperty('--start-transform', startTransform);

        // Add victory center class to trigger animation
        winnerFighter.classList.add('victory-center');

        // Add white glow effect to winner
        const winnerSprite = winnerFighter.querySelector('.fighter-sprite img');
        if (winnerSprite) {
            winnerSprite.style.filter = 'drop-shadow(0 0 20px white) drop-shadow(0 0 40px white) drop-shadow(0 0 60px white)';
            winnerSprite.style.animation = 'victory-glow 2s ease-in-out infinite';
        }

        // Add soft gold glow to chest (tournament victory only)
        const chestImage = document.querySelector('.loot-chest-image');
        if (chestImage) {
            chestImage.style.filter = 'drop-shadow(0 0 15px gold) drop-shadow(0 0 30px gold)';
            chestImage.style.animation = 'victory-glow 2s ease-in-out infinite';
        }

        // Create and add crown element
        setTimeout(() => {
            const crown = document.createElement('div');
            crown.className = 'victory-crown';
            crown.textContent = '👑';
            winnerFighter.appendChild(crown);
        }, 1000);

        // Create and add VICTOR text
        setTimeout(() => {
            const victorText = document.createElement('div');
            victorText.className = 'victor-text';
            victorText.textContent = 'VICTOR!';
            this.arenaViewport.appendChild(victorText);
        }, 2000);

        // Create and add winner nameplate
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

        // Clear battle status
        this.battleStatus.style.opacity = '0';
    }

    // Seeded Random Number Generator for deterministic combat
    generateSeed() {
        const match = this.tournament.getCurrentMatch();
        if (!match) return 12345;

        // Create a seed based on the fighter names for consistency
        let seed = 0;
        const combined = match.participant1 + match.participant2;
        for (let i = 0; i < combined.length; i++) {
            seed = ((seed << 5) - seed + combined.charCodeAt(i)) & 0xffffffff;
        }
        return Math.abs(seed) || 12345;
    }

    createSeededRNG(seed) {
        let current = seed;
        return function() {
            current = (current * 16807) % 2147483647;
            return (current - 1) / 2147483646;
        };
    }

    rollDie(sides) {
        return Math.floor(this.rng() * sides) + 1;
    }

    getMaxHPForRound() {
        const roundInfo = this.tournament.getRoundInfo();
        const currentRound = roundInfo.current;

        // HP scaling: 5HP base, 8HP quarters, 12HP semis, 20HP final
        if (currentRound >= 7) return 20; // Final
        if (currentRound >= 6) return 12; // Semifinals
        if (currentRound >= 5) return 8;  // Quarterfinals
        return 5; // All earlier rounds
    }

    updateHPBars() {
        const maxHP = this.getMaxHPForRound();

        // Update left HP bar (hero)
        if (this.leftHPFill && this.leftHPText) {
            const leftPercentage = (this.leftFighterHP / maxHP) * 100;
            this.leftHPFill.style.width = `${Math.max(0, leftPercentage)}%`;
            this.leftHPText.textContent = `${Math.max(0, this.leftFighterHP)}/${maxHP}`;
        }

        // Update right HP bar (opponent)
        if (this.rightHPFill && this.rightHPText) {
            const rightPercentage = (this.rightFighterHP / maxHP) * 100;
            this.rightHPFill.style.width = `${Math.max(0, rightPercentage)}%`;
            this.rightHPText.textContent = `${Math.max(0, this.rightFighterHP)}/${maxHP}`;
        }
    }

    initializeHPBars() {
        const maxHP = this.getMaxHPForRound();
        this.leftFighterHP = maxHP;
        this.rightFighterHP = maxHP;
        this.updateHPBars();
    }

    // Combat System Methods
    initHealthDisplays() {
        // Remove existing health displays from new nameplate structure
        const leftNameplate = document.querySelector('.left-nameplate');
        if (leftNameplate) {
            leftNameplate.querySelectorAll('.fighter-health').forEach(el => el.remove());
        }

        // Get HP for current round
        const maxHP = this.getMaxHPForRound();

        // Create health display only for hero (left fighter)
        this.createHealthDisplay(this.leftFighter, maxHP);

        // Reset health
        this.leftFighterHP = maxHP;
        this.rightFighterHP = maxHP;
        this.combatLog = [];
        this.currentTurn = 'left';
        this.leftDefenseStance = null;
        this.rightDefenseStance = null;
        this.combatRound = 1;

        // Reset seed for this fight
        this.seed = this.generateSeed();
        this.rng = this.createSeededRNG(this.seed);
    }

    createHealthDisplay(fighter, maxHP) {
        const healthContainer = document.createElement('div');
        healthContainer.className = 'fighter-health';

        for (let i = 0; i < maxHP; i++) {
            const diamond = document.createElement('div');
            diamond.className = 'health-diamond';
            healthContainer.appendChild(diamond);
        }

        // Attach HP to new nameplate structure (only for hero/left fighter)
        const isLeftFighter = fighter.classList.contains('fighter-left');
        if (isLeftFighter) {
            const nameplate = document.querySelector('.left-nameplate');
            if (nameplate) {
                nameplate.appendChild(healthContainer);
            }
        }
    }

    updateHealthDisplay(fighter, currentHP) {
        // Find HP in new nameplate structure (only for hero/left fighter)
        const isLeftFighter = fighter.classList.contains('fighter-left');
        if (!isLeftFighter) return; // Only show HP for hero

        const nameplate = document.querySelector('.left-nameplate');
        if (!nameplate) return;
        const healthContainer = nameplate.querySelector('.fighter-health');
        if (!healthContainer) return;

        const diamonds = healthContainer.querySelectorAll('.health-diamond');
        diamonds.forEach((diamond, index) => {
            if (index >= currentHP) {
                diamond.classList.add('lost');
            } else {
                diamond.classList.remove('lost');
            }
        });
    }

    startCombat() {
        this.initHealthDisplays();
        this.initializeHPBars();
        this.battleStatus.textContent = 'COMBAT BEGINS!';
        this.battleStatus.style.opacity = '1';

        // Fade out after 1 second
        setTimeout(() => {
            this.battleStatus.style.opacity = '0';
        }, 1000);

        // Start the first combat beat
        setTimeout(() => this.executeCombatBeat(), 1000);
    }

    executeCombatBeat() {
        const attacker = this.currentTurn === 'left' ? 'left' : 'right';
        const defender = this.currentTurn === 'left' ? 'right' : 'left';

        const attackerFighter = attacker === 'left' ? this.leftFighter : this.rightFighter;
        const defenderFighter = attacker === 'left' ? this.rightFighter : this.leftFighter;

        const attackerName = attacker === 'left' ? this.leftFighterNameEl.textContent : this.rightFighterNameEl.textContent;
        const defenderName = attacker === 'left' ? this.rightFighterNameEl.textContent : this.leftFighterNameEl.textContent;

        // Attack roll (1-6)
        const attackRoll = this.rollDie(6);
        const isCrit = attackRoll === 5;

        this.addCombatAnimation(attackerFighter, 'fighter-attacking');
        if (isCrit) {
            this.addCombatAnimation(attackerFighter, 'fighter-crit-attack');
        }

        // Show attack text immediately when knight starts growing (but not for misses)
        if (attackRoll !== 6) {
            this.showAttackerDamage(attackerFighter, attackRoll, isCrit);
        }

        setTimeout(() => {
            if (attackRoll === 6) {
                // Miss!
                this.handleMiss(attackerFighter, attackerName);
            } else {
                // Check if defender has a defensive stance prepared
                const defenderStance = defender === 'left' ? this.leftDefenseStance : this.rightDefenseStance;

                if (defenderStance === 'block') {
                    // Block activated!
                    this.addCombatAnimation(defenderFighter, 'fighter-defending');
                    setTimeout(() => {
                        this.handleBlock(defenderFighter, defenderName, attackRoll, isCrit);
                        // Clear the stance after use
                        if (defender === 'left') {
                            this.leftDefenseStance = null;
                        } else {
                            this.rightDefenseStance = null;
                        }
                    }, 500);
                } else if (defenderStance === 'parry') {
                    // Parry activated!
                    this.addCombatAnimation(defenderFighter, 'fighter-defending');
                    setTimeout(() => {
                        this.handleParry(attackerFighter, defenderFighter, attackerName, defenderName, attackRoll, isCrit);
                        // Clear the stance after use
                        if (defender === 'left') {
                            this.leftDefenseStance = null;
                        } else {
                            this.rightDefenseStance = null;
                        }
                    }, 500);
                } else {
                    // Normal damage resolution - defender rolls (2-8)
                    const defendRoll = this.rollDie(7) + 1; // 2-8

                    this.addCombatAnimation(defenderFighter, 'fighter-defending');

                    setTimeout(() => {
                        if (defendRoll === 7) {
                            // Random block - also sets defensive stance for next turn
                            this.handleBlock(defenderFighter, defenderName, attackRoll, isCrit);
                            if (defender === 'left') {
                                this.leftDefenseStance = 'block';
                            } else {
                                this.rightDefenseStance = 'block';
                            }
                            this.addCombatMessage(`🛡️ ${defenderName} prepares to block the next attack!`);
                        } else if (defendRoll === 8) {
                            // Random parry - also sets defensive stance for next turn
                            this.handleParry(attackerFighter, defenderFighter, attackerName, defenderName, attackRoll, isCrit);
                            if (defender === 'left') {
                                this.leftDefenseStance = 'parry';
                            } else {
                                this.rightDefenseStance = 'parry';
                            }
                            this.addCombatMessage(`⚔️ ${defenderName} prepares to parry the next attack!`);
                        } else {
                            // Hit lands!
                            const damage = isCrit ? 7 : attackRoll;
                            this.handleHit(defenderFighter, defenderName, damage, defender, isCrit);
                        }
                    }, 500);
                }
            }
        }, 800);
    }

    handleMiss(attackerFighter, attackerName) {
        this.addCombatAnimation(attackerFighter, 'fighter-miss');
        this.showCombatText(attackerFighter, 'MISS!', 'miss-text');

        const logEntry = `${attackerName} attacks but misses!`;
        this.addCombatLog(logEntry);
        this.addCombatMessage(`⚔️ ${attackerName} swings and misses!`);

        this.nextTurn();
    }

    handleBlock(defenderFighter, defenderName, damage, isCrit) {
        this.addCombatAnimation(defenderFighter, 'fighter-block');
        this.showCombatText(defenderFighter, 'BLOCK!', 'block-text');

        const damageText = isCrit ? 'CRIT' : damage.toString();
        const logEntry = `${defenderName} blocks ${damageText} damage!`;
        this.addCombatLog(logEntry);
        this.addCombatMessage(`🛡️ ${defenderName} blocks ${damageText} damage!`);

        this.nextTurn();
    }

    handleParry(attackerFighter, defenderFighter, attackerName, defenderName, damage, isCrit) {
        this.addCombatAnimation(defenderFighter, 'fighter-parry');
        this.showCombatText(defenderFighter, 'PARRY!', 'parry-text');

        setTimeout(() => {
            // Damage bounces back to attacker
            this.addCombatAnimation(attackerFighter, 'fighter-hit');
            this.showDamageNumber(attackerFighter, damage, isCrit);

            const attackerSide = attackerFighter === this.leftFighter ? 'left' : 'right';
            if (attackerSide === 'left') {
                this.leftFighterHP -= damage;
                this.updateHealthDisplay(this.leftFighter, this.leftFighterHP);
            } else {
                this.rightFighterHP -= damage;
                // Only update hero HP
            }
            this.updateHPBars();

            const damageText = isCrit ? 'CRIT' : damage.toString();
            const logEntry = `${defenderName} parries and reflects ${damageText} damage back to ${attackerName}!`;
            this.addCombatLog(logEntry);
            this.addCombatMessage(`⚡ ${defenderName} parries and reflects ${damageText} damage back to ${attackerName}!`);

            if (this.leftFighterHP <= 0 || this.rightFighterHP <= 0) {
                this.endCombat();
            } else {
                this.nextTurn();
            }
        }, 800);
    }

    handleHit(defenderFighter, defenderName, damage, defenderSide, isCrit) {
        const attackerFighter = defenderSide === 'left' ? this.rightFighter : this.leftFighter;
        const attackerName = defenderSide === 'left' ? this.rightFighterNameEl.textContent : this.leftFighterNameEl.textContent;

        setTimeout(() => {
            this.addCombatAnimation(defenderFighter, 'fighter-hit');
            if (isCrit) {
                this.addCombatAnimation(defenderFighter, 'fighter-crit-glow');
            }
            this.showDamageNumber(defenderFighter, damage, isCrit);

            if (defenderSide === 'left') {
                this.leftFighterHP -= damage;
                this.updateHealthDisplay(this.leftFighter, this.leftFighterHP);
            } else {
                this.rightFighterHP -= damage;
                // Only update hero HP
            }
            this.updateHPBars();

            const damageText = isCrit ? 'CRIT' : damage.toString();
            const logEntry = `${attackerName} deals ${damageText} damage to ${defenderName}!`;
            this.addCombatLog(logEntry);
            this.addCombatMessage(`💀 ${attackerName} deals ${damageText} damage to ${defenderName}!`);

            if (this.leftFighterHP <= 0 || this.rightFighterHP <= 0) {
                this.endCombat();
            } else {
                this.nextTurn();
            }
        }, 800);
    }

    nextTurn() {
        this.currentTurn = this.currentTurn === 'left' ? 'right' : 'left';

        setTimeout(() => {
            if (this.leftFighterHP > 0 && this.rightFighterHP > 0) {
                this.executeCombatBeat();
            }
        }, 1500);
    }

    endCombat() {
        const leftWins = this.rightFighterHP <= 0;
        const winner = leftWins ? this.leftFighterNameEl.textContent : this.rightFighterNameEl.textContent;
        const loser = leftWins ? this.rightFighterNameEl.textContent : this.leftFighterNameEl.textContent;

        const logEntry = `${winner} defeats ${loser} with ${leftWins ? this.leftFighterHP : this.rightFighterHP} HP remaining!`;
        this.addCombatLog(logEntry);

        this.battleStatus.textContent = `${winner.toUpperCase()} WINS!`;
        this.battleStatus.style.opacity = '1';

        // Fade out after 1 second
        setTimeout(() => {
            this.battleStatus.style.opacity = '0';
        }, 1000);

        // Continue with existing victory logic
        setTimeout(() => {
            this.resolveFight(leftWins);
        }, 2000);
    }

    addCombatAnimation(fighter, animationClass) {
        fighter.classList.add(animationClass);
        setTimeout(() => fighter.classList.remove(animationClass), 1000);
    }

    showDamageNumber(fighter, damage, isCrit = false) {
        const damageEl = document.createElement('div');
        damageEl.className = isCrit ? 'crit-number' : 'damage-number';
        damageEl.textContent = isCrit ? 'CRITICAL' : `-${damage}`;
        fighter.appendChild(damageEl);

        const duration = isCrit ? 2500 : 2000;
        setTimeout(() => damageEl.remove(), duration);
    }

    showAttackerDamage(fighter, damage, isCrit = false) {
        const damageEl = document.createElement('div');
        damageEl.className = isCrit ? 'attacker-crit-number' : 'attacker-damage-number';
        damageEl.textContent = isCrit ? 'CRITICAL' : `Attack +${damage}`;
        fighter.appendChild(damageEl);

        const duration = isCrit ? 1500 : 1200;
        setTimeout(() => damageEl.remove(), duration);
    }

    showCombatText(fighter, text, className) {
        const textEl = document.createElement('div');
        textEl.className = className;
        textEl.textContent = text;
        fighter.appendChild(textEl);

        setTimeout(() => textEl.remove(), 1200);
    }

    addCombatLog(entry) {
        this.combatLog.push(`Beat ${this.combatLog.length + 1}: ${entry}`);

        // Also add to chat for live viewing
        this.addChatMessage(`⚔️ ${entry}`);
    }

    cleanupCombatElements() {
        // Remove any leftover health displays from new nameplate structure
        const leftNameplate = document.querySelector('.left-nameplate');
        if (leftNameplate) {
            leftNameplate.querySelectorAll('.fighter-health').forEach(el => el.remove());
        }

        // Remove any leftover damage numbers or combat text
        if (this.leftFighter) {
            this.leftFighter.querySelectorAll('.damage-number, .block-text, .parry-text, .miss-text').forEach(el => el.remove());
        }
        if (this.rightFighter) {
            this.rightFighter.querySelectorAll('.damage-number, .block-text, .parry-text, .miss-text').forEach(el => el.remove());
        }

        // Remove any leftover victory elements
        if (this.arenaViewport) {
            this.arenaViewport.querySelectorAll('.victor-text').forEach(el => el.remove());
        }
        if (this.leftFighter) {
            this.leftFighter.querySelectorAll('.victory-crown, .victory-nameplate').forEach(el => el.remove());
        }
        if (this.rightFighter) {
            this.rightFighter.querySelectorAll('.victory-crown, .victory-nameplate').forEach(el => el.remove());
        }

        // Reset fighter opacities and styles
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

        // Remove victory overlay if it exists
        if (this.arenaViewport) {
            const victoryOverlay = this.arenaViewport.querySelector('.victory-overlay');
            if (victoryOverlay) {
                victoryOverlay.remove();
            }
        }

        // Reset chest glow
        const chestImage = document.querySelector('.loot-chest-image');
        if (chestImage) {
            chestImage.style.filter = '';
            chestImage.style.animation = '';
        }

        // Reset combat state with current round HP
        const maxHP = this.getMaxHPForRound();
        this.leftFighterHP = maxHP;
        this.rightFighterHP = maxHP;
        this.combatLog = [];
        this.currentTurn = 'left';
        this.leftDefenseStance = null;
        this.rightDefenseStance = null;
        this.combatRound = 1;
    }

    // Dynamic Knight Color System
    generateCharacterColors(characterName) {
        // Create a seed from character name for consistent colors
        let seed = 0;
        for (let i = 0; i < characterName.length; i++) {
            seed = ((seed << 5) - seed + characterName.charCodeAt(i)) & 0xffffffff;
        }

        // Use seed to generate consistent colors
        const rng = () => {
            seed = (seed * 16807) % 2147483647;
            return (seed - 1) / 2147483646;
        };

        // Define color palettes for capes and shields
        const capeColors = [
            { primary: '#8B0000', secondary: '#A0001A', name: 'Crimson' }, // Deep Red
            { primary: '#006400', secondary: '#228B22', name: 'Forest' },  // Forest Green
            { primary: '#4B0082', secondary: '#6A0DAD', name: 'Royal' },   // Royal Purple
            { primary: '#FF8C00', secondary: '#FFA500', name: 'Amber' },   // Amber Orange
            { primary: '#191970', secondary: '#483D8B', name: 'Midnight' }, // Midnight Blue
            { primary: '#8B008B', secondary: '#9932CC', name: 'Violet' },  // Dark Magenta
            { primary: '#2F4F4F', secondary: '#708090', name: 'Steel' },   // Dark Slate Gray
            { primary: '#800000', secondary: '#A52A2A', name: 'Burgundy' } // Maroon/Burgundy
        ];

        const shieldColors = [
            { primary: '#4169E1', secondary: '#2E4BC7', boss: '#FFD700', name: 'Sapphire' }, // Royal Blue
            { primary: '#DC143C', secondary: '#B22222', boss: '#FFD700', name: 'Scarlet' },  // Crimson
            { primary: '#228B22', secondary: '#006400', boss: '#FFD700', name: 'Emerald' },  // Forest Green
            { primary: '#FF6347', secondary: '#FF4500', boss: '#FFD700', name: 'Flame' },    // Tomato/Orange
            { primary: '#9932CC', secondary: '#8A2BE2', boss: '#FFD700', name: 'Amethyst' }, // Dark Violet
            { primary: '#CD853F', secondary: '#D2691E', boss: '#FFD700', name: 'Bronze' },   // Peru/Chocolate
            { primary: '#483D8B', secondary: '#2F4F4F', boss: '#FFD700', name: 'Slate' },    // Dark Slate Blue
            { primary: '#B8860B', secondary: '#DAA520', boss: '#FFD700', name: 'Golden' }    // Dark Goldenrod
        ];

        const capeIndex = Math.floor(rng() * capeColors.length);
        const shieldIndex = Math.floor(rng() * shieldColors.length);

        return {
            cape: capeColors[capeIndex],
            shield: shieldColors[shieldIndex]
        };
    }

    updateKnightColors(leftFighterName, rightFighterName) {
        // Generate colors for both fighters
        const leftColors = this.generateCharacterColors(leftFighterName);
        const rightColors = this.generateCharacterColors(rightFighterName);

        // Update left knight colors
        this.applyKnightColors(this.leftFighter, leftColors, 'left');
        // Update right knight colors
        this.applyKnightColors(this.rightFighter, rightColors, 'right');
    }

    applyKnightColors(fighterElement, colors, side) {
        // Knight coloring disabled - using PNG images instead of SVG
        // This function was for SVG knight customization
        return;
    }

    darkenColor(hexColor) {
        // Convert hex to RGB, darken by 20%, return hex
        const hex = hexColor.replace('#', '');
        const r = Math.max(0, Math.floor(parseInt(hex.substr(0, 2), 16) * 0.8));
        const g = Math.max(0, Math.floor(parseInt(hex.substr(2, 2), 16) * 0.8));
        const b = Math.max(0, Math.floor(parseInt(hex.substr(4, 2), 16) * 0.8));

        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }

    renderBracket() {
        console.log('renderBracket called, bracketDisplay element:', this.bracketDisplay);
        if (!this.bracketDisplay) {
            console.warn('No bracket display element found');
            return;
        }

        // Keep the real bracket content and add extra debugging
        console.log('renderBracket called - checking tournament status');

        const currentMatch = this.tournament.getCurrentMatch();
        console.log('Current match from tournament:', currentMatch);

        const roundInfo = this.tournament.getRoundInfo();
        console.log('Round info:', roundInfo);

        if (currentMatch) {
            console.log('Match participants:', currentMatch.participant1, 'vs', currentMatch.participant2);

            // Update our tournament status display if it exists
            if (this.currentMatchEl) {
                this.currentMatchEl.textContent = `Current Match: ${currentMatch.participant1} VS ${currentMatch.participant2}`;
            }

            if (this.leftFighterEl) {
                this.leftFighterEl.textContent = currentMatch.participant1;
            }

            if (this.rightFighterEl) {
                this.rightFighterEl.textContent = currentMatch.participant2;
            }
        }

        // Continue with the original bracket rendering

        // Use array join for better performance than string concatenation
        const htmlParts = [];

        // Render each round horizontally
        for (let roundIndex = 0; roundIndex < this.tournament.bracket.length - 1; roundIndex++) {
            const round = this.tournament.bracket[roundIndex];
            const roundName = this.getRoundName(roundIndex + 1);
            const isCurrentRound = roundIndex + 1 === roundInfo.current;

            htmlParts.push(`<div class="bracket-round">`);
            htmlParts.push(`<div class="bracket-round-title ${isCurrentRound ? 'active-round' : ''}">${roundName}</div>`);
            htmlParts.push(`<div class="bracket-matches">`);

            // Process matches in pairs
            for (let i = 0; i < round.length; i += 2) {
                const participant1 = round[i];
                const participant2 = round[i + 1];
                const matchIndex = Math.floor(i / 2);

                // Check if this match has been completed
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

        // Always show the winner/champion round
        const winner = this.tournament.bracket[this.tournament.bracket.length - 1][0];
        htmlParts.push(`<div class="bracket-round" style="display: flex; flex-direction: column; justify-content: center;">`);
        htmlParts.push(`<div class="bracket-round-title">CHAMPION</div>`);
        if (winner) {
            htmlParts.push(`<div class="bracket-winner-display">🏆 ${winner} 🏆</div>`);
        } else {
            htmlParts.push(`<div class="bracket-winner-display awaiting">Awaiting Winner...</div>`);
        }
        htmlParts.push(`</div>`);

        this.bracketDisplay.innerHTML = htmlParts.join('');

        // Update transform after content renders to establish scrollable dimensions
        setTimeout(() => {
            this.updateBracketTransform();
            this.updateSliderRange();
        }, 50);

        // Auto-scroll to current match (delayed to ensure DOM is updated)
        setTimeout(() => {
            this.scrollToCurrentMatch();
        }, 100);
    }

    renderMatch(participant1, participant2, isCompleted, isCurrent, winner, isOnFollowingPath, showConnector) {
        // Handle empty slots
        if (!participant1 && !participant2) {
            return `<div class="bracket-match empty"><div class="bracket-bye">Empty</div></div>`;
        }

        // Handle bye cases - only show the fighter, no "BYE" text or lines
        if (!participant1 || !participant2) {
            const advancer = participant1 || participant2;
            let matchClass = 'bracket-match bye-match';
            if (isOnFollowingPath) matchClass += ' following-path';

            return `<div class="${matchClass}">
                <div class="bracket-participant bye-winner ${advancer === this.tournament.followingCharacter ? 'following' : ''}">${advancer}</div>
                ${showConnector ? '<div class="bracket-connector' + (isOnFollowingPath ? ' active' : '') + '"></div>' : ''}
            </div>`;
        }

        // Regular match with two participants
        let matchClass = 'bracket-match';
        if (isCompleted) matchClass += ' completed';
        if (isCurrent) matchClass += ' current';
        if (isOnFollowingPath) matchClass += ' following-path';

        let html = `<div class="${matchClass}">`;

        // Participant 1
        let p1Class = 'bracket-participant';
        if (isCompleted && winner === participant1) p1Class += ' winner';
        else if (isCompleted && winner !== participant1) p1Class += ' eliminated';
        if (participant1 === this.tournament.followingCharacter) p1Class += ' following';

        html += `<div class="${p1Class}">${participant1}</div>`;
        html += `<div class="vs-separator">VS</div>`;

        // Participant 2
        let p2Class = 'bracket-participant';
        if (isCompleted && winner === participant2) p2Class += ' winner';
        else if (isCompleted && winner !== participant2) p2Class += ' eliminated';
        if (participant2 === this.tournament.followingCharacter) p2Class += ' following';

        html += `<div class="${p2Class}">${participant2}</div>`;

        // Add connector line if not final round
        if (showConnector) {
            html += `<div class="bracket-connector${isOnFollowingPath ? ' active' : ''}"></div>`;
        }

        html += `</div>`;

        return html;
    }

    isMatchOnFollowingPath(participant1, participant2, roundNumber) {
        // Check if this match is on the path of the character we're following
        return participant1 === this.tournament.followingCharacter ||
               participant2 === this.tournament.followingCharacter ||
               this.isCharacterInFuturePath(participant1, participant2, roundNumber);
    }

    isCharacterInFuturePath(participant1, participant2, roundNumber) {
        // Trace back from current following character to see if this match led to them
        let currentChar = this.tournament.followingCharacter;

        // Look through completed matches to trace the path
        for (let r = this.tournament.currentRound - 1; r >= roundNumber; r--) {
            const roundMatches = this.tournament.bracket[r - 1];
            const nextRound = this.tournament.bracket[r];

            for (let i = 0; i < roundMatches.length; i += 2) {
                const p1 = roundMatches[i];
                const p2 = roundMatches[i + 1];
                const matchIndex = Math.floor(i / 2);
                const winner = nextRound[matchIndex];

                if (winner === currentChar && (p1 === participant1 || p1 === participant2 || p2 === participant1 || p2 === participant2)) {
                    return true;
                }
            }
        }

        return false;
    }

    getRoundName(roundNumber) {
        // For 128 participants bracket = 8 rounds (last is winner slot)
        // Round progression: R1-R4, Quarterfinals, Semifinals, Finals, Championship
        const roundNames = {
            1: 'Round 1',
            2: 'Round 2',
            3: 'Round 3',
            4: 'Round 4',
            5: 'Quarterfinals',
            6: 'Semifinals',
            7: 'Finals',
            8: 'Championship'
        };
        return roundNames[roundNumber] || `Round ${roundNumber}`;
    }

    sendUserMessage() {
        if (!this.chatInput) return;

        const message = this.chatInput.value.trim();
        if (message === '') return;

        // Add user message to chat with special styling
        this.addUserChatMessage(message);

        // Clear input
        this.chatInput.value = '';
    }

    addUserChatMessage(message) {
        if (!this.chatMessages || !message) return;

        const messageElement = document.createElement('div');
        messageElement.className = 'chat-message user-message';

        messageElement.innerHTML = `
            <span class="chat-username user-username">You: ${message}</span>
        `;

        this.chatMessages.appendChild(messageElement);
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;

        // Allow unlimited user messages - continuous scroll
        // No message limit removal
    }

    initProgressBar() {
        if (!this.progressSegments) return;

        const roundInfo = this.tournament.getRoundInfo();
        this.progressSegments.innerHTML = '';
        for (let i = 0; i < roundInfo.total; i++) {
            const segment = document.createElement('div');
            segment.className = 'progress-segment remaining';
            this.progressSegments.appendChild(segment);
        }
        this.updateProgressBar();
    }

    updateProgressBar() {
        if (!this.progressSegments) return;

        const roundInfo = this.tournament.getRoundInfo();
        const segments = this.progressSegments.children;

        // Debug logging to understand what's happening
        console.log(`Tournament Progress: Round ${roundInfo.current} of ${roundInfo.total} (${roundInfo.name})`);
        console.log(`Participants left: ${roundInfo.participantsLeft}`);

        // Define tier colors in order: Gray, White, Green, Blue, Purple, Orange, Gold
        const tierColors = ['tier-gray', 'tier-white', 'tier-green', 'tier-blue', 'tier-purple', 'tier-orange', 'tier-gold'];

        for (let i = 0; i < segments.length; i++) {
            if (i < roundInfo.current - 1) {
                // Completed rounds get tier colors based on their position
                const tierColorClass = tierColors[i] || 'tier-gold'; // Default to gold if we exceed the array
                segments[i].className = `progress-segment completed ${tierColorClass}`;
            } else if (i === roundInfo.current - 1) {
                segments[i].className = 'progress-segment current';
            } else {
                segments[i].className = 'progress-segment remaining';
            }
        }

        // Update loot gem color based on current round
        this.updateLootGem(roundInfo);
    }

    updateLootGem(roundInfo) {
        // Update loot box based on round
        this.updateLootBox(roundInfo);
    }

    updateLootBox(roundInfo) {
        const lootBox = document.getElementById('loot-box');
        if (!lootBox) return;

        const lootTypes = [
            { name: 'unknown', material: 'Unknown', chestNumber: 8 },
            { name: 'wood', material: 'Wooden', chestNumber: 7 },
            { name: 'stone', material: 'Stone', chestNumber: 6 },
            { name: 'bronze', material: 'Bronze', chestNumber: 5 },
            { name: 'silver', material: 'Silver', chestNumber: 4 },
            { name: 'gold', material: 'Golden', chestNumber: 3 },
            { name: 'platinum', material: 'Platinum', chestNumber: 2 },
            { name: 'diamond', material: 'Diamond', chestNumber: 1 }
        ];

        const currentRound = Math.max(0, roundInfo.current - 1);
        // Start with lowest tier and progress to diamond (final reward)
        const lootType = lootTypes[Math.min(currentRound, lootTypes.length - 1)];

        // Update loot header
        const lootHeader = document.querySelector('.loot-header');
        if (lootHeader) {
            lootHeader.textContent = `${lootType.material.toUpperCase()} LOOT`;
        }

        // Use actual chest image with fade transition
        const chestNumber = lootType.chestNumber.toString().padStart(2, '0');
        const newImageSrc = `./images/Loot/chest_${chestNumber}.png`;

        // Check if chest needs to change
        const currentImg = lootBox.querySelector('.loot-chest-image');
        if (currentImg && currentImg.src.includes(`chest_${chestNumber}.png`)) {
            return; // Same chest, no need to change
        }

        // Add fade transition
        lootBox.style.opacity = '0';
        lootBox.style.transition = 'opacity 0.3s ease-in-out';

        setTimeout(() => {
            lootBox.innerHTML = `<img src="${newImageSrc}" alt="${lootType.material} Chest" class="loot-chest-image">`;
            lootBox.style.opacity = '1';
        }, 300);
    }

    createLootBoxSVG(lootType) {
        const { colors } = lootType;

        if (lootType.name === 'unknown') {
            return `<svg width="140" height="120" viewBox="0 0 120 100" class="loot-svg">
                <rect x="25" y="50" width="70" height="35" fill="${colors.base}" stroke="#303030" stroke-width="2" rx="3"/>
                <path d="M25 50 Q25 35 60 35 Q95 35 95 50 L95 45 Q95 30 60 30 Q25 30 25 45 Z" fill="${colors.lid}" stroke="${colors.base}" stroke-width="2"/>
                <text x="60" y="55" font-family="Arial, sans-serif" font-size="24" font-weight="bold" fill="${colors.accent}" text-anchor="middle">?</text>
                <circle cx="30" cy="60" r="3" fill="#303030" stroke="#202020" stroke-width="1"/>
                <circle cx="90" cy="60" r="3" fill="#303030" stroke="#202020" stroke-width="1"/>
                <circle cx="30" cy="75" r="3" fill="#303030" stroke="#202020" stroke-width="1"/>
                <circle cx="90" cy="75" r="3" fill="#303030" stroke="#202020" stroke-width="1"/>
            </svg>`;
        }

        return `<svg width="140" height="120" viewBox="0 0 120 100" class="loot-svg">
            <rect x="25" y="50" width="70" height="35" fill="${colors.base}" stroke="${this.darkenColor(colors.base)}" stroke-width="2" rx="3"/>
            <path d="M25 50 Q25 35 60 35 Q95 35 95 50 L95 45 Q95 30 60 30 Q25 30 25 45 Z" fill="${colors.lid}" stroke="${colors.base}" stroke-width="2"/>
            <rect x="57" y="42" width="6" height="8" fill="${colors.accent}" stroke="${this.darkenColor(colors.accent)}" stroke-width="1" rx="1"/>
            <circle cx="60" cy="46" r="2" fill="${colors.accent}" stroke="${this.darkenColor(colors.accent)}" stroke-width="1"/>
            <rect x="23" y="55" width="74" height="3" fill="${this.darkenColor(colors.base)}"/>
            <rect x="23" y="70" width="74" height="3" fill="${this.darkenColor(colors.base)}"/>
            <circle cx="30" cy="60" r="3" fill="${colors.base}" stroke="${this.darkenColor(colors.base)}" stroke-width="1"/>
            <circle cx="90" cy="60" r="3" fill="${colors.base}" stroke="${this.darkenColor(colors.base)}" stroke-width="1"/>
            <circle cx="30" cy="75" r="3" fill="${colors.base}" stroke="${this.darkenColor(colors.base)}" stroke-width="1"/>
            <circle cx="90" cy="75" r="3" fill="${colors.base}" stroke="${this.darkenColor(colors.base)}" stroke-width="1"/>
            ${lootType.name === 'diamond' ? '<polygon points="60,20 65,30 55,30" fill="#00CED1" stroke="#008B8B" stroke-width="1"/>' : ''}
        </svg>`;
    }

    // Bracket viewport control methods
    initBracketControls() {
        console.log('initBracketControls called');
        console.log('bracketViewport:', this.bracketViewport);
        console.log('bracketSlider:', this.bracketSlider);
        console.log('zoomInBtn:', this.zoomInBtn);
        console.log('zoomOutBtn:', this.zoomOutBtn);

        if (!this.bracketViewport || !this.bracketSlider || !this.zoomInBtn || !this.zoomOutBtn) {
            console.warn('Missing bracket control elements, skipping initialization');
            return;
        }

        // Apply initial zoom level (100% = 48% actual)
        this.updateBracketTransform();
        this.updateZoomDisplay();

        // Debug scroll dimensions
        setTimeout(() => {
            console.log('=== BRACKET VIEWPORT DEBUG ===');
            console.log('bracketViewport element:', this.bracketViewport);
            console.log('bracketViewport classList:', this.bracketViewport.classList);
            console.log('bracketDisplay element:', this.bracketDisplay);
            console.log('bracketDisplay classList:', this.bracketDisplay.classList);
            console.log('Viewport clientWidth:', this.bracketViewport.clientWidth);
            console.log('Viewport clientHeight:', this.bracketViewport.clientHeight);
            console.log('Viewport scrollWidth:', this.bracketViewport.scrollWidth);
            console.log('Viewport scrollHeight:', this.bracketViewport.scrollHeight);
            console.log('Viewport computed height:', getComputedStyle(this.bracketViewport).height);
            console.log('Viewport computed maxHeight:', getComputedStyle(this.bracketViewport).maxHeight);
            console.log('Display offsetWidth:', this.bracketDisplay?.offsetWidth);
            console.log('Display offsetHeight:', this.bracketDisplay?.offsetHeight);
            console.log('Display scrollWidth:', this.bracketDisplay?.scrollWidth);
            console.log('Display scrollHeight:', this.bracketDisplay?.scrollHeight);
            console.log('Display computed width:', getComputedStyle(this.bracketDisplay).width);
            console.log('Display computed height:', getComputedStyle(this.bracketDisplay).height);
            console.log('Display zoom:', getComputedStyle(this.bracketDisplay).zoom);
            console.log('Display display property:', getComputedStyle(this.bracketDisplay).display);
            console.log('Viewport overflow-x:', getComputedStyle(this.bracketViewport).overflowX);
            console.log('Viewport overflow-y:', getComputedStyle(this.bracketViewport).overflowY);
            console.log('Can scroll horizontally:', this.bracketViewport.scrollWidth > this.bracketViewport.clientWidth);
            console.log('Can scroll vertically:', this.bracketViewport.scrollHeight > this.bracketViewport.clientHeight);

            // Check first bracket round dimensions
            const firstRound = this.bracketDisplay?.querySelector('.bracket-round');
            if (firstRound) {
                console.log('First round offsetHeight:', firstRound.offsetHeight);
                console.log('First round scrollHeight:', firstRound.scrollHeight);
                const allRounds = this.bracketDisplay?.querySelectorAll('.bracket-round');
                console.log('Total rounds:', allRounds?.length);
            }

            // Try manual scroll test
            console.log('Attempting manual scroll test...');
            this.bracketViewport.scrollTop = 50;
            this.bracketViewport.scrollLeft = 50;
            setTimeout(() => {
                console.log('After scroll attempt - scrollTop:', this.bracketViewport.scrollTop);
                console.log('After scroll attempt - scrollLeft:', this.bracketViewport.scrollLeft);
            }, 100);
        }, 500);

        // Zoom controls
        this.zoomInBtn.addEventListener('click', () => {
            console.log('Zoom in clicked');
            this.zoomIn();
        });
        this.zoomOutBtn.addEventListener('click', () => {
            console.log('Zoom out clicked');
            this.zoomOut();
        });

        // Initialize zoom display and disable zoom out at minimum (1.6 = 100%)
        this.updateZoomDisplay();
        if (this.currentZoom <= 1.6 && this.zoomOutBtn) {
            this.zoomOutBtn.disabled = true;
            this.zoomOutBtn.style.opacity = '0.5';
            this.zoomOutBtn.style.cursor = 'not-allowed';
        }

        // Slider for vertical scrolling
        this.bracketSlider.addEventListener('input', (e) => {
            this.updateVerticalScroll(e.target.value);
        });

        // Sync slider with viewport scroll
        this.bracketViewport.addEventListener('scroll', () => {
            this.syncSliderWithScroll();
        });

        // Mouse wheel zoom in viewport (only when Ctrl is held)
        this.bracketViewport.addEventListener('wheel', (e) => {
            if (e.ctrlKey) {
                e.preventDefault();
                if (e.deltaY < 0) {
                    this.zoomIn();
                } else {
                    this.zoomOut();
                }
            }
        });

        // Update slider range when bracket renders
        this.updateSliderRange();
    }

    zoomIn() {
        if (this.currentZoom < 3.0) {
            this.currentZoom = Math.min(3.0, this.currentZoom + 0.1);
            this.updateBracketTransform();
            this.updateZoomDisplay();
            this.updateSliderRange();

            // Enable zoom out button when zooming in from minimum (1.6)
            if (this.currentZoom > 1.6 && this.zoomOutBtn) {
                this.zoomOutBtn.disabled = false;
                this.zoomOutBtn.style.opacity = '1';
                this.zoomOutBtn.style.cursor = 'pointer';
            }
        }
    }

    zoomOut() {
        if (this.currentZoom > 1.6) {
            this.currentZoom = Math.max(1.6, this.currentZoom - 0.1);
            this.updateBracketTransform();
            this.updateZoomDisplay();
            this.updateSliderRange();

            // Disable zoom out button if at minimum (1.6 = 100%)
            if (this.currentZoom <= 1.6 && this.zoomOutBtn) {
                this.zoomOutBtn.disabled = true;
                this.zoomOutBtn.style.opacity = '0.5';
                this.zoomOutBtn.style.cursor = 'not-allowed';
            }
        }
    }

    updateBracketTransform() {
        if (!this.bracketDisplay || !this.bracketViewport) return;

        // Scale: 1.0 = 90% of 48% = 43.2% of original
        const actualScale = this.currentZoom * 0.432;

        // Apply zoom CSS property - this properly handles scrolling
        this.bracketDisplay.style.zoom = actualScale;
        this.bracketDisplay.style.transform = '';
        this.bracketDisplay.style.transformOrigin = '';
    }

    updateZoomDisplay() {
        if (this.zoomLevel) {
            // Display zoom: 1.6 = 100% (minimum), scales up from there
            // Formula: (currentZoom / 1.6) * 100
            const displayZoom = (this.currentZoom / 1.6) * 100;
            this.zoomLevel.textContent = `${Math.round(displayZoom)}%`;
        }
    }

    updateVerticalScroll(sliderValue) {
        if (!this.bracketViewport) return;

        // Use horizontal scroll for bracket rounds
        const maxScrollLeft = this.bracketViewport.scrollWidth - this.bracketViewport.clientWidth;
        console.log('Slider moved to:', sliderValue);
        console.log('scrollWidth:', this.bracketViewport.scrollWidth);
        console.log('clientWidth:', this.bracketViewport.clientWidth);
        console.log('maxScrollLeft:', maxScrollLeft);
        console.log('Setting scrollLeft to:', maxScrollLeft * (sliderValue / 100));
        this.bracketViewport.scrollLeft = maxScrollLeft * (sliderValue / 100);
    }

    syncSliderWithScroll() {
        if (!this.bracketSlider || !this.bracketViewport) return;

        // Sync with horizontal scroll
        const maxScrollLeft = this.bracketViewport.scrollWidth - this.bracketViewport.clientWidth;
        if (maxScrollLeft > 0) {
            const scrollPercent = (this.bracketViewport.scrollLeft / maxScrollLeft) * 100;
            this.bracketSlider.value = scrollPercent;
        }
    }

    updateSliderRange() {
        if (!this.bracketSlider || !this.bracketViewport) return;

        // Update slider range based on content width (horizontal scroll)
        setTimeout(() => {
            const maxScrollLeft = this.bracketViewport.scrollWidth - this.bracketViewport.clientWidth;

            if (maxScrollLeft <= 0) {
                // Content fits in viewport, disable slider
                this.bracketSlider.style.opacity = '0.3';
                this.bracketSlider.disabled = true;
            } else {
                // Content is wider than viewport, enable slider
                this.bracketSlider.style.opacity = '1';
                this.bracketSlider.disabled = false;
            }
        }, 100);
    }

    initBracketAutoScroll() {
        // Periodically check and ensure current match is visible
        setInterval(() => {
            if (this.tournamentStarted && !this.tournament.isComplete()) {
                const currentMatchElement = this.bracketDisplay?.querySelector('.bracket-match.current');
                if (currentMatchElement) {
                    // Check if current match is visible in viewport
                    const bracketRect = this.bracketViewport?.getBoundingClientRect();
                    const matchRect = currentMatchElement.getBoundingClientRect();

                    if (bracketRect && matchRect) {
                        const isVisible = (matchRect.top >= bracketRect.top) &&
                                        (matchRect.bottom <= bracketRect.bottom);

                        if (!isVisible) {
                            console.log('Current match not visible, auto-scrolling...');
                            this.scrollToCurrentMatch();
                        }
                    }
                }
            }
        }, 3000); // Check every 3 seconds
    }

    initBracketAccordion() {
        const bracketToggle = document.getElementById('bracket-toggle');
        const bracketContent = document.getElementById('bracket-content');

        if (bracketToggle && bracketContent) {
            // Set initial collapsed state
            bracketContent.classList.remove('expanded');
            bracketToggle.classList.remove('expanded');

            bracketToggle.addEventListener('click', (e) => {
                // Prevent clicking on zoom controls from triggering accordion
                if (e.target.closest('.bracket-zoom-controls')) {
                    return;
                }

                const isExpanded = bracketContent.classList.contains('expanded');

                if (isExpanded) {
                    bracketContent.classList.remove('expanded');
                    bracketToggle.classList.remove('expanded');
                } else {
                    bracketContent.classList.add('expanded');
                    bracketToggle.classList.add('expanded');
                }
            });
        }
    }

    scrollToCurrentMatch() {
        if (!this.bracketViewport || !this.bracketDisplay) {
            console.log('Bracket viewport or display not found');
            return;
        }

        // Find the current match element
        const currentMatchElement = this.bracketDisplay.querySelector('.bracket-match.current');
        if (!currentMatchElement) {
            console.log('No current match element found');
            // Try to scroll to the first round if no current match
            const firstRound = this.bracketDisplay.querySelector('.bracket-round');
            if (firstRound) {
                const targetScrollTop = firstRound.offsetTop - (this.bracketViewport.clientHeight / 4);
                this.bracketViewport.scrollTo({
                    top: Math.max(0, targetScrollTop),
                    behavior: 'smooth'
                });
            }
            return;
        }

        console.log('Found current match element, scrolling to it');

        // Get the current round container (parent of the match)
        const currentRound = currentMatchElement.closest('.bracket-round');
        if (!currentRound) {
            console.log('No current round found');
            return;
        }

        // Wait a bit more to ensure layout is stable
        setTimeout(() => {
            // Get the round's position relative to the scrollable content
            const roundOffsetTop = currentRound.offsetTop;
            const viewportHeight = this.bracketViewport.clientHeight;
            const targetScrollTop = Math.max(0, roundOffsetTop - (viewportHeight / 3));

            console.log('Scrolling to round at position:', targetScrollTop);

            // Smoothly scroll to the current round
            this.bracketViewport.scrollTo({
                top: targetScrollTop,
                behavior: 'smooth'
            });

            // Update the slider to match the new scroll position
            setTimeout(() => {
                if (this.syncSliderWithScroll) {
                    this.syncSliderWithScroll();
                }
            }, 600);
        }, 50);
    }

    initBracketOverlay() {
        const bracketModeBtn = document.getElementById('bracket-mode');
        const bracketOverlay = document.getElementById('bracket-overlay');
        const closeBracketBtn = document.getElementById('close-bracket');
        const overlayBackground = document.querySelector('.bracket-overlay-background');

        // Overlay zoom state
        this.overlayZoom = 1.6; // Start at 160% actual zoom (displays as 100%, minimum)

        // Get overlay control elements
        this.overlayBracketDisplay = document.getElementById('overlay-bracket-display');
        this.overlayViewport = document.querySelector('#bracket-overlay .bracket-viewport');
        this.overlayZoomIn = document.getElementById('overlay-zoom-in');
        this.overlayZoomOut = document.getElementById('overlay-zoom-out');
        this.overlayZoomLevel = document.getElementById('overlay-zoom-level');
        this.overlaySlider = document.getElementById('overlay-bracket-slider');

        if (bracketModeBtn) {
            bracketModeBtn.addEventListener('click', () => {
                this.showBracketOverlay();
            });
        }

        if (closeBracketBtn) {
            closeBracketBtn.addEventListener('click', () => {
                this.hideBracketOverlay();
            });
        }

        if (overlayBackground) {
            overlayBackground.addEventListener('click', () => {
                this.hideBracketOverlay();
            });
        }

        // Setup overlay zoom controls
        if (this.overlayZoomIn) {
            this.overlayZoomIn.addEventListener('click', () => {
                if (this.overlayZoom < 3.0) {
                    this.overlayZoom = Math.min(3.0, this.overlayZoom + 0.1);
                    this.updateOverlayTransform();

                    // Enable zoom out button when zooming in from minimum (1.6)
                    if (this.overlayZoom > 1.6 && this.overlayZoomOut) {
                        this.overlayZoomOut.disabled = false;
                        this.overlayZoomOut.style.opacity = '1';
                        this.overlayZoomOut.style.cursor = 'pointer';
                    }
                }
            });
        }

        if (this.overlayZoomOut) {
            this.overlayZoomOut.addEventListener('click', () => {
                if (this.overlayZoom > 1.6) {
                    this.overlayZoom = Math.max(1.6, this.overlayZoom - 0.1);
                    this.updateOverlayTransform();

                    // Disable zoom out button if at minimum (1.6 = 100%)
                    if (this.overlayZoom <= 1.6 && this.overlayZoomOut) {
                        this.overlayZoomOut.disabled = true;
                        this.overlayZoomOut.style.opacity = '0.5';
                        this.overlayZoomOut.style.cursor = 'not-allowed';
                    }
                }
            });
        }

        // Initialize overlay zoom out button as disabled (at minimum)
        if (this.overlayZoomOut && this.overlayZoom <= 1.6) {
            this.overlayZoomOut.disabled = true;
            this.overlayZoomOut.style.opacity = '0.5';
            this.overlayZoomOut.style.cursor = 'not-allowed';
        }

        // Setup overlay slider
        if (this.overlaySlider && this.overlayViewport) {
            this.overlaySlider.addEventListener('input', (e) => {
                const maxScrollLeft = this.overlayViewport.scrollWidth - this.overlayViewport.clientWidth;
                this.overlayViewport.scrollLeft = maxScrollLeft * (e.target.value / 100);
            });

            // Sync slider with viewport scroll
            this.overlayViewport.addEventListener('scroll', () => {
                const maxScrollLeft = this.overlayViewport.scrollWidth - this.overlayViewport.clientWidth;
                if (maxScrollLeft > 0) {
                    const scrollPercent = (this.overlayViewport.scrollLeft / maxScrollLeft) * 100;
                    this.overlaySlider.value = scrollPercent;
                }
            });
        }

        // Mouse wheel zoom in overlay viewport
        if (this.overlayViewport) {
            this.overlayViewport.addEventListener('wheel', (e) => {
                if (e.ctrlKey) {
                    e.preventDefault();
                    if (e.deltaY < 0) {
                        // Zoom in
                        if (this.overlayZoom < 3.0) {
                            this.overlayZoom = Math.min(3.0, this.overlayZoom + 0.1);
                            this.updateOverlayTransform();

                            // Enable zoom out button when zooming in from minimum
                            if (this.overlayZoom > 1.6 && this.overlayZoomOut) {
                                this.overlayZoomOut.disabled = false;
                                this.overlayZoomOut.style.opacity = '1';
                                this.overlayZoomOut.style.cursor = 'pointer';
                            }
                        }
                    } else {
                        // Zoom out
                        if (this.overlayZoom > 1.6) {
                            this.overlayZoom = Math.max(1.6, this.overlayZoom - 0.1);
                            this.updateOverlayTransform();

                            // Disable zoom out button if at minimum
                            if (this.overlayZoom <= 1.6 && this.overlayZoomOut) {
                                this.overlayZoomOut.disabled = true;
                                this.overlayZoomOut.style.opacity = '0.5';
                                this.overlayZoomOut.style.cursor = 'not-allowed';
                            }
                        }
                    }
                }
            });
        }
    }

    updateOverlayTransform() {
        if (this.overlayBracketDisplay && this.overlayViewport) {
            // Scale: 1.0 = 90% of 48% = 43.2% of original
            const actualScale = this.overlayZoom * 0.432;

            // Clear any previous constraints
            this.overlayBracketDisplay.style.width = '';
            this.overlayBracketDisplay.style.height = '';

            // Apply zoom CSS property
            this.overlayBracketDisplay.style.zoom = actualScale;
            this.overlayBracketDisplay.style.transform = '';
            this.overlayBracketDisplay.style.transformOrigin = '';
        }

        if (this.overlayZoomLevel) {
            // Display zoom: 1.6 = 100% (minimum), scales up from there
            const displayZoom = (this.overlayZoom / 1.6) * 100;
            this.overlayZoomLevel.textContent = `${Math.round(displayZoom)}%`;
        }
    }

    showBracketOverlay() {
        const bracketOverlay = document.getElementById('bracket-overlay');

        if (bracketOverlay) {
            bracketOverlay.classList.remove('hidden');

            // Copy the bracket content to the overlay
            if (this.overlayBracketDisplay && this.bracketDisplay) {
                this.overlayBracketDisplay.innerHTML = this.bracketDisplay.innerHTML;
            }

            // Apply initial zoom
            this.updateOverlayTransform();

            // Reset scroll position to top-left
            if (this.overlayViewport) {
                this.overlayViewport.scrollTop = 0;
                this.overlayViewport.scrollLeft = 0;
            }

            // Reset slider to beginning
            if (this.overlaySlider) {
                this.overlaySlider.value = 0;
            }

            // Debug scroll dimensions after overlay opens
            setTimeout(() => {
                console.log('=== OVERLAY VIEWPORT DEBUG ===');
                console.log('Overlay viewport:', this.overlayViewport);
                console.log('Viewport clientWidth:', this.overlayViewport?.clientWidth);
                console.log('Viewport clientHeight:', this.overlayViewport?.clientHeight);
                console.log('Viewport scrollWidth:', this.overlayViewport?.scrollWidth);
                console.log('Viewport scrollHeight:', this.overlayViewport?.scrollHeight);
                console.log('Display offsetWidth:', this.overlayBracketDisplay?.offsetWidth);
                console.log('Display offsetHeight:', this.overlayBracketDisplay?.offsetHeight);
                if (this.overlayViewport) {
                    console.log('Viewport overflow-x:', getComputedStyle(this.overlayViewport).overflowX);
                    console.log('Viewport overflow-y:', getComputedStyle(this.overlayViewport).overflowY);
                    console.log('Can scroll horizontally:', this.overlayViewport.scrollWidth > this.overlayViewport.clientWidth);
                    console.log('Can scroll vertically:', this.overlayViewport.scrollHeight > this.overlayViewport.clientHeight);
                }
            }, 300);
        }
    }

    hideBracketOverlay() {
        const bracketOverlay = document.getElementById('bracket-overlay');
        if (bracketOverlay) {
            bracketOverlay.classList.add('hidden');
        }
    }

    // ============================================
    // EMOJI REACTION SYSTEM
    // ============================================

    startEmojiReactions() {
        // Calculate spawn rate based on tournament progress
        this.updateEmojiSpawnRate();

        // Clear any existing interval
        if (this.emojiSpawnInterval) {
            clearInterval(this.emojiSpawnInterval);
        }

        // Start spawning emojis
        this.emojiSpawnInterval = setInterval(() => {
            this.spawnRandomEmoji();
        }, this.emojiSpawnRate);
    }

    stopEmojiReactions() {
        if (this.emojiSpawnInterval) {
            clearInterval(this.emojiSpawnInterval);
            this.emojiSpawnInterval = null;
        }
    }

    updateEmojiSpawnRate() {
        // Calculate rate based on tournament round (1-8)
        const totalRounds = 8;
        const currentRound = this.tournament.currentRound;

        // Linear interpolation: Round 1 = 1000ms (1/sec), Round 8 = 100ms (10/sec)
        // Formula: 1000 - (currentRound / totalRounds) * 900
        const minRate = 1000; // 1 per second
        const maxRate = 100;  // 10 per second
        const progress = (currentRound - 1) / (totalRounds - 1);
        this.emojiSpawnRate = Math.max(maxRate, minRate - (progress * (minRate - maxRate)));
    }

    spawnRandomEmoji() {
        const emoji = this.emojiPool[Math.floor(Math.random() * this.emojiPool.length)];
        const side = Math.random() < 0.5 ? 'left' : 'right';
        this.spawnEmoji(emoji, side);
    }

    spawnEmoji(emoji, side = null) {
        // Default to random side if not specified
        if (!side) {
            side = Math.random() < 0.5 ? 'left' : 'right';
        }

        const emojiEl = document.createElement('div');
        emojiEl.className = 'floating-emoji';
        emojiEl.textContent = emoji;

        // Random positioning with padding
        const padding = 20; // px from edge
        const staggerX = Math.random() * 60; // 0-60px horizontal stagger
        const staggerY = Math.random() * 40; // 0-40px vertical stagger

        if (side === 'left') {
            emojiEl.style.left = `${padding + staggerX}px`;
        } else {
            emojiEl.style.right = `${padding + staggerX}px`;
        }

        emojiEl.style.bottom = `${-20 + staggerY}px`; // Start slightly below screen

        // Random animation duration (5-8 seconds)
        const duration = 5 + Math.random() * 3;
        emojiEl.style.animationDuration = `${duration}s`;

        // Add to viewport
        this.arenaViewport.appendChild(emojiEl);

        // Remove after animation completes
        setTimeout(() => {
            if (emojiEl.parentNode) {
                emojiEl.remove();
            }
        }, duration * 1000);
    }

    initEmojiButtons() {
        const emojiButtons = document.querySelectorAll('.emoji-btn');
        emojiButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const emoji = btn.dataset.emoji || btn.textContent.trim();
                this.spawnEmoji(emoji);
            });
        });
    }
}


/* Optimized for performance - removed cache busters */
