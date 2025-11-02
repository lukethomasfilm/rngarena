import { GAME_CONFIG } from '../constants.js';

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * PVECombatSystem - PVE Combat Engine
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Handles turn-based combat between hero and monsters.
 * Simplified version of PVP CombatSystem for PVE battles.
 *
 * ARCHITECTURAL SEPARATION:
 * -------------------------
 * - Uses pve- prefixed element IDs exclusively
 * - Completely independent from PVP CombatSystem
 * - Managed by PVEBattleSystem, never touched by RNGArena
 *
 * See PVEBattleSystem.js header for full separation documentation.
 * ═══════════════════════════════════════════════════════════════════════════
 */
export class PVECombatSystem {
    constructor(hero, monster, battleSystem) {
        this.hero = hero;
        this.monster = monster;
        this.battleSystem = battleSystem;

        // Combat state
        this.heroHP = hero.health;
        this.monsterHP = monster.health;
        this.combatRound = 1;
        this.combatEnded = false;
        this.currentTurn = 'hero'; // Hero always goes first

        // Rabid attack state (for raccoon's special ability)
        this.isRabidAttacking = false;
        this.rabidAttacksRemaining = 0;
        this.rabidTextElement = null; // Store reference to persistent RABID text

        // UI elements
        this.heroSprite = document.getElementById('pve-hero-sprite');
        this.monsterSprite = document.getElementById('pve-monster-sprite');
        this.battleStatus = document.getElementById('pve-battle-status');

        // Fighter containers (for animations and text effects - like PVP)
        this.heroFighter = this.heroSprite ? this.heroSprite.closest('.fighter-left') : null;
        this.monsterFighter = this.monsterSprite ? this.monsterSprite.closest('.fighter-right') : null;

        // Fast forward state
        this.fastForward = false;
        this.setupFastForward();

        // Audio state - check if globally muted
        this.muted = window.arena?.audioMuted || false;

        // Critical sound (same as PVP)
        this.criticalSoundPath = '/sfx/Critical!_fighter_ga-1760028020390.mp3';

        // Attack voice sound paths (hero is male, uses Voice 1-6)
        this.normalAttackVoicePaths = [
            '/sfx/Voice_1.mp3',
            '/sfx/Voice_2.mp3',
            '/sfx/Voice_4.mp3',
            '/sfx/Voice_5.mp3'
        ];

        this.criticalAttackVoicePaths = [
            '/sfx/Voice_3.mp3',
            '/sfx/Voice_6.mp3'
        ];

        // Seeded RNG (for now use simple Math.random)
        this.seed = Date.now();
    }

    /**
     * Setup fast forward button
     */
    setupFastForward() {
        const ffBtn = document.getElementById('pve-fast-forward');
        if (ffBtn) {
            ffBtn.addEventListener('click', () => {
                this.fastForward = !this.fastForward;
                ffBtn.style.opacity = this.fastForward ? '1' : '0.6';
            });
        }
    }

    /**
     * Start combat
     */
    startCombat() {
        console.log('⚔️ PVE Combat starting!');

        // Calculate and display initial win odds
        this.updateWinOdds();

        // Play monster intro sound if available, then wait 1.5s before starting
        if (this.monster.sfx && this.monster.sfx.intro) {
            console.log('🔊 Playing monster intro sound:', this.monster.sfx.intro);
            this.playSound(this.monster.sfx.intro);
        }

        // Wait 1.5 seconds before starting combat (for intro sound)
        setTimeout(() => this.executeCombatBeat(), 1500);
    }

    /**
     * Execute one combat turn
     */
    executeCombatBeat() {
        if (this.combatEnded) return;

        // Rabid attacks are faster - 800ms between attacks (or 100ms in fast forward)
        let delay = this.fastForward ? 100 : 1800; // Fast forward = 100ms, normal = 1800ms
        if (this.isRabidAttacking && this.rabidAttacksRemaining > 0) {
            delay = this.fastForward ? 100 : 800; // Rabid attacks = 800ms
        }

        if (this.currentTurn === 'hero') {
            this.executeHeroAttack();
        } else {
            this.executeMonsterAttack();
        }

        // Schedule next turn
        if (!this.combatEnded) {
            setTimeout(() => {
                this.combatRound++;
                this.executeCombatBeat();
            }, delay);
        }
    }

