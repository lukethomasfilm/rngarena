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

            // Check if this gear is currently equipped and grey it out
            const equipSystem = libraryType === 'pvp' ? this.pvpEquipSystem : this.pveEquipSystem;
            if (equipSystem && this.isGearEquipped(gear.id, equipSystem)) {
                gearItem.classList.add('equipped');
            }

            // Use emoji placeholder for items without real images
            const emojiPlaceholders = {
                helmet: '⛑️',
                chest: '🎽',
                gauntlets: '🧤',
                pants: '👖',
                boots: '👢',
                back: '🧥',
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
                back: '🧥',
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

        // Show popup first to get accurate height measurement
        this.currentPopup.classList.add('visible');

        // Position popup next to gear item (now that content is rendered)
        this.positionPopup(gearElement);
    }

    /**
     * Position popup next to gear item with smart bounds checking
     */
    positionPopup(gearElement) {
        const gearRect = gearElement.getBoundingClientRect();
        const popupWidth = 200; // Match CSS width

        // Force reflow to ensure accurate height after content is added
        this.currentPopup.offsetHeight;
        const popupHeight = this.currentPopup.scrollHeight || this.currentPopup.offsetHeight || 250;
        const padding = 10;
        const edgePadding = 15; // Minimum distance from screen edges

        // Get available viewport dimensions
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        // Calculate available space on each side
        const spaceRight = viewportWidth - gearRect.right;
        const spaceLeft = gearRect.left;
        const spaceBelow = viewportHeight - gearRect.bottom;
        const spaceAbove = gearRect.top;

        let left, top;

        // Priority 1: Try right side
        if (spaceRight >= popupWidth + padding + edgePadding) {
            left = gearRect.right + padding;
            top = gearRect.top;
        }
        // Priority 2: Try left side
        else if (spaceLeft >= popupWidth + padding + edgePadding) {
            left = gearRect.left - popupWidth - padding;
            top = gearRect.top;
        }
        // Priority 3: Try below, centered
        else if (spaceBelow >= popupHeight + padding + edgePadding) {
            left = gearRect.left + (gearRect.width / 2) - (popupWidth / 2);
            top = gearRect.bottom + padding;
        }
        // Priority 4: Try above, centered
        else if (spaceAbove >= popupHeight + padding + edgePadding) {
            left = gearRect.left + (gearRect.width / 2) - (popupWidth / 2);
            top = gearRect.top - popupHeight - padding;
        }
        // Fallback: Position to the side with most space, centered vertically
        else {
            if (spaceRight >= spaceLeft) {
                left = gearRect.right + padding;
            } else {
                left = gearRect.left - popupWidth - padding;
            }
            top = gearRect.top + (gearRect.height / 2) - (popupHeight / 2);
        }

        // Aggressive clamping to ensure popup stays within viewport
        const maxAvailableHeight = viewportHeight - (2 * edgePadding);
        const actualPopupWidth = Math.min(popupWidth, viewportWidth - (2 * edgePadding));
        const actualPopupHeight = Math.min(popupHeight, maxAvailableHeight);

        // Clamp horizontal position with actual popup width
        left = Math.max(edgePadding, Math.min(left, viewportWidth - actualPopupWidth - edgePadding));

        // Clamp vertical position with actual popup height
        top = Math.max(edgePadding, Math.min(top, viewportHeight - actualPopupHeight - edgePadding));

        // If popup needs to be constrained, set max dimensions
        if (popupHeight > maxAvailableHeight) {
            this.currentPopup.style.maxHeight = `${maxAvailableHeight}px`;
            this.currentPopup.style.overflowY = 'auto';
        } else {
            this.currentPopup.style.maxHeight = '';
            this.currentPopup.style.overflowY = '';
        }

        if (popupWidth > viewportWidth - (2 * edgePadding)) {
            this.currentPopup.style.maxWidth = `${actualPopupWidth}px`;
        } else {
            this.currentPopup.style.maxWidth = '';
        }

        // Apply final positions
        this.currentPopup.style.left = `${Math.round(left)}px`;
        this.currentPopup.style.top = `${Math.round(top)}px`;

        console.log(`📍 Tooltip positioned at (${Math.round(left)}, ${Math.round(top)}) within viewport (${viewportWidth}x${viewportHeight}), size: ${actualPopupWidth}x${actualPopupHeight}`);
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
            crit: 'Crit %',
            draconicCrit: 'Draconic Crit %'
        };

        return nameMap[statName] || statName;
    }

    /**
     * Check if a gear item is currently equipped
     */
    isGearEquipped(gearId, equipSystem) {
        if (!equipSystem || !equipSystem.equippedGear) {
            return false;
        }

        // Check all equipment slots to see if this gear ID is equipped
        return Object.values(equipSystem.equippedGear).some(equippedItem => {
            return equippedItem && equippedItem.id === gearId;
        });
    }
}
