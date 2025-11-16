/**
 * GearEquipSystem.js
 * Handles gear slot overlay, drag-and-drop equipping, and stat calculations
 */

import { GEAR_ITEMS, GEAR_SLOTS } from './GearData.js';

export class GearEquipSystem {
    constructor(libraryType) {
        this.libraryType = libraryType; // 'pvp' or 'pve'
        this.equippedGear = {
            helmet: null,
            chest: null,
            gauntlets: null,
            pants: null,
            boots: null,
            cape: null,
            ring1: null,
            ring2: null,
            weapon: null,
            offhand: null,
            trinket: null
        };

        this.mannequinContainer = null;
        this.gearSlotsOverlay = null;
        this.viewToggleBtn = null;
        this.statsToggleBtn = null;
        this.statsPanel = null;
        this.isSlotView = false;
        this.isStatsOpen = false;
        this.draggedItem = null;

        console.log(`🎒 GearEquipSystem initialized for ${libraryType}`);
    }

    /**
     * Initialize the gear equip system
     */
    init() {
        // Get DOM elements
        const containerId = this.libraryType === 'pvp' ? 'pvp-mannequin-container' : 'pve-mannequin-container';
        const overlayId = this.libraryType === 'pvp' ? 'pvp-gear-slots' : 'pve-gear-slots';
        const viewToggleId = this.libraryType === 'pvp' ? 'pvp-view-toggle' : 'pve-view-toggle';
        const statsToggleId = this.libraryType === 'pvp' ? 'pvp-stats-toggle' : 'pve-stats-toggle';
        const statsPanelId = this.libraryType === 'pvp' ? 'pvp-stats-panel' : 'pve-stats-panel';

        this.mannequinContainer = document.getElementById(containerId);
        this.gearSlotsOverlay = document.getElementById(overlayId);
        this.viewToggleBtn = document.getElementById(viewToggleId);
        this.statsToggleBtn = document.getElementById(statsToggleId);
        this.statsPanel = document.getElementById(statsPanelId);

        if (!this.mannequinContainer || !this.gearSlotsOverlay || !this.viewToggleBtn || !this.statsToggleBtn || !this.statsPanel) {
            console.error('❌ Gear equip system elements not found');
            console.error('Missing elements:', {
                mannequinContainer: !!this.mannequinContainer,
                gearSlotsOverlay: !!this.gearSlotsOverlay,
                viewToggleBtn: !!this.viewToggleBtn,
                statsToggleBtn: !!this.statsToggleBtn,
                statsPanel: !!this.statsPanel
            });
            return;
        }

        this.setupViewToggle();
        this.setupStatsToggle();
        this.setupDragAndDrop();
        this.updateStats();

        console.log(`✅ GearEquipSystem initialized for ${this.libraryType}`);
    }

    /**
     * Setup view toggle button (Mannequin View <-> Slot View)
     */
    setupViewToggle() {
        this.viewToggleBtn.addEventListener('click', () => {
            this.isSlotView = !this.isSlotView;
            this.toggleView();
        });
    }

