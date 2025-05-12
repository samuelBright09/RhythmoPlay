import songs from "./playlist.js";


// selectors
const playerPlay = document.querySelector(".action-btns button:nth-child(2")












// function to play song
function togglePlay() {
  if (audio.paused) {
    audio.play();
    playerPlay.textContent = "Pause";
  } else {
    audio.pause();
    playerPlay.textContent = "Play";
  }
}


module.exports = {songs, togglePlay}