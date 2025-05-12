/**
 * @jest-environment jsdom
 */

const {Audio, togglePlay, songs, audio} = require("./utils.js")


describe("togglePlay Functionality", () => {
  let playIcon, pauseIcon;

  beforeEach(() => {
    // Setup DOM
    document.body.innerHTML = `
      <div class="player-controls">
        <i class="play-icon" style="display: block;"></i>
        <i class="pause-icon" style="display: none;"></i>
      </div>
    `;

    // Reset audio state
    audio.paused = true;

    // Get elements
    playIcon = document.querySelector(".play-icon");
    pauseIcon = document.querySelector(".pause-icon");
  });

  test("should play audio when paused", () => {
    audio.paused = true;
    togglePlay();

    expect(audio.paused).toBe(false);
    expect(playIcon.style.display).toBe("none");
    expect(pauseIcon.style.display).toBe("block");
  });

  test("should pause audio when playing", () => {
    audio.paused = false;
    togglePlay();

    expect(audio.paused).toBe(true);
    expect(playIcon.style.display).toBe("block");
    expect(pauseIcon.style.display).toBe("none");
  });

  test("should handle play errors gracefully", async () => {
    audio.play = jest.fn(() => Promise.reject(new Error("Playback failed")));
    console.error = jest.fn();

    togglePlay();

    await Promise.resolve(); // Allow promise rejection to occur
    expect(console.error).toHaveBeenCalledWith(
      "Playback failed:",
      expect.any(Error)
    );
  });
});

describe("edge cases", () => {
  test("should maintain state across multiple toggles", () => {
    // Start paused
    togglePlay(); // Play
    expect(audio.paused).toBe(false);

    togglePlay(); // Pause
    expect(audio.paused).toBe(true);

    togglePlay(); // Play again
    expect(audio.paused).toBe(false);
  });

  test("should work with no icons present", () => {
    document.body.innerHTML = ""; // No DOM elements
    expect(() => togglePlay()).not.toThrow();
  });
});
