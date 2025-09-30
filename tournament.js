class TournamentBracket {
    constructor() {
        console.log('TournamentBracket constructor called!');
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
            'Daring Hero', 'Sir Clumsy', 'Lord Butterfinger', 'Duke Tripsalot', 'Baron Whoopsie',
            'Count Mishap', 'Sir Fumbles', 'Lord Oopsington', 'Duke Derp', 'Sir Noodles',
            'Baron Giggles', 'Count Wiggles', 'Lord Snuggles', 'Sir Pickles', 'Duke Waffles',
            'Baron Pancakes', 'Count Muffins', 'Sir Tickles', 'Lord Chuckles', 'Duke Sparkles',
            'Baron Dimples', 'Count Silly', 'Sir Wobbly', 'Lord Jiggly', 'Duke Squiggly',
            'Captain Chaos', 'Sir Stumbles', 'Lord Blunders', 'Duke Mishief', 'Baron Bumbles',
            'Count Giggleton', 'Sir Wigglebum', 'Lord Snickerdood', 'Duke Ticklebottom',
            'Baron Chucklehead', 'Count Dingleberg', 'Sir Noodlewhite', 'Lord Bumblestorm',
            'Duke Gigglesnort', 'Baron Wobbleshire', 'Count Ticklebeard', 'Sir Snugglesworth',
            'Lord Pickleface', 'Duke Wafflebottom', 'Baron Pancakehead', 'Count Muffinshire',
            'Sir Tickletoes', 'Lord Chuckleberry', 'Duke Sparklebum', 'Baron Dimpleshire',
            'Count Sillyhat', 'Sir Wobblesnort', 'Lord Jigglybottom', 'Duke Squigglebeard',
            'Captain Clumsy', 'Sir Stumblebum', 'Lord Blunderworth', 'Duke Mischief',
            'Baron Bumblebee', 'Count Giggles', 'Sir Wiggletail', 'Lord Snickerdorf',
            'Duke Ticklebeast', 'Baron Chucklenuts', 'Count Dingleworth', 'Sir Noodleface',
            'Lord Bumblesnort', 'Duke Gigglebeard', 'Baron Wobblehead', 'Count Tickleshire',
            'Sir Snugglesnort', 'Lord Picklebottom', 'Duke Waffleface', 'Baron Pancake',
            'Count Muffinhead', 'Sir Ticklebottom', 'Lord Chuckleface', 'Duke Sparkletail',
            'Baron Dimplesnort', 'Count Sillybeard', 'Sir Wobbleface', 'Lord Jigglesnort',
            'Duke Squigglehead', 'Captain Clumsy', 'Sir Stumbleface', 'Lord Blundersnort',
            'Duke Mischiefbeard', 'Baron Bumblehead', 'Count Gigglesnort', 'Sir Wigglebum',
            'Lord Snickerbum', 'Duke Tickleface', 'Baron Chuckletail', 'Count Dinglesnort',
            'Sir Noodletail', 'Lord Bumblehead', 'Duke Giggleface', 'Baron Wobblesnort',
            'Count Tickletail', 'Sir Snugglehead', 'Lord Pickletail', 'Duke Wafflesnort',
            'Baron Pancakehead', 'Count Muffintail', 'Sir Ticklehead', 'Lord Chuckletail'
        ];

        this.heroTitles = {
            'Daring Hero': ['The Brave', 'Destined for Glory'],
            'Sir Clumsy': ['The Clumsy', 'Trip Master'],
            'Lord Butterfinger': ['The Slippery', 'Drop Master'],
            'Duke Tripsalot': ['The Unsteady', 'Fall Master'],
            'Baron Whoopsie': ['The Oopsie', 'Error Lord'],
            'Count Mishap': ['The Unlucky', 'Error Count'],
            'Sir Fumbles': ['The Klutzy', 'Butter Hands'],
            'Lord Oopsington': ['The Blunderer', 'Error Lord'],
            'Duke Derp': ['The Confused', 'Question Mark'],
            'Sir Noodles': ['The Floppy', 'Pasta Knight'],
            'Baron Giggles': ['The Cheerful', 'Laughter Lord'],
            'Count Wiggles': ['The Squirmy', 'Dance Master'],
            'Lord Snuggles': ['The Cuddly', 'Hug Champion'],
            'Sir Pickles': ['The Sour', 'Brine Knight'],
            'Duke Waffles': ['The Crispy', 'Syrup Seeker'],
            'Baron Pancakes': ['The Fluffy', 'Stack Master'],
            'Count Muffins': ['The Crumbly', 'Bakery Baron'],
            'Sir Tickles': ['The Tickler', 'Feather Knight'],
            'Lord Chuckles': ['The Amused', 'Joke Keeper'],
            'Duke Sparkles': ['The Shiny', 'Glitter Guardian'],
            'Baron Dimples': ['The Cute', 'Cheek Champion'],
            'Count Silly': ['The Goofy', 'Nonsense Noble'],
            'Sir Wobbly': ['The Unsteady', 'Jello Knight'],
            'Lord Jiggly': ['The Bouncy', 'Wobble Warrior'],
            'Duke Squiggly': ['The Wiggly', 'Noodle Noble'],
            'Captain Chaos': ['The Disorderly', 'Mayhem Master'],
            'Sir Stumbles': ['The Tumbler', 'Ground Kisser'],
            'Lord Blunders': ['The Mistake Maker', 'Error Earl'],
            'Duke Mishief': ['The Prankster', 'Trouble Duke'],
            'Baron Bumbles': ['The Bee-like', 'Buzz Baron'],
            'Count Giggleton': ['The Laugher', 'Giggle Count'],
            'Sir Wigglebum': ['The Dancer', 'Booty Bouncer'],
            'Lord Snickerdood': ['The Cookie', 'Sweet Warrior'],
            'Duke Ticklebottom': ['The Funny Rear', 'Giggle Glutes'],
            'Baron Chucklehead': ['The Funny One', 'Grin Lord'],
            'Count Dingleberg': ['The Clingy', 'Odd Count'],
            'Sir Noodlewhite': ['The Pasta Knight', 'Noodle Lord'],
            'Lord Bumblestorm': ['The Hurricane', 'Chaos Lord'],
            'Duke Gigglesnort': ['The Snorter', 'Giggle Duke'],
            'Baron Wobbleshire': ['The Shaky One', 'Wobble Baron'],
            'Count Ticklebeard': ['The Fuzzy', 'Whisker Count'],
            'Sir Snugglesworth': ['The Cuddly Knight', 'Hug Hero'],
            'Lord Pickleface': ['The Sour Visage', 'Briny Baron'],
            'Duke Wafflebottom': ['The Crispy Rear', 'Syrup Sitter'],
            'Baron Pancakehead': ['The Flat Top', 'Stack Skull'],
            'Count Muffinshire': ['The Baked County', 'Crumb Count'],
            'Sir Tickletoes': ['The Giggly Feet', 'Toe Tickler'],
            'Lord Chuckleberry': ['The Fruity', 'Berry Lord'],
            'Duke Sparklebum': ['The Shiny', 'Glitter Duke'],
            'Baron Dimpleshire': ['The Cute', 'Dimple Baron'],
            'Count Sillyhat': ['The Goofy', 'Hat Count'],
            'Sir Wobblesnort': ['The Shaky', 'Wobble Knight'],
            'Lord Jigglybottom': ['The Bouncy', 'Jiggle Lord'],
            'Duke Squigglebeard': ['The Wavy Whiskers', 'Curly Chin'],
            'Captain Clumsy': ['The Awkward Visage', 'Trip Captain'],
            'Sir Stumblebum': ['The Faller', 'Trip Knight'],
            'Lord Blunderworth': ['The Noble Mistake', 'Error Earl'],
            'Duke Mischief': ['The Troublemaker', 'Prank Duke'],
            'Baron Bumblebee': ['The Buzzing', 'Honey Hunter'],
            'Count Giggles': ['The Laugher', 'Giggle Count'],
            'Sir Wiggletail': ['The Dancing Rear', 'Tail Wagger'],
            'Lord Snickerdorf': ['The Cookie', 'Sweet Lord'],
            'Duke Ticklebeast': ['The Beast', 'Tickle Duke'],
            'Baron Chucklenuts': ['The Nutty', 'Laugh Baron'],
            'Count Dingleworth': ['The Clingy', 'Odd Earl'],
            'Sir Noodleface': ['The Noodly', 'Pasta Knight'],
            'Lord Bumblesnort': ['The Bumbler', 'Clumsy Lord'],
            'Duke Gigglebeard': ['The Laugher', 'Giggle Duke'],
            'Baron Wobblehead': ['The Shaky', 'Wobble Baron'],
            'Count Tickleshire': ['The Giggly', 'Tickle Count'],
            'Sir Snugglesnort': ['The Cuddly Snorter', 'Hug Nose'],
            'Lord Picklebottom': ['The Sour Rear', 'Briny Bottom'],
            'Duke Waffleface': ['The Crispy', 'Waffle Duke'],
            'Baron Pancake': ['The Fluffy', 'Pancake Baron'],
            'Count Muffinhead': ['The Baked', 'Muffin Count'],
            'Sir Ticklebottom': ['The Giggly Rear', 'Funny Bottom'],
            'Lord Chuckleface': ['The Laugher', 'Chuckle Lord'],
            'Duke Sparkletail': ['The Shiny', 'Sparkle Duke'],
            'Baron Dimplesnort': ['The Cute', 'Dimple Baron'],
            'Count Sillybeard': ['The Goofy', 'Silly Count'],
            'Sir Wobbleface': ['The Shaky', 'Wobble Knight'],
            'Lord Jigglesnort': ['The Bouncy', 'Jiggle Lord'],
            'Duke Squigglehead': ['The Wavy Brain', 'Curly Cranium'],
            'Captain Clumsy': ['The Awkward Rear', 'Trip Tail'],
            'Sir Stumbleface': ['The Faller', 'Trip Knight'],
            'Lord Blundersnort': ['The Blunderer', 'Error Lord'],
            'Duke Mischiefbeard': ['The Prankster', 'Trouble Duke'],
            'Baron Bumblehead': ['The Buzzing Brain', 'Bee Skull'],
            'Count Gigglesnort': ['The Laugher', 'Giggle Count'],
            'Sir Wigglebum': ['The Dancer', 'Booty Bouncer'],
            'Lord Snickerbum': ['The Cookie Rear', 'Sweet Bottom'],
            'Duke Tickleface': ['The Giggly', 'Tickle Duke'],
            'Baron Chuckletail': ['The Laughing Rear', 'Funny Tail'],
            'Count Dinglesnort': ['The Clingy', 'Odd Count'],
            'Sir Noodletail': ['The Noodly', 'Pasta Knight'],
            'Lord Bumblehead': ['The Bumbler', 'Clumsy Lord'],
            'Duke Giggleface': ['The Laugher', 'Giggle Duke'],
            'Baron Wobblesnort': ['The Shaky', 'Wobble Baron'],
            'Count Tickletail': ['The Giggly Rear', 'Feather Tail'],
            'Sir Snugglehead': ['The Cuddly Brain', 'Hug Head'],
            'Lord Pickletail': ['The Sour Rear', 'Briny Tail'],
            'Duke Wafflesnort': ['The Crispy', 'Waffle Duke'],
            'Baron Pancakehead': ['The Flat Brain', 'Stack Skull'],
            'Count Muffintail': ['The Baked Rear', 'Crumbly Tail'],
            'Sir Ticklehead': ['The Giggly', 'Tickle Knight'],
            'Lord Chuckletail': ['The Laughing Rear', 'Funny Tail']
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
        const roundNames = ['Round 1', 'Round 2', 'Round 3', 'Round 4', 'Round 5', 'Round 6', 'Quarterfinals', 'Semifinals', 'Final'];

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
}/* Optimized tournament bracket system */
