/**
 * Chat System Component
 * Handles live chat functionality and tournament commentary
 */

export class ChatSystem {
    constructor() {
        this.chatInput = null
        this.chatMessages = null
        this.maxMessages = 100
        this.systemMessages = [
            'TOURNAMENT BRACKET BATTLE!',
            'WHO\'S GONNA WIN?!',
            'rip',
            'GO HERO!',
            'UPSET INCOMING',
            '50/50 BABY',
            'EPIC MEDIEVAL BATTLE',
            'OMG OMG OMG',
            'POGGERS',
            'EZ CLAP',
            'NO WAY',
            'LUCKY',
            'RNG GOD',
            'SCRIPTED',
            'RIGGED',
            'CASTLE VIBES',
            'FOREST FIGHT',
            'DESERT DUEL',
            'MOUNTAIN MAYHEM',
            'BRACKET MADNESS',
            'KEKW',
            'LMAOOO',
            'THIS IS NUTS',
            'RNG IS CRAZY',
            'SWORD GO BRRRR',
            'SHEESH',
            'BASED',
            'CRACKED',
            'BUILT DIFFERENT',
            'NO CAP',
            'FR FR',
            'STONKS',
            'DIAMOND HANDS',
            'TO THE MOON',
            'MONKE BRAIN',
            'BANANA',
            'SMOOTH BRAIN',
            'BIG BRAIN',
            'GALAXY BRAIN',
            'SADGE',
            'COPIUM',
            'HOPIUM',
            'MALDING',
            'PEPEGA',
            'PEPE LAUGH',
            'OMEGALUL',
            '5HEAD',
            'ACTUALLY INSANE',
            'UNREAL',
            'ABSOLUTELY MENTAL',
            'BONKERS',
            'WILD',
            'SICK PLAY',
            'NUTTY',
            'CRINGE',
            'BASED AND REDPILLED',
            'TOUCH GRASS',
            'RATIO',
            'L + RATIO',
            'SKILL ISSUE',
            'GET GOOD',
            'NOOB',
            'PRO GAMER MOVE',
            'GAMER MOMENT',
            'EPIC GAMER',
            'LITERALLY SHAKING',
            'I CAN\'T EVEN',
            'BRUH MOMENT',
            'YEET',
            'PERIODT',
            'SUS',
            'AMONGUS',
            'IMPOSTOR',
            'VENTING',
            'EMERGENCY MEETING',
            'RED SUS',
            'MINECRAFT STEVE',
            'FORTNITE BATTLE PASS',
            'CHUNGUS',
            'WHOLESOME 100',
            'REDDIT MOMENT',
            'SIMP',
            'CHAD',
            'VIRGIN VS CHAD',
            'BASED CHAD',
            'SIGMA MALE',
            'ALPHA MOVE',
            'BETA BEHAVIOR',
            'MAIN CHARACTER ENERGY',
            'NPC BEHAVIOR',
            'CERTIFIED HOOD CLASSIC',
            'HITS DIFFERENT',
            'NO PRINTER',
            'FACTS',
            'SPITTING FACTS',
            'PERIODT NO PRINTER',
            'AND I OOP',
            'SKSKSK',
            'VSCO GIRL',
            'OK BOOMER',
            'ZOOMER ENERGY',
            'MILLENNIAL HUMOR',
            'GEN Z CHAOS',
            'IT\'S GIVING...',
            'SLAY QUEEN',
            'PERIODT BESTIE',
            'NOT THE...',
            'THE WAY I...',
            'I\'M DECEASED',
            'STOP I\'M CRYING',
            'HELP-',
            'BYE-',
            'AKSJDHAKSJD',
            'KEYBOARD SMASH',
            'NO THOUGHTS HEAD EMPTY',
            'BRAIN.EXE STOPPED',
            '404 ERROR',
            'WINDOWS XP SHUTDOWN',
            'DIAL UP INTERNET',
            'LOADING...',
            'BUFFERING',
            'LAG',
            'PING DIFF',
            'SKILLED PLAYER',
            'UNSKILLED PLAYER'
        ]
    }

    /**
     * Initialize the chat system
     */
    init(chatInput, chatMessages) {
        this.chatInput = chatInput
        this.chatMessages = chatMessages

        if (!this.chatInput || !this.chatMessages) {
            console.warn('Chat system: Required elements not found')
            return
        }

        this.setupEventListeners()
        this.addSystemMessage('💬 Chat system initialized')
    }

    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Send button click
        const sendBtn = document.getElementById('send-chat')
        if (sendBtn) {
            sendBtn.addEventListener('click', () => this.sendMessage())
        }

