/**
 * GearEquipSystem.js
 * Handles gear slot overlay, drag-and-drop equipping, and stat calculations
 */

import { GEAR_ITEMS, GEAR_SLOTS, calculateSetBonuses, hasFullDragonArmorSet } from './GearData.js';

export class GearEquipSystem {
    constructor(libraryType) {
        this.libraryType = libraryType; // 'pvp' or 'pve'
        this.equippedGear = {
            helmet: null,
            chest: null,
            gauntlets: null,
            pants: null,
            boots: null,
            back: null,
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
        this.equipSetBtn = null;
        this.isSlotView = false;
        this.isStatsOpen = false;
        this.draggedItem = null;
        this.draggingFromSlot = null; // Track which slot we're dragging from

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
        const equipSetBtnId = this.libraryType === 'pvp' ? 'pvp-equip-set-btn' : 'pve-equip-set-btn';

        this.mannequinContainer = document.getElementById(containerId);
        this.gearSlotsOverlay = document.getElementById(overlayId);
        this.viewToggleBtn = document.getElementById(viewToggleId);
        this.statsToggleBtn = document.getElementById(statsToggleId);
        this.statsPanel = document.getElementById(statsPanelId);
        this.equipSetBtn = document.getElementById(equipSetBtnId);

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
        this.setupEquipSetButton();
        this.updateStats();
        // Don't check availability on init - only show button after equipping an item

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
     * Setup equip set button
     */
    setupEquipSetButton() {
        if (!this.equipSetBtn) return;

        this.equipSetBtn.addEventListener('click', () => {
            this.equipFullDragonArmorSet();
        });
    }

    /**
     * Check if full Dragon Armor set is available and show/hide button
     * Only show button if player owns all pieces AND has at least one piece equipped
     */
    checkEquipSetAvailability() {
        if (!this.equipSetBtn || !window.arena) return;

        const dragonArmorPrefix = this.libraryType === 'pvp' ? 'pvp-dragon-' : 'dragon-';
        const dragonPieces = [
            `${dragonArmorPrefix}helmet`,
            `${dragonArmorPrefix}chest`,
            `${dragonArmorPrefix}legs`,
            `${dragonArmorPrefix}boots`,
            `${dragonArmorPrefix}gloves`,
            `${dragonArmorPrefix}weapon`,
            `${dragonArmorPrefix}shield`,
            `${dragonArmorPrefix}ring-1`,
            `${dragonArmorPrefix}ring-2`,
            `${dragonArmorPrefix}trinket`
        ];

        // Check if player owns all pieces
        const ownsAll = dragonPieces.every(pieceId => window.arena.ownsItem(pieceId));

        // Check if at least one Dragon Armor piece is equipped
        const hasOneEquipped = Object.values(this.equippedGear).some(item => {
            if (!item) return false;
            // Check if item ID matches Dragon Armor prefix
            return dragonPieces.includes(item.id);
        });

        // Show button only if owns all pieces AND has at least one equipped
        if (ownsAll && hasOneEquipped) {
            this.equipSetBtn.classList.remove('hidden');
        } else {
            this.equipSetBtn.classList.add('hidden');
        }
    }

    /**
     * Equip full Dragon Armor set
     */
    equipFullDragonArmorSet() {
        const dragonArmorPrefix = this.libraryType === 'pvp' ? 'pvp-dragon-' : 'dragon-';

        // Map of slots to gear IDs
        const setMapping = {
            helmet: `${dragonArmorPrefix}helmet`,
            chest: `${dragonArmorPrefix}chest`,
            pants: `${dragonArmorPrefix}legs`,
            boots: `${dragonArmorPrefix}boots`,
            gauntlets: `${dragonArmorPrefix}gloves`,
            weapon: `${dragonArmorPrefix}weapon`,
            offhand: `${dragonArmorPrefix}shield`,
            ring1: `${dragonArmorPrefix}ring-1`,
            ring2: `${dragonArmorPrefix}ring-2`,
            trinket: `${dragonArmorPrefix}trinket`
        };

        // Equip each piece
        Object.entries(setMapping).forEach(([slotType, gearId]) => {
            const gearItem = GEAR_ITEMS[gearId];
            if (gearItem) {
                this.equipItem(slotType, gearItem);
            }
        });

        console.log('🐉 Full Dragon Armor set equipped!');
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
                // Check if target or its parent is a gear-item
                const gearItem = e.target.closest('.gear-item');
                if (gearItem) {
                    this.handleDragStart(e);
                }
            });

            gearScroll.addEventListener('dragend', (e) => {
                // Check if target or its parent is a gear-item
                const gearItem = e.target.closest('.gear-item');
                if (gearItem) {
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

            // Click to view stats
            slot.addEventListener('click', (e) => this.handleSlotClick(e));

            // Drag from slot to unequip
            slot.addEventListener('dragstart', (e) => this.handleSlotDragStart(e));
            slot.addEventListener('dragend', (e) => this.handleSlotDragEnd(e));
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
        console.log('🎯 Drag start event fired!', e.target);

        // Get the gear-item element (might be child element being dragged)
        const gearElement = e.target.closest('.gear-item');
        if (!gearElement) {
            console.error('❌ No gear-item element found');
            return;
        }

        const gearId = gearElement.dataset.gearId;
        console.log('Gear ID:', gearId);
        const gearItem = GEAR_ITEMS[gearId];

        if (!gearItem) {
            console.error('❌ Gear item not found:', gearId);
            return;
        }

        this.draggedItem = gearItem;
        gearElement.classList.add('dragging');
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
        const gearElement = e.target.closest('.gear-item');
        if (gearElement) {
            gearElement.classList.remove('dragging');
        }
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
     * Handle clicking on a slot to view equipped item stats
     */
    handleSlotClick(e) {
        const slot = e.target.closest('.gear-slot');
        if (!slot) return;

        const slotType = slot.dataset.slot;
        const equippedItem = this.equippedGear[slotType];

        if (equippedItem) {
            // Show popup for equipped item
            this.showEquippedItemPopup(equippedItem, slot);
        }
    }

    /**
     * Handle dragging from a slot to unequip
     */
    handleSlotDragStart(e) {
        const slot = e.target.closest('.gear-slot');
        if (!slot) return;

        const slotType = slot.dataset.slot;
        const equippedItem = this.equippedGear[slotType];

        if (!equippedItem) return; // Nothing equipped

        console.log(`🗑️ Dragging to unequip: ${equippedItem.name}`);

        this.draggedItem = equippedItem;
        this.draggingFromSlot = slotType;

        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', equippedItem.id);

        slot.classList.add('dragging');
    }

    /**
     * Handle drag end from slot
     */
    handleSlotDragEnd(e) {
        const slot = e.target.closest('.gear-slot');
        if (slot) {
            slot.classList.remove('dragging');
        }

        // Check if drag ended outside the gear slots overlay (to unequip)
        const droppedOnOverlay = e.clientX && e.clientY &&
            this.gearSlotsOverlay.contains(document.elementFromPoint(e.clientX, e.clientY));

        // If dragged outside the slots area, unequip
        if (this.draggingFromSlot && !droppedOnOverlay) {
            this.unequipItem(this.draggingFromSlot);
            console.log('🗑️ Item unequipped (dragged outside slots)');
        }

        this.draggingFromSlot = null;
        this.draggedItem = null;
    }

    /**
     * Show popup for equipped item
     */
    showEquippedItemPopup(gear, slotElement) {
        // Reuse the gear library's popup
        if (!window.arena || !window.arena.gearLibrary) return;

        window.arena.gearLibrary.showGearHoverPopup(gear, slotElement);

        // Add click outside listener to hide popup
        const hidePopup = (e) => {
            if (!slotElement.contains(e.target) && !window.arena.gearLibrary.currentPopup.contains(e.target)) {
                window.arena.gearLibrary.hideGearHoverPopup();
                document.removeEventListener('click', hidePopup);
            }
        };

        // Delay adding listener so this click doesn't immediately trigger it
        setTimeout(() => {
            document.addEventListener('click', hidePopup);
        }, 10);
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
        this.checkEquipSetAvailability();

        // Refresh gear library to update equipped state (greyed out)
        this.refreshGearLibrary();
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
        this.checkEquipSetAvailability();

        // Refresh gear library to update equipped state (greyed out)
        this.refreshGearLibrary();

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

            // Make slot draggable when item is equipped
            slot.setAttribute('draggable', 'true');
        } else {
            content.innerHTML = '';
            // Remove draggable when slot is empty
            slot.removeAttribute('draggable');
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
            dodge: 0,
            draconicCrit: 0
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

            // Calculate and apply set bonuses
            const equippedGearIds = Object.values(this.equippedGear).map(item => item?.id).filter(Boolean);
            const setBonuses = calculateSetBonuses(equippedGearIds);

            Object.keys(setBonuses).forEach(stat => {
                if (stats.hasOwnProperty(stat)) {
                    stats[stat] += setBonuses[stat];
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
            if (Object.keys(setBonuses).length > 0) {
                console.log(`✨ Set Bonuses:`, setBonuses);
            }
        } else {
            console.log(`👔 PVP Gear equipped (cosmetic only)`);
        }

        // Update mannequin image for both PVP and PVE (check for full Dragon Armor set)
        const equippedGearIds = Object.values(this.equippedGear).map(item => item?.id).filter(Boolean);
        this.updateMannequinImage(equippedGearIds);
    }

    /**
     * Update mannequin image based on equipped gear
     * PVE sets use attack stance, PVP sets use neutral stance
     */
    updateMannequinImage(equippedGearIds) {
        const mannequinBaseImg = this.mannequinContainer.querySelector('.mannequin-base');
        const slotViewMannequinBg = this.gearSlotsOverlay.querySelector('.gear-slots-mannequin-bg img');

        if (!mannequinBaseImg) {
            console.error('❌ Mannequin base image not found');
            return;
        }

        console.log('🔍 Checking equipped gear:', equippedGearIds);

        // Check for Dragon Armor set
        const hasFullDragonSet = hasFullDragonArmorSet(equippedGearIds);

        if (hasFullDragonSet) {
            // Both PVP and PVE libraries use dragon_armor_all.png
            const dragonImage = '/images/Loot Items/Dragon Armor/dragon_armor_all.png';

            mannequinBaseImg.src = dragonImage;
            if (slotViewMannequinBg) {
                slotViewMannequinBg.src = dragonImage;
            }

            // Remove any flip class for libraries (dragon_armor_all.png faces correct direction)
            mannequinBaseImg.classList.remove('dragon-attack-stance');
            if (slotViewMannequinBg) {
                slotViewMannequinBg.classList.remove('dragon-attack-stance');
            }

            console.log(`🐉 Full Dragon Armor set equipped - showing dragon knight (dragon_armor_all.png)`);

            // Update armory mannequin too (both PVP and PVE)
            this.updateArmoryMannequin(true);
        } else {
            // Show default mannequin
            const defaultMannequin = this.libraryType === 'pvp' ? '/images/Castle/PVP_mannequin.png' : '/images/Castle/PVE_mannequin.png';
            mannequinBaseImg.src = defaultMannequin;
            if (slotViewMannequinBg) {
                slotViewMannequinBg.src = defaultMannequin;
            }

            // Remove flip class
            mannequinBaseImg.classList.remove('dragon-attack-stance');
            if (slotViewMannequinBg) {
                slotViewMannequinBg.classList.remove('dragon-attack-stance');
            }

            console.log(`📍 Showing default mannequin for ${this.libraryType}`);

            // Update armory mannequin back to default (both PVP and PVE)
            this.updateArmoryMannequin(false);
        }
    }

    /**
     * Update the armory mannequin (Gear Room screen) to match gear library
     */
    updateArmoryMannequin(showDragonKnight) {
        // Determine which mannequin to update based on library type
        const mannequinId = this.libraryType === 'pvp' ? 'pvp-mannequin' : 'pve-mannequin';
        const defaultImage = this.libraryType === 'pvp' ? '/images/Castle/PVP_mannequin.png' : '/images/Castle/PVE_mannequin.png';

        // Try multiple selectors to find the armory mannequin
        const selectors = [
            `#${mannequinId} .mannequin-image`,
            `#${mannequinId} img`
        ];

        let armoryMannequin = null;
        for (const selector of selectors) {
            armoryMannequin = document.querySelector(selector);
            if (armoryMannequin) {
                console.log(`✅ Found ${this.libraryType} armory mannequin using selector: ${selector}`);
                break;
            }
        }

        if (!armoryMannequin) {
            console.warn(`⚠️ ${this.libraryType} armory mannequin not found - tried selectors:`, selectors);
            return;
        }

        // Find the mannequin container to adjust position and size
        const mannequinContainer = document.getElementById(mannequinId);

        if (showDragonKnight) {
            armoryMannequin.src = '/images/Loot Items/Dragon Armor/dragon_armor_mannequin.png';
            armoryMannequin.classList.remove('dragon-attack-stance'); // No flip needed

            // PVE: Move right and scale bigger
            // PVP: Move left and scale bigger
            if (mannequinContainer) {
                if (this.libraryType === 'pve') {
                    mannequinContainer.style.transform = 'translateX(40px) scale(1.05)';
                } else {
                    mannequinContainer.style.transform = 'translateX(-40px) scale(1.05)';
                }
                mannequinContainer.style.transition = 'transform 0.3s ease';
            }

            console.log(`🐉 Updated ${this.libraryType} armory mannequin to Dragon Knight (dragon_armor_mannequin.png, repositioned)`);
        } else {
            armoryMannequin.src = defaultImage;
            armoryMannequin.classList.remove('dragon-attack-stance');

            // Reset position and size
            if (mannequinContainer) {
                mannequinContainer.style.transform = '';
            }

            console.log(`📍 Reset ${this.libraryType} armory mannequin to default`);
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
     * Get total stats (including set bonuses)
     */
    getTotalStats() {
        const stats = {
            attack: 0,
            defense: 0,
            health: 0,
            crit: 0,
            dodge: 0,
            draconicCrit: 0
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

        // Add set bonuses
        const equippedGearIds = Object.values(this.equippedGear).map(item => item?.id).filter(Boolean);
        const setBonuses = calculateSetBonuses(equippedGearIds);

        Object.keys(setBonuses).forEach(stat => {
            if (stats.hasOwnProperty(stat)) {
                stats[stat] += setBonuses[stat];
            }
        });

        return stats;
    }

    /**
     * Refresh the gear library to update equipped state visuals
     */
    refreshGearLibrary() {
        if (!window.arena || !window.arena.gearLibrary) return;

        if (this.libraryType === 'pvp') {
            window.arena.gearLibrary.refreshPVPGearLibrary();
        } else {
            window.arena.gearLibrary.refreshPVEGearLibrary();
        }
    }
}
