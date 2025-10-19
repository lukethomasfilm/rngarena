// Game Configuration Constants

export const GAME_CONFIG = {
    // Tournament Settings
    TOTAL_PARTICIPANTS: 100,

    // HP Scaling by Round
    HP_BY_ROUND: {
        1: 10,
        2: 10,
        3: 16,
        4: 16,
        5: 24,
        6: 24,
        7: 40,  // Quarterfinals
        8: 40,  // Semifinals
        9: 40   // Finals
    },

    // Damage Values
    DAMAGE: {
        LOW: 1,
        MEDIUM: 2,
        HIGH: 3,
        CRITICAL: 7
    },

    // Critical Hit Settings
    CRIT_CHANCE: 0.125, // 12.5% chance (1/8)

    // Combat Timing (ms)
    TIMING: {
        BATTLE_START_DELAY: 1500,
        ENTRANCE_DURATION: 2000,
        TURN_DELAY: 1800,
        VICTORY_DISPLAY: 2000,
        AUTO_CONTINUE_DELAY: 5000, // Black reaches 95% at 5000ms (starts at 4000ms + 1000ms fade)
        FIGHTER_ENTRANCE_DELAY: 100,
        STATUS_FADE_OUT: 1000
    }
};

export const EMOJI_CONFIG = {
    // Base spawn rate (ms between spawns)
    BASE_SPAWN_RATE: 1000,

    // Spawn rate by round (faster as tournament progresses)
    SPAWN_RATE_BY_ROUND: {
        1: 2000,  // Start slow (half the emojis)
        2: 1600,
        3: 1300,
        4: 1000,
        5: 800,
        6: 600,
        7: 400,   // Quarterfinals
        8: 300,   // Semifinals
        9: 200    // Finals
    },

    // Available emojis
    EMOJI_POOL: ['⚔️', '🛡️', '💥', '🔥', '⚡', '💀', '👑', '🏆', '💪', '🎯'],

    // Animation duration (ms)
    ANIMATION_DURATION: 5000
};

export const BRACKET_CONFIG = {
    // Zoom settings
    MIN_ZOOM: 0.7,
    MAX_ZOOM: 2.0,
    ZOOM_STEP: 0.1,
    DEFAULT_ZOOM: 0.7,

    // Display settings
    ZOOM_DISPLAY_OFFSET: 70, // Shows 100% when actual is 0.7
    SCROLL_DELAY: 200
};

export const LOOT_CONFIG = {
    // Loot tiers in order
    TIERS: ['gray', 'white', 'green', 'blue', 'purple', 'orange', 'gold'],

    // Chest images by tier (1-indexed)
    CHEST_IMAGES: {
        1: 'chest_01.png', // Gray
        2: 'chest_02.png', // White
        3: 'chest_03.png', // Green
        4: 'chest_04.png', // Blue
        5: 'chest_05.png', // Purple
        6: 'chest_06.png', // Orange
        7: 'chest_08.png'  // Gold (using chest_08)
    },

    // Tier colors for effects
    TIER_COLORS: {
        gray: '#808080',
        white: '#FFFFFF',
        green: '#00FF00',
        blue: '#0080FF',
        purple: '#8000FF',
        orange: '#FF8000',
        gold: '#FFD700'
    }
};

export const ARENA_CONFIG = {
    // Available backgrounds
    BACKGROUNDS: ['castle', 'courtyard', 'desert', 'japan', 'mushrooms', 'ruins', 'ships', 'snow'],

    // Special gold background
    GOLD_BACKGROUND: 'gold',

    // Background rotation
    DEFAULT_BACKGROUND: 'castle'
};

