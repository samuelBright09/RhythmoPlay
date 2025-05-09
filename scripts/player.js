import songs from "./playlist.js";

const audio = new Audio();
let currentSongIndex = 0;

// Select elements
const playButton = document.querySelector(".overlay button");
const playerPlay = document.querySelector(".action-btns button:nth-child(2")
const prevButton = document.querySelector(".action-btns button:nth-child(1)");
const nextButton = document.querySelector(".action-btns button:nth-child(3)");
const progressBar = document.getElementById("progress-bar");
const currentTimeDisplay = document.querySelector(".time-track p:first-child");
const durationDisplay = document.querySelector(".time-track p:last-child");
const nowPlayingCoverArt = document.querySelector(".playing-cover-art img");
const nowPlayingTitle = document.querySelector(".song-info p:first-child");
const nowPlayingArtist = document.querySelector(".song-info p:last-child");
const songContainer = document.querySelector(".song-list");

// Load all songs & metadata
async function loadAllSongsImage() {
  const songDataArray = [];

  for (let index = 0; index < songs.length; index++) {
    const song = songs[index];
    
    try {
      const response = await fetch(song.songUrl);
      const blob = await response.blob();

      const tag = await jsmediatags.read(blob);
      
      let coverUrl = "./assets/images/default-disc.jpg"; // Default cover
      if (tag.tags.picture) {
        const { data, format } = tag.tags.picture;
        const base64String = btoa(
          new Uint8Array(data).reduce((data, byte) => data + String.fromCharCode(byte), "")
        );
        coverUrl = `data:${format};base64,${base64String}`;
      }

      songDataArray.push({ song, coverUrl, index }); // Preserve index for sorting

    } catch (error) {
      console.error(`Error fetching metadata for ${song.title}:`, error);
      songDataArray.push({ song, coverUrl: "./assets/images/default-disc.jpg", index }); // Fallback
    }
  }

  // Sort songs by their original index before adding them to the UI
  songDataArray.sort((a, b) => a.index - b.index).forEach(({ song, coverUrl }) => {
    createSongCard(song, coverUrl);
  });
}

// Create song card
function createSongCard(song, coverUrl) {
  const songCard = document.createElement("div");
  songCard.classList.add("song-card");
  songCard.innerHTML = `
    <div class="cover-art">
      <img src="${coverUrl}" alt="Cover Art">
    </div>
    <div class="overlay">
      <div class="info">
        <p>${song.artist}</p>
        <p>${song.title}</p>
      </div>
      <button onclick="playSong('${song.songUrl}')">Play</button>
    </div>
  `;

  songContainer.appendChild(songCard);
}

// Load a song with metadata
function loadSong(index) {
  const song = songs[index];
  audio.src = song.songUrl;

  fetch(song.songUrl)
    .then((response) => response.blob())
    .then((blob) => {
      jsmediatags.read(blob, {
        onSuccess: (tag) => {
          nowPlayingArtist.textContent = tag.tags.artist || song.artist;
          nowPlayingTitle.textContent = tag.tags.title || song.title;

          if (tag.tags.picture) {
            const { data, format } = tag.tags.picture;
            const base64String = btoa(
              new Uint8Array(data).reduce((data, byte) => data + String.fromCharCode(byte), "")
            );
            nowPlayingCoverArt.src = `data:${format};base64,${base64String}`;
          } else {
            nowPlayingCoverArt.src = "./assets/images/default-disc.jpg";
          }
        },
        onError: () => {
          nowPlayingCoverArt.src = "./assets/images/default-disc.jpg";
        },
      });
    });

  audio.addEventListener("loadedmetadata", () => {
    durationDisplay.textContent = formatTime(audio.duration);
  });
}

// Play or Pause
function togglePlay() {
  if (audio.paused) {
    audio.play();
    playButton.textContent = "Pause";
  } else {
    audio.pause();
    playButton.textContent = "Play";
  }
}

// Next & Previous Song
function nextSong() {
  currentSongIndex = (currentSongIndex + 1) % songs.length;
  loadSong(currentSongIndex);
  audio.play();
}

function prevSong() {
  currentSongIndex = (currentSongIndex - 1 + songs.length) % songs.length;
  loadSong(currentSongIndex);
  audio.play();
}

// Update Progress Bar
function updateProgress() {
  if (!isNaN(audio.duration)) {
    progressBar.value = (audio.currentTime / audio.duration) * 100;
    currentTimeDisplay.textContent = formatTime(audio.currentTime);
  }
}

// Seek in Song
function setProgress(e) {
  const newTime = (e.target.value / 100) * audio.duration;
  audio.currentTime = newTime;
}

// Format Time
function formatTime(time) {
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

// Event Listeners
// playButton.addEventListener("click", togglePlay);
playerPlay.addEventListener("click", togglePlay);
prevButton.addEventListener("click", prevSong);
nextButton.addEventListener("click", nextSong);
progressBar.addEventListener("input", setProgress);
audio.addEventListener("timeupdate", updateProgress);

// Initial Load
loadSong(currentSongIndex);
loadAllSongsImage();