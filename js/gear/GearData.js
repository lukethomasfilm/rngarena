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
    CAPE: 'cape',
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

export const GEAR_ITEMS = {
    // ═══════════════════════════════════════════════════════════════
    // PVP GEAR - COSMETIC ONLY (No stats, only rarity rating)
    // ═══════════════════════════════════════════════════════════════

    // ===== PVP HELMETS =====
    'pvp-sturdy-helm': {
        id: 'pvp-sturdy-helm',
        name: 'Sturdy Helm',
        type: 'helmet',
        gearType: 'pvp',
        tier: 'common',
        rating: 10,
        image: '/images/Loot Items/Loot_helmet_test.png'
    },
    'pvp-warrior-helm': {
        id: 'pvp-warrior-helm',
        name: 'Warrior Helm',
        type: 'helmet',
        gearType: 'pvp',
        tier: 'uncommon',
        rating: 25,
        image: '/images/Loot Items/Loot_helmet_test.png'
    },
    'pvp-royal-helm': {
        id: 'pvp-royal-helm',
        name: 'Royal Helm',
        type: 'helmet',
        gearType: 'pvp',
        tier: 'epic',
        rating: 100,
        image: '/images/Loot Items/Loot_helmet_test.png'
    },

    // ===== PVP CHEST ARMOR =====
    'pvp-leather-chest': {
        id: 'pvp-leather-chest',
        name: 'Leather Chest',
        type: 'chest',
        gearType: 'pvp',
        tier: 'common',
        rating: 10,
        image: '/images/Loot Items/Loot_helmet_test.png'
    },
    'pvp-plate-chest': {
        id: 'pvp-plate-chest',
        name: 'Plate Chest',
        type: 'chest',
        gearType: 'pvp',
        tier: 'rare',
        rating: 50,
        image: '/images/Loot Items/Loot_helmet_test.png'
    },
    'pvp-dragon-chest': {
        id: 'pvp-dragon-chest',
        name: 'Dragon Scale Chest',
        type: 'chest',
        gearType: 'pvp',
        tier: 'legendary',
        rating: 200,
        image: '/images/Loot Items/Loot_helmet_test.png'
    },

    // ===== PVP GAUNTLETS =====
    'pvp-iron-gauntlets': {
        id: 'pvp-iron-gauntlets',
        name: 'Iron Gauntlets',
        type: 'gauntlets',
        gearType: 'pvp',
        tier: 'common',
        rating: 10,
        image: '/images/Loot Items/Loot_helmet_test.png'
    },
    'pvp-steel-gauntlets': {
        id: 'pvp-steel-gauntlets',
        name: 'Steel Gauntlets',
        type: 'gauntlets',
        gearType: 'pvp',
        tier: 'uncommon',
        rating: 25,
        image: '/images/Loot Items/Loot_helmet_test.png'
    },
    'pvp-blessed-gauntlets': {
        id: 'pvp-blessed-gauntlets',
        name: 'Blessed Gauntlets',
        type: 'gauntlets',
        gearType: 'pvp',
        tier: 'rare',
        rating: 50,
        image: '/images/Loot Items/Loot_helmet_test.png'
    },

    // ===== PVP PANTS =====
    'pvp-leather-pants': {
        id: 'pvp-leather-pants',
        name: 'Leather Pants',
        type: 'pants',
        gearType: 'pvp',
        tier: 'common',
        rating: 10,
        image: '/images/Loot Items/Loot_helmet_test.png'
    },
    'pvp-chainmail-pants': {
        id: 'pvp-chainmail-pants',
        name: 'Chainmail Pants',
        type: 'pants',
        gearType: 'pvp',
        tier: 'rare',
        rating: 50,
        image: '/images/Loot Items/Loot_helmet_test.png'
    },
    'pvp-knight-pants': {
        id: 'pvp-knight-pants',
        name: 'Knight Greaves',
        type: 'pants',
        gearType: 'pvp',
        tier: 'epic',
        rating: 100,
        image: '/images/Loot Items/Loot_helmet_test.png'
    },

    // ===== PVP BOOTS =====
    'pvp-swift-boots': {
        id: 'pvp-swift-boots',
        name: 'Swift Boots',
        type: 'boots',
        gearType: 'pvp',
        tier: 'uncommon',
        rating: 25,
        image: '/images/Loot Items/Loot_helmet_test.png'
    },
    'pvp-heavy-boots': {
        id: 'pvp-heavy-boots',
        name: 'Heavy Boots',
        type: 'boots',
        gearType: 'pvp',
        tier: 'common',
        rating: 10,
        image: '/images/Loot Items/Loot_helmet_test.png'
    },
    'pvp-winged-boots': {
        id: 'pvp-winged-boots',
        name: 'Winged Boots',
        type: 'boots',
        gearType: 'pvp',
        tier: 'legendary',
        rating: 200,
        image: '/images/Loot Items/Loot_helmet_test.png'
    },

    // ===== PVP CAPES =====
    'pvp-shadow-cape': {
        id: 'pvp-shadow-cape',
        name: 'Shadow Cape',
        type: 'cape',
        gearType: 'pvp',
        tier: 'rare',
        rating: 50,
        image: '/images/Loot Items/Loot_helmet_test.png'
    },
    'pvp-guardian-cape': {
        id: 'pvp-guardian-cape',
        name: 'Guardian Cape',
        type: 'cape',
        gearType: 'pvp',
        tier: 'epic',
        rating: 100,
        image: '/images/Loot Items/Loot_helmet_test.png'
    },
    'pvp-phoenix-cape': {
        id: 'pvp-phoenix-cape',
        name: 'Phoenix Cape',
        type: 'cape',
        gearType: 'pvp',
        tier: 'legendary',
        rating: 200,
        image: '/images/Loot Items/Loot_helmet_test.png'
    },

    // ═══════════════════════════════════════════════════════════════
    // PVE GEAR - STATS + RATINGS (Progressive difficulty)
    // ═══════════════════════════════════════════════════════════════

    // ===== PVE HELMETS =====
    'pve-sturdy-helm': {
        id: 'pve-sturdy-helm',
        name: 'Sturdy Helm',
        type: 'helmet',
        gearType: 'pve',
        tier: 'common',
        rating: 12, // Low starting rating for early PVE
        image: '/images/Loot Items/Loot_helmet_test.png',
        stats: {
            health: 5,
            defense: 3
        }
    },
    'pve-warrior-helm': {
        id: 'pve-warrior-helm',
        name: 'Warrior Helm',
        type: 'helmet',
        gearType: 'pve',
        tier: 'uncommon',
        rating: 30,
        image: '/images/Loot Items/Loot_helmet_test.png',
        stats: {
            attack: 4,
            defense: 2
        }
    },
    'pve-royal-helm': {
        id: 'pve-royal-helm',
        name: 'Royal Helm',
        type: 'helmet',
        gearType: 'pve',
        tier: 'epic',
        rating: 120,
        image: '/images/Loot Items/Loot_helmet_test.png',
        stats: {
            health: 10,
            defense: 6,
            attack: 3
        }
    },

    // ===== PVE CHEST ARMOR =====
    'pve-leather-chest': {
        id: 'pve-leather-chest',
        name: 'Leather Chest',
        type: 'chest',
        gearType: 'pve',
        tier: 'common',
        rating: 15,
        image: '/images/Loot Items/Loot_helmet_test.png',
        stats: {
            health: 10,
            defense: 5
        }
    },
    'pve-plate-chest': {
        id: 'pve-plate-chest',
        name: 'Plate Chest',
        type: 'chest',
        gearType: 'pve',
        tier: 'rare',
        rating: 60,
        image: '/images/Loot Items/Loot_helmet_test.png',
        stats: {
            health: 15,
            defense: 10
        }
    },
    'pve-dragon-chest': {
        id: 'pve-dragon-chest',
        name: 'Dragon Scale Chest',
        type: 'chest',
        gearType: 'pve',
        tier: 'legendary',
        rating: 220,
        image: '/images/Loot Items/Loot_helmet_test.png',
        stats: {
            health: 25,
            defense: 15,
            crit: 3
        }
    },

    // ===== PVE GAUNTLETS =====
    'pve-iron-gauntlets': {
        id: 'pve-iron-gauntlets',
        name: 'Iron Gauntlets',
        type: 'gauntlets',
        gearType: 'pve',
        tier: 'common',
        rating: 13,
        image: '/images/Loot Items/Loot_helmet_test.png',
        stats: {
            attack: 3,
            defense: 2
        }
    },
    'pve-steel-gauntlets': {
        id: 'pve-steel-gauntlets',
        name: 'Steel Gauntlets',
        type: 'gauntlets',
        gearType: 'pve',
        tier: 'uncommon',
        rating: 28,
        image: '/images/Loot Items/Loot_helmet_test.png',
        stats: {
            attack: 5,
            crit: 2
        }
    },
    'pve-blessed-gauntlets': {
        id: 'pve-blessed-gauntlets',
        name: 'Blessed Gauntlets',
        type: 'gauntlets',
        gearType: 'pve',
        tier: 'rare',
        rating: 55,
        image: '/images/Loot Items/Loot_helmet_test.png',
        stats: {
            attack: 7,
            defense: 4,
            crit: 3
        }
    },

    // ===== PVE PANTS =====
    'pve-leather-pants': {
        id: 'pve-leather-pants',
        name: 'Leather Pants',
        type: 'pants',
        gearType: 'pve',
        tier: 'common',
        rating: 11,
        image: '/images/Loot Items/Loot_helmet_test.png',
        stats: {
            health: 8,
            dodge: 3
        }
    },
    'pve-chainmail-pants': {
        id: 'pve-chainmail-pants',
        name: 'Chainmail Pants',
        type: 'pants',
        gearType: 'pve',
        tier: 'rare',
        rating: 58,
        image: '/images/Loot Items/Loot_helmet_test.png',
        stats: {
            defense: 8,
            health: 12
        }
    },
    'pve-knight-pants': {
        id: 'pve-knight-pants',
        name: 'Knight Greaves',
        type: 'pants',
        gearType: 'pve',
        tier: 'epic',
        rating: 115,
        image: '/images/Loot Items/Loot_helmet_test.png',
        stats: {
            defense: 12,
            health: 18,
            dodge: 2
        }
    },

    // ===== PVE BOOTS =====
    'pve-swift-boots': {
        id: 'pve-swift-boots',
        name: 'Swift Boots',
        type: 'boots',
        gearType: 'pve',
        tier: 'uncommon',
        rating: 27,
        image: '/images/Loot Items/Loot_helmet_test.png',
        stats: {
            dodge: 5,
            attack: 2
        }
    },
    'pve-heavy-boots': {
        id: 'pve-heavy-boots',
        name: 'Heavy Boots',
        type: 'boots',
        gearType: 'pve',
        tier: 'common',
        rating: 12,
        image: '/images/Loot Items/Loot_helmet_test.png',
        stats: {
            defense: 4,
            health: 6
        }
    },
    'pve-winged-boots': {
        id: 'pve-winged-boots',
        name: 'Winged Boots',
        type: 'boots',
        gearType: 'pve',
        tier: 'legendary',
        rating: 210,
        image: '/images/Loot Items/Loot_helmet_test.png',
        stats: {
            dodge: 10,
            attack: 5,
            crit: 4
        }
    },

    // ===== PVE CAPES =====
    'pve-shadow-cape': {
        id: 'pve-shadow-cape',
        name: 'Shadow Cape',
        type: 'cape',
        gearType: 'pve',
        tier: 'rare',
        rating: 52,
        image: '/images/Loot Items/Loot_helmet_test.png',
        stats: {
            dodge: 8,
            crit: 3
        }
    },
    'pve-guardian-cape': {
        id: 'pve-guardian-cape',
        name: 'Guardian Cape',
        type: 'cape',
        gearType: 'pve',
        tier: 'epic',
        rating: 105,
        image: '/images/Loot Items/Loot_helmet_test.png',
        stats: {
            defense: 6,
            health: 10
        }
    },
    'pve-phoenix-cape': {
        id: 'pve-phoenix-cape',
        name: 'Phoenix Cape',
        type: 'cape',
        gearType: 'pve',
        tier: 'legendary',
        rating: 215,
        image: '/images/Loot Items/Loot_helmet_test.png',
        stats: {
            health: 15,
            crit: 6,
            dodge: 5
        }
    },

    // ===== PVE RINGS =====
    'pve-power-ring': {
        id: 'pve-power-ring',
        name: 'Ring of Power',
        type: 'ring',
        gearType: 'pve',
        tier: 'uncommon',
        rating: 26,
        image: '/images/Loot Items/Loot_helmet_test.png',
        stats: {
            attack: 5,
            crit: 2
        }
    },
    'pve-defense-ring': {
        id: 'pve-defense-ring',
        name: 'Ring of Defense',
        type: 'ring',
        gearType: 'pve',
        tier: 'uncommon',
        rating: 28,
        image: '/images/Loot Items/Loot_helmet_test.png',
        stats: {
            defense: 4,
            health: 5
        }
    },
    'pve-crit-ring': {
        id: 'pve-crit-ring',
        name: 'Ring of Precision',
        type: 'ring',
        gearType: 'pve',
        tier: 'rare',
        rating: 54,
        image: '/images/Loot Items/Loot_helmet_test.png',
        stats: {
            crit: 6,
            attack: 3
        }
    },

    // ===== PVE WEAPONS =====
    'pve-iron-sword': {
        id: 'pve-iron-sword',
        name: 'Iron Sword',
        type: 'weapon',
        gearType: 'pve',
        tier: 'common',
        rating: 14,
        twoHanded: false,
        image: '/images/Loot Items/daring_hero_sword.png',
        stats: {
            attack: 10
        }
    },
    'pve-steel-greatsword': {
        id: 'pve-steel-greatsword',
        name: 'Steel Greatsword',
        type: 'weapon',
        gearType: 'pve',
        tier: 'rare',
        rating: 62,
        twoHanded: true,
        image: '/images/Loot Items/daring_hero_sword.png',
        stats: {
            attack: 20,
            crit: 5
        }
    },
    'pve-dagger-of-speed': {
        id: 'pve-dagger-of-speed',
        name: 'Dagger of Speed',
        type: 'weapon',
        gearType: 'pve',
        tier: 'uncommon',
        rating: 29,
        twoHanded: false,
        image: '/images/Loot Items/daring_hero_sword.png',
        stats: {
            attack: 8,
            dodge: 4
        }
    },

    // ===== PVE OFF-HAND =====
    'pve-wooden-shield': {
        id: 'pve-wooden-shield',
        name: 'Wooden Shield',
        type: 'offhand',
        gearType: 'pve',
        tier: 'common',
        rating: 13,
        image: '/images/Loot Items/Loot_helmet_test.png',
        stats: {
            defense: 8,
            health: 5
        }
    },
    'pve-steel-shield': {
        id: 'pve-steel-shield',
        name: 'Steel Shield',
        type: 'offhand',
        gearType: 'pve',
        tier: 'rare',
        rating: 56,
        image: '/images/Loot Items/Loot_helmet_test.png',
        stats: {
            defense: 15,
            health: 10
        }
    },
    'pve-magic-orb': {
        id: 'pve-magic-orb',
        name: 'Magic Orb',
        type: 'offhand',
        gearType: 'pve',
        tier: 'epic',
        rating: 108,
        image: '/images/Loot Items/Loot_helmet_test.png',
        stats: {
            attack: 8,
            crit: 5
        }
    },

    // ===== PVE TRINKETS =====
    'pve-lucky-charm': {
        id: 'pve-lucky-charm',
        name: 'Lucky Charm',
        type: 'trinket',
        gearType: 'pve',
        tier: 'rare',
        rating: 53,
        image: '/images/Loot Items/Loot_helmet_test.png',
        stats: {
            crit: 8,
            dodge: 4
        }
    },
    'pve-vitality-amulet': {
        id: 'pve-vitality-amulet',
        name: 'Vitality Amulet',
        type: 'trinket',
        gearType: 'pve',
        tier: 'epic',
        rating: 110,
        image: '/images/Loot Items/Loot_helmet_test.png',
        stats: {
            health: 20,
            defense: 5
        }
    },
    'pve-berserker-pendant': {
        id: 'pve-berserker-pendant',
        name: 'Berserker Pendant',
        type: 'trinket',
        gearType: 'pve',
        tier: 'legendary',
        rating: 218,
        image: '/images/Loot Items/Loot_helmet_test.png',
        stats: {
            attack: 12,
            crit: 10,
            health: 10
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
