import songs from "./playlist.js";

 export const audio = new Audio();
let currentSongIndex = 0;

// Select elements
const songListPlay = document.querySelector(".overlay button");
const playerPlay = document.querySelector(".action-btns button:nth-child(2)");
const prevButton = document.querySelector(".action-btns button:nth-child(1)");
const nextButton = document.querySelector(".action-btns button:nth-child(3)");
const progressBar = document.getElementById("progress-bar");
const currentTimeDisplay = document.querySelector(".time-track p:first-child");
const durationDisplay = document.querySelector(".time-track p:last-child");
const nowPlayingCoverArt = document.querySelector(".playing-cover-art img");
const nowPlayingTitle = document.querySelector(".song-info p:first-child");
const nowPlayingArtist = document.querySelector(".song-info p:last-child");
const songContainer = document.querySelector(".song-list");
const playIcon = document.querySelector(".play-icon");
const pauseIcon = document.querySelector(".pause-icon");


// load songs
async function loadSongsInOrder() {
    songContainer.innerHTML = '';
  const loadingContainer = document.createElement('div');
  loadingContainer.className = 'loading-container';
  loadingContainer.innerHTML = `
    <div class="loading-spinner"></div>
    <p>Loading songs...</p>
  `;
  document.body.appendChild(loadingContainer);

  try {
    const songPromises = songs.map((song, index) => 
      fetch(song.songUrl)
        .then(response => {
          if (!response.ok) throw new Error('Network response was not ok');
          return response.blob();
        })
        .then(blob => {
          return new Promise((resolve) => {
            jsmediatags.read(blob, {
              onSuccess: (tag) => {
                const title = tag.tags.title || "Unknown Title";
                const artist = tag.tags.artist || "Unknown Artist";
                let coverUrl = "./assets/images/default-disc.jpg";
                
                if (tag.tags.picture) {
                  const { data, format } = tag.tags.picture;
                  const base64String = btoa(
                    new Uint8Array(data).reduce(
                      (data, byte) => data + String.fromCharCode(byte),
                      ""
                    )
                  );
                  coverUrl = `data:${format};base64,${base64String}`;
                }
                
                resolve({ 
                  ...song, 
                  title, 
                  artist, 
                  coverUrl, 
                  originalIndex: index 
                });
              },
              onError: () => {
                resolve({ 
                  ...song, 
                  title: "Unknown Title",
                  artist: "Unknown Artist",
                  coverUrl: "./assets/images/default-disc.jpg", 
                  originalIndex: index 
                });
              },
            });
          });
        })
        .catch(() => {
          return { 
            ...song, 
            title: "Unknown Title",
            artist: "Unknown Artist",
            coverUrl: "./assets/images/default-disc.jpg", 
            originalIndex: index 
          };
        })
    );

    const songsWithMetadata = await Promise.all(songPromises);
    songsWithMetadata.sort((a, b) => a.originalIndex - b.originalIndex);
    
    songsWithMetadata.forEach(song => {
      createSongCard(song, song.coverUrl);
    });
    
    songs = songsWithMetadata;
  } catch (error) {
    console.error("Failed to load songs:", error);
    const errorElement = document.createElement('div');
    errorElement.className = 'error-message';
    errorElement.textContent = 'Failed to load songs. Please try again.';
    document.body.appendChild(errorElement);
  } finally {
    // Remove loading indicator whether successful or not
    loadingContainer.remove();
  }
}

loadSongsInOrder();




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
      <button class="play-song-btn"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-play-icon lucide-play"><polygon points="6 3 20 12 6 21 6 3"/></svg></button>
    </div>
  `;

  songCard.querySelector(".play-song-btn").addEventListener("click", () => {
    const index = songs.findIndex((s) => s.songUrl === song.songUrl);
    if (index !== -1) {
      currentSongIndex = index;
      loadSong(currentSongIndex);
      audio.play().catch((e) => console.error("Playback failed:", e));
      playIcon.style.display = "none";
      pauseIcon.style.display = "block";
    }
  });

  songContainer.appendChild(songCard);
}

function playSong(url) {
  const index = songs.findIndex((song) => song.songUrl === url);
  if (index !== -1) {
    currentSongIndex = index;
    loadSong(currentSongIndex);
    togglePlay();
  }
}

// Load a song with metadata
async function loadSong(index) {
  const song = songs[index];
  audio.src = song.songUrl;

  await fetch(song.songUrl)
    .then((response) => response.blob())
    .then((blob) => {
      jsmediatags.read(blob, {
        onSuccess: (tag) => {
          nowPlayingArtist.textContent = tag.tags.artist;
          nowPlayingTitle.textContent = tag.tags.title;

          if (tag.tags.picture) {
            const { data, format } = tag.tags.picture;
            const base64String = btoa(
              new Uint8Array(data).reduce(
                (data, byte) => data + String.fromCharCode(byte),
                ""
              )
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
    playIcon.style.display = "none";
    pauseIcon.style.display = "block";
  } else if (!audio.paused) {
    audio.pause();
    playIcon.style.display = "block";
    pauseIcon.style.display = "none";
  }
}

// Next & Previous Song
function nextSong() {
  currentSongIndex = (currentSongIndex + 1) % songs.length;
  loadSong(currentSongIndex);
  togglePlay();
}

function prevSong() {
  currentSongIndex = (currentSongIndex - 1 + songs.length) % songs.length;
  loadSong(currentSongIndex);
  togglePlay();
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
// songListPlay.addEventListener("click", playSong)

// Initial Load
loadSong(currentSongIndex);
loadSongsInOrder();
