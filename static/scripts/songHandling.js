import { createLoadingSpinner } from "./utils.js";

let currentAudio = null;

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

function displaySuggestions(suggestions) {
  const suggestionsDiv = document.getElementById("song-suggestions");
  suggestionsDiv.innerHTML = "";

  if (!suggestions) {
    // Show the loading spinner
    const spinner = createLoadingSpinner();
    suggestionsDiv.appendChild(spinner);
  } else {
    // Create a table to display the recommendations
    const table = document.createElement("table");
    table.classList.add("song-suggestions-table");

    for (const songName of suggestions) {
      const row = document.createElement("tr");
      row.classList.add("song-suggestion");

      const songNameCell = document.createElement("td");
      songNameCell.textContent = songName;
      row.appendChild(songNameCell);

      // Create the Play button cell
      const playButtonCell = document.createElement("td");

      const playButton = document.createElement("button");
      playButton.setAttribute("data-state", "play");
      playButton.innerHTML = `
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path class="play-icon" d="M8 5v14l11-7z"/>
    <path class="pause-icon" d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" style="display: none;"/>
  </svg>`;
      playButton.classList.add("play-button");

      // Add the event listener to handle the Play button click
      playButton.addEventListener("click", () => {
        playSong(songName, playButton);
      });

      playButtonCell.appendChild(playButton);
      row.appendChild(playButtonCell);

      // Create the Add to playlist button cell
      const addToPlaylistCell = document.createElement("td");

      const addToPlaylistButton = document.createElement("button");
      addToPlaylistButton.innerHTML = `
  <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 48 48" width="48px" height="48px"><g id="surface1_34_"><path style="fill:#4CAF50;" d="M44,24c0,11.045-8.955,20-20,20S4,35.045,4,24S12.955,4,24,4S44,12.955,44,24z"/><path style="fill:#FFFFFF;" d="M21,14h6v20h-6V14z"/><path style="fill:#FFFFFF;" d="M14,21h20v6H14V21z"/></g></svg>`;
      addToPlaylistButton.classList.add("add-song");

      // Add the event listener to handle the Add to playlist button click
      addToPlaylistButton.addEventListener("click", function () {
        // Check if the button is not disabled
        if (!this.hasAttribute("disabled")) {
          // Disable the button after the song has been added
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

      addToPlaylistCell.appendChild(addToPlaylistButton);
      row.appendChild(addToPlaylistCell);

      table.appendChild(row);
    }

    suggestionsDiv.appendChild(table);
  }

  // Add the .show class to animate the opacity and height
  suggestionsDiv.classList.add("show");
}

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
