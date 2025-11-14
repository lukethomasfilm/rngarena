/**
 * AwardsTitlesSystem.js
 * Handles tab switching and drag-and-drop for awards and titles
 */

export class AwardsTitlesSystem {
    constructor() {
        this.equippedTitles = {
            1: null,
            2: null,
            3: null
        };
        this.equippedAwards = {
            1: null,
            2: null,
            3: null
        };
        this.draggedItem = null;
        this.currentTab = 'titles';
        this.currentInfoItem = null;

        // Descriptions for titles and awards
        this.descriptions = {
            titles: {
                'The Mediocre': 'A title for those who embrace being perfectly average. Earned by maintaining a 50% win rate across at least 20 battles. Not the best, not the worst—just comfortably in the middle where nobody expects much from you.',
                'Barely Competent': 'This dubious honor is bestowed upon warriors who somehow manage to win despite their questionable tactical decisions. Granted after scraping together 5 victories with less than 10 HP remaining. Your survival instincts are stronger than your combat skills.',
                'RNG Victim': 'For those who have been betrayed by the random number gods time and time again. Awarded after losing 10 battles where you had a significant statistical advantage. Sometimes the dice just hate you, and this title proves it.',
                'Lucky Loser': 'A paradoxical achievement for fighters who lose battles spectacularly but somehow gain more loot than the victor. Requires losing 3 consecutive battles while earning rare or better items each time. Failure has never been so rewarding.',
                'The Unfortunate': 'Earned through an impressive streak of terrible luck and poor timing. Awarded after experiencing 5 critical failures in a single battle and still managing to survive. Your misfortune is so consistent it\'s almost a skill.',
                'Dice Roller': 'For warriors who truly embrace the chaos of RNG combat. Obtained by winning 15 battles where every single attack roll was within 3 points of the minimum or maximum possible. You don\'t just play the odds—you live by them.'
            },
            awards: {
                'Participation Trophy': 'Given to all fighters who step into the arena, regardless of outcome. This award acknowledges that showing up is half the battle. Everyone starts somewhere, and at least you had the courage to try. Display it proudly as a reminder of your humble beginnings.',
                'Accidentally Won': 'Awarded when you defeat an opponent despite missing most of your attacks and having terrible dice rolls. The victory was more luck than skill, possibly because your opponent rolled even worse. These unexpected wins are what make RNG combat so thrilling and unpredictable.',
                'Professional Punching Bag': 'An ironic achievement for enduring 10 consecutive losses without rage quitting. Your persistence in the face of overwhelming defeat is truly remarkable. Whether you\'re learning from your mistakes or just enjoy punishment, this award celebrates your dedication to the grind.',
                'Near Death Experience': 'Granted to warriors who snatch victory from the jaws of defeat by winning with exactly 1 HP remaining. These clutch moments define legendary fighters. Your ability to survive on a knife\'s edge shows either incredible skill or the most ridiculous luck imaginable.',
                'Couldn\'t Hit Water': 'Earned by missing 5 or more attacks in a single battle, displaying aim so poor you couldn\'t hit water if you fell in the ocean. Sometimes the dice betray you, sometimes your stats fail you, and sometimes you\'re just having an off day. This award immortalizes your most embarrassing combat performance.'
            }
        };

        this.init();
    }

    init() {
        this.setupTabs();
        this.setupDragAndDrop();
        this.setupInfoPopup();
        console.log('✅ Awards & Titles System initialized');
    }

    /**
     * Set up info popup functionality
     */
    setupInfoPopup() {
        const popup = document.getElementById('item-info-popup');
        const popupContent = document.querySelector('.item-info-popup-content');
        const closeBtn = document.getElementById('item-info-close');
        const equipBtn = document.getElementById('item-info-equip-btn');

        closeBtn.addEventListener('click', () => this.closeInfoPopup());

        equipBtn.addEventListener('click', () => {
            if (this.currentInfoItem) {
                this.equipItemFromPopup();
            }
        });

        // Close when clicking on the overlay (outside the content box)
        popup.addEventListener('click', (e) => {
            if (e.target === popup) {
                this.closeInfoPopup();
            }
        });

        // Prevent closing when clicking inside the content box
        popupContent.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }

