
const flipsTag = document.querySelector(".flips b");
const refreshBtn = document.querySelector(".details button");
const matchTag = document.querySelector(".matched b");


let stopGame = false;
//let winModal = document.getElementById('winModal');
let newUser = true;


//Card settings
let flips = document.querySelectorAll(".card");
const totalPairs = 8; 
let newScore = 0;



//Difficulty levels
let levelText;
let level;

//Deck settings
let disableDeck = true;
let isGameActive = false;
let cardOne, cardTwo;
let silent = false;
let alreadyStarted = false


// Get the modal
let who = document.getElementById('legend');

//let audio = document.getElementById('audio');
let btn = document.getElementById('btn');
let winModal = document.getElementById('winModal');
let lostModal = document.getElementById('lostModal');
let resetBtn = document.getElementById('exampleModalLongTitle');
let username = localStorage.getItem("username");
let images;//default setting
let result = document.getElementById('result');
let endTime = document.querySelector('.flips b');




// Set the innerHTML of the element to the current date and time and display
//Date
const date = new Date().toLocaleDateString();

const monthNames = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"];

const monthNow = new Date();
let year = new Date().getFullYear();
let day = new Date().getDate();
let wordMonth = monthNames[monthNow.getMonth()];

document.getElementById("date").innerText = day + " " + wordMonth + " " + year;



//Load the document and stop audio from starting 
document.addEventListener('DOMContentLoaded', function() {
  // Get the audio element



  // Stop audio when the document is ready
  stopAudio();
  checkUser();
});

checkUser();

// Function to stop audio
function stopAudio() {
  let audio = document.getElementById('tune');
  audio.pause();

  // Reset the playback to the beginning
  audio.currentTime = 0;

}

//submit user information from modal 
$('#user-info-submit-button').click(function() {
  userInfoSubmitButton();
});

$('#refresh-button').click(function() {
  shuffleDeck();
});

//reset local storage when reset button clicked
$('#reset-user-data').click(function() {
  resetGame();
});


//Play/pause audio
$(document).ready(function() {
  $('.btn .fa-pause-circle').on('click', function() {
    $(this).hide();
    //goes wrong here
    $(".fa-play-circle").show();
    $("#tune")[0].pause();
    silent = true;
  });
  $('.btn .fa-play-circle').on('click', function() {
  
    $(this).hide();
    //goes wrong here
    $(".fa-pause-circle").show();
    $("#tune")[0].play();
    silent = false;
    
  });
});





//check if user exists before opening infoModal
function checkUser() {
  let username = localStorage.getItem("username");

  if (!username || username.trim() === "" || username.trim() === "Player") {
    localStorage.setItem("username", "Player");
    $('#player').text("Player");

  $(document).ready(function () {
  $('#userModal').modal({
    backdrop: 'static',
    keyboard: false
  }).modal('show');
});
  } else {
    displayUserData(username);
  }
}


$(document).ready(function () {
  $('userModal').modal({
    backdrop: 'static',
    keyboard: false
  }).modal('show');
});



//Submit user information from infoModal
function userInfoSubmitButton() {
  username = $('#username').val();
  localStorage.setItem("username", username);
  //Stop modal closing without any information
  if ((username != "") && (username != null) && (username != "Player")) {
    $('#userModal').modal('hide');
    displayUserData(username);
  }
}

function displayUserData(username) {
  $('#player').text("Hi " + username + "!");
  //alert("displaying user");
}


// Function to update or add a user's score
// Function to update or create a user in local storage
function updateScore(username, level, newScore) {
  // Retrieve scores from local storage
  let scores = JSON.parse(localStorage.getItem('scores')) || {};


  // Check if the user already exists
   // If the user doesn't exist, create a new user object
  if (!scores[username]) {
   
    scores[username] = { easy: 0, med: 0, hard: 0 };
  }
  let storedScore = scores[username][level];
  // Check if the new score is higher than the existing score for the level
  if (newScore > storedScore) {

    // If the new score is higher, update the score for that level
    scores[username][level] = newScore;

    // Update the local storage with the modified scores object
    localStorage.setItem('scores', JSON.stringify(scores));
    localStora



    //show win modal


    openCustomModal(username, level, newScore, storedScore);

    let displayScore = `<h4>Current score for ${level} level: ${newScore}</h4> `

    playApplause();
    $("#levelText").html(displayScore);
  } else {
    //not improved
    showLostModal(username, level, newScore, storedScore);
  }
}
//Show winning score
// Function to open the modal with dynamic content
function openCustomModal(username, level, newScore) {


  let titleContent = `<h5> Woo Hoo!  New High Score!</h5> `
  // Set dynamic content for the modal body
  let dynamicContent = `<p class="modal-Body"> Congratulations ${username}!  New HighScore at ${level} level with ${newScore} points.</p> `

  // Set the content in the modal body
  $("#customModalLabel").html(titleContent);

  $("#customModalBody").html(dynamicContent);

  // Show the modal
  $("#winModal").modal("show");
}


