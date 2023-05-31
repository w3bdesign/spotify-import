document.addEventListener("DOMContentLoaded", function () {
  document
    .getElementById("song-form")
    .addEventListener("submit", async (event) => {
      event.preventDefault();
      const songInput = document.getElementById("song_name");
      const song = songInput.value;
      const suggestions = await generateSongSuggestions(song);
      displaySuggestions(suggestions);
    });

  // Event listener for the second form
  document
    .getElementById("playlist-form")
    .addEventListener("submit", async (event) => {
      event.preventDefault();
    });

  async function generateSongSuggestions(song) {
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

  function createLoadingSpinner() {
    const spinner = document.createElement("div");
    spinner.classList.add("loading-spinner");
    spinner.innerHTML = `
    <svg viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"/>
      <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"/>
    </svg>`;
    return spinner;
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

  let currentAudio = null;

  async function fetchSongUrl(songName) {
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

  // Paste your entire JavaScript code here
});
