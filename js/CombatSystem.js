import { GAME_CONFIG, CHARACTER_CONFIG } from './constants.js';

/**
 * CombatSystem - Handles turn-based combat mechanics
 */
export class CombatSystem {
    constructor(tournament, leftFighter, rightFighter, leftFighterNameEl, rightFighterNameEl, battleStatus) {
        this.tournament = tournament;
        this.leftFighter = leftFighter;
        this.rightFighter = rightFighter;
        this.leftFighterNameEl = leftFighterNameEl;
        this.rightFighterNameEl = rightFighterNameEl;
        this.battleStatus = battleStatus;

        // Combat state
        this.leftFighterHP = 5;
        this.rightFighterHP = 5;
        this.combatLog = [];
        this.currentTurn = 'left';
        this.leftDefenseStance = null;
        this.rightDefenseStance = null;
        this.combatRound = 1;
        this.combatEnded = false;

        // HP bars
        this.leftHPFill = document.getElementById('left-hp-fill');
        this.rightHPFill = document.getElementById('right-hp-fill');
        this.leftHPText = document.getElementById('left-hp-text');
        this.rightHPText = document.getElementById('right-hp-text');

        // Seeded RNG
        this.seed = 12345;
        this.rng = null;

        // Callbacks
        this.onCombatEnd = null;
        this.onCombatMessage = null;

        // Sound effect paths
        this.hitSoundPaths = [
            '/sfx/fighting_game_hit_fl-1759992821197.mp3',
            '/sfx/fighting_game_hit_fl_1-1759992838415.mp3'
        ];
        // Parry sounds - use sword strike on metal for clang sound
        this.parrySoundPaths = [
            '/sfx/sword_strike_on_meta_1-1759991794457.mp3',
            '/sfx/sword_strike_on_meta_2-1759991788146.mp3',
            '/sfx/sword_strike_on_meta-1759991794456.mp3'
        ];
        // Block sounds - load all available sword strike variations
        this.blockSoundPaths = [
            '/sfx/sword_strike_on_meta_1-1759991794457.mp3',
            '/sfx/sword_strike_on_meta_1-1759992443256.mp3',
            '/sfx/sword_strike_on_meta_1-1759992520369.mp3',
            '/sfx/sword_strike_on_meta_2-1759991788146.mp3',
            '/sfx/sword_strike_on_meta_2-1759992443258.mp3',
            '/sfx/sword_strike_on_meta_3-1759992443259.mp3',
            '/sfx/sword_strike_on_meta-1759991794456.mp3',
            '/sfx/sword_strike_on_meta-1759992449662.mp3',
            '/sfx/sword_strike_on_meta-1759992514238.mp3'
        ];
        this.criticalSoundPath = '/sfx/Critical!_fighter_ga-1760028020390.mp3'; // ! is safe in URLs

        // Attack voice sound paths (1, 2, 4, 5 for normal attacks)
        this.normalAttackVoicePaths = [
            '/sfx/Voice_1.mp3',
            '/sfx/Voice_2.mp3',
            '/sfx/Voice_4.mp3',
            '/sfx/Voice_5.mp3'
        ];

        // Critical attack voice paths (3 and 6 for criticals only)
        this.criticalAttackVoicePaths = [
            '/sfx/Voice_3.mp3',
            '/sfx/Voice_6.mp3'
        ];

        // Mute state
        this.muted = false;

        // Store full fighter names (not truncated) for proper skin lookups
        this.leftFighterFullName = null;
        this.rightFighterFullName = null;
    }

    /**
     * Set mute state for sound effects
     */
    setMuted(muted) {
        this.muted = muted;
    }

    /**
     * Get full fighter names from tournament
     */
    initializeFighterNames() {
        const match = this.tournament.getCurrentMatch();
        if (!match) return;

        const displayOrder = this.tournament.getDisplayOrder();
        if (!displayOrder) return;

        // Store FULL names (not truncated) for proper character skin lookups
        this.leftFighterFullName = displayOrder.leftFighter;
        this.rightFighterFullName = displayOrder.rightFighter;
    }

