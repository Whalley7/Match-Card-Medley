// assets/js/game.js

import { playTune, playSound } from './audio.js';
import { showWinModal, showLossModal, bindModalEvents, hideModal, showModal } from './modals.js';
import { getStoredScores, updateStoredScores } from './storage.js';

export class CardGame {
    constructor() {
        this.totalPairs = 8;
        this.cards = [];
        this.gameBoard = document.getElementById('game-board');
        this.matchedPairs = 0;
        this.flips = 0;
        this.selectors(); // Call selectors early to get all element references

        // Initialize username based on localStorage
        this.username = localStorage.getItem("username");
        this.cardOne = null;
        this.cardTwo = null;
        this.silent = false;
        this.alreadyStarted = false;

        this.level = "easy";
        this.images = '';
        this.newScore = 0;
        this.timerInterval = null;
        this.startTime = null;

        this.userModal = null;
        this.rulesModal = null;
        this.resetConfirmModal = null;

        this.init();
    }

    init() {
        this.updateDate();
        this.initModals(); // Initialize Bootstrap Modals
        this.attachControls(); // Attach all event listeners
        this.checkUser(); // This will now properly show the modal if username is null
        this.setLevel(this.level); // Initial deck setup
    }

    selectors() {
        this.flipsTag = document.querySelector(".flips b");
        this.matchTag = document.querySelector(".matched b");
        this.timeTag = document.getElementById("time");
        this.levelTextTag = document.getElementById("levelText");
        this.tune = document.getElementById("tune");
        // Removed `this.card = document.getElementById("card");` as there's no such ID in HTML and it's not needed for dynamic cards
        this.scoreDisplayTag = document.getElementById("score-display"); // Added for score display

        // DOM element references for buttons and inputs
        this.playButton = document.getElementById("play");
        this.pauseButton = document.getElementById("pause");
        this.refreshButton = document.getElementById("refresh-button");
        this.resetUserDataButton = document.getElementById("reset-user-data");
        this.showRulesButton = document.getElementById("showRulesBtn");
        this.usernameInput = document.getElementById("usernameInput");
        this.saveUsernameBtn = document.getElementById("saveUsernameBtn");
        this.confirmResetBtn = document.getElementById("confirmResetBtn");

        // NEW: Player name display element with its unique ID
        this.playerNameDisplay = document.getElementById("player-name-display");
        // If you want a player name in the stats line, add an ID to that span and select it here too.
    }

    initModals() {
        const userModalEl = document.getElementById("userModal");
        const rulesModalEl = document.getElementById("rulesModal");
        const resetConfirmModalEl = document.getElementById("resetConfirmModal");

        if (userModalEl) {
            this.userModal = new bootstrap.Modal(userModalEl, { backdrop: 'static', keyboard: false });
        }
        if (rulesModalEl) {
            this.rulesModal = new bootstrap.Modal(rulesModalEl);
        }
        if (resetConfirmModalEl) {
            this.resetConfirmModal = new bootstrap.Modal(resetConfirmModalEl);
        }
    }

    attachControls() {
        // Use the stored references and add null checks
        if (this.playButton) this.playButton.addEventListener("click", () => this.toggleMute(false));
        if (this.pauseButton) this.pauseButton.addEventListener("click", () => this.toggleMute(true));
        if (this.refreshButton) this.refreshButton.addEventListener("click", () => this.shuffleDeck());
        if (this.showRulesButton) this.showRulesButton.addEventListener("click", () => this.rulesModal?.show());
        if (this.resetUserDataButton) this.resetUserDataButton.addEventListener("click", () => this.resetConfirmModal?.show());

        document.querySelectorAll(".btn-level").forEach(btn => {
            btn.addEventListener("click", (e) => {
                this.level = e.currentTarget.value;
                this.setLevel(this.level);
            });
        });

        // Use the stored references for username input/save
        if (this.saveUsernameBtn && this.usernameInput && this.userModal) {
            this.saveUsernameBtn.addEventListener("click", () => {
                const name = this.usernameInput.value.trim();
                if (name === "") {
                    alert("Please enter a username!");
                    return;
                }

                this.username = name;
                localStorage.setItem("username", this.username);

                // UPDATED: Use the new unique player name display ID
                if (this.playerNameDisplay) {
                    this.playerNameDisplay.textContent = `Hi ${this.username}!`;
                }
                this.displayUserScore();
                this.setLevel(this.level); // Resets game board with new settings and user info

                this.userModal.hide();
                this.usernameInput.value = '';
            });
        }

        // Use the stored reference for reset confirmation button
        if (this.confirmResetBtn && this.resetConfirmModal) {
            this.confirmResetBtn.addEventListener("click", () => {
                document.getElementById("resetConfirmModal").addEventListener('hidden.bs.modal', () => {
                    this.resetGame();
                }, { once: true });
                this.resetConfirmModal.hide();
            });
        }
    }

