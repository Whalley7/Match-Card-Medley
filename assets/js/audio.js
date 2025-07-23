// audio.js

// 🎵 Plays the background tune
export function playTune() {
  const audio = document.getElementById("tune");
  if (!audio) return;

  audio.currentTime = 0;
  audio.play().catch(() => {
    /* Play attempt failed silently */
  });
}




// 🛑 Stops the background tune
export function stopTune() {
  const tune = document.getElementById("tune");
  if (tune) {
    tune.pause();
    tune.currentTime = 0;
  }
}

// 🔊 Plays a named sound effect
export function playSound(name) {
  const sounds = {
    click: "assets/audio/card.mp3",
    ding: "assets/audio/ding.mp3",
    applause: "assets/audio/applause.mp3",
    tune: "assets/audio/tune.mp3",
    wrong_answer: "assets/audio/wrong_answer.mp3"
  };

  const file = sounds[name];
  if (!file) return;

  const audio = new Audio(file);
  audio.play().catch(() => {
    // Silently ignore audio errors
  });
}
