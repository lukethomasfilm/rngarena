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

// Track all active combat system instances for debugging
let activeCombatSystems = [];
let instanceCounter = 0;

export class PVECombatSystem {
    constructor(hero, monster, battleSystem) {
        this.instanceId = ++instanceCounter;
        activeCombatSystems.push(this.instanceId);
        console.log(`🎮 NEW PVECombatSystem instance #${this.instanceId} created`);
        console.log(`   Active instances: [${activeCombatSystems.join(', ')}]`);
        this.hero = hero;
        this.monster = monster;
        this.battleSystem = battleSystem;

        // Track all timeouts and audio for cleanup
        this.activeTimeouts = [];
        this.activeAudio = [];

        // Combat state
        this.heroHP = hero.health;
        this.monsterHP = monster.health;
        this.combatRound = 1;
        this.combatEnded = false;
        this.currentTurn = 'hero'; // Hero always goes first

        // Rabid attack state (for raccoon's special ability)
        this.isRabidAttacking = false;
        this.rabidAttacksRemaining = 0;
        this.rabidJustEnded = false; // Track if rabid mode just ended (for extra delay)
        this.rabidTextElement = null; // Store reference to persistent RABID text

        // Stunned state (for frog-fish sonic croak)
        this.heroStunned = false;
        this.stunnedTextElement = null; // Store reference to persistent STUNNED text

        // Poison state (for Ripplefang venom strike)
        this.isPoisoned = false;
        this.poisonDamage = 0;
        this.poisonTurnsRemaining = 0;

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

        // Block/defend sounds (same as PVP)
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

        // Dodge/miss sounds (PVE specific)
        this.whooshSoundPath = '/images/pve/Random/whoosh_sfx.mp3';
        this.missSoundPath = '/images/pve/Random/miss.mp3';

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
     * ═══════════════════════════════════════════════════════════════════════════
     * HELPER METHODS - Dynamic Transform & Behavior
     * ═══════════════════════════════════════════════════════════════════════════
     * These methods read from monster data to dynamically generate transforms
     * and behaviors, eliminating hardcoded monster ID checks.
     */

    /**
     * Get base transform for the monster
     * @param {string} additionalTransform - Additional transform to append (e.g., 'translateX(-10px)')
     * @returns {string} Complete transform string
     */
    getMonsterTransform(additionalTransform = '') {
        const base = this.monster.baseTransform || 'scaleX(-1) scale(0.4)'; // Default: flipped + small
        return additionalTransform ? `${base} ${additionalTransform}` : base;
    }

    /**
     * Get rabid mode transform (10% bigger than base)
     * @returns {string} Transform string for rabid mode
     */
    getRabidTransform() {
        // Parse base transform and scale up by 10%
        // For now, manually calculate based on baseTransform
        // This could be made more sophisticated with transform parsing
        const baseTransform = this.monster.baseTransform || 'scaleX(-1) scale(0.4)';

        // Extract scale value and multiply by 1.1
        const scaleMatch = baseTransform.match(/scale\(([\d.]+)\)/);
        if (scaleMatch) {
            const baseScale = parseFloat(scaleMatch[1]);
            const rabidScale = (baseScale * 1.1).toFixed(5);
            return baseTransform.replace(/scale\(([\d.]+)\)/, `scale(${rabidScale})`);
        }

        // If no scale found, just return base transform
        return baseTransform;
    }

    /**
     * Check if monster can lunge
     * @returns {boolean}
     */
    canMonsterLunge() {
        return this.monster.canLunge !== false; // Default true if not specified
    }

    /**
     * Check if monster shows miss text
     * @returns {boolean}
     */
    shouldShowMissText() {
        return this.monster.showMissText !== false; // Default true if not specified
    }

    /**
     * Get sound profile for monster
     * @returns {string} 'wood', 'flesh', or 'vocal-only'
     */
    getSoundProfile() {
        return this.monster.soundProfile || 'flesh'; // Default to flesh
    }

    /**
     * Tracked setTimeout - stores timeout ID for cleanup
     */
    setTrackedTimeout(callback, delay) {
        const timeoutId = setTimeout(() => {
            // Remove from active timeouts when it fires
            const index = this.activeTimeouts.indexOf(timeoutId);
            if (index > -1) {
                this.activeTimeouts.splice(index, 1);
            }
            // Only execute if combat hasn't ended
            if (!this.combatEnded) {
                callback();
            }
        }, delay);
        this.activeTimeouts.push(timeoutId);
        return timeoutId;
    }

    /**
     * Track an audio element for cleanup
     */
    trackAudio(audio) {
        this.activeAudio.push(audio);

        // Detailed audio lifecycle logging
        audio.addEventListener('loadeddata', () => {
            const filename = audio.src.split('/').pop();
            console.log(`  ⏳ [Instance #${this.instanceId}] Audio loaded: ${filename} (duration: ${audio.duration.toFixed(2)}s)`);
        });

        audio.addEventListener('play', () => {
            const filename = audio.src.split('/').pop();
            console.log(`  ▶️ [Instance #${this.instanceId}] Audio started playing: ${filename}`);
        });

        // Remove from tracking when it ends naturally
        audio.addEventListener('ended', () => {
            const filename = audio.src.split('/').pop();
            console.log(`  ⏹️ [Instance #${this.instanceId}] Audio ended: ${filename}`);
            const index = this.activeAudio.indexOf(audio);
            if (index > -1) {
                this.activeAudio.splice(index, 1);
            }
        });

        return audio;
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
        this.setTrackedTimeout(() => this.executeCombatBeat(), 1500);
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

        // Extra delay after rabid mode ends (give a beat before hero attacks)
        if (this.rabidJustEnded && this.currentTurn === 'hero') {
            delay = this.fastForward ? 150 : 2200; // Extra 400ms pause after rabid ends
            this.rabidJustEnded = false; // Clear flag after applying delay
        }

        // Wood Dummy turns are 2x faster (never attacks anyway)
        if (this.currentTurn === 'monster' && this.monster.id === 'wood-dummy') {
            delay = this.fastForward ? 50 : 900; // Half the normal delay
        }

        if (this.currentTurn === 'hero') {
            this.executeHeroAttack();
        } else {
            this.executeMonsterAttack();
        }

        // Schedule next turn (tracked timeout will check combatEnded)
        if (!this.combatEnded) {
            this.setTrackedTimeout(() => {
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

        // Handle poison damage at start of hero's turn
        if (this.isPoisoned) {
            this.handlePoisonDamage();

            // If hero dies from poison, end combat
            if (this.heroHP <= 0) {
                this.setTrackedTimeout(() => this.endCombat('monster'), 1000);
                return;
            }

            // Delay the attack slightly to show poison damage
            this.setTrackedTimeout(() => this.executeHeroAttackAfterPoison(), 1200);
            return;
        }

        this.executeHeroAttackAfterPoison();
    }

    /**
     * Execute hero's attack after poison damage (or immediately if not poisoned)
     */
    executeHeroAttackAfterPoison() {
        // Check if hero is stunned - SKIP TURN ENTIRELY (frog goes, stuns, goes again)
        if (this.heroStunned) {
            console.log('😵 Hero is stunned! Turn skipped!');
            this.heroStunned = false; // Clear stunned status after this turn

            // Remove stunned text
            if (this.stunnedTextElement) {
                this.stunnedTextElement.remove();
                this.stunnedTextElement = null;
            }

            // Skip directly to monster's turn (no hero animation or attack)
            this.nextTurn();
            return;
        }

        // Attack roll (1-6)
        const attackRoll = this.rollDie(6);
        let isCrit = attackRoll === 5;
        let isDraconicCrit = false;

        // Check for Draconic Crit if normal crit occurs
        if (isCrit && this.hero.stats && this.hero.stats.draconicCrit) {
            const draconicCritChance = this.hero.stats.draconicCrit;
            const draconicRoll = Math.random() * 100;
            if (draconicRoll < draconicCritChance) {
                isDraconicCrit = true;
                console.log(`🐉 DRACONIC CRIT ACTIVATED! (${draconicCritChance}% chance)`);
            }
        }

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

        this.setTrackedTimeout(() => {
            if (attackRoll === 6) {
                // Hero misses
                this.handleHeroMiss();
            } else {
                // Calculate damage with draconic crit
                let damage;
                if (isDraconicCrit) {
                    // Draconic crit deals double the normal crit damage
                    damage = GAME_CONFIG.DAMAGE.CRITICAL * 2;
                } else if (isCrit) {
                    damage = GAME_CONFIG.DAMAGE.CRITICAL;
                } else {
                    damage = attackRoll;
                }

                // Wood Dummy cannot defend or dodge (it's a dummy!)
                if (this.monster.id === 'wood-dummy') {
                    this.handleMonsterHit(damage, isCrit, isDraconicCrit);
                } else {
                    // Attack lands - check if monster defends or dodges
                    const monsterDefenseRoll = this.rollDie(6);

                    if (monsterDefenseRoll === 3) {
                        // Monster defends - blocks damage
                        this.handleMonsterDefend(damage, isCrit, isDraconicCrit);
                    } else if (monsterDefenseRoll === 6) {
                        // Monster dodges - avoids damage completely
                        this.handleMonsterDodge();
                    } else {
                        // Normal hit - monster takes damage
                        this.handleMonsterHit(damage, isCrit, isDraconicCrit);
                    }
                }
            }
        }, 200);
    }

    /**
     * Execute Ram's charge attack with special animation
     * Total duration: ~2000ms
     */
    executeChargeAttack() {
        console.log('🐏 Executing charge attack!');

        // Step 1: Rear up (attack sprite) for 200ms
        if (this.monsterSprite && this.monster.attackSprite) {
            this.monsterSprite.style.backgroundImage = `url('${this.monster.attackSprite}')`;
            // Ensure scale is maintained when showing attack sprite (Ram uses 0.8775)
            this.monsterSprite.style.setProperty('transform', 'scale(0.8775) translateY(-10px)', 'important');
        }

        // Step 2: Return to normal pose after 200ms, prepare for charge
        this.setTrackedTimeout(() => {
            if (this.monsterSprite) {
                this.monsterSprite.style.backgroundImage = `url('${this.monster.sprite}')`;
                // Reset any existing transforms before charging
                this.monsterSprite.style.transition = 'none';
                this.monsterSprite.style.setProperty('transform', 'scale(0.8775) translateY(-10px)', 'important');
            }
        }, 200);

        // Step 3: Start horizontal charge toward hero at 250ms
        this.setTrackedTimeout(() => {
            // Play charge sound
            if (this.monster.sfx && this.monster.sfx.charge) {
                console.log('🔊 Playing charge sound:', this.monster.sfx.charge);
                this.playSound(this.monster.sfx.charge);
            }

            // Simple, direct horizontal charge - translateX only, 1200ms duration
            if (this.monsterSprite) {
                this.monsterSprite.style.transition = 'transform 1200ms linear';
                // Move left off screen (-2000px)
                this.monsterSprite.style.setProperty('transform', 'scale(0.8775) translateY(-10px) translateX(-2000px)', 'important');
            }
        }, 250);

        // Step 4: Hit hero at midpoint (550ms total = 250ms + 300ms into charge)
        this.setTrackedTimeout(() => {
            const chargeDamage = this.monster.specialAbility.chargeDamage || 10;

            // Check if hero defends or dodges
            const heroDefenseRoll = this.rollDie(6);

            if (heroDefenseRoll === 3) {
                // Hero defends - takes half damage (special attack)
                const blockedDamage = Math.floor(chargeDamage / 2);
                console.log(`🛡️ Hero defended against charge! ${blockedDamage} damage taken (${chargeDamage - blockedDamage} blocked)`);

                // Show defend animation and text
                this.addHeroAnimation('fighter-defending');
                this.showBlockEffect(this.heroFighter);
                this.showCombatText(this.heroFighter, 'DEFEND!', 'block-text');
                this.showDamageNumber(this.heroFighter, blockedDamage, false);

                // Play hit sound with slight delay
                this.setTrackedTimeout(() => {
                    this.playHitSound();
                }, 80);

                // Update hero HP with reduced damage
                this.heroHP -= blockedDamage;
                this.battleSystem.updateHeroHP(this.heroHP, this.hero.maxHealth);

                // Check if hero is defeated
                if (this.heroHP <= 0) {
                    this.setTrackedTimeout(() => this.endCombat('monster'), 400);
                }
            } else if (heroDefenseRoll === 6) {
                // Hero dodges - avoids damage completely
                this.handleHeroDodge();
            } else {
                // Normal hit - full damage
                // Show damage and slash
                this.showDamageNumber(this.heroFighter, chargeDamage, false);
                this.showSlashEffect(this.heroFighter);

                // Play fleshy hit sound (physical impact) - charge sound is the attack/movement sound
                this.playHitSound();

                // Hero knockback animation
                if (this.heroSprite) {
                    this.heroSprite.style.transition = 'transform 200ms ease-out';
                    this.heroSprite.style.transform = 'translateX(-30px)';

                    // Return hero to normal position
                    this.setTrackedTimeout(() => {
                        if (this.heroSprite) {
                            this.heroSprite.style.transform = 'translateX(0)';
                        }
                    }, 200);
                }

                // Update hero HP
                this.heroHP -= chargeDamage;
                this.battleSystem.updateHeroHP(this.heroHP, this.hero.maxHealth);

                // Check if hero is defeated
                if (this.heroHP <= 0) {
                    this.setTrackedTimeout(() => this.endCombat('monster'), 400);
                }
            }
        }, 550);

        // Step 5: Ram is now off-screen (at 1450ms). Teleport back to starting position (right side)
        this.setTrackedTimeout(() => {
            if (this.monsterSprite) {
                // Disable transition for instant teleport
                this.monsterSprite.style.transition = 'none';
                // Reset to starting position
                this.monsterSprite.style.setProperty('transform', 'scale(0.8775) translateY(-10px) translateX(0)', 'important');
            }
        }, 1450);

        // Step 6: End round and continue (at 2000ms)
        this.setTrackedTimeout(() => {
            if (!this.combatEnded) {
                this.nextTurn();
            }
        }, 2000);
    }

    /**
     * Execute Frog-Fish's sonic croak attack with visual effects
     * Total duration: ~1500ms
     */
    executeSonicCroak() {
        console.log('🐸 Executing sonic croak!');

        // Step 1: Frog puffs up (attack sprite)
        if (this.monsterSprite && this.monster.attackSprite) {
            this.monsterSprite.style.backgroundImage = `url('${this.monster.attackSprite}')`;
            // Make frog 20% bigger when croaking
            this.monsterSprite.style.transition = 'transform 0.3s ease-out';
            this.monsterSprite.style.setProperty('transform', 'scale(0.78) translateY(15px)', 'important'); // 0.65 * 1.2 = 0.78
        }

        // Step 2: Play croak sound and show visual effects at 300ms
        this.setTrackedTimeout(() => {
            // Play sonic croak sound
            if (this.monster.sfx && this.monster.sfx.croak) {
                console.log('🔊 Playing croak sound:', this.monster.sfx.croak);
                this.playSound(this.monster.sfx.croak);
            }

            // Screen shake effect
            const arenaViewport = document.getElementById('pve-arena-viewport');
            if (arenaViewport) {
                arenaViewport.classList.add('crit-shake');
                this.setTrackedTimeout(() => arenaViewport.classList.remove('crit-shake'), 500);
            }

            // Create sound wave visual effect
            this.showSonicWaveEffect();
        }, 300);

        // Step 3: Hit hero at 600ms
        this.setTrackedTimeout(() => {
            const croakDamage = this.monster.specialAbility.croakDamage || 12;

            // Check if hero defends or dodges
            const heroDefenseRoll = this.rollDie(6);

            if (heroDefenseRoll === 3) {
                // Hero defends - takes half damage (special attack)
                const blockedDamage = Math.floor(croakDamage / 2);
                console.log(`🛡️ Hero defended against sonic croak! ${blockedDamage} damage taken (${croakDamage - blockedDamage} blocked)`);

                // Show defend animation and text
                this.addHeroAnimation('fighter-defending');
                this.showBlockEffect(this.heroFighter);
                this.showCombatText(this.heroFighter, 'DEFEND!', 'block-text');
                this.showDamageNumber(this.heroFighter, blockedDamage, false);

                // Play hit sound with slight delay
                this.setTrackedTimeout(() => {
                    this.playHitSound();
                }, 80);

                // Update hero HP with reduced damage
                this.heroHP -= blockedDamage;
                this.battleSystem.updateHeroHP(this.heroHP, this.hero.maxHealth);

                // Still apply stunned status even when defending
                this.heroStunned = true;

                // Show persistent STUNNED text above hero
                if (this.heroFighter) {
                    this.stunnedTextElement = document.createElement('div');
                    this.stunnedTextElement.className = 'stunned-text';
                    this.stunnedTextElement.textContent = 'STUNNED!';
                    this.stunnedTextElement.style.cssText = `
                        position: absolute;
                        top: -40px;
                        left: 50%;
                        transform: translateX(-50%);
                        font-family: 'Cinzel', serif;
                        font-size: 1.2rem;
                        font-weight: bold;
                        color: #FFFF99;
                        text-shadow:
                            0 0 10px rgba(255, 255, 153, 0.8),
                            0 0 20px rgba(255, 255, 153, 0.6),
                            2px 2px 4px rgba(0, 0, 0, 0.8);
                        z-index: 100;
                        animation: stunPulse 1s ease-in-out infinite;
                    `;
                    this.heroFighter.appendChild(this.stunnedTextElement);
                }

                // Check if hero is defeated
                if (this.heroHP <= 0) {
                    this.setTrackedTimeout(() => this.endCombat('monster'), 400);
                }
            } else if (heroDefenseRoll === 6) {
                // Hero dodges - avoids damage and stun completely
                this.handleHeroDodge();
            } else {
                // Normal hit - full damage
                // Show damage and slash
                this.showDamageNumber(this.heroFighter, croakDamage, false);
                this.showSlashEffect(this.heroFighter);

                // Play hit sound
                this.playHitSound();

                // Hero recoil animation
                if (this.heroSprite) {
                    this.heroSprite.style.transition = 'transform 200ms ease-out';
                    this.heroSprite.style.transform = 'translateX(-20px) rotate(-5deg)';

                    // Return hero to normal position
                    this.setTrackedTimeout(() => {
                        if (this.heroSprite) {
                            this.heroSprite.style.transform = 'translateX(0) rotate(0deg)';
                        }
                    }, 200);
                }

                // Update hero HP
                this.heroHP -= croakDamage;
                this.battleSystem.updateHeroHP(this.heroHP, this.hero.maxHealth);

                // Apply stunned status
                this.heroStunned = true;

                // Show persistent STUNNED text above hero
                if (this.heroFighter) {
                    this.stunnedTextElement = document.createElement('div');
                    this.stunnedTextElement.className = 'stunned-text';
                    this.stunnedTextElement.textContent = 'STUNNED!';
                    this.stunnedTextElement.style.cssText = `
                        position: absolute;
                        top: -40px;
                        left: 50%;
                        transform: translateX(-50%);
                        font-family: 'Cinzel', serif;
                        font-size: 1.2rem;
                        font-weight: bold;
                        color: #FFFF99;
                        text-shadow:
                            0 0 10px rgba(255, 255, 153, 0.8),
                            0 0 20px rgba(255, 255, 153, 0.6),
                            2px 2px 4px rgba(0, 0, 0, 0.8);
                        z-index: 100;
                        animation: stunPulse 1s ease-in-out infinite;
                    `;
                    this.heroFighter.appendChild(this.stunnedTextElement);
                }

                // Check if hero is defeated
                if (this.heroHP <= 0) {
                    this.setTrackedTimeout(() => this.endCombat('monster'), 400);
                }
            }
        }, 600);

        // Step 4: Frog returns to normal at 900ms
        this.setTrackedTimeout(() => {
            if (this.monsterSprite) {
                this.monsterSprite.style.transition = 'transform 0.3s ease-out';
                this.monsterSprite.style.backgroundImage = `url('${this.monster.sprite}')`;
                this.monsterSprite.style.setProperty('transform', 'scale(0.65)', 'important');
            }
        }, 900);

        // Step 5: End round and continue (at 1500ms)
        this.setTrackedTimeout(() => {
            if (!this.combatEnded) {
                this.nextTurn();
            }
        }, 1500);
    }

    /**
     * Execute Ripplefang's Venom Strike attack with poison effect
     * Total duration: ~1800ms
     */
    executeVenomStrike() {
        console.log('🐍 Executing venom strike!');

        // Step 1: Serpent attack sprite + fang animation
        if (this.monsterSprite && this.monster.attackSprite) {
            this.monsterSprite.style.backgroundImage = `url('${this.monster.attackSprite}')`;
        }

        // Play venom strike sound
        if (this.monster.sfx && this.monster.sfx.venomStrike) {
            console.log('🔊 Playing venom strike sound:', this.monster.sfx.venomStrike);
            this.playSound(this.monster.sfx.venomStrike);
        }

        // Show fang animation (green fang strike effect)
        this.showFangEffect();

        // Step 2: Strike at 400ms
        this.setTrackedTimeout(() => {
            const venomDamage = this.monster.specialAbility.venomStrike.venomDamage || 8;

            // Check if hero defends or dodges
            const heroDefenseRoll = this.rollDie(6);

            if (heroDefenseRoll === 3) {
                // Hero defends - takes half damage (special attack)
                const blockedDamage = Math.floor(venomDamage / 2);
                console.log(`🛡️ Hero defended against venom! ${blockedDamage} damage taken (${venomDamage - blockedDamage} blocked)`);

                this.heroHP = Math.max(0, this.heroHP - blockedDamage);
                this.updateHeroHealthBar();
                this.handleHeroDefend(blockedDamage);

                // Play hit sound with slight delay
                this.setTrackedTimeout(() => {
                    this.playHitSound();
                }, 80);

                // Still apply poison even if defended (weakened venom gets through)
                this.applyPoison();

                // Update hero HP with reduced damage
                this.showDamageNumber(this.heroFighter, blockedDamage, false);
            } else if (heroDefenseRoll === 6) {
                // Hero dodges - takes no damage, no poison
                console.log(`💨 Hero dodged venom strike!`);
                this.handleHeroDodge();
            } else {
                // Hero takes full damage + poison
                console.log(`🐍 Venom strike hits! ${venomDamage} damage + poison`);

                this.heroHP = Math.max(0, this.heroHP - venomDamage);
                this.updateHeroHealthBar();

                // Play hit sound
                this.playHitSound();

                // Apply poison effect
                this.applyPoison();

                // Hero knockback animation
                if (this.heroSprite) {
                    const originalTransform = this.heroSprite.style.transform;
                    this.heroSprite.style.transition = 'transform 0.1s ease-out';
                    this.heroSprite.style.transform = `${originalTransform} translateX(-15px)`;

                    this.setTrackedTimeout(() => {
                        this.heroSprite.style.transform = originalTransform;
                    }, 200);
                }

                this.showDamageNumber(this.heroFighter, venomDamage, false);
            }
        }, 400);

        // Step 3: Return to normal sprite at 800ms
        this.setTrackedTimeout(() => {
            if (this.monsterSprite) {
                this.monsterSprite.style.backgroundImage = `url('${this.monster.sprite}')`;
            }
        }, 800);

        // Step 4: End round and continue (at 1800ms)
        this.setTrackedTimeout(() => {
            if (!this.combatEnded) {
                this.nextTurn();
            }
        }, 1800);
    }

    /**
     * Execute Ripplefang's Tidal Wave attack
     * Total duration: ~2500ms
     */
    executeTidalWave() {
        console.log('🌊 Executing tidal wave!');

        // Step 1: Serpent attack sprite
        if (this.monsterSprite && this.monster.attackSprite) {
            this.monsterSprite.style.backgroundImage = `url('${this.monster.attackSprite}')`;
        }

        // Play both wave sounds simultaneously
        if (this.monster.sfx && this.monster.sfx.tidalWave) {
            console.log('🔊 Playing tidal wave sounds');
            this.monster.sfx.tidalWave.forEach(sound => {
                this.playSound(sound);
            });
        }

        // Step 2: Show tidal wave animation at 300ms
        this.setTrackedTimeout(() => {
            this.showTidalWaveEffect();
        }, 300);

        // Step 3: Wave hits hero at 1200ms
        this.setTrackedTimeout(() => {
            const waveDamage = this.monster.specialAbility.tidalWave.waveDamage || 12;

            // Check if hero defends or dodges
            const heroDefenseRoll = this.rollDie(6);

            if (heroDefenseRoll === 3) {
                // Hero defends - takes half damage
                const blockedDamage = Math.floor(waveDamage / 2);
                console.log(`🛡️ Hero defended against wave! ${blockedDamage} damage taken (${waveDamage - blockedDamage} blocked)`);

                this.heroHP = Math.max(0, this.heroHP - blockedDamage);
                this.updateHeroHealthBar();
                this.handleHeroDefend(blockedDamage);

                // Play hit sound with slight delay
                this.setTrackedTimeout(() => {
                    this.playHitSound();
                }, 80);

                this.showDamageNumber(this.heroFighter, blockedDamage, false);
            } else if (heroDefenseRoll === 6) {
                // Hero dodges - takes no damage
                console.log(`💨 Hero dodged the wave!`);
                this.handleHeroDodge();
            } else {
                // Hero takes full damage
                console.log(`🌊 Tidal wave hits! ${waveDamage} damage`);

                this.heroHP = Math.max(0, this.heroHP - waveDamage);
                this.updateHeroHealthBar();

                // Play hit sound
                this.playHitSound();

                // Hero knockback animation (larger than venom)
                if (this.heroSprite) {
                    const originalTransform = this.heroSprite.style.transform;
                    this.heroSprite.style.transition = 'transform 0.2s ease-out';
                    this.heroSprite.style.transform = `${originalTransform} translateX(-25px)`;

                    this.setTrackedTimeout(() => {
                        this.heroSprite.style.transform = originalTransform;
                    }, 300);
                }

                this.showDamageNumber(this.heroFighter, waveDamage, false);
            }
        }, 1200);

        // Step 4: Return to normal sprite at 1800ms
        this.setTrackedTimeout(() => {
            if (this.monsterSprite) {
                this.monsterSprite.style.backgroundImage = `url('${this.monster.sprite}')`;
            }
        }, 1800);

        // Step 5: End round and continue (at 2500ms)
        this.setTrackedTimeout(() => {
            if (!this.combatEnded) {
                this.nextTurn();
            }
        }, 2500);
    }

    /**
     * Show sonic wave visual effect emanating from frog
     */
    showSonicWaveEffect() {
        if (!this.monsterFighter) return;

        // Create 3 expanding circles for sonic wave effect
        for (let i = 0; i < 3; i++) {
            this.setTrackedTimeout(() => {
                const wave = document.createElement('div');
                wave.style.cssText = `
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    width: 60px;
                    height: 60px;
                    transform: translate(-50%, -50%);
                    border: 3px solid rgba(255, 255, 153, 0.8);
                    border-radius: 50%;
                    pointer-events: none;
                    z-index: 20;
                    animation: sonicWaveExpand 0.8s ease-out forwards;
                `;
                this.monsterFighter.appendChild(wave);

                // Remove after animation completes
                this.setTrackedTimeout(() => wave.remove(), 800);
            }, i * 150); // Stagger the waves
        }
    }

    /**
     * Show fang strike visual effect for venom attack
     */
    showFangEffect() {
        if (!this.heroFighter) return;

        // Create green fang strike effect (two fangs)
        const fang1 = document.createElement('div');
        fang1.style.cssText = `
            position: absolute;
            top: 50%;
            left: 65%;
            width: 40px;
            height: 60px;
            transform: translate(-50%, -50%) rotate(-30deg) scaleY(2);
            pointer-events: none;
            z-index: 25;
            font-size: 60px;
            color: #00ff00;
            text-shadow: 0 0 10px #00ff00, 0 0 20px #00ff00;
            opacity: 0;
            animation: fangStrike 0.6s ease-out forwards;
        `;
        fang1.textContent = '▲';
        this.heroFighter.appendChild(fang1);

        const fang2 = document.createElement('div');
        fang2.style.cssText = `
            position: absolute;
            top: 50%;
            left: 75%;
            width: 40px;
            height: 60px;
            transform: translate(-50%, -50%) rotate(-30deg) scaleY(2);
            pointer-events: none;
            z-index: 25;
            font-size: 60px;
            color: #00ff00;
            text-shadow: 0 0 10px #00ff00, 0 0 20px #00ff00;
            opacity: 0;
            animation: fangStrike 0.6s ease-out forwards;
        `;
        fang2.textContent = '▲';
        this.heroFighter.appendChild(fang2);

        // Remove after animation
        this.setTrackedTimeout(() => {
            fang1.remove();
            fang2.remove();
        }, 600);
    }

    /**
     * Show tidal wave visual effect sliding across bottom
     */
    showTidalWaveEffect() {
        const arenaViewport = document.getElementById('pve-arena-viewport');
        if (!arenaViewport) return;

        // Create tidal wave container (bound to arena viewport)
        // 40% smaller: 500*0.6=300px, 300*0.6=180px, moved down 30px then up 20px = down 10px
        const waveContainer = document.createElement('div');
        waveContainer.style.cssText = `
            position: absolute;
            bottom: -310px;
            right: 0;
            width: 300px;
            height: 180px;
            pointer-events: none;
            z-index: 15;
            animation: tidalWaveRise 0.4s ease-out forwards, tidalWaveSlide 1.5s linear 0.4s forwards;
        `;

        const wave = document.createElement('img');
        wave.src = '/images/pve/Serpent/Ripplefang_tidalwave.png';
        wave.style.cssText = `
            width: 100%;
            height: 100%;
            object-fit: contain;
        `;
        waveContainer.appendChild(wave);
        arenaViewport.appendChild(waveContainer);

        // Remove after animation completes
        this.setTrackedTimeout(() => waveContainer.remove(), 2000);
    }

    /**
     * Apply poison effect to hero
     */
    applyPoison() {
        this.isPoisoned = true;
        this.poisonDamage = this.monster.specialAbility.venomStrike.poisonDamage || 2;
        this.poisonTurnsRemaining = this.monster.specialAbility.venomStrike.poisonDuration || 3;

        console.log(`☠️ Hero is poisoned! ${this.poisonDamage} damage per turn for ${this.poisonTurnsRemaining} turns`);

        // Make HP bar green (visual indicator of poison)
        this.updateHeroHealthBar(true);
    }

    /**
     * Handle poison damage at start of hero's turn
     */
    handlePoisonDamage() {
        if (!this.isPoisoned || this.poisonTurnsRemaining <= 0) {
            this.clearPoison();
            return;
        }

        console.log(`☠️ Poison damage! ${this.poisonDamage} damage (${this.poisonTurnsRemaining} turns left)`);

        // Deal poison damage
        this.heroHP = Math.max(0, this.heroHP - this.poisonDamage);
        this.updateHeroHealthBar(true); // Keep green while poisoned

        // Show poison damage number in green
        this.showDamageNumber(this.heroFighter, this.poisonDamage, false, true);

        // Decrement poison duration
        this.poisonTurnsRemaining--;

        // Clear poison if duration expired
        if (this.poisonTurnsRemaining <= 0) {
            this.setTrackedTimeout(() => {
                this.clearPoison();
            }, 1000);
        }
    }

    /**
     * Clear poison effect
     */
    clearPoison() {
        this.isPoisoned = false;
        this.poisonDamage = 0;
        this.poisonTurnsRemaining = 0;

        // Restore normal HP bar color
        this.updateHeroHealthBar(false);

        console.log(`✅ Poison cleared!`);
    }

    /**
     * Update hero health bar (with optional poison green color)
     */
    updateHeroHealthBar(isPoisoned = false) {
        this.battleSystem.updateHeroHP(this.heroHP, this.hero.maxHealth, isPoisoned);
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
                    const rabidTransform = this.getRabidTransform();
                    this.monsterSprite.style.setProperty('transform', rabidTransform, 'important');
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

                // Show "CHARGE ATTACK!" text above monster
                this.showCombatText(this.monsterFighter, 'CHARGE ATTACK!', 'special-attack-text');
            }
        }

        // Handle charge attack with special animation
        if (isCharging) {
            this.executeChargeAttack();
            return; // Skip normal attack flow
        }

        // Check for Sonic Croak trigger (Frog-Fish)
        let isCroaking = false;
        if (this.monster.specialAbility &&
            this.monster.specialAbility.croakChance &&
            !this.monster.specialAbility.neverAttacks) {
            const croakRoll = this.rollDie(100);
            if (croakRoll <= this.monster.specialAbility.croakChance) {
                isCroaking = true;
                console.log(`🐸 SONIC CROAK TRIGGERED!`);

                // Show "SONIC CROAK!" text above monster
                this.showCombatText(this.monsterFighter, 'SONIC CROAK!', 'special-attack-text');
            }
        }

        // Handle sonic croak with special effects
        if (isCroaking) {
            this.executeSonicCroak();
            return; // Skip normal attack flow
        }

        // Check for Venom Strike (Ripplefang - 15% chance)
        let isVenomStrike = false;
        if (this.monster.specialAbility &&
            this.monster.specialAbility.venomStrike &&
            !this.monster.specialAbility.neverAttacks) {
            const venomRoll = this.rollDie(100);
            if (venomRoll <= this.monster.specialAbility.venomStrike.venomChance) {
                isVenomStrike = true;
                console.log(`🐍 VENOM STRIKE TRIGGERED!`);

                // Show "VENOM STRIKE!" text above monster
                this.showCombatText(this.monsterFighter, 'VENOM STRIKE!', 'special-attack-text');
            }
        }

        // Handle venom strike attack
        if (isVenomStrike) {
            this.executeVenomStrike();
            return; // Skip normal attack flow
        }

        // Check for Tidal Wave (Ripplefang - 12% chance, only if venom didn't trigger)
        let isTidalWave = false;
        if (this.monster.specialAbility &&
            this.monster.specialAbility.tidalWave &&
            !this.monster.specialAbility.neverAttacks) {
            const waveRoll = this.rollDie(100);
            if (waveRoll <= this.monster.specialAbility.tidalWave.waveChance) {
                isTidalWave = true;
                console.log(`🌊 TIDAL WAVE TRIGGERED!`);

                // Show "TIDAL WAVE!" text above monster
                this.showCombatText(this.monsterFighter, 'TIDAL WAVE!', 'special-attack-text');
            }
        }

        // Handle tidal wave attack
        if (isTidalWave) {
            this.executeTidalWave();
            return; // Skip normal attack flow
        }

        // SECOND: Change to appropriate attack sprite and lunge forward
        if (this.monsterSprite) {
            if (this.isRabidAttacking && this.monster.rabidAttackSprite) {
                // Use rabid attack sprite if in rabid mode
                this.monsterSprite.style.backgroundImage = `url('${this.monster.rabidAttackSprite}')`;
            } else if (this.monster.attackSprite) {
                // Use normal attack sprite
                this.monsterSprite.style.backgroundImage = `url('${this.monster.attackSprite}')`;
            }

            // Lunge forward (monster is on right, so move left toward hero)
            if (this.canMonsterLunge()) {
                this.monsterSprite.style.transition = 'transform 0.1s ease-out';
                // Add lunge translateX to base transform
                const lungeTransform = this.getMonsterTransform('translateX(-10px)');
                this.monsterSprite.style.setProperty('transform', lungeTransform, 'important');
            }
        }

        this.setTrackedTimeout(() => {
            // Wood Dummy always misses (specialAbility.neverAttacks)
            if (this.monster.specialAbility && this.monster.specialAbility.neverAttacks) {
                this.handleMonsterMiss();
            } else {
                // Play monster attack sound (attack attempt - plays regardless of hit/miss)
                if (this.monster.sfx && this.monster.sfx.attack) {
                    if (Array.isArray(this.monster.sfx.attack)) {
                        const randomAttack = this.monster.sfx.attack[Math.floor(Math.random() * this.monster.sfx.attack.length)];
                        this.playSound(randomAttack);
                    } else {
                        this.playSound(this.monster.sfx.attack);
                    }
                }

                // Execute attack
                const attackRoll = this.rollDie(6);
                const isCrit = attackRoll === 5;

                // Add critical animation for monster (same as PVP)
                if (isCrit) {
                    this.addMonsterAnimation('fighter-crit-attack');
                }

                // Show attacker damage text on monster (like PVP does) - except for misses
                if (attackRoll !== 6) {
                    this.showAttackerDamage(this.monsterFighter, attackRoll, isCrit);
                }

                if (attackRoll === 6) {
                    // Monster misses
                    this.handleMonsterMiss();
                } else {
                    // Attack lands - check if hero defends or dodges
                    const heroDefenseRoll = this.rollDie(6);

                    if (heroDefenseRoll === 3) {
                        // Hero defends - blocks damage
                        this.handleHeroDefend(attackRoll, isCrit);
                    } else if (heroDefenseRoll === 6) {
                        // Hero dodges - avoids damage completely
                        this.handleHeroDodge();
                    } else {
                        // Normal hit - hero takes damage
                        const damage = isCrit ? GAME_CONFIG.DAMAGE.CRITICAL : attackRoll;
                        this.handleHeroHit(damage, isCrit);
                    }
                }
            }

            // Revert to appropriate sprite after attack and reset position
            this.setTrackedTimeout(() => {
                if (this.monsterSprite) {
                    if (this.isRabidAttacking && this.monster.rabidNormalSprite) {
                        // Revert to rabid normal stance if still in rabid mode
                        this.monsterSprite.style.backgroundImage = `url('${this.monster.rabidNormalSprite}')`;
                    } else {
                        // Revert to normal sprite
                        this.monsterSprite.style.backgroundImage = `url('${this.monster.sprite}')`;
                    }

                    // Reset position (lunge back)
                    if (this.canMonsterLunge()) {
                        // Restore base transform (scale + flip, no translateX)
                        const baseTransform = this.getMonsterTransform();
                        this.monsterSprite.style.setProperty('transform', baseTransform, 'important');
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
        // Play miss sound
        this.playMissSound();
        // Just show miss text, no dodge animation
        this.showCombatText(this.heroFighter, 'MISS!', 'miss-text');
        this.nextTurn();
    }

    /**
     * Handle hero dodging an incoming attack
     */
    handleHeroDodge() {
        console.log('Hero DODGE!');
        // Play whoosh sound
        this.playWhooshSound();
        // Dodge animation - step backward
        if (this.heroSprite) {
            this.heroSprite.style.transition = 'transform 0.2s ease-out';
            this.heroSprite.style.transform = 'scale(0.9) translateX(-20px)';
            this.setTrackedTimeout(() => {
                this.heroSprite.style.transform = 'scale(0.9)';
            }, 200);
        }
        this.showCombatText(this.heroFighter, 'DODGE!', 'miss-text');
        this.nextTurn();
    }

    /**
     * Handle hero defending against an attack
     * Blocks all normal damage, half damage from crits/specials (rounded down)
     */
    handleHeroDefend(incomingDamage = 0, isCrit = false) {
        console.log('🛡️ Hero DEFEND!');

        // Show shield block animation for hero
        this.addHeroAnimation('fighter-defending');
        this.showBlockEffect(this.heroFighter);

        // Play block sound
        this.playBlockSound();

        if (incomingDamage > 0) {
            // Being attacked while defending
            if (isCrit) {
                // Critical: Block half damage (rounded down)
                const blockedDamage = Math.floor(incomingDamage / 2);
                console.log(`🛡️ Blocked critical! ${blockedDamage} damage taken (${incomingDamage - blockedDamage} blocked)`);

                this.showCombatText(this.heroFighter, 'DEFEND!', 'block-text');
                this.showDamageNumber(this.heroFighter, blockedDamage, false);

                // Play hit sound with slight delay
                this.setTrackedTimeout(() => {
                    this.playHitSound();
                }, 80);

                this.setTrackedTimeout(() => {
                    this.heroHP -= blockedDamage;
                    this.battleSystem.updateHeroHP(this.heroHP, this.hero.maxHealth);

                    if (this.heroHP <= 0) {
                        // Ensure minimum 1 second before ending combat (let sounds play)
                        this.setTrackedTimeout(() => this.endCombat('monster'), 1000);
                    } else {
                        this.nextTurn();
                    }
                }, 400);
            } else {
                // Normal attack: Block all damage
                console.log(`🛡️ Blocked all damage!`);
                this.showCombatText(this.heroFighter, 'BLOCKED!', 'block-text');
                this.setTrackedTimeout(() => {
                    this.nextTurn();
                }, 400);
            }
        } else {
            // Just defending, no incoming attack
            this.showCombatText(this.heroFighter, 'DEFEND!', 'block-text');
            this.nextTurn();
        }
    }

    /**
     * Handle monster defending against an attack
     * Blocks all normal damage, half damage from crits (rounded down)
     */
    handleMonsterDefend(incomingDamage = 0, isCrit = false, isDraconicCrit = false) {
        console.log(`🛡️ Monster DEFEND!${isDraconicCrit ? ' (vs DRACONIC CRIT!)' : ''}`);

        // Show defend sprite if available
        if (this.monsterSprite && this.monster.defenseSprite) {
            this.monsterSprite.style.backgroundImage = `url('${this.monster.defenseSprite}')`;
            this.setTrackedTimeout(() => {
                this.monsterSprite.style.backgroundImage = `url('${this.monster.sprite}')`;
            }, 400);
        }

        if (incomingDamage > 0) {
            // Being attacked while defending
            if (isCrit) {
                // Critical: Block half damage (rounded down)
                const blockedDamage = Math.floor(incomingDamage / 2);
                console.log(`🛡️ Monster blocked critical! ${blockedDamage} damage taken (${incomingDamage - blockedDamage} blocked)`);

                this.showCombatText(this.monsterFighter, 'DEFEND!', 'block-text');
                this.showDamageNumber(this.monsterFighter, blockedDamage, false);

                // Play monster hit sounds
                this.setTrackedTimeout(() => {
                    this.playMonsterHitSounds();
                }, 80);

                this.setTrackedTimeout(() => {
                    this.monsterHP -= blockedDamage;
                    this.battleSystem.updateMonsterHP(this.monsterHP, this.monster.maxHealth);

                    if (this.monsterHP <= 0) {
                        // Ensure minimum 1 second before ending combat (let sounds play)
                        this.setTrackedTimeout(() => this.endCombat('hero'), 1000);
                    } else {
                        this.nextTurn();
                    }
                }, 400);
            } else {
                // Normal attack: Block all damage
                console.log(`🛡️ Monster blocked all damage!`);
                this.showCombatText(this.monsterFighter, 'BLOCKED!', 'block-text');
                this.setTrackedTimeout(() => {
                    this.nextTurn();
                }, 400);
            }
        } else {
            // Just defending, no incoming attack
            this.showCombatText(this.monsterFighter, 'DEFEND!', 'block-text');
            this.nextTurn();
        }
    }

    /**
     * Handle monster taking damage
     */
    handleMonsterHit(damage, isCrit, isDraconicCrit = false) {
        console.log(`💥 Monster hit for ${damage} damage!${isDraconicCrit ? ' (DRACONIC CRIT!)' : ''}`);

        if (isCrit) {
            this.playCriticalSound();
            this.showCriticalScreenFlash();
        }

        this.setTrackedTimeout(() => {
            // Wood Dummy is on a stick - no hit animation, only sprite flash
            // Flash hit sprite (switches between normal and hit sprite)
            this.flashMonsterHit();

            // Show damage number and slash effect
            this.showDamageNumber(this.monsterFighter, damage, isCrit, false, isDraconicCrit);
            this.showSlashEffect(this.monsterFighter);

            // Play hit sounds synchronized with slash (like Raccoon reference)
            this.playMonsterHitSounds();

            // Update monster HP
            this.monsterHP -= damage;
            this.battleSystem.updateMonsterHP(this.monsterHP, this.monster.maxHealth);

            // Check if monster is defeated
            if (this.monsterHP <= 0) {
                // Play outro/end sound if available (cut to 1 second), then show victory
                if (this.monster.sfx && this.monster.sfx.end) {
                    console.log('🔊 Playing monster end sound (cut to 1s):', this.monster.sfx.end);
                    const endSound = new Audio(this.monster.sfx.end);
                    endSound.volume = 0.5;
                    this.trackAudio(endSound);
                    endSound.play().catch(e => console.warn('End sound play failed:', e));

                    // Stop after 1 second
                    this.setTrackedTimeout(() => {
                        endSound.pause();
                        endSound.currentTime = 0;
                    }, 1000);

                    // Wait for sound before showing victory (1.2s)
                    this.setTrackedTimeout(() => {
                        this.endCombat('hero');
                    }, 1200);
                } else {
                    // No outro sound, ensure minimum 1 second before victory
                    this.setTrackedTimeout(() => this.endCombat('hero'), 1000);
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

        // Show miss text/sound based on monster config
        if (this.shouldShowMissText()) {
            this.playMissSound();
            this.showCombatText(this.monsterFighter, 'MISS!', 'miss-text');
        }
        this.nextTurn();
    }

    /**
     * Handle monster dodging an incoming attack
     */
    handleMonsterDodge() {
        console.log(`${this.monster.displayName} DODGE!`);

        // Play whoosh sound
        this.playWhooshSound();

        // Dodge animation - step backward (monster on right moves right)
        if (this.monsterSprite) {
            this.monsterSprite.style.transition = 'transform 0.2s ease-out';
            // Add dodge translateX to base transform
            const dodgeTransform = this.getMonsterTransform('translateX(20px)');
            this.monsterSprite.style.setProperty('transform', dodgeTransform, 'important');

            this.setTrackedTimeout(() => {
                // Return to base transform
                const baseTransform = this.getMonsterTransform();
                this.monsterSprite.style.setProperty('transform', baseTransform, 'important');
            }, 200);
        }

        this.showCombatText(this.monsterFighter, 'DODGE!', 'miss-text');
        this.nextTurn();
    }

    /**
     * Handle hero taking damage
     */
    handleHeroHit(damage, isCrit) {
        console.log(`💥 Hero hit for ${damage} damage!`);

        // Play fleshy hit sound with slight delay to layer with monster attack sound
        this.setTrackedTimeout(() => {
            this.playHitSound();
        }, 80);

        if (isCrit) {
            this.playCriticalSound();
            this.showCriticalScreenFlash();
        }

        this.setTrackedTimeout(() => {
            this.addHeroAnimation('fighter-hit');
            if (isCrit) {
                this.addHeroAnimation('fighter-crit-glow');
            }
            this.showDamageNumber(this.heroFighter, damage, isCrit);
            this.showSlashEffect(this.heroFighter);

            // Update hero HP
            this.heroHP -= damage;
            this.battleSystem.updateHeroHP(this.heroHP, this.hero.maxHealth);

            // Check if hero is defeated
            if (this.heroHP <= 0) {
                // Ensure minimum 1 second before ending combat (let sounds play)
                this.setTrackedTimeout(() => this.endCombat('monster'), 1000);
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
        console.log(`🎯 [Instance #${this.instanceId}] playMonsterHitSounds() called for ${this.monster.displayName}`);

        const soundProfile = this.getSoundProfile();

        if (soundProfile === 'wood') {
            // Wood Dummy: Play random wood hit sound (dummywood1-3) and hay sound
            if (this.monster.sfx && this.monster.sfx.hit && this.monster.sfx.hit.length > 0) {
                const randomHit = this.monster.sfx.hit[Math.floor(Math.random() * this.monster.sfx.hit.length)];
                this.playSound(randomHit);
            }

            if (this.monster.sfx && this.monster.sfx.hay) {
                this.setTrackedTimeout(() => {
                    this.playSound(this.monster.sfx.hay);
                }, 100); // Slight delay for layering
            }
        } else {
            // Living monsters: Play defense grunt/growl (vocal reaction)
            if (this.monster.sfx && this.monster.sfx.defense) {
                if (Array.isArray(this.monster.sfx.defense)) {
                    const randomDefense = this.monster.sfx.defense[Math.floor(Math.random() * this.monster.sfx.defense.length)];
                    this.playSound(randomDefense);
                } else {
                    this.playSound(this.monster.sfx.defense);
                }
            }

            // Play fleshy hit sound with 80ms delay to layer properly
            // Only for 'flesh' profile, not 'vocal-only'
            if (soundProfile === 'flesh') {
                this.setTrackedTimeout(() => {
                    this.playHitSound();
                }, 80);
            }
        }
    }

    /**
     * Set muted state
     */
    setMuted(muted) {
        this.muted = muted;
    }

    /**
     * Play a sound file (cut to 1 second max, except Ripplefang/Serpent sounds)
     */
    playSound(path) {
        // Check live muted state from arena
        if (window.arena?.audioMuted) return;
        if (this.muted) return;
        if (this.combatEnded) return; // Don't play if already cleaned up

        const filename = path.split('/').pop();
        const timestamp = Date.now();
        console.log(`🔊 [Instance #${this.instanceId}] Playing: ${filename} at ${timestamp} (${this.activeAudio.length} audio elements currently active)`);

        try {
            const audio = new Audio(path);
            audio.volume = 0.5;
            this.trackAudio(audio); // Track for cleanup
            audio.play().catch(e => console.warn('Sound play failed:', e));

            // Cut off after 1 second EXCEPT for Ripplefang/Serpent sounds (they need full length)
            const isSerpentSound = path.includes('/Serpent/');
            if (!isSerpentSound) {
                this.setTrackedTimeout(() => {
                    audio.pause();
                    audio.currentTime = 0;
                }, 1000);
            }
        } catch (e) {
            console.warn('Error playing sound:', path, e);
        }
    }

    /**
     * Play attack voice sound (ora yells!)
     */
    playAttackVoice(isCrit) {
        // Check live muted state from arena
        if (window.arena?.audioMuted) return;
        if (this.muted) return;
        if (this.combatEnded) return; // Don't play if already cleaned up

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

        const filename = soundPath.split('/').pop();
        const timestamp = Date.now();
        console.log(`🎤 [Instance #${this.instanceId}] Playing voice: ${filename} at ${timestamp} (${this.activeAudio.length} audio elements currently active)`);

        // Play the voice sound (cut to 2 seconds)
        const sound = new Audio(soundPath);
        sound.volume = 0.5;
        this.trackAudio(sound); // Track for cleanup
        sound.play().catch(err => console.log('Attack voice play failed:', err));

        // Stop after 2 seconds
        this.setTrackedTimeout(() => {
            sound.pause();
            sound.currentTime = 0;
        }, 2000);
    }

    /**
     * Play generic hit sound (cut short to 400ms)
     */
    playHitSound() {
        console.log(`💥 [Instance #${this.instanceId}] playHitSound() called`);

        // Check mute/combat state first
        if (window.arena?.audioMuted) return;
        if (this.muted) return;
        if (this.combatEnded) return;

        const hitSounds = [
            '/sfx/fighting_game_hit_fl-1759992821197.mp3',
            '/sfx/fighting_game_hit_fl_1-1759992838415.mp3'
        ];
        const randomHit = hitSounds[Math.floor(Math.random() * hitSounds.length)];

        const filename = randomHit.split('/').pop();
        const timestamp = Date.now();
        console.log(`🔊 [Instance #${this.instanceId}] Playing: ${filename} at ${timestamp} (${this.activeAudio.length} audio elements currently active)`);

        try {
            const audio = new Audio(randomHit);
            audio.volume = 0.5;
            this.trackAudio(audio);
            audio.play().catch(e => console.warn('Sound play failed:', e));

            // CRITICAL: Cut off after 400ms (hit sounds are 6+ seconds long!)
            this.setTrackedTimeout(() => {
                audio.pause();
                audio.currentTime = 0;
                // Remove from tracking immediately when manually stopped
                const index = this.activeAudio.indexOf(audio);
                if (index > -1) {
                    this.activeAudio.splice(index, 1);
                }
                console.log(`  ✂️ [Instance #${this.instanceId}] Cut off hit sound at 400ms`);
            }, 400);
        } catch (e) {
            console.warn('Error playing hit sound:', randomHit, e);
        }
    }

    /**
     * Play critical strike sound (same as PVP)
     */
    playCriticalSound() {
        // Check live muted state from arena
        if (window.arena?.audioMuted) return;
        if (this.muted) return;
        if (this.combatEnded) return; // Don't play if already cleaned up

        const timestamp = Date.now();
        console.log(`⚡ [Instance #${this.instanceId}] Playing critical sound at ${timestamp}`);

        const sound = new Audio(this.criticalSoundPath);
        sound.volume = 0.5;
        this.trackAudio(sound); // Track for cleanup
        sound.play().catch(err => console.log('Critical sound play failed:', err));

        // Stop after 1 second
        this.setTrackedTimeout(() => {
            sound.pause();
            sound.currentTime = 0;
        }, 1000);
    }

    /**
     * Play block/defend sound (same as PVP)
     */
    playBlockSound() {
        // Check live muted state from arena
        if (window.arena?.audioMuted) return;
        if (this.muted) return;
        if (this.combatEnded) return; // Don't play if already cleaned up

        console.log(`🛡️ [Instance #${this.instanceId}] Playing block sound`);

        const randomIndex = Math.floor(Math.random() * this.blockSoundPaths.length);
        const soundPath = this.blockSoundPaths[randomIndex];

        const sound = new Audio(soundPath);
        sound.volume = 0.5;
        this.trackAudio(sound); // Track for cleanup
        sound.play().catch(err => console.log('Block sound play failed:', err));

        // Stop after 1 second
        this.setTrackedTimeout(() => {
            sound.pause();
            sound.currentTime = 0;
        }, 1000);
    }

    /**
     * Play whoosh sound (for dodges)
     */
    playWhooshSound() {
        // Check live muted state from arena
        if (window.arena?.audioMuted) return;
        if (this.muted) return;
        if (this.combatEnded) return;

        console.log(`💨 [Instance #${this.instanceId}] Playing whoosh sound`);

        const sound = new Audio(this.whooshSoundPath);
        sound.volume = 0.5;
        this.trackAudio(sound);
        sound.play().catch(err => console.log('Whoosh sound play failed:', err));
    }

    /**
     * Play miss sound (for misses)
     */
    playMissSound() {
        // Check live muted state from arena
        if (window.arena?.audioMuted) return;
        if (this.muted) return;
        if (this.combatEnded) return;

        console.log(`❌ [Instance #${this.instanceId}] Playing miss sound`);

        const sound = new Audio(this.missSoundPath);
        sound.volume = 0.5;
        this.trackAudio(sound);
        sound.play().catch(err => console.log('Miss sound play failed:', err));
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
     * Updated to include defend/dodge mechanics
     * @returns {boolean} True if hero wins, false if monster wins
     */
    simulateBattle() {
        let simHeroHP = this.heroHP;
        let simMonsterHP = this.monsterHP;
        let simCurrentTurn = this.currentTurn;
        let simIsRabid = false;
        let simRabidRemaining = 0;
        let simHeroStunned = false;
        let simPoisonDamage = 0;
        let simPoisonTurns = 0;

        // Battle until someone dies
        while (simHeroHP > 0 && simMonsterHP > 0) {
            if (simCurrentTurn === 'hero') {
                // Handle poison damage at start of hero's turn
                if (simPoisonTurns > 0) {
                    simHeroHP -= simPoisonDamage;
                    simPoisonTurns--;
                    if (simHeroHP <= 0) break; // Hero dies from poison
                }

                // Check if hero is stunned (auto-miss)
                if (simHeroStunned) {
                    simHeroStunned = false;
                    simCurrentTurn = 'monster';
                    continue;
                }

                // Hero attacks
                const attackRoll = this.rollDie(6);

                if (attackRoll === 6) {
                    // Miss - no damage
                } else {
                    // Attack lands - check monster's defense
                    const monsterDefenseRoll = this.rollDie(6);
                    const isCrit = attackRoll === 5;
                    const damage = isCrit ? GAME_CONFIG.DAMAGE.CRITICAL : attackRoll;

                    if (monsterDefenseRoll === 3) {
                        // Monster defends - blocks all normal, half crit
                        if (isCrit) {
                            simMonsterHP -= Math.floor(damage / 2);
                        }
                        // Normal attacks: 0 damage (blocked)
                    } else if (monsterDefenseRoll === 6) {
                        // Monster dodges - no damage
                    } else {
                        // Hit - full damage
                        simMonsterHP -= damage;
                    }
                }
                simCurrentTurn = 'monster';
            } else {
                // Monster attacks

                // Wood Dummy never attacks
                if (this.monster.specialAbility?.neverAttacks) {
                    simCurrentTurn = 'hero';
                    continue;
                }

                // Check for special attacks (Raccoon Rabid)
                if (!simIsRabid &&
                    this.monster.specialAbility?.rabidChance &&
                    this.rollDie(100) <= this.monster.specialAbility.rabidChance) {
                    simIsRabid = true;
                    simRabidRemaining = this.monster.specialAbility.rabidAttackCount;
                }

                // Check for special attacks (Ram Charge)
                if (this.monster.specialAbility?.chargeChance &&
                    this.rollDie(100) <= this.monster.specialAbility.chargeChance) {
                    // Charge attack - check hero defense
                    const heroDefenseRoll = this.rollDie(6);
                    const chargeDamage = this.monster.specialAbility.chargeDamage || 10;

                    if (heroDefenseRoll === 3) {
                        // Defend - half damage
                        simHeroHP -= Math.floor(chargeDamage / 2);
                    } else if (heroDefenseRoll === 6) {
                        // Dodge - no damage
                    } else {
                        // Hit - full damage
                        simHeroHP -= chargeDamage;
                    }
                    simCurrentTurn = 'hero';
                    continue;
                }

                // Check for special attacks (Frog-Fish Sonic Croak)
                if (this.monster.specialAbility?.croakChance &&
                    this.rollDie(100) <= this.monster.specialAbility.croakChance) {
                    // Sonic croak - check hero defense
                    const heroDefenseRoll = this.rollDie(6);
                    const croakDamage = this.monster.specialAbility.croakDamage || 12;

                    if (heroDefenseRoll === 3) {
                        // Defend - half damage, still stunned
                        simHeroHP -= Math.floor(croakDamage / 2);
                        simHeroStunned = true;
                    } else if (heroDefenseRoll === 6) {
                        // Dodge - no damage, no stun
                    } else {
                        // Hit - full damage and stun
                        simHeroHP -= croakDamage;
                        simHeroStunned = true;
                    }
                    simCurrentTurn = 'hero';
                    continue;
                }

                // Check for special attacks (Ripplefang Venom Strike)
                if (this.monster.specialAbility?.venomStrike &&
                    this.rollDie(100) <= this.monster.specialAbility.venomStrike.venomChance) {
                    // Venom strike - check hero defense
                    const heroDefenseRoll = this.rollDie(6);
                    const venomDamage = this.monster.specialAbility.venomStrike.venomDamage || 8;
                    const poisonDamage = this.monster.specialAbility.venomStrike.poisonDamage || 2;
                    const poisonDuration = this.monster.specialAbility.venomStrike.poisonDuration || 3;

                    if (heroDefenseRoll === 3) {
                        // Defend - half damage, but still poisoned
                        simHeroHP -= Math.floor(venomDamage / 2);
                        simPoisonDamage = poisonDamage;
                        simPoisonTurns = poisonDuration;
                    } else if (heroDefenseRoll === 6) {
                        // Dodge - no damage, no poison
                    } else {
                        // Hit - full damage and poison
                        simHeroHP -= venomDamage;
                        simPoisonDamage = poisonDamage;
                        simPoisonTurns = poisonDuration;
                    }
                    simCurrentTurn = 'hero';
                    continue;
                }

                // Check for special attacks (Ripplefang Tidal Wave)
                if (this.monster.specialAbility?.tidalWave &&
                    this.rollDie(100) <= this.monster.specialAbility.tidalWave.waveChance) {
                    // Tidal wave - check hero defense
                    const heroDefenseRoll = this.rollDie(6);
                    const waveDamage = this.monster.specialAbility.tidalWave.waveDamage || 12;

                    if (heroDefenseRoll === 3) {
                        // Defend - half damage
                        simHeroHP -= Math.floor(waveDamage / 2);
                    } else if (heroDefenseRoll === 6) {
                        // Dodge - no damage
                    } else {
                        // Hit - full damage
                        simHeroHP -= waveDamage;
                    }
                    simCurrentTurn = 'hero';
                    continue;
                }

                // Normal attack
                const attackRoll = this.rollDie(6);

                if (attackRoll === 6) {
                    // Miss - no damage
                } else {
                    // Attack lands - check hero's defense
                    const heroDefenseRoll = this.rollDie(6);
                    const isCrit = attackRoll === 5;
                    const damage = isCrit ? GAME_CONFIG.DAMAGE.CRITICAL : attackRoll;

                    if (heroDefenseRoll === 3) {
                        // Hero defends - blocks all normal, half crit
                        if (isCrit) {
                            simHeroHP -= Math.floor(damage / 2);
                        }
                        // Normal attacks: 0 damage (blocked)
                    } else if (heroDefenseRoll === 6) {
                        // Hero dodges - no damage
                    } else {
                        // Hit - full damage
                        simHeroHP -= damage;
                    }
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
        let heroWinPercent = this.calculateWinProbability();

        // Clamp to minimum 0.01% (never show 0%)
        if (heroWinPercent === 0) {
            heroWinPercent = 0.01;
        }

        // Display formatting
        let displayText;
        if (heroWinPercent < 1) {
            displayText = '<1%';
        } else if (heroWinPercent > 99) {
            displayText = '>99%';
        } else {
            displayText = `${heroWinPercent}%`;
        }

        // Update display
        winOddsElement.textContent = displayText;

        // Update color based on odds
        winOddsElement.classList.remove('winning', 'losing', 'even');
        if (heroWinPercent >= 65) {
            winOddsElement.classList.add('winning');
        } else if (heroWinPercent <= 35) {
            winOddsElement.classList.add('losing');
        } else {
            winOddsElement.classList.add('even');
        }

        console.log(`📊 Win Odds Updated: Hero ${displayText} (actual: ${heroWinPercent.toFixed(2)}%)`);
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
     * @param {boolean} isPoison - If true, shows green poison damage
     * @param {boolean} isDraconicCrit - If true, shows DRACONIC CRIT!
     */
    showDamageNumber(fighter, damage, isCrit, isPoison = false, isDraconicCrit = false) {
        if (!fighter) return;

        const damageEl = document.createElement('div');
        if (isPoison) {
            damageEl.className = 'poison-damage-number';
            damageEl.textContent = `-${damage}`;
        } else {
            damageEl.className = isCrit ? 'crit-number' : 'damage-number';
            if (isDraconicCrit) {
                damageEl.textContent = 'DRACONIC CRIT!';
            } else {
                damageEl.textContent = isCrit ? 'CRITICAL' : `-${damage}`;
            }
        }
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
     * Show block visual effect
     */
    showBlockEffect(fighter) {
        if (!fighter) return;

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
                this.rabidJustEnded = true; // Flag for extra delay before hero attacks
                console.log(`🦝 Rabid attack ended!`);

                // Revert to normal monster sprite
                if (this.monsterSprite) {
                    this.monsterSprite.style.backgroundImage = `url('${this.monster.sprite}')`;
                    // Scale back to normal size
                    const baseTransform = this.getMonsterTransform();
                    this.monsterSprite.style.setProperty('transform', baseTransform, 'important');
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
        console.log(`🧹 Cleaning up PVECombatSystem instance #${this.instanceId}`);
        this.combatEnded = true;

        // Remove from active instances tracking
        const index = activeCombatSystems.indexOf(this.instanceId);
        if (index > -1) {
            activeCombatSystems.splice(index, 1);
        }
        console.log(`   Remaining active instances: [${activeCombatSystems.join(', ')}]`);

        // Clear all pending timeouts
        console.log(`   Clearing ${this.activeTimeouts.length} active timeouts`);
        this.activeTimeouts.forEach(timeoutId => clearTimeout(timeoutId));
        this.activeTimeouts = [];

        // Stop and clear all tracked audio
        console.log(`   Stopping ${this.activeAudio.length} active audio elements`);
        this.activeAudio.forEach(audio => {
            audio.pause();
            audio.currentTime = 0;
        });
        this.activeAudio = [];

        // Clean up rabid mode effects
        if (this.monsterSprite && this.monster) {
            this.monsterSprite.style.backgroundImage = `url('${this.monster.sprite}')`;
        }
        if (this.rabidTextElement) {
            this.rabidTextElement.remove();
            this.rabidTextElement = null;
        }

        // Clean up stunned status effects
        if (this.stunnedTextElement) {
            this.stunnedTextElement.remove();
            this.stunnedTextElement = null;
        }

        console.log(`   ✅ Cleanup complete for instance #${this.instanceId}`);
    }
}
