import { LOOT_CONFIG, CHARACTER_CONFIG } from './constants.js';

/**
 * LootSystem - Handles loot chest progression and rewards
 */
export class LootSystem {
    constructor() {
        this.lootBox = document.getElementById('loot-box');
        this.lootHeader = document.querySelector('.loot-header');
        this.currentChestNumber = 8; // Start with lowest tier
    }

    /**
     * Update loot chest based on tournament round
     */
    updateLootBox(roundInfo) {
        if (!this.lootBox) return;

        // Loot tier progression (lower chest number = higher tier)
        const lootTiers = [
            { name: 'gray', material: 'Gray', chestNumber: 1 },      // Round 1
            { name: 'white', material: 'White', chestNumber: 2 },    // Round 2
            { name: 'green', material: 'Green', chestNumber: 3 },    // Round 3
            { name: 'blue', material: 'Blue', chestNumber: 4 },      // Round 4
            { name: 'purple', material: 'Purple', chestNumber: 5 },  // Round 5
            { name: 'orange', material: 'Orange', chestNumber: 6 },  // Round 6
            { name: 'gold', material: 'Gold', chestNumber: 7 },      // Quarterfinals
            { name: 'gold', material: 'LEGENDARY GOLD', chestNumber: 8 }  // Finals
        ];

        const currentRound = Math.max(0, roundInfo.current - 1);
        const lootTier = lootTiers[Math.min(currentRound, lootTiers.length - 1)];

        // Update loot header
        if (this.lootHeader) {
            this.lootHeader.textContent = `${lootTier.material.toUpperCase()} LOOT`;
        }

        // Construct chest image path
        const chestNumber = lootTier.chestNumber.toString().padStart(2, '0');
        const newImageSrc = `${CHARACTER_CONFIG.LOOT_PATH}chest_${chestNumber}.png`;

        // Check if chest needs to change
        const currentImg = this.lootBox.querySelector('.loot-chest-image');
        if (currentImg && currentImg.src.includes(`chest_${chestNumber}.png`)) {
            return; // Same chest, no need to change
        }

        // Add fade transition
        this.lootBox.style.opacity = '0';
        this.lootBox.style.transition = 'opacity 0.3s ease-in-out';

        setTimeout(() => {
            this.lootBox.innerHTML = `<img src="${newImageSrc}" alt="${lootTier.material} Chest" class="loot-chest-image">`;
            this.lootBox.style.opacity = '1';
            this.currentChestNumber = lootTier.chestNumber;
        }, 300);
    }

    /**
     * Add victory glow effect to chest (tournament winner)
     */
    addVictoryGlow() {
        const chestImage = document.querySelector('.loot-chest-image');
        if (chestImage) {
            chestImage.style.filter = 'drop-shadow(0 0 15px gold) drop-shadow(0 0 30px gold)';
            chestImage.style.animation = 'victory-glow 2s ease-in-out infinite';
        }
    }

    /**
     * Remove victory glow effect
     */
    removeVictoryGlow() {
        const chestImage = document.querySelector('.loot-chest-image');
        if (chestImage) {
            chestImage.style.filter = '';
            chestImage.style.animation = '';
        }
    }

    /**
     * Get current loot tier name
     */
    getCurrentTier() {
        return LOOT_CONFIG.TIERS[this.currentChestNumber - 1] || 'unknown';
    }

    /**
     * Get loot tier color
     */
    getTierColor(tier) {
        return LOOT_CONFIG.TIER_COLORS[tier] || '#FFFFFF';
    }

    /**
     * Reset loot to initial state
     */
    reset() {
        this.currentChestNumber = 1;
        this.removeVictoryGlow();

        if (this.lootHeader) {
            this.lootHeader.textContent = 'LOOT TIER';
        }

        if (this.lootBox) {
            const initialImageSrc = `${CHARACTER_CONFIG.LOOT_PATH}chest_01.png`;
            this.lootBox.innerHTML = `<img src="${initialImageSrc}" alt="Gray Chest" class="loot-chest-image">`;
            this.lootBox.style.opacity = '1';
        }
    }

    /**
     * Set loot to maximum tier (gold)
     */
    setMaxTier() {
        if (!this.lootBox) return;

        const goldImageSrc = `${CHARACTER_CONFIG.LOOT_PATH}chest_08.png`;
        this.lootBox.style.opacity = '0';
        this.lootBox.style.transition = 'opacity 0.3s ease-in-out';

        setTimeout(() => {
            this.lootBox.innerHTML = `<img src="${goldImageSrc}" alt="Legendary Gold Chest" class="loot-chest-image">`;
            this.lootBox.style.opacity = '1';
            this.currentChestNumber = 8;
            this.addVictoryGlow();
        }, 300);

        if (this.lootHeader) {
            this.lootHeader.textContent = 'LEGENDARY GOLD';
        }
    }

    /**
     * Animate chest opening (placeholder for future feature)
     */
    animateChestOpening() {
        const chestImage = document.querySelector('.loot-chest-image');
        if (chestImage) {
            chestImage.style.animation = 'chest-shake 0.5s ease-in-out';
            setTimeout(() => {
                chestImage.style.animation = '';
            }, 500);
        }
    }
}
