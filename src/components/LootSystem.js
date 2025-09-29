/**
 * Loot System Component
 * Handles loot progression and chest display
 */

export class LootSystem {
    constructor() {
        this.lootBox = null
        this.currentTier = 'unknown'
        this.lootTypes = [
            { name: 'unknown', material: 'Unknown', chestNumber: 8, tier: 'unknown' },
            { name: 'wood', material: 'Wooden', chestNumber: 7, tier: 'wood' },
            { name: 'stone', material: 'Stone', chestNumber: 6, tier: 'stone' },
            { name: 'bronze', material: 'Bronze', chestNumber: 5, tier: 'bronze' },
            { name: 'silver', material: 'Silver', chestNumber: 4, tier: 'silver' },
            { name: 'gold', material: 'Golden', chestNumber: 3, tier: 'gold' },
            { name: 'platinum', material: 'Platinum', chestNumber: 2, tier: 'platinum' },
            { name: 'diamond', material: 'Diamond', chestNumber: 1, tier: 'diamond' }
        ]
    }

    /**
     * Initialize the loot system
     */
    init(lootBox) {
        this.lootBox = lootBox

        if (!this.lootBox) {
            console.warn('Loot system: Loot box element not found')
            return
        }

        this.setupEventListeners()
        this.updateLootBox({ current: 1 }) // Initialize with first round
    }

    /**
     * Set up event listeners
     */
    setupEventListeners() {
        if (this.lootBox) {
            this.lootBox.addEventListener('click', () => this.onChestClick())
            this.lootBox.addEventListener('mouseenter', () => this.onChestHover())
            this.lootBox.addEventListener('mouseleave', () => this.onChestLeave())
        }
    }

    /**
     * Update loot box based on round info
     */
    updateLootBox(roundInfo) {
        if (!this.lootBox || !roundInfo) return

        const currentRound = Math.max(0, roundInfo.current - 1)
        const lootType = this.lootTypes[Math.min(currentRound, this.lootTypes.length - 1)]

        this.currentTier = lootType.name

        // Update loot header
        const lootHeader = document.querySelector('.loot-header')
        if (lootHeader) {
            lootHeader.textContent = `${lootType.material.toUpperCase()} LOOT`
        }

        // Update chest image
        this.updateChestImage(lootType)

        // Update container styling
        this.updateContainerStyling(lootType)
    }