    /**
     * Show info popup for an item
     */
    showInfoPopup(item) {
        const popup = document.getElementById('item-info-popup');
        const title = document.getElementById('item-info-title');
        const icon = document.getElementById('item-info-icon');
        const description = document.getElementById('item-info-description');

        this.currentInfoItem = item;

        if (item.type === 'award') {
            // Extract award details from HTML
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = item.html;
            const awardIcon = tempDiv.querySelector('.award-icon');
            const awardName = tempDiv.querySelector('.award-name');

            const displayName = awardName ? awardName.textContent : item.name;

            title.textContent = displayName;
            icon.textContent = awardIcon ? awardIcon.textContent : '🏆';

            // Use detailed description from descriptions object
            description.textContent = this.descriptions.awards[displayName] || 'An award for your achievements.';
        } else {
            // Title
            title.textContent = item.name;
            icon.textContent = '⭐';

            // Use detailed description from descriptions object
            description.textContent = this.descriptions.titles[item.name] || 'A special title for your accomplishments.';
        }

        popup.classList.remove('hidden');
    }

    /**
     * Close info popup
     */
    closeInfoPopup() {
        const popup = document.getElementById('item-info-popup');
        popup.classList.add('hidden');
        this.currentInfoItem = null;
    }

    /**
     * Equip item from popup
     */
    equipItemFromPopup() {
        if (!this.currentInfoItem) return;

        const itemType = this.currentInfoItem.type;
        const itemName = this.currentInfoItem.name;

        // Check if already equipped
        if (this.isItemAlreadyEquipped(itemName, itemType)) {
            console.log('❌ Item already equipped');
            this.closeInfoPopup();
            return;
        }

        // Find next available slot
        const nextSlot = this.findNextAvailableSlot(itemType);
        if (!nextSlot) {
            console.log('❌ No available slots');
            return;
        }

        // Equip the item
        this.equipItem(nextSlot, itemType, this.currentInfoItem);
        this.closeInfoPopup();
    }

