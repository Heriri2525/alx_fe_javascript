const syncBtn = document.getElementById("syncBtn");
const syncStatus = document.getElementById("syncStatus");

// Simulated server data (you can replace with real fetch if needed)
let serverQuotes = [
  { text: "Learning never exhausts the mind.", category: "Wisdom" },
  { text: "The purpose of our lives is to be happy.", category: "Inspiration" }
];

// ✅ Simulate fetching from "server"
function fetchFromServer() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(serverQuotes);
    }, 1000); // 1 sec delay to simulate server response
  });
}

// ✅ Sync with server: Server data replaces local if conflict
async function syncWithServer() {
  syncStatus.textContent = "Syncing with server...";
  try {
    const serverData = await fetchFromServer();

    // Conflict resolution: assume server has latest, overwrite local
    let updated = false;
    const existingQuotes = JSON.stringify(quotes);
    const incomingQuotes = JSON.stringify(serverData);

    if (existingQuotes !== incomingQuotes) {
      quotes = serverData;
      saveQuotes();
      populateCategories();
      filterQuotes();
      updated = true;
    }

    syncStatus.textContent = updated
      ? "Quotes synced with server. Local data updated."
      : "Already up to date with server.";
  } catch (err) {
    syncStatus.style.color = "red";
    syncStatus.textContent = "Sync failed. Please try again.";
  }

  // Reset color and status after few seconds
  setTimeout(() => {
    syncStatus.textContent = "";
    syncStatus.style.color = "green";
  }, 4000);
}

// ✅ Add event listener
syncBtn.addEventListener("click", syncWithServer);

// ✅ Periodic auto-sync (every 30 seconds)
setInterval(() => {
  syncWithServer();
}, 30000);