export const CHARACTER_CONFIG = {
    // OLD STATIC KNIGHT SYSTEM REMOVED - All fighters now use 3-pose character skins

    // Hero images (3-pose system)
    HERO_READY: 'daring_hero_ready.png',
    HERO_ATTACK: 'daring_hero_attack.png',
    HERO_DEFENSE: 'daring_hero_defense.png',

    // Athena images (3-pose system)
    ATHENA_NEUTRAL: 'athena_neutral.png',
    ATHENA_ATTACK: 'Athena_attack.png',
    ATHENA_DEFEND: 'athena_defend.png',

    // Nesta images (3-pose system)
    NESTA_NEUTRAL: 'nesta_neutral.png',
    NESTA_ATTACK: 'nesta_attack.png',
    NESTA_DEFEND: 'nesta_defense.png',

    // Green Knight images (3-pose system for random male fighters)
    GREEN_KNIGHT_NEUTRAL: 'green_neutral.png',
    GREEN_KNIGHT_ATTACK: 'green_attack.png',
    GREEN_KNIGHT_DEFEND: 'green_defense.png',

    // Barb images (3-pose system for random male fighters - left-oriented)
    BARB_NEUTRAL: 'barb_attack.png',  // Using attack as neutral for now
    BARB_ATTACK: 'barb_attack.png',
    BARB_DEFEND: 'barb_defense.png',

    // Black Knight images (3-pose system for random male fighters - left-oriented)
    BLACK_NEUTRAL: 'black_ready.png',
    BLACK_ATTACK: 'black_attack.png',
    BLACK_DEFEND: 'black_defense.png',

    // Red Knight images (3-pose system for random male fighters - right-oriented)
    RED_NEUTRAL: 'red_neutral.png',
    RED_ATTACK: 'red_attack.png',
    RED_DEFEND: 'red_defense.png',

    // Brown Knight images (3-pose system for random male fighters - right-oriented)
    BROWN_NEUTRAL: 'brown_neutral.png',
    BROWN_ATTACK: 'brown_attack.png',
    BROWN_DEFEND: 'brown_defence.png',

    // Blue Knight images (3-pose system for random male fighters - left-oriented)
    BLUE_NEUTRAL: 'blue_neutral.png',
    BLUE_ATTACK: 'blue_attack.png',
    BLUE_DEFEND: 'blue_block.png',

    // Female names using Athena skin (half of female fighters)
    ATHENA_NAMES: [
        'Lady Lagspike', 'Dame Critfail', 'Duchess Respawn', 'Lady Questgiver',
        'Dame Loothoarder', 'Lady Ragequit', 'Duchess Oneshot', 'Lady Minmaxer',
        'Dame Speedrun', 'Lady Checkpoint', 'Duchess Autoaim', 'Dame Buttonmash',
        'Lady Quicksave'
    ],

    // Female names using Nesta skin (half of female fighters)
    NESTA_NAMES: [
        'Duchess Tiltlord', 'Lady Wallhack', 'Dame Noscope', 'Lady Spawncamp',
        'Duchess Griefborn', 'Dame Glitchlord', 'Lady Permadeath', 'Duchess Farmbot',
        'Dame Multibox', 'Lady Tryhard', 'Duchess Clutch', 'Dame Sweatlord'
    ],

    // All female names combined (for 25% of fighters)
    FEMALE_NAMES: [
        'Lady Lagspike', 'Dame Critfail', 'Duchess Respawn', 'Lady Questgiver',
        'Dame Loothoarder', 'Lady Ragequit', 'Duchess Oneshot', 'Lady Minmaxer',
        'Dame Speedrun', 'Lady Checkpoint', 'Duchess Autoaim', 'Dame Buttonmash',
        'Lady Quicksave', 'Duchess Tiltlord', 'Lady Wallhack', 'Dame Noscope',
        'Lady Spawncamp', 'Duchess Griefborn', 'Dame Glitchlord', 'Lady Permadeath',
        'Duchess Farmbot', 'Dame Multibox', 'Lady Tryhard', 'Duchess Clutch',
        'Dame Sweatlord'
    ],

    // Male fighters using Green Knight skin (3-pose system)
    GREEN_KNIGHT_NAMES: [
        'Sir Lagalot', 'Lord Derpsalot', 'Baron AFK-King', 'Duke Noobstick',
        'Sir Ragequit', 'Count Feedlord', 'Baron Scrublord', 'Lord Disconnect',
        'Sir Respawn', 'Duke Potato', 'Baron Campfire', 'Count Keyboard',
        'Sir Failstack', 'Lord Flatline', 'Duke Onetrick'
    ],

    // Male fighters using Barb skin (3-pose system - left-oriented like Athena)
    BARB_NAMES: [
        'Sir Bonkmaster', 'Lord Smashface', 'Duke Unga-Bunga', 'Baron Headbutt',
        'Sir Meatshield', 'Count Bigaxe', 'Lord Chunkyboi', 'Duke Groundpound',
        'Baron Necksnap', 'Sir Facetank', 'Count Skullcrush', 'Lord Spinebreak',
        'Duke Ribcracker', 'Baron Hammertime', 'Sir Cleave'
    ],

    // Male fighters using Black Knight skin (3-pose system - left-oriented)
    BLACK_NAMES: [
        'Lord Edgelord', 'Duke Backstab', 'Baron Shadowblade', 'Sir Darksoul',
        'Count Nightfall', 'Lord Voidborn', 'Duke Grimdark', 'Baron Bloodmoon',
        'Sir Obsidian', 'Count Doomstrike', 'Lord Ravensbane', 'Duke Netherblade'
    ],

    // Male fighters using Red Knight skin (3-pose system - right-oriented)
    RED_NAMES: [
        'Baron Fireborn', 'Count Blazewing', 'Sir Pyromancer', 'Lord Emberstorm',
        'Duke Scorchblade', 'Baron Ashmaker', 'Sir Flameheart', 'Count Infernox',
        'Lord Burnstrike', 'Duke Moltencore', 'Baron Cinderfist', 'Sir Wildfire'
    ],

    // Male fighters using Brown Knight skin (3-pose system - right-oriented)
    BROWN_NAMES: [
        'Baron Mudslide', 'Count Rockfall', 'Sir Earthshaker', 'Lord Boulder',
        'Duke Stonefist', 'Baron Ironore', 'Sir Gravelord', 'Count Dustborn'
    ],

    // Male fighters using Blue Knight skin (3-pose system - left-oriented)
    BLUE_NAMES: [
        'Baron Frostbite', 'Count Iceshard', 'Sir Snowdrift', 'Lord Winterborn',
        'Duke Glacius', 'Baron Coldsnap', 'Sir Permafrost', 'Count Blizzard',
        'Lord Chillfang', 'Duke Frostpeak', 'Baron Hailstorm', 'Sir Icebreaker'
    ],

    // Female attack sound paths
    FEMALE_ATTACK_SOUNDS: [
        '/sfx/female_attack.mp3',
        '/sfx/female_attack_2.mp3',
        '/sfx/female_attack_3.mp3'
    ],

    // Image paths
    CHARACTER_PATH: 'images/Characters/',
    BACKGROUND_PATH: 'images/backgrounds/',
    LOOT_PATH: 'images/Loot/'
};