    /**
     * Execute hero's attack
     */
    executeHeroAttack() {
        console.log(`🗡️ Hero attacks! (Round ${this.combatRound})`);

        // Attack roll (1-6)
        const attackRoll = this.rollDie(6);
        const isCrit = attackRoll === 5;

        // Play attack voice (ora yell!)
        this.playAttackVoice(isCrit);

        // Hero attack animation
        this.addHeroAnimation('fighter-attacking');
        if (isCrit) {
            this.addHeroAnimation('fighter-crit-attack');
        }

        // Show attack damage text on hero (like PVP does)
        if (attackRoll !== 6) {
            this.showAttackerDamage(this.heroFighter, attackRoll, isCrit);
        }

        setTimeout(() => {
            if (attackRoll === 6) {
                // Hero missed!
                this.handleHeroMiss();
            } else {
                // Monster has no defense stance, just takes damage
                const damage = isCrit ? GAME_CONFIG.DAMAGE.CRITICAL : attackRoll;
                this.handleMonsterHit(damage, isCrit);
            }
        }, 200);
    }

    /**
     * Execute Ram's charge attack with special animation
     */
    executeChargeAttack() {
        console.log('🐏 Executing charge attack!');

        // Step 1: Rear up (attack sprite) for 0.2 seconds
        if (this.monsterSprite && this.monster.attackSprite) {
            this.monsterSprite.style.backgroundImage = `url('${this.monster.attackSprite}')`;
        }

        // Step 2: Return to normal pose after 0.2s
        setTimeout(() => {
            if (this.monsterSprite) {
                this.monsterSprite.style.backgroundImage = `url('${this.monster.sprite}')`;
            }
        }, 200);

        // Step 3: Start charging toward hero (left side) after brief pause
        setTimeout(() => {
            // Play charge sound
            if (this.monster.sfx && this.monster.sfx.charge) {
                console.log('🔊 Playing charge sound:', this.monster.sfx.charge);
                this.playSound(this.monster.sfx.charge);
            }

            // Super fast charge toward hero and off left side of screen
            if (this.monsterSprite) {
                this.monsterSprite.style.transition = 'transform 0.6s linear';
                this.monsterSprite.style.transform = 'scaleX(-1) scale(0.4) translateX(-1800px)';
            }
        }, 400);

        // Step 4: Deal damage as ram passes through hero (midway point ~300ms into charge)
        setTimeout(() => {
            const chargeDamage = this.monster.specialAbility.chargeDamage || 10;

            // Show damage, slash, and play hit sound
            this.showDamageNumber(this.heroFighter, chargeDamage, false);
            this.showSlashEffect(this.heroFighter);
            this.playHitSound();

            // Update hero HP
            this.heroHP -= chargeDamage;
            this.battleSystem.updateHeroHP(this.heroHP, this.hero.maxHealth);

            // Check if hero is defeated
            if (this.heroHP <= 0) {
                setTimeout(() => this.endCombat('monster'), 400);
            }
        }, 700); // Midway through the charge

        // Step 5: Teleport to right side (off screen) after charge completes
        setTimeout(() => {
            if (this.monsterSprite) {
                this.monsterSprite.style.transition = 'none';
                this.monsterSprite.style.transform = 'scaleX(-1) scale(0.4) translateX(1800px)';
            }
        }, 1000);

        // Step 6: Return to starting position from right side
        setTimeout(() => {
            if (this.monsterSprite) {
                this.monsterSprite.style.transition = 'transform 0.5s ease-out';
                this.monsterSprite.style.transform = 'scaleX(-1) scale(0.4) translateX(0)';
            }
        }, 1050);

        // Step 7: Continue to next turn
        setTimeout(() => {
            if (!this.combatEnded) {
                this.nextTurn();
            }
        }, 1600);
    }

