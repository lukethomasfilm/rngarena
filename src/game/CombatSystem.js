/**
 * Combat System
 * Handles battle mechanics, animations, and victory conditions
 */

export class CombatSystem {
    constructor() {
        this.leftFighterHP = 0
        this.rightFighterHP = 0
        this.maxHP = 10
        this.isInCombat = false
        this.arena = null
    }

    /**
     * Initialize combat system
     */
    init(arena) {
        this.arena = arena
    }

    /**
     * Execute a complete battle
     */
    async executeBattle() {
        if (this.isInCombat) return null

        try {
            this.isInCombat = true

            // Initialize battle
            this.initBattle()

            // Run combat loop
            const result = await this.runCombatLoop()

            // Clean up
            this.cleanupBattle()

            return result

        } catch (error) {
            console.error('Combat execution failed:', error)
            return null
        } finally {
            this.isInCombat = false
        }
    }

    /**
     * Initialize battle state
     */
    initBattle() {
        const roundInfo = this.arena.tournament.getRoundInfo()
        this.maxHP = this.getMaxHPForRound(roundInfo.current)
        this.leftFighterHP = this.maxHP
        this.rightFighterHP = this.maxHP

        // Initialize health displays
        this.initHealthDisplays()

        // Update battle status if element exists
        if (this.arena.elements.battleStatus) {
            this.arena.elements.battleStatus.textContent = 'Battle in progress...'
        }
    }

    /**
     * Get max HP based on current round
     */
    getMaxHPForRound(currentRound) {
        // HP scaling: 5HP base, 8HP quarters, 12HP semis, 20HP final
        if (currentRound >= 7) return 20 // Final
        if (currentRound >= 6) return 12 // Semifinals
        if (currentRound >= 5) return 8  // Quarterfinals
        return 5 // All earlier rounds
    }

    /**
     * Initialize health displays
     */
    initHealthDisplays() {
        // Remove existing health displays
        this.arena.elements.leftFighter.querySelectorAll('.fighter-health').forEach(el => el.remove())
        this.arena.elements.rightFighter.querySelectorAll('.fighter-health').forEach(el => el.remove())

        // Create new health displays
        this.createHealthDisplay(this.arena.elements.leftFighter, this.leftFighterHP)
        this.createHealthDisplay(this.arena.elements.rightFighter, this.rightFighterHP)
    }

    /**
     * Create health display for a fighter
     */
    createHealthDisplay(fighter, hp) {
        const healthContainer = document.createElement('div')
        healthContainer.className = 'fighter-health'

        for (let i = 0; i < hp; i++) {
            const heart = document.createElement('div')
            heart.className = 'health-heart'
            healthContainer.appendChild(heart)
        }

        fighter.appendChild(healthContainer)
    }

    /**
     * Run the main combat loop
     */
    async runCombatLoop() {
        return new Promise((resolve) => {
            const executeTurn = () => {
                // Check for battle end
                if (this.leftFighterHP <= 0 || this.rightFighterHP <= 0) {
                    const leftWins = this.rightFighterHP <= 0
                    const winner = leftWins ? this.arena.elements.leftFighterName.textContent : this.arena.elements.rightFighterName.textContent
                    const loser = leftWins ? this.arena.elements.rightFighterName.textContent : this.arena.elements.leftFighterName.textContent

                    resolve({
                        leftWins,
                        winner,
                        loser,
                        leftHP: this.leftFighterHP,
                        rightHP: this.rightFighterHP
                    })
                    return
                }

                // Execute combat turn
                this.executeCombatTurn()

                // Continue combat after delay
                setTimeout(executeTurn, 1500)
            }

            // Start combat after initial delay
            setTimeout(executeTurn, 1000)
        })
    }

    /**
     * Execute a single combat turn
     */
    executeCombatTurn() {
        const leftAttacks = Math.random() < 0.5

        if (leftAttacks) {
            this.executeAttack('left', 'right')
        } else {
            this.executeAttack('right', 'left')
        }
    }

    /**
     * Execute an attack
     */
    executeAttack(attackerSide, defenderSide) {
        const damage = this.calculateDamage()
        const isCrit = damage === 7

        // Apply damage
        if (defenderSide === 'left') {
            this.leftFighterHP = Math.max(0, this.leftFighterHP - damage)
            this.updateHealthDisplay(this.arena.elements.leftFighter, this.leftFighterHP)
        } else {
            this.rightFighterHP = Math.max(0, this.rightFighterHP - damage)
            this.updateHealthDisplay(this.arena.elements.rightFighter, this.rightFighterHP)
        }

        // Show attack animation
        this.showAttackAnimation(attackerSide, defenderSide, damage, isCrit)

        // Add battle message
        const attacker = attackerSide === 'left' ? this.arena.elements.leftFighterName.textContent : this.arena.elements.rightFighterName.textContent
        const defender = defenderSide === 'left' ? this.arena.elements.leftFighterName.textContent : this.arena.elements.rightFighterName.textContent

        const critText = isCrit ? ' CRITICAL HIT!' : ''
        this.arena.chat.addBattleMessage(`${attacker} deals ${damage} damage to ${defender}${critText}`)
    }

