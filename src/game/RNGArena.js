/**
 * RNG Arena - Main Game Controller
 * Orchestrates the entire tournament experience
 */

import { TournamentBracket } from './Tournament.js'
import { CombatSystem } from './CombatSystem.js'
import { ChatSystem } from '../components/ChatSystem.js'
import { BracketRenderer } from '../components/BracketRenderer.js'
import { LootSystem } from '../components/LootSystem.js'

export class RNGArena {
    constructor() {
        this.tournament = new TournamentBracket()
        this.combat = new CombatSystem()
        this.chat = new ChatSystem()
        this.bracketRenderer = new BracketRenderer()
        this.loot = new LootSystem()

        this.tournamentStarted = false
        this.autoContinue = true
        this.currentBackground = 'castle'
        this.backgroundIndex = 0

        // DOM Elements
        this.elements = {}
    }

    /**
     * Initialize the game
     */
    init() {
        this.initDOMElements()
        this.initEventListeners()
        this.initSystems()
        this.initBackground()

        console.log('🏰 RNG Arena initialized successfully')
    }

    /**
     * Cache DOM elements for performance
     */
    initDOMElements() {
        const selectors = {
            startButton: '#start-battle',
            battleStatus: '#battle-status',
            leftFighter: '.fighter-left',
            rightFighter: '.fighter-right',
            leftFighterName: '#left-fighter-name',
            rightFighterName: '#right-fighter-name',
            leftFighterTitles: '#left-fighter-titles',
            rightFighterTitles: '#right-fighter-titles',
            arenaViewport: '.arena-viewport',
            progressSegments: '#progress-segments',
            crownOdds: '.crown-odds',
            chatInput: '#chat-input',
            sendChatBtn: '#send-chat',
            chatMessages: '#chat-messages',
            bracketDisplay: '#bracket-display',
            bracketContent: '#bracket-content',
            bracketToggle: '#bracket-toggle',
            lootBox: '#loot-box'
        }

        for (const [key, selector] of Object.entries(selectors)) {
            this.elements[key] = document.querySelector(selector)
            if (!this.elements[key]) {
                console.warn(`Element not found: ${selector}`)
            }
        }
    }