    /**
     * Generate seed based on fighter names for reproducible battles
     */
    generateSeed() {
        const match = this.tournament.getCurrentMatch();
        if (!match) return 12345;

        let seed = 0;
        const combined = match.participant1 + match.participant2;
        for (let i = 0; i < combined.length; i++) {
            seed = ((seed << 5) - seed + combined.charCodeAt(i)) & 0xffffffff;
        }
        return Math.abs(seed) || 12345;
    }

    /**
     * Create seeded RNG function
     */
    createSeededRNG(seed) {
        let current = seed;
        return function() {
            current = (current * 16807) % 2147483647;
            return (current - 1) / 2147483646;
        };
    }

    /**
     * Roll a die with specified sides
     */
    rollDie(sides) {
        return Math.floor(this.rng() * sides) + 1;
    }

    /**
     * Get max HP for current tournament round
     */
    getMaxHPForRound() {
        const roundInfo = this.tournament.getRoundInfo();
        const currentRound = roundInfo.current;
        return GAME_CONFIG.HP_BY_ROUND[currentRound] || 5;
    }

    /**
     * Initialize HP bars
     */
    initializeHPBars() {
        const maxHP = this.getMaxHPForRound();
        this.leftFighterHP = maxHP;
        this.rightFighterHP = maxHP;
        this.updateHPBars();
    }

    /**
     * Update HP bar displays
     */
    updateHPBars() {
        const maxHP = this.getMaxHPForRound();

        // Update left HP bar
        if (this.leftHPFill && this.leftHPText) {
            const leftPercentage = (this.leftFighterHP / maxHP) * 100;
            this.leftHPFill.style.width = `${Math.max(0, leftPercentage)}%`;
            this.leftHPText.textContent = `${Math.max(0, this.leftFighterHP)}/${maxHP}`;
        }

        // Update right HP bar
        if (this.rightHPFill && this.rightHPText) {
            const rightPercentage = (this.rightFighterHP / maxHP) * 100;
            this.rightHPFill.style.width = `${Math.max(0, rightPercentage)}%`;
            this.rightHPText.textContent = `${Math.max(0, this.rightFighterHP)}/${maxHP}`;
        }
    }

    /**
     * Initialize health displays
     */
    initHealthDisplays() {
        // Remove existing health displays
        const leftNameplate = document.querySelector('.left-nameplate');
        if (leftNameplate) {
            leftNameplate.querySelectorAll('.fighter-health').forEach(el => el.remove());
        }

        const maxHP = this.getMaxHPForRound();
        this.createHealthDisplay(this.leftFighter, maxHP);

        // Reset combat state
        this.leftFighterHP = maxHP;
        this.rightFighterHP = maxHP;
        this.combatLog = [];
        this.currentTurn = 'left';
        this.leftDefenseStance = null;
        this.rightDefenseStance = null;
        this.combatRound = 1;
        this.combatEnded = false;

        // Reset seed for this fight
        this.seed = this.generateSeed();
        this.rng = this.createSeededRNG(this.seed);
    }

    /**
     * Create health diamond display
     */
    createHealthDisplay(fighter, maxHP) {
        const healthContainer = document.createElement('div');
        healthContainer.className = 'fighter-health';

        for (let i = 0; i < maxHP; i++) {
            const diamond = document.createElement('div');
            diamond.className = 'health-diamond';
            healthContainer.appendChild(diamond);
        }

        const isLeftFighter = fighter.classList.contains('fighter-left');
        if (isLeftFighter) {
            const nameplate = document.querySelector('.left-nameplate');
            if (nameplate) {
                nameplate.appendChild(healthContainer);
            }
        }
    }

    /**
     * Update health diamond display
     */
    updateHealthDisplay(fighter, currentHP) {
        const isLeftFighter = fighter.classList.contains('fighter-left');
        if (!isLeftFighter) return;

        const nameplate = document.querySelector('.left-nameplate');
        if (!nameplate) return;

        const healthContainer = nameplate.querySelector('.fighter-health');
        if (!healthContainer) return;

        const diamonds = healthContainer.querySelectorAll('.health-diamond');
        diamonds.forEach((diamond, index) => {
            if (index < currentHP) {
                diamond.classList.remove('health-lost');
            } else {
                diamond.classList.add('health-lost');
            }
        });
    }