    /**
     * Calculate attack damage
     */
    calculateDamage() {
        const roll = Math.random()

        // 7 damage (crit): 12.5% chance
        if (roll < 0.125) return 7

        // 3 damage: 25% chance
        if (roll < 0.375) return 3

        // 2 damage: 25% chance
        if (roll < 0.625) return 2

        // 1 damage: 37.5% chance
        return 1
    }

    /**
     * Update health display
     */
    updateHealthDisplay(fighter, currentHP) {
        const healthContainer = fighter.querySelector('.fighter-health')
        if (!healthContainer) return

        const hearts = healthContainer.querySelectorAll('.health-heart')
        hearts.forEach((heart, index) => {
            if (index >= currentHP) {
                heart.classList.add('lost')
            } else {
                heart.classList.remove('lost')
            }
        })
    }

    /**
     * Show attack animation
     */
    showAttackAnimation(attackerSide, defenderSide, damage, isCrit) {
        const attacker = attackerSide === 'left' ? this.arena.elements.leftFighter : this.arena.elements.rightFighter
        const defender = defenderSide === 'left' ? this.arena.elements.leftFighter : this.arena.elements.rightFighter

        // Attacker animation
        const attackerSprite = attacker.querySelector('.fighter-sprite')
        if (attackerSprite) {
            attackerSprite.style.animation = 'attack 0.5s ease-in-out'
            setTimeout(() => {
                attackerSprite.style.animation = ''
            }, 500)
        }

        // Defender animation (damage taken)
        const defenderSprite = defender.querySelector('.fighter-sprite img')
        if (defenderSprite && isCrit) {
            defenderSprite.style.filter = 'drop-shadow(0 0 20px red) drop-shadow(0 0 40px red)'
            setTimeout(() => {
                defenderSprite.style.filter = 'drop-shadow(2px 2px 8px rgba(0, 0, 0, 0.6))'
            }, 1000)
        }

        // Show damage number
        this.showDamageNumber(defender, damage, isCrit)
    }

    /**
     * Show floating damage number
     */
    showDamageNumber(fighter, damage, isCrit) {
        const damageEl = document.createElement('div')
        damageEl.textContent = `-${damage}`
        damageEl.className = `damage-number ${isCrit ? 'crit' : ''}`
        damageEl.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: ${isCrit ? '2rem' : '1.5rem'};
            font-weight: bold;
            color: ${isCrit ? '#ff0000' : '#ffff00'};
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
            pointer-events: none;
            animation: damageFloat 1.5s ease-out forwards;
            z-index: 100;
        `

        fighter.appendChild(damageEl)

        setTimeout(() => {
            if (damageEl.parentNode) {
                damageEl.parentNode.removeChild(damageEl)
            }
        }, 1500)
    }

    /**
     * Clean up after battle
     */
    cleanupBattle() {
        // Remove health displays
        this.arena.elements.leftFighter.querySelectorAll('.fighter-health').forEach(el => el.remove())
        this.arena.elements.rightFighter.querySelectorAll('.fighter-health').forEach(el => el.remove())

        // Reset battle status if element exists
        if (this.arena.elements.battleStatus) {
            this.arena.elements.battleStatus.textContent = 'Battle completed'
        }
    }

    /**
     * Show victory animation for tournament winner
     */
    showVictoryAnimation(winner) {
        // Determine which fighter is the winner
        const leftFighterName = this.arena.elements.leftFighterName.textContent
        const rightFighterName = this.arena.elements.rightFighterName.textContent

        let winnerFighter, winnerSide
        if (leftFighterName === winner) {
            winnerFighter = this.arena.elements.leftFighter
            winnerSide = 'left'
        } else if (rightFighterName === winner) {
            winnerFighter = this.arena.elements.rightFighter
            winnerSide = 'right'
        } else {
            // Winner not currently displayed, use left fighter position
            winnerFighter = this.arena.elements.leftFighter
            winnerSide = 'left'
            this.arena.elements.leftFighterName.textContent = winner
            const winnerTitles = this.arena.tournament.getCharacterTitles(winner)
            this.arena.elements.leftFighterTitles.textContent = winnerTitles.join(' • ')
        }

        // Hide the other fighter
        const otherFighter = winnerSide === 'left' ? this.arena.elements.rightFighter : this.arena.elements.leftFighter
        otherFighter.style.opacity = '0'

        // Set CSS custom properties for animation
        const startPosition = winnerSide === 'left' ? '15%' : '85%'
        const startTransform = winnerSide === 'left' ? '0%' : '-100%'

        winnerFighter.style.setProperty('--start-position', startPosition)
        winnerFighter.style.setProperty('--start-transform', startTransform)

        // Add victory center class to trigger animation
        winnerFighter.classList.add('victory-center')

        // Add white glow effect to winner
        const winnerSprite = winnerFighter.querySelector('.fighter-sprite img')
        if (winnerSprite) {
            winnerSprite.style.filter = 'drop-shadow(0 0 20px white) drop-shadow(0 0 40px white) drop-shadow(0 0 60px white)'
            winnerSprite.style.animation = 'victory-glow 2s ease-in-out infinite'
        }

        // Create crown and victory text
        setTimeout(() => {
            const crown = document.createElement('div')
            crown.className = 'victory-crown'
            crown.textContent = '👑'
            winnerFighter.appendChild(crown)
        }, 1000)
    }
}