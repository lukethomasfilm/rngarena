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
        setTimeout(() => this.executeCombatBeat(), 1000);
    }

    /**
     * Execute one combat turn
     */
    executeCombatBeat() {
        if (this.combatEnded) return;

        const delay = this.fastForward ? 100 : 1800; // Fast forward = 100ms, normal = 1800ms

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
     * Execute monster's attack (Wood Dummy always misses)
     */
    executeMonsterAttack() {
        console.log(`🎯 ${this.monster.displayName} attacks! (Round ${this.combatRound})`);

        // Wood Dummy is on a stick - no attack animation (can't move!)

        setTimeout(() => {
            // Wood Dummy always misses (specialAbility.neverAttacks)
            if (this.monster.specialAbility && this.monster.specialAbility.neverAttacks) {
                this.handleMonsterMiss();
            } else {
                // Future monsters: normal attack logic
                const attackRoll = this.rollDie(6);
                if (attackRoll === 6) {
                    this.handleMonsterMiss();
                } else {
                    const isCrit = attackRoll === 5;
                    const damage = isCrit ? GAME_CONFIG.DAMAGE.CRITICAL : attackRoll;
                    this.handleHeroHit(damage, isCrit);
                }
            }
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
                this.showCriticalScreenFlash();
            }

            // Update monster HP
            this.monsterHP -= damage;
            this.battleSystem.updateMonsterHP(this.monsterHP, this.monster.maxHealth);

            // Check if monster is defeated
            if (this.monsterHP <= 0) {
                this.endCombat('hero');
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
        // Just show the MISS text
        this.showCombatText(this.monsterFighter, 'MISS!', 'miss-text');
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
            this.playHitSound();

            if (isCrit) {
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
     * Flash monster hit sprite
     */
    flashMonsterHit() {
        if (!this.monsterSprite || !this.monster.hitSprite) return;

        const originalSprite = this.monster.sprite;

        // Show hit sprite
        this.monsterSprite.style.backgroundImage = `url('${this.monster.hitSprite}')`;

        // Flash back to normal after 200ms
        setTimeout(() => {
            this.monsterSprite.style.backgroundImage = `url('${originalSprite}')`;
        }, 200);
    }

    /**
     * Play monster-specific hit sounds (dummywood + hay)
     */
    playMonsterHitSounds() {
        if (!this.monster.sfx) return;

        // Play random hit sound (dummywood1-3)
        if (this.monster.sfx.hit && this.monster.sfx.hit.length > 0) {
            const randomHit = this.monster.sfx.hit[Math.floor(Math.random() * this.monster.sfx.hit.length)];
            this.playSound(randomHit);
        }

        // Play hay sound
        if (this.monster.sfx.hay) {
            setTimeout(() => {
                this.playSound(this.monster.sfx.hay);
            }, 100); // Slight delay for layering
        }
    }

    /**
     * Play a sound file
     */
    playSound(path) {
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
        this.currentTurn = this.currentTurn === 'hero' ? 'monster' : 'hero';
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
        // Stop all audio elements
        document.querySelectorAll('audio').forEach(audio => {
            if (!audio.id.includes('home-music')) {
                audio.pause();
                audio.currentTime = 0;
            }
        });
    }
}
