import { handleSongFormSubmit } from "./songHandling.js";
import { handlePlaylistFormSubmit } from "./playlistHandling.js";

/**
 * Adds event listeners for the song form, playlist form, and new/import playlist tabs.
 *
 * @return {void} This function does not return anything.
 */
export function addEventListeners() {
  // Add event listener for song form
  document
    .getElementById("song-form")
    .addEventListener("submit", handleSongFormSubmit);

  // Add event listener for playlist form
  document
    .getElementById("playlist-form")
    .addEventListener("submit", handlePlaylistFormSubmit);

  document
    .getElementById("newPlaylistTab")
    .addEventListener("click", function () {
      document.getElementById("newPlaylistContent").style.display = "block";
      document.getElementById("newPlaylistTab").classList.add("active");

      document.getElementById("importPlaylistTab").classList.remove("active");
      document.getElementById("importPlaylistContent").style.display = "none";
    });

  document
    .getElementById("importPlaylistTab")
    .addEventListener("click", function () {
      document.getElementById("newPlaylistContent").style.display = "none";
      document.getElementById("newPlaylistTab").classList.remove("active");

      document.getElementById("importPlaylistContent").style.display = "block";
      document.getElementById("importPlaylistTab").classList.add("active");
    });
}