    /**
     * Execute monster's attack (Wood Dummy always misses)
     */
    executeMonsterAttack() {
        console.log(`🎯 ${this.monster.displayName} attacks! (Round ${this.combatRound})`);

        // FIRST: Check for special ability triggers
        // This must happen BEFORE sprite switching so we know which sprite to use

        // Check for Rabid Attack trigger (Raccoon - only if not already rabid)
        if (!this.isRabidAttacking &&
            this.monster.specialAbility &&
            this.monster.specialAbility.rabidChance &&
            !this.monster.specialAbility.neverAttacks) {
            const rabidRoll = this.rollDie(100);
            if (rabidRoll <= this.monster.specialAbility.rabidChance) {
                // Trigger Rabid Attack!
                this.isRabidAttacking = true;
                this.rabidAttacksRemaining = this.monster.specialAbility.rabidAttackCount;
                console.log(`🦝 RABID ATTACK TRIGGERED! ${this.rabidAttacksRemaining} attacks incoming!`);

                // Show persistent RABID text
                if (this.monsterFighter) {
                    this.rabidTextElement = document.createElement('div');
                    this.rabidTextElement.className = 'rabid-text';
                    this.rabidTextElement.textContent = 'RABID!';
                    this.monsterFighter.appendChild(this.rabidTextElement);
                }

                // Make monster 10% bigger during rabid mode
                if (this.monsterSprite) {
                    this.monsterSprite.style.transform = 'scaleX(-1) scale(0.44)'; // 0.4 * 1.1 = 0.44
                }
            }
        }

        // Check for Charge Attack trigger (Ram)
        let isCharging = false;
        if (this.monster.specialAbility &&
            this.monster.specialAbility.chargeChance &&
            !this.monster.specialAbility.neverAttacks) {
            const chargeRoll = this.rollDie(100);
            if (chargeRoll <= this.monster.specialAbility.chargeChance) {
                isCharging = true;
                console.log(`🐏 CHARGE ATTACK TRIGGERED!`);
            }
        }

        // Handle charge attack with special animation
        if (isCharging) {
            this.executeChargeAttack();
            return; // Skip normal attack flow
        }

        // SECOND: Change to appropriate attack sprite and lunge forward
        if (this.monsterSprite) {
            if (this.isRabidAttacking && this.monster.rabidAttackSprite) {
                // Use rabid attack sprite if in rabid mode
                console.log('🦝 Setting rabid attack sprite:', this.monster.rabidAttackSprite);
                this.monsterSprite.style.backgroundImage = `url('${this.monster.rabidAttackSprite}')`;
                console.log('🦝 Monster sprite element:', this.monsterSprite);
                console.log('🦝 Applied background-image:', this.monsterSprite.style.backgroundImage);
                console.log('🦝 Computed background-image:', window.getComputedStyle(this.monsterSprite).backgroundImage);
            } else if (this.monster.attackSprite) {
                // Use normal attack sprite
                this.monsterSprite.style.backgroundImage = `url('${this.monster.attackSprite}')`;
            }

            // Lunge forward (monster is on right, so move left toward hero)
            // Skip lunge for Wood Dummy (it's on a stick and can't move!)
            if (this.monster.id !== 'wood-dummy') {
                this.monsterSprite.style.transition = 'transform 0.1s ease-out';
                this.monsterSprite.style.transform = 'translateX(-10px)';
            }
        }

        setTimeout(() => {
            // Wood Dummy always misses (specialAbility.neverAttacks)
            if (this.monster.specialAbility && this.monster.specialAbility.neverAttacks) {
                this.handleMonsterMiss();
            } else {

                // Play monster attack sound if available
                if (this.monster.sfx && this.monster.sfx.attack) {
                    if (Array.isArray(this.monster.sfx.attack)) {
                        const randomAttack = this.monster.sfx.attack[Math.floor(Math.random() * this.monster.sfx.attack.length)];
                        console.log('🔊 [MONSTER ATTACKS] Playing attack sound:', randomAttack);
                        this.playSound(randomAttack);
                    } else {
                        console.log('🔊 [MONSTER ATTACKS] Playing attack sound:', this.monster.sfx.attack);
                        this.playSound(this.monster.sfx.attack);
                    }
                }

                // Execute attack
                const attackRoll = this.rollDie(6);
                if (attackRoll === 6) {
                    this.handleMonsterMiss();
                } else {
                    const isCrit = attackRoll === 5;
                    const damage = isCrit ? GAME_CONFIG.DAMAGE.CRITICAL : attackRoll;
                    this.handleHeroHit(damage, isCrit);
                }
            }

            // Revert to appropriate sprite after attack and reset position
            setTimeout(() => {
                if (this.monsterSprite) {
                    if (this.isRabidAttacking && this.monster.rabidNormalSprite) {
                        // Revert to rabid normal stance if still in rabid mode
                        console.log('🦝 Reverting to rabid normal sprite:', this.monster.rabidNormalSprite);
                        this.monsterSprite.style.backgroundImage = `url('${this.monster.rabidNormalSprite}')`;
                    } else {
                        // Revert to normal sprite
                        this.monsterSprite.style.backgroundImage = `url('${this.monster.sprite}')`;
                    }

                    // Reset position (lunge back) - skip for Wood Dummy
                    if (this.monster.id !== 'wood-dummy') {
                        this.monsterSprite.style.transform = 'translateX(0)';
                    }
                }
            }, 400);
        }, 200);
    }

