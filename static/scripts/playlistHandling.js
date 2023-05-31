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
