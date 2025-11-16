/**
 * GearLibrary.js
 * Manages the gear library screens and gear interactions
 */

import { getAllGear, getGearById, getGearByGearType } from './GearData.js';
import { GearEquipSystem } from './GearEquipSystem.js';

export class GearLibrary {
    constructor() {
        this.currentPopup = null;
        this.hoverTimeout = null;
        this.pvpEquipSystem = null;
        this.pveEquipSystem = null;
        this.arena = null; // Reference to RNGArena for player inventory
        this.createStatPopup();
    }

    /**
     * Create a single reusable stat popup
     */
    createStatPopup() {
        const popup = document.createElement('div');
        popup.className = 'gear-stat-popup';
        popup.id = 'gear-hover-popup';
        document.body.appendChild(popup);
        this.currentPopup = popup;
    }

    /**
     * Load gear into PVP library
     */
    loadPVPGearLibrary() {
        const pvpScrollContainer = document.getElementById('pvp-gear-scroll');
        if (!pvpScrollContainer) {
            console.error('❌ PVP gear scroll container not found');
            return;
        }

        this.populateGearGrid(pvpScrollContainer, 'pvp');

        // Initialize PVP equip system
        if (!this.pvpEquipSystem) {
            this.pvpEquipSystem = new GearEquipSystem('pvp');
            this.pvpEquipSystem.init();
        }
    }

    /**
     * Refresh PVP gear library (call after adding items to inventory)
     */
    refreshPVPGearLibrary() {
        const pvpScrollContainer = document.getElementById('pvp-gear-scroll');
        if (pvpScrollContainer) {
            this.populateGearGrid(pvpScrollContainer, 'pvp');
        }
    }

    /**
     * Load gear into PVE library
     */
    loadPVEGearLibrary() {
        const pveScrollContainer = document.getElementById('pve-gear-scroll');
        if (!pveScrollContainer) {
            console.error('❌ PVE gear scroll container not found');
            return;
        }

        this.populateGearGrid(pveScrollContainer, 'pve');

        // Initialize PVE equip system
        if (!this.pveEquipSystem) {
            this.pveEquipSystem = new GearEquipSystem('pve');
            this.pveEquipSystem.init();
        }
    }

    /**
     * Refresh PVE gear library (call after adding items to inventory)
     */
    refreshPVEGearLibrary() {
        const pveScrollContainer = document.getElementById('pve-gear-scroll');
        if (pveScrollContainer) {
            this.populateGearGrid(pveScrollContainer, 'pve');
        }
    }

    /**
     * Populate gear grid with items
     */
    populateGearGrid(container, libraryType = 'pve') {
        container.innerHTML = '';
        const allGear = getAllGear();
        const totalSlots = 80;

        // Filter by library type (pvp/pve) and owned items
        const ownedGear = allGear.filter(gear => {
            const matchesType = gear.gearType === libraryType;
            const isOwned = this.arena && this.arena.ownsItem(gear.id);
            return matchesType && isOwned;
        });

        // Add owned gear items
        ownedGear.forEach(gear => {
            const gearItem = document.createElement('div');
            gearItem.className = 'gear-item';
            gearItem.dataset.gearId = gear.id;
            gearItem.draggable = true; // Make item draggable

            // Add tier class for border color
            if (gear.tier) {
                gearItem.classList.add(`tier-${gear.tier}`);
            }

            // Use emoji placeholder for items without real images
            const emojiPlaceholders = {
                helmet: '⛑️',
                chest: '🎽',
                gauntlets: '🧤',
                pants: '👖',
                boots: '👢',
                cape: '🧥',
                ring: '💍',
                weapon: '⚔️',
                offhand: '🛡️',
                trinket: '💎'
            };

            // If using placeholder image, show emoji instead
            if (gear.image.includes('Loot_helmet_test.png')) {
                const emoji = document.createElement('div');
                emoji.className = 'gear-emoji-placeholder';
                emoji.textContent = emojiPlaceholders[gear.type] || '❓';
                emoji.style.cssText = `
                    font-size: 32px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    height: 100%;
                `;
                gearItem.appendChild(emoji);
            } else {
                const img = document.createElement('img');
                img.src = gear.image;
                img.alt = gear.name;
                gearItem.appendChild(img);
            }

            // Hover handlers to show stat popup
            gearItem.addEventListener('mouseenter', (e) => {
                clearTimeout(this.hoverTimeout);
                this.hoverTimeout = setTimeout(() => {
                    this.showGearHoverPopup(gear, gearItem);
                }, 100);
            });

            gearItem.addEventListener('mouseleave', () => {
                clearTimeout(this.hoverTimeout);
                this.hideGearHoverPopup();
            });

            container.appendChild(gearItem);
        });

        // Fill remaining slots with empty boxes
        const emptySlots = totalSlots - ownedGear.length;
        for (let i = 0; i < emptySlots; i++) {
            const emptyItem = document.createElement('div');
            emptyItem.className = 'gear-item';
            container.appendChild(emptyItem);
        }

        console.log(`✅ Loaded ${ownedGear.length} owned gear items and ${emptySlots} empty slots (${totalSlots} total)`);
    }