    /**
     * Handle hero missing attack
     */
    handleHeroMiss() {
        console.log('Hero MISS!');
        this.addHeroAnimation('fighter-miss');
        this.showCombatText(this.heroFighter, 'MISS!', 'miss-text');
        this.nextTurn();
    }

    /**
     * Handle monster taking damage
     */
    handleMonsterHit(damage, isCrit) {
        console.log(`💥 Monster hit for ${damage} damage!`);

        setTimeout(() => {
            // Wood Dummy is on a stick - no hit animation, only sprite flash
            // Flash hit sprite (switches between normal and hit sprite)
            this.flashMonsterHit();

            // Show damage number and slash effect
            this.showDamageNumber(this.monsterFighter, damage, isCrit);
            this.showSlashEffect(this.monsterFighter);

            // Play hit sounds
            this.playMonsterHitSounds();

            if (isCrit) {
                this.playCriticalSound();
                this.showCriticalScreenFlash();
            }

            // Update monster HP
            this.monsterHP -= damage;
            this.battleSystem.updateMonsterHP(this.monsterHP, this.monster.maxHealth);

            // Check if monster is defeated
            if (this.monsterHP <= 0) {
                // Play outro/end sound if available, then show victory
                if (this.monster.sfx && this.monster.sfx.end) {
                    console.log('🔊 Playing monster end sound:', this.monster.sfx.end);
                    this.playSound(this.monster.sfx.end);
                    // Wait for outro sound before showing victory (1.5s)
                    setTimeout(() => {
                        this.endCombat('hero');
                    }, 1500);
                } else {
                    // No outro sound, show victory immediately
                    this.endCombat('hero');
                }
            } else {
                this.nextTurn();
            }
        }, 400);
    }

    /**
     * Handle monster missing attack
     */
    handleMonsterMiss() {
        console.log(`${this.monster.displayName} MISS!`);

        // Wood Dummy is on a stick - no miss animation (can't move!)
        // Show MISS text for all monsters except dummy
        if (this.monster.id !== 'wood-dummy') {
            this.showCombatText(this.monsterFighter, 'MISS!', 'miss-text');
        }
        this.nextTurn();
    }

    /**
     * Handle hero taking damage
     */
    handleHeroHit(damage, isCrit) {
        console.log(`💥 Hero hit for ${damage} damage!`);

        setTimeout(() => {
            this.addHeroAnimation('fighter-hit');
            if (isCrit) {
                this.addHeroAnimation('fighter-crit-glow');
            }
            this.showDamageNumber(this.heroFighter, damage, isCrit);
            this.showSlashEffect(this.heroFighter);

            // Always play hit sound when hero takes damage
            console.log('🔊 [HERO HIT] Playing generic hit sound');
            this.playHitSound();

            if (isCrit) {
                this.playCriticalSound();
                this.showCriticalScreenFlash();
            }

            // Update hero HP
            this.heroHP -= damage;
            this.battleSystem.updateHeroHP(this.heroHP, this.hero.maxHealth);

            // Check if hero is defeated
            if (this.heroHP <= 0) {
                this.endCombat('monster');
            } else {
                this.nextTurn();
            }
        }, 400);
    }

    /**
     * Flash monster hit/defense sprite
     */
    flashMonsterHit() {
        if (!this.monsterSprite) return;

        const originalSprite = this.monster.sprite;

        // Wood Dummy uses hitSprite, others use defenseSprite
        if (this.monster.hitSprite) {
            // Wood Dummy - show hit sprite
            this.monsterSprite.style.backgroundImage = `url('${this.monster.hitSprite}')`;
        } else if (this.monster.defenseSprite) {
            // Other monsters - show defense sprite when taking damage
            this.monsterSprite.style.backgroundImage = `url('${this.monster.defenseSprite}')`;
        }

        // Flash back to normal after 400ms
        setTimeout(() => {
            this.monsterSprite.style.backgroundImage = `url('${originalSprite}')`;
        }, 400);
    }

