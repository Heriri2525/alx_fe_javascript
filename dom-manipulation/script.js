// Replace this URL with your actual CrudCrud API endpoint (get from https://crudcrud.com)
const SERVER_URL = "https://crudcrud.com/api/YOUR_API_KEY_HERE/quotes";

let quotes = JSON.parse(localStorage.getItem("quotes")) || [];

const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteBtn = document.getElementById("newQuote");
const addQuoteBtn = document.getElementById("addQuoteBtn");
const categoryFilter = document.getElementById("categoryFilter");
const importFileInput = document.getElementById("importFile");
const exportBtn = document.getElementById("exportBtn");
const syncBtn = document.getElementById("syncBtn");
const syncStatus = document.getElementById("syncStatus");

function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

function populateCategories() {
  const categories = [...new Set(quotes.map(q => q.category))];
  categoryFilter.innerHTML = `<option value="all">All Categories</option>`;
  categories.forEach(category => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    categoryFilter.appendChild(option);
  });

  const savedFilter = localStorage.getItem("selectedCategory");
  if (savedFilter) categoryFilter.value = savedFilter;
}

function filterQuotes() {
  const selected = categoryFilter.value;
  localStorage.setItem("selectedCategory", selected);

  let filtered = quotes;
  if (selected !== "all") {
    filtered = quotes.filter(q => q.category === selected);
  }

  if (filtered.length === 0) {
    quoteDisplay.innerText = "No quotes found for this category.";
  } else {
    const randomIndex = Math.floor(Math.random() * filtered.length);
    const quote = filtered[randomIndex];
    quoteDisplay.innerText = `"${quote.text}" — ${quote.category}`;
    sessionStorage.setItem("lastQuote", JSON.stringify(quote));
  }
}

async function fetchQuotesFromServer() {
  const response = await fetch(SERVER_URL);
  if (!response.ok) throw new Error("Network response was not ok");
  const serverQuotes = await response.json();
  return serverQuotes;
}

async function postQuoteToServer(quote) {
  const response = await fetch(SERVER_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(quote),
  });
  if (!response.ok) throw new Error("Failed to post quote");
}

async function syncQuotes() {
  syncStatus.style.color = "green";
  syncStatus.textContent = "Syncing with server...";
  try {
    const serverQuotes = await fetchQuotesFromServer();

    let isChanged = false;

    // Add new quotes from server that don't exist locally
    serverQuotes.forEach(serverQuote => {
      const exists = quotes.some(localQuote =>
        localQuote.text === serverQuote.text &&
        localQuote.category === serverQuote.category
      );
      if (!exists) {
        quotes.push(serverQuote);
        isChanged = true;
      }
    });

    if (isChanged) {
      saveQuotes();
      populateCategories();
      filterQuotes();
      syncStatus.textContent = "Synced! Local quotes updated with server data.";
    } else {
      syncStatus.textContent = "Already up to date with server.";
    }
  } catch (err) {
    syncStatus.style.color = "red";
    syncStatus.textContent = "Sync failed. Check your internet connection.";
  }

  setTimeout(() => {
    syncStatus.textContent = "";
    syncStatus.style.color = "green";
  }, 4000);
}

function addQuote() {
  const textInput = document.getElementById("newQuoteText");
  const categoryInput = document.getElementById("newQuoteCategory");

  const text = textInput.value.trim();
  const category = categoryInput.value.trim();

  if (text && category) {
    const newQuote = { text, category };
    quotes.push(newQuote);
    saveQuotes();
    populateCategories();
    filterQuotes();
    postQuoteToServer(newQuote)
      .then(() => alert("Quote added and synced!"))
      .catch(() => alert("Quote added locally but failed to sync."));
    textInput.value = "";
    categoryInput.value = "";
  } else {
    alert("Please fill in both fields.");
  }
}

function exportToJsonFile() {
  const dataStr = JSON.stringify(quotes, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  a.click();
  URL.revokeObjectURL(url);
}

function importFromJsonFile(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const imported = JSON.parse(e.target.result);
      if (Array.isArray(imported)) {
        imported.forEach(async (q) => {
          quotes.push(q);
          try {
            await postQuoteToServer(q);
          } catch {
            // ignore post failure here
          }
        });
        saveQuotes();
        populateCategories();
        filterQuotes();
        alert("Quotes imported and synced.");
      } else {
        alert("Invalid JSON file.");
      }
    } catch (err) {
      alert("Error reading file.");
    }
  };
  reader.readAsText(file);
}

// Periodic sync every 30 seconds
setInterval(syncQuotes, 30000);

// Event listeners
newQuoteBtn.addEventListener("click", filterQuotes);
addQuoteBtn.addEventListener("click", addQuote);
exportBtn.addEventListener("click", exportToJsonFile);
importFileInput.addEventListener("change", importFromJsonFile);
syncBtn.addEventListener("click", syncQuotes);

// On load
window.onload = async function () {
  const last = sessionStorage.getItem("lastQuote");
  if (last) {
    const quote = JSON.parse(last);
    quoteDisplay.innerText = `"${quote.text}" — ${quote.category}`;
  } else {
    filterQuotes();
  }

  populateCategories();
  await syncQuotes();
};
