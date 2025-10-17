import { LOOT_CONFIG, CHARACTER_CONFIG } from './constants.js';

/**
 * LootSystem - Handles loot chest progression and rewards
 */
export class LootSystem {
    constructor() {
        this.lootBox = document.getElementById('loot-box');
        this.lootHeaderTop = document.querySelector('.loot-header-top');
        this.lootHeaderBottom = document.querySelector('.loot-header-bottom');
        this.currentChestNumber = 8; // Start with lowest tier (Common Wood = chest_08)

        // Dev loot elements
        this.devLootBox = document.getElementById('dev-loot-box');
        this.devLootHeaderTop = document.querySelector('.dev-loot-header-top');
        this.devLootHeaderBottom = document.querySelector('.dev-loot-header-bottom');

        // Popup loot elements
        this.popupLootBox = document.getElementById('popup-loot-box');
        this.popupLootHeaderTop = document.querySelector('.popup-loot-header-top');
        this.popupLootHeaderBottom = document.querySelector('.popup-loot-header-bottom');
    }

    /**
     * Update loot chest based on tournament round
     */
    updateLootBox(roundInfo) {
        if (!this.lootBox) return;

        // Don't update if loot has already been claimed
        const isLootClaimed = window.arena &&
            (window.arena.heroLootOnlyMode ? window.arena.heroLootClaimed : window.arena.tournamentLootClaimed);
        if (isLootClaimed) {
            return; // Keep the helmet displayed
        }

        // Loot tier progression - New system
        const lootTiers = [
            { name: 'grey', material: 'Wood', rarity: 'Common', chestNumber: 8 },       // Round 1
            { name: 'green', material: 'Stone', rarity: 'Uncommon', chestNumber: 7 },   // Round 2
            { name: 'blue', material: 'Copper', rarity: 'Rare', chestNumber: 6 },       // Round 3
            { name: 'teal', material: 'Bronze', rarity: 'Superior', chestNumber: 5 },   // Round 4
            { name: 'purple', material: 'Silver', rarity: 'Epic', chestNumber: 4 },     // Round 5
            { name: 'orange', material: 'Gold', rarity: 'Legendary', chestNumber: 3 },  // Round 6
            { name: 'crimson', material: 'Diamond', rarity: 'Mythic', chestNumber: 2 }, // Round 7
            { name: 'gold', material: 'Platinum', rarity: 'Exalted', chestNumber: 1 }   // Round 8
        ];

        const currentRound = Math.max(0, roundInfo.current - 1);
        const lootTier = lootTiers[Math.min(currentRound, lootTiers.length - 1)];

        // Update bottom loot header with tier info
        if (this.lootHeaderBottom) {
            const material = lootTier.material.toUpperCase();
            const rarity = lootTier.rarity.toUpperCase();
            this.lootHeaderBottom.innerHTML = `${material} CHEST<br>${rarity} LOOT`;

            // Apply tier color from progress bar colors
            const tierColors = {
                'grey': 'linear-gradient(135deg, #808080, #a0a0a0, #606060)',
                'green': 'linear-gradient(135deg, #00ff7f, #32cd32, #228b22)',
                'blue': 'linear-gradient(135deg, #4169e1, #1e90ff, #0066cc)',
                'teal': 'linear-gradient(135deg, #00CED1, #20B2AA, #008B8B)',
                'purple': 'linear-gradient(135deg, #8a2be2, #9370db, #6a0dad)',
                'orange': 'linear-gradient(135deg, #ff8c00, #ffa500, #ff6347)',
                'crimson': 'linear-gradient(135deg, #DC143C, #B22222, #8B0000)',
                'gold': 'linear-gradient(135deg, #ffd700, #ffed4a, #daa520)'
            };

            const tierName = lootTier.name.toLowerCase();
            if (tierColors[tierName]) {
                this.lootHeaderBottom.style.background = tierColors[tierName];
                // Use white text for all backgrounds
                this.lootHeaderBottom.style.color = '#fff';
            }
        }

        // Construct chest image path
        const chestNumber = lootTier.chestNumber.toString().padStart(2, '0');
        const newImageSrc = `${CHARACTER_CONFIG.LOOT_PATH}chest_${chestNumber}.png`;

        // Check if chest needs to change
        const currentImg = this.lootBox.querySelector('.loot-chest-image');
        if (currentImg && currentImg.src.includes(`chest_${chestNumber}.png`)) {
            return; // Same chest, no need to change
        }

        // Check if button should be visible based on game state (not just previous state)
        const shouldShowButton = window.arena && window.arena.heroEliminated && window.arena.heroLootOnlyMode;

        // Add fade transition
        this.lootBox.style.opacity = '0';
        this.lootBox.style.transition = 'opacity 0.3s ease-in-out';

        setTimeout(() => {
            const buttonClass = shouldShowButton ? 'claim-loot-btn' : 'claim-loot-btn hidden';
            this.lootBox.innerHTML = `
                <img src="${CHARACTER_CONFIG.LOOT_PATH}chest_shadow.png" alt="Chest Shadow" class="loot-chest-shadow">
                <img src="${newImageSrc}" alt="${lootTier.material} Chest" class="loot-chest-image">
                <button id="claim-loot-btn" class="${buttonClass}">CLAIM LOOT</button>
            `;
            this.lootBox.style.opacity = '1';
            this.currentChestNumber = lootTier.chestNumber;

            // Re-initialize claim button event listener after HTML update
            const claimBtn = document.getElementById('claim-loot-btn');
            if (claimBtn && window.arena) {
                claimBtn.addEventListener('click', () => {
                    window.arena.claimLoot();
                });
            }

            // Re-apply claimable state only if button should be visible
            if (shouldShowButton) {
                this.lootBox.classList.add('claimable');
            }
        }, 300);

        // Update dev loot chest and popup as well
        this.updateDevLoot(lootTier);
        this.updatePopupLoot(lootTier);
    }