    /**
     * Start combat
     */
    startCombat() {
        this.initializeFighterNames(); // Get full names from tournament first!
        this.initHealthDisplays();
        this.initializeHPBars();

        setTimeout(() => this.executeCombatBeat(), 1000);
    }

    /**
     * Execute one combat turn
     */
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

        // Play attack voice when attacker starts their attack
        this.playAttackVoice(isCrit, attackerName);

        this.addCombatAnimation(attackerFighter, 'fighter-attacking');
        if (isCrit) {
            this.addCombatAnimation(attackerFighter, 'fighter-crit-attack');
        }

        // Show attack text immediately (except for misses)
        if (attackRoll !== 6) {
            this.showAttackerDamage(attackerFighter, attackRoll, isCrit);
        }

        setTimeout(() => {
            if (attackRoll === 6) {
                // Miss!
                this.handleMiss(attackerFighter, attackerName);
            } else {
                // Check defender stance
                const defenderStance = defender === 'left' ? this.leftDefenseStance : this.rightDefenseStance;

                if (defenderStance === 'block') {
                    this.addCombatAnimation(defenderFighter, 'fighter-defending');
                    this.handleBlock(defenderFighter, defenderName, attackRoll, isCrit, defender);
                    if (defender === 'left') {
                        this.leftDefenseStance = null;
                    } else {
                        this.rightDefenseStance = null;
                    }
                } else if (defenderStance === 'parry') {
                    this.addCombatAnimation(defenderFighter, 'fighter-defending');
                    this.handleParry(attackerFighter, defenderFighter, attackerName, defenderName, attackRoll, isCrit);
                    if (defender === 'left') {
                        this.leftDefenseStance = null;
                    } else {
                        this.rightDefenseStance = null;
                    }
                } else {
                    // Normal damage resolution
                    const defendRoll = this.rollDie(7) + 1; // 2-8
                    this.addCombatAnimation(defenderFighter, 'fighter-defending');

                    if (defendRoll === 7) {
                        // Random block
                        this.handleBlock(defenderFighter, defenderName, attackRoll, isCrit, defender);
                        if (defender === 'left') {
                            this.leftDefenseStance = 'block';
                        } else {
                            this.rightDefenseStance = 'block';
                        }
                        this.sendCombatMessage(`🛡️ ${defenderName} prepares to block the next attack!`);
                    } else if (defendRoll === 8) {
                        // Random parry
                        this.handleParry(attackerFighter, defenderFighter, attackerName, defenderName, attackRoll, isCrit);
                        if (defender === 'left') {
                            this.leftDefenseStance = 'parry';
                        } else {
                            this.rightDefenseStance = 'parry';
                        }
                        this.sendCombatMessage(`⚔️ ${defenderName} prepares to parry the next attack!`);
                    } else {
                        // Hit lands!
                        const damage = isCrit ? GAME_CONFIG.DAMAGE.CRITICAL : attackRoll;
                        this.handleHit(defenderFighter, defenderName, damage, defender, isCrit);
                    }
                }
            }
        }, 200);
    }

    /**
     * Handle miss
     */
    handleMiss(attackerFighter, attackerName) {
        this.addCombatAnimation(attackerFighter, 'fighter-miss');
        this.showCombatText(attackerFighter, 'MISS!', 'miss-text');

        const logEntry = `${attackerName} attacks but misses!`;
        this.addCombatLog(logEntry);
        this.sendCombatMessage(`⚔️ ${attackerName} swings and misses!`);

        this.nextTurn();
    }

    /**
     * Handle block
     */
    handleBlock(defenderFighter, defenderName, damage, isCrit, defenderSide) {
        console.log('🛡️ handleBlock() called - should play block sound');
        this.addCombatAnimation(defenderFighter, 'fighter-block');
        this.showCombatText(defenderFighter, 'BLOCK!', 'block-text');
        this.showBlockEffect(defenderFighter);
        this.playBlockSound();

        if (isCrit) {
            // Play critical sound for blocked crits
            this.playCriticalSound();

            // Critical hits deal 3 damage even when blocked
            const critBlockDamage = 3;

            setTimeout(() => {
                this.showDamageNumber(defenderFighter, critBlockDamage, false);

                if (defenderSide === 'left') {
                    this.leftFighterHP -= critBlockDamage;
                    this.updateHealthDisplay(this.leftFighter, this.leftFighterHP);
                } else {
                    this.rightFighterHP -= critBlockDamage;
                }
                this.updateHPBars();

                const logEntry = `${defenderName} blocks the CRIT but takes ${critBlockDamage} damage!`;
                this.addCombatLog(logEntry);
                this.sendCombatMessage(`🛡️ ${defenderName} blocks the CRIT but takes ${critBlockDamage} damage!`);

                if (this.leftFighterHP <= 0 || this.rightFighterHP <= 0) {
                    this.endCombat();
                } else {
                    this.nextTurn();
                }
            }, 400);
        } else {
            // Normal block - no damage
            const damageText = damage.toString();
            const logEntry = `${defenderName} blocks ${damageText} damage!`;
            this.addCombatLog(logEntry);
            this.sendCombatMessage(`🛡️ ${defenderName} blocks ${damageText} damage!`);
            this.nextTurn();
        }
    }

    /**
     * Handle parry (reflect damage)
     */
    handleParry(attackerFighter, defenderFighter, attackerName, defenderName, damage, isCrit) {
        console.log('⚔️ handleParry() called - should play parry sound');

        // Step 1: Attack animation already happened in executeCombatBeat

        // Step 2: Show parry animation (after 400ms delay)
        setTimeout(() => {
            this.addCombatAnimation(defenderFighter, 'fighter-parry');
            this.showCombatText(defenderFighter, 'PARRY!', 'parry-text');
            this.showParryEffect(defenderFighter);
            this.playParrySound();
        }, 400);

        // Step 3: Show damage reflection (after 800ms total delay)
        setTimeout(() => {
            this.addCombatAnimation(attackerFighter, 'fighter-hit');
            if (isCrit) {
                this.showCriticalScreenFlash();
            }
            this.showDamageNumber(attackerFighter, damage, isCrit);
            this.showSlashEffect(attackerFighter);
            this.playHitSound(); // Play hit sound when parry damage reflects

            const attackerSide = attackerFighter === this.leftFighter ? 'left' : 'right';
            if (attackerSide === 'left') {
                this.leftFighterHP -= damage;
                this.updateHealthDisplay(this.leftFighter, this.leftFighterHP);
            } else {
                this.rightFighterHP -= damage;
            }
            this.updateHPBars();

            const damageText = isCrit ? 'CRIT' : damage.toString();
            const logEntry = `${defenderName} parries and reflects ${damageText} damage back to ${attackerName}!`;
            this.addCombatLog(logEntry);
            this.sendCombatMessage(`⚡ ${defenderName} parries and reflects ${damageText} damage back to ${attackerName}!`);

            if (this.leftFighterHP <= 0 || this.rightFighterHP <= 0) {
                this.endCombat();
            } else {
                this.nextTurn();
            }
        }, 800);
    }

    /**
     * Handle hit
     */
    handleHit(defenderFighter, defenderName, damage, defenderSide, isCrit) {
        console.log('💥 handleHit() called - should play hit sound, damage:', damage);
        const attackerFighter = defenderSide === 'left' ? this.rightFighter : this.leftFighter;
        const attackerName = defenderSide === 'left' ? this.rightFighterNameEl.textContent : this.leftFighterNameEl.textContent;

        setTimeout(() => {
            this.addCombatAnimation(defenderFighter, 'fighter-hit');
            if (isCrit) {
                this.addCombatAnimation(defenderFighter, 'fighter-crit-glow');
                this.showCriticalScreenFlash();
                this.playCriticalSound();
            }
            this.showDamageNumber(defenderFighter, damage, isCrit);
            this.showSlashEffect(defenderFighter);
            this.playHitSound();

            if (defenderSide === 'left') {
                this.leftFighterHP -= damage;
                this.updateHealthDisplay(this.leftFighter, this.leftFighterHP);
            } else {
                this.rightFighterHP -= damage;
            }
            this.updateHPBars();

            const damageText = isCrit ? 'CRIT' : damage.toString();
            const logEntry = `${attackerName} deals ${damageText} damage to ${defenderName}!`;
            this.addCombatLog(logEntry);
            this.sendCombatMessage(`💀 ${attackerName} deals ${damageText} damage to ${defenderName}!`);

            if (this.leftFighterHP <= 0 || this.rightFighterHP <= 0) {
                this.endCombat();
            } else {
                this.nextTurn();
            }
        }, 100);
    }

    /**
     * Move to next turn
     */
    nextTurn() {
        this.currentTurn = this.currentTurn === 'left' ? 'right' : 'left';

        setTimeout(() => {
            if (this.leftFighterHP > 0 && this.rightFighterHP > 0) {
                this.executeCombatBeat();
            }
        }, GAME_CONFIG.TIMING.TURN_DELAY);
    }

    /**
     * End combat
     */
    endCombat() {
        const leftWins = this.rightFighterHP <= 0;
        const winner = leftWins ? this.leftFighterNameEl.textContent : this.rightFighterNameEl.textContent;
        const loser = leftWins ? this.rightFighterNameEl.textContent : this.leftFighterNameEl.textContent;

        const logEntry = `${winner} defeats ${loser} with ${leftWins ? this.leftFighterHP : this.rightFighterHP} HP remaining!`;
        this.addCombatLog(logEntry);

        // Mark combat as ended so pose resets stop interfering with fade
        this.combatEnded = true;

        // After 0.5 second beat, fade out loser over 2 seconds using CSS animation on sprite
        const loserFighter = leftWins ? this.rightFighter : this.leftFighter;
        setTimeout(() => {
            console.log('🔍 Starting loser fade with CSS animation on sprite');

            // Apply animation to the sprite element to avoid transform conflicts
            const loserSprite = loserFighter.querySelector('.fighter-sprite');
            if (loserSprite) {
                loserSprite.style.animation = 'loser-fade-out 2s ease-out forwards';

                // Check opacity during animation
                setTimeout(() => {
                    console.log('🔍 Opacity at 200ms:', window.getComputedStyle(loserSprite).opacity);
                }, 200);
                setTimeout(() => {
                    console.log('🔍 Opacity at 500ms:', window.getComputedStyle(loserSprite).opacity);
                }, 500);
                setTimeout(() => {
                    console.log('🔍 Opacity at 1000ms:', window.getComputedStyle(loserSprite).opacity);
                }, 1000);
                setTimeout(() => {
                    console.log('🔍 Opacity at 2000ms (end):', window.getComputedStyle(loserSprite).opacity);
                }, 2000);
            }
        }, 500);

        // Call end callback immediately
        if (this.onCombatEnd) {
            this.onCombatEnd(leftWins);
        }
    }

    /**
     * Add combat animation class
     */
    addCombatAnimation(fighter, animationClass) {
        fighter.classList.add(animationClass);

        // Update fighter pose based on animation type
        if (window.arena && window.arena.updateFighterPose) {
            // Use FULL fighter name (not truncated) for proper skin lookups
            const fighterName = fighter === this.leftFighter ?
                this.leftFighterFullName :
                this.rightFighterFullName;

            // Set pose based on animation
            if (animationClass === 'fighter-attacking' || animationClass === 'fighter-parry') {
                window.arena.updateFighterPose(fighter, fighterName, 'attack');
            } else if (animationClass === 'fighter-defending' || animationClass === 'fighter-block') {
                window.arena.updateFighterPose(fighter, fighterName, 'defense');
            }
        }

        setTimeout(() => {
            fighter.classList.remove(animationClass);

            // Reset to ready pose after animation (but not if combat has ended - don't interfere with fade)
            if (!this.combatEnded && window.arena && window.arena.updateFighterPose) {
                // Use FULL fighter name (not truncated) for proper skin lookups
                const fighterName = fighter === this.leftFighter ?
                    this.leftFighterFullName :
                    this.rightFighterFullName;
                window.arena.updateFighterPose(fighter, fighterName, 'ready');
            }
        }, 400);
    }

    /**
     * Show damage number
     */
    showDamageNumber(fighter, damage, isCrit = false) {
        const damageEl = document.createElement('div');
        damageEl.className = isCrit ? 'crit-number' : 'damage-number';
        damageEl.textContent = isCrit ? 'CRITICAL' : `-${damage}`;
        fighter.appendChild(damageEl);

        const duration = isCrit ? 2500 : 2000;
        setTimeout(() => damageEl.remove(), duration);
    }

    /**
     * Show attacker damage text
     */
    showAttackerDamage(fighter, damage, isCrit = false) {
        const damageEl = document.createElement('div');
        damageEl.className = isCrit ? 'attacker-crit-number' : 'attacker-damage-number';
        damageEl.textContent = isCrit ? 'CRITICAL' : `Attack +${damage}`;
        fighter.appendChild(damageEl);

        const duration = isCrit ? 1500 : 1200;
        setTimeout(() => damageEl.remove(), duration);
    }

    /**
     * Show combat text (BLOCK, PARRY, etc.)
     */
    showCombatText(fighter, text, className) {
        const textEl = document.createElement('div');
        textEl.className = className;
        textEl.textContent = text;
        fighter.appendChild(textEl);

        setTimeout(() => textEl.remove(), 1200);
    }

    /**
     * Show block visual effect
     */
    showBlockEffect(fighter) {
        const blockImg = document.createElement('img');
        blockImg.src = '/images/effects/block.png';
        blockImg.className = 'block-effect';

        // Shield orientation - block.png naturally faces RIGHT (toward center)
        // - LEFT fighter: NO flip needed (already facing center correctly)
        // - RIGHT fighter: FLIP to face center (faces wrong way by default)
        const isLeftFighter = fighter.classList.contains('fighter-left');
        const flipTransform = isLeftFighter ? 'scaleX(1)' : 'scaleX(-1)';

        blockImg.style.cssText = `
            position: absolute;
            width: auto;
            height: 120px;
            max-width: 150px;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) ${flipTransform} !important;
            z-index: 10;
            opacity: 0;
            object-fit: contain;
            filter: drop-shadow(0 0 10px rgba(255, 255, 255, 0.8)) drop-shadow(0 0 20px rgba(255, 215, 0, 0.6));
            pointer-events: none;
            animation: blockEffectFade 0.8s ease-out forwards;
        `;

        fighter.appendChild(blockImg);

        setTimeout(() => blockImg.remove(), 800);
    }

    /**
     * Show slash visual effect (for damage)
     */
    showSlashEffect(fighter) {
        const slashImg = document.createElement('img');
        slashImg.src = '/images/effects/slash.png';
        slashImg.className = 'slash-effect';

        // Random angle between -15 and 15 degrees
        const randomAngle = (Math.random() * 30) - 15;

        // Slash orientation - match the block icon pattern for proper direction
        // - LEFT fighter: FLIP (scaleX(-1))
        // - RIGHT fighter: NO flip (scaleX(1))
        const isLeftFighter = fighter.classList.contains('fighter-left');
        const flipTransform = isLeftFighter ? 'scaleX(-1)' : 'scaleX(1)';

        slashImg.style.cssText = `
            position: absolute;
            width: 150px;
            height: 150px;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(${randomAngle}deg) ${flipTransform} !important;
            z-index: 15;
            opacity: 0;
            filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.9)) drop-shadow(0 0 15px rgba(255, 215, 0, 0.7));
            pointer-events: none;
            animation: slashEffectSwipe 0.4s ease-out forwards;
        `;

        fighter.appendChild(slashImg);

        setTimeout(() => slashImg.remove(), 400);
    }

    /**
     * Show parry visual effect (sparks)
     */
    showParryEffect(fighter) {
        const sparkImg = document.createElement('img');
        sparkImg.src = '/images/effects/spark.png';
        sparkImg.className = 'parry-effect';

        // Spark.png is facing left, so we need to flip it for right fighter
        // Position adjusted: move closer to center (15px towards middle) and up 15px
        const isLeftFighter = fighter.classList.contains('fighter-left');
        const flipTransform = isLeftFighter ? 'scaleX(-1)' : 'scaleX(1)';
        const horizontalOffset = isLeftFighter ? 'calc(50% + 15px)' : 'calc(50% - 15px)';

        sparkImg.style.cssText = `
            position: absolute;
            width: 140px;
            height: 140px;
            top: calc(50% - 15px);
            left: ${horizontalOffset};
            transform: translate(-50%, -50%) ${flipTransform};
            z-index: 20;
            opacity: 0;
            filter: drop-shadow(0 0 12px rgba(255, 255, 255, 1)) drop-shadow(0 0 24px rgba(255, 215, 0, 0.8));
            pointer-events: none;
            animation: parryEffectBurst 0.6s ease-out forwards;
        `;

        fighter.appendChild(sparkImg);

        setTimeout(() => sparkImg.remove(), 600);
    }

    /**
     * Show critical hit screen flash
     */
    showCriticalScreenFlash() {
        const arenaViewport = document.querySelector('.arena-viewport');
        if (!arenaViewport) return;

        // Add screen shake to viewport
        arenaViewport.classList.add('crit-shake');
        setTimeout(() => arenaViewport.classList.remove('crit-shake'), 400);

        // Also shake live chat battlefield if it exists
        const chatBattlefield = document.querySelector('.chat-mode-battlefield-overlay');
        if (chatBattlefield) {
            chatBattlefield.classList.add('crit-shake');
            setTimeout(() => chatBattlefield.classList.remove('crit-shake'), 400);
        }

        const flashOverlay = document.createElement('div');
        flashOverlay.className = 'crit-screen-flash';
        flashOverlay.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: radial-gradient(circle, rgba(255, 0, 0, 0.4) 0%, rgba(255, 0, 0, 0.15) 50%, transparent 100%);
            z-index: 100;
            opacity: 0;
            pointer-events: none;
            animation: critScreenFlash 0.5s ease-out forwards;
        `;

        arenaViewport.appendChild(flashOverlay);

        setTimeout(() => flashOverlay.remove(), 500);
    }

    /**
     * Play a random hit sound (first second only)
     */
    playHitSound() {
        if (this.muted) {
            console.log('Hit sound muted');
            return;
        }

        console.log('🔊 Playing HIT sound');
        const randomIndex = Math.floor(Math.random() * this.hitSoundPaths.length);
        const soundPath = this.hitSoundPaths[randomIndex];

        // Create a fresh Audio instance using the path directly
        const sound = new Audio(soundPath);
        sound.volume = 0.5;

        sound.play().then(() => {
            console.log('✅ Hit sound playing');
        }).catch(err => {
            console.error('❌ Hit sound failed:', err);
        });

        // Stop after 1 second
        setTimeout(() => {
            sound.pause();
            sound.currentTime = 0;
        }, 1000);
    }

    /**
     * Play parry sound (first second only)
     */
    playParrySound() {
        if (this.muted) {
            console.log('Parry sound muted');
            return;
        }

        console.log('🔊 Playing PARRY sound');
        const randomIndex = Math.floor(Math.random() * this.parrySoundPaths.length);
        const soundPath = this.parrySoundPaths[randomIndex];

        // Create a fresh Audio instance using the path directly
        const sound = new Audio(soundPath);
        sound.volume = 0.5;

        sound.play().then(() => {
            console.log('✅ Parry sound playing');
        }).catch(err => {
            console.error('❌ Parry sound failed:', err);
        });

        // Stop after 1 second
        setTimeout(() => {
            sound.pause();
            sound.currentTime = 0;
        }, 1000);
    }

    /**
     * Play a random block sound (first second only)
     */
    playBlockSound() {
        if (this.muted) {
            console.log('Block sound muted');
            return;
        }

        console.log('🔊 Playing BLOCK sound');
        const randomIndex = Math.floor(Math.random() * this.blockSoundPaths.length);
        const soundPath = this.blockSoundPaths[randomIndex];

        // Create a fresh Audio instance using the path directly
        const sound = new Audio(soundPath);
        sound.volume = 0.5;

        sound.play().then(() => {
            console.log('✅ Block sound playing');
        }).catch(err => {
            console.error('❌ Block sound failed:', err);
        });

        // Stop after 1 second
        setTimeout(() => {
            sound.pause();
            sound.currentTime = 0;
        }, 1000);
    }

    /**
     * Play critical strike sound (first second only)
     */
    playCriticalSound() {
        if (this.muted) return;

        // Create a fresh Audio instance using the path directly
        const sound = new Audio(this.criticalSoundPath);
        sound.volume = 0.5;

        sound.play().catch(err => console.log('Critical sound play failed:', err));

        // Stop after 1 second
        setTimeout(() => {
            sound.pause();
            sound.currentTime = 0;
        }, 1000);
    }

    /**
     * Play attack voice sound (full duration)
     * @param {boolean} isCrit - Whether this is a critical attack
     * @param {string} attackerName - The TRUNCATED display name of the attacker
     */
    playAttackVoice(isCrit, attackerName) {
        if (this.muted) return;

        let soundPath;

        // Get the FULL name for proper character lookups (truncated display names won't match)
        const attackerSide = attackerName === this.leftFighterNameEl.textContent ? 'left' : 'right';
        const attackerFullName = attackerSide === 'left' ? this.leftFighterFullName : this.rightFighterFullName;

        // Check if attacker is female using FULL name
        const isFemale = CHARACTER_CONFIG.FEMALE_NAMES.includes(attackerFullName);

        if (isFemale) {
            // Use female attack sounds for female characters
            const randomIndex = Math.floor(Math.random() * CHARACTER_CONFIG.FEMALE_ATTACK_SOUNDS.length);
            soundPath = CHARACTER_CONFIG.FEMALE_ATTACK_SOUNDS[randomIndex];
        } else if (isCrit) {
            // Use voices 3 or 6 for criticals
            const randomIndex = Math.floor(Math.random() * this.criticalAttackVoicePaths.length);
            soundPath = this.criticalAttackVoicePaths[randomIndex];
        } else {
            // Use voices 1, 2, 4, 5 for normal attacks
            const randomIndex = Math.floor(Math.random() * this.normalAttackVoicePaths.length);
            soundPath = this.normalAttackVoicePaths[randomIndex];
        }

        // Create a fresh Audio instance using the path directly
        const sound = new Audio(soundPath);
        sound.volume = 0.5;

        sound.play().catch(err => console.log('Attack voice play failed:', err));
        // Play full sound - no timeout to stop it
    }

    /**
     * Add to combat log
     */
    addCombatLog(entry) {
        this.combatLog.push(`Beat ${this.combatLog.length + 1}: ${entry}`);
    }

    /**
     * Send combat message via callback
     */
    sendCombatMessage(message) {
        if (this.onCombatMessage) {
            this.onCombatMessage(message);
        }
    }

    /**
     * Clean up combat elements
     */
    cleanupCombatElements() {
        // Remove health displays
        const leftNameplate = document.querySelector('.left-nameplate');
        if (leftNameplate) {
            leftNameplate.querySelectorAll('.fighter-health').forEach(el => el.remove());
        }

        // Remove damage numbers and combat text
        if (this.leftFighter) {
            this.leftFighter.querySelectorAll('.damage-number, .block-text, .parry-text, .miss-text').forEach(el => el.remove());
        }
        if (this.rightFighter) {
            this.rightFighter.querySelectorAll('.damage-number, .block-text, .parry-text, .miss-text').forEach(el => el.remove());
        }
    }
}
