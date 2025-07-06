// Load quotes from localStorage or use default list
let quotes = JSON.parse(localStorage.getItem("quotes")) || [
  { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
  { text: "Success is not in what you have, but who you are.", category: "Inspiration" },
  { text: "In the middle of difficulty lies opportunity.", category: "Wisdom" }
];

// Simulated "server" quotes
let serverQuotes = [
  { text: "Learning never exhausts the mind.", category: "Wisdom" },
  { text: "The purpose of our lives is to be happy.", category: "Inspiration" }
];

// DOM Elements
const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteBtn = document.getElementById("newQuote");
const addQuoteBtn = document.getElementById("addQuoteBtn");
const categoryFilter = document.getElementById("categoryFilter");
const importFileInput = document.getElementById("importFile");
const exportBtn = document.getElementById("exportBtn");
const syncBtn = document.getElementById("syncBtn");
const syncStatus = document.getElementById("syncStatus");

// Save to localStorage
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// ✅ Populate category dropdown
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

// ✅ Filter quotes based on category
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

// ✅ Add new quote
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
    textInput.value = "";
    categoryInput.value = "";
    alert("Quote added!");
  } else {
    alert("Please fill in both fields.");
  }
}

// ✅ Export to JSON
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

// ✅ Import from JSON file
function importFromJsonFile(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const imported = JSON.parse(e.target.result);
      if (Array.isArray(imported)) {
        quotes.push(...imported);
        saveQuotes();
        populateCategories();
        filterQuotes();
        alert("Quotes imported successfully!");
      } else {
        alert("Invalid JSON file.");
      }
    } catch (err) {
      alert("Error reading file.");
    }
  };
  reader.readAsText(file);
}

// ✅ Simulate fetching quotes from "server"
function fetchFromServer() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(serverQuotes);
    }, 1000); // simulate delay
  });
}

// ✅ Sync with server
async function syncWithServer() {
  syncStatus.textContent = "Syncing with server...";
  try {
    const serverData = await fetchFromServer();

    const localData = JSON.stringify(quotes);
    const remoteData = JSON.stringify(serverData);

    if (localData !== remoteData) {
      quotes = serverData; // server wins
      saveQuotes();
      populateCategories();
      filterQuotes();
      syncStatus.textContent = "Quotes synced with server. Local data updated.";
    } else {
      syncStatus.textContent = "Already up to date with server.";
    }
  } catch (err) {
    syncStatus.style.color = "red";
    syncStatus.textContent = "Sync failed.";
  }

  setTimeout(() => {
    syncStatus.textContent = "";
    syncStatus.style.color = "green";
  }, 4000);
}

// ✅ Auto sync every 30 seconds
setInterval(() => {
  syncWithServer();
}, 30000);

// ✅ Event Listeners
newQuoteBtn.addEventListener("click", filterQuotes);
addQuoteBtn.addEventListener("click", addQuote);
exportBtn.addEventListener("click", exportToJsonFile);
importFileInput.addEventListener("change", importFromJsonFile);
syncBtn.addEventListener("click", syncWithServer);

// ✅ On load
window.onload = function() {
  populateCategories();

  const last = sessionStorage.getItem("lastQuote");
  if (last) {
    const quote = JSON.parse(last);
    quoteDisplay.innerText = `"${quote.text}" — ${quote.category}`;
  } else {
    filterQuotes();
  }
};
