/**
 * GearData.js
 * Gear items for the gear library system
 *
 * PVP GEAR: Cosmetic only, has rarity rating
 * PVE GEAR: Has stats, rating increases with map progression
 */

export const GEAR_SLOTS = {
    HELMET: 'helmet',
    CHEST: 'chest',
    GAUNTLETS: 'gauntlets',
    PANTS: 'pants',
    BOOTS: 'boots',
    BACK: 'back',
    RING: 'ring',
    WEAPON: 'weapon',
    OFFHAND: 'offhand',
    TRINKET: 'trinket'
};

// Tier base ratings
export const TIER_RATINGS = {
    common: 10,
    uncommon: 25,
    rare: 50,
    epic: 100,
    legendary: 200
};

// Dragon Armor Set ID - used for set bonus calculations
export const DRAGON_ARMOR_SET = 'dragon-armor';

export const GEAR_ITEMS = {
    // ═══════════════════════════════════════════════════════════════
    // DRAGON ARMOR SET - PVP GEAR (COSMETIC ONLY)
    // ═══════════════════════════════════════════════════════════════

    'pvp-dragon-helmet': {
        id: 'pvp-dragon-helmet',
        name: 'Dragon Helmet',
        type: 'helmet',
        gearType: 'pvp',
        tier: 'epic',
        rating: 100,
        image: '/images/Loot Items/Dragon Armor/dragon_armor_head.png'
    },
    'pvp-dragon-chest': {
        id: 'pvp-dragon-chest',
        name: 'Dragon Chestplate',
        type: 'chest',
        gearType: 'pvp',
        tier: 'rare',
        rating: 50,
        image: '/images/Loot Items/Dragon Armor/dragon_armor_chest.png'
    },
    'pvp-dragon-legs': {
        id: 'pvp-dragon-legs',
        name: 'Dragon Leggings',
        type: 'pants',
        gearType: 'pvp',
        tier: 'uncommon',
        rating: 25,
        image: '/images/Loot Items/Dragon Armor/dragon_armor_legs.png'
    },
    'pvp-dragon-boots': {
        id: 'pvp-dragon-boots',
        name: 'Dragon Boots',
        type: 'boots',
        gearType: 'pvp',
        tier: 'common',
        rating: 10,
        image: '/images/Loot Items/Dragon Armor/dragon_armor_boots.png'
    },
    'pvp-dragon-gloves': {
        id: 'pvp-dragon-gloves',
        name: 'Dragon Gloves',
        type: 'gauntlets',
        gearType: 'pvp',
        tier: 'common',
        rating: 10,
        image: '/images/Loot Items/Dragon Armor/dragon_armor_gloves.png'
    },
    'pvp-dragon-weapon': {
        id: 'pvp-dragon-weapon',
        name: 'Dragon Blade',
        type: 'weapon',
        gearType: 'pvp',
        tier: 'rare',
        rating: 50,
        twoHanded: false,
        image: '/images/Loot Items/Dragon Armor/dragon_armor_weapon.png'
    },
    'pvp-dragon-shield': {
        id: 'pvp-dragon-shield',
        name: 'Dragon Shield',
        type: 'offhand',
        gearType: 'pvp',
        tier: 'uncommon',
        rating: 25,
        image: '/images/Loot Items/Dragon Armor/dragon_armor_shield.png'
    },
    'pvp-dragon-ring-1': {
        id: 'pvp-dragon-ring-1',
        name: 'Dragon Ring of Power',
        type: 'ring',
        gearType: 'pvp',
        tier: 'common',
        rating: 10,
        image: '/images/Loot Items/Dragon Armor/dragon_armor_ring_1.png'
    },
    'pvp-dragon-ring-2': {
        id: 'pvp-dragon-ring-2',
        name: 'Dragon Ring of Might',
        type: 'ring',
        gearType: 'pvp',
        tier: 'common',
        rating: 10,
        image: '/images/Loot Items/Dragon Armor/dragon_armor_ring_2.png'
    },
    'pvp-dragon-trinket': {
        id: 'pvp-dragon-trinket',
        name: 'Draconic Talisman',
        type: 'trinket',
        gearType: 'pvp',
        tier: 'common',
        rating: 10,
        image: '/images/Loot Items/Dragon Armor/dragon_armor_trinket.png'
    },

    // ═══════════════════════════════════════════════════════════════
    // DRAGON ARMOR SET - PVE GEAR WITH SET BONUSES
    // ═══════════════════════════════════════════════════════════════
    // Set Bonuses:
    // - 5 pieces (armor only): +20 HP, +10 Damage
    // - 10 pieces (full set): +50 HP, +25 Damage

    'dragon-helmet': {
        id: 'dragon-helmet',
        name: 'Dragon Helmet',
        type: 'helmet',
        gearType: 'pve',
        tier: 'epic',
        rating: 100,
        setId: DRAGON_ARMOR_SET,
        image: '/images/Loot Items/Dragon Armor/dragon_armor_head.png',
        stats: {
            health: 30,
            attack: 15
        }
    },
    'dragon-chest': {
        id: 'dragon-chest',
        name: 'Dragon Chestplate',
        type: 'chest',
        gearType: 'pve',
        tier: 'rare',
        rating: 50,
        setId: DRAGON_ARMOR_SET,
        image: '/images/Loot Items/Dragon Armor/dragon_armor_chest.png',
        stats: {
            health: 20
        }
    },
    'dragon-legs': {
        id: 'dragon-legs',
        name: 'Dragon Leggings',
        type: 'pants',
        gearType: 'pve',
        tier: 'uncommon',
        rating: 25,
        setId: DRAGON_ARMOR_SET,
        image: '/images/Loot Items/Dragon Armor/dragon_armor_legs.png',
        stats: {
            health: 15
        }
    },
    'dragon-boots': {
        id: 'dragon-boots',
        name: 'Dragon Boots',
        type: 'boots',
        gearType: 'pve',
        tier: 'common',
        rating: 10,
        setId: DRAGON_ARMOR_SET,
        image: '/images/Loot Items/Dragon Armor/dragon_armor_boots.png',
        stats: {
            health: 10
        }
    },
    'dragon-gloves': {
        id: 'dragon-gloves',
        name: 'Dragon Gloves',
        type: 'gauntlets',
        gearType: 'pve',
        tier: 'common',
        rating: 10,
        setId: DRAGON_ARMOR_SET,
        image: '/images/Loot Items/Dragon Armor/dragon_armor_gloves.png',
        stats: {
            attack: 10
        }
    },
    'dragon-weapon': {
        id: 'dragon-weapon',
        name: 'Dragon Blade',
        type: 'weapon',
        gearType: 'pve',
        tier: 'rare',
        rating: 50,
        setId: DRAGON_ARMOR_SET,
        twoHanded: false,
        image: '/images/Loot Items/Dragon Armor/dragon_armor_weapon.png',
        stats: {
            attack: 20
        }
    },
    'dragon-shield': {
        id: 'dragon-shield',
        name: 'Dragon Shield',
        type: 'offhand',
        gearType: 'pve',
        tier: 'uncommon',
        rating: 25,
        setId: DRAGON_ARMOR_SET,
        image: '/images/Loot Items/Dragon Armor/dragon_armor_shield.png',
        stats: {
            health: 15
        }
    },
    'dragon-ring-1': {
        id: 'dragon-ring-1',
        name: 'Dragon Ring of Power',
        type: 'ring',
        gearType: 'pve',
        tier: 'common',
        rating: 10,
        setId: DRAGON_ARMOR_SET,
        image: '/images/Loot Items/Dragon Armor/dragon_armor_ring_1.png',
        stats: {
            health: 5
        }
    },
    'dragon-ring-2': {
        id: 'dragon-ring-2',
        name: 'Dragon Ring of Might',
        type: 'ring',
        gearType: 'pve',
        tier: 'common',
        rating: 10,
        setId: DRAGON_ARMOR_SET,
        image: '/images/Loot Items/Dragon Armor/dragon_armor_ring_2.png',
        stats: {
            attack: 5
        }
    },
    'dragon-trinket': {
        id: 'dragon-trinket',
        name: 'Draconic Talisman',
        type: 'trinket',
        gearType: 'pve',
        tier: 'common',
        rating: 10,
        setId: DRAGON_ARMOR_SET,
        image: '/images/Loot Items/Dragon Armor/dragon_armor_trinket.png',
        stats: {
            draconicCrit: 8 // 8% chance for double crit damage
        }
    }
};

