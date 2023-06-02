import { addEventListeners } from "./eventListeners.js";
import { fetchAndDisplayPlaylists } from "./playlistHandling.js";

document.addEventListener("DOMContentLoaded", function () {
  // Enable transitions after DOM load
  setTimeout(() => {
    document.getElementById("body").classList.remove("no-transition");
  }, 1000);

  // Call the function to fetch and display the playlists
  fetchAndDisplayPlaylists();

  // Add event listeners
  addEventListeners();
});
