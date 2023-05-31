import { generateSongSuggestions } from "./songHandling.js";

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

      const playlistName = document.getElementById("playlist_name").value;
      const playlistDescription = document.getElementById(
        "playlist_description"
      ).value;
      const songRecommendations = document.getElementById(
        "song_recommendations"
      ).value;

      const formData = new FormData();
      formData.append("playlist_name", playlistName);
      formData.append("playlist_description", playlistDescription);
      formData.append("song_recommendations", songRecommendations);

      try {
        const response = await fetch("/generate_playlist", {
          method: "POST",
          body: formData,
        });

        if (response.status === 200) {
          window.location.href = response.url;
        } else {
          alert(response.status);
        }
      } catch (error) {
        // Handle network error
        console.error("Network error:", error);
      }
    });
});