    /**
     * Setup stats toggle button
     */
    setupStatsToggle() {
        this.statsToggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.isStatsOpen = !this.isStatsOpen;

            // Show overlay if opening stats and overlay is hidden
            if (this.isStatsOpen && this.gearSlotsOverlay.classList.contains('hidden')) {
                this.showOverlay();
            }

            this.toggleStats();
        });

        // Close stats when clicking outside
        this.gearSlotsOverlay.addEventListener('click', (e) => {
            if (this.isStatsOpen && !this.statsPanel.contains(e.target) && !this.statsToggleBtn.contains(e.target)) {
                this.isStatsOpen = false;
                this.toggleStats();
            }
        });

        // Prevent clicks inside stats panel from closing it
        this.statsPanel.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }

    /**
     * Toggle overlay on/off
     */
    toggleView() {
        if (this.isSlotView) {
            // Show overlay and reduce mannequin opacity to 40%
            this.gearSlotsOverlay.classList.remove('hidden');
            this.mannequinContainer.classList.add('overlay-active');
            console.log(`👀 Overlay ON (${this.libraryType})`);
        } else {
            // Hide overlay and restore mannequin opacity
            this.gearSlotsOverlay.classList.add('hidden');
            this.mannequinContainer.classList.remove('overlay-active');
            console.log(`👀 Overlay OFF (${this.libraryType})`);
        }
    }

    /**
     * Toggle stats panel
     */
    toggleStats() {
        if (this.isStatsOpen) {
            this.statsPanel.classList.add('open');
            this.statsToggleBtn.classList.add('active');
            console.log(`📊 Stats panel opened (${this.libraryType})`);
        } else {
            this.statsPanel.classList.remove('open');
            this.statsToggleBtn.classList.remove('active');
            console.log(`📊 Stats panel closed (${this.libraryType})`);
        }
    }

    /**
     * Setup drag and drop functionality
     */
    setupDragAndDrop() {
        // Make gear items in library draggable
        const scrollId = this.libraryType === 'pvp' ? 'pvp-gear-scroll' : 'pve-gear-scroll';
        const gearScroll = document.getElementById(scrollId);

        if (gearScroll) {
            // Use event delegation for dynamically added gear items
            gearScroll.addEventListener('dragstart', (e) => {
                if (e.target.classList.contains('gear-item')) {
                    this.handleDragStart(e);
                }
            });

            gearScroll.addEventListener('dragend', (e) => {
                if (e.target.classList.contains('gear-item')) {
                    this.handleDragEnd(e);
                }
            });
        }

        // Setup drop zones on gear slots
        const slots = this.gearSlotsOverlay.querySelectorAll('.gear-slot:not(.gear-slot-empty)');
        slots.forEach(slot => {
            slot.addEventListener('dragover', (e) => this.handleDragOver(e));
            slot.addEventListener('dragleave', (e) => this.handleDragLeave(e));
            slot.addEventListener('drop', (e) => this.handleDrop(e));
        });

        // Setup drag from mannequin to show overlay
        this.mannequinContainer.addEventListener('dragenter', (e) => {
            if (this.draggedItem && this.gearSlotsOverlay.classList.contains('hidden')) {
                this.showOverlay();
            }
        });
    }

    /**
     * Handle drag start
     */
    handleDragStart(e) {
        const gearId = e.target.dataset.gearId;
        const gearItem = GEAR_ITEMS[gearId];

        if (!gearItem) return;

        this.draggedItem = gearItem;
        e.target.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', gearId);

        // Show overlay when starting to drag
        this.showOverlay();

        // Highlight compatible slots
        this.highlightCompatibleSlots(gearItem.type);

        console.log(`🎯 Dragging: ${gearItem.name} (${gearItem.type})`);
    }

    /**
     * Handle drag end
     */
    handleDragEnd(e) {
        e.target.classList.remove('dragging');
        this.clearSlotHighlights();
        this.draggedItem = null;
    }

    /**
     * Handle drag over slot
     */
    handleDragOver(e) {
        if (!this.draggedItem) return;

        const slot = e.target.closest('.gear-slot');
        if (!slot || slot.classList.contains('locked')) return;

        const slotType = slot.dataset.slot;
        if (this.isCompatibleSlot(this.draggedItem.type, slotType)) {
            e.preventDefault(); // Allow drop
            e.dataTransfer.dropEffect = 'move';
        }
    }

    /**
     * Handle drag leave slot
     */
    handleDragLeave(e) {
        const slot = e.target.closest('.gear-slot');
        if (slot) {
            slot.classList.remove('drag-over');
        }
    }

    /**
     * Handle drop on slot
     */
    handleDrop(e) {
        e.preventDefault();

        const slot = e.target.closest('.gear-slot');
        if (!slot || slot.classList.contains('locked')) return;

        const slotType = slot.dataset.slot;
        const gearId = e.dataTransfer.getData('text/plain');
        const gearItem = GEAR_ITEMS[gearId];

        if (!gearItem || !this.isCompatibleSlot(gearItem.type, slotType)) {
            console.warn(`❌ Cannot equip ${gearItem?.name} to ${slotType} slot`);
            return;
        }

        // Equip the item
        this.equipItem(slotType, gearItem);
        this.clearSlotHighlights();

        console.log(`✅ Equipped ${gearItem.name} to ${slotType}`);
    }

    /**
     * Check if item type is compatible with slot
     */
    isCompatibleSlot(itemType, slotType) {
        // Ring slots can accept ring items
        if (slotType === 'ring1' || slotType === 'ring2') {
            return itemType === 'ring';
        }

        // Otherwise, types must match exactly
        return itemType === slotType;
    }

    /**
     * Equip an item to a slot
     */
    equipItem(slotType, gearItem) {
        // Unequip previous item in this slot if any
        if (this.equippedGear[slotType]) {
            this.unequipItem(slotType);
        }

        // Equip new item
        this.equippedGear[slotType] = gearItem;

        // Update slot visual
        this.updateSlotVisual(slotType, gearItem);

        // Handle two-handed weapon logic
        if (slotType === 'weapon' && gearItem.twoHanded) {
            this.lockOffhandSlot();
        } else if (slotType === 'weapon' && !gearItem.twoHanded) {
            this.unlockOffhandSlot();
        }

        // Update stats
        this.updateStats();
    }

    /**
     * Unequip an item from a slot
     */
    unequipItem(slotType) {
        const item = this.equippedGear[slotType];
        if (!item) return;

        this.equippedGear[slotType] = null;
        this.updateSlotVisual(slotType, null);

        // Unlock offhand if unequipping two-handed weapon
        if (slotType === 'weapon' && item.twoHanded) {
            this.unlockOffhandSlot();
        }

        this.updateStats();
        console.log(`🗑️ Unequipped ${item.name} from ${slotType}`);
    }

    /**
     * Update slot visual with equipped item
     */
    updateSlotVisual(slotType, gearItem) {
        const slot = this.gearSlotsOverlay.querySelector(`[data-slot="${slotType}"]`);
        if (!slot) return;

        const content = slot.querySelector('.gear-slot-content');
        if (!content) return;

        // Remove all tier classes
        slot.classList.remove('tier-common', 'tier-uncommon', 'tier-rare', 'tier-epic', 'tier-legendary');

        if (gearItem) {
            content.innerHTML = `<img src="${gearItem.image}" alt="${gearItem.name}" title="${gearItem.name}">`;

            // Add tier class for border color
            if (gearItem.tier) {
                slot.classList.add(`tier-${gearItem.tier}`);
            }
        } else {
            content.innerHTML = '';
        }
    }

    /**
     * Lock off-hand slot when two-handed weapon equipped
     */
    lockOffhandSlot() {
        // Unequip off-hand if something is equipped
        if (this.equippedGear.offhand) {
            this.unequipItem('offhand');
        }

        // Lock the slot
        const offhandSlot = this.gearSlotsOverlay.querySelector('[data-slot="offhand"]');
        if (offhandSlot) {
            offhandSlot.classList.add('locked');
        }

        console.log(`🔒 Off-hand slot locked (two-handed weapon equipped)`);
    }

    /**
     * Unlock off-hand slot
     */
    unlockOffhandSlot() {
        const offhandSlot = this.gearSlotsOverlay.querySelector('[data-slot="offhand"]');
        if (offhandSlot) {
            offhandSlot.classList.remove('locked');
        }

        console.log(`🔓 Off-hand slot unlocked`);
    }

    /**
     * Highlight compatible slots when dragging
     */
    highlightCompatibleSlots(itemType) {
        const slots = this.gearSlotsOverlay.querySelectorAll('.gear-slot:not(.gear-slot-empty)');

        slots.forEach(slot => {
            const slotType = slot.dataset.slot;
            if (this.isCompatibleSlot(itemType, slotType) && !slot.classList.contains('locked')) {
                slot.classList.add('drag-compatible');
            }
        });
    }

    /**
     * Clear all slot highlights
     */
    clearSlotHighlights() {
        const slots = this.gearSlotsOverlay.querySelectorAll('.gear-slot');
        slots.forEach(slot => {
            slot.classList.remove('drag-compatible');
            slot.classList.remove('drag-over');
        });
    }

    /**
     * Update total stats display
     */
    updateStats() {
        const stats = {
            attack: 0,
            defense: 0,
            health: 0,
            crit: 0,
            dodge: 0
        };

        // Only sum stats for PVE gear library
        if (this.libraryType === 'pve') {
            // Sum up stats from all equipped gear
            Object.values(this.equippedGear).forEach(item => {
                if (item && item.stats) {
                    Object.keys(item.stats).forEach(stat => {
                        if (stats.hasOwnProperty(stat)) {
                            stats[stat] += item.stats[stat];
                        }
                    });
                }
            });

            // Update stat displays
            Object.keys(stats).forEach(stat => {
                const statElement = this.gearSlotsOverlay.querySelector(`[data-stat="${stat}"]`);
                if (statElement) {
                    statElement.textContent = stats[stat];
                }
            });

            console.log(`📊 PVE Stats updated:`, stats);
        } else {
            console.log(`👔 PVP Gear equipped (cosmetic only)`);
        }
    }

    /**
     * Show gear slots overlay
     */
    showOverlay() {
        this.isSlotView = true;
        this.gearSlotsOverlay.classList.remove('hidden');
        this.mannequinContainer.classList.add('overlay-active');
    }

    /**
     * Hide gear slots overlay
     */
    hideOverlay() {
        this.gearSlotsOverlay.classList.add('hidden');
        this.isSlotView = false;
        this.mannequinContainer.classList.remove('overlay-active');
    }

    /**
     * Get all equipped gear
     */
    getEquippedGear() {
        return this.equippedGear;
    }

    /**
     * Get total stats
     */
    getTotalStats() {
        const stats = {
            attack: 0,
            defense: 0,
            health: 0,
            crit: 0,
            dodge: 0
        };

        Object.values(this.equippedGear).forEach(item => {
            if (item && item.stats) {
                Object.keys(item.stats).forEach(stat => {
                    if (stats.hasOwnProperty(stat)) {
                        stats[stat] += item.stats[stat];
                    }
                });
            }
        });

        return stats;
    }
}
