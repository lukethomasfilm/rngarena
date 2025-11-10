/**
 * PVEMonsters.js
 * Monster definitions for PVE battles
 * Each monster has stats, abilities, and special behavior
 */

export const PVE_MONSTERS = {
    'wood-dummy': {
        id: 'wood-dummy',
        name: 'Training Dummy',
        displayName: 'TRAINING DUMMY',

        // Stats
        maxHealth: 20,
        health: 20,
        attack: 0, // Never actually deals damage due to always missing
        defense: 0,

        // Visual assets
        sprite: '/images/pve/Dummy/wood-dummy.png',
        hitSprite: '/images/pve/Dummy/wood-dummy-hit.png',

        // Transform and behavior config
        baseTransform: 'scale(0.9) translateY(-20px)', // No flip - faces correct direction
        soundProfile: 'wood', // Uses wood hit sounds (dummywood1-3 + hay)
        canLunge: false, // On a stick - can't move!
        showMissText: false, // Doesn't show miss text (never attacks anyway)

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

        // Loot - Tier 1 (Training/Lowest)
        loot: {
            chestType: 'wooden',
            chestNumber: 8, // Grey - Wood - Common
            material: 'Wood',
            rarity: 'Common'
        }
    },

    'raccoon': {
        id: 'raccoon',
        name: 'Raging Raccoon',
        displayName: 'RAGING RACCOON',

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

        // Transform and behavior config
        baseTransform: 'scaleX(-1) scale(0.4) translateY(-13px)', // Flipped + small + raised
        soundProfile: 'flesh', // Uses standard vocalization + flesh hit sounds
        canLunge: true,
        showMissText: true,

        // Special ability
        specialAbility: {
            name: 'Rabid Attack',
            description: '20% chance to attack 3 times in a row',
            rabidChance: 20, // 20% chance to trigger rabid attack (tuned for ~50% hero win rate)
            rabidAttackCount: 3, // Number of attacks during rabid mode
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

        // Loot - Tier 1 (Same as Dummy - Lowest)
        loot: {
            chestType: 'wooden',
            chestNumber: 8, // Grey - Wood - Common
            material: 'Wood',
            rarity: 'Common'
        }
    },

    'ram': {
        id: 'ram',
        name: 'Rampaging Ram',
        displayName: 'RAMPAGING RAM',

        // Stats (Balanced for ~20% hero win rate)
        maxHealth: 36,
        health: 36,
        attack: 5, // Base attack power
        defense: 4,

        // Visual assets
        sprite: '/images/pve/Ram/Ram.png',
        attackSprite: '/images/pve/Ram/Ram-attack.png',
        defenseSprite: '/images/pve/Ram/Ram-block.png',
        backgroundImage: '/images/pve/Ram/aurelious_arcade_fighting_game_stage_background_side_view_fla_64419087-5747-4dc1-9371-8955909556ea_0.png',

        // Transform and behavior config
        baseTransform: 'scale(0.8775) translateY(-10px)', // No flip - faces left
        soundProfile: 'vocal-only', // Only vocalization, no fleshy hit sound
        canLunge: true,
        showMissText: true,

        // Special ability
        specialAbility: {
            name: 'Charge Attack',
            description: '25% chance to charge through dealing 7 damage',
            chargeChance: 25, // 25% chance to trigger charge (tuned for ~20% hero win rate)
            chargeDamage: 7 // Charge deals 7 damage (tuned for balance)
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

        // Loot - Tier 2
        loot: {
            chestType: 'stone',
            chestNumber: 7, // Green - Stone - Uncommon
            material: 'Stone',
            rarity: 'Uncommon'
        }
    },

    'frog-fish': {
        id: 'frog-fish',
        name: 'Finicky Frog-Fish',
        displayName: 'FINICKY FROG-FISH',

        // Stats (Balanced for ~10% hero win rate with defend/dodge mechanics)
        maxHealth: 35,
        health: 35,
        attack: 4,
        defense: 3,

        // Visual assets
        sprite: '/images/pve/Frogger/Frogger_normal.png',
        attackSprite: '/images/pve/Frogger/Frogger_attack.png',
        defenseSprite: '/images/pve/Frogger/Frogger_defense.png',
        backgroundImage: '/images/pve/Frogger/Frogger_background.png',

        // Transform and behavior config
        baseTransform: 'scale(0.65) translateY(15px)', // No flip - faces left, lowered
        soundProfile: 'flesh', // Standard vocalization + flesh hit
        canLunge: true,
        showMissText: true,

        // Special ability - Sonic Croak
        specialAbility: {
            name: 'Sonic Croak',
            description: '30% chance to unleash sonic croak dealing 9 damage and stunning hero',
            croakChance: 30, // 30% chance to trigger sonic croak (tuned for ~10% hero win rate)
            croakDamage: 9, // Sonic croak deals 9 damage (tuned for balance)
            effect: 'stunned' // Hero is stunned (misses next attack)
        },

        // Combat behavior
        combatAI: {
            attackOdds: {
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
            intro: '/images/pve/Frogger/Frogger_intro.mp3',
            attack: [
                '/images/pve/Frogger/Frogger_hit.mp3',
                '/images/pve/Frogger/Frogger_hit_2.mp3'
            ],
            defense: [
                '/images/pve/Frogger/Frogger_defense.mp3',
                '/images/pve/Frogger/Frogger_degense_2.mp3', // Note: typo in filename
                '/images/pve/Frogger/Frogger_defense_3.mp3'
            ],
            end: '/images/pve/Frogger/Frogger_outro.mp3',
            croak: '/images/pve/Frogger/Frogger_croak.mp3' // Special ability sound
        },

        // Loot - Tier 3
        loot: {
            chestType: 'copper',
            chestNumber: 6, // Blue - Copper - Rare
            material: 'Copper',
            rarity: 'Rare'
        }
    },

    'ripplefang': {
        id: 'ripplefang',
        name: 'Ripplefang',
        displayName: 'RIPPLEFANG',

        // Stats (Medium Boss - Balanced for ~2% hero win rate - players should have gear by now)
        maxHealth: 80,
        health: 80,
        attack: 6, // Base attack power
        defense: 5,

        // Visual assets
        sprite: '/images/pve/Serpent/Ripplefang.png',
        attackSprite: '/images/pve/Serpent/Ripplefang_attack.png',
        defenseSprite: '/images/pve/Serpent/Ripplefang_defend.png',
        backgroundImage: '/images/pve/Serpent/Ripplefang_background.png',

        // Transform and behavior config
        baseTransform: 'scale(0.96) translateY(30px)', // No flip - faces left, 20% larger (0.8 * 1.2), lowered
        soundProfile: 'flesh', // Standard vocalization + flesh hit
        canLunge: true,
        showMissText: true,

        // Special abilities (TWO attacks - medium boss)
        specialAbility: {
            // Venom Strike - Poison damage over time
            venomStrike: {
                name: 'Venom Strike',
                description: '25% chance to strike with venom, dealing damage + poison damage per turn for 3 turns',
                venomChance: 25, // 25% chance to trigger (tuned for ~2% hero win rate)
                venomDamage: 7, // Initial strike damage (tuned for balance)
                poisonDamage: 2, // Damage per turn
                poisonDuration: 3 // 3 turns of poison
            },
            // Tidal Wave - Powerful wave attack
            tidalWave: {
                name: 'Tidal Wave',
                description: '20% chance to summon a tidal wave dealing 9 damage',
                waveChance: 20, // 20% chance to trigger (tuned for ~2% hero win rate)
                waveDamage: 9 // Wave deals 9 damage (tuned for balance)
            }
        },

        // Combat behavior
        combatAI: {
            attackOdds: {
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
            intro: '/images/pve/Serpent/serpent_intro.mp3',
            attack: [
                '/images/pve/Serpent/serpent_attack_1.mp3',
                '/images/pve/Serpent/serpent_attack_2.mp3',
                '/images/pve/Serpent/serpent_attack_3.mp3'
            ],
            defense: '/images/pve/Serpent/serpent_defend.mp3',
            hit: [
                '/images/pve/Serpent/serpent_hit.mp3',
                '/images/pve/Serpent/serpent_hit_2.mp3'
            ],
            hitCrit: '/images/pve/Serpent/serpent_hit_crit.mp3', // When serpent gets CRIT by hero
            miss: [
                '/images/pve/Serpent/serpent_miss.mp3',
                '/images/pve/Serpent/serpent_miss_2.mp3'
            ],
            end: '/images/pve/Serpent/serpent_intro_2.mp3', // Using intro_2 as outro
            venomStrike: '/images/pve/Serpent/serpent_venom_strike.mp3',
            tidalWave: [
                '/images/pve/Serpent/serpent_wave_strike.mp3',
                '/images/pve/Serpent/wave_strike_2.mp3'
            ]
        },

        // Loot - Tier 4 (Medium Boss)
        loot: {
            chestType: 'bronze',
            chestNumber: 5, // Teal - Bronze - Superior
            material: 'Bronze',
            rarity: 'Superior'
        }
    }

    // Future monsters (4 more for 9 total):
    // Monster 6: Tier 5 - chestNumber: 4 (Purple - Silver - Epic)
    // Monster 7: Tier 6 - chestNumber: 3 (Orange - Gold - Legendary)
    // Monster 8: Tier 7 - chestNumber: 2 (Crimson - Diamond - Mythic)
    // Monster 9: Tier 8 - chestNumber: 1 (Gold - Platinum - Exalted)
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