        // Enter key press
        if (this.chatInput) {
            this.chatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.sendMessage()
                }
            })
        }
    }

    /**
     * Send a user message
     */
    sendMessage() {
        if (!this.chatInput) return

        const message = this.chatInput.value.trim()
        if (!message) return

        this.addUserMessage('You', message)
        this.chatInput.value = ''

        // Simulate crowd response - faster
        setTimeout(() => {
            this.addRandomCrowdMessage()
        }, 200 + Math.random() * 800)
    }

    /**
     * Add a user message to chat
     */
    addUserMessage(username, text) {
        this.addMessage({
            type: 'user',
            username,
            text,
            timestamp: new Date()
        })
    }

    /**
     * Add a system message to chat
     */
    addSystemMessage(text) {
        this.addMessage({
            type: 'system',
            text,
            timestamp: new Date()
        })
    }

    /**
     * Add a battle result message
     */
    addBattleResult(result) {
        if (!result) return

        const critText = result.leftHP === 0 ? ' with a devastating blow!' : result.rightHP === 0 ? ' with a crushing defeat!' : ''
        this.addSystemMessage(`🏆 ${result.winner.toUpperCase()} WINS${critText}`)

        // Add crowd excitement
        setTimeout(() => {
            const excitement = [
                '🎉 INCREDIBLE VICTORY! 🎉',
                '⚔️ What a battle! ⚔️',
                '🔥 Amazing fighting! 🔥',
                '👑 Tournament magic! 👑'
            ]
            this.addSystemMessage(excitement[Math.floor(Math.random() * excitement.length)])
        }, 1000)
    }

    /**
     * Add a battle message during combat
     */
    addBattleMessage(text) {
        this.addMessage({
            type: 'battle',
            text,
            timestamp: new Date()
        })
    }

    /**
     * Add a random crowd message
     */
    addRandomCrowdMessage() {
        const crowdNames = [
            'RNGGod123', 'LuckyBeast', 'FighterXX', 'ArenaLord', 'BattleMaster69',
            'SwordKing99', 'EpicGamer', 'WarriorSpirit420', 'ChampionHunter',
            'BladeDancer', 'ShieldBearer', 'CrownSeeker', 'ProGamer360',
            'NoobSlayer', 'GamerMoment', 'EpicFailz', 'SigmaMale42',
            'ChadWarrior', 'BasedKnight', 'CringeKid', 'TouchGrass',
            'SkillIssue', 'GetGood', 'Copium99', 'Hopium420', 'Sadge123'
        ]

        const crowdMessages = this.systemMessages

        const username = crowdNames[Math.floor(Math.random() * crowdNames.length)]
        const message = crowdMessages[Math.floor(Math.random() * crowdMessages.length)]

        this.addMessage({
            type: 'crowd',
            username,
            text: message,
            timestamp: new Date()
        })
    }

    /**
     * Add a message to the chat
     */
    addMessage(messageData) {
        if (!this.chatMessages) return

        // Create message element
        const messageEl = document.createElement('div')
        messageEl.className = `chat-message ${messageData.type}-message`

        // Format message content
        if (messageData.type === 'system') {
            messageEl.textContent = messageData.text
            messageEl.className = 'chat-message system'
        } else if (messageData.type === 'user') {
            messageEl.innerHTML = `<span class="chat-username user-username">${this.escapeHtml(messageData.username)}: ${this.escapeHtml(messageData.text)}</span>`
            messageEl.className = 'chat-message user-message'
        } else {
            // crowd or battle messages - single line format
            if (messageData.type === 'battle') {
                // Add color coding for combat messages
                let coloredText = this.escapeHtml(messageData.text)
                coloredText = coloredText.replace(/blocks/g, '<span style="color: #4CAF50; font-weight: bold;">blocks</span>')
                coloredText = coloredText.replace(/damage/g, '<span style="color: #ff4444; font-weight: bold;">damage</span>')
                coloredText = coloredText.replace(/(\d+)(?=\s+damage)/g, '<span style="color: #ff6666; font-weight: bold;">$1</span>')
                coloredText = coloredText.replace(/CRIT/g, '<span style="color: #ff0000; font-weight: bold; text-shadow: 0 0 5px #ff0000;">CRIT</span>')
                coloredText = coloredText.replace(/critical/g, '<span style="color: #ff0000; font-weight: bold;">critical</span>')
                coloredText = coloredText.replace(/parries/g, '<span style="color: #FF9800; font-weight: bold;">parries</span>')
                coloredText = coloredText.replace(/misses/g, '<span style="color: #9E9E9E; font-weight: bold;">misses</span>')

                messageEl.innerHTML = `<span class="chat-username">Combat: ${coloredText}</span>`
            } else {
                messageEl.innerHTML = `<span class="chat-username">${this.escapeHtml(messageData.username || 'System')}: ${this.escapeHtml(messageData.text)}</span>`
            }
        }

        // Add to chat
        this.chatMessages.appendChild(messageEl)

        // Limit message count
        this.limitMessages()

        // Scroll to bottom
        this.scrollToBottom()
    }

    /**
     * Limit the number of messages in chat
     */
    limitMessages() {
        if (!this.chatMessages) return

        const messages = this.chatMessages.querySelectorAll('.chat-message')
        if (messages.length > this.maxMessages) {
            const excess = messages.length - this.maxMessages
            for (let i = 0; i < excess; i++) {
                messages[i].remove()
            }
        }
    }

    /**
     * Scroll chat to bottom
     */
    scrollToBottom() {
        if (!this.chatMessages) return

        this.chatMessages.scrollTop = this.chatMessages.scrollHeight
    }

    /**
     * Escape HTML to prevent XSS
     */
    escapeHtml(text) {
        const div = document.createElement('div')
        div.textContent = text
        return div.innerHTML
    }

    /**
     * Clear all messages
     */
    clearMessages() {
        if (this.chatMessages) {
            this.chatMessages.innerHTML = ''
        }
    }

    /**
     * Add tournament start message
     */
    addTournamentStart() {
        this.addSystemMessage('🎺 TOURNAMENT BEGINS! 🎺')
        this.addSystemMessage('🏰 Welcome to RNG Arena! 🏰')

        setTimeout(() => {
            this.addSystemMessage('⚔️ May the best warrior win! ⚔️')
        }, 1000)
    }

    /**
     * Add tournament end message
     */
    addTournamentEnd(winner) {
        this.addSystemMessage('🏆 TOURNAMENT COMPLETE! 🏆')
        this.addSystemMessage(`👑 ${winner.toUpperCase()} IS THE CHAMPION! 👑`)
        this.addSystemMessage('🎉 What an incredible tournament! 🎉')
    }
}