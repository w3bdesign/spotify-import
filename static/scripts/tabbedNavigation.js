/**
 * Switches the active tab and displays the corresponding tab content.
 *
 * @param {Event} evt - The event that triggered the function.
 * @param {string} tabContentId - The ID of the tab content to display.
 * @return {void} This function does not return anything.
 */

function switchTab(evt, tabContentId) {
  const tabContents = document.getElementsByClassName("tab-content");
  for (let i = 0; i < tabContents.length; i++) {
    tabContents[i].style.display = "none";
  }

  const tabs = document.getElementsByClassName("tab");
  for (let i = 0; i < tabs.length; i++) {
    tabs[i].className = tabs[i].className.replace(" active", "");
  }

  document.getElementById(tabContentId).style.display = "block";
  evt.currentTarget.className += " active";
}

/**
 * Updates the position of the border under the active tab.
 *
 * @return {void} This function does not return anything.
 */
function updateBorderPosition() {
  const activeTab = document.querySelector(".tab.active");
  const borderBottom = document.querySelector(".border-bottom");

  if (activeTab) {
    const tabRect = activeTab.getBoundingClientRect();
    const tabsRect = borderBottom.parentElement.getBoundingClientRect();

    borderBottom.style.left = `${tabRect.left - tabsRect.left}px`;
    borderBottom.style.width = `${tabRect.width}px`;
  }
}

document.addEventListener("DOMContentLoaded", function () {
  document
    .getElementById("newPlaylistTab")
    .addEventListener("click", function () {
      document.getElementById("newPlaylistContent").style.display = "block";
      document.getElementById("newPlaylistTab").classList.add("active");

      document.getElementById("importPlaylistTab").classList.remove("active");
      document.getElementById("importPlaylistContent").style.display = "none";
    });

  document
    .getElementById("importPlaylistTab")
    .addEventListener("click", function () {
      document.getElementById("newPlaylistContent").style.display = "none";
      document.getElementById("newPlaylistTab").classList.remove("active");

      document.getElementById("importPlaylistContent").style.display = "block";
      document.getElementById("importPlaylistTab").classList.add("active");
    });

  // Set default active tab
  document.getElementById("newPlaylistTab").click();

  document.querySelectorAll(".tab").forEach((tab) =>
    tab.addEventListener("click", () => {
      document
        .querySelectorAll(".tab")
        .forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      updateBorderPosition();
    })
  );

  window.addEventListener("load", updateBorderPosition);
});