    /**
     * Update the chest image
     */
    updateChestImage(lootType) {
        if (lootType.name === 'unknown') {
            this.lootBox.innerHTML = this.createUnknownChestSVG()
        } else {
            // Use original chest images with fallback to SVG
            const chestNumber = lootType.chestNumber.toString().padStart(2, '0')
            const imagePath = `/images/Loot/chest_${chestNumber}.png`

            this.lootBox.innerHTML = `
                <img src="${imagePath}"
                     alt="${lootType.material} Chest"
                     class="loot-chest-image loot-tier-${lootType.tier}"
                     onerror="this.style.display='none'; this.parentNode.innerHTML = \`${this.createChestSVG(lootType).replace(/`/g, '\\`')}\`">
            `
        }

        // Add glow effect for higher tiers
        if (['gold', 'platinum', 'diamond'].includes(lootType.tier)) {
            this.addGlowEffect(lootType.tier)
        }
    }

    /**
     * Update container styling based on loot tier
     */
    updateContainerStyling(lootType) {
        const lootContainer = document.querySelector('.loot-container')
        if (!lootContainer) return

        // Remove existing tier classes
        lootContainer.classList.remove(
            'loot-tier-unknown', 'loot-tier-wood', 'loot-tier-stone', 'loot-tier-bronze',
            'loot-tier-silver', 'loot-tier-gold', 'loot-tier-platinum', 'loot-tier-diamond'
        )

        // Add current tier class
        lootContainer.classList.add(`loot-tier-${lootType.tier}`)
    }

    /**
     * Add glow effect for premium tiers
     */
    addGlowEffect(tier) {
        const glowColors = {
            gold: 'rgba(255, 215, 0, 0.5)',
            platinum: 'rgba(229, 228, 226, 0.5)',
            diamond: 'rgba(185, 242, 255, 0.5)'
        }

        const glowColor = glowColors[tier]
        if (!glowColor) return

        // Create glow element
        const glow = document.createElement('div')
        glow.className = 'loot-chest-glow'
        glow.style.background = `radial-gradient(circle, ${glowColor} 0%, transparent 70%)`

        this.lootBox.appendChild(glow)
    }

    /**
     * Handle chest click
     */
    onChestClick() {
        // Add click animation
        const chest = this.lootBox.querySelector('.loot-chest-image')
        if (chest) {
            chest.style.transform = 'translateX(-50%) scale(0.95)'
            setTimeout(() => {
                chest.style.transform = 'translateX(-50%) scale(1.02)'
                setTimeout(() => {
                    chest.style.transform = 'translateX(-50%)'
                }, 100)
            }, 100)
        }

        // Show tier info
        this.showTierInfo()
    }

    /**
     * Handle chest hover
     */
    onChestHover() {
        const chest = this.lootBox.querySelector('.loot-chest-image')
        if (chest) {
            chest.style.filter = 'drop-shadow(0 0 15px rgba(255, 215, 0, 0.8)) brightness(1.1)'
        }
    }

    /**
     * Handle chest leave
     */
    onChestLeave() {
        const chest = this.lootBox.querySelector('.loot-chest-image')
        if (chest) {
            chest.style.filter = 'drop-shadow(2px 2px 8px rgba(0, 0, 0, 0.6))'
        }
    }

    /**
     * Show tier information
     */
    showTierInfo() {
        const lootType = this.lootTypes.find(type => type.name === this.currentTier)
        if (!lootType) return

        // Create info popup
        const info = document.createElement('div')
        info.className = 'loot-tier-info'
        info.innerHTML = `
            <div class="tier-name">${lootType.material} Tier</div>
            <div class="tier-description">Earned by reaching this tournament round</div>
        `
        info.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.9);
            color: #ffd700;
            padding: 15px 20px;
            border-radius: 10px;
            border: 2px solid #ffd700;
            font-weight: bold;
            text-align: center;
            z-index: 1000;
            animation: fadeInMessage 0.5s ease forwards;
            box-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
        `

        this.lootBox.appendChild(info)

        // Remove after delay
        setTimeout(() => {
            if (info.parentNode) {
                info.remove()
            }
        }, 2000)
    }

    /**
     * Get loot tier by round
     */
    getLootTierByRound(round) {
        const index = Math.max(0, Math.min(round - 1, this.lootTypes.length - 1))
        return this.lootTypes[index]
    }

    /**
     * Create SVG chest for unknown tier
     */
    createUnknownChestSVG() {
        return `
            <svg width="140" height="120" viewBox="0 0 120 100" class="loot-svg" id="unknown-loot">
                <!-- Mystery box base -->
                <rect x="25" y="50" width="70" height="35" fill="#404040" stroke="#303030" stroke-width="2" rx="3"/>
                <!-- Mystery box lid -->
                <path d="M25 50 Q25 35 60 35 Q95 35 95 50 L95 45 Q95 30 60 30 Q25 30 25 45 Z" fill="#606060" stroke="#404040" stroke-width="2"/>
                <!-- Question mark -->
                <text x="60" y="72" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="#FFD700" text-anchor="middle">?</text>
            </svg>
        `
    }

    /**
     * Create SVG chest for different tiers
     */
    createChestSVG(lootType) {
        const colors = {
            wood: { base: '#8B4513', accent: '#A0522D', metal: '#CD853F' },
            stone: { base: '#696969', accent: '#808080', metal: '#A9A9A9' },
            bronze: { base: '#CD7F32', accent: '#B87333', metal: '#DAA520' },
            silver: { base: '#C0C0C0', accent: '#D3D3D3', metal: '#E6E6FA' },
            gold: { base: '#FFD700', accent: '#FFA500', metal: '#FFFF00' },
            platinum: { base: '#E5E4E2', accent: '#F5F5DC', metal: '#FFFFFF' },
            diamond: { base: '#B9F2FF', accent: '#87CEEB', metal: '#E0FFFF' }
        }

        const color = colors[lootType.tier] || colors.wood

        return `
            <svg width="140" height="120" viewBox="0 0 120 100" class="loot-svg loot-tier-${lootType.tier}">
                <!-- Chest base -->
                <rect x="25" y="50" width="70" height="35" fill="${color.base}" stroke="${color.accent}" stroke-width="2" rx="5"/>
                <!-- Chest lid -->
                <path d="M25 50 Q25 35 60 35 Q95 35 95 50 L95 45 Q95 30 60 30 Q25 30 25 45 Z" fill="${color.accent}" stroke="${color.base}" stroke-width="2"/>
                <!-- Lock -->
                <rect x="55" y="45" width="10" height="15" fill="${color.metal}" stroke="${color.base}" stroke-width="1" rx="2"/>
                <circle cx="60" cy="52" r="3" fill="none" stroke="${color.base}" stroke-width="2"/>
                <!-- Gems for higher tiers -->
                ${(['gold', 'platinum', 'diamond'].includes(lootType.tier)) ? `
                    <circle cx="40" cy="42" r="2" fill="${color.metal}" opacity="0.8"/>
                    <circle cx="80" cy="42" r="2" fill="${color.metal}" opacity="0.8"/>
                    <circle cx="60" cy="38" r="2" fill="${color.metal}" opacity="0.8"/>
                ` : ''}
            </svg>
        `
    }

    /**
     * Reset to initial state
     */
    reset() {
        this.currentTier = 'unknown'
        this.updateLootBox({ current: 1 })
    }

    /**
     * Get current tier information
     */
    getCurrentTierInfo() {
        return this.lootTypes.find(type => type.name === this.currentTier)
    }

    /**
     * Preview tier for a specific round
     */
    previewTier(round) {
        const lootType = this.getLootTierByRound(round)
        return {
            name: lootType.material,
            tier: lootType.tier,
            chest: lootType.chestNumber
        }
    }
}