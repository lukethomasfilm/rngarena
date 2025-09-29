/**
 * Bracket Renderer Component
 * Handles tournament bracket visualization and interactions
 */

export class BracketRenderer {
    constructor() {
        this.bracketDisplay = null
        this.tournament = null
        this.isCollapsed = false  // Start expanded for testing
        this.zoomLevel = 100
    }

    /**
     * Initialize the bracket renderer
     */
    init(bracketDisplay, tournament) {
        console.log('BracketRenderer init called')
        console.log('bracketDisplay element:', bracketDisplay)
        console.log('tournament object:', tournament)

        this.bracketDisplay = bracketDisplay
        this.tournament = tournament

        if (!this.bracketDisplay || !this.tournament) {
            console.warn('Bracket renderer: Required elements not found')
            return
        }

        console.log('Setting up bracket event listeners')
        this.setupEventListeners()
        console.log('Initializing collapsed state')
        this.initializeCollapsedState()  // Set initial collapsed state
        console.log('Rendering bracket')
        this.render()
    }

    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Bracket toggle
        const bracketToggle = document.getElementById('bracket-toggle')
        if (bracketToggle) {
            bracketToggle.addEventListener('click', () => this.toggleBracket())
        }

        // Zoom controls
        const zoomIn = document.getElementById('zoom-in')
        const zoomOut = document.getElementById('zoom-out')

        if (zoomIn) {
            zoomIn.addEventListener('click', () => this.zoomIn())
        }

        if (zoomOut) {
            zoomOut.addEventListener('click', () => this.zoomOut())
        }

