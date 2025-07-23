// Function to get stored scores
export function getStoredScores() {
    const scoresJSON = localStorage.getItem("matchCardScores");
    return scoresJSON ? JSON.parse(scoresJSON) : {};
}

// Function to update stored scores
export function updateStoredScores(username, level, newScore) {
    const scores = getStoredScores();
    if (!scores[username]) {
        scores[username] = {};
    }
    const oldScore = scores[username][level] || 0;
    if (newScore > oldScore) {
        scores[username][level] = newScore;
        localStorage.setItem("matchCardScores", JSON.stringify(scores));
        return oldScore; // Return old score to compare for new high score
    }
    return oldScore; // Return old score even if newScore isn't higher
}

// NEW FUNCTION: Function to clear all stored scores
export function clearAllStoredScores() {
    localStorage.removeItem("matchCardScores");
   
}