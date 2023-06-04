import { handleSongFormSubmit, createPlayButton } from "./songHandling.js";
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

  const importPlaylistForm = document.getElementById("playlist-form");

  importPlaylistForm.addEventListener("submit", function () {
    const selectedPlaylistId = document.querySelector(
      'select[name="playlist_overview"]'
    ).value;
    const hiddenPlaylistIdInput = document.createElement("input");
    hiddenPlaylistIdInput.type = "hidden";
    hiddenPlaylistIdInput.name = "selected_playlist_id";
    hiddenPlaylistIdInput.value = selectedPlaylistId;

    importPlaylistForm.appendChild(hiddenPlaylistIdInput);
  });

  const songSearch = document.getElementById("song_name");
  const searchResults = document.getElementById("search-results");

  songSearch.addEventListener("input", async (e) => {
    console.log("Searchresults", searchResults);

    const query = e.target.value;

    if (query.length > 2) {
      const response = await fetch(
        `/search_songs?song_name=${encodeURIComponent(query)}`
      );
      const data = await response.json();

      if (data.results) {
        displaySearchResults(data.results);
      } else {
        searchResults.innerHTML = "Song not found";
      }
    } else {
      searchResults.innerHTML = "";
    }
  });
}

function displaySearchResults(results) {
  const searchResults = document.getElementById("search-results");

  console.log("Results:", results);

  searchResults.innerHTML = results
    .map(
      (result) => `
  <div class="search-results">
      <img src="${result.album_image_url}" alt="Album cover" width="100" height="100">
      <div class="search-results-info">
        ${result.song_name} - ${result.artist_name}
      </div>
    </div>
  `
    )
    .join("");

  // Create play buttons and add them to the search results
  const searchResultElements = document.querySelectorAll(".search-results");
  searchResultElements.forEach((element, index) => {
    const playButton = createPlayButton(
      results[index].artist_name + " - " + results[index].song_name
    );
    element.appendChild(playButton);
  });
}
