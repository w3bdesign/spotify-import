/**
 * Handles the submission of a playlist form. Takes an event object as an argument.
 *
 * @param {Event} event - The event object representing the form submission.
 * @return {Promise<void>} - A Promise that resolves when the playlist is generated.
 */
export async function handlePlaylistFormSubmit(event) {
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
}

/**
 * Fetches playlists data from server and displays them on the page.
 *
 * @return {Promise<void>} A promise that resolves once the playlists are displayed on the page.
 */
export async function fetchAndDisplayPlaylists() {
  const response = await fetch("/playlists");
  const playlistsData = await response.json();
  const playlists = playlistsData.items;

  const playlistContainer = document.getElementById("playlist-container");
  playlistContainer.innerHTML = "";

  for (const playlist of playlists) {
    const playlistElement = document.createElement("div");
    playlistElement.className = "playlist-item";
    playlistElement.innerHTML = `
        <h3>${playlist.name}</h3>
        <p>${playlist.description || "No description"}</p>
        <a href="${
          playlist.external_urls.spotify
        }" target="_blank">Open in Spotify</a>
      `;

    playlistContainer.appendChild(playlistElement);
  }
}

// Call the function to fetch and display the playlists
fetchAndDisplayPlaylists();