    /**
     * Update dev loot claim frame chest
     */
    updateDevLoot(lootTier) {
        if (!this.devLootBox) return;

        // Dev loot header top - uses CSS stone texture (no text)

        // Update dev loot header bottom with tier info
        if (this.devLootHeaderBottom) {
            const material = lootTier.material.toUpperCase();
            const rarity = lootTier.rarity.toUpperCase();
            this.devLootHeaderBottom.innerHTML = `${material} CHEST<br>${rarity} LOOT`;

            // Apply tier color from progress bar colors
            const tierColors = {
                'grey': 'linear-gradient(135deg, #808080, #a0a0a0, #606060)',
                'green': 'linear-gradient(135deg, #00ff7f, #32cd32, #228b22)',
                'blue': 'linear-gradient(135deg, #4169e1, #1e90ff, #0066cc)',
                'teal': 'linear-gradient(135deg, #00CED1, #20B2AA, #008B8B)',
                'purple': 'linear-gradient(135deg, #8a2be2, #9370db, #6a0dad)',
                'orange': 'linear-gradient(135deg, #ff8c00, #ffa500, #ff6347)',
                'crimson': 'linear-gradient(135deg, #DC143C, #B22222, #8B0000)',
                'gold': 'linear-gradient(135deg, #ffd700, #ffed4a, #daa520)'
            };

            const tierName = lootTier.name.toLowerCase();
            if (tierColors[tierName]) {
                this.devLootHeaderBottom.style.background = tierColors[tierName];
                this.devLootHeaderBottom.style.color = '#fff';
            }
        }

        // Update dev chest image
        const chestNumber = lootTier.chestNumber.toString().padStart(2, '0');
        const newImageSrc = `${CHARACTER_CONFIG.LOOT_PATH}chest_${chestNumber}.png`;

        this.devLootBox.innerHTML = `
            <img src="${newImageSrc}" alt="${lootTier.material} Chest" class="dev-loot-chest-image">
        `;
    }

