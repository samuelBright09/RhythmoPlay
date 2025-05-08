import songs from "./playlist.js";

const audio = new Audio();
let currentSongIndex = 0;

// Select elements
const playButton = document.querySelector(".overlay button");
const prevButton = document.querySelector(".action-btns button:nth-child(1)");
const nextButton = document.querySelector(".action-btns button:nth-child(3)");
const progressBar = document.getElementById("progress-bar");
const currentTimeDisplay = document.querySelector(".time-track p:first-child");
const durationDisplay = document.querySelector(".time-track p:last-child");

// Event listeners
audio.addEventListener("loadedmetadata", ()=>{
    console.log("duration:", audio.title)
})
playButton.addEventListener("click", togglePlay);
prevButton.addEventListener("click", prevSong);
nextButton.addEventListener("click", nextSong);
progressBar.addEventListener("input", setProgress);
audio.addEventListener("timeupdate", updateProgress);

// Load the first song
loadSong(currentSongIndex);


// Load song
function loadSong(index) {
  const song = songs[index];
  if (song) {
    audio.src = song.songUrl;
    document.querySelector(".song-info p:first-child").textContent = song.title;
    document.querySelector(".song-info p:last-child").textContent = song.artist;
  }
}

// Play or Pause song
function togglePlay() {
  if (audio.paused) {
    audio.play();
    playButton.textContent = "Pause";
  } else {
    audio.pause();
    playButton.textContent = "Play";
  }
}

// Next song
function nextSong() {
  currentSongIndex = (currentSongIndex + 1) % songs.length;
  loadSong(currentSongIndex);
  audio.play();
}

// Previous song
function prevSong() {
  currentSongIndex = (currentSongIndex - 1 + songs.length) % songs.length;
  loadSong(currentSongIndex);
  audio.play();
}

// Update progress bar & time
function updateProgress() {
  progressBar.value = (audio.currentTime / audio.duration) * 100;
  currentTimeDisplay.textContent = formatTime(audio.currentTime);
  durationDisplay.textContent = formatTime(audio.duration);
}

// Seek in the song
function setProgress(e) {
  const newTime = (e.target.value / 100) * audio.duration;
  audio.currentTime = newTime;
}

// Format time display
function formatTime(time) {
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}
