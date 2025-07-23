// This file assumes it's run in a browser environment *after* game.js and its dependencies are loaded.
// For more robust testing, consider a framework like Jest with JSDOM.

import { CardGame } from './game.js';
// We might need to import other modules if we want to test their individual functions
// import { getStoredScores, updateStoredScores } from './storage.js';
// import { playSound, playTune } from './audio.js';
// import { showWinModal, showLossModal, bindModalEvents, hideModal, showModal } from './modals.js';


console.log("--- Starting Match Card Medley Tests ---");

// Helper function to simulate a DOMContentLoaded event
function triggerDOMContentLoaded() {
    const event = new Event('DOMContentLoaded', {
        bubbles: true,
        cancelable: true,
    });
    document.dispatchEvent(event);
}

// Helper for assertions
function assert(condition, message) {
    if (condition) {
        console.log(`✅ PASS: ${message}`);
    } else {
        console.error(`❌ FAIL: ${message}`);
    }
}

// Mocking DOM elements for testing where direct DOM access isn't available
// or to avoid actual UI rendering during simple tests.
// In a real testing setup (e.g., JSDOM), the actual DOM would be manipulated.
const mockElements = {};
function setupMockDOM() {
    document.body.innerHTML = `
        <div id="game-board"></div>
        <span class="flips"><b>0</b></span>
        <span class="matched"><b>0</b></span>
        <span id="time">00:00</span>
        <span id="levelText">Select a level to begin</span>
        <span id="player">Hi Player!</span>
        <span class="badge bg-success fs-5" id="score-display">Score: 0</span>
        <audio id="tune"></audio>
        <div class="modal fade" id="userModal"></div>
        <div class="modal fade" id="rulesModal"></div>
        <div class="modal fade" id="resetConfirmModal"></div>
    `;
    // Re-select elements after mocking innerHTML
    mockElements.gameBoard = document.getElementById('game-board');
    mockElements.flipsTag = document.querySelector(".flips b");
    mockElements.matchTag = document.querySelector(".matched b");
    mockElements.timeTag = document.getElementById("time");
    mockElements.levelTextTag = document.getElementById("levelText");
    mockElements.playerTag = document.getElementById("player");
    mockElements.scoreDisplay = document.getElementById("score-display");
    mockElements.tune = document.getElementById("tune");
    mockElements.userModal = document.getElementById("userModal");
    mockElements.rulesModal = document.getElementById("rulesModal");
    mockElements.resetConfirmModal = document.getElementById("resetConfirmModal");
}

// --- Test Suite ---