export const UI_CONFIG = {
    // Chat settings
    MAX_CHAT_MESSAGES: 200,
    CHAT_SCROLL_BEHAVIOR: 'smooth',

    // Chat spawn rate by round (faster as tournament progresses)
    CHAT_RATE_BY_ROUND: {
        1: 3600,  // Start very slow (half the chat)
        2: 2800,
        3: 2200,
        4: 1800,
        5: 1400,
        6: 1000,
        7: 600,   // Quarterfinals
        8: 400,   // Semifinals
        9: 200    // Finals - very fast
    },

    // Progress bar segments
    TOTAL_ROUNDS: 8, // Displayed rounds (actual is 9 but we show 8)

    // Animation classes
    ENTRANCE_LEFT: 'fighter-entrance-left',
    ENTRANCE_RIGHT: 'fighter-entrance-right',
    FIGHTER_EXIT: 'fighter-exit',
    WINNER_POSE: 'winner-pose'
};

// Chat message arrays
export const CHAT_MESSAGES = {
    // Hype messages
    HYPE: [
        "LET'S GOOOO!",
        "HYPE HYPE HYPE!",
        "THIS IS INSANE!",
        "TOURNAMENT BRACKET BATTLE!",
        "WHO'S GONNA WIN?!",
        "SO HYPED RIGHT NOW!",
        "PURE RNG CHAOS!",
        "ANYTHING CAN HAPPEN!",
        "NO STRATEGY JUST VIBES!",
        "RNG GODS DECIDE!",
        "AKSJDHAKSJD",
        "GET GOOD",
        "PERIODT NO PRINTER",
        "CLUTCH OR KICK",
        "EZ CLAP",
        "GG NO RE",
        "I've been watching this tournament for 3 hours straight and I have no regrets",
        "My entire family is gathered around the screen watching this epic battle unfold",
        "This RNG tournament has more plot twists than my favorite TV show",
        "Just put my life savings on the next fighter, wish me luck!",
        "I told my boss I was sick so I could watch this tournament and honestly worth it",
        "The way these knights are swinging their swords is pure poetry in motion",
        "I'm literally on the edge of my seat and I can't feel my legs anymore",
        "This tournament is the most exciting thing that's happened to me all year",
        "Can we get a slow motion replay of that last hit? That was INSANE",
        "My heart can't take this level of excitement, someone send help"
    ],

    // Win messages
    WIN: [
        "WHAT A WIN!",
        "INCREDIBLE!",
        "LEGENDARY!",
        "AMAZING!",
        "UNBELIEVABLE!",
        "CLUTCH!",
        "DOMINANCE!",
        "FLAWLESS!",
        "UNSTOPPABLE!",
        "GODLIKE!",
        "That was the most epic comeback I've ever witnessed in tournament history!",
        "I literally screamed so loud my neighbors came over to check if I was okay",
        "Someone needs to put that victory in the hall of fame RIGHT NOW",
        "That knight just wrote their name in the history books with that performance",
        "I'm gonna tell my grandchildren about the day I watched this legendary victory"
    ],

    // Combat messages
    COMBAT: [
        "BIG DAMAGE!",
        "HUGE HIT!",
        "MASSIVE BLOW!",
        "CRITICAL STRIKE!",
        "DEVASTATING!",
        "BRUTAL!",
        "SAVAGE!",
        "CLEAN HIT!",
        "NICE SHOT!",
        "DIRECT HIT!",
        "Did you SEE that hit?! I had to rewind just to make sure it actually happened",
        "That strike was so powerful I felt it through my screen",
        "My jaw is literally on the floor after seeing that critical blow",
        "That's the kind of combat move that gets replayed in highlight reels forever"
    ],

    // Arena welcomes
    ARENA_WELCOME: {
        castle: "Welcome to the Castle Arena!",
        courtyard: "Welcome to the Courtyard!",
        desert: "Welcome to the Desert Wastes!",
        japan: "Welcome to the Ancient Dojo!",
        snow: "Welcome to the Frozen Peaks!",
        mushrooms: "Welcome to the Mushroom Grove!",
        ruins: "Welcome to the Ancient Ruins!",
        ships: "Welcome to the Ship Graveyard!",
        gold: "Welcome to the GOLDEN ARENA!"
    }
};