        // Bracket slider
        const bracketSlider = document.getElementById('bracket-slider')
        if (bracketSlider) {
            bracketSlider.addEventListener('input', (e) => this.handleSlider(e))
        }
    }

    /**
     * Render the tournament bracket
     */
    render() {
        if (!this.bracketDisplay || !this.tournament) return

        const roundInfo = this.tournament.getRoundInfo()
        const currentMatch = this.tournament.getCurrentMatch()

        const htmlParts = []

        // Render each round (including the final round)
        for (let roundIndex = 0; roundIndex < this.tournament.bracket.length; roundIndex++) {
            const round = this.tournament.bracket[roundIndex]
            const roundNumber = roundIndex + 1
            const roundName = this.getRoundName(roundNumber)

            htmlParts.push(`<div class="bracket-round">`)
            htmlParts.push(`<div class="bracket-round-title">${roundName}</div>`)

            // Render matches in this round
            for (let i = 0; i < round.length; i += 2) {
                const participant1 = round[i]
                const participant2 = round[i + 1]
                const matchIndex = Math.floor(i / 2)

                // Check if this match has been completed
                const nextRound = this.tournament.bracket[roundIndex + 1]
                const isFinalRound = roundIndex === this.tournament.bracket.length - 1
                const isCompleted = isFinalRound ? this.tournament.isComplete() : (nextRound && nextRound[matchIndex])
                const isCurrent = currentMatch &&
                    roundIndex + 1 === roundInfo.current &&
                    ((participant1 === currentMatch.participant1 && participant2 === currentMatch.participant2) ||
                     (participant1 === currentMatch.participant2 && participant2 === currentMatch.participant1))

                const isOnFollowingPath = this.isMatchOnFollowingPath(participant1, participant2, roundIndex + 1)
                const winner = isFinalRound ? this.tournament.getWinner() : (nextRound ? nextRound[matchIndex] : null)
                const showConnector = !isFinalRound

                htmlParts.push(this.renderMatch(participant1, participant2, isCompleted, isCurrent, winner, isOnFollowingPath, showConnector))
            }

            htmlParts.push(`</div>`)
        }

        // Add champion display if tournament is complete (after the final round)
        if (this.tournament.isComplete()) {
            const winner = this.tournament.getWinner()
            htmlParts.push(`<div class="bracket-round">`)
            htmlParts.push(`<div class="bracket-round-title">CHAMPION</div>`)
            htmlParts.push(`<div class="bracket-winner-display">🏆 ${winner} 🏆</div>`)
            htmlParts.push(`</div>`)
        }

        this.bracketDisplay.innerHTML = htmlParts.join('')

        // Don't auto-scroll - let players stay focused on battleground
    }

    /**
     * Render a single match
     */
    renderMatch(participant1, participant2, isCompleted, isCurrent, winner, isOnFollowingPath, showConnector) {
        // Handle empty slots
        if (!participant1 && !participant2) {
            return `<div class="bracket-match empty"><div class="bracket-bye">Empty</div></div>`
        }

        // Handle bye (only one participant)
        if (!participant1 || !participant2) {
            const advancer = participant1 || participant2
            return `
                <div class="bracket-match bye">
                    <div class="bracket-participant bye-winner ${advancer === this.tournament.followingCharacter ? 'following' : ''}">${advancer}</div>
                    <div class="bracket-bye">BYE</div>
                </div>`
        }

        // Regular match with two participants
        let matchClass = 'bracket-match'
        if (isCompleted) matchClass += ' completed'
        if (isCurrent) matchClass += ' current'
        if (isOnFollowingPath) matchClass += ' following-path'

        let html = `<div class="${matchClass}">`

        // Participant 1
        let p1Class = 'bracket-participant'
        if (isCompleted && winner === participant1) p1Class += ' winner'
        else if (isCompleted && winner !== participant1) p1Class += ' eliminated'
        if (participant1 === this.tournament.followingCharacter) p1Class += ' following'

        html += `<div class="${p1Class}">${participant1}</div>`
        html += `<div class="vs-separator">VS</div>`

        // Participant 2
        let p2Class = 'bracket-participant'
        if (isCompleted && winner === participant2) p2Class += ' winner'
        else if (isCompleted && winner !== participant2) p2Class += ' eliminated'
        if (participant2 === this.tournament.followingCharacter) p2Class += ' following'

        html += `<div class="${p2Class}">${participant2}</div>`

        // Add connector line if not final round
        if (showConnector) {
            html += `<div class="bracket-connector${isOnFollowingPath ? ' active' : ''}"></div>`
        }

        html += `</div>`
        return html
    }

    /**
     * Check if a match is on the following character's path
     */
    isMatchOnFollowingPath(participant1, participant2, roundNumber) {
        if (!this.tournament.followingCharacter) return false

        // Check if the followed character is in this match
        if (participant1 === this.tournament.followingCharacter ||
            participant2 === this.tournament.followingCharacter) {
            return true
        }

        // Check if this match leads to the followed character
        const currentChar = this.tournament.followingCharacter

        // Look ahead in subsequent rounds to see if this match affects the path
        for (let r = roundNumber; r < this.tournament.bracket.length - 1; r++) {
            const nextRound = this.tournament.bracket[r]
            for (let matchIndex = 0; matchIndex < nextRound.length; matchIndex++) {
                const winner = nextRound[matchIndex]

                if (winner === currentChar && (participant1 || participant2)) {
                    // This match could affect the path to the followed character
                    const currentRoundData = this.tournament.bracket[r - 1]
                    if (currentRoundData) {
                        const p1 = currentRoundData[matchIndex * 2]
                        const p2 = currentRoundData[matchIndex * 2 + 1]
                        if (p1 === participant1 || p1 === participant2 || p2 === participant1 || p2 === participant2) {
                            return true
                        }
                    }
                }
            }
        }

        return false
    }

    /**
     * Get round name for display
     */
    getRoundName(roundNumber) {
        const roundNames = ['Round 1', 'Round 2', 'Round 3', 'Round 4', 'Round 5', 'Round 6', 'Quarterfinals', 'Semifinals', 'Final']
        return roundNames[roundNumber - 1] || `Round ${roundNumber}`
    }

    /**
     * Toggle bracket visibility
     */
    toggleBracket() {
        this.isCollapsed = !this.isCollapsed

        const bracketContent = document.getElementById('bracket-content')
        const bracketToggle = document.getElementById('bracket-toggle')
        const bracketContainer = document.querySelector('.bracket-container')

        if (bracketContent) {
            if (this.isCollapsed) {
                bracketContent.classList.add('collapsed')
            } else {
                bracketContent.classList.remove('collapsed')
            }
        }

        if (bracketToggle) {
            if (this.isCollapsed) {
                bracketToggle.classList.add('collapsed')
            } else {
                bracketToggle.classList.remove('collapsed')
            }
        }

        if (bracketContainer) {
            if (this.isCollapsed) {
                bracketContainer.classList.add('collapsed')
            } else {
                bracketContainer.classList.remove('collapsed')
            }
        }
    }

    /**
     * Initialize the bracket in collapsed state
     */
    initializeCollapsedState() {
        const bracketContent = document.getElementById('bracket-content')
        const bracketToggle = document.getElementById('bracket-toggle')
        const bracketContainer = document.querySelector('.bracket-container')

        if (this.isCollapsed) {
            if (bracketContent) {
                bracketContent.classList.add('collapsed')
            }

            if (bracketToggle) {
                bracketToggle.classList.add('collapsed')
            }

            if (bracketContainer) {
                bracketContainer.classList.add('collapsed')
            }
        } else {
            console.log('Bracket set to expanded by default')
            if (bracketContent) {
                bracketContent.classList.remove('collapsed')
            }

            if (bracketToggle) {
                bracketToggle.classList.remove('collapsed')
            }

            if (bracketContainer) {
                bracketContainer.classList.remove('collapsed')
            }
        }
    }

    /**
     * Zoom in on bracket
     */
    zoomIn() {
        this.zoomLevel = Math.min(200, this.zoomLevel + 25)
        this.updateZoom()
    }

    /**
     * Zoom out on bracket
     */
    zoomOut() {
        this.zoomLevel = Math.max(50, this.zoomLevel - 25)
        this.updateZoom()
    }

    /**
     * Update zoom level
     */
    updateZoom() {
        if (this.bracketDisplay) {
            this.bracketDisplay.style.transform = `scale(${this.zoomLevel / 100})`
            this.bracketDisplay.style.transformOrigin = 'top left'
        }

        const zoomLevelDisplay = document.getElementById('zoom-level')
        if (zoomLevelDisplay) {
            zoomLevelDisplay.textContent = `${this.zoomLevel}%`
        }
    }

    /**
     * Handle bracket slider
     */
    handleSlider(event) {
        const value = parseInt(event.target.value)
        const viewport = document.querySelector('.bracket-viewport')

        if (viewport && this.bracketDisplay) {
            const maxScroll = this.bracketDisplay.scrollWidth - viewport.clientWidth
            const scrollPosition = (value / 100) * maxScroll
            viewport.scrollLeft = scrollPosition
        }
    }

    /**
     * Scroll to current match
     */
    scrollToCurrentMatch() {
        if (this.isCollapsed) return

        const currentMatchElement = this.bracketDisplay?.querySelector('.bracket-match.current')
        if (currentMatchElement) {
            currentMatchElement.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
                inline: 'center'
            })
        }
    }
}