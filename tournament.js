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
            'Daring Hero', 'Sir Clumsy', 'Lord Butterfingers', 'Duke Tripsalot', 'Baron Whoopsie',
            'Count Mishap', 'Sir Fumbles', 'Lord Oopsington', 'Duke Derp', 'Sir Noodles',
            'Baron Giggles', 'Count Wiggles', 'Lord Snuggles', 'Sir Pickles', 'Duke Waffles',
            'Baron Pancakes', 'Count Muffins', 'Sir Tickles', 'Lord Chuckles', 'Duke Sparkles',
            'Baron Dimples', 'Count Silly', 'Sir Wobbly', 'Lord Jiggly', 'Duke Squiggly',
            'Captain Chaos', 'Sir Stumbles', 'Lord Blunders', 'Duke Mishief', 'Baron Bumbles',
            'Count Giggleton', 'Sir Wigglebottom', 'Lord Snickerdoodle', 'Duke Ticklebottom',
            'Baron Chucklehead', 'Count Dingleberry', 'Sir Noodlethwaite', 'Lord Bumblestorm',
            'Duke Gigglesnort', 'Baron Wobbleshire', 'Count Ticklebeard', 'Sir Snugglesworth',
            'Lord Pickleface', 'Duke Wafflebottom', 'Baron Pancakehead', 'Count Muffinshire',
            'Sir Tickletoes', 'Lord Chuckleberry', 'Duke Sparklebottom', 'Baron Dimpleshire',
            'Count Sillyhat', 'Sir Wobblesnort', 'Lord Jigglybottom', 'Duke Squigglebeard',
            'Captain Clumsyface', 'Sir Stumblebum', 'Lord Blunderworth', 'Duke Mischiefmaker',
            'Baron Bumblebee', 'Count Gigglesworth', 'Sir Wiggletail', 'Lord Snickerdorf',
            'Duke Ticklemonster', 'Baron Chucklenuts', 'Count Dingleworth', 'Sir Noodleface',
            'Lord Bumblesnort', 'Duke Gigglebeard', 'Baron Wobblehead', 'Count Tickleshire',
            'Sir Snugglesnort', 'Lord Picklebottom', 'Duke Waffleface', 'Baron Pancakeworth',
            'Count Muffinhead', 'Sir Ticklebottom', 'Lord Chuckleface', 'Duke Sparkletail',
            'Baron Dimplesnort', 'Count Sillybeard', 'Sir Wobbleface', 'Lord Jigglesnort',
            'Duke Squigglehead', 'Captain Clumsytail', 'Sir Stumbleface', 'Lord Blundersnort',
            'Duke Mischiefbeard', 'Baron Bumblehead', 'Count Gigglesnort', 'Sir Wigglebottom',
            'Lord Snickerbottom', 'Duke Tickleface', 'Baron Chuckletail', 'Count Dinglesnort',
            'Sir Noodletail', 'Lord Bumblehead', 'Duke Giggleface', 'Baron Wobblesnort',
            'Count Tickletail', 'Sir Snugglehead', 'Lord Pickletail', 'Duke Wafflesnort',
            'Baron Pancakehead', 'Count Muffintail', 'Sir Ticklehead', 'Lord Chuckletail'
        ];

        this.heroTitles = {
            'Daring Hero': ['The Brave', 'Destined for Glory'],
            'Sir Clumsy': ['The Accident-Prone', 'Trip Master'],
            'Lord Butterfingers': ['The Slippery', 'Dropper of Things'],
            'Duke Tripsalot': ['The Unsteady', 'Gravity\'s Friend'],
            'Baron Whoopsie': ['The Oops Master', 'Professional Mistake Maker'],
            'Count Mishap': ['The Unfortunate', 'Calamity Caller'],
            'Sir Fumbles': ['The Klutzy', 'Butter Hands'],
            'Lord Oopsington': ['The Blunderer', 'Error Enthusiast'],
            'Duke Derp': ['The Confused', 'Question Mark Incarnate'],
            'Sir Noodles': ['The Floppy', 'Pasta Knight'],
            'Baron Giggles': ['The Cheerful', 'Laughter Lord'],
            'Count Wiggles': ['The Squirmy', 'Dance Master'],
            'Lord Snuggles': ['The Cuddly', 'Hug Champion'],
            'Sir Pickles': ['The Sour', 'Brine Knight'],
            'Duke Waffles': ['The Crispy', 'Syrup Seeker'],
            'Baron Pancakes': ['The Fluffy', 'Stack Master'],
            'Count Muffins': ['The Crumbly', 'Bakery Baron'],
            'Sir Tickles': ['The Giggle Inducer', 'Feather Fighter'],
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
            'Duke Mishief': ['The Prankster', 'Trouble Starter'],
            'Baron Bumbles': ['The Bee-like', 'Buzz Baron'],
            'Count Giggleton': ['The Laughing', 'Chortle Champion'],
            'Sir Wigglebottom': ['The Dancing Rear', 'Booty Bouncer'],
            'Lord Snickerdoodle': ['The Cookie', 'Sweet Warrior'],
            'Duke Ticklebottom': ['The Funny Rear', 'Giggle Glutes'],
            'Baron Chucklehead': ['The Funny Faced', 'Grin Guardian'],
            'Count Dingleberry': ['The Clingy', 'Awkward Attachment'],
            'Sir Noodlethwaite': ['The Pasta Knight', 'Spaghetti Swordsman'],
            'Lord Bumblestorm': ['The Clumsy Hurricane', 'Disaster Dancer'],
            'Duke Gigglesnort': ['The Snorty Laugher', 'Chortle Champion'],
            'Baron Wobbleshire': ['The Shaky County', 'Trembling Territory'],
            'Count Ticklebeard': ['The Fuzzy Chin', 'Whisker Warrior'],
            'Sir Snugglesworth': ['The Cuddly Knight', 'Hug Hero'],
            'Lord Pickleface': ['The Sour Visage', 'Briny Baron'],
            'Duke Wafflebottom': ['The Crispy Rear', 'Syrup Sitter'],
            'Baron Pancakehead': ['The Flat Top', 'Stack Skull'],
            'Count Muffinshire': ['The Baked County', 'Crumb Count'],
            'Sir Tickletoes': ['The Giggly Feet', 'Toe Tickler'],
            'Lord Chuckleberry': ['The Fruity Laugher', 'Berry Funny'],
            'Duke Sparklebottom': ['The Shiny Rear', 'Glitter Glutes'],
            'Baron Dimpleshire': ['The Cute County', 'Cheek Territory'],
            'Count Sillyhat': ['The Goofy Headwear', 'Hat of Nonsense'],
            'Sir Wobblesnort': ['The Shaky Snorter', 'Trembling Nose'],
            'Lord Jigglybottom': ['The Bouncy Rear', 'Wiggly Warrior'],
            'Duke Squigglebeard': ['The Wavy Whiskers', 'Curly Chin'],
            'Captain Clumsyface': ['The Awkward Visage', 'Trip Captain'],
            'Sir Stumblebum': ['The Professional Faller', 'Gravity\'s Victim'],
            'Lord Blunderworth': ['The Noble Mistake', 'Error Earl'],
            'Duke Mischiefmaker': ['The Trouble Creator', 'Prank Prince'],
            'Baron Bumblebee': ['The Buzzing', 'Honey Hunter'],
            'Count Gigglesworth': ['The Worthy Laugher', 'Noble Chuckler'],
            'Sir Wiggletail': ['The Dancing Rear', 'Tail Wagger'],
            'Lord Snickerdorf': ['The Cookie Village', 'Sweet Settlement'],
            'Duke Ticklemonster': ['The Giggle Beast', 'Feather Fiend'],
            'Baron Chucklenuts': ['The Nutty Laugher', 'Silly Snacker'],
            'Count Dingleworth': ['The Worthy Clingy', 'Attachment Earl'],
            'Sir Noodleface': ['The Pasta Visage', 'Spaghetti Skull'],
            'Lord Bumblesnort': ['The Clumsy Snorter', 'Accident Nose'],
            'Duke Gigglebeard': ['The Laughing Whiskers', 'Funny Facial Hair'],
            'Baron Wobblehead': ['The Shaky Skull', 'Trembling Top'],
            'Count Tickleshire': ['The Giggly County', 'Feather Territory'],
            'Sir Snugglesnort': ['The Cuddly Snorter', 'Hug Nose'],
            'Lord Picklebottom': ['The Sour Rear', 'Briny Bottom'],
            'Duke Waffleface': ['The Crispy Visage', 'Syrup Skull'],
            'Baron Pancakeworth': ['The Worthy Stack', 'Fluffy Noble'],
            'Count Muffinhead': ['The Baked Brain', 'Crumbly Cranium'],
            'Sir Ticklebottom': ['The Giggly Rear', 'Funny Bottom'],
            'Lord Chuckleface': ['The Laughing Visage', 'Grinning Guardian'],
            'Duke Sparkletail': ['The Shiny Rear', 'Glittery Bottom'],
            'Baron Dimplesnort': ['The Cute Snorter', 'Adorable Nose'],
            'Count Sillybeard': ['The Goofy Whiskers', 'Nonsense Facial Hair'],
            'Sir Wobbleface': ['The Shaky Visage', 'Trembling Head'],
            'Lord Jigglesnort': ['The Bouncy Snorter', 'Wiggly Nose'],
            'Duke Squigglehead': ['The Wavy Brain', 'Curly Cranium'],
            'Captain Clumsytail': ['The Awkward Rear', 'Trip Tail'],
            'Sir Stumbleface': ['The Falling Visage', 'Gravity Face'],
            'Lord Blundersnort': ['The Mistake Snorter', 'Error Nose'],
            'Duke Mischiefbeard': ['The Trouble Whiskers', 'Prank Facial Hair'],
            'Baron Bumblehead': ['The Buzzing Brain', 'Bee Skull'],
            'Count Gigglesnort': ['The Laughing Snorter', 'Chortle Nose'],
            'Sir Wigglebottom': ['The Dancing Rear', 'Booty Bouncer'],
            'Lord Snickerbottom': ['The Cookie Rear', 'Sweet Bottom'],
            'Duke Tickleface': ['The Giggly Visage', 'Feather Face'],
            'Baron Chuckletail': ['The Laughing Rear', 'Funny Tail'],
            'Count Dinglesnort': ['The Clingy Snorter', 'Attachment Nose'],
            'Sir Noodletail': ['The Pasta Rear', 'Spaghetti Tail'],
            'Lord Bumblehead': ['The Clumsy Brain', 'Accident Skull'],
            'Duke Giggleface': ['The Laughing Visage', 'Chortle Head'],
            'Baron Wobblesnort': ['The Shaky Snorter', 'Trembling Nose'],
            'Count Tickletail': ['The Giggly Rear', 'Feather Tail'],
            'Sir Snugglehead': ['The Cuddly Brain', 'Hug Head'],
            'Lord Pickletail': ['The Sour Rear', 'Briny Tail'],
            'Duke Wafflesnort': ['The Crispy Snorter', 'Syrup Nose'],
            'Baron Pancakehead': ['The Flat Brain', 'Stack Skull'],
            'Count Muffintail': ['The Baked Rear', 'Crumbly Tail'],
            'Sir Ticklehead': ['The Giggly Brain', 'Feather Head'],
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

            // Skip if this is the match we're currently watching
            if ((participant1 === this.followingCharacter || participant2 === this.followingCharacter) &&
                participant1 && participant2) {
                continue;
            }

            // Skip if already resolved or has bye
            if (this.bracket[this.currentRound][nextMatchIndex] || !participant1 || !participant2) {
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
