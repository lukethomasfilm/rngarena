/**
 * PVEMonsters.js
 * Monster definitions for PVE battles
 * Each monster has stats, abilities, and special behavior
 */

export const PVE_MONSTERS = {
    'wood-dummy': {
        id: 'wood-dummy',
        name: 'Wood Dummy',
        displayName: 'WOOD DUMMY',

        // Stats
        maxHealth: 40,
        health: 40,
        attack: 0, // Never actually deals damage due to always missing
        defense: 0,

        // Visual assets
        sprite: '/images/pve/Dummy/wood-dummy.png',
        hitSprite: '/images/pve/Dummy/wood-dummy-hit.png',

        // Special ability
        specialAbility: {
            name: 'Training Dummy',
            description: 'Always misses its attacks',
            missChance: 100, // Always misses (100%)
            neverAttacks: true // Literally never attacks
        },

        // Combat behavior
        combatAI: {
            attackOdds: {
                // Uses same odds as hero but will always miss
                sword_attack: 55,
                crit_strike: 18,
                power_attack: 12,
                shield_bash: 8,
                dodge: 4,
                parry: 3
            }
        },

        // SFX
        sfx: {
            hit: [
                '/images/pve/Dummy/dummywood1.mp3',
                '/images/pve/Dummy/dummywood2.mp3.mp3', // Note: double .mp3 extension
                '/images/pve/Dummy/dummywood3.mp3'
            ],
            hay: '/images/pve/Dummy/hay.mp3' // Straw/hay sound when dummy is hit
        },

        // Loot
        loot: {
            chestType: 'wooden', // Always drops wooden chest
            chestNumber: 8 // chest_08.png
        }
    }

    // Future monsters will be added here:
    // 'raccoon': { ... },
    // 'goblin': { ... },
    // etc.
};

/**
 * Get monster data by ID
 */
export function getMonster(monsterId) {
    const monster = PVE_MONSTERS[monsterId];
    if (!monster) {
        console.error(`Monster not found: ${monsterId}`);
        return null;
    }

    // Return a copy to avoid mutation
    return JSON.parse(JSON.stringify(monster));
}

/**
 * Get monster display info for UI
 */
export function getMonsterInfo(monsterId) {
    const monster = PVE_MONSTERS[monsterId];
    if (!monster) return null;

    return {
        name: monster.displayName,
        health: monster.health,
        maxHealth: monster.maxHealth,
        ability: monster.specialAbility.description
    };
}