//bug fix storedScores
//Show no win score
function showLostModal(username, level, newScore, storedScore) {
  let titleMessage = `<h5> Bad luck this time ${username}!</h5>`
  alert(titleMessage);
  // Set dynamic content for the modal body
  let dynamicMessage = `<h6>Your score ${newScore} was not higher than your old score of ${storedScore} for ${level} level.</h6>`

  // Set the content in the modal body
  $("#lostModalLabel").html(titleMessage);

  $("#lostModalBody").html(dynamicMessage);

  // Show the modal
  $("#lostModal").modal("show");
}


//Reset user info

$('.refresh-button').click(function() {

  stopAudio();
  disableDeck = true;
  gameActive = false;
  localStorage.clear();
  username = "";
  localStorage.setItem("username", username);
  checkUser();
});


//Get level to be played/start the game
$('.btn-level').click(function() {
  level = $(this).val();
  score = 0;
  newScore = 0;
   document.getElementById("refresh-button").style.display = 'block';
   document.getElement
  isSwitchingLevel(level);
});

// Get the level ID from the button's data attribute 
//Delay to reanimate cards due to former array being shown on level switch
function isSwitchingLevel(level) {
  switch (level) {
    case 'easy':
      images = 'images-0';
      break;
    case 'med':
      images = 'images-1';
      break;
    case 'hard':
      images = 'images-2';
      break;
  }

  if(!silent) {
  silent = false;
  }
  setTimeout(reAnimateCards, 6000);

  function reAnimateCards() {
    disableDeck = false;
  
  }
  checkUserDetails(level);
}

//Check if user has played before
function checkUserDetails(level) {
  let usernameToCheck = localStorage.getItem("username");;
  checkUsernameAndLevelScore(usernameToCheck, level);
  shuffleDeck();
}

 // Check if the username exists in the scores object
// Retrieve previous scores from local storage
 // If either the username or level score does not exist, initialize the score at 0
function checkUsernameAndLevelScore(usernameToCheck, level) {

  let scores = getScores();

  if (scores.hasOwnProperty(usernameToCheck) && scores[username].hasOwnProperty(level)) {
    let score = scores[usernameToCheck][level];
    document.getElementById('levelText').innerText = `Current score for ${username} on ${level} level: ${score}`;
  } else {
    scores[username] = scores[usernameToCheck] || {};
    scores[username][level] = 0;
    localStorage.setItem('scores', JSON.stringify(scores));
    document.getElementById('levelText').innerText = `Score for on ${level} level initialized at 0`;
  }
}

// Function to retrieve scores from local storage
 // If scores are not found, return an empty object
function getScores() {
  let scoresString = localStorage.getItem('scores');
  if (scoresString) {
    return JSON.parse(scoresString);
  } else {
    return {};
  }
}



//AUDIO FILES
//Start tune when first card clicked
//If silent is true, don't play the tune
function playTune() {

  let audio = document.getElementById('tune');

  if (!silent) {
    $(audio).trigger('play');
  }
}

//Play sound when card clicked
//Do not play a sound if the deck is disabled
function playCard() {
  let audio = document.getElementById('card');
  if (!disableDeck) { }
  $(audio).trigger('play');
    if (!alreadyStarted) {
        alreadyStarted = true;
        startTimer();

    }

}


//Play a sound on card match
function playDing() {
  let audio = document.getElementById('ding');
   $(audio)[0].currentTime = 0;
  $(audio)[0].play();
}


//Play applause if score is higher than last score for the same level
function playApplause() {
  let audio = document.getElementById('applause');
  $(audio)[0].currentTime = 0;
  $(audio)[0].play();
}