    /**
     * Update popup loot chest
     */
    updatePopupLoot(lootTier) {
        if (!this.popupLootBox) return;

        // Popup loot header top - uses CSS stone texture (no text)

        // Update popup loot header bottom with tier info
        if (this.popupLootHeaderBottom) {
            const material = lootTier.material.toUpperCase();
            const rarity = lootTier.rarity.toUpperCase();
            this.popupLootHeaderBottom.innerHTML = `${material} CHEST<br>${rarity} LOOT`;

            // Apply tier color from progress bar colors
            const tierColors = {
                'grey': 'linear-gradient(135deg, #808080, #a0a0a0, #606060)',
                'green': 'linear-gradient(135deg, #00ff7f, #32cd32, #228b22)',
                'blue': 'linear-gradient(135deg, #4169e1, #1e90ff, #0066cc)',
                'teal': 'linear-gradient(135deg, #00CED1, #20B2AA, #008B8B)',
                'purple': 'linear-gradient(135deg, #8a2be2, #9370db, #6a0dad)',
                'orange': 'linear-gradient(135deg, #ff8c00, #ffa500, #ff6347)',
                'crimson': 'linear-gradient(135deg, #DC143C, #B22222, #8B0000)',
                'gold': 'linear-gradient(135deg, #ffd700, #ffed4a, #daa520)'
            };

            const tierName = lootTier.name.toLowerCase();
            if (tierColors[tierName]) {
                this.popupLootHeaderBottom.style.background = tierColors[tierName];
                this.popupLootHeaderBottom.style.color = '#fff';
            }
        }

        // Update popup chest image
        const chestNumber = lootTier.chestNumber.toString().padStart(2, '0');
        const newImageSrc = `${CHARACTER_CONFIG.LOOT_PATH}chest_${chestNumber}.png`;

        this.popupLootBox.innerHTML = `
            <img src="${newImageSrc}" alt="${lootTier.material} Chest" class="popup-loot-chest-image">
        `;
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

        // Add dark backdrop behind chest
        if (this.lootBox) {
            this.lootBox.classList.add('victory-backdrop');
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

        // Remove dark backdrop
        if (this.lootBox) {
            this.lootBox.classList.remove('victory-backdrop');
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
        this.currentChestNumber = 8;
        this.removeVictoryGlow();

        // Top header uses CSS stone texture (no text)

        // Bottom header resets to Wood/Common
        if (this.lootHeaderBottom) {
            this.lootHeaderBottom.innerHTML = 'WOOD CHEST<br>COMMON LOOT';
            this.lootHeaderBottom.style.background = 'linear-gradient(135deg, #808080, #a0a0a0, #606060)';
            this.lootHeaderBottom.style.color = '#fff';
        }

        if (this.lootBox) {
            const initialImageSrc = `${CHARACTER_CONFIG.LOOT_PATH}chest_08.png`;
            this.lootBox.innerHTML = `
                <img src="${CHARACTER_CONFIG.LOOT_PATH}chest_shadow.png" alt="Chest Shadow" class="loot-chest-shadow">
                <img src="${initialImageSrc}" alt="Common Wood Chest" class="loot-chest-image">
            `;
            this.lootBox.style.opacity = '1';
        }
    }

    /**
     * Set loot to maximum tier (Platinum/Exalted)
     */
    setMaxTier() {
        if (!this.lootBox) return;

        const platinumImageSrc = `${CHARACTER_CONFIG.LOOT_PATH}chest_01.png`;
        this.lootBox.style.opacity = '0';
        this.lootBox.style.transition = 'opacity 0.3s ease-in-out';

        setTimeout(() => {
            this.lootBox.innerHTML = `
                <img src="${CHARACTER_CONFIG.LOOT_PATH}chest_shadow.png" alt="Chest Shadow" class="loot-chest-shadow">
                <img src="${platinumImageSrc}" alt="Exalted Platinum Chest" class="loot-chest-image">
            `;
            this.lootBox.style.opacity = '1';
            this.currentChestNumber = 1;
            this.addVictoryGlow();
        }, 300);

        // Top header stays gold always (already set)
        // Bottom header shows Platinum/Exalted
        if (this.lootHeaderBottom) {
            this.lootHeaderBottom.innerHTML = 'PLATINUM CHEST<br>EXALTED LOOT';
            // Apply gold gradient
            this.lootHeaderBottom.style.background = 'linear-gradient(135deg, #ffd700, #ffed4a, #daa520)';
            this.lootHeaderBottom.style.color = '#000';
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