    /**
     * Set up tab switching
     */
    setupTabs() {
        const tabs = document.querySelectorAll('.awards-tab');

        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const tabName = tab.dataset.tab;
                this.switchTab(tabName);
            });
        });

        // Set initial active tab (titles)
        this.switchTab('titles');
    }

    /**
     * Switch between tabs
     */
    switchTab(tabName) {
        this.currentTab = tabName;

        // Update tab buttons
        document.querySelectorAll('.awards-tab').forEach(tab => {
            if (tab.dataset.tab === tabName) {
                tab.classList.add('active');
            } else {
                tab.classList.remove('active');
            }
        });

        // Update tab panels
        document.querySelectorAll('.tab-panel').forEach(panel => {
            if (panel.id === `${tabName}-panel`) {
                panel.classList.add('active');
            } else {
                panel.classList.remove('active');
            }
        });

        // Switch equipped slots
        const titleSlots = document.getElementById('title-slots');
        const awardSlots = document.getElementById('award-slots');
        const titlesHeader = document.getElementById('equipped-titles-header');
        const awardsHeader = document.getElementById('equipped-awards-header');

        if (tabName === 'titles') {
            titleSlots.classList.add('active');
            awardSlots.classList.remove('active');
            titlesHeader.classList.add('active');
            awardsHeader.classList.remove('active');
        } else {
            awardSlots.classList.add('active');
            titleSlots.classList.remove('active');
            awardsHeader.classList.add('active');
            titlesHeader.classList.remove('active');
        }

        console.log(`📑 Switched to ${tabName} tab`);
    }

    /**
     * Set up drag and drop functionality
     */
    setupDragAndDrop() {
        // Make items draggable
        this.setupDraggableItems();

        // Set up drop zones
        const slots = document.querySelectorAll('.equipped-slot');
        slots.forEach(slot => {
            slot.addEventListener('dragover', (e) => this.handleDragOver(e));
            slot.addEventListener('dragleave', (e) => this.handleDragLeave(e));
            slot.addEventListener('drop', (e) => this.handleDrop(e));
        });
    }

    /**
     * Make all award and title items draggable and clickable
     */
    setupDraggableItems() {
        const draggableItems = document.querySelectorAll('[draggable="true"]');

        draggableItems.forEach(item => {
            item.addEventListener('dragstart', (e) => this.handleDragStart(e));
            item.addEventListener('dragend', (e) => this.handleDragEnd(e));
            item.addEventListener('click', (e) => this.handleItemClick(e));
            item.style.cursor = 'pointer';
        });
    }

    /**
     * Handle click on award/title item to show info popup
     */
    handleItemClick(e) {
        const itemType = e.currentTarget.dataset.title ? 'title' : 'award';
        const itemName = e.currentTarget.dataset.title || e.currentTarget.dataset.award;

        // Create item object
        const item = {
            element: e.currentTarget,
            type: itemType,
            name: itemName,
            html: e.currentTarget.innerHTML
        };

        // Show info popup
        this.showInfoPopup(item);
        console.log(`📋 Showing info for ${itemType}: ${itemName}`);
    }

    /**
     * Find the next available slot for a given type
     */
    findNextAvailableSlot(type) {
        const slots = type === 'title' ? this.equippedTitles : this.equippedAwards;

        for (let i = 1; i <= 3; i++) {
            if (!slots[i]) {
                return i;
            }
        }

        return null; // No available slots
    }

    /**
     * Handle drag start
     */
    handleDragStart(e) {
        this.draggedItem = {
            element: e.target,
            type: e.target.dataset.title ? 'title' : 'award',
            name: e.target.dataset.title || e.target.dataset.award,
            html: e.target.innerHTML
        };

        e.target.style.opacity = '0.5';
        console.log(`🎯 Dragging ${this.draggedItem.type}: ${this.draggedItem.name}`);
    }

    /**
     * Handle drag end
     */
    handleDragEnd(e) {
        e.target.style.opacity = '1';
    }

    /**
     * Handle drag over drop zone
     */
    handleDragOver(e) {
        e.preventDefault();
        e.currentTarget.classList.add('drag-over');
    }

    /**
     * Handle drag leave drop zone
     */
    handleDragLeave(e) {
        e.currentTarget.classList.remove('drag-over');
    }

    /**
     * Handle drop into slot
     */
    handleDrop(e) {
        e.preventDefault();
        e.currentTarget.classList.remove('drag-over');

        if (!this.draggedItem) return;

        const slotNumber = parseInt(e.currentTarget.dataset.slot);
        const slotType = e.currentTarget.dataset.type;

        // Check if item type matches slot type
        if (this.draggedItem.type !== slotType) {
            console.log(`❌ Cannot equip ${this.draggedItem.type} in ${slotType} slot`);
            return;
        }

        // Check if already equipped
        if (this.isItemAlreadyEquipped(this.draggedItem.name, slotType)) {
            console.log('❌ Item already equipped');
            return;
        }

        // Equip the item
        this.equipItem(slotNumber, slotType, this.draggedItem);
        this.draggedItem = null;
    }

    /**
     * Check if item is already equipped
     */
    isItemAlreadyEquipped(itemName, type) {
        const slots = type === 'title' ? this.equippedTitles : this.equippedAwards;
        return Object.values(slots).some(slot =>
            slot && slot.name === itemName
        );
    }

    /**
     * Equip item to slot
     */
    equipItem(slotNumber, slotType, item) {
        // Find the slot element
        const container = slotType === 'title' ?
            document.getElementById('title-slots') :
            document.getElementById('award-slots');

        const slot = container.querySelector(`.equipped-slot[data-slot="${slotNumber}"]`);
        if (!slot) return;

        // Store the equipped item
        if (slotType === 'title') {
            this.equippedTitles[slotNumber] = item;
        } else {
            this.equippedAwards[slotNumber] = item;
        }

        // Update slot visual
        slot.classList.add('filled');
        slot.innerHTML = `
            <div class="equipped-item">
                <div class="equipped-item-name">${this.formatItemName(item)}</div>
            </div>
        `;

        // Make slot clickable to unequip
        slot.addEventListener('click', () => this.unequipItem(slotNumber, slotType));

        console.log(`✅ Equipped ${item.type} to slot ${slotNumber}`);
    }

    /**
     * Unequip item from slot
     */
    unequipItem(slotNumber, slotType) {
        // Find the slot element
        const container = slotType === 'title' ?
            document.getElementById('title-slots') :
            document.getElementById('award-slots');

        const slot = container.querySelector(`.equipped-slot[data-slot="${slotNumber}"]`);
        if (!slot) return;

        // Remove the equipped item
        if (slotType === 'title') {
            this.equippedTitles[slotNumber] = null;
        } else {
            this.equippedAwards[slotNumber] = null;
        }

        slot.classList.remove('filled');
        slot.innerHTML = '<div class="slot-placeholder">Empty Slot</div>';

        console.log(`🗑️ Unequipped from ${slotType} slot ${slotNumber}`);
    }

    /**
     * Format item name for display
     */
    formatItemName(item) {
        if (item.type === 'title') {
            return item.name;
        } else {
            // For awards, extract the award name from the HTML
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = item.html;
            const name = tempDiv.querySelector('.award-name');
            return name ? name.textContent : item.name;
        }
    }

    /**
     * Get currently equipped items
     */
    getEquippedItems() {
        return Object.entries(this.equippedSlots)
            .filter(([_, item]) => item !== null)
            .map(([slot, item]) => ({
                slot: parseInt(slot),
                type: item.type,
                name: item.name
            }));
    }
}
