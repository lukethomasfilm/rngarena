import { BRACKET_CONFIG } from './constants.js';

/**
 * BracketSystem - Handles tournament bracket rendering and display
 */
export class BracketSystem {
    constructor(bracketDisplay, tournament) {
        this.bracketDisplay = bracketDisplay;
        this.tournament = tournament;
        this.currentZoom = BRACKET_CONFIG.DEFAULT_ZOOM;
    }

    /**
     * Render the tournament bracket
     */
    renderBracket() {
        if (!this.bracketDisplay || !this.tournament) {
            return;
        }

        const currentMatch = this.tournament.getCurrentMatch();
        if (!currentMatch) return;

        const roundInfo = this.tournament.getRoundInfo();
        if (!roundInfo) return;

        // Clear existing bracket
        this.bracketDisplay.innerHTML = '';

        // Build bracket structure
        const rounds = this.tournament.getAllRounds();
        if (!rounds || rounds.length === 0) return;

        // Render each round
        rounds.forEach((round, roundIndex) => {
            const roundEl = this.createRoundElement(round, roundIndex, roundInfo, currentMatch);
            this.bracketDisplay.appendChild(roundEl);
        });
    }

    /**
     * Create a round element
     */
    createRoundElement(round, roundIndex, roundInfo, currentMatch) {
        const roundEl = document.createElement('div');
        roundEl.className = 'bracket-round';
        roundEl.dataset.round = roundIndex + 1;

        // Round header
        const headerEl = document.createElement('div');
        headerEl.className = 'bracket-round-header';
        headerEl.textContent = round.name;
        roundEl.appendChild(headerEl);

        // Matches container
        const matchesEl = document.createElement('div');
        matchesEl.className = 'bracket-matches';

        round.matches.forEach((match, matchIndex) => {
            const matchEl = this.createMatchElement(match, roundIndex, matchIndex, currentMatch);
            matchesEl.appendChild(matchEl);
        });

        roundEl.appendChild(matchesEl);
        return roundEl;
    }

    /**
     * Create a match element
     */
    createMatchElement(match, roundIndex, matchIndex, currentMatch) {
        const matchEl = document.createElement('div');
        matchEl.className = 'bracket-match';

        // Check if this is the current match
        if (currentMatch &&
            match.participant1 === currentMatch.participant1 &&
            match.participant2 === currentMatch.participant2) {
            matchEl.classList.add('current-match');
        }

        // Check if match is completed
        if (match.winner) {
            matchEl.classList.add('completed-match');
        }

        // Participant 1
        const p1El = document.createElement('div');
        p1El.className = 'bracket-participant';
        if (match.winner === match.participant1) {
            p1El.classList.add('winner');
        }

        // Check if Daring Hero
        if (match.participant1 === 'Daring Hero') {
            p1El.classList.add('hero');
        }

        p1El.textContent = match.participant1 || 'TBD';
        matchEl.appendChild(p1El);

        // VS divider
        const vsEl = document.createElement('div');
        vsEl.className = 'bracket-vs';
        vsEl.textContent = 'VS';
        matchEl.appendChild(vsEl);

        // Participant 2
        const p2El = document.createElement('div');
        p2El.className = 'bracket-participant';
        if (match.winner === match.participant2) {
            p2El.classList.add('winner');
        }

        // Check if Daring Hero
        if (match.participant2 === 'Daring Hero') {
            p2El.classList.add('hero');
        }

        p2El.textContent = match.participant2 || 'TBD';
        matchEl.appendChild(p2El);

        return matchEl;
    }

    /**
     * Scroll to current match in bracket
     */
    scrollToCurrentMatch() {
        if (!this.bracketDisplay) return;

        const currentMatchEl = this.bracketDisplay.querySelector('.current-match');
        if (!currentMatchEl) return;

        // Find the round this match is in
        const roundEl = currentMatchEl.closest('.bracket-round');
        if (!roundEl) return;

        // Get viewport
        const viewport = this.bracketDisplay.parentElement;
        if (!viewport) return;

        // Calculate scroll position
        const roundIndex = parseInt(roundEl.dataset.round) - 1;
        const roundWidth = roundEl.offsetWidth;
        const viewportWidth = viewport.clientWidth;

        // Center the round in viewport
        const scrollLeft = (roundIndex * roundWidth) - (viewportWidth / 2) + (roundWidth / 2);

        // Smooth scroll
        viewport.scrollTo({
            left: Math.max(0, scrollLeft),
            behavior: 'smooth'
        });
    }

    /**
     * Highlight a specific participant in the bracket
     */
    highlightParticipant(participantName) {
        if (!this.bracketDisplay) return;

        // Remove existing highlights
        this.bracketDisplay.querySelectorAll('.highlighted').forEach(el => {
            el.classList.remove('highlighted');
        });

        // Add highlight to all instances of this participant
        this.bracketDisplay.querySelectorAll('.bracket-participant').forEach(el => {
            if (el.textContent === participantName) {
                el.classList.add('highlighted');
            }
        });
    }

    /**
     * Get bracket statistics
     */
    getBracketStats() {
        if (!this.tournament) return null;

        const roundInfo = this.tournament.getRoundInfo();
        return {
            currentRound: roundInfo.current,
            totalRounds: roundInfo.total,
            roundName: roundInfo.name,
            participantsLeft: roundInfo.participantsLeft,
            matchesCompleted: this.tournament.completedMatches,
            totalMatches: this.tournament.totalMatches
        };
    }

    /**
     * Update zoom level
     */
    setZoom(zoomLevel) {
        this.currentZoom = Math.max(BRACKET_CONFIG.MIN_ZOOM, Math.min(BRACKET_CONFIG.MAX_ZOOM, zoomLevel));

        if (this.bracketDisplay) {
            this.bracketDisplay.style.zoom = this.currentZoom;
        }

        return this.currentZoom;
    }

    /**
     * Get current zoom level (as percentage for display)
     */
    getDisplayZoom() {
        // Convert actual zoom to display zoom (100% display = 160% actual)
        return Math.round((this.currentZoom / BRACKET_CONFIG.MIN_ZOOM) * 100);
    }

    /**
     * Clear bracket display
     */
    clearBracket() {
        if (this.bracketDisplay) {
            this.bracketDisplay.innerHTML = '';
        }
    }

    /**
     * Export bracket as data (for sharing/saving)
     */
    exportBracketData() {
        if (!this.tournament) return null;

        return {
            rounds: this.tournament.getAllRounds(),
            currentMatch: this.tournament.getCurrentMatch(),
            roundInfo: this.tournament.getRoundInfo(),
            timestamp: Date.now()
        };
    }
}