/**
 * Get all gear items
 */
export function getAllGear() {
    return Object.values(GEAR_ITEMS);
}

/**
 * Get gear items filtered by gear type (pvp or pve)
 */
export function getGearByGearType(gearType) {
    return Object.values(GEAR_ITEMS).filter(item => item.gearType === gearType);
}

/**
 * Get gear item by ID
 */
export function getGearById(gearId) {
    return GEAR_ITEMS[gearId] || null;
}

/**
 * Get gear items by type (helmet, chest, etc)
 */
export function getGearByType(type) {
    return Object.values(GEAR_ITEMS).filter(item => item.type === type);
}

/**
 * Calculate set bonuses for equipped gear
 * @param {Array} equippedGearIds - Array of equipped gear IDs
 * @returns {Object} - Bonus stats from set bonuses
 */
export function calculateSetBonuses(equippedGearIds) {
    const bonuses = {};

    // Count Dragon Armor pieces
    let dragonArmorCount = 0;
    let dragonArmorArmorCount = 0; // Only armor pieces (helmet, chest, legs, boots, gloves)
    const armorSlots = ['helmet', 'chest', 'pants', 'boots', 'gauntlets'];

    equippedGearIds.forEach(gearId => {
        if (!gearId) return;
        const gear = getGearById(gearId);
        if (gear && gear.setId === DRAGON_ARMOR_SET) {
            dragonArmorCount++;
            if (armorSlots.includes(gear.type)) {
                dragonArmorArmorCount++;
            }
        }
    });

    // Apply 5-piece armor set bonus
    if (dragonArmorArmorCount >= 5) {
        bonuses.health = (bonuses.health || 0) + 20;
        bonuses.attack = (bonuses.attack || 0) + 10;
    }

    // Apply 10-piece full set bonus (replaces 5-piece bonus)
    if (dragonArmorCount >= 10) {
        bonuses.health = 50; // Replace, not stack
        bonuses.attack = 25; // Replace, not stack
    }

    return bonuses;
}