    /**
     * Set up event listeners
     */
    initEventListeners() {
        // Battle button
        console.log('Start button element:', this.elements.startButton)
        if (this.elements.startButton) {
            console.log('Adding click listener to start button')
            this.elements.startButton.addEventListener('click', () => {
                console.log('Start button clicked!')
                this.startBattle()
            })
        } else {
            console.log('Start button not found!')
        }

        // Chat system
        if (this.elements.sendChatBtn) {
            this.elements.sendChatBtn.addEventListener('click', () => this.chat.sendMessage())
        }

        if (this.elements.chatInput) {
            this.elements.chatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.chat.sendMessage()
            })
        }

        // Bracket toggle
        if (this.elements.bracketToggle) {
            this.elements.bracketToggle.addEventListener('click', () => this.bracketRenderer.toggleBracket())
        }

        // Remove spacebar toggle - tournaments are always live
    }

    /**
     * Initialize subsystems
     */
    initSystems() {
        // Initialize tournament
        this.tournament.generateBracket()

        // Initialize chat
        this.chat.init(this.elements.chatInput, this.elements.chatMessages)

        // Initialize bracket renderer
        this.bracketRenderer.init(this.elements.bracketDisplay, this.tournament)

        // Initialize loot system
        this.loot.init(this.elements.lootBox)

        // Initialize combat system
        this.combat.init(this)

        // Initial render
        this.updateDisplay()
        this.updateProgressBar()
        this.updateOdds()
        this.bracketRenderer.render()
    }

    /**
     * Initialize background rotation
     */
    initBackground() {
        const backgrounds = ['japan', 'cherry_blossom', 'ancient_ruin', 'castle', 'forest']

        // Preload background images
        backgrounds.forEach(bg => {
            const img = new Image()
            img.src = `/images/backgrounds/${bg}_background.png`
        })

        // Set initial background
        this.setBackground('japan')
    }

    /**
     * Start a battle
     */
    async startBattle() {
        console.log('startBattle() called!')

        console.log('Tournament hasMatchToFight:', this.tournament.hasMatchToFight())
        if (!this.tournament.hasMatchToFight()) {
            console.log('No more matches to fight')
            return
        }

        console.log('Tournament started status:', this.tournamentStarted)
        if (!this.tournamentStarted) {
            this.tournamentStarted = true
            console.log('Adding system messages to chat')
            this.chat.addSystemMessage('🎺 LIVE TOURNAMENT BEGINS! 🎺')
            this.chat.addSystemMessage('⚡ Non-stop action until we crown a champion! ⚡')

            // Start crowd simulation
            console.log('Starting crowd simulation')
            this.startCrowdSimulation()
        }

        console.log('Hiding start button')
        this.elements.startButton.style.display = 'none'

        try {
            // Update display for current match
            console.log('Updating display')
            this.updateDisplay()

            // Run combat
            console.log('Starting combat execution')
            const result = await this.combat.executeBattle()
            console.log('Combat result:', result)

            // Process battle result
            this.processBattleResult(result)

            // Continue or enable restart
            this.handleBattleCompletion()

        } catch (error) {
            console.error('Battle execution failed:', error)
            this.chat.addSystemMessage('⚠️ Battle encountered an error')
            this.enableRestart()
        }
    }

    /**
     * Process the result of a battle
     */
    processBattleResult(result) {
        if (!result) return

        // Update tournament state
        this.tournament.battleResult(result.leftWins)

        // Update displays
        this.updateDisplay()
        this.updateProgressBar()
        this.updateOdds()
        this.bracketRenderer.render()
        this.loot.updateLootBox(this.tournament.getRoundInfo())

        // Add chat messages
        this.chat.addBattleResult(result)
    }

    /**
     * Handle post-battle flow
     */
    handleBattleCompletion() {
        if (this.tournament.isComplete()) {
            this.handleTournamentComplete()
        } else {
            // Always auto-continue for live tournament events
            setTimeout(() => this.startBattle(), 2000)
        }
    }

    /**
     * Handle tournament completion
     */
    handleTournamentComplete() {
        const winner = this.tournament.getWinner()

        this.chat.addSystemMessage('👑 TOURNAMENT COMPLETE! 👑')
        this.chat.addSystemMessage(`🏆 ${winner.toUpperCase()} IS THE CHAMPION! 🏆`)

        // Show victory animation
        this.showVictoryAnimation(winner)
    }

    /**
     * Enable the restart button
     */
    enableRestart() {
        this.elements.startButton.disabled = false
        this.elements.startButton.textContent = this.tournament.isComplete()
            ? `${this.tournament.getWinner().toUpperCase()} WINS THE CROWN!`
            : 'CONTINUE TOURNAMENT'
    }

    /**
     * Update fighter displays
     */
    updateDisplay() {
        const match = this.tournament.getCurrentMatch()
        if (!match) return

        const displayOrder = this.tournament.getDisplayOrder()
        if (!displayOrder) return

        // Update names and titles
        this.elements.leftFighterName.textContent = displayOrder.leftFighter
        this.elements.rightFighterName.textContent = displayOrder.rightFighter

        const leftTitles = this.tournament.getCharacterTitles(displayOrder.leftFighter)
        const rightTitles = this.tournament.getCharacterTitles(displayOrder.rightFighter)

        this.elements.leftFighterTitles.textContent = leftTitles.join(' • ')
        this.elements.rightFighterTitles.textContent = rightTitles.join(' • ')

        // Update fighter cards
        this.updateFighterCards()

        // Update sprites
        this.updateFighterSprites(displayOrder)
    }

    /**
     * Update fighter card styling
     */
    updateFighterCards() {
        const leftCard = document.querySelector('.left-fighter-card')
        const rightCard = document.querySelector('.right-fighter-card')

        // Reset classes
        leftCard.classList.remove('following', 'winner')
        rightCard.classList.remove('following', 'winner')

        // Add following class
        const followingChar = this.tournament.followingCharacter
        if (this.elements.leftFighterName.textContent === followingChar) {
            leftCard.classList.add('following')
        }
        if (this.elements.rightFighterName.textContent === followingChar) {
            rightCard.classList.add('following')
        }

        // Add winner class for past winners
        if (this.tournament.isWinner(this.elements.leftFighterName.textContent)) {
            leftCard.classList.add('winner')
        }
        if (this.tournament.isWinner(this.elements.rightFighterName.textContent)) {
            rightCard.classList.add('winner')
        }
    }

    /**
     * Update fighter sprites with correct images and orientations
     */
    updateFighterSprites(displayOrder) {
        const leftSprite = this.elements.leftFighter.querySelector('.fighter-sprite')
        const rightSprite = this.elements.rightFighter.querySelector('.fighter-sprite')

        // Set character images
        this.setCharacterSprite(leftSprite, displayOrder.leftFighter, 'left')
        this.setCharacterSprite(rightSprite, displayOrder.rightFighter, 'right')
    }

    /**
     * Set character sprite with proper image and orientation
     */
    setCharacterSprite(spriteElement, characterName, side) {
        if (!spriteElement) return

        // Determine image based on character
        const imageName = this.getCharacterImageName(characterName)
        const imagePath = `/images/Characters/${imageName}`

        // Determine if flipping is needed
        const isLeftFighter = side === 'left'
        const isRightFighter = side === 'right'

        const needsFlip = (isLeftFighter && (
            imageName === 'knight_05.png' ||
            imageName === 'Knight_01.png' ||
            imageName === 'Knight_03.png'
        )) || (isRightFighter && (
            imageName === 'knight_04.png'
        ))

        // Set image with proper styling
        const flipStyle = needsFlip ? 'transform: scaleX(-1);' : ''
        spriteElement.innerHTML = `<img src="${imagePath}" alt="${characterName}" class="character-image" style="${flipStyle}">`
    }

    /**
     * Get the image filename for a character
     */
    getCharacterImageName(characterName) {
        // Special character image mappings
        const imageMap = {
            'Daring Hero': 'Daring_hero.png'
        }

        if (imageMap[characterName]) {
            return imageMap[characterName]
        }

        // Default knight image rotation
        const knightImages = ['Knight_01.png', 'Knight_02.png', 'Knight_03.png', 'knight_04.png', 'knight_05.png']
        const hash = this.hashString(characterName)
        return knightImages[hash % knightImages.length]
    }

    /**
     * Simple string hash function
     */
    hashString(str) {
        let hash = 0
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i)
            hash = ((hash << 5) - hash) + char
            hash = hash & hash // Convert to 32bit integer
        }
        return Math.abs(hash)
    }

    /**
     * Update progress bar
     */
    updateProgressBar() {
        if (!this.elements.progressSegments) return

        const roundInfo = this.tournament.getRoundInfo()
        const segments = this.elements.progressSegments.children

        // Define tier colors
        const tierColors = ['tier-gray', 'tier-white', 'tier-green', 'tier-blue', 'tier-purple', 'tier-orange', 'tier-gold']

        for (let i = 0; i < segments.length; i++) {
            const segment = segments[i]
            const tierIndex = Math.min(i, tierColors.length - 1)

            // Reset classes
            segment.className = 'progress-segment'

            if (i < roundInfo.current - 1) {
                // Completed rounds
                segment.classList.add(tierColors[tierIndex], 'completed')
            } else if (i === roundInfo.current - 1) {
                // Current round
                segment.classList.add(tierColors[tierIndex], 'current')
            } else {
                // Future rounds
                segment.classList.add('tier-gray')
            }
        }
    }

    /**
     * Update odds display
     */
    updateOdds() {
        if (!this.elements.crownOdds) return

        const roundInfo = this.tournament.getRoundInfo()
        const remainingParticipants = roundInfo.participantsLeft
        const oddsText = `1 in ${remainingParticipants.toLocaleString()}`

        this.elements.crownOdds.textContent = oddsText
    }

    /**
     * Set background image
     */
    setBackground(backgroundName) {
        if (this.elements.arenaViewport) {
            this.elements.arenaViewport.style.backgroundImage = `url('/images/backgrounds/${backgroundName}_background.png')`
            this.elements.arenaViewport.style.backgroundSize = 'cover'
            this.elements.arenaViewport.style.backgroundPosition = 'center'
            this.elements.arenaViewport.style.backgroundRepeat = 'no-repeat'
        }
    }

    /**
     * Start crowd simulation for live tournament atmosphere
     */
    startCrowdSimulation() {
        const addRandomCrowdMessage = () => {
            if (!this.tournamentStarted || this.tournament.isComplete()) return

            this.chat.addRandomCrowdMessage()

            // Schedule next message (random interval between 0.8-2 seconds) - much faster!
            const nextDelay = 800 + Math.random() * 1200
            setTimeout(addRandomCrowdMessage, nextDelay)
        }

        // Start the simulation after 2 seconds
        setTimeout(addRandomCrowdMessage, 2000)
    }

    /**
     * Show victory animation for tournament winner
     */
    showVictoryAnimation(winner) {
        // This will be implemented by the CombatSystem
        this.combat.showVictoryAnimation(winner)
    }
}