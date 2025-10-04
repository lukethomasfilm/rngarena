import { CHAT_MESSAGES, UI_CONFIG } from './constants.js';

/**
 * ChatSystem - Handles all chat and messaging functionality
 */
export class ChatSystem {
    constructor(chatMessagesElement) {
        this.chatMessages = chatMessagesElement;
        this.usernameCache = []; // Cache generated usernames for reuse
        this.announcerQueue = [];
        this.isProcessingAnnouncer = false;
    }

    /**
     * Add a regular chat message with username
     */
    addChatMessage(message) {
        if (!message || !message.trim()) {
            return;
        }

        const chatEl = this.chatMessages || document.getElementById('chat-messages');
        if (!chatEl) {
            return;
        }

        const messageElement = document.createElement('div');
        messageElement.className = 'chat-message';

        const username = this.generateRandomUsername();
        messageElement.innerHTML = `
            <span class="chat-username">${username}: ${message}</span>
        `;

        chatEl.appendChild(messageElement);
        this.scrollToBottom(chatEl);
        this.limitMessages(chatEl);

        // Also add to chat mode view
        this.addToChatMode(message, username, 'user');
    }

    /**
     * Add an announcer message (gold text, no username)
     */
    addAnnouncerMessage(message) {
        if (!message || !message.trim()) {
            return;
        }

        // Add to queue
        this.announcerQueue.push(message);

        // Start processing if not already processing
        if (!this.isProcessingAnnouncer) {
            this.processAnnouncerQueue();
        }
    }

    /**
     * Process announcer message queue with delays
     */
    async processAnnouncerQueue() {
        this.isProcessingAnnouncer = true;

        while (this.announcerQueue.length > 0) {
            let message = this.announcerQueue.shift();

            const chatEl = this.chatMessages || document.getElementById('chat-messages');
            if (chatEl) {
                // Add single space before all announcer messages
                message = ' ' + message;

                const messageElement = document.createElement('div');
                messageElement.className = 'chat-message announcer-message';
                messageElement.innerHTML = `<span style="color: gold; font-weight: bold; font-size: 0.65rem;">${message}</span>`;
                messageElement.style.cssText = 'margin-bottom: 3px; padding: 2px 0; display: block !important; opacity: 1 !important;';

                chatEl.appendChild(messageElement);

                requestAnimationFrame(() => {
                    chatEl.scrollTop = chatEl.scrollHeight;
                });

                this.limitMessages(chatEl);

                // Also add to chat mode view
                this.addToChatMode(message, null, 'announcer');
            }

            // Wait 250ms before next message
            await new Promise(resolve => setTimeout(resolve, 250));
        }

        this.isProcessingAnnouncer = false;
    }

    /**
     * Add a combat message with color coding
     */
    addCombatMessage(message) {
        if (!this.chatMessages || !message) return;

        const messageElement = document.createElement('div');
        messageElement.className = 'chat-message combat-message';

        // Color code combat actions
        let coloredMessage = message;
        if (message.includes('blocks')) {
            coloredMessage = message.replace(/blocks/g, '<span style="color: #4CAF50; font-weight: bold;">blocks</span>');
        }
        if (message.includes('damage')) {
            coloredMessage = coloredMessage.replace(/damage/g, '<span style="color: #ff4444; font-weight: bold;">damage</span>');
            coloredMessage = coloredMessage.replace(/(\d+)(?=\s+damage)/g, '<span style="color: #ff6666; font-weight: bold;">$1</span>');
        }
        if (message.includes('CRIT')) {
            coloredMessage = coloredMessage.replace(/CRIT/g, '<span style="color: #FFD700; font-weight: bold; text-shadow: 0 0 5px #FFD700;">💥 CRIT 💥</span>');
        }

        messageElement.innerHTML = `<span>${coloredMessage}</span>`;
        this.chatMessages.appendChild(messageElement);
        this.scrollToBottom(this.chatMessages);
        this.limitMessages(this.chatMessages);
    }

    /**
     * Generate a random chat username
     */
    generateRandomUsername() {
        const prefixes = ['RNG', 'Lucky', 'Fighter', 'Arena', 'Battle', 'Coin', 'Epic', 'Pro'];
        const suffixes = ['God', 'King', 'Master', 'Lord', '2023', 'Pro', 'X', 'Legend'];

        const prefix = this.getRandomFromArray(prefixes);
        const suffix = this.getRandomFromArray(suffixes);
        const number = Math.floor(Math.random() * 999);

        return `${prefix}${suffix}${number}`;
    }

    /**
     * Get a random hype message
     */
    getRandomHypeMessage() {
        return this.getRandomFromArray(CHAT_MESSAGES.HYPE);
    }

    /**
     * Get a random win message
     */
    getRandomWinMessage() {
        return this.getRandomFromArray(CHAT_MESSAGES.WIN);
    }

    /**
     * Get a random combat message
     */
    getRandomCombatMessage() {
        return this.getRandomFromArray(CHAT_MESSAGES.COMBAT);
    }

    /**
     * Get arena welcome message
     */
    getArenaWelcomeMessage(arenaName) {
        return CHAT_MESSAGES.ARENA_WELCOME[arenaName] || `Welcome to the ${arenaName} Arena!`;
    }

    /**
     * Scroll chat to bottom
     */
    scrollToBottom(chatEl) {
        if (chatEl) {
            chatEl.scrollTop = chatEl.scrollHeight;
        }
    }

    /**
     * Limit chat messages to prevent memory issues
     */
    limitMessages(chatEl) {
        if (!chatEl) return;

        const maxMessages = UI_CONFIG.MAX_CHAT_MESSAGES;
        while (chatEl.children.length > maxMessages) {
            chatEl.removeChild(chatEl.firstChild);
        }
    }

    /**
     * Utility: Get random element from array
     */
    getRandomFromArray(array) {
        return array[Math.floor(Math.random() * array.length)];
    }

    /**
     * Clear all chat messages
     */
    clearChat() {
        if (this.chatMessages) {
            this.chatMessages.innerHTML = '';
        }
    }

    /**
     * Add system message (no username, gray text)
     */
    addSystemMessage(message) {
        if (!message || !message.trim()) return;

        const chatEl = this.chatMessages || document.getElementById('chat-messages');
        if (!chatEl) return;

        const messageElement = document.createElement('div');
        messageElement.className = 'chat-message system';
        messageElement.textContent = message;

        chatEl.appendChild(messageElement);
        this.scrollToBottom(chatEl);
        this.limitMessages(chatEl);
    }

    /**
     * Add message to chat mode view
     */
    addToChatMode(message, username, type) {
        // Try both overlay and dev frame
        const chatModeMessages = document.getElementById('chat-mode-messages-overlay') || document.getElementById('chat-mode-messages');
        if (!chatModeMessages) return;

        const messageElement = document.createElement('div');
        messageElement.className = `chat-mode-message ${type}`;

        if (type === 'announcer') {
            messageElement.textContent = message;
        } else if (type === 'user') {
            messageElement.textContent = `${username}: ${message}`;
        } else {
            messageElement.textContent = message;
        }

        chatModeMessages.appendChild(messageElement);

        // Auto-scroll to bottom
        requestAnimationFrame(() => {
            chatModeMessages.scrollTop = chatModeMessages.scrollHeight;
        });

        // Limit messages
        while (chatModeMessages.children.length > 100) {
            chatModeMessages.removeChild(chatModeMessages.firstChild);
        }
    }
}
