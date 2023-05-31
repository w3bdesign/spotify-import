import { createLoadingSpinner } from "./utils.js";

let currentAudio = null;

/**
 * Asynchronously generates song suggestions based on a given song.
 *
 * @param {string} song - The name of the song to generate suggestions for.
 * @return {Promise<Array>} - A Promise that resolves with an array of song suggestions.
 * @throws {Error} If unable to fetch suggestions.
 */
export async function generateSongSuggestions(song) {
  displaySuggestions(); // Show the loading spinner

  const response = await fetch("/generate_suggestions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ song }),
  });

  if (response.ok) {
    const data = await response.json();
    const messageContent = data.choices[0].message.content;
    const suggestions = extractSongSuggestions(messageContent);
    displaySuggestions(suggestions); // Hide the loading spinner and display the suggestions
    return suggestions;
  } else {
    throw new Error("Failed to fetch suggestions.");
  }
}

/**
 * Extracts song suggestions from message content.
 *
 * @param {string} messageContent - The content of the message to extract from.
 * @return {string[]} An array of song suggestions extracted from the message.
 */
function extractSongSuggestions(messageContent) {
  const lines = messageContent.split("\n");
  const suggestions = lines
    .filter((line) => line.match(/^\d+\./))
    .map((line) =>
      line
        .substring(line.indexOf(".") + 1)
        .trim()
        .replace(/\*\*/g, "")
    );
  return suggestions;
}

/**
 * Creates a play button element with an SVG icon and adds a click event listener that plays a given song.
 *
 * @param {string} songName - The name of the song to be played.
 * @return {HTMLButtonElement} - The play button element.
 */
function createPlayButton(songName) {
  const playButton = document.createElement("button");
  playButton.setAttribute("data-state", "play");
  playButton.innerHTML = `
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path class="play-icon" d="M8 5v14l11-7z"/>
      <path class="pause-icon" d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" style="display: none;"/>
    </svg>`;
  playButton.classList.add("play-button");

  playButton.addEventListener("click", () => {
    playSong(songName, playButton);
  });

  return playButton;
}

/**
 * Creates an "add to playlist" button element with the given song name that, when clicked,
 * adds the song name to a text area on the page. The button is initially enabled, but becomes disabled
 * and changes its style when clicked to indicate it has been used.
 *
 * @param {string} songName - The name of the song to add to the playlist.
 * @return {HTMLButtonElement} The created button element.
 */
function createAddToPlaylistButton(songName) {
  const addToPlaylistButton = document.createElement("button");
  addToPlaylistButton.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 48 48" width="48px" height="48px"><g id="surface1_34_"><path style="fill:#4CAF50;" d="M44,24c0,11.045-8.955,20-20,20S4,35.045,4,24S12.955,4,24,4S44,12.955,44,24z"/><path style="fill:#FFFFFF;" d="M21,14h6v20h-6V14z"/><path style="fill:#FFFFFF;" d="M14,21h20v6H14V21z"/></g></svg>`;
  addToPlaylistButton.classList.add("add-song");

  addToPlaylistButton.addEventListener("click", function () {
    if (!this.hasAttribute("disabled")) {
      this.setAttribute("disabled", "disabled");
      this.classList.add("disabled-button");
    }

    const songRecommendationsTextarea = document.getElementById(
      "song_recommendations"
    );
    if (songRecommendationsTextarea.value !== "") {
      songRecommendationsTextarea.value += "\n";
    }
    songRecommendationsTextarea.value += songName;
  });

  return addToPlaylistButton;
}

/**
 * Creates a new table row element containing a song name, a play button, and an "add to playlist" button.
 *
 * @param {string} songName - The name of the song to display in the row.
 * @return {HTMLTableRowElement} The table row element containing the song name, play button, and "add to playlist" button.
 */
function createSongRow(songName) {
  const row = document.createElement("tr");
  row.classList.add("song-suggestion");

  const songNameCell = document.createElement("td");
  songNameCell.textContent = songName;
  row.appendChild(songNameCell);

  const playButtonCell = document.createElement("td");
  playButtonCell.appendChild(createPlayButton(songName));
  row.appendChild(playButtonCell);

  const addToPlaylistCell = document.createElement("td");
  addToPlaylistCell.appendChild(createAddToPlaylistButton(songName));
  row.appendChild(addToPlaylistCell);

  return row;
}

/**
 * Creates a table of song suggestions based on the given array of song names.
 *
 * @param {array} suggestions - An array of song names to display in the table.
 * @return {object} The DOM element for the created table.
 */
function createSuggestionsTable(suggestions) {
  const table = document.createElement("table");
  table.classList.add("song-suggestions-table");

  for (const songName of suggestions) {
    table.appendChild(createSongRow(songName));
  }

  return table;
}

/**
 * Displays song suggestions in a suggestions div element based on input suggestions array.
 *
 * @param {Array} suggestions - An array of song suggestions to display in the suggestions div.
 * @return {undefined} This function does not return anything.
 */
function displaySuggestions(suggestions) {
  const suggestionsDiv = document.getElementById("song-suggestions");
  suggestionsDiv.innerHTML = "";

  if (!suggestions) {
    const spinner = createLoadingSpinner();
    suggestionsDiv.appendChild(spinner);
  } else {
    suggestionsDiv.appendChild(createSuggestionsTable(suggestions));
  }

  suggestionsDiv.classList.add("show");
}

/**
 * Asynchronous function that fetches the URL of a given song.
 *
 * @param {string} songName - The name of the song to search for.
 * @return {Promise<string|null>} - A Promise that resolves with the URL of the song if successful, or null if unsuccessful.
 */
export async function fetchSongUrl(songName) {
  try {
    const response = await fetch(
      `/search_song?song_name=${encodeURIComponent(songName)}`
    );
    if (response.ok) {
      const data = await response.json();
      return data.song_url;
    } else {
      console.error(`Error fetching song URL: ${response.statusText}`);
      return null;
    }
  } catch (error) {
    console.error(`Error fetching song URL: ${error.message}`);
    return null;
  }
}

/**
 * Asynchronously plays a given song with the given play button element.
 *
 * @param {string} songName - The name of the song to be played.
 * @param {HTMLElement} playButton - The button element used to play the song.
 * @return {void} No return value.
 */
async function playSong(songName, playButton) {
  if (currentAudio && currentAudio.songName === songName) {
    pauseCurrentAudio();
    currentAudio.playButton = null;
    currentAudio = null;
    return;
  }

  const songUrl = await fetchSongUrl(songName);
  if (!songUrl) {
    console.error("Song URL not found");
    return;
  }

  pauseCurrentAudio();

  currentAudio = new Audio(songUrl);
  currentAudio.songName = songName;
  currentAudio.playButton = playButton;
  currentAudio.play();

  const playIcon = playButton.querySelector(".play-icon");
  const pauseIcon = playButton.querySelector(".pause-icon");
  playIcon.style.display = "none";
  pauseIcon.style.display = "block";
}

/**
 * Pauses the current audio if it exists and updates the play button accordingly.
 *
 * @return {void} This function does not return anything.
 */
function pauseCurrentAudio() {
  if (currentAudio) {
    currentAudio.pause();
    if (currentAudio.playButton) {
      currentAudio.playButton.setAttribute("data-state", "play");
      currentAudio.playButton.innerHTML = `
<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
  <path class="play-icon" d="M8 5v14l11-7z"/>
  <path class="pause-icon" d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" style="display: none;"/>
</svg>`;
    }
  }
}