// Function to end the game
function endGame() {
  //  const infoDiv = document.getElementById('userInfo');

  // Calculate the final score
  newScore = 100 * matchedPairs - (2 * flips);
  stopTimer();

  //Update userScore for level
  //check for level

  updateScore(username, level, newScore);
  //All cards matched
  disableDeck = true;
  stopAudio()
}

function showHint() {
  const unmatched = cards.filter(card => !card.classList.contains("flip"));
  if (unmatched.length >= 2) {
    const card1 = unmatched[0];
    const card2 = unmatched.find(card =>
      card.querySelector("img").src === card1.querySelector("img").src && card !== card1
    );

    if (card2) {
      card1.classList.add("hint");
      card2.classList.add("hint");
      setTimeout(() => {
        card1.classList.remove("hint");
        card2.classList.remove("hint");
      }, 1000);
    }
  }
}

let startTime, timerInterval;

function startTimer() {
  startTime = new Date().getTime();
  timerInterval = setInterval(() => {
    const elapsedTime = Math.floor((new Date().getTime() - startTime) / 1000);
    const minutes = String(Math.floor(elapsedTime / 60)).padStart(2, '0');
    const seconds = String(elapsedTime % 60).padStart(2, '0');
    document.getElementById("time").textContent = `${minutes}:${seconds}`;
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
}



//Reset user info
function resetGame() {
  // Get the stored array from local storage
  localStorage.removeItem("username");
  localStorage.setItem("username", "Player");
  displayUserData();
  checkUser();
}
//CARD CONTAINER
//Initiate the cards
let cards = [...document.getElementsByClassName("card")];
let pic = [1, 2, 3, 4, 5, 6, 7, 8];
arr = [...pic, ...pic];

function flipCard({ target: clickedCard }) {

  if (!disableDeck) {
    // Flip the clicked card
      playCard();
      isGameActive = true;
      playTune();
     
  } else {
  return;
  }

if (!isGameActive) {
  
  isGameActive = true;

}


  if (clickedCard !== cardOne && !disableDeck) {
    flips++;
    flipsTag.innerText = flips;
    clickedCard.classList.add("flip");

    if (!cardOne) {
      return cardOne = clickedCard;
    }
    cardTwo = clickedCard;
    disableDeck = true;
    let cardOneImg = cardOne.querySelector(".back-view img").src,
      cardTwoImg = cardTwo.querySelector(".back-view img").src;
    matchCards(cardOneImg, cardTwoImg);
  }
}


//Check cards for a match
function matchCards(img1, img2) {
    if (!isGameActive) {

  
  isGameActive = true;
}

  if (img1 === img2) {
    matchedPairs++;
    playDing();
    //  matchTag.innerHTML = matchedPairs;
    if (matchedPairs === totalPairs) {
      endGame();
      return disableDeck = true;
    } else {
      cardOne.removeEventListener("click", flipCard);
      cardTwo.removeEventListener("click", flipCard);
      cardOne = cardTwo = "";
      return disableDeck = false;
    }
  }

  setTimeout(() => {
    cardOne.classList.remove("flip");
    cardTwo.classList.remove("flip");
    cardOne = cardTwo = "";
    disableDeck = false;
  }, 400);
}

function shuffleDeck() {
  flips = matchedCard = 0;
  flipsTag.innerHTML = flips;
  matchedPairs = 0;
  // matchTag.innerHTML = matchedPairs;
  cardOne = cardTwo = "";

  disableDeck = isGameActive = false;
  $("#tune")[0].pause();
  $("#tune")[0].load();

  arr.sort(() => Math.random() > 0.5 ? 1 : -1);

  cards.forEach((card, index) => {
    card.classList.remove("flip");
    let imgTag = card.querySelector(".back-view img");
    setTimeout(() => {
      imgTag.src = `assets/images/${images}/img-${arr[index]}.png`;
    }, 500);
    card.addEventListener("click", flipCard);
  });
}
cards.forEach(card => {
  card.addEventListener("click", flipCard);
});

// JavaScript function to scroll to respective columns
  function scrollToColumn(columnNumber) {
    let column = document.querySelectorAll('.col-lg-6')[columnNumber - 1];
    column.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }