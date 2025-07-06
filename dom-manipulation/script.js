const SERVER_URL = "https://jsonplaceholder.typicode.com/posts";

let quotes = JSON.parse(localStorage.getItem("quotes")) || [];

const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteBtn = document.getElementById("newQuote");
const categoryFilter = document.getElementById("categoryFilter");
const formContainer = document.getElementById("formContainer"); // container to put form in
const syncStatus = document.getElementById("syncStatus");

// Save quotes locally
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// Populate categories dropdown dynamically
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

// Show a random quote filtered by category and update DOM
function showRandomQuote() {
  const selected = categoryFilter.value || "all";
  let filtered = quotes;
  if (selected !== "all") {
    filtered = quotes.filter(q => q.category === selected);
  }

  if (filtered.length === 0) {
    quoteDisplay.innerText = "No quotes found for this category.";
    return;
  }

  const randomIndex = Math.floor(Math.random() * filtered.length);
  const quote = filtered[randomIndex];
  quoteDisplay.innerText = `"${quote.text}" — ${quote.category}`;
  sessionStorage.setItem("lastQuote", JSON.stringify(quote));
}

// Dynamically create the Add Quote form and add it to the DOM
function createAddQuoteForm() {
  // Clear existing form (if any)
  formContainer.innerHTML = "";

  const formDiv = document.createElement("div");

  const inputText = document.createElement("input");
  inputText.type = "text";
  inputText.id = "newQuoteText";
  inputText.placeholder = "Enter a new quote";

  const inputCategory = document.createElement("input");
  inputCategory.type = "text";
  inputCategory.id = "newQuoteCategory";
  inputCategory.placeholder = "Enter quote category";

  const addBtn = document.createElement("button");
  addBtn.id = "addQuoteBtn";
  addBtn.textContent = "Add Quote";

  // Add event listener to the Add Quote button
  addBtn.addEventListener("click", addQuote);

  formDiv.appendChild(inputText);
  formDiv.appendChild(inputCategory);
  formDiv.appendChild(addBtn);

  formContainer.appendChild(formDiv);
}

// Add a new quote and update DOM + server + storage
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
    showRandomQuote();
    postQuoteToServer(newQuote)
      .then(() => alert("Quote added and synced!"))
      .catch(() => alert("Quote added locally but failed to sync."));
    textInput.value = "";
    categoryInput.value = "";
  } else {
    alert("Please fill in both fields.");
  }
}

// Fetch quotes from server (GET)
async function fetchQuotesFromServer() {
  const response = await fetch(SERVER_URL);
  if (!response.ok) throw new Error("Failed to fetch from server");
  const data = await response.json();
  return data.map(item => ({
    text: item.title,
    category: String(item.userId)
  }));
}

// Post new quote to server (POST)
async function postQuoteToServer(quote) {
  const response = await fetch(SERVER_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title: quote.text, userId: quote.category })
  });
  if (!response.ok) throw new Error("Failed to post quote to server");
  return await response.json();
}

// Sync local quotes with server and handle conflicts
async function syncQuotes() {
  syncStatus.style.color = "green";
  syncStatus.textContent = "Syncing with server...";
  try {
    const serverQuotes = await fetchQuotesFromServer();

    let newQuotesAdded = false;
    serverQuotes.forEach(sq => {
      const exists = quotes.some(lq =>
        lq.text === sq.text && lq.category === sq.category
      );
      if (!exists) {
        quotes.push(sq);
        newQuotesAdded = true;
      }
    });

    for (const localQuote of quotes) {
      const existsOnServer = serverQuotes.some(sq =>
        sq.text === localQuote.text && sq.category === localQuote.category
      );
      if (!existsOnServer) {
        try {
          await postQuoteToServer(localQuote);
        } catch {}
      }
    }

    if (newQuotesAdded) {
      saveQuotes();
      populateCategories();
      showRandomQuote();
      syncStatus.textContent = "Quotes synced with server!";
    } else {
      syncStatus.textContent = "Already up to date with server.";
    }
  } catch (error) {
    syncStatus.style.color = "red";
    syncStatus.textContent = "Sync failed. Check your connection.";
  }

  setTimeout(() => {
    syncStatus.textContent = "";
    syncStatus.style.color = "green";
  }, 4000);
}

// Event listeners
newQuoteBtn.addEventListener("click", showRandomQuote);
categoryFilter.addEventListener("change", showRandomQuote);

// Periodic sync every 30 seconds
setInterval(syncQuotes, 30000);

// On page load
window.onload = async function () {
  createAddQuoteForm();
  const last = sessionStorage.getItem("lastQuote");
  if (last) {
    const quote = JSON.parse(last);
    quoteDisplay.innerText = `"${quote.text}" — ${quote.category}`;
  } else {
    showRandomQuote();
  }
  populateCategories();
  await syncQuotes();
};