/**
 * Get set bonus description for display
 * @param {Array} equippedGearIds - Array of equipped gear IDs
 * @returns {Array} - Array of bonus description strings
 */
export function getSetBonusDescriptions(equippedGearIds) {
    const descriptions = [];

    // Count Dragon Armor pieces
    let dragonArmorCount = 0;
    let dragonArmorArmorCount = 0;
    const armorSlots = ['helmet', 'chest', 'pants', 'boots', 'gauntlets'];

    equippedGearIds.forEach(gearId => {
        if (!gearId) return;
        const gear = getGearById(gearId);
        if (gear && gear.setId === DRAGON_ARMOR_SET) {
            dragonArmorCount++;
            if (armorSlots.includes(gear.type)) {
                dragonArmorArmorCount++;
            }
        }
    });

    // 5-piece armor set bonus
    if (dragonArmorArmorCount >= 5) {
        descriptions.push(`Dragon Armor (5): +20 HP, +10 Damage`);
    }

    // 10-piece full set bonus
    if (dragonArmorCount >= 10) {
        descriptions.push(`Dragon Armor (10): +50 HP, +25 Damage`);
    }

    return descriptions;
}

/**
 * Check if player has full Dragon Armor set equipped
 * @param {Array} equippedGearIds - Array of equipped gear IDs
 * @returns {boolean}
 */
export function hasFullDragonArmorSet(equippedGearIds) {
    let dragonArmorCount = 0;
    equippedGearIds.forEach(gearId => {
        if (!gearId) return;
        const gear = getGearById(gearId);
        // Check for both PVE (has setId) and PVP (starts with 'pvp-dragon-')
        if (gear && (gear.setId === DRAGON_ARMOR_SET || gearId.startsWith('pvp-dragon-'))) {
            dragonArmorCount++;
        }
    });
    console.log(`🐉 Dragon Armor pieces equipped: ${dragonArmorCount}/10`);
    return dragonArmorCount >= 10;
}
