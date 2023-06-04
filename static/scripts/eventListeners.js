import {
  handleSongFormSubmit,
  createPlayButton,
  createAddToPlaylistButton,
  generateSongSuggestions,
  displaySuggestions,
} from "./songHandling.js";
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

/**
 * Renders the search results in a table format to the search-results element.
 *
 * @param {Array} results - An array of objects containing song information.
 * @return {undefined} This function does not return anything.
 */

function displaySearchResults(results) {
  const searchResults = document.getElementById("search-results");

  searchResults.classList.remove("hide");

  // Create table and table header
  const table = document.createElement("table");
  const headerRow = document.createElement("tr");

  table.classList.add("song-results-table");

  const albumImageHeader = document.createElement("th");
  albumImageHeader.textContent = "Album Cover";
  headerRow.appendChild(albumImageHeader);

  const songNameHeader = document.createElement("th");
  songNameHeader.textContent = "Song Name";
  headerRow.appendChild(songNameHeader);

  const artistNameHeader = document.createElement("th");
  artistNameHeader.textContent = "Artist Name";
  headerRow.appendChild(artistNameHeader);

  const playButtonHeader = document.createElement("th");
  playButtonHeader.textContent = "Preview";
  headerRow.appendChild(playButtonHeader);

  const chooseSongHeader = document.createElement("th");
  chooseSongHeader.textContent = "Select";
  headerRow.appendChild(chooseSongHeader);

  table.appendChild(headerRow);

  // Add search results to the table
  results.forEach((result) => {
    const row = document.createElement("tr");

    const albumImageCell = document.createElement("td");
    const albumImage = document.createElement("img");
    albumImage.src = result.album_image_url;
    albumImage.width = 100;
    albumImage.height = 100;
    albumImage.alt = "Album cover";
    albumImageCell.appendChild(albumImage);
    row.appendChild(albumImageCell);

    const songNameCell = document.createElement("td");
    songNameCell.textContent = result.song_name;
    row.appendChild(songNameCell);

    const artistNameCell = document.createElement("td");
    artistNameCell.textContent = result.artist_name;
    row.appendChild(artistNameCell);

    const playButtonCell = document.createElement("td");
    const playButton = createPlayButton(result.song_name);

    playButton.addEventListener("click", () => {
      playSong(result.song_name, playButton, result.song_url);
    });
    playButtonCell.appendChild(playButton);
    row.appendChild(playButtonCell);

    const selectButtonCell = document.createElement("td");
    const selectButton = createAddToPlaylistButton(result.song_name);

    selectButton.addEventListener("click", async () => {
      const searchResults = document.getElementById("search-results");
      searchResults.classList.add("hide");

      const suggestions = await generateSongSuggestions(result.song_name);
      displaySuggestions(suggestions);
    });

    selectButtonCell.appendChild(selectButton);
    row.appendChild(selectButtonCell);

    table.appendChild(row);
  });

  // Replace existing search results with the new table
  searchResults.innerHTML = "";
  searchResults.appendChild(table);
}
