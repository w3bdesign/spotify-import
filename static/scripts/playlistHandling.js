/**
 * Handles the submission of a playlist form. Takes an event object as an argument.
 *
 * @param {Event} event - The event object representing the form submission.
 * @return {Promise<void>} - A Promise that resolves when the playlist is generated.
 */
export async function handleNewPlaylistFormSubmit(event) {
 
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
 * Handles the submission of import of a playlist form. Takes an event object as an argument.
 *
 * @param {Event} event - The event object representing the form submission.
 * @return {Promise<void>} - A Promise that resolves when the playlist is generated.
 */
export async function handleImportPlaylistFormSubmit(event) {
  event.preventDefault();

  const selectElement = document.getElementById("select");
  const selectedValue = selectElement.value;

  const playlistName = selectedValue;
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
    const response = await fetch("/import_to_existing_playlist", {
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
 * Fetches playlists data from server and displays them in a <select> element.
 *
 * @return {Promise<void>} A promise that resolves once the playlists are displayed in the <select>.
 */
export async function fetchAndDisplayPlaylists() {
  const response = await fetch("/playlists");
  const playlistsData = await response.json();
  const playlists = playlistsData.items;

  const playlistSelect = document.querySelector(
    'select[name="playlist_overview"]'
  );
  playlistSelect.classList.add("spotify-select"); 

  for (const playlist of playlists) {
    const playlistOption = document.createElement("option");
    playlistOption.value = playlist.id;

    // Uncomment if we want to show the description
    /*playlistOption.textContent = `${playlist.name} - ${
      playlist.description || "No description"
    }`;*/

    playlistOption.textContent = playlist.name;

    playlistSelect.appendChild(playlistOption);
  }
}

document.addEventListener("DOMContentLoaded", function () {
  // Call the function to fetch and display the playlists
  fetchAndDisplayPlaylists();
});
