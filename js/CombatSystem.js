import { GAME_CONFIG } from './constants.js';

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
                    setTimeout(() => {
                        this.handleBlock(defenderFighter, defenderName, attackRoll, isCrit, defender);
                        if (defender === 'left') {
                            this.leftDefenseStance = null;
                        } else {
                            this.rightDefenseStance = null;
                        }
                    }, 500);
                } else if (defenderStance === 'parry') {
                    this.addCombatAnimation(defenderFighter, 'fighter-defending');
                    setTimeout(() => {
                        this.handleParry(attackerFighter, defenderFighter, attackerName, defenderName, attackRoll, isCrit);
                        if (defender === 'left') {
                            this.leftDefenseStance = null;
                        } else {
                            this.rightDefenseStance = null;
                        }
                    }, 500);
                } else {
                    // Normal damage resolution
                    const defendRoll = this.rollDie(7) + 1; // 2-8
                    this.addCombatAnimation(defenderFighter, 'fighter-defending');

                    setTimeout(() => {
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
                    }, 500);
                }
            }
        }, 800);
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
        this.addCombatAnimation(defenderFighter, 'fighter-block');
        this.showCombatText(defenderFighter, 'BLOCK!', 'block-text');

        if (isCrit) {
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
        this.addCombatAnimation(defenderFighter, 'fighter-parry');
        this.showCombatText(defenderFighter, 'PARRY!', 'parry-text');

        setTimeout(() => {
            this.addCombatAnimation(attackerFighter, 'fighter-hit');
            this.showDamageNumber(attackerFighter, damage, isCrit);

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
        }, 800);
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

        // Call end callback
        if (this.onCombatEnd) {
            setTimeout(() => {
                this.onCombatEnd(leftWins);
            }, 2000);
        }
    }

    /**
     * Add combat animation class
     */
    addCombatAnimation(fighter, animationClass) {
        fighter.classList.add(animationClass);
        setTimeout(() => fighter.classList.remove(animationClass), 1000);
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
