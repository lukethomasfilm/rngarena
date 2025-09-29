/**
 * RNG Arena - Main Application Entry Point
 * Epic medieval tournament battles with turn-based combat and RNG mechanics
 */

import './styles/main.css'
import { TournamentBracket } from './game/Tournament.js'
import { RNGArena } from './game/RNGArena.js'

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('🏰 RNG Arena - Initializing...')

    try {
        // Initialize the main game instance
        const arena = new RNGArena()
        arena.init()

        console.log('⚔️ RNG Arena - Ready for battle!')

        // Make arena globally available for debugging
        if (import.meta.env.DEV) {
            window.arena = arena
        }
    } catch (error) {
        console.error('❌ Failed to initialize RNG Arena:', error)
    }
})