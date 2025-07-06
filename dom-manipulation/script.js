// Load quotes from localStorage or use defaults
let quotes = JSON.parse(localStorage.getItem("quotes")) || [
  { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
  { text: "Success is not in what you have, but who you are.", category: "Inspiration" },
  { text: "In the middle of difficulty lies opportunity.", category: "Wisdom" }
];

const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteBtn = document.getElementById("newQuote");
const addQuoteBtn = document.getElementById("addQuoteBtn");
const categoryFilter = document.getElementById("categoryFilter");
const importFileInput = document.getElementById("importFile");
const exportBtn = document.getElementById("exportBtn");

// Save quotes to localStorage
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// ✅ Populate the category dropdown (Required function)
function populateCategories() {
  const categories = [...new Set(quotes.map(q => q.category))];
  categoryFilter.innerHTML = `<option value="all">All Categories</option>`;
  categories.forEach(category => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    categoryFilter.appendChild(option);
  });

  // Restore last selected filter
  const lastSelected = localStorage.getItem("selectedCategory");
  if (lastSelected) {
    categoryFilter.value = lastSelected;
  }
}

// ✅ Display filtered quotes
function filterQuotes() {
  const selected = categoryFilter.value;
  localStorage.setItem("selectedCategory", selected); // store filter

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

    sessionStorage.setItem("lastQuote", JSON.stringify(quote)); // optional
  }
}

// ✅ Add a new quote
function addQuote() {
  const textInput = document.getElementById("newQuoteText");
  const categoryInput = document.getElementById("newQuoteCategory");

  const text = textInput.value.trim();
  const category = categoryInput.value.trim();

  if (text && category) {
    const newQuote = { text, category };
    quotes.push(newQuote);
    saveQuotes();
    populateCategories(); // update dropdown
    filterQuotes(); // show newly added in filter

    textInput.value = "";
    categoryInput.value = "";
    alert("Quote added!");
  } else {
    alert("Please fill in both fields.");
  }
}

// ✅ Export quotes to JSON
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

// ✅ Import quotes from JSON file
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
        alert("Invalid JSON format.");
      }
    } catch (err) {
      alert("Could not read JSON file.");
    }
  };
  reader.readAsText(file);
}

// ✅ Event listeners
newQuoteBtn.addEventListener("click", filterQuotes); // use filter based on selected category
addQuoteBtn.addEventListener("click", addQuote);
exportBtn.addEventListener("click", exportToJsonFile);
importFileInput.addEventListener("change", importFromJsonFile);

// ✅ On page load: restore last quote and filter
window.onload = function() {
  populateCategories();
  const last = sessionStorage.getItem("lastQuote");
  if (last) {
    const quote = JSON.parse(last);
    quoteDisplay.innerText = `"${quote.text}" — ${quote.category}`;
  } else {
    filterQuotes(); // fallback
  }
};
