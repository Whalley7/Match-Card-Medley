// assets/js/modals.js

// Function to show the Win Modal
export function showWinModal(username, level, score) {
    const winModalElement = document.getElementById('winModal');
    const winMessageElement = document.getElementById('winMessage');

    if (winMessageElement) {
        winMessageElement.textContent = `Congratulations, ${username}! You achieved a score of ${score} on ${level} level.`;
    }

    // Get the Bootstrap modal instance and show it
    const winModal = new bootstrap.Modal(winModalElement);
    winModal.show();
}

// Function to show the Loss Modal
export function showLossModal(username, level, currentScore, oldScore) {
    const lossModalElement = document.getElementById('lossModal');
    const lossMessageElement = document.getElementById('lossMessage');

    if (lossMessageElement) {
        lossMessageElement.textContent = `Better luck next time, ${username}! Your score was ${currentScore}. Best score for this level: ${oldScore}.`;
    }

    // Get the Bootstrap modal instance and show it
    const lossModal = new bootstrap.Modal(lossModalElement);
    lossModal.show();
}

// Function to bind general modal events (if needed, but be careful not to override data-bs-dismiss)
export function bindModalEvents(gameInstance) {
    // Example: If you need to do something *after* a modal is hidden:
    document.getElementById('winModal').addEventListener('hidden.bs.modal', function () {
        // This fires after the win modal is completely hidden
        gameInstance.shuffleDeck(); // Or whatever action you want to take after the modal closes
    });

    document.getElementById('lossModal').addEventListener('hidden.bs.modal', function () {
        // This fires after the loss modal is completely hidden
        gameInstance.shuffleDeck(); // Or whatever action you want to take after the modal closes
    });

    // Make sure not to manually hide modals or remove backdrops if data-bs-dismiss is used.
    // If you have a custom button without data-bs-dismiss, you'd hide it like this:
    // document.getElementById('myCustomCloseButton').addEventListener('click', () => {
    //     const modalInstance = bootstrap.Modal.getInstance(document.getElementById('someModal'));
    //     if (modalInstance) modalInstance.hide();
    // });
}

// Hide and Show Modal functions are generally not needed if you use showWinModal/showLossModal
// and data-bs-dismiss="modal". If they exist and are being used, ensure they properly
// use the Bootstrap API (e.g., new bootstrap.Modal().hide() or getInstance().hide()).
export function hideModal(modalId) {
    const modalElement = document.getElementById(modalId);
    if (modalElement) {
        const modalInstance = bootstrap.Modal.getInstance(modalElement);
        if (modalInstance) {
            modalInstance.hide();
        }
    }
}

export function showModal(modalId) {
    const modalElement = document.getElementById(modalId);
    if (modalElement) {
        const modalInstance = new bootstrap.Modal(modalElement); // Always create new instance for showing
        modalInstance.show();
    }
}