    /**
     * Show gear hover popup
     */
    showGearHoverPopup(gear, gearElement) {
        if (!this.currentPopup) return;

        // Build popup content
        this.currentPopup.innerHTML = '';

        // Header
        const header = document.createElement('div');
        header.className = 'gear-stat-popup-header';
        header.textContent = gear.name;
        this.currentPopup.appendChild(header);

        // Image or Emoji
        const imageContainer = document.createElement('div');
        imageContainer.className = 'gear-stat-popup-image';

        if (gear.image.includes('Loot_helmet_test.png')) {
            // Show emoji placeholder
            const emojiPlaceholders = {
                helmet: '⛑️',
                chest: '🎽',
                gauntlets: '🧤',
                pants: '👖',
                boots: '👢',
                cape: '🧥',
                ring: '💍',
                weapon: '⚔️',
                offhand: '🛡️',
                trinket: '💎'
            };
            const emoji = document.createElement('div');
            emoji.style.fontSize = '48px';
            emoji.style.textAlign = 'center';
            emoji.textContent = emojiPlaceholders[gear.type] || '❓';
            imageContainer.appendChild(emoji);
        } else {
            const img = document.createElement('img');
            img.src = gear.image;
            img.alt = gear.name;
            imageContainer.appendChild(img);
        }
        this.currentPopup.appendChild(imageContainer);

        // Stats Container
        const statsContainer = document.createElement('div');
        statsContainer.className = 'gear-stat-popup-stats';

        // Always show rating
        const ratingRow = document.createElement('div');
        ratingRow.className = 'gear-stat-row';
        const ratingLabel = document.createElement('span');
        ratingLabel.className = 'gear-stat-label';
        ratingLabel.textContent = 'Rating';
        const ratingValue = document.createElement('span');
        ratingValue.className = 'gear-stat-value';
        ratingValue.textContent = gear.rating || 0;
        ratingRow.appendChild(ratingLabel);
        ratingRow.appendChild(ratingValue);
        statsContainer.appendChild(ratingRow);

        // Show stats only for PVE gear
        if (gear.gearType === 'pve' && gear.stats) {
            const divider = document.createElement('hr');
            divider.style.margin = '8px 0';
            divider.style.border = 'none';
            divider.style.borderTop = '1px solid rgba(255, 255, 255, 0.2)';
            statsContainer.appendChild(divider);

            // Create stat rows
            for (const [statName, statValue] of Object.entries(gear.stats)) {
                const statRow = document.createElement('div');
                statRow.className = 'gear-stat-row';

                const label = document.createElement('span');
                label.className = 'gear-stat-label';
                label.textContent = this.formatStatName(statName);

                const value = document.createElement('span');
                value.className = 'gear-stat-value';
                value.textContent = `+${statValue}`;

                statRow.appendChild(label);
                statRow.appendChild(value);
                statsContainer.appendChild(statRow);
            }
        } else if (gear.gearType === 'pvp') {
            // PVP gear shows only "Cosmetic" label
            const cosmeticNote = document.createElement('div');
            cosmeticNote.style.marginTop = '8px';
            cosmeticNote.style.fontStyle = 'italic';
            cosmeticNote.style.color = 'rgba(255, 255, 255, 0.6)';
            cosmeticNote.style.textAlign = 'center';
            cosmeticNote.textContent = 'Cosmetic Only';
            statsContainer.appendChild(cosmeticNote);
        }

        this.currentPopup.appendChild(statsContainer);

        // Position popup next to gear item
        this.positionPopup(gearElement);

        // Show popup
        this.currentPopup.classList.add('visible');
    }

    /**
     * Position popup next to gear item
     */
    positionPopup(gearElement) {
        const gearRect = gearElement.getBoundingClientRect();
        const popupWidth = 200; // Match CSS width
        const popupHeight = this.currentPopup.offsetHeight || 250;
        const padding = 10;

        // Default: position to the right
        let left = gearRect.right + padding;
        let top = gearRect.top;

        // Check if popup goes off right edge of screen
        if (left + popupWidth > window.innerWidth) {
            // Position to the left instead
            left = gearRect.left - popupWidth - padding;
        }

        // Check if popup goes off left edge
        if (left < 0) {
            // Center it above or below
            left = gearRect.left + (gearRect.width / 2) - (popupWidth / 2);
            top = gearRect.bottom + padding;
        }

        // Check if popup goes off bottom edge
        if (top + popupHeight > window.innerHeight) {
            top = gearRect.top - popupHeight - padding;
        }

        // Check if popup goes off top edge
        if (top < 0) {
            top = padding;
        }

        this.currentPopup.style.left = `${left}px`;
        this.currentPopup.style.top = `${top}px`;
    }

    /**
     * Hide gear hover popup
     */
    hideGearHoverPopup() {
        if (this.currentPopup) {
            this.currentPopup.classList.remove('visible');
        }
    }

    /**
     * Format stat name for display
     */
    formatStatName(statName) {
        const nameMap = {
            health: 'Health',
            defense: 'Defense',
            attack: 'Attack',
            dodge: 'Dodge %',
            crit: 'Crit %'
        };

        return nameMap[statName] || statName;
    }
}
