import songs from "./playlist.js";

import { audio } from "../scripts/player.js";

// __mocks__/audio.js
 class Audio {
  constructor() {
    this.paused = true;
    this.currentTime = 0;
    this.duration = 180;
  }
  play() {
    this.paused = false;
    return Promise.resolve();
  }
  pause() {
    this.paused = true;
  }
}



// function to play song
function togglePlay() {
  if (audio.paused) {
    audio.play();
  } else if (!audio.paused) {
    audio.pause();
  }
}



module.exports = {Audio, audio, songs, togglePlay}