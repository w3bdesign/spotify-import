import { handleSongFormSubmit } from "./songHandling.js";
import {
  handleNewPlaylistFormSubmit,
  handleImportPlaylistFormSubmit,
} from "./playlistHandling.js";

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
    .addEventListener("submit", handleNewPlaylistFormSubmit);

  document
    .getElementById("playlist-form-existing")
    .addEventListener("submit", handleImportPlaylistFormSubmit);

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

  const importPlaylistForm = document.getElementById("playlist-form");

  importPlaylistForm.addEventListener("submit", function (event) {
    const selectedPlaylistId = document.querySelector(
      'select[name="playlist_overview"]'
    ).value;
    const hiddenPlaylistIdInput = document.createElement("input");
    hiddenPlaylistIdInput.type = "hidden";
    hiddenPlaylistIdInput.name = "selected_playlist_id";
    hiddenPlaylistIdInput.value = selectedPlaylistId;

    importPlaylistForm.appendChild(hiddenPlaylistIdInput);
  });
}