document.addEventListener("DOMContentLoaded", () => {
    setupMockDOM(); // Ensure a clean DOM state for each test run

    // Simulate game initialization
    let gameInstance = new CardGame();

    console.log("\n--- Testing Core Game Initialization ---");

    assert(gameInstance.flips === 0, "Initial flips should be 0");
    assert(gameInstance.matchedPairs === 0, "Initial matched pairs should be 0");
    assert(gameInstance.level === "easy", "Default level should be 'easy'");
    assert(gameInstance.username === null, "Username should be null initially if not in localStorage");
    assert(gameInstance.userModal !== null, "User modal should be initialized");
    assert(gameInstance.tune !== null, "Audio element should be correctly selected");
    // This assumes localStorage is empty before running tests
    assert(mockElements.playerTag.textContent === "Hi Player!", "Player name should default to 'Player' if no username");

    console.log("\n--- Testing `setLevel` method ---");
    gameInstance.setLevel("med");
    assert(gameInstance.level === "med", "Level should be set to 'med'");
    assert(gameInstance.images === "images-1", "Images path should match 'med' level");
    assert(gameInstance.gameBoard.children.length > 0, "Game board should have cards after setting level");
    assert(mockElements.flipsTag.textContent === "0", "Flips should reset to 0 after setLevel");
    assert(mockElements.matchTag.textContent === "0", "Matched pairs should reset to 0 after setLevel");

    console.log("\n--- Testing `createCards` and `shuffleDeck` ---");
    gameInstance.shuffleDeck(); // Reshuffle
    assert(gameInstance.cards.length === gameInstance.totalPairs * 2, "Correct number of cards created");
    assert(gameInstance.gameBoard.children.length === gameInstance.totalPairs * 2, "Cards appended to game board");
    assert(gameInstance.flips === 0, "Flips reset after shuffle");
    assert(gameInstance.matchedPairs === 0, "Matched pairs reset after shuffle");
    assert(gameInstance.cardOne === null && gameInstance.cardTwo === null, "Selected cards reset after shuffle");
    assert(gameInstance.alreadyStarted === false, "Game not started after shuffle");
    assert(gameInstance.newScore === 0, "Score reset after shuffle");


    console.log("\n--- Testing `flipCard` and `matchCards` (simulation) ---");

    // Clear board and create fresh cards for controlled testing
    gameInstance.totalPairs = 2; // Reduce pairs for easier testing
    gameInstance.setLevel('easy'); // Re-initialize cards for 2 pairs
    gameInstance.shuffleDeck();

    const cards = gameInstance.cards;
    assert(cards.length === 4, "Should have 4 cards for 2 pairs");

    let card1, card2, nonMatchingCard;
    // Find two matching cards and one non-matching card
    for (let i = 0; i < cards.length; i++) {
        for (let j = i + 1; j < cards.length; j++) {
            if (cards[i].dataset.image === cards[j].dataset.image) {
                card1 = cards[i];
                card2 = cards[j];
                break;
            }
        }
        if (card1 && card2) break;
    }
    nonMatchingCard = cards.find(c => c !== card1 && c !== card2);

    assert(card1 && card2, "Found matching cards for simulation");
    assert(nonMatchingCard, "Found non-matching card for simulation");

    // Test a non-match
    console.log("  - Simulating a non-match:");
    gameInstance.flipCard({ target: card1 });
    assert(gameInstance.flips === 1, "Flips incremented on first flip");
    assert(gameInstance.cardOne === card1, "cardOne set correctly");
    assert(gameInstance.alreadyStarted === true, "Game started after first flip");

    gameInstance.flipCard({ target: nonMatchingCard });
    assert(gameInstance.flips === 2, "Flips incremented on second flip (non-match)");
    assert(gameInstance.disableDeck === true, "Deck disabled during non-match check");

    // Wait for the timeout to complete (simulated, in real test use Jest.runAllTimers())
    setTimeout(() => {
        assert(gameInstance.cardOne === null && gameInstance.cardTwo === null, "Cards reset after non-match timeout");
        assert(gameInstance.disableDeck === false, "Deck re-enabled after non-match timeout");
        assert(!card1.querySelector(".card-inner").classList.contains("flip"), "Non-matching card flipped back (card1)");
        assert(!nonMatchingCard.querySelector(".card-inner").classList.contains("flip"), "Non-matching card flipped back (nonMatchingCard)");

        // Test a match
        console.log("  - Simulating a match:");
        gameInstance.shuffleDeck(); // Reset for a clean match test
        gameInstance.totalPairs = 2;
        gameInstance.setLevel('easy');
        gameInstance.shuffleDeck();
        const newCards = gameInstance.cards;
        let matchCard1, matchCard2;
         for (let i = 0; i < newCards.length; i++) {
            for (let j = i + 1; j < newCards.length; j++) {
                if (newCards[i].dataset.image === newCards[j].dataset.image) {
                    matchCard1 = newCards[i];
                    matchCard2 = newCards[j];
                    break;
                }
            }
            if (matchCard1 && matchCard2) break;
        }

        gameInstance.flipCard({ target: matchCard1 });
        gameInstance.flipCard({ target: matchCard2 });

        assert(gameInstance.matchedPairs === 1, "Matched pairs incremented on match");
        assert(gameInstance.flips === 2, "Flips correct on match");
        assert(matchCard1.querySelector(".card-inner").classList.contains("matched"), "Matching card 1 has 'matched' class");
        assert(matchCard2.querySelector(".card-inner").classList.contains("matched"), "Matching card 2 has 'matched' class");
        assert(gameInstance.cardOne === null && gameInstance.cardTwo === null, "Cards reset after match");
        assert(gameInstance.disableDeck === false, "Deck re-enabled after match");

        console.log("\n--- Testing Scoring ---");
        gameInstance.shuffleDeck(); // Reset game for score testing
        gameInstance.totalPairs = 1; // Test with one pair for quick win
        gameInstance.setLevel('easy'); // Ensure cards are reset
        gameInstance.shuffleDeck();

        const cardsForScore = gameInstance.cards;
        const scoreCard1 = cardsForScore[0];
        const scoreCard2 = cardsForScore[1]; // Should be the matching one after shuffle with 1 pair

        gameInstance.flipCard({ target: scoreCard1 });
        gameInstance.flipCard({ target: scoreCard2 });

        assert(parseInt(mockElements.scoreDisplay.textContent.split(': ')[1]) > 0, "Score should be greater than 0 after a match");
        assert(gameInstance.matchedPairs === 1, "Matched pairs is 1 for a single pair game");
        assert(gameInstance.flips === 2, "Flips is 2 for a single pair game");
        assert(gameInstance.timerInterval === null, "Timer should be stopped after game end");

        // Test username saving
        console.log("\n--- Testing Username Saving ---");
        // Simulate initial state without username
        localStorage.removeItem("username");
        gameInstance.username = null; // Clear instance username
        gameInstance.checkUser(); // This should show the modal (if in a browser)

        // Simulate user input and saving
        const usernameInput = document.getElementById("usernameInput");
        const saveUsernameBtn = document.getElementById("saveUsernameBtn");
        if (usernameInput && saveUsernameBtn) {
            usernameInput.value = "TestUser";
            saveUsernameBtn.click(); // Simulate click
            assert(localStorage.getItem("username") === "TestUser", "Username should be saved to localStorage");
            assert(gameInstance.username === "TestUser", "Game instance username should be updated");
            assert(mockElements.playerTag.textContent === "Hi TestUser!", "Player name displayed correctly after saving");
        } else {
            console.warn("Skipping username saving test: Username input/save button not found (possibly due to non-browser environment).");
        }
        
        // Reset local storage for future runs
        localStorage.removeItem("username");
        
        console.log("\n--- Match Card Medley Tests Complete ---");

    }, 1500); // Give enough time for the non-match flip-back animation (1000ms + buffer)
});