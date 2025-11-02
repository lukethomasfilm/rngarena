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
        maxHealth: 20,
        health: 20,
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
    },

    'raccoon': {
        id: 'raccoon',
        name: 'Raccoon',
        displayName: 'RACCOON',

        // Stats
        maxHealth: 30,
        health: 30,
        attack: 3, // Base attack power
        defense: 2,

        // Visual assets
        sprite: '/images/pve/Raccoon/Raccoon.png',
        attackSprite: '/images/pve/Raccoon/Racoon_attack.png', // Note: typo in filename
        defenseSprite: '/images/pve/Raccoon/Racoon_defend.png', // Note: typo in filename
        rabidNormalSprite: '/images/pve/Raccoon/Racoon_rabid_normal.png', // Rabid mode stance (fixed typo: Racoon not Raccon)
        rabidAttackSprite: '/images/pve/Raccoon/Racoon_rabid.png', // Rabid mode attack (fixed typo: Racoon not Raccon)
        backgroundImage: '/images/pve/Raccoon/Raccon_Background.png', // Note: typo in filename

        // Special ability
        specialAbility: {
            name: 'Rabid Attack',
            description: '10% chance to attack 5 times in a row',
            rabidChance: 10, // 10% chance to trigger rabid attack
            rabidAttackCount: 5, // Number of attacks during rabid mode
            missChance: 0 // Normal hit chance
        },

        // Combat behavior
        combatAI: {
            attackOdds: {
                // Standard attack pattern
                sword_attack: 60,
                crit_strike: 15,
                power_attack: 10,
                shield_bash: 8,
                dodge: 4,
                parry: 3
            }
        },

        // SFX
        sfx: {
            intro: '/images/pve/Raccoon/Raccoon_intro.mp3',
            attack: [
                '/images/pve/Raccoon/Raccoon_attack.mp3',
                '/images/pve/Raccoon/Raccoon_attack_2.mp3',
                '/images/pve/Raccoon/Raccoon_attack_3.mp3'
            ],
            defense: [
                '/images/pve/Raccoon/Racoon_defense.mp3', // Note: typo in filename
                '/images/pve/Raccoon/Raccoon_defend_2.mp3'
            ],
            critical: '/images/pve/Raccoon/Raccoon_critical.mp3'
        },

        // Loot
        loot: {
            chestType: 'wooden',
            chestNumber: 9 // Different chest variant
        }
    },

    'ram': {
        id: 'ram',
        name: 'Ram',
        displayName: 'RAM',

        // Stats (Balanced for ~25% hero win rate)
        maxHealth: 55,
        health: 55,
        attack: 5, // Base attack power
        defense: 4,

        // Visual assets
        sprite: '/images/pve/Ram/Ram.png',
        attackSprite: '/images/pve/Ram/Ram-attack.png',
        defenseSprite: '/images/pve/Ram/Ram-block.png',
        backgroundImage: '/images/pve/Ram/aurelious_arcade_fighting_game_stage_background_side_view_fla_64419087-5747-4dc1-9371-8955909556ea_0.png',

        // Special ability
        specialAbility: {
            name: 'Charge Attack',
            description: '15% chance to charge through dealing 10 damage',
            chargeChance: 15, // 15% chance to trigger charge
            chargeDamage: 10 // Charge deals 10 damage
        },

        // Combat behavior
        combatAI: {
            attackOdds: {
                // Standard attack pattern
                sword_attack: 60,
                crit_strike: 15,
                power_attack: 10,
                shield_bash: 8,
                dodge: 4,
                parry: 3
            }
        },

        // SFX
        sfx: {
            intro: '/images/pve/Ram/ram_snort_intro.mp3',
            attack: [
                '/images/pve/Ram/Ram_hit.mp3',
                '/images/pve/Ram/ram_hit_2.mp3'
            ],
            defense: [
                '/images/pve/Ram/Ram_defend.mp3',
                '/images/pve/Ram/Ram_defend 2.mp3'
            ],
            end: '/images/pve/Ram/Ram_end.mp3',
            charge: '/images/pve/Ram/Ram_charge.mp3'
        },

        // Loot
        loot: {
            chestType: 'wooden',
            chestNumber: 10
        }
    }

    // Future monsters will be added here:
    // 'goblin': { ... },
    // 'serpent': { ... },
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
