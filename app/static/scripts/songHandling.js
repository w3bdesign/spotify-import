import { createLoadingSpinner } from "./utils.js";

let currentAudio = null;

/**
 * Handles the submission of the song form.
 *
 * @param {Event} event - The event object for the submit event.
 * @return {Promise<void>} A promise that resolves when the song suggestions have been displayed.
 */
export async function handleSongFormSubmit(event) {
  event.preventDefault();
  const songInput = document.getElementById("song_name");
  const song = songInput.value;
  const suggestions = await generateSongSuggestions(song);
  displaySuggestions(suggestions);
}

/**
 * Asynchronously generates song suggestions based on a given song.
 *
 * @param {string} song - The name of the song to generate suggestions for.
 * @return {Promise<Array>} - A Promise that resolves with an array of song suggestions.
 * @throws {Error} If unable to fetch suggestions.
 */
export async function generateSongSuggestions(song) {
  const numSuggestions = document.getElementById("num_suggestions").value;

  displaySuggestions(); // Show the loading spinner

  const response = await fetch("/generate_suggestions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ song, numSuggestions }),
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
    .map((line) => {
      const suggestion = line
        .substring(line.indexOf(".") + 1)
        .trim()
        .replace(/\*\*/g, "");

      // Remove the text following the colon
      const colonIndex = suggestion.indexOf(":");
      return colonIndex !== -1
        ? suggestion.substring(0, colonIndex).trim()
        : suggestion;
    });
  return suggestions;
}

/**
 * Creates a play button element with an SVG icon and adds a click event listener that plays a given song.
 *
 * @param {string} songName - The name of the song to be played.
 * @return {HTMLButtonElement} - The play button element.
 */
export function createPlayButton(songName) {
  const playButtonContainer = document.createElement("div");
  playButtonContainer.classList.add("play-button-container");

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

  // Create a custom tooltip
  const tooltip = document.createElement("span");
  tooltip.classList.add("tooltip");
  tooltip.textContent = "Song URL not found";
  tooltip.setAttribute("role", "tooltip");
  tooltip.style.display = "none";
  playButtonContainer.appendChild(tooltip);

  // Show and hide the tooltip on mouseenter and mouseleave events
  playButton.addEventListener("mouseenter", () => {
    if (playButton.disabled) {
      tooltip.style.display = "block";
      tooltip.classList.add("fade-in");
    }
  });

  playButton.addEventListener("mouseleave", () => {
    tooltip.style.display = "none";
    tooltip.classList.remove("fade-in");
  });

  // Check for song URL and disable the play button if not found
  (async () => {
    const songUrl = await fetchSongUrl(songName);
    if (!songUrl) {
      playButton.disabled = true;
      playButton.classList.add("disabled");
    }
  })();

  playButtonContainer.appendChild(playButton);
  return playButtonContainer;
}

/**
 * Creates a select button for a given song name.
 *
 * @param {string} songName - The name of the song.
 * @return {HTMLButtonElement} The select button element.
 */
export function createSelectButton(songName) {
  const selectButton = document.createElement("button");
  selectButton.innerHTML = `
    <svg viewBox="0 0 50 50" width="50px" height="50px"><g id="surface1_34_">
    <path style="fill:#4CAF50;" d="M44,24c0,11.045-8.955,20-20,20S4,35.045,4,24S12.955,4,24,4S44,12.955,44,24z"/>
    <path style="fill:#FFFFFF;" d="M21,14h6v20h-6V14z"/>
    <path style="fill:#FFFFFF;" d="M14,21h20v6H14V21z"/></g>
    </svg>`;
  selectButton.classList.add("add-song");

  selectButton.addEventListener("click", async () => {
    const searchResults = document.getElementById("search-results");
    const searchResultsHeader = document.getElementById(
      "search-results-header"
    );

    searchResults.classList.remove("show");
    searchResultsHeader.classList.remove("show");

    searchResults.classList.add("hide");
    searchResultsHeader.classList.add("hide");

    const suggestions = await generateSongSuggestions(songName);
    displaySuggestions(suggestions);
  });

  return selectButton;
}

/**
 * Creates an "add to playlist" button element with the given song name that, when clicked,
 * adds the song name to a text area on the page. The button is initially enabled, but becomes disabled
 * and changes its style when clicked to indicate it has been used.
 *
 * @param {string} songName - The name of the song to add to the playlist.
 * @return {HTMLButtonElement} The created button element.
 */
export function createAddToPlaylistButton(songName) {
  const addToPlaylistButton = document.createElement("button");
  addToPlaylistButton.innerHTML = `
    <svg viewBox="0 0 50 50" width="50px" height="50px"><g id="surface1_34_">
    <path style="fill:#4CAF50;" d="M44,24c0,11.045-8.955,20-20,20S4,35.045,4,24S12.955,4,24,4S44,12.955,44,24z"/>
    <path style="fill:#FFFFFF;" d="M21,14h6v20h-6V14z"/>
    <path style="fill:#FFFFFF;" d="M14,21h20v6H14V21z"/></g>
    </svg>`;
  addToPlaylistButton.classList.add("add-song");

  addToPlaylistButton.addEventListener("click", function () {
    Toastify({
      text: "Song added to playlist",
      duration: 2000,
      destination: "https://github.com/apvarun/toastify-js",
      className: "form",
      newWindow: true,
      gravity: "bottom", // `top` or `bottom`
      position: "center", // `left`, `center` or `right`
      stopOnFocus: true, // Prevents dismissing of toast on hover
      style: {
        background: "#4CAF50",
        boxShadow: "none",
        textAlign: "center",
        padding: "20px",
        borderRadius: "5px",
      },
      onClick: function () {}, // Callback after click
    }).showToast();

    if (!this.hasAttribute("disabled")) {
      this.setAttribute("disabled", "disabled");
      this.classList.add("add-song-disabled");
    }

    const songRecommendationsTextarea = document.getElementById(
      "song_recommendations"
    );

    const songRecommendationsTextareaExisting = document.getElementById(
      "song_recommendations_existing"
    );

    if (songRecommendationsTextarea.value !== "") {
      songRecommendationsTextarea.value += "\n";
      songRecommendationsTextareaExisting.value += "\n";
    }

    songRecommendationsTextarea.value += songName;
    songRecommendationsTextareaExisting.value += songName;
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

  // Create table header row
  const headerRow = document.createElement("tr");

  // Add "Song name" header
  const songNameHeader = document.createElement("th");
  songNameHeader.textContent = "Song name";
  headerRow.appendChild(songNameHeader);

  // Add "Play" header
  const playHeader = document.createElement("th");
  playHeader.textContent = "Play";
  headerRow.appendChild(playHeader);

  // Add "Select" header
  const selectHeader = document.createElement("th");
  selectHeader.textContent = "Select";
  headerRow.appendChild(selectHeader);

  // Append header row to the table
  table.appendChild(headerRow);

  // Add song rows to the table
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
export function displaySuggestions(suggestions) {
  const suggestionsDiv = document.getElementById("song-suggestions");
  const importCreateDiv = document.getElementById("import-wrapper");
  const suggestionsHeader = document.getElementById(
    "song-recommendations-results-header"
  );

  suggestionsDiv.innerHTML = "";

  if (!suggestions) {
    const spinner = createLoadingSpinner();
    suggestionsDiv.appendChild(spinner);
  } else {
    suggestionsDiv.appendChild(createSuggestionsTable(suggestions));
  }

  suggestionsDiv.classList.add("show");
  importCreateDiv.classList.add("show");

  // Show suggestions header
  suggestionsHeader.classList.remove("hide");
  suggestionsHeader.classList.add("show");

  // Set default active tab
  document.getElementById("newPlaylistTab").click();
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
export async function playSong(songName, playButton) {
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