// Announcer messages for special moments
export const ANNOUNCER_MESSAGES = {
    TOURNAMENT_START: "🎺 TOURNAMENT BEGINS! 🎺",
    DARING_HERO_START: "💪 DARING HERO VS THE WORLD! 💪",
    BATTLE_COMMENCE: "🛡️ BATTLE COMMENCING NOW! 🛡️",
    HERO_ELIMINATED: "💀 DARING HERO HAS BEEN ELIMINATED! 💀",
    NEW_FOLLOW_PREFIX: "👑 NOW FOLLOWING ",
    WINNER_PREFIX: "🏆 ",
    WINNER_SUFFIX: " WINS! 🏆"
};

// Round names
export const ROUND_NAMES = {
    1: "Round 1",
    2: "Round 2",
    3: "Round 3",
    4: "Round 4",
    5: "Quarterfinals",
    6: "Semifinals",
    7: "Final",
    8: "Champion"
};

// Economy & Progression (Session-based, resets on refresh)
export const ECONOMY_CONFIG = {
    // Gold rewards for PVE tournament completion
    TOURNAMENT_REWARDS: {
        ROUND_1: 100,
        ROUND_2: 200,
        ROUND_3: 300,
        ROUND_4: 400,
        ROUND_5: 500,   // Quarterfinals
        ROUND_6: 750,   // Semifinals
        ROUND_7: 1000,  // Final
        ROUND_8: 2000   // Champion (complete victory)
    },

    // Battle rewards
    BATTLE_WIN_GOLD: 10,
    CRITICAL_HIT_BONUS: 5,

    // Starting values
    STARTING_GOLD: 0,
    STARTING_GEMS: 0
};

// Screen/Navigation IDs
export const SCREENS = {
    HOME: 'home',
    CASTLE: 'castle',
    MAP: 'map',
    PVE_TOURNAMENT: 'pve-tournament'
};
