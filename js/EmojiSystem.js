import { EMOJI_CONFIG } from './constants.js';

/**
 * EmojiSystem - Handles floating emoji reactions
 */
export class EmojiSystem {
    constructor(arenaViewport) {
        this.arenaViewport = arenaViewport;
        this.emojiSpawnRate = EMOJI_CONFIG.BASE_SPAWN_RATE;
        this.emojiSpawnInterval = null;
        this.emojiPool = EMOJI_CONFIG.EMOJI_POOL;
    }

    /**
     * Initialize emoji button click handlers
     */
    initEmojiButtons() {
        const emojiButtons = document.querySelectorAll('.emoji-btn');
        emojiButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const emoji = btn.dataset.emoji || btn.textContent.trim();
                this.spawnEmoji(emoji);
            });
        });
    }

    /**
     * Start automatic emoji spawning based on tournament round
     */
    startEmojiReactions(currentRound) {
        // Update spawn rate based on round
        this.updateEmojiSpawnRate(currentRound);

        // Clear any existing interval
        if (this.emojiSpawnInterval) {
            clearInterval(this.emojiSpawnInterval);
        }

        // Start spawning emojis
        this.emojiSpawnInterval = setInterval(() => {
            this.spawnRandomEmoji();
        }, this.emojiSpawnRate);
    }

    /**
     * Stop automatic emoji spawning
     */
    stopEmojiReactions() {
        if (this.emojiSpawnInterval) {
            clearInterval(this.emojiSpawnInterval);
            this.emojiSpawnInterval = null;
        }
    }

    /**
     * Update spawn rate based on tournament round
     * Early rounds: slower spawning
     * Later rounds: faster spawning for more hype
     */
    updateEmojiSpawnRate(currentRound) {
        // Use predefined rates from config
        this.emojiSpawnRate = EMOJI_CONFIG.SPAWN_RATE_BY_ROUND[currentRound] || EMOJI_CONFIG.BASE_SPAWN_RATE;
    }

    /**
     * Spawn a random emoji from the pool
     */
    spawnRandomEmoji() {
        const emoji = this.emojiPool[Math.floor(Math.random() * this.emojiPool.length)];
        const side = Math.random() < 0.5 ? 'left' : 'right';
        this.spawnEmoji(emoji, side);
    }

    /**
     * Spawn a specific emoji on a specific side
     */
    spawnEmoji(emoji, side = null) {
        if (!this.arenaViewport) return;

        // Default to random side if not specified
        if (!side) {
            side = Math.random() < 0.5 ? 'left' : 'right';
        }

        const emojiEl = document.createElement('div');
        emojiEl.className = 'floating-emoji';
        emojiEl.textContent = emoji;

        // Random positioning with padding
        const padding = 20; // px from edge
        const staggerX = Math.random() * 60; // 0-60px horizontal stagger
        const staggerY = Math.random() * 40; // 0-40px vertical stagger

        if (side === 'left') {
            emojiEl.style.left = `${padding + staggerX}px`;
        } else {
            emojiEl.style.right = `${padding + staggerX}px`;
        }

        emojiEl.style.bottom = `${-20 + staggerY}px`; // Start slightly below screen

        // Random animation duration (5-8 seconds)
        const duration = 5 + Math.random() * 3;
        emojiEl.style.animationDuration = `${duration}s`;

        // Add to viewport
        this.arenaViewport.appendChild(emojiEl);

        // Remove after animation completes
        setTimeout(() => {
            if (emojiEl.parentNode) {
                emojiEl.remove();
            }
        }, duration * 1000);
    }

    /**
     * Set custom emoji pool
     */
    setEmojiPool(emojis) {
        if (Array.isArray(emojis) && emojis.length > 0) {
            this.emojiPool = emojis;
        }
    }

    /**
     * Set maximum spawn rate for finals/special moments
     */
    setMaxSpawnRate() {
        this.emojiSpawnRate = 100; // 10 per second
        if (this.emojiSpawnInterval) {
            clearInterval(this.emojiSpawnInterval);
            this.emojiSpawnInterval = setInterval(() => {
                this.spawnRandomEmoji();
            }, this.emojiSpawnRate);
        }
    }

    /**
     * Clear all floating emojis from screen
     */
    clearAllEmojis() {
        if (!this.arenaViewport) return;

        const emojis = this.arenaViewport.querySelectorAll('.floating-emoji');
        emojis.forEach(emoji => emoji.remove());
    }
}