    /**
     * Play monster-specific hit sounds
     */
    playMonsterHitSounds() {
        console.log(`🎯 MONSTER TAKES DAMAGE - Playing ${this.monster.displayName} hit sounds`);

        // Wood Dummy specific: Play random hit sound (dummywood1-3) and hay sound
        if (this.monster.id === 'wood-dummy') {
            if (this.monster.sfx && this.monster.sfx.hit && this.monster.sfx.hit.length > 0) {
                const randomHit = this.monster.sfx.hit[Math.floor(Math.random() * this.monster.sfx.hit.length)];
                console.log('  🔊 [MONSTER HIT] Wood hit:', randomHit);
                this.playSound(randomHit);
            }

            if (this.monster.sfx && this.monster.sfx.hay) {
                setTimeout(() => {
                    console.log('  🔊 [MONSTER HIT] Hay sound');
                    this.playSound(this.monster.sfx.hay);
                }, 100); // Slight delay for layering
            }
        } else {
            // Other monsters: Play defense sounds (grunts/growls) AND generic hit sound
            if (this.monster.sfx && this.monster.sfx.defense) {
                // Play defense grunt/growl
                if (Array.isArray(this.monster.sfx.defense)) {
                    const randomDefense = this.monster.sfx.defense[Math.floor(Math.random() * this.monster.sfx.defense.length)];
                    console.log('  🔊 [MONSTER HIT] Defense sound:', randomDefense);
                    this.playSound(randomDefense);
                } else {
                    console.log('  🔊 [MONSTER HIT] Defense sound:', this.monster.sfx.defense);
                    this.playSound(this.monster.sfx.defense);
                }
            }

            // Always play generic hit sound for impact on all living monsters
            console.log('  🔊 [MONSTER HIT] Generic hit sound');
            this.playHitSound();
        }
    }

    /**
     * Set muted state
     */
    setMuted(muted) {
        this.muted = muted;
    }

    /**
     * Play a sound file
     */
    playSound(path) {
        if (this.muted) return;

        try {
            const audio = new Audio(path);
            audio.volume = 0.5;
            audio.play().catch(e => console.warn('Sound play failed:', e));
        } catch (e) {
            console.warn('Error playing sound:', path, e);
        }
    }

    /**
     * Play attack voice sound (ora yells!)
     */
    playAttackVoice(isCrit) {
        if (this.muted) return;

        let soundPath;

        if (isCrit) {
            // Use voices 3 or 6 for criticals
            const randomIndex = Math.floor(Math.random() * this.criticalAttackVoicePaths.length);
            soundPath = this.criticalAttackVoicePaths[randomIndex];
        } else {
            // Use voices 1, 2, 4, 5 for normal attacks
            const randomIndex = Math.floor(Math.random() * this.normalAttackVoicePaths.length);
            soundPath = this.normalAttackVoicePaths[randomIndex];
        }

        // Play the voice sound (full duration)
        const sound = new Audio(soundPath);
        sound.volume = 0.5;
        sound.play().catch(err => console.log('Attack voice play failed:', err));
    }

    /**
     * Play generic hit sound
     */
    playHitSound() {
        const hitSounds = [
            '/sfx/fighting_game_hit_fl-1759992821197.mp3',
            '/sfx/fighting_game_hit_fl_1-1759992838415.mp3'
        ];
        const randomHit = hitSounds[Math.floor(Math.random() * hitSounds.length)];
        this.playSound(randomHit);
    }