    checkUser() {
        if (!this.username && this.userModal) {
            this.userModal.show();
        }
        // UPDATED: Use the new unique player name display ID
        if (this.playerNameDisplay) {
            this.playerNameDisplay.textContent = `Hi ${this.username || "Player"}!`;
        }
        this.displayUserScore();
    }

    toggleMute(mute) {
        this.silent = mute;
        // Use stored button references
        if (this.pauseButton && this.playButton) {
            if (this.silent) {
                this.tune.pause();
                this.pauseButton.style.display = "none";
                this.playButton.style.display = "inline-block";
            } else {
                if (this.alreadyStarted) this.tune.play();
                this.pauseButton.style.display = "inline-block";
                this.playButton.style.display = "none";
            }
        }
    }

    updateDate() {
        const date = new Date();
        const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        const formatted = `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
        document.getElementById("date").textContent = formatted;
    }

    setLevel(level) {
        const levelMap = { easy: 'images-0', med: 'images-1', hard: 'images-2' };
        this.images = levelMap[level] || 'images-0';
        this.level = level;
        this.newScore = 0;

        // Use stored score display tag
        if (this.scoreDisplayTag) this.scoreDisplayTag.textContent = `Score: 0`;

        this.displayUserScore();
        this.shuffleDeck();
    }

    createCards() {
        this.cards = [];
        this.gameBoard.innerHTML = '';
        this.deck = [...Array(this.totalPairs).keys(), ...Array(this.totalPairs).keys()].map(i => i + 1);
        this.deck.sort(() => Math.random() - 0.5);

        this.deck.forEach((cardId, index) => {
            const container = document.createElement('div');
            container.classList.add('card-container');
            const card = document.createElement('div');
            card.classList.add('card');
            card.dataset.id = index;
            const imagePath = `assets/images/${this.images}/img-${cardId}.png`;
            card.dataset.image = imagePath;
            card.innerHTML = `
                <div class="card-inner">
                    <div class="card-front"  "alt="front"><h2>?</h2"></div>
                    <div class="card-back"><img src="${imagePath}" alt="back" /></div>
                </div>`;
            container.appendChild(card);
            this.gameBoard.appendChild(container);
            this.cards.push(card);
        });
        this.attachCardListeners();
    }

    attachCardListeners() {
        this.cards.forEach(card => card.addEventListener("click", e => this.flipCard(e)));
    }

    flipCard(event) {
        const clickedCard = event.target.closest(".card");
        playSound('card');
        if (!clickedCard) return;

        const cardInner = clickedCard.querySelector(".card-inner");
        if (this.disableDeck || clickedCard === this.cardOne || cardInner.classList.contains("matched")) return;

        if (!this.alreadyStarted) {
            this.startTimer();
            this.alreadyStarted = true;
            this.tune.pause();
            this.tune.currentTime = 0;
            if (!this.silent) this.tune.play();
        }

        this.flips++;
        this.flipsTag.textContent = this.flips;
        cardInner.classList.add("flip");

        if (!this.cardOne) {
            this.cardOne = clickedCard;
            this.updateLiveScore();
            return;
        }

        this.cardTwo = clickedCard;
        this.disableDeck = true;
        this.matchCards(this.cardOne.dataset.image, this.cardTwo.dataset.image);
    }

    matchCards(img1, img2) {
        if (img1 === img2) {
            playSound('ding');
            this.cardOne.querySelector(".card-inner").classList.add("matched", "matched-glow");
            this.cardTwo.querySelector(".card-inner").classList.add("matched", "matched-glow");
            this.cardOne = null;
            this.cardTwo = null;
            this.disableDeck = false;
            this.matchedPairs++;
            this.matchTag.textContent = this.matchedPairs;
            this.updateLiveScore();
            if (this.matchedPairs === this.totalPairs) this.checkGameEnd();
        } else {
            setTimeout(() => {
                if (this.cardOne) this.cardOne.querySelector(".card-inner").classList.remove("flip");
                if (this.cardTwo) this.cardTwo.querySelector(".card-inner").classList.remove("flip");
                this.cardOne = null;
                this.cardTwo = null;
                this.disableDeck = false;
            }, 1000);
        }
    }

   checkGameEnd() {
    this.stopTimer();
    this.updateLiveScore(); // This updates this.newScore to the final score
    this.launchConfetti();

    // This retrieves the stored high score for the current level and username
    const oldScore = updateStoredScores(this.username, this.level, this.newScore);

    if (this.newScore > oldScore) {
        playSound('applause');
        // This is where the magic happens for displaying the score
        showWinModal(this.username, this.level, this.newScore);
    } else {
        playSound('wrong_answer');
        // This is where the magic happens for displaying the score
        showLossModal(this.username, this.level, this.newScore, oldScore);
    }
    this.disableDeck = true;
}
    shuffleDeck() {
    this.flips = 0;
    this.matchedPairs = 0;
    this.cardOne = null;
    this.cardTwo = null;
    this.disableDeck = false;
    this.alreadyStarted = false;
    this.newScore = 0; // <<< Already here, which is great!
    this.flipsTag.textContent = "0";
    this.matchTag.textContent = "0";
    this.timeTag.textContent = "00:00";
    this.stopTimer();
    this.tune.pause();
    this.tune.currentTime = 0;
    this.updateLiveScore(); // <<< This also sets the display
    this.createCards();
}

    startTimer() {
        this.startTime = Date.now();
        this.timerInterval = setInterval(() => {
            const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
            const mins = String(Math.floor(elapsed / 60)).padStart(2, "0");
            const secs = String(elapsed % 60).padStart(2, "0");
            this.timeTag.textContent = `${mins}:${secs}`;
        }, 1000);
    }

    stopTimer() {
        clearInterval(this.timerInterval);
    }

    updateLiveScore() {
        if (!this.startTime) {
            if (this.scoreDisplayTag) this.scoreDisplayTag.textContent = `Score: 0`;
            return;
        }
        const perfectClicks = this.totalPairs * 2;
        const extraClicks = Math.max(this.flips - perfectClicks, 0);
        const timeElapsed = Math.floor((Date.now() - this.startTime) / 1000);
        const timeBonus = Math.max(120 - timeElapsed, 0);
        const liveScore = Math.max(1000 + timeBonus * 10 - extraClicks * 5, 0);
        this.newScore = liveScore;
        if (this.scoreDisplayTag) this.scoreDisplayTag.textContent = `Score: ${liveScore}`;
    }

    displayUserScore() {
        const scores = getStoredScores();
        const userNameForDisplay = this.username || "Player";
        const current = scores[userNameForDisplay]?.[this.level] ?? 0;
        this.levelTextTag.textContent = `High score for ${this.level}: ${current}`;
    }

    launchConfetti() {
        if (typeof confetti === 'function') {
            confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
        }
    }

    resetGame() {
        localStorage.removeItem("username");
        this.username = null;

        document.querySelectorAll('.modal-backdrop').forEach(backdrop => backdrop.remove());
        document.body.classList.remove('modal-open');
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';

        this.checkUser(); // This will now show the modal
        this.shuffleDeck();
    }
}

// Start the game when DOM is ready
if (document.readyState !== 'loading') {
    new CardGame();
} else {
    document.addEventListener("DOMContentLoaded", () => {
        new CardGame();
    });
}