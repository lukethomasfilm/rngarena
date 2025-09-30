// Game Configuration Constants

export const GAME_CONFIG = {
    // Tournament Settings
    TOTAL_PARTICIPANTS: 100,

    // HP Scaling by Round
    HP_BY_ROUND: {
        1: 5,
        2: 5,
        3: 8,
        4: 8,
        5: 12,
        6: 12,
        7: 20,  // Quarterfinals
        8: 20,  // Semifinals
        9: 20   // Finals
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
        AUTO_CONTINUE_DELAY: 2000,
        FIGHTER_ENTRANCE_DELAY: 500,
        STATUS_FADE_OUT: 1000
    }
};

export const EMOJI_CONFIG = {
    // Base spawn rate (ms between spawns)
    BASE_SPAWN_RATE: 1000,

    // Spawn rate by round (faster as tournament progresses)
    SPAWN_RATE_BY_ROUND: {
        1: 1000,
        2: 900,
        3: 800,
        4: 700,
        5: 600,
        6: 500,
        7: 400,   // Quarterfinals
        8: 300,   // Semifinals
        9: 200    // Finals
    },

    // Available emojis
    EMOJI_POOL: ['⚔️', '🛡️', '💥', '🔥', '⚡', '💀', '👑', '🎯', '✨', '💫', '🌟', '🏆'],

    // Animation duration (ms)
    ANIMATION_DURATION: 5000
};

export const BRACKET_CONFIG = {
    // Zoom settings
    MIN_ZOOM: 1.6,
    MAX_ZOOM: 4.0,
    ZOOM_STEP: 0.4,
    DEFAULT_ZOOM: 1.6,

    // Display settings
    ZOOM_DISPLAY_OFFSET: 100, // Shows 100% when actual is 160%
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
    BACKGROUNDS: ['castle', 'courtyard', 'desert', 'forest', 'mountain', 'mushrooms', 'ruins', 'ships'],

    // Special gold background
    GOLD_BACKGROUND: 'gold',

    // Background rotation
    DEFAULT_BACKGROUND: 'castle'
};

export const CHARACTER_CONFIG = {
    // Knight image files
    KNIGHT_IMAGES: ['Knight_01.png', 'Knight_02.png', 'Knight_03.png', 'knight_04.png', 'knight_05.png'],

    // Hero image
    HERO_IMAGE: 'Daring_hero.png',

    // Image paths
    CHARACTER_PATH: 'images/Characters/',
    BACKGROUND_PATH: 'images/backgrounds/',
    LOOT_PATH: 'images/Loot/'
};

export const UI_CONFIG = {
    // Chat settings
    MAX_CHAT_MESSAGES: 100,
    CHAT_SCROLL_BEHAVIOR: 'smooth',

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
        "GG NO RE"
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
        "GODLIKE!"
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
        "DIRECT HIT!"
    ],

    // Arena welcomes
    ARENA_WELCOME: {
        castle: "Welcome to the Castle Arena!",
        courtyard: "Welcome to the Courtyard!",
        desert: "Welcome to the Desert Wastes!",
        forest: "Welcome to the Ancient Forest!",
        mountain: "Welcome to the Frozen Peaks!",
        mushrooms: "Welcome to the Mushroom Grove!",
        ruins: "Welcome to the Ancient Ruins!",
        ships: "Welcome to the Ship Graveyard!",
        gold: "Welcome to the GOLDEN ARENA!"
    }
};

// Announcer messages for special moments
export const ANNOUNCER_MESSAGES = {
    TOURNAMENT_START: "🎺 TOURNAMENT BEGINS! 🎺",
    DARING_HERO_START: "DARING HERO VS THE WORLD!",
    BATTLE_COMMENCE: "BATTLE COMMENCING NOW!",
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
    5: "Round 5",
    6: "Round 6",
    7: "Quarterfinals",
    8: "Semifinals",
    9: "Finals"
};