    /**
     * Play critical strike sound (same as PVP)
     */
    playCriticalSound() {
        if (this.muted) return;

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
     * Calculate win probability using Monte Carlo simulation
     * Simulates thousands of battles from current state
     * @returns {number} Hero win percentage (0-100)
     */
    calculateWinProbability() {
        const SIMULATIONS = 2000; // Run 2000 simulations for accuracy
        let heroWins = 0;

        for (let i = 0; i < SIMULATIONS; i++) {
            if (this.simulateBattle()) {
                heroWins++;
            }
        }

        return Math.round((heroWins / SIMULATIONS) * 100);
    }

    /**
     * Simulate one complete battle from current state
     * @returns {boolean} True if hero wins, false if monster wins
     */
    simulateBattle() {
        let simHeroHP = this.heroHP;
        let simMonsterHP = this.monsterHP;
        let simCurrentTurn = this.currentTurn;
        let simIsRabid = false;
        let simRabidRemaining = 0;

        // Battle until someone dies
        while (simHeroHP > 0 && simMonsterHP > 0) {
            if (simCurrentTurn === 'hero') {
                // Hero attacks
                const roll = this.rollDie(6);
                if (roll !== 6) { // Not a miss
                    const damage = roll === 5 ? GAME_CONFIG.DAMAGE.CRITICAL : roll;
                    simMonsterHP -= damage;
                }
                simCurrentTurn = 'monster';
            } else {
                // Monster attacks

                // Wood Dummy never attacks
                if (this.monster.specialAbility?.neverAttacks) {
                    simCurrentTurn = 'hero';
                    continue;
                }

                // Check for Rabid Attack trigger (Raccoon special)
                if (!simIsRabid &&
                    this.monster.specialAbility?.rabidChance &&
                    this.rollDie(100) <= this.monster.specialAbility.rabidChance) {
                    simIsRabid = true;
                    simRabidRemaining = this.monster.specialAbility.rabidAttackCount;
                }

                // Execute attack
                const roll = this.rollDie(6);
                if (roll !== 6) { // Not a miss
                    const damage = roll === 5 ? GAME_CONFIG.DAMAGE.CRITICAL : roll;
                    simHeroHP -= damage;
                }

                // Handle Rabid Attack continuation
                if (simIsRabid) {
                    simRabidRemaining--;
                    if (simRabidRemaining <= 0) {
                        simIsRabid = false;
                        simCurrentTurn = 'hero';
                    }
                    // Stay on monster's turn if rabid
                } else {
                    simCurrentTurn = 'hero';
                }
            }
        }

        return simHeroHP > 0; // Hero wins if they have HP remaining
    }

    /**
     * Update the win odds display
     */
    updateWinOdds() {
        const winOddsElement = document.getElementById('pve-win-odds-value');
        if (!winOddsElement) return;

        // Calculate win probability
        const heroWinPercent = this.calculateWinProbability();

        // Update display
        winOddsElement.textContent = `${heroWinPercent}%`;

        // Update color based on odds
        winOddsElement.classList.remove('winning', 'losing', 'even');
        if (heroWinPercent >= 65) {
            winOddsElement.classList.add('winning');
        } else if (heroWinPercent <= 35) {
            winOddsElement.classList.add('losing');
        } else {
            winOddsElement.classList.add('even');
        }

        console.log(`📊 Win Odds Updated: Hero ${heroWinPercent}%`);
    }

    /**
     * Add animation class to hero and change sprite pose (like PVP)
     */
    addHeroAnimation(className) {
        if (!this.heroSprite) return;

        // Get the fighter container (parent of sprite) - this is where the animation class goes
        const heroFighter = this.heroSprite.closest('.fighter-left');
        if (!heroFighter) return;

        // Add animation class to fighter container (not sprite!)
        heroFighter.classList.add(className);

        // Change hero sprite based on animation type (like PVP does)
        if (className === 'fighter-attacking') {
            this.heroSprite.style.backgroundImage = `url('${this.hero.images.attack}')`;
        } else if (className === 'fighter-defending' || className === 'fighter-hit') {
            this.heroSprite.style.backgroundImage = `url('${this.hero.images.defense}')`;
        }

        // Reset to neutral pose after animation
        setTimeout(() => {
            heroFighter.classList.remove(className);
            this.heroSprite.style.backgroundImage = `url('${this.hero.images.neutral}')`;
        }, 600);
    }

    /**
     * Add animation class to monster (like PVP)
     */
    addMonsterAnimation(className) {
        if (!this.monsterSprite) return;

        // Get the fighter container (parent of sprite) - this is where the animation class goes
        const monsterFighter = this.monsterSprite.closest('.fighter-right');
        if (!monsterFighter) return;

        // Add animation class to fighter container (not sprite!)
        monsterFighter.classList.add(className);

        // Reset after animation
        setTimeout(() => monsterFighter.classList.remove(className), 600);
    }

    /**
     * Show combat text above fighter
     */
    showCombatText(fighter, text, className) {
        if (!fighter) return;

        const textEl = document.createElement('div');
        textEl.className = className;
        textEl.textContent = text;
        fighter.appendChild(textEl);

        setTimeout(() => textEl.remove(), 2000);
    }

    /**
     * Show damage number (matches PVP style)
     */
    showDamageNumber(fighter, damage, isCrit) {
        if (!fighter) return;

        const damageEl = document.createElement('div');
        damageEl.className = isCrit ? 'crit-number' : 'damage-number';
        damageEl.textContent = isCrit ? 'CRITICAL' : `-${damage}`;
        fighter.appendChild(damageEl);

        const duration = isCrit ? 2500 : 2000;
        setTimeout(() => damageEl.remove(), duration);
    }

    /**
     * Show attacker damage text (matches PVP)
     */
    showAttackerDamage(fighter, damage, isCrit = false) {
        if (!fighter) return;

        const damageEl = document.createElement('div');
        damageEl.className = isCrit ? 'attacker-crit-number' : 'attacker-damage-number';
        damageEl.textContent = isCrit ? 'CRITICAL' : `Attack +${damage}`;
        fighter.appendChild(damageEl);

        const duration = isCrit ? 1500 : 1200;
        setTimeout(() => damageEl.remove(), duration);
    }

    /**
     * Show critical screen flash (PVE version - targets pve-arena-viewport)
     */
    showCriticalScreenFlash() {
        const arenaViewport = document.getElementById('pve-arena-viewport');
        if (!arenaViewport) return;

        // Screen shake effect
        arenaViewport.classList.add('crit-shake');
        setTimeout(() => arenaViewport.classList.remove('crit-shake'), 400);

        // Red flash overlay
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
     * Show slash visual effect (for damage)
     */
    showSlashEffect(fighter) {
        if (!fighter) return;

        const slashImg = document.createElement('img');
        slashImg.src = '/images/effects/slash.png';
        slashImg.className = 'slash-effect';

        // Random angle between -15 and 15 degrees
        const randomAngle = (Math.random() * 30) - 15;

        // Slash orientation - match PVP pattern
        // - LEFT fighter (hero): FLIP (scaleX(-1))
        // - RIGHT fighter (monster): NO flip (scaleX(1))
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
     * Roll a die
     */
    rollDie(sides) {
        return Math.floor(Math.random() * sides) + 1;
    }

    /**
     * Switch to next turn
     */
    nextTurn() {
        // Update win odds after HP changes
        this.updateWinOdds();

        // Handle rabid attack mode - keep turn on monster
        if (this.isRabidAttacking && this.rabidAttacksRemaining > 0) {
            this.rabidAttacksRemaining--;
            console.log(`🦝 Rabid attacks remaining: ${this.rabidAttacksRemaining}`);

            // If rabid attacks are done, end rabid mode and switch to hero
            if (this.rabidAttacksRemaining === 0) {
                this.isRabidAttacking = false;
                console.log(`🦝 Rabid attack ended!`);

                // Revert to normal monster sprite
                if (this.monsterSprite) {
                    this.monsterSprite.style.backgroundImage = `url('${this.monster.sprite}')`;
                    // Scale back to normal size
                    this.monsterSprite.style.transform = 'scaleX(-1) scale(0.4)';
                }

                // Remove persistent RABID text
                if (this.rabidTextElement) {
                    this.rabidTextElement.remove();
                    this.rabidTextElement = null;
                }

                this.currentTurn = 'hero';
            } else {
                // Keep turn on monster for next rabid attack
                this.currentTurn = 'monster';
            }
        } else {
            // Normal turn switching
            this.currentTurn = this.currentTurn === 'hero' ? 'monster' : 'hero';
        }
    }

    /**
     * End combat
     */
    endCombat(winner) {
        console.log(`🏁 Combat ended! Winner: ${winner}`);
        this.combatEnded = true;

        if (winner === 'hero') {
            this.battleSystem.onVictory();
        } else {
            this.battleSystem.onDefeat();
        }
    }

    /**
     * Cleanup
     */
    cleanup() {
        this.combatEnded = true;

        // Clean up rabid mode effects
        if (this.monsterSprite && this.monster) {
            this.monsterSprite.style.backgroundImage = `url('${this.monster.sprite}')`;
        }
        if (this.rabidTextElement) {
            this.rabidTextElement.remove();
            this.rabidTextElement = null;
        }

        // Stop all audio elements
        document.querySelectorAll('audio').forEach(audio => {
            if (!audio.id.includes('home-music')) {
                audio.pause();
                audio.currentTime = 0;
            }
        });
    }
}
