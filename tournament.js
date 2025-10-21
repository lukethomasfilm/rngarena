class TournamentBracket {
    constructor() {
        // 128 is the next power of 2 that accommodates 100 participants
        this.totalParticipants = 100;
        this.bracketSize = 128;
        this.participants = [];
        this.bracket = [];
        this.currentRound = 1;
        this.currentMatch = 0;
        this.followingCharacter = 'Daring Hero';
        this.heroAlive = true;
        this.characterVisualSides = {}; // Track which side each character spawned on (permanent)
        this.winners = new Set(); // Track all winners (they get gold nameplate)

        this.heroNames = [
            // Female Fighters (Athena & Nesta skins) - Gaming themed
            'Daring Hero', 'Lady Lagspike', 'Dame Critfail', 'Duchess Respawn', 'Lady Questgiver',
            'Dame Loothoarder', 'Lady Ragequit', 'Duchess Oneshot', 'Lady Minmaxer', 'Dame Speedrun',
            'Lady Checkpoint', 'Duchess Autoaim', 'Dame Buttonmash', 'Lady Quicksave', 'Duchess Tiltlord',
            'Lady Wallhack', 'Dame Noscope', 'Lady Spawncamp', 'Duchess Griefborn', 'Dame Glitchlord',
            'Lady Permadeath', 'Duchess Farmbot', 'Dame Multibox', 'Lady Tryhard', 'Duchess Clutch',
            'Dame Sweatlord',
            // Green Knights - Noob themed
            'Sir Lagalot', 'Lord Derpsalot', 'Baron AFK-King', 'Duke Noobstick', 'Sir Ragequit',
            'Count Feedlord', 'Baron Scrublord', 'Lord Disconnect', 'Sir Respawn', 'Duke Potato',
            'Baron Campfire', 'Count Keyboard', 'Sir Failstack', 'Lord Flatline', 'Duke Onetrick',
            // Barb Fighters - Brute themed
            'Sir Bonkmaster', 'Lord Smashface', 'Duke Unga-Bunga', 'Baron Headbutt', 'Sir Meatshield',
            'Count Bigaxe', 'Lord Chunkyboi', 'Duke Groundpound', 'Baron Necksnap', 'Sir Facetank',
            'Count Skullcrush', 'Lord Spinebreak', 'Duke Ribcracker', 'Baron Hammertime', 'Sir Cleave',
            // Black Knights - Edgy themed
            'Lord Edgelord', 'Duke Backstab', 'Baron Shadowblade', 'Sir Darksoul', 'Count Nightfall',
            'Lord Voidborn', 'Duke Grimdark', 'Baron Bloodmoon', 'Sir Obsidian', 'Count Doomstrike',
            'Lord Ravensbane', 'Duke Netherblade',
            // Red Knights - Fire themed
            'Baron Fireborn', 'Count Blazewing', 'Sir Pyromancer', 'Lord Emberstorm', 'Duke Scorchblade',
            'Baron Ashmaker', 'Sir Flameheart', 'Count Infernox', 'Lord Burnstrike', 'Duke Moltencore',
            'Baron Cinderfist', 'Sir Wildfire',
            // Brown Knights - Earth themed
            'Baron Mudslide', 'Count Rockfall', 'Sir Earthshaker', 'Lord Boulder', 'Duke Stonefist',
            'Baron Ironore', 'Sir Gravelord', 'Count Dustborn',
            // Blue Knights - Ice themed
            'Baron Frostbite', 'Count Iceshard', 'Sir Snowdrift', 'Lord Winterborn', 'Duke Glacius',
            'Baron Coldsnap', 'Sir Permafrost', 'Count Blizzard', 'Lord Chillfang', 'Duke Frostpeak',
            'Baron Hailstorm', 'Sir Icebreaker'
        ];

        this.heroTitles = {
            // Female Fighters - Gaming themed
            'Daring Hero': ['The Brave', 'Destined for Glory'],
            'Lady Lagspike': ['The Laggy', 'Ping Warrior'],
            'Dame Critfail': ['The Unlucky', 'RNG Victim'],
            'Duchess Respawn': ['The Immortal', 'Death Defier'],
            'Lady Questgiver': ['The NPC', 'Exclamation Mark'],
            'Dame Loothoarder': ['The Greedy', 'Bag Full'],
            'Lady Ragequit': ['The Salty', 'Alt-F4 Queen'],
            'Duchess Oneshot': ['Glass Cannon', 'Dead in 1 Hit'],
            'Lady Minmaxer': ['The Optimizer', 'Spreadsheet Lover'],
            'Dame Speedrun': ['The Rushed', 'Skip Cutscene'],
            'Lady Checkpoint': ['Save Spammer', 'F5 Masher'],
            'Duchess Autoaim': ['Can\'t Miss', 'Totally Legit'],
            'Dame Buttonmash': ['Random Inputs', 'Broken Keyboard'],
            'Lady Quicksave': ['The Paranoid', 'Save Every 5 Sec'],
            'Duchess Tiltlord': ['Full Tilt', 'Caps Lock Warrior'],
            'Lady Wallhack': ['The Fishy', 'Knows Too Much'],
            'Dame Noscope': ['Blind Shot', 'Pure RNG'],
            'Lady Spawncamp': ['The Camper', 'No Honor'],
            'Duchess Griefborn': ['Team Killer', 'Friendly Fire'],
            'Dame Glitchlord': ['Bug Abuser', 'Out of Bounds'],
            'Lady Permadeath': ['Iron Mode', 'No Second Chance'],
            'Duchess Farmbot': ['The Grinder', '24/7 Online'],
            'Dame Multibox': ['Army of One', 'Is This Legal'],
            'Lady Tryhard': ['The Sweaty', 'No Fun Allowed'],
            'Duchess Clutch': ['1v5 Master', 'Last One Standing'],
            'Dame Sweatlord': ['Ultra Tryhard', 'Touch Grass'],
            // Green Knights - Noob themed
            'Sir Lagalot': ['The Delayed', 'Ping Knight'],
            'Lord Derpsalot': ['The Confused', 'Derp King'],
            'Baron AFK-King': ['The Idle', 'Away Warrior'],
            'Duke Noobstick': ['The Beginner', 'Starter Duke'],
            'Sir Ragequit': ['The Salty', 'Rage Knight'],
            'Count Feedlord': ['The Feeder', 'Death Count'],
            'Baron Scrublord': ['The Noob', 'Low Tier'],
            'Lord Disconnect': ['The Laggy', 'DC King'],
            'Sir Respawn': ['The Frequent', 'Death Loop'],
            'Duke Potato': ['The Slow', 'Frame Dropper'],
            'Baron Campfire': ['The Camper', 'Fire Sitter'],
            'Count Keyboard': ['The Broken', 'Key Smasher'],
            'Sir Failstack': ['The Builder', 'Fail Knight'],
            'Lord Flatline': ['The Dead', 'Zero HP'],
            'Duke Onetrick': ['The Specialist', 'Main Only'],
            // Barb Fighters - Brute themed
            'Sir Bonkmaster': ['Bonk Expert', 'Big Stick Energy'],
            'Lord Smashface': ['Face First', 'No Brain Cells'],
            'Duke Unga-Bunga': ['Caveman Mode', 'Return to Monke'],
            'Baron Headbutt': ['The Ramming', 'Concussion Giver'],
            'Sir Meatshield': ['The Tanky', 'Ate All Hits'],
            'Count Bigaxe': ['Overcompensating', 'Axe Too Heavy'],
            'Lord Chunkyboi': ['Absolute Unit', 'In Awe'],
            'Duke Groundpound': ['Earthquake Maker', 'Jump Attack Spam'],
            'Baron Necksnap': ['The Chiropractor', 'Free Adjustment'],
            'Sir Facetank': ['The Unkillable', 'Just Stand There'],
            'Count Skullcrush': ['Headache Giver', 'Skull Collector'],
            'Lord Spinebreak': ['Back Problems', 'Bad Posture'],
            'Duke Ribcracker': ['Lung Puncturer', 'Broken Bones'],
            'Baron Hammertime': ['Can\'t Touch This', 'Axe Time Actually'],
            'Sir Cleave': ['AOE Specialist', 'Hit Everything'],
            // Black Knights - Edgy themed
            'Lord Edgelord': ['Too Edgy', 'Ow The Edge'],
            'Duke Backstab': ['The Rogue', 'Nothing Personal'],
            'Baron Shadowblade': ['In The Shadows', 'Very Mysterious'],
            'Sir Darksoul': ['Praise The Sun', 'Git Gud'],
            'Count Nightfall': ['Dark and Brooding', 'So Deep'],
            'Lord Voidborn': ['Stares Into Abyss', 'Abyss Stares Back'],
            'Duke Grimdark': ['Warhammer Enjoyer', 'Only War'],
            'Baron Bloodmoon': ['Red Phase', 'Ominous'],
            'Sir Obsidian': ['Sharp But Fragile', 'Volcano Glass'],
            'Count Doomstrike': ['The Doomer', 'It\'s Over'],
            'Lord Ravensbane': ['Nevermore', 'Bird Hater'],
            'Duke Netherblade': ['Portal Camper', 'Void Edge'],
            // Red Knights - Fire themed
            'Baron Fireborn': ['Mixtape Dropper', 'Born in Flames'],
            'Count Blazewing': ['Hot Wings', 'Spicy Flyer'],
            'Sir Pyromancer': ['Arson Enthusiast', 'Burn Everything'],
            'Lord Emberstorm': ['Forgot to Stop', 'Out of Control'],
            'Duke Scorchblade': ['Hot Blade', 'Crispy Critters'],
            'Baron Ashmaker': ['Burns It All', 'Only Ashes Left'],
            'Sir Flameheart': ['Heartburn', 'Too Spicy'],
            'Count Infernox': ['Maximum Heat', 'Flame On'],
            'Lord Burnstrike': ['The Roaster', 'Well Done'],
            'Duke Moltencore': ['Too Hot', 'Lava Lamp'],
            'Baron Cinderfist': ['Fist of Fire', 'Burnt Knuckles'],
            'Sir Wildfire': ['Spread Too Fast', 'Uncontrollable'],
            // Brown Knights - Earth themed
            'Baron Mudslide': ['Dirty Fighter', 'Slippery When Wet'],
            'Count Rockfall': ['Gravity Wins', 'Rock Bottom'],
            'Sir Earthshaker': ['Earthquake Mode', 'Ground Pound Pro'],
            'Lord Boulder': ['Dwayne Johnson', 'The Rock'],
            'Duke Stonefist': ['Rock Solid', 'Hits Like Brick'],
            'Baron Ironore': ['Minecraft Mode', 'Diamond Soon'],
            'Sir Gravelord': ['Small Rocks', 'Pocket Sand'],
            'Count Dustborn': ['Dusty', 'Needs A Bath'],
            // Blue Knights - Ice themed
            'Baron Frostbite': ['Frostbitten', 'Lost Some Toes'],
            'Count Iceshard': ['Sharp and Cold', 'Pointy Ice'],
            'Sir Snowdrift': ['Snow Day', 'School Cancelled'],
            'Lord Winterborn': ['Winter is Here', 'Always Cold'],
            'Duke Glacius': ['Moves Slowly', 'Ice Age'],
            'Baron Coldsnap': ['Cold Front', 'Brr'],
            'Sir Permafrost': ['Never Thaws', 'Frozen Forever'],
            'Count Blizzard': ['Whiteout', 'Can\'t See'],
            'Lord Chillfang': ['Ice to Meet You', 'Cool Customer'],
            'Duke Frostpeak': ['Mountain Top', 'High Altitude'],
            'Baron Hailstorm': ['Hail Yeah', 'Frozen Rain'],
            'Sir Icebreaker': ['Party Starter', 'Break The Ice']
        };

        this.initializeTournament();
    }

    getCharacterTitles(name) {
        // Truncate name to 18 characters max
        const truncatedName = name.length > 18 ? name.substring(0, 15) + '...' : name;

        let titles = this.heroTitles[name] || ['The Unknown', 'Mystery Fighter'];

        // Truncate titles to total of 30 characters max
        let totalTitleLength = titles.join(' • ').length;
        if (totalTitleLength > 30) {
            // Try to truncate individual titles proportionally
            let remainingLength = 30;
            let truncatedTitles = [];

            for (let i = 0; i < titles.length && remainingLength > 0; i++) {
                const separator = i > 0 ? ' • ' : '';
                const separatorLength = separator.length;
                const availableLength = remainingLength - separatorLength;

                if (availableLength > 3) { // Need at least 3 chars for "X.."
                    let truncatedTitle = titles[i];
                    if (truncatedTitle.length > availableLength) {
                        truncatedTitle = truncatedTitle.substring(0, availableLength - 2) + '..';
                    }
                    truncatedTitles.push(truncatedTitle);
                    remainingLength -= (truncatedTitle.length + separatorLength);
                } else {
                    break; // Not enough space for more titles
                }
            }

            titles = truncatedTitles;
        }

        return titles;
    }

    getCharacterName(name) {
        // Truncate name to 18 characters max
        return name.length > 18 ? name.substring(0, 15) + '...' : name;
    }

    isWinner(name) {
        return this.winners.has(name);
    }

    getDisplayOrder() {
        const match = this.getCurrentMatch();
        if (!match) return null;

        // BULLETPROOF SYSTEM: Characters keep their spawn side forever

        // Step 1: Assign spawn sides ONLY for brand new characters
        if (!(match.participant1 in this.characterVisualSides)) {
            // Check if the other participant already claimed a side
            if (match.participant2 in this.characterVisualSides) {
                // Give this character the opposite side
                const otherSide = this.characterVisualSides[match.participant2];
                this.characterVisualSides[match.participant1] = otherSide === 'left' ? 'right' : 'left';
            } else {
                // Both are new, assign based on bracket position
                this.characterVisualSides[match.participant1] = 'left';
            }
        }

        if (!(match.participant2 in this.characterVisualSides)) {
            // Check if the other participant already claimed a side
            if (match.participant1 in this.characterVisualSides) {
                // Give this character the opposite side
                const otherSide = this.characterVisualSides[match.participant1];
                this.characterVisualSides[match.participant2] = otherSide === 'left' ? 'right' : 'left';
            } else {
                // Both are new, assign based on bracket position
                this.characterVisualSides[match.participant2] = 'right';
            }
        }

        // Step 2: Get their permanent spawn sides (NEVER CHANGE)
        const p1Side = this.characterVisualSides[match.participant1];
        const p2Side = this.characterVisualSides[match.participant2];

        // Step 3: Place each character on their permanent spawn side
        let leftFighter, rightFighter;

        if (p1Side === 'left') {
            leftFighter = match.participant1;
            rightFighter = match.participant2;
        } else {
            leftFighter = match.participant2;
            rightFighter = match.participant1;
        }

        const result = {
            leftFighter: leftFighter,
            rightFighter: rightFighter,
            followedOnLeft: leftFighter === this.followingCharacter
        };

        return result;
    }

    initializeTournament() {
        // Create participants array with our hero first
        this.participants = [...this.heroNames.slice(0, this.totalParticipants)];

        // Reset following character to starting hero
        this.followingCharacter = 'Daring Hero';
        this.heroAlive = true;

        // Reset tracking systems
        this.characterVisualSides = {};
        this.winners = new Set();

        // Shuffle the participants (except hero who stays at index 0)
        const nonHeroParticipants = this.participants.slice(1);
        this.shuffleArray(nonHeroParticipants);
        this.participants = ['Daring Hero', ...nonHeroParticipants];

        this.generateBracket();
    }

    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    generateBracket() {
        // Create initial bracket with participants and byes
        this.bracket = [];
        const firstRound = [];

        // Fill first round with participants and null for byes
        for (let i = 0; i < this.bracketSize; i++) {
            if (i < this.participants.length) {
                firstRound.push(this.participants[i]);
            } else {
                firstRound.push(null); // bye
            }
        }

        // Shuffle the entire first round to randomize bye positions
        // BUT keep 'Daring Hero' at index 0
        const hero = firstRound[0]; // Save the hero
        const restOfRound = firstRound.slice(1); // Get everything else
        this.shuffleArray(restOfRound); // Shuffle the rest
        firstRound[0] = hero; // Put hero back at index 0
        for (let i = 1; i < firstRound.length; i++) {
            firstRound[i] = restOfRound[i - 1]; // Replace with shuffled values
        }

        this.bracket.push(firstRound);

        // Generate subsequent rounds
        let currentRoundSize = this.bracketSize / 2;
        while (currentRoundSize >= 1) {
            const round = new Array(currentRoundSize).fill(null);
            this.bracket.push(round);
            currentRoundSize /= 2;
        }

        this.processInitialByes();

        // TEMPORARY: Force second round bye for testing
        // Ensure hero wins round 1 and gets bye in round 2
        this.bracket[1][0] = 'Daring Hero'; // Hero advances to round 2
        this.bracket[1][1] = null; // Opponent position is null (bye)

        // Don't automatically advance currentRound - let handleByeRound() handle it
        // The bye will be detected by hasFollowedCharacterBye() when startBattle() is called
    }

    processInitialByes() {
        // Process automatic wins for participants who got byes
        const firstRound = this.bracket[0];
        const secondRound = this.bracket[1];

        for (let i = 0; i < firstRound.length; i += 2) {
            const participant1 = firstRound[i];
            const participant2 = firstRound[i + 1];
            const nextMatchIndex = Math.floor(i / 2);

            if (participant1 && !participant2) {
                // participant1 gets a bye
                secondRound[nextMatchIndex] = participant1;
            } else if (!participant1 && participant2) {
                // participant2 gets a bye
                secondRound[nextMatchIndex] = participant2;
            }
            // If both participants exist, they need to fight (handled in battle logic)
            // If both are null, the position stays null
        }
    }

    getCurrentMatch() {
        // Find the current match in the current round
        const currentRoundParticipants = this.bracket[this.currentRound - 1];

        // Look for the match containing our followed character
        for (let i = 0; i < currentRoundParticipants.length; i += 2) {
            const participant1 = currentRoundParticipants[i];
            const participant2 = currentRoundParticipants[i + 1];

            if ((participant1 === this.followingCharacter || participant2 === this.followingCharacter) &&
                participant1 && participant2) {
                return {
                    participant1,
                    participant2,
                    matchIndex: Math.floor(i / 2),
                    roundPosition: i
                };
            }
        }

        return null;
    }

    hasMatchToFight() {
        const match = this.getCurrentMatch();
        return match !== null;
    }

    hasFollowedCharacterBye() {
        // Check if the followed character has a bye (opponent is null)
        const currentRoundParticipants = this.bracket[this.currentRound - 1];

        for (let i = 0; i < currentRoundParticipants.length; i += 2) {
            const participant1 = currentRoundParticipants[i];
            const participant2 = currentRoundParticipants[i + 1];

            // Check if followed character is in this position with a bye
            if (participant1 === this.followingCharacter && !participant2) {
                return { character: participant1, position: 'left' };
            }
            if (participant2 === this.followingCharacter && !participant1) {
                return { character: participant2, position: 'right' };
            }
        }

        return null;
    }

    battleResult(leftWins) {
        const match = this.getCurrentMatch();
        if (!match) return null;

        const displayOrder = this.getDisplayOrder();
        const winner = leftWins ? displayOrder.leftFighter : displayOrder.rightFighter;
        const loser = leftWins ? displayOrder.rightFighter : displayOrder.leftFighter;
        const followingChanged = loser === this.followingCharacter;

        // Advance winner to next round
        if (this.currentRound < this.bracket.length) {
            this.bracket[this.currentRound][match.matchIndex] = winner;
        }

        // Mark the winner in our winners set (they get gold nameplate)
        this.winners.add(winner);

        // CRITICAL: NEVER EVER UPDATE VISUAL SIDES AFTER ASSIGNMENT
        // Winners must stay on their assigned side permanently

        // Update who we're following if they lose
        if (followingChanged) {
            if (this.followingCharacter === 'Daring Hero') {
                this.heroAlive = false;
            }
            // Switch to following the winner since our character was eliminated
            this.followingCharacter = winner;
        }

        return {
            winner,
            loser,
            followingChanged
        };
    }

    simulateRemainingMatches() {
        // Simulate all remaining matches in current round except the one we're following
        const currentRoundMatches = this.bracket[this.currentRound - 1];

        for (let i = 0; i < currentRoundMatches.length; i += 2) {
            const participant1 = currentRoundMatches[i];
            const participant2 = currentRoundMatches[i + 1];
            const nextMatchIndex = Math.floor(i / 2);

            // Skip if already resolved
            if (this.bracket[this.currentRound][nextMatchIndex]) {
                continue;
            }

            // Handle byes - auto-advance the participant
            if (participant1 && !participant2) {
                this.bracket[this.currentRound][nextMatchIndex] = participant1;
                continue;
            } else if (!participant1 && participant2) {
                this.bracket[this.currentRound][nextMatchIndex] = participant2;
                continue;
            } else if (!participant1 && !participant2) {
                // Both null, skip
                continue;
            }

            // Skip if this is the match we're currently watching
            if ((participant1 === this.followingCharacter || participant2 === this.followingCharacter)) {
                continue;
            }

            // Simulate this match with 50/50 odds
            const winner = Math.random() < 0.5 ? participant1 : participant2;
            this.bracket[this.currentRound][nextMatchIndex] = winner;
        }
    }

    advanceToNextMatch() {
        // Simulate remaining matches in current round
        this.simulateRemainingMatches();

        // Check if current round is complete
        const currentRoundMatches = this.bracket[this.currentRound - 1];
        let roundComplete = true;

        for (let i = 0; i < currentRoundMatches.length; i += 2) {
            const participant1 = currentRoundMatches[i];
            const participant2 = currentRoundMatches[i + 1];
            const nextMatchIndex = Math.floor(i / 2);

            if (participant1 && participant2 && !this.bracket[this.currentRound][nextMatchIndex]) {
                roundComplete = false;
                break;
            }
        }

        if (roundComplete && this.currentRound < this.bracket.length) {
            this.currentRound++;
        }
    }

    getRoundInfo() {
        const totalRounds = this.bracket.length; // Include the final round
        const roundNames = ['Round 1', 'Round 2', 'Round 3', 'Round 4', 'Quarterfinals', 'Semifinals', 'Final', 'Champion'];

        return {
            current: this.currentRound,
            total: totalRounds,
            name: roundNames[this.currentRound - 1] || `Round ${this.currentRound}`,
            participantsLeft: this.bracket[this.currentRound - 1].filter(p => p !== null).length
        };
    }

    isComplete() {
        return this.currentRound > this.bracket.length - 1 && this.bracket[this.bracket.length - 1][0];
    }

    getWinner() {
        if (this.isComplete()) {
            return this.bracket[this.bracket.length - 1][0];
        }
        return null;
    }
}

// Make TournamentBracket globally available
window.TournamentBracket = TournamentBracket;